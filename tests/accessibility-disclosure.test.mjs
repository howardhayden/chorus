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
  assert.notEqual(start, -1, `missing ${name}`);
  const explicitEnd = nextName ? page.indexOf(`function ${nextName}`, start + 1) : -1;
  const remaining = page.slice(start + `function ${name}`.length);
  const nextFunction = remaining.search(/\nfunction\s+[A-Za-z0-9_]+/);
  const end = explicitEnd !== -1
    ? explicitEnd
    : nextFunction === -1
      ? page.length
      : start + `function ${name}`.length + nextFunction;
  if (nextName) assert.notEqual(explicitEnd, -1, `missing boundary ${nextName}`);
  return page.slice(start, end);
}

function assertLabeledRegion(source, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const opening = source.match(new RegExp(`<(?:section|article)[^>]*className=["'][^"']*\\b${escaped}\\b[^"']*["'][^>]*>`));
  assert.ok(opening, `missing ${className} landmark`);
  const label = opening[0].match(/aria-labelledby=["']([^"']+)["']/)?.[1];
  assert.ok(label, `${className} is not named by a visible heading`);
  assert.match(source, new RegExp(`id=["']${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`));
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
  assert.match(play, /KNOWN TO THIS SEAT/);
  assert.match(play, /QUESTIONS IN THIS ROOM/);
  assert.match(play, /NOT YET KNOWN/);
  assert.match(play, /scene\.disclosure\.records/);
  assert.match(play, /scene\.disclosure\.questions/);
  assert.match(play, /scene\.disclosure\.unknowns/);
  assert.match(play, /atom\.label/);
  assert.match(play, /atom\.copy/);
  assert.doesNotMatch(play, /scene\.communication|communicationModel\.(?:observableRecord|playInferenceHints|unknowns|inferences|recognitionCues)/);
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
  const rail = functionSource("ContextRail", "Metric");
  const plot = functionSource("RelationshipPlot", "Invitation");
  assert.match(invitation, /communicationModel\.publicSurfaceCue/);
  assert.doesNotMatch(invitation, /communicationModel\.speechCode|languageProfile|linguisticEncounter|socialContexts|switchRules/);
  assert.doesNotMatch(closed, /\.disclosure|PRIVATE ASSIGNMENT BRIEF|CIRCULATING CLAIM|communicationModel\.(?:observableRecord|playInferenceHints|unknowns|inferences)/);
  assert.match(rail, /scenes\[liveRoom\.sceneIndex\]\?\.disclosure\.unknowns\[0\]/);
  assert.doesNotMatch(rail, /communicationModel\.(?:observableRecord|playInferenceHints|unknowns|inferences)/);
  assert.doesNotMatch(plot, /languageProfile|linguisticEncounter|codeTransition|activeCodeId|worldModel/);
});

test("conversation-route classifications stay out of active play and the ending does not revive their taxonomy", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const debrief = functionSource("NightDebrief");

  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /conversation diversion|valid concern · separate thread|meme · answer-shaped deflection|absurdism · question displaced/i);
  }
  assert.doesNotMatch(debrief, /ChoiceReceipt|conversation-routes|VALID CONCERN · SEPARATE THREAD|MEME · ANSWER-SHAPED DEFLECTION|ABSURDISM · QUESTION DISPLACED/);
  assert.match(debrief, /buildNaturalizedSummary\(\s*pack\s*,\s*state\s*\)|<NaturalizedSummary[^>]*\bpack=\{pack\}[^>]*\bstate=\{state\}/s);
});

test("analytic language profiles stay sealed while the ending uses only path-derived plain concepts", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const debrief = functionSource("NightDebrief");

  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /Registers and assumptions|Registers at disposal|Context history|Played register actions|shared-code frictions/i);
  }
  assert.doesNotMatch(debrief, /InterpretationReceipt|LanguageReceipt|language-receipt|language-profile|Registers at disposal|Context history/);
  assert.match(debrief, /buildConceptReceipt\(\s*pack\s*,\s*state\s*\)|<PlainConceptReceipt[^>]*\bpack=\{pack\}[^>]*\bstate=\{state\}/s);
});

test("the internal pressure contour is never taught as an in-game taxonomy", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const debrief = functionSource("NightDebrief");
  assert.doesNotMatch(prelude, /higher escalation|crisis phase|de-escalation|recovery phase/i);
  assert.doesNotMatch(play, /BEHAVIOR_PHASE_COPY|higher-escalation|de-escalation/);
  assert.match(play, /SEAT PRESSURE/);
  assert.doesNotMatch(page, /function BehaviorReceipt|BEHAVIOR_PHASE_COPY|seven-phase escalation cycle/);
  assert.doesNotMatch(debrief, /\["behavior", "Behavior"\]|BehaviorReceipt/);
});

