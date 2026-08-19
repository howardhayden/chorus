import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "..");
const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
const css = await readFile(path.join(root, "app/globals.css"), "utf8");
const favicon = await readFile(path.join(root, "public/favicon.svg"), "utf8");
const privacy = await readFile(path.join(root, "app/privacy-panel.tsx"), "utf8");
const saves = await readFile(path.join(root, "app/save-model.ts"), "utf8");

function functionSource(name, nextName) {
  const start = page.indexOf(`function ${name}`);
  const end = page.indexOf(`function ${nextName}`, start + 1);
  assert.notEqual(start, -1, `missing ${name}`);
  assert.notEqual(end, -1, `missing boundary ${nextName}`);
  return page.slice(start, end);
}

test("prelude offers directional hints without naming the lessons", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  for (const spoiler of ["SCAPEGOAT", "RUMOR", "WARM / COOL", "AGREEMENT", "FATIGUE", "fault line"]) {
    assert.doesNotMatch(prelude, new RegExp(spoiler, "i"));
  }
  for (const hint of ["RECORD", "PRESSURE", "SIGNAL", "TRANSLATION", "REPLY", "LOAD"]) {
    assert.match(prelude, new RegExp(`\\b${hint}\\b`));
  }
});

test("active play withholds classifications and recognition checklists", () => {
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  assert.doesNotMatch(play, /recognitionCues|repairMove|relationalMove\.classification|protectedStake|emotionalOvertake|interiorOrientation/);
  assert.doesNotMatch(play, /conversationDiversion|adjacent concern|wrong thread|meme deflection|absurdist derailment/i);
  assert.doesNotMatch(play, /languageProfile|linguisticEncounter|codeTransition|socialContexts|stableCommitments/);
  assert.match(play, /IN THE RECORD/);
  assert.match(play, /ROOM READING/);
  assert.match(play, /NOT YET KNOWN/);
  assert.match(play, /playInferenceHints/);
  assert.match(play, /\["source", "Source"/);
  assert.match(play, /\["seat", "Seat"/);
  assert.match(play, /\["record", "Record"/);
  assert.match(play, /\["echoes", "Echoes"/);
  assert.match(play, /role="tablist" aria-label="Scene information"/);
  assert.match(play, /role="tabpanel"/);
  assert.doesNotMatch(play, /consequence held for receipt|OUTLINE = SOURCE TRACE|GLOW = SOCIAL FIT/);
  assert.doesNotMatch(play, /scene\.body/);
});

test("play exposes a bounded language surface rather than the analytic repertoire", () => {
  const invitation = functionSource("Invitation", "SimulationRoom");
  const closed = functionSource("RoomClosed", "NightDebrief");
  const plot = functionSource("RelationshipPlot", "Invitation");
  assert.match(invitation, /communicationModel\.publicSurfaceCue/);
  assert.doesNotMatch(invitation, /communicationModel\.speechCode|languageProfile|linguisticEncounter|socialContexts|switchRules/);
  assert.match(closed, /communicationModel\.playInferenceHints/);
  assert.doesNotMatch(closed, /communicationModel\.inferences/);
  assert.doesNotMatch(plot, /languageProfile|linguisticEncounter|codeTransition|activeCodeId|worldModel/);
});

test("conversation routing is named only in one collapsed whole-night receipt", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const receipt = functionSource("ChoiceReceipt", "InterpretationReceipt");
  const debrief = functionSource("NightDebrief", "HouseReceipt");

  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /conversation diversion|valid concern · separate thread|meme · answer-shaped deflection|absurdism · question displaced/i);
  }
  assert.match(receipt, /<details className="conversation-routes">/);
  assert.match(receipt, /<summary><span>Conversation routes<\/span>/);
  assert.match(receipt, /A moved question is not automatically a lie/);
  assert.match(receipt, /not style alone/);
  assert.match(receipt, /VALID CONCERN · SEPARATE THREAD/);
  assert.match(receipt, /MEME · ANSWER-SHAPED DEFLECTION/);
  assert.match(receipt, /ABSURDISM · QUESTION DISPLACED/);
  assert.doesNotMatch(debrief, /id: "routes"|id: "diversion"/);
  assert.match(css, /\.conversation-routes>summary\{[^}]*min-height:44px/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*\.conversation-routes>summary,\.conversation-route-key,\.conversation-route-list\{grid-template-columns:minmax\(0,1fr\)/);
});

test("linguistic repertoires open only inside the concluding Interpretation receipt", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const receipt = functionSource("InterpretationReceipt", "CrossingReceipt");
  const debrief = functionSource("NightDebrief", "HouseReceipt");

  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /Registers and assumptions|Registers at disposal|Context history|Played register actions|shared-code frictions/i);
  }
  assert.match(receipt, /<details className="language-receipt">/);
  assert.match(receipt, /<summary><span>Registers and assumptions<\/span>/);
  assert.match(receipt, /fictional repertoires learned through particular places, resource settings, groups, institutions, and platforms/i);
  assert.match(receipt, /does not establish shared belief, motive, truth, class position, competence, or care/i);
  assert.match(receipt, /Switching registers does not prove deceit/i);
  assert.match(receipt, /state\.decisions\.filter\(\(event\) => event\.codeTransition\)/);
  assert.match(receipt, /event\.codeTransition!\.fromCodeId/);
  assert.match(receipt, /event\.codeTransition!\.toCodeId/);
  assert.match(receipt, /new Set\(\[profile\.primaryCodeId/);
  assert.match(receipt, /Registers at disposal/);
  assert.match(receipt, /Context history/);
  assert.match(receipt, /What stayed constant/);
  assert.match(receipt, /Played register actions/);
  assert.match(receipt, /Shared surface/);
  assert.match(receipt, /different assumptions/);
  assert.doesNotMatch(receipt, /cohesion score|linguistic stability|unstable character/i);
  assert.doesNotMatch(debrief, /\["language"|\["registers"|\["linguistic"/i);
  assert.match(css, /\.language-receipt>summary\{[\s\S]*?min-height:44px/);
  assert.match(css, /\.language-profile>summary\{[\s\S]*?min-height:54px/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*?\.language-receipt>summary,\.language-profile-list,\.language-profile>summary,\.language-profile-body,\.language-model-comparison\{grid-template-columns:minmax\(0,1fr\)/);
});

test("the internal pressure contour is never taught as an in-game taxonomy", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const debrief = functionSource("NightDebrief", "HouseReceipt");
  assert.doesNotMatch(prelude, /higher escalation|crisis phase|de-escalation|recovery phase/i);
  assert.doesNotMatch(play, /BEHAVIOR_PHASE_COPY|higher-escalation|de-escalation/);
  assert.match(play, /SEAT PRESSURE/);
  assert.doesNotMatch(page, /function BehaviorReceipt|BEHAVIOR_PHASE_COPY|seven-phase escalation cycle/);
  assert.doesNotMatch(debrief, /\["behavior", "Behavior"\]|BehaviorReceipt/);
});

test("practice receipts use CHORUS-native lenses and keep the internal action review sealed", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const receipt = functionSource("PracticeReceipt", "HeartReceipt");
  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /situated leadership|situated action review|repair conversation|frameworkMoves/i);
  }
  assert.match(receipt, /SPARSE BY DESIGN/);
  assert.match(receipt, /situated-leadership thread/);
  assert.match(receipt, /accountable repair conversation/);
  assert.match(receipt, /framework\.id !== "situated-action-review"/);
  assert.doesNotMatch(receipt, /IDOC|PACE|Indiana Department|Leading From Within|sourceWork}/i);
  assert.match(receipt, /CONDITION/);
  assert.match(receipt, /READING/);
  assert.match(receipt, /ACCOUNTABLE MOVE/);
});

test("deliberate-protection analysis stays sealed until the final receipt", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const receipt = functionSource("InterpretationReceipt", "CrossingReceipt");
  assert.doesNotMatch(prelude, /deliberate misrepresentation|friend|family|person under authority/i);
  assert.doesNotMatch(play, /DELIBERATE MISREPRESENTATION|FOR PERSON UNDER AUTHORITY/);
  assert.match(receipt, /DELIBERATE MISREPRESENTATION/);
  assert.match(receipt, /A deliberate departure requires represented private knowledge/);
  assert.match(receipt, /POWER \/ RELATIONSHIP/);
  assert.match(receipt, /CORRECTION DUTY/);
  assert.match(receipt, /WHY THE SIMPLIFICATION REMAINED USEFUL/);
  assert.match(receipt, /COMPETENCE THREAT/);
  assert.match(receipt, /MATERIAL COUNTER-RECORD/);
  assert.match(receipt, /GROUP \/ CLASS STORY PROTECTED/);
  assert.match(receipt, /COMPETITIVE PRIZE/);
});

test("explicit interpretation remains gated behind whole-night completion", () => {
  assert.match(page, /analysisAvailable=\{nightComplete\}/);
  assert.match(page, /analysisAvailable \? <FieldNotes \/> : <HouseGuide \/>/);
  assert.match(page, /analysisAvailable \? <MemeLineage \/> : <TraceGuide \/>/);
  assert.match(page, /The whole-night receipt will name the pattern/);
});

test("new nights remain available through one regeneration control without a campaign counter", () => {
  const rail = functionSource("RoomRail", "HouseMap");
  assert.match(rail, /Regenerate night/);
  assert.equal((rail.match(/onClick=\{props\.onRegenerate\}/g) ?? []).length, 1);
  assert.doesNotMatch(page, /night \d+ of \d+|nights remaining|final generated night|campaign night/i);
});

test("rooms remain switchable while scheduled artifacts retain their clock", () => {
  const rail = functionSource("RoomRail", "HouseMap");
  const map = functionSource("HouseMap", "RelationshipPlot");
  assert.doesNotMatch(rail, /disabled=\{!open\}|ARRIVES SOON/);
  assert.match(rail, /ENTER ANY TIME/);
  assert.doesNotMatch(map, /disabled=\{!open\}/);
  assert.doesNotMatch(map, /Switching never advances the shared clock|house-map-footer/);
  const select = functionSource("Home", "FilmLayer");
  const selectionStart = select.indexOf("function selectScenario");
  const selectionEnd = select.indexOf("function beginIncident", selectionStart);
  assert.notEqual(selectionStart, -1);
  assert.doesNotMatch(select.slice(selectionStart, selectionEnd), /setState\(/);
  assert.doesNotMatch(page, /Nothing from this beat exists for you to answer yet|className="waiting-view"/);
  assert.match(select, /room\.entered && !room\.completed && !isSceneDue/);
  assert.match(select, /setSelectedId\(null\)/);
});

test("relationship plot is filterable, keyboard explorable, and disclosure-bounded", () => {
  const plot = functionSource("RelationshipPlot", "Invitation");
  assert.match(plot, /aria-label="Relationship plot filters"/);
  assert.match(plot, /type="search"/);
  assert.match(plot, /<option value="authority">Authority<\/option>/);
  assert.match(plot, /role="button" tabIndex=\{0\}/);
  assert.match(plot, /event\.key === "Enter" \|\| event\.key === " "/);
  assert.match(plot, /Relationship list/);
  assert.match(plot, /role="listitem"/);
  assert.match(plot, /Private motives, sealed claims, and unrevealed crossings are excluded/);
  assert.doesNotMatch(plot, /interiorOrientation|initiatorBenefit|recognitionCues|traitGeneralization|revealedCue/);
  assert.match(css, /\.graph-node:focus-visible circle\{/);
  assert.match(css, /\.relations-filters input,\.relations-filters select\{[^}]*min-height:44px/);
});

test("each visible navigation destination has one control per viewport", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const map = functionSource("HouseMap", "RelationshipPlot");
  const plot = functionSource("RelationshipPlot", "Invitation");
  assert.doesNotMatch(prelude, /How trace and fit work|onLineage/);
  assert.equal(page.match(/openDrawer\("lineage"/g)?.length, 1);
  assert.doesNotMatch(map, /onSelect|<button/);
  assert.doesNotMatch(plot, /Open this story|relationship-table[\s\S]*?<button/);
  assert.match(css, /\.signals-button\{display:inline-flex/);
  assert.match(css, /\.relations-header-button\{display:none\}/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*\.relations-header-button\{display:inline-flex/);
  assert.match(css, /\.rail-fallback-action\{display:none!important;[^}]*text-align:center/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*\.rail-fallback-action\{display:inline-flex!important\}/);
});

test("the CHORUS mark is a three-color faceted serpent C in both header and favicon", () => {
  const mark = functionSource("ChorusMark", "HouseHeader");
  for (const color of ["serpent-gold", "serpent-silver", "serpent-green"]) assert.match(mark, new RegExp(color));
  assert.match(mark, /serpent-head head-gold/);
  assert.match(mark, /serpent-head head-silver/);
  assert.match(mark, /serpent-head head-green/);
  assert.match(mark, /serpent-facet/);
  assert.equal((mark.match(/serpent-weave-over/g) ?? []).length, 6);
  assert.doesNotMatch(mark, />C<\/span>/);
  for (const color of ["#c89d42", "#c3cfcb", "#17663d"]) {
    assert.match(css, new RegExp(color));
    assert.match(favicon, new RegExp(color));
  }
  assert.equal((favicon.match(/<polygon/g) ?? []).length, 3);
  assert.ok(mark.indexOf('serpent-green" d="M54 11') < mark.indexOf('serpent-gold" d="M53 20'));
  assert.ok(mark.indexOf('serpent-gold" d="M53 20') < mark.indexOf('serpent-silver" d="M55 29'));
  assert.match(favicon, /M54 11[^\n]+stroke="#17663d"[\s\S]*M53 20[^\n]+stroke="#c89d42"[\s\S]*M55 29[^\n]+stroke="#c3cfcb"/);
});

test("modal content isolates the background and restores keyboard focus", () => {
  assert.match(page, /className="site-content" inert=\{drawer \? true : undefined\} aria-hidden=\{drawer \? true : undefined\}/);
  assert.match(page, /role="dialog" aria-modal="true" aria-labelledby="drawer-title"/);
  assert.match(page, /event\.key === "Escape"/);
  assert.match(page, /drawerReturnRef\.current.*focus/s);
  assert.match(page, /button, a\[href\], input, select, textarea, summary/);
  assert.match(page, /element\.offsetWidth > 0 \|\| element\.offsetHeight > 0 \|\| element\.getClientRects\(\)\.length > 0/);
  assert.match(page, /element\.closest\("details:not\(\[open\]\)"\)/);
  assert.match(page, /!closedDisclosure \|\| isClosedSummary/);
  assert.match(page, /className="drawer-body pane-scroll" role="region" aria-labelledby="drawer-title" tabIndex=\{0\}/);
  assert.match(page, /const onCloseRef = useRef\(onClose\)/);
  assert.match(page, /onCloseRef\.current = onClose/);
  assert.match(page, /if \(event\.key === "Escape"\)[\s\S]*onCloseRef\.current\(\)/);
  assert.match(page, /document\.addEventListener\("keydown", keepFocusInside\)[\s\S]*document\.removeEventListener\("keydown", keepFocusInside\)[\s\S]*\}, \[\]\)/);
});

test("meters expose names and values without relying on color", () => {
  const context = functionSource("ContextRail", "Metric");
  const metric = functionSource("Metric", "RoomClosed");
  assert.match(context, /role="progressbar" aria-label="Clarity" aria-valuemin=\{0\} aria-valuemax=\{100\} aria-valuenow=/);
  assert.match(context, /role="progressbar" aria-label=\{fatigueHint\(kind\) \+ " load"\}/);
  assert.match(metric, /role="progressbar" aria-label=\{label\} aria-valuemin=\{0\} aria-valuemax=\{100\} aria-valuenow=/);
});

test("focus, text scaling, and target-size floors are explicit", () => {
  assert.match(css, /button:focus-visible[^\{]*\{[^}]*outline:2px solid/);
  assert.match(css, /body\{[^}]*font-size:16px;[^}]*line-height:1\.5/);
  assert.match(css, /\.debrief-tabs button\{min-height:44px\}/);
  assert.match(css, /\.house-drawer>header button\{width:44px;height:44px\}/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*\.header-nav button\{min-height:44px/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
});

test("locked ideals are discoverable without revealing the reason early", () => {
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  assert.match(play, /Currently unavailable; activate for the reason/);
  assert.match(play, /aria-disabled=\{props\.choicesLocked\}/);
  assert.match(play, /aria-expanded=\{access\.locked \? expanded : undefined\}/);
  assert.match(play, /aria-controls=\{access\.locked \? receiptId : undefined\}/);
  assert.match(play, /aria-describedby=\{expanded \? `\$\{receiptId\}-copy` : undefined\}/);
  assert.match(play, /Reason open; activate again to close/);
  assert.match(play, /REASON OPEN ↑/);
  assert.doesNotMatch(play, /conciseReason|lockReason|FATIGUE_COPY/);
  const receipt = functionSource("BlockedReceipt", "InboundEchoes");
  assert.match(receipt, /barrier\?\.motive/);
  assert.match(receipt, /barrier\.emotionalOvertake/);
  assert.match(receipt, /barrier\.trigger/);
  assert.match(receipt, /dominant\.label.*load is highest/);
  assert.doesNotMatch(receipt, /<button|blocked-close|onDismiss/);
  assert.match(play, /className=\{`choice-shell choice-row\$\{expanded \? " is-expanded" : ""\}`\}/);
});

test("The heart defines the represented ideas without instructional imperatives", () => {
  const heart = functionSource("HeartReceipt", "HouseDrawer");
  assert.match(heart, /Will you understand every seat/);
  assert.match(heart, /Scapegoating concentrates a distributed failure/);
  assert.match(heart, /Deliberate protection is a knowingly altered account/);
  assert.match(heart, /Cross-code agreement is a shared concrete action/);
  assert.doesNotMatch(heart, /Can you understand|Do not require|Translate coalition|Treat both as/);
});

test("privacy and saves are one optional, progressively disclosed destination", () => {
  assert.equal(page.match(/id="header-privacy"/g)?.length, 1);
  assert.match(page, /openDrawer\("privacy", "header-privacy"\)/);
  assert.match(page, /kind === "privacy" && <PrivacyPanel/);
  assert.match(privacy, /<details className="privacy-disclosure">/);
  assert.match(privacy, /Session only/);
  assert.match(privacy, /Check local slots/);
  assert.match(privacy, /Download save text/);
  assert.match(privacy, /CHECKED · NOT LOADED/);
  assert.match(privacy, /Load this night/);
  assert.match(privacy, /Technical record/);
  assert.match(privacy, /Complete system · spoilers/);
  assert.match(privacy, /href="\/notebooks\/index\.html"/);
  assert.match(privacy, /Open notebook index · new tab/);
  assert.match(saves, /mode: "memory-only"/);
  assert.match(saves, /localWrites: false/);
  assert.doesNotMatch(page, /FICTIONAL COMPOSITE · PG · EXPLANATORY, NOT PREDICTIVE|LOCAL ONLY · NO TRACKERS · NO SCORE/);
});

test("privacy controls validate before restore and keep failures inside an announced status", () => {
  assert.match(privacy, /if \(file\.size > MAX_PORTABLE_SAVE_BYTES\)/);
  assert.match(privacy, /parsePortableSave\(await file\.text\(\)\)/);
  assert.match(privacy, /setPendingImport\(parsed\)/);
  assert.match(privacy, /CHECKED · NOT LOADED/);
  assert.match(privacy, /function restoreImport\(\)[\s\S]*onRestore\(pendingImport\.state\)/);
  assert.match(privacy, /catch \(error\) \{\s*report\(error\);\s*event\.target\.value = "";\s*\}/);
  assert.match(privacy, /error instanceof SaveModelError \? error\.message/);
  assert.match(privacy, /className="privacy-status" role="status"/);
  assert.match(privacy, /new Blob\(\[text\], \{ type: "text\/plain;charset=utf-8" \}\)/);
  assert.match(privacy, /link\.download = `chorus-night-turn-\$\{state\.turn\}\.txt`/);
  assert.match(privacy, /document\.body\.append\(link\)[\s\S]*link\.click\(\)[\s\S]*link\.remove\(\)/);
  assert.match(privacy, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 0\)/);
});
test("scholarly record is executed, public, bounded, and reachable from the House Guide", async () => {
  const record = functionSource("ResearchRecordLinks", "HouseGuide");
  assert.match(page, /kind === "notes" && <>\{analysisAvailable \? <FieldNotes \/> : <HouseGuide \/>\}<ResearchRecordLinks \/><\/>/);
  assert.match(record, /role="note" aria-labelledby="research-record-title"/);
  assert.match(record, /\/notebooks\/chorus-model-specification\.html/);
  assert.match(record, /\/notebooks\/chorus-research-design\.html/);
  assert.match(record, /target="chorus-scholarly-frame"/);
  assert.match(record, /target="_blank" rel="noreferrer"/);
  assert.match(record, /<iframe name="chorus-scholarly-frame"/);
  assert.match(record, /title="CHORUS scholarly notebook viewer"/);
  assert.match(record, /src="\/notebooks\/index\.html"/);
  assert.match(record, /sandbox="allow-downloads allow-popups"/);
  assert.match(record, /\/notebooks\/chorus-systems-atlas\.html/);
  assert.match(record, /\/notebooks\/chorus-validation-atlas\.html/);
  assert.match(css, /CHORUS SCHOLARLY RECORD · 2026-08-19/);
  assert.match(css, /\.research-record-cards a,\.research-record-links a\{[\s\S]*?min-height:44px/);
  assert.match(css, /\.research-record-viewer iframe\{[^}]*height:clamp\(30rem,66dvh,52rem\)/);
  assert.match(css, /@media\(max-width:680px\)\{[\s\S]*?\.research-record-cards,\.research-record-cards article>div:last-child,\.research-record-links\{grid-template-columns:minmax\(0,1fr\)/);

  const paths = [
    ["CHORUS-Model-Specification.ipynb", "chorus-model-specification.html", "CHORUS Model Specification"],
    ["CHORUS-Research-Design.ipynb", "chorus-research-design.html", "CHORUS Research Design Atlas"],
  ];
  for (const [notebookName, htmlName, title] of paths) {
    const notebook = JSON.parse(await readFile(path.join(root, "notebooks", notebookName), "utf8"));
    const codeCells = notebook.cells.filter((cell) => cell.cell_type === "code");
    assert.ok(notebook.cells.every((cell) => /^[A-Za-z0-9_-]{1,64}$/.test(cell.id)));
    assert.equal(new Set(notebook.cells.map((cell) => cell.id)).size, notebook.cells.length);
    assert.ok(codeCells.length > 10);
    assert.ok(codeCells.every((cell) => Number.isInteger(cell.execution_count) && cell.execution_count > 0));
    assert.ok(codeCells.every((cell) => Array.isArray(cell.outputs) && cell.outputs.length > 0));
    assert.equal(notebook.metadata.chorus.claim_boundary, "synthetic explanatory model; not externally predictive");
    const rendered = await readFile(path.join(root, "public/notebooks", htmlName), "utf8");
    assert.match(rendered, new RegExp(`<title>${title}`));
    assert.match(rendered, /<main id="main">/);
    assert.match(rendered, /Download executed notebook/);
    assert.match(rendered, /href="\.\.\/favicon\.ico"/);
    assert.doesNotMatch(rendered, /<script/i);
  }

  const layout = await readFile(path.join(root, "app/layout.tsx"), "utf8");
  assert.match(layout, /metadataBase: new URL\("https:\/\/chorus\.observer"\)/);
  assert.match(layout, /favicon-32x32\.png/);
  assert.match(layout, /shortcut: "\/favicon\.ico"/);
  assert.match(layout, /apple-touch-icon\.png/);
  assert.match(layout, /manifest: "\/site\.webmanifest"/);
  assert.match(layout, /themeColor: "#0b2819"/);
  for (const iconName of ["favicon.ico", "favicon-32x32.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "site.webmanifest"]) {
    const bytes = await readFile(path.join(root, "public", iconName));
    assert.ok(bytes.length > 100, `${iconName} is unexpectedly small`);
  }
});

