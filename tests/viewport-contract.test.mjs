import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const projectRoot = path.resolve(import.meta.dirname, "..");
const css = await readFile(path.join(projectRoot, "app/globals.css"), "utf8");
const page = await readFile(path.join(projectRoot, "app/page.tsx"), "utf8");
const layout = await readFile(path.join(projectRoot, "app/layout.tsx"), "utf8");

function compact(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, "");
}

function cssBlock(selector, source = css) {
  const start = source.indexOf(`${selector}{`);
  assert.notEqual(start, -1, `missing CSS block for ${selector}`);
  const bodyStart = start + selector.length + 1;
  let depth = 1;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(bodyStart, index);
  }
  assert.fail(`unterminated CSS block for ${selector}`);
}

function functionSource(name) {
  const start = page.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const remaining = page.slice(start + `function ${name}`.length);
  const nextFunction = remaining.search(/\nfunction\s+[A-Za-z0-9_]+/);
  return nextFunction === -1
    ? page.slice(start)
    : page.slice(start, start + `function ${name}`.length + nextFunction);
}

function cssRulesFor(selector) {
  const rules = [];
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  for (const match of css.matchAll(rulePattern)) {
    if (match[1].split(",").some((candidate) => candidate.trim() === selector)) rules.push(compact(match[2]));
  }
  return rules;
}

async function sourceFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(target);
    return /\.(?:ts|tsx|js|jsx)$/.test(entry.name) ? [target] : [];
  }));
  return files.flat();
}

test("the application shell owns exactly one dynamic viewport", () => {
  const root = compact(cssBlock("html,body"));
  assert.match(root, /width:100%;/);
  assert.match(root, /height:100%;/);
  assert.match(root, /overflow:hidden;/);
  assert.match(root, /overscroll-behavior:none;/);

  const shell = compact(cssBlock(".site-shell"));
  assert.match(shell, /width:100%;/);
  assert.match(shell, /height:100vh;height:100dvh;/);
  assert.match(shell, /min-height:0;/);
  assert.match(shell, /overflow:hidden;/);
  assert.match(shell, /display:grid;/);
  assert.match(shell, /grid-template-rows:autominmax\(0,1fr\);/);
  for (const edge of ["top", "right", "bottom", "left"]) {
    assert.match(shell, new RegExp(`env\\(safe-area-inset-${edge}\\)`));
  }

  const workspace = compact(cssBlock(".house-workspace"));
  assert.match(workspace, /min-width:0;/);
  assert.match(workspace, /min-height:0;/);
  assert.match(workspace, /overflow:hidden;/);
  assert.match(workspace, /minmax\(0,1fr\)/);
});

test("the House Map notice stays intrinsic while the room grid owns the flexible desktop row", () => {
  const houseMap = functionSource("HouseMap");
  const headingIndex = houseMap.indexOf('className="stage-heading"');
  const statsIndex = houseMap.indexOf('className="map-stats"');
  const limitIndex = houseMap.indexOf('className="model-limit house-limit"');
  const roomsIndex = houseMap.indexOf('className="room-map-grid"');
  assert.ok(
    headingIndex >= 0 && headingIndex < statsIndex && statsIndex < limitIndex && limitIndex < roomsIndex,
    "House Map source order must remain heading, stats, notice, then rooms",
  );

  const map = compact(cssBlock(".house-map"));
  assert.match(map, /grid-template-rows:autoautoautominmax\(350px,1fr\);/);
  assert.doesNotMatch(
    map,
    /grid-template-rows:autoautominmax\(350px,1fr\)auto;/,
    "the short notice must not receive the flexible room-grid track",
  );
});