test("framework internals remain sealed instead of becoming a concluding practice syllabus", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  for (const surface of [prelude, play]) {
    assert.doesNotMatch(surface, /situated leadership|situated action review|repair conversation|frameworkMoves/i);
  }
  const debrief = functionSource("NightDebrief");
  assert.doesNotMatch(debrief, /PracticeReceipt|practice-receipt|SPARSE BY DESIGN|ACCOUNTABLE MOVE/);
});

test("private motive and deliberate-protection ledgers stay sealed from both play and the user-facing ending", () => {
  const prelude = functionSource("Prelude", "RoomRail");
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  const debrief = functionSource("NightDebrief");
  assert.doesNotMatch(prelude, /deliberate misrepresentation|friend|family|person under authority/i);
  assert.doesNotMatch(play, /DELIBERATE MISREPRESENTATION|FOR PERSON UNDER AUTHORITY/);
  assert.doesNotMatch(debrief, /InterpretationReceipt|misrepresentation-receipt|incentive-intersection|CORRECTION DUTY|COMPETITIVE PRIZE/);
});

test("explicit interpretation remains gated behind whole-night completion", () => {
  const drawer = functionSource("HouseDrawer", "ResearchRecordLinks");
  assert.equal((page.match(/analysisAvailable=\{nightComplete\}/g) ?? []).length, 2);
  assert.match(drawer, /kind === "notes" && \(analysisAvailable \? <><FieldNotes \/><ResearchRecordLinks \/><\/> : <HouseGuide \/>\)/);
  assert.match(page, /analysisAvailable \? <MemeLineage \/> : <TraceGuide \/>/);
  assert.match(page, /debriefOpen && nightComplete \? \(\s*<NightDebrief/s);
});

test("the precompletion House Guide excludes scholarly records and conclusion claims", () => {
  const drawer = functionSource("HouseDrawer", "ResearchRecordLinks");
  const record = functionSource("ResearchRecordLinks", "HouseGuide");
  const guide = functionSource("HouseGuide", "TraceGuide");
  assert.match(drawer, /analysisAvailable \? <><FieldNotes \/><ResearchRecordLinks \/><\/> : <HouseGuide \/>/);
  assert.equal((drawer.match(/<ResearchRecordLinks \/>/g) ?? []).length, 1);
  assert.equal((page.match(/<iframe\b/g) ?? []).length, 1);
  assert.equal((record.match(/<iframe\b/g) ?? []).length, 1);
  assert.doesNotMatch(drawer, /<HouseGuide \/>[\s\S]*<ResearchRecordLinks \/>/);
  assert.doesNotMatch(guide, /ResearchRecordLinks|\/notebooks\/|<iframe|authored interior/i);
  assert.match(guide, /The conclusion will follow the visible record, selected actions, and modeled effects\./);
  assert.match(guide, /It will not tell you what you believed or learned\./);
});

test("the fixed meme lineage is visibly labeled as general reference", () => {
  const header = functionSource("HouseHeader", "Prelude");
  const drawer = functionSource("HouseDrawer", "ResearchRecordLinks");
  const lineage = functionSource("MemeLineage", "aggregateRoom");
  assert.match(header, /analysisAvailable \? "Meme reference" : "Trace guide"/);
  assert.match(drawer, /analysisAvailable \? "Meme reference" : "Trace guide"/);
  assert.match(lineage, /GENERAL REFERENCE · NOT A PLAYED TRACE/);
  assert.match(lineage, /It is not a trace of the night you played\./);
  assert.doesNotMatch(header + drawer, /Meme trace/);
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
  assert.match(css, /[^{}]*\.debrief-actions button[^{}]*\{[^}]*min-height:44px/);
  assert.match(css, /\.house-drawer>header button\{width:44px;height:44px\}/);
  assert.match(css, /@media\(max-width:680px\)[\s\S]*\.header-nav button\{[^}]*min-height:44px/);
  assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(css, /@media\(forced-colors:active\)/);
});

test("locked ideals are discoverable without revealing the reason early", () => {
  const play = functionSource("SimulationRoom", "BlockedReceipt");
  assert.match(play, /Currently unavailable; activate for the reason/);
  assert.match(play, /aria-disabled=\{props\.choicesLocked\}/);
  assert.match(play, /aria-expanded=\{access\.locked \? expanded : undefined\}/);
  assert.match(play, /aria-controls=\{access\.locked \? receiptId : undefined\}/);
  assert.doesNotMatch(play, /aria-describedby=/, "the focused control and inserted role=status must not announce the same receipt twice");
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

test("the final story, plain concepts, and model limit are separate labeled regions in reading order", () => {
  const debrief = functionSource("NightDebrief");
  const summaryIndex = debrief.indexOf("naturalized-summary");
  const conceptsIndex = debrief.indexOf("plain-concept-receipt");
  const modelLimitIndex = debrief.indexOf("model-limit");
  assert.ok(summaryIndex >= 0, "missing the naturalized summary region");
  assert.ok(conceptsIndex > summaryIndex, "plain concepts must follow the continuous summary");
  assert.ok(modelLimitIndex >= 0, "missing the visible model-limit note");
  assertLabeledRegion(debrief, "naturalized-summary");
  assertLabeledRegion(debrief, "plain-concept-receipt");
  assert.match(debrief, /<p(?:\s|>)/, "natural summary must render as ordinary prose");
  assert.match(debrief, /<(?:ul|ol)(?:\s|>)/, "concept explanations need list semantics");
  assert.match(debrief, /\.evidenceStatus|\.status/, "encountered, experienced, or played status must be visible text");
  const modelLimit = debrief.match(/<aside[^>]*className=["'][^"']*model-limit[^"']*["'][^>]*>/s);
  assert.ok(modelLimit, "the model limit must be a visible aside");
  assert.match(modelLimit[0], /role=["']note["']|aria-label=["'][^"']+["']/);
  assert.doesNotMatch(debrief, /role=["']tablist["']|role=["']tab["']|role=["']tabpanel["']|<details|HeartReceipt/);
});

test("a malformed completed record reaches a plain recovery boundary before conclusion copy is built", () => {
  const debrief = functionSource("NightDebrief");
  const completionGate = debrief.indexOf("if (!isNightComplete(state)) return null;");
  const validationGate = debrief.indexOf("if (validateNightState(pack, state).length > 0)");
  const summaryBuild = debrief.indexOf("const summary = buildNaturalizedSummary(pack, state);");
  const conceptBuild = debrief.indexOf("const receipt = buildConceptReceipt(pack, state);");
  assert.ok(completionGate >= 0, "missing completion gate");
  assert.ok(validationGate > completionGate, "validation must follow the completion gate");
  assert.ok(summaryBuild > validationGate, "summary must be built only after validation");
  assert.ok(conceptBuild > validationGate, "concept receipt must be built only after validation");

  const recovery = debrief.slice(validationGate, summaryBuild);
  assert.match(recovery, /WHOLE-NIGHT RECEIPT UNAVAILABLE/);
  assert.match(recovery, /The completed record did not pass its consistency check\. The house will not tell a story from a record it cannot verify\./);
  assert.match(recovery, /Start clean replay/);
  assert.match(recovery, /onClick=\{onReplay\}/);
  assert.doesNotMatch(recovery, /validationIssues|\.join\(|JSON\.stringify|state\.(?:turn|decisions|rooms|ambientEvents)/);
});

test("privacy and saves are one optional, progressively disclosed destination", () => {
  assert.equal(page.match(/id="header-privacy"/g)?.length, 1);
  assert.match(page, /openDrawer\("privacy", "header-privacy"\)/);
  assert.match(page, /kind === "privacy" && <PrivacyPanel/);
  assert.match(privacy, /<details className="privacy-disclosure">/);
  assert.match(privacy, /Only this open tab/);
  assert.match(privacy, /Closing or reloading the tab can erase it/);
  assert.match(privacy, /Browser slots/);
  assert.match(privacy, /Optional · this browser profile/);
  assert.match(privacy, /Check local slots/);
  assert.match(privacy, /Portable text/);
  assert.match(privacy, /Optional · a file you control/);
  assert.match(privacy, /Download save text/);
  assert.match(privacy, /CHECKED · NOT LOADED/);
  assert.match(privacy, /Load this night/);
  assert.match(privacy, /Technical record/);
  assert.match(privacy, /Supporting records · spoilers/);
  assert.match(privacy, /\{isNightComplete\(state\) && <details className="privacy-disclosure">[\s\S]*?<summary><span>Technical record<\/span>/);
  assert.match(privacy, /not a complete account of the running system/);
  assert.doesNotMatch(privacy, /Complete system/);
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
  assert.match(privacy, /This browser could not read this slot\. Its contents were not checked or changed\./);
  assert.match(privacy, /inspection\.errorCode === "STORAGE_UNAVAILABLE"/);
  for (const label of ["Save current night to slot", "Load slot", "Clear slot", "Confirm clear slot", "Keep slot"]) {
    assert.match(privacy, new RegExp(label));
  }
  assert.match(privacy, /focusAfterUpdate\("slot-A-primary"\)/);
  assert.match(privacy, /focusAfterUpdate\(`slot-\$\{slot\}-confirm-clear`\)/);
  assert.match(privacy, /focusAfterUpdate\(`slot-\$\{slot\}-clear`\)/);
  assert.match(privacy, /focusAfterUpdate\("portable-save-file"\)/);
});

test("the Home route focuses and announces the introduction", () => {
  const home = functionSource("Home", "FilmLayer");
  assert.match(home, /onHome=\{\(\) => \{[\s\S]*setAnnouncement\("CHORUS introduction opened\.[^"']+"\)[\s\S]*focusStage\("prelude-title"\)/);
});
test("scholarly record is executed, public, bounded, and available after completion", async () => {
  const record = functionSource("ResearchRecordLinks", "HouseGuide");
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
    ["CHORUS-Model-Specification.ipynb", "chorus-model-specification.html", "CHORUS Model Specification", 5, [
      "C4 system-context diagram",
      "Component diagram",
      "ERD / domain model",
      "UML activity / state-flow diagram",
      "Directed acyclic causal diagram",
    ]],
    ["CHORUS-Research-Design.ipynb", "chorus-research-design.html", "CHORUS Research Design Atlas", 5, [
      "Research design map",
      "Controlled comparative design diagram",
      "Validity / claims-boundary diagram",
      "Measurement and analysis pipeline",
      "Ethics and misuse-control diagram",
    ]],
    ["CHORUS-Systems-Atlas.ipynb", "chorus-systems-atlas.html", "CHORUS Systems Atlas", 4, [
      "Layered technical architecture",
      "Build and publication pipeline",
      "Artifact publication structure diagram",
      "Route and document relationship map",
    ]],
    ["CHORUS-Validation-Atlas.ipynb", "chorus-validation-atlas.html", "CHORUS Historical Verification Ledger", 3, [
      "Validation pipeline diagram",
      "Evidence provenance diagram",
      "Verification coverage matrix",
    ]],
  ];
  for (const [notebookName, htmlName, title, diagramCount, expectedTypes] of paths) {
    const notebook = JSON.parse(await readFile(path.join(root, "notebooks", notebookName), "utf8"));
    const codeCells = notebook.cells.filter((cell) => cell.cell_type === "code");
    assert.ok(notebook.cells.every((cell) => /^[A-Za-z0-9_-]{1,64}$/.test(cell.id)));
    assert.equal(new Set(notebook.cells.map((cell) => cell.id)).size, notebook.cells.length);
    assert.ok(codeCells.length > 10);
    assert.ok(codeCells.every((cell) => Number.isInteger(cell.execution_count) && cell.execution_count > 0));
    assert.ok(codeCells.every((cell) => Array.isArray(cell.outputs) && cell.outputs.length > 0));
    assert.equal(notebook.metadata.chorus.claim_boundary, "synthetic explanatory model; not externally predictive");
    assert.equal(notebook.metadata.chorus.diagram_count, diagramCount);
    assert.deepEqual([...notebook.metadata.chorus.diagram_types].sort(), [...expectedTypes].sort());
    assert.equal(notebook.metadata.chorus.diagram_routing, "deterministic orthogonal SVG; crossings and node incursions rejected at build time");

    const rendered = await readFile(path.join(root, "public/notebooks", htmlName), "utf8");
    assert.match(rendered, new RegExp(`<title>${title}`));
    assert.match(rendered, /<main id="main">/);
    assert.match(rendered, /Download executed notebook/);
    assert.match(rendered, /href="\.\.\/favicon\.ico"/);
    assert.equal((rendered.match(/<figure class="diagram-figure"/g) ?? []).length, diagramCount);
    assert.equal((rendered.match(/data-routing="orthogonal-crossing-free"/g) ?? []).length, diagramCount);
    assert.equal((rendered.match(/class="diagram-svg"[^>]*role="img"/g) ?? []).length, diagramCount);
    assert.equal((rendered.match(/<desc id="[^"]+">/g) ?? []).length, diagramCount);
    assert.equal((rendered.match(/<summary>Text equivalent<\/summary>/g) ?? []).length, diagramCount);
    assert.equal((rendered.match(/class="diagram-assurance">/g) ?? []).length, diagramCount);
    assert.match(rendered, /0 crossings · 0 node incursions · 0 node overlaps/);
    if (expectedTypes.includes("Verification coverage matrix")) {
      assert.match(rendered, /matrix topology · 0 connector lines/);
    }
    for (const diagramType of expectedTypes) {
      assert.match(rendered, new RegExp(`data-diagram-type="${diagramType.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`));
    }
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
