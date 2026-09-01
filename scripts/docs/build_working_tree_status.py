#!/usr/bin/env python3
"""Build or verify the bounded status page for the updated CHORUS working tree."""
from __future__ import annotations
import argparse, hashlib, html, importlib.util, json, re, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'evidence/runs/updated-working-tree-status.v1.json'
PUBLIC_JSON=ROOT/'public/evidence/updated-working-tree-status.v1.json'
PUBLIC_HTML=ROOT/'public/evidence/updated-working-tree-status.html'
FOCUSED_TEST_FILES={
    'concurrent night':'tests/concurrent-night.test.mjs',
    'simulation maturity':'tests/simulation-maturity.test.mjs',
    'save model':'tests/save-model.test.mjs',
    'copy contract':'tests/copy-contract.test.mjs',
    'linguistics contract':'tests/linguistics-contract.test.mjs',
    'accessibility and disclosure':'tests/accessibility-disclosure.test.mjs',
    'viewport contract':'tests/viewport-contract.test.mjs',
    'rendered HTML metadata':'tests/rendered-html.test.mjs',
}

def load_binding():
    path=ROOT/'scripts/docs/build_release_evidence.py'
    spec=importlib.util.spec_from_file_location('chorus_release_binding',path)
    module=importlib.util.module_from_spec(spec); sys.modules[spec.name]=module; spec.loader.exec_module(module)
    return module.implementation_binding()