test("viewport metadata permits safe-area layout without limiting zoom", () => {
  assert.match(layout, /import\s+type\s*\{[^}]*\bViewport\b[^}]*\}\s+from\s+["']next["']/s);
  assert.match(layout, /export\s+const\s+viewport\s*:\s*Viewport\s*=\s*\{/);
  assert.match(layout, /width\s*:\s*["']device-width["']/);
  assert.match(layout, /initialScale\s*:\s*1\b/);
  assert.match(layout, /viewportFit\s*:\s*["']cover["']/);
  assert.doesNotMatch(layout, /(?:maximumScale|userScalable)\s*:/);
});

test("navigation changes app state or an internal pane, never the document", async () => {
  const files = await sourceFiles(path.join(projectRoot, "app"));
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /\.scrollIntoView\s*\(/);
  assert.doesNotMatch(source, /href\s*=\s*(?:["']#|\{\s*["']#)/);
  assert.doesNotMatch(source, /(?:window|document\.documentElement|document\.body)\.scroll(?:To|By)\s*\(/);
  assert.match(page, /stageRef\.current\?\.scrollTo\(\{\s*top:\s*0,\s*behavior:\s*["']auto["']\s*\}\)/);
});

test("overflow is confined to named, accessible internal regions", () => {
  const stage = compact(cssBlock(".stage-view"));
  const pane = compact(cssBlock(".pane-scroll"));
  for (const block of [stage, pane]) {
    assert.match(block, /min-width:0;/);
    assert.match(block, /min-height:0;/);
    assert.match(block, /overflow:auto;/);
    assert.match(block, /overscroll-behavior:contain;/);
    assert.match(block, /scroll-padding:/);
  }

  assert.match(
    page,
    /<section\s+className=["']stage-view["'][^>]*role=["']region["'][^>]*aria-labelledby=\{stageHeadingId\([^}]+\)\}[^>]*tabIndex=\{0\}[^>]*data-scroll-region=["']primary["']/s,
  );
  const debrief = functionSource("NightDebrief");
  assert.match(debrief, /className=["'][^"']*\bdebrief-ending\b[^"']*["']/);
  assert.match(page, /className=["']scene-panel-content scene-source-panel pane-scroll["'][^>]*role=["']tabpanel["'][^>]*data-scroll-region=["']scene-reading["']/);
  assert.match(page, /className=["']scene-panel-content scene-seat-panel pane-scroll["'][^>]*role=["']tabpanel["'][^>]*data-scroll-region=["']scene-reading["']/);
  assert.match(page, /className=["']scene-panel-content scene-record-panel pane-scroll["'][^>]*role=["']tabpanel["'][^>]*data-scroll-region=["']scene-reading["']/);
  assert.match(page, /className=["']scene-panel-content scene-echoes-panel pane-scroll["'][^>]*role=["']tabpanel["'][^>]*data-scroll-region=["']scene-reading["']/);
  assert.match(page, /<section\s+className=["']choices-pane pane-scroll warm-frame["'][^>]*data-scroll-region=["']choices["']/);
  assert.match(page, /role=["']dialog["'][^>]*aria-modal=["']true["'][^>]*aria-labelledby=["']drawer-title["']/);
  assert.match(page, /className=["']drawer-body pane-scroll["'][^>]*data-scroll-region=["']drawer["']/);

  const focus = compact(css);
  assert.match(focus, /summary:focus-visible/);
  assert.match(focus, /\[tabindex\]:focus-visible/);
  assert.match(focus, /\[role="tab"\]:focus-visible/);
});

test("mobile and short-landscape layouts preserve a bounded stage", () => {
  const mobile = compact(css);
  assert.match(mobile, /\.site-shell\{[^}]*safe-area-inset-top[^}]*safe-area-inset-right[^}]*safe-area-inset-bottom[^}]*safe-area-inset-left[^}]*\}/);
  assert.match(mobile, /\.house-workspace\{grid-template-columns:minmax\(0,1fr\);grid-template-rows:autominmax\(0,1fr\)\}/);
  assert.match(mobile, /\.room-rail\{height:124px;[^}]*overflow:hidden;?[^}]*\}/);
  assert.match(mobile, /\.stage-view\{[^}]*padding:8px;/);
  assert.match(mobile, /@media\(max-width:900px\)[\s\S]*\.simulation-grid\{[^}]*grid-template-columns:minmax\(0,1fr\);[^}]*overflow:visible/);
  assert.match(mobile, /\.artifact-body\{[^}]*position:relative;[^}]*inset:auto;[^}]*min-height:0;[^}]*display:flex;[^}]*overflow:visible/);
  assert.match(mobile, /\.scene-panel-content\{[^}]*min-height:0;[^}]*overflow:auto/);
  assert.match(mobile, /@media\(max-width:680px\)[\s\S]*\.scene-panel-tabs\{[^}]*grid-template-columns:repeat\(4,minmax\(0,1fr\)\)/);

  const landscape = compact(css);
  assert.match(landscape, /\.site-shell\{[^}]*padding:3px;[^}]*\}/);
  assert.match(landscape, /@media\(max-height:520px\)and\(orientation:landscape\)[\s\S]*\.house-workspace\{[^}]*grid-template-columns:130pxminmax\(0,1fr\)/);
  assert.match(landscape, /\.context-rail\{display:none\}/);
  assert.match(landscape, /\.signals-button\{display:inline-(?:block|flex)!important/);
  assert.match(landscape, /\.stage-view\{padding:6px\}/);
  assert.match(landscape, /\.room-tabsbutton\{[^}]*min-height:42px;[^}]*\}/);

  const compactCss = compact(css);
  const compactLandscapeMarker = "@media(max-width:680px)and(max-height:520px)and(orientation:landscape){";
  const compactLandscapeStart = compactCss.lastIndexOf(compactLandscapeMarker);
  assert.notEqual(compactLandscapeStart, -1, "missing late narrow short-landscape cascade override");
  const compactLandscapeEnd = compactCss.indexOf("@media(", compactLandscapeStart + compactLandscapeMarker.length);
  const narrowLandscape = compactCss.slice(
    compactLandscapeStart + compactLandscapeMarker.length,
    compactLandscapeEnd === -1 ? compactCss.length : compactLandscapeEnd,
  );
  assert.match(narrowLandscape, /\.house-header\{[^}]*min-height:42px;[^}]*grid-template-columns:34pxminmax\(0,1fr\)/);
  assert.match(narrowLandscape, /\.header-nav\{[^}]*display:flex;[^}]*overflow-x:auto;[^}]*scrollbar-width:auto/);
  assert.match(narrowLandscape, /\.house-workspace\{[^}]*grid-template-columns:112pxminmax\(0,1fr\);grid-template-rows:minmax\(0,1fr\)/);
  assert.match(narrowLandscape, /\.room-rail\{height:auto;min-height:0;[^}]*overflow:hidden/);
  assert.match(narrowLandscape, /\.room-tabs\{[^}]*grid-template-columns:minmax\(0,1fr\);grid-template-rows:repeat\(6,minmax\(40px,1fr\)\);[^}]*overflow-y:auto/);
  assert.ok(
    compactLandscapeStart > compactCss.indexOf("@media(max-height:520px)and(orientation:landscape){")
      && compactLandscapeStart > compactCss.indexOf("@media(max-width:680px){"),
    "narrow landscape override loses the mobile or short-landscape cascade",
  );
});

