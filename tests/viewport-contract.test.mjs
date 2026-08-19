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
  assert.match(
    page,
    /<section\s+className=["']debrief-panel pane-scroll["'][^>]*role=["']tabpanel["'][^>]*aria-labelledby=\{["']tab-["']\s*\+\s*tab\}[^>]*tabIndex=\{0\}[^>]*data-scroll-region=["']debrief["']/s,
  );
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

test("the concluding conversation receipt expands in normal flow", () => {
  const route = compact(cssBlock(".conversation-routes"));
  const summary = compact(cssBlock(".conversation-routes>summary"));
  assert.match(page, /<div className="choice-receipt"><details className="conversation-routes">/);
  assert.doesNotMatch(route, /position:(?:fixed|absolute|sticky)/);
  assert.doesNotMatch(route, /overflow:(?:auto|scroll)/);
  assert.match(summary, /min-height:44px/);
  assert.match(summary, /grid-template-columns:minmax\(0,1fr\)auto/);
  assert.match(compact(css), /@media\(max-width:680px\)[\s\S]*\.conversation-routes>summary,\.conversation-route-key,\.conversation-route-list\{grid-template-columns:minmax\(0,1fr\)/);
});

test("the concluding linguistic receipt and actor disclosures expand in normal flow", () => {
  const receipt = compact(cssBlock(".language-receipt"));
  const receiptSummary = compact(cssBlock(".language-receipt>summary"));
  const actor = compact(cssBlock(".language-profile"));
  const actorSummary = compact(cssBlock(".language-profile>summary"));
  assert.match(page, /<details className="language-receipt"><summary><span>Registers and assumptions<\/span>/);
  assert.doesNotMatch(receipt, /position:(?:fixed|absolute|sticky)/);
  assert.doesNotMatch(receipt, /overflow:(?:auto|scroll|hidden)/);
  assert.doesNotMatch(actor, /position:(?:fixed|absolute|sticky)/);
  assert.doesNotMatch(actor, /overflow:(?:auto|scroll|hidden)/);
  assert.match(receiptSummary, /min-height:44px/);
  assert.match(actorSummary, /min-height:54px/);
  assert.match(receiptSummary, /grid-template-columns:minmax\(0,1fr\)auto/);
  assert.match(compact(css), /@media\(max-width:680px\)[\s\S]*\.language-receipt>summary,\.language-profile-list,\.language-profile>summary,\.language-profile-body,\.language-model-comparison\{grid-template-columns:minmax\(0,1fr\)/);
  assert.match(compact(css), /@media\(forced-colors:active\)[\s\S]*\.language-receipt,\.language-profile,\.language-profile-body>section,\.language-model-comparison>article\{border:1pxsolidCanvasText\}/);
});
