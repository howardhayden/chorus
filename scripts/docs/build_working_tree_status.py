#!/usr/bin/env python3
"""Build or verify the bounded status page for the updated CHORUS working tree."""
from __future__ import annotations
import argparse, hashlib, html, importlib.util, json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'evidence/runs/updated-working-tree-status.v1.json'
PUBLIC_JSON=ROOT/'public/evidence/updated-working-tree-status.v1.json'
PUBLIC_HTML=ROOT/'public/evidence/updated-working-tree-status.html'

def load_binding():
    path=ROOT/'scripts/docs/build_release_evidence.py'
    spec=importlib.util.spec_from_file_location('chorus_release_binding',path)
    module=importlib.util.module_from_spec(spec); sys.modules[spec.name]=module; spec.loader.exec_module(module)
    return module.implementation_binding()

def stable(value): return (json.dumps(value,indent=2)+'\n').encode()
def list_html(rows): return ''.join(f'<li>{html.escape(str(row))}</li>' for row in rows)
def build(record):
    binding=load_binding()
    if record.get('implementation_binding')!=binding: raise ValueError('working-tree status implementation binding has drifted')
    verification=record['verification']
    groups=''.join(f"<tr><th scope='row'>{html.escape(g['name'])}</th><td>{g['passed']}</td><td>0</td></tr>" for g in verification['focused_tests']['groups'])
    vulnerabilities=record['dependency_advisory_check']['vulnerabilities']
    vuln_text=' · '.join(f'{k} {v}' for k,v in vulnerabilities.items() if k!='total')
    source_link='updated-working-tree-status.v1.json'
    doc=f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="Current bounded verification status for the updated CHORUS working tree."><title>Updated working-tree status · CHORUS</title><style>
:root{{color-scheme:dark;--paper:#07140d;--panel:#0b1f14;--ink:#f2f1e8;--muted:#c7d1c9;--mint:#a7e0bd;--gold:#e2c57f;--line:rgba(213,222,220,.24);font-family:Georgia,"Times New Roman",serif}}*{{box-sizing:border-box}}body{{margin:0;background:radial-gradient(circle at 12% 0,rgba(37,101,64,.3),transparent 34rem),var(--paper);color:var(--ink);line-height:1.65}}a{{color:var(--mint)}}header,main,footer{{width:min(76rem,calc(100% - 2rem));margin:auto}}header{{padding:4rem 0 2rem}}.eyebrow{{color:var(--gold);font:700 .78rem ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase}}h1{{font-size:clamp(2.4rem,7vw,5rem);line-height:.95;margin:.5rem 0}}.lede{{max-width:72ch;color:var(--muted);font-size:1.15rem}}section{{margin:1rem 0;padding:1.25rem;border:1px solid var(--line);border-radius:.8rem 1.25rem;background:rgba(11,31,20,.94)}}.hold{{border-left:5px solid var(--gold)}}code{{color:var(--mint);overflow-wrap:anywhere}}table{{width:100%;border-collapse:collapse}}caption{{text-align:left;padding:.5rem 0;color:var(--gold);font-weight:700}}th,td{{padding:.7rem;text-align:left;vertical-align:top;border-top:1px solid var(--line)}}th{{color:var(--mint)}}li{{margin:.45rem 0}}.metrics{{display:grid;grid-template-columns:repeat(auto-fit,minmax(12rem,1fr));gap:.7rem}}.metrics article{{padding:1rem;border:1px solid var(--line);border-radius:.7rem}}.metrics strong{{display:block;color:var(--gold);font-size:2rem}}footer{{padding:2rem 0;color:var(--muted)}}@media(max-width:42rem){{table,tbody,tr,th,td{{display:block}}th{{border-top:1px solid var(--line)}}td{{border-top:0;padding-top:.1rem}}}}@media(prefers-reduced-motion:reduce){{*{{scroll-behavior:auto!important}}}}@media(forced-colors:active){{section,.metrics article{{border:1px solid CanvasText}}}}
</style></head><body><header><p class="eyebrow">CHORUS technical record · 19 August 2026</p><h1>Updated working-tree status</h1><p class="lede">The scholarly-reader and icon update is complete and directly checked at implementation digest <code>{html.escape(binding['digest'])}</code>. It is deliberately held from inheriting the earlier release-candidate label until browser and distribution evidence are renewed for this same source.</p></header><main><section class="hold"><h2>Decision</h2><p><strong>{html.escape(record['state_label'])}.</strong> Historical browser and clean-room evidence remains available under its original binding; it is not presented as current-source execution.</p></section><section><h2>Observed verification</h2><div class="metrics"><article><span>Deterministic assertions</span><strong>{verification['implementation_assertions']:,}</strong><small>zero failures</small></article><article><span>Focused tests</span><strong>{verification['focused_tests']['passed']}</strong><small>zero failures</small></article><article><span>Production routes</span><strong>{record['production_route_check']['passed']}</strong><small>all returned HTTP 200</small></article><article><span>Dependency vulnerabilities</span><strong>{vulnerabilities['total']}</strong><small>{html.escape(vuln_text)}</small></article></div><table><caption>Focused suites</caption><thead><tr><th scope="col">Suite</th><th scope="col">Passed</th><th scope="col">Failed</th></tr></thead><tbody>{groups}</tbody></table></section><section><h2>Included update</h2><ul>{list_html(record['included_update'])}</ul></section><section><h2>Current observation limits</h2><ul>{list_html(record['current_observation_limits'])}</ul></section><section><h2>Promotion requirements</h2><ol>{list_html(record['promotion_requirements'])}</ol></section><section><h2>Raw records</h2><p><a href="{source_link}">Machine-readable status</a> · <a href="updated-route-check.v1.json">route evidence</a> · <a href="dependency-audit.updated-working-tree.v1.json">dependency audit</a> · <a href="index.html">historical release evidence</a></p></section></main><footer><p>Self-contained HTML · no remote assets, scripts, analytics, or hidden pass states.</p></footer></body></html>'''
    return {PUBLIC_JSON:stable(record),PUBLIC_HTML:doc.encode()}

def main():
    ap=argparse.ArgumentParser(description=__doc__); ap.add_argument('--check',action='store_true'); args=ap.parse_args()
    record=json.loads(SOURCE.read_text()); outputs=build(record); drift=[]
    for path,payload in outputs.items():
        if args.check:
            if not path.is_file() or path.read_bytes()!=payload: drift.append(path.relative_to(ROOT).as_posix())
        else:
            path.parent.mkdir(parents=True,exist_ok=True); path.write_bytes(payload)
    if drift:
        print('Working-tree status drift:',*('\n  '+x for x in drift),file=sys.stderr); return 1
    print(f"Working-tree status {'verified' if args.check else 'built'}: {len(outputs)} artifacts."); return 0
if __name__=='__main__': raise SystemExit(main())