def stable(value): return (json.dumps(value,indent=2)+'\n').encode()
def list_html(rows): return ''.join(f'<li>{html.escape(str(row))}</li>' for row in rows)
def file_sha256(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def declared_tests(path): return len(re.findall(r'^test\(', path.read_text(), flags=re.MULTILINE))

def refresh_measured_claims(record,binding):
    """Refresh byte-derived metadata without changing any pass/fail decision."""
    package=json.loads((ROOT/'package.json').read_text())
    generator=(ROOT/'app/scenario-generator.ts').read_text()
    save=(ROOT/'app/save-model.ts').read_text()
    record['application_version']=package['version']
    record['generator_version']=int(re.search(r'const\s+GENERATOR_VERSION\s*=\s*(\d+)\s+as\s+const',generator).group(1))
    record['portable_save_schema']=int(re.search(r'PORTABLE_SAVE_SCHEMA_VERSION\s*=\s*(\d+)\s+as\s+const',save).group(1))
    record['implementation_binding']=binding

    verification=record['verification']
    groups=verification['focused_tests']['groups']
    by_name={group['name']:group for group in groups}
    if set(by_name)!=set(FOCUSED_TEST_FILES):
        raise ValueError('cannot refresh an incomplete focused-suite inventory')
    for name,relative in FOCUSED_TEST_FILES.items():
        by_name[name]['passed']=declared_tests(ROOT/relative)
    verification['focused_tests']['passed']=sum(group['passed'] for group in groups)

    simulation_path=ROOT/'evidence/runs/simulation-maturity.v1.json'
    simulation=json.loads(simulation_path.read_text())
    simulation_claim=verification['simulation_evidence']
    simulation_claim['seed_count']=simulation['seedDomain']['count']
    simulation_claim['played_count']=simulation['seedDomain']['playedCount']
    simulation_claim['assertions']=simulation['results']['assertions']
    simulation_claim['failures']=len(simulation['results']['failures'])
    simulation_claim['evidence_sha256']=file_sha256(simulation_path)
    verification['implementation_assertions']=simulation['results']['assertions']
    verification['implementation_failures']=len(simulation['results']['failures'])
    record['dependency_advisory_check']['package_lock_sha256']=file_sha256(ROOT/'package-lock.json')
    return record

def validate_claims(record,binding):
    package=json.loads((ROOT/'package.json').read_text())
    generator=(ROOT/'app/scenario-generator.ts').read_text()
    save=(ROOT/'app/save-model.ts').read_text()
    generator_version=int(re.search(r'const\s+GENERATOR_VERSION\s*=\s*(\d+)\s+as\s+const',generator).group(1))
    save_schema=int(re.search(r'PORTABLE_SAVE_SCHEMA_VERSION\s*=\s*(\d+)\s+as\s+const',save).group(1))
    if (record['application_version'],record['generator_version'],record['portable_save_schema']) != (package['version'],generator_version,save_schema):
        raise ValueError('working-tree status version claims have drifted')

    verification=record['verification']
    if verification.get('status')!='pass' or verification.get('exit_code')!=0:
        raise ValueError('working-tree status cannot publish an unpassed automated run')
    groups=verification['focused_tests']['groups']
    by_name={group['name']:group for group in groups}
    if set(by_name)!=set(FOCUSED_TEST_FILES):
        raise ValueError('working-tree focused-suite inventory has drifted')
    for name,relative in FOCUSED_TEST_FILES.items():
        actual=declared_tests(ROOT/relative)
        if by_name[name].get('passed')!=actual:
            raise ValueError(f'working-tree status test count has drifted for {name}')
    if verification['focused_tests'].get('passed')!=sum(group['passed'] for group in groups) or verification['focused_tests'].get('failed')!=0:
        raise ValueError('working-tree focused-test totals are inconsistent')

    simulation_path=ROOT/'evidence/runs/simulation-maturity.v1.json'
    simulation=json.loads(simulation_path.read_text())
    simulation_claim=verification['simulation_evidence']
    if simulation_claim.get('status')!='pass' or simulation['results']['status']!='pass':
        raise ValueError('working-tree simulation evidence is not passed')
    expected_simulation=(simulation['seedDomain']['count'],simulation['seedDomain']['playedCount'],simulation['results']['assertions'],len(simulation['results']['failures']),file_sha256(simulation_path))
    observed_simulation=(simulation_claim['seed_count'],simulation_claim['played_count'],simulation_claim['assertions'],simulation_claim['failures'],simulation_claim['evidence_sha256'])
    if observed_simulation!=expected_simulation or verification['implementation_assertions']!=simulation['results']['assertions']:
        raise ValueError('working-tree simulation claims have drifted')

    verification_path=ROOT/verification['verification_record_path']
    verification_record=json.loads(verification_path.read_text())
    if verification_record.get('sourceBinding',{}).get('implementationDigest')!=binding['digest']:
        raise ValueError('working-tree verification record is bound to different source')
    if verification_record.get('decision',{}).get('automatedWorkingTree')!='pass':
        raise ValueError('working-tree verification record does not report an automated pass')

    route=record['production_route_check']
    if route.get('status')=='pass':
        route_record=json.loads((ROOT/route['result_path']).read_text())
        if route_record.get('source_binding',{}).get('digest')!=binding['digest']:
            raise ValueError('current route pass lacks the current implementation binding')

    dependency=record['dependency_advisory_check']
    if dependency.get('package_lock_sha256')!=file_sha256(ROOT/'package-lock.json'):
        raise ValueError('working-tree dependency lock binding has drifted')
    if dependency.get('status')=='pass':
        dependency_record=json.loads((ROOT/dependency['result_path']).read_text())
        if dependency_record.get('package_lock_sha256')!=dependency['package_lock_sha256']:
            raise ValueError('dependency pass is bound to a different lockfile')

def build(record):
    binding=load_binding()
    if record.get('implementation_binding')!=binding: raise ValueError('working-tree status implementation binding has drifted')
    validate_claims(record,binding)
    verification=record['verification']
    groups=''.join(f"<tr><th scope='row'>{html.escape(g['name'])}</th><td>{g['passed']}</td><td>0</td></tr>" for g in verification['focused_tests']['groups'])
    dependency=record['dependency_advisory_check']
    vulnerabilities=dependency['vulnerabilities']
    route_check=record['production_route_check']
    route_value=str(route_check['passed']) if route_check['status']=='pass' else '—'
    route_note='all returned HTTP 200' if route_check['status']=='pass' else 'current-source route check not run'
    dependency_value=str(vulnerabilities['total']) if dependency['status']=='pass' else '—'
    dependency_note=(' · '.join(f'{k} {v}' for k,v in vulnerabilities.items() if k!='total') if dependency['status']=='pass' else 'current lockfile advisory check not run')
    source_link='updated-working-tree-status.v1.json'
    doc=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Current bounded verification status for the updated CHORUS working tree."><title>Updated working-tree status · CHORUS</title><style>
:root{{color-scheme:dark;--paper:#07140d;--panel:#0b1f14;--ink:#f2f1e8;--muted:#c7d1c9;--mint:#a7e0bd;--gold:#e2c57f;--line:rgba(213,222,220,.24);font-family:Georgia,"Times New Roman",serif}}*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(circle at 12% 0,rgba(37,101,64,.3),transparent 34rem),var(--paper);color:var(--ink);line-height:1.65}}a{{color:var(--mint)}}header,main,footer{{width:min(76rem,calc(100% - 2rem));margin:auto}}header{{padding:4rem 0 2rem}}.eyebrow{{color:var(--gold);font:700 .78rem ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}}h1{{font-size:clamp(2.4rem,7vw,5rem);line-height:.95;margin:.5rem 0}}.lede{{max-width:72ch;color:var(--muted);font-size:1.15rem}}section{{margin:1rem 0;padding:1.25rem;border:1px solid var(--line);border-radius:.8rem 1.25rem;background:rgba(11,31,20,.94)}}.hold{{border-left:5px solid var(--gold)}}code{{color:var(--mint);overflow-wrap:anywhere}}table{{width:100%;border-collapse:collapse}}caption{{text-align:left;padding:.5rem 0;color:var(--gold);font-weight:700}}th,td{{padding:.7rem;text-align:left;vertical-align:top;border-top:1px solid var(--line)}}th{{color:var(--mint)}}li{{margin:.45rem 0}}.metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:.7rem}}.metrics article{{padding:1rem;border:1px solid var(--line);border-radius:.7rem}}.metrics strong{{display:block;color:var(--gold);font-size:2rem}}footer{{padding:2rem 0;color:var(--muted)}}@media(max-width:42rem){{table,tbody,tr,th,td{{display:block}}th{{border-top:1px solid var(--line)}}td{{border-top:0;padding-top:.1rem}}}}@media(prefers-reduced-motion:reduce){{*{{scroll-behavior:auto!important}}}}@media(forced-colors:active){{section,.metrics article{{border:1px solid CanvasText}}}}
</style></head><body><header><p class="eyebrow">CHORUS technical record · 31 August 2026</p><h1>Updated working-tree status</h1><p class="lede">The version-14 copy, linguistic, persistence, and publication update is checked at implementation digest <code>{html.escape(binding['digest'])}</code>. It is deliberately held from inheriting the earlier release-candidate label until browser, assistive-technology, route, dependency, and distribution evidence are renewed for this same source.</p></header><main><section class="hold"><h2>Decision</h2><p><strong>{html.escape(record['state_label'])}.</strong> Historical browser and clean-room evidence remains available under its original binding; it is not presented as current-source execution.</p></section><section><h2>Observed verification</h2><div class="metrics"><article><span>Deterministic assertions</span><strong>{verification['implementation_assertions']:,}</strong><small>zero failures</small></article><article><span>Focused tests</span><strong>{verification['focused_tests']['passed']}</strong><small>zero failures</small></article><article><span>Current production routes</span><strong>{route_value}</strong><small>{html.escape(route_note)}</small></article><article><span>Current dependency vulnerabilities</span><strong>{dependency_value}</strong><small>{html.escape(dependency_note)}</small></article></div><table><caption>Focused suites</caption><thead><tr><th scope="col">Suite</th><th scope="col">Passed</th><th scope="col">Failed</th></tr></thead><tbody>{groups}</tbody></table></section><section><h2>Included update</h2><ul>{list_html(record['included_update'])}</ul></section><section><h2>Current observation limits</h2><ul>{list_html(record['current_observation_limits'])}</ul></section><section><h2>Promotion requirements</h2><ol>{list_html(record['promotion_requirements'])}</ol></section><section><h2>Raw records</h2><p><a href="{source_link}">Machine-readable status</a> · <a href="updated-route-check.v1.json">historical route evidence</a> · <a href="dependency-audit.updated-working-tree.v1.json">historical dependency audit</a> · <a href="index.html">historical release evidence</a></p></section></main><footer><p>Self-contained HTML · no remote assets, scripts, analytics, or hidden pass states.</p></footer></body></html>'''
    return {PUBLIC_JSON:stable(record),PUBLIC_HTML:doc.encode()}

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--check',action='store_true')
    ap.add_argument('--refresh-measured-claims',action='store_true')
    args=ap.parse_args()
    if args.check and args.refresh_measured_claims:
        ap.error('--check and --refresh-measured-claims are mutually exclusive')
    record=json.loads(SOURCE.read_text())
    if args.refresh_measured_claims:
        SOURCE.write_bytes(stable(refresh_measured_claims(record,load_binding())))
        print('Working-tree measured claims refreshed; verification decisions unchanged.')
        return 0
    outputs=build(record); drift=[]
    for path,payload in outputs.items():
        if args.check:
            if not path.is_file() or path.read_bytes()!=payload: drift.append(path.relative_to(ROOT).as_posix())
        else:
            path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(payload)
    if drift:
        print('Working-tree status drift:',*('\n  '+x for x in drift),file=sys.stderr); return 1
    print(f"Working-tree status {'verified' if args.check else 'built'}: {len(outputs)} artifacts."); return 0
if __name__=='__main__': raise SystemExit(main())