test("locked choices remain operable explanations, not disabled dead ends", () => {
  const start = page.indexOf("<button id={`choice-${choice.id}`}");
  assert.notEqual(start, -1, "missing generated choice button");
  const end = page.indexOf("</button>", start);
  assert.notEqual(end, -1, "unterminated generated choice button");
  const choiceButton = page.slice(start, end);

  assert.match(choiceButton, /className=\{[^}]*access\.locked\s*\?\s*["']is-locked/);
  assert.match(choiceButton, /disabled=\{props\.choicesLocked\}/);
  assert.doesNotMatch(choiceButton, /\sdisabled=\{[^}]*access\.locked/);
  assert.match(choiceButton, /aria-disabled=\{props\.choicesLocked\}/);
  assert.match(choiceButton, /aria-label=\{access\.locked \? choice\.label \+ [^}]*Currently unavailable; activate for the reason/);
  assert.match(choiceButton, /aria-expanded=\{access\.locked \? expanded : undefined\}/);
  assert.match(choiceButton, /aria-controls=\{access\.locked \? receiptId : undefined\}/);
  assert.match(choiceButton, /onClick=\{\(\)\s*=>\s*props\.onChoice\(choice\)\}/);
  assert.match(page, /if\s*\(access\.locked\)\s*\{[\s\S]*blockedAttempt\?\.choice\.id === choice\.id[\s\S]*setBlockedAttempt\(null\)[\s\S]*setBlockedAttempt\(\{\s*choice,\s*access\s*\}\)[\s\S]*focusInsideActivePane\(["']blocked-choice-receipt-["'] \+ choice\.id, ["']choice-["'] \+ choice\.id\)/);
  assert.match(page, /function\s+focusInsideActivePane[\s\S]*target\.closest<HTMLElement>\(["']\[data-scroll-region\]["']\)[\s\S]*region\.scrollTo\(\{\s*top:[\s\S]*behavior:\s*["']auto["']/);
  assert.doesNotMatch(page, /focusStage\(["']blocked-choice/);
  assert.match(page, /<aside className=["']choice-blocked-detail blocked-receipt["'] id=\{id\} role=["']status["']/);
  assert.doesNotMatch(page, /className=["']blocked-close["']|onDismissBlocked/);
  assert.match(choiceButton, /Reason open; activate again to close/);
});

test("the conclusion is one normal-flow reading region rather than a tab or disclosure maze", () => {
  const debrief = functionSource("NightDebrief");
  const ending = compact(cssBlock(".debrief-ending"));
  assert.match(ending, /width:min\(100%,[\d.]+(?:px|rem)\)/);
  assert.match(ending, /display:grid/);
  assert.doesNotMatch(debrief, /role=["']tablist["']|role=["']tab["']|role=["']tabpanel["']|<details/);
  assert.doesNotMatch(ending, /position:(?:fixed|absolute|sticky)|overflow:(?:auto|scroll|hidden)/);
  const summaryIndex = debrief.indexOf("naturalized-summary");
  const conceptsIndex = debrief.indexOf("plain-concept-receipt");
  assert.ok(summaryIndex >= 0 && conceptsIndex > summaryIndex);
});

test("the natural story, concept receipt, and model limit reflow inside the one debrief scroller", () => {
  const debrief = functionSource("NightDebrief");
  for (const selector of [".naturalized-summary", ".plain-concept-receipt", ".model-limit"]) {
    const rules = cssRulesFor(selector);
    assert.ok(rules.length > 0, `missing ${selector} layout rules`);
    const declarations = rules.join(";");
    assert.doesNotMatch(declarations, /position:(?:fixed|absolute|sticky)/);
    assert.doesNotMatch(declarations, /overflow-(?:x|y):(?:auto|scroll|hidden)|overflow:(?:auto|scroll|hidden)/);
  }
  assert.match(debrief, /<(?:ul|ol)(?:\s|>)/, "concepts must use wrapping list semantics");
  const conceptGrid = compact(cssBlock(".plain-concept-receipt ol"));
  const conceptItem = compact(cssBlock(".plain-concept-receipt li"));
  assert.match(conceptGrid, /grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(conceptItem, /min-width:0/);
  assert.match(compact(css), /@media\(max-width:680px\)[\s\S]*\.plain-concept-receiptol\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(compact(css), /@media\(forced-colors:active\)[\s\S]*(?:\.naturalized-summary|\.plain-concept-receipt|\.model-limit)/);
});

test("the seven mobile house tools wrap without a hidden horizontal nav", () => {
  const mobile = compact(css);
  assert.match(mobile, /@media\(max-width:680px\)[\s\S]*\.header-nav\{[^}]*overflow:visible;[^}]*display:grid;[^}]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(mobile, /@media\(max-width:680px\)[\s\S]*\.header-navbutton\{[^}]*min-width:0;[^}]*min-height:44px;[^}]*white-space:normal;[^}]*overflow-wrap:anywhere/);
  assert.doesNotMatch(mobile, /@media\(max-width:680px\)[\s\S]*\.header-nav::-webkit-scrollbar\{display:none\}/);
  const header = functionSource("HouseHeader");
  assert.equal((header.match(/<button\b/g) ?? []).length, 8, "one Home control plus seven house tools should remain in the DOM");
});
