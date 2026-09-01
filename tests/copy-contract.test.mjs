import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

import { generateScenarioPack } from "../app/scenario-generator.ts";
import {
  advanceNightTo,
  applyNightChoice,
  choiceAccess,
  createNightState,
  enterNightRoom,
  isNightComplete,
  isSceneDue,
  roomIncomingEvents,
  sceneArrivalOffset,
  validateNightState,
  visibleCrossingCopy,
} from "../app/night-engine.ts";

const root = path.resolve(import.meta.dirname, "..");
const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
const generatedPacks = Array.from({ length: 12 }, (_, seed) => generateScenarioPack(seed));

let debriefModulePromise;
let debriefInternalsPromise;

function loadDebriefModule() {
  debriefModulePromise ??= import(pathToFileURL(path.join(root, "app/debrief-copy.ts")).href)
    .then((module) => ({ module, error: null }))
    .catch((error) => ({ module: null, error }));
  return debriefModulePromise;
}

async function debriefBuilders() {
  const loaded = await loadDebriefModule();
  assert.equal(
    loaded.error,
    null,
    `app/debrief-copy.ts must export the pure conclusion builders: ${loaded.error?.message ?? "missing module"}`,
  );
  assert.equal(typeof loaded.module.buildNaturalizedSummary, "function", "missing buildNaturalizedSummary(pack, state)");
  assert.equal(typeof loaded.module.buildConceptReceipt, "function", "missing buildConceptReceipt(pack, state)");
  return loaded.module;
}

async function debriefInternals() {
  debriefInternalsPromise ??= readFile(path.join(root, "app/debrief-copy.ts"), "utf8")
    .then((source) => source
      .replaceAll(
        'from "./scenario-generator.ts"',
        `from "${pathToFileURL(path.join(root, "app/scenario-generator.ts")).href}"`,
      )
      .replaceAll(
        'from "./night-engine.ts"',
        `from "${pathToFileURL(path.join(root, "app/night-engine.ts")).href}"`,
      ))
    .then((source) => stripTypeScriptTypes(
      `${source}\nexport { residueAtoms as __testResidueAtoms, strongestAfterimage as __testStrongestAfterimage };\n`,
      { mode: "strip" },
    ))
    .then((source) => import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`));
  const loaded = await debriefInternalsPromise;
  assert.equal(typeof loaded.__testResidueAtoms, "function", "missing targeted residue realization hook");
  assert.equal(typeof loaded.__testStrongestAfterimage, "function", "missing strongest-afterimage selection hook");
  return loaded;
}

function words(value) {
  return String(value).trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

function sentences(value) {
  return String(value)
    .split(/(?<=[.!?])\s+(?=[“"'A-Z0-9])/u)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeSentence(value) {
  return String(value)
    .toLocaleLowerCase("en-US")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function contentOverlap(left, right) {
  const stopWords = new Set(["about", "after", "again", "also", "because", "before", "from", "into", "only", "over", "same", "that", "their", "there", "these", "this", "those", "under", "while", "with"]);
  const tokens = (value) => new Set(words(value).map((token) => token.toLocaleLowerCase("en-US"))
    .filter((token) => token.length > 3 && !stopWords.has(token)));
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  const shorter = Math.min(leftTokens.size, rightTokens.size);
  if (shorter < 3) return normalizeSentence(left) === normalizeSentence(right) ? 1 : 0;
  return [...leftTokens].filter((token) => rightTokens.has(token)).length / shorter;
}

function flattenedText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(flattenedText).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(flattenedText).join(" ");
  return "";
}

function summaryParagraphs(summary) {
  if (typeof summary === "string") return [summary];
  if (Array.isArray(summary)) return summary;
  if (summary && Array.isArray(summary.paragraphs)) return summary.paragraphs;
  assert.fail("buildNaturalizedSummary must return prose or an object with a paragraphs array");
}

function conceptItems(receipt) {
  if (Array.isArray(receipt)) return receipt;
  if (receipt && Array.isArray(receipt.concepts)) return receipt.concepts;
  assert.fail("buildConceptReceipt must return concept items or an object with a concepts array");
}

function conceptTerm(item) {
  return String(item.term ?? item.id ?? item.label ?? "").trim();
}

function conceptPlainCopy(item) {
  return String(item.plain ?? item.plainDefinition ?? item.explanation ?? item.copy ?? "").trim();
}

function conceptStatus(item) {
  return item.evidenceStatus ?? item.status;
}

function conceptSceneIds(item) {
  return item.sceneIds ?? item.evidence?.sceneIds ?? [];
}

function conceptDecisionIds(item) {
  return item.decisionIds ?? item.evidence?.decisionIds ?? [];
}

function conceptEffectEventIds(item) {
  return item.effectEventIds ?? item.eventIds ?? item.evidence?.effectEventIds ?? [];
}

function conceptItemByTerm(receipt, term) {
  return conceptItems(receipt).find((item) => conceptTerm(item) === term);
}

function receiptMatchesAuthoredRule(rule, effect, eventKind) {
  if (rule.event === "decision" && eventKind !== "choice") return false;
  if (effect.scope !== rule.scope) return false;
  if ("semantic" in rule && effect.semantic !== rule.semantic) return false;
  if ("mechanism" in rule && rule.mechanism && effect.mechanism !== rule.mechanism) return false;
  if (rule.kind === "receipt-field") {
    if (rule.field === "selectedCarriage") return effect.selectedCarriage === true;
    if (rule.field === "backgroundReach") return effect.backgroundReach > 0;
    return effect.avoidedReach > 0;
  }
  const value = effect.metrics[rule.metric] ?? 0;
  return rule.direction === "increase" ? value > 0 : value !== 0;
}

function summarySources(summary) {
  assert.ok(summary && typeof summary === "object" && Array.isArray(summary.sources), "naturalized summary must expose inspectable sources");
  return summary.sources;
}

function summaryAtoms(summary) {
  assert.ok(summary && typeof summary === "object" && Array.isArray(summary.atoms), "naturalized summary must expose inspectable narrative atoms");
  return summary.atoms;
}

function acceptedChoice(pack, decision) {
  const scenario = pack.scenarios.find((candidate) => candidate.id === decision.sourceScenarioId);
  const scene = scenario?.scenes.find((candidate) => candidate.id === decision.sourceSceneId);
  return scene?.choices.find((candidate) => candidate.id === decision.choiceId);
}

function mapPackChoices(pack, mapper) {
  return {
    ...pack,
    scenarios: pack.scenarios.map((scenario) => ({
      ...scenario,
      scenes: scenario.scenes.map((scene) => ({
        ...scene,
        choices: scene.choices.map((choice) => mapper({ ...choice }, scene, scenario)),
      })),
    })),
  };
}

function leadingFragment(value, maximumWords = 4) {
  return normalizeSentence(words(value).slice(0, maximumWords).join(" "));
}

function playCompletedNight(seed, policy) {
  const pack = generateScenarioPack(seed);
  return playCompletedPack(pack, policy);
}

function findCompletedNightFixture(predicate, {
  description = "completed-night fixture",
  policies = ["floor", "contrast"],
  seedLimit = 256,
} = {}) {
  for (let seed = 0; seed < seedLimit; seed += 1) {
    for (const policy of policies) {
      const played = playCompletedNight(seed, policy);
      if (predicate(played)) return { ...played, policy };
    }
  }
  assert.fail(`${description} was not found in seeds 0-${seedLimit - 1}`);
}

function playCompletedPack(pack, policy) {
  let state = createNightState(pack);
  for (const scenario of pack.scenarios) state = enterNightRoom(state, scenario.id);

  for (let guard = 0; guard < 300 && !isNightComplete(state); guard += 1) {
    let chosen = false;
    for (const scenario of pack.scenarios) {
      const room = state.rooms[scenario.id];
      if (room.completed || !isSceneDue(pack, state, scenario.id)) continue;
      const scene = scenario.scenes[room.sceneIndex];
      const available = scene.choices.filter((choice) => !choiceAccess(choice, room).locked);
      const floor = available.find((choice) => choice.ethicsTags.includes("non-amplification-floor"));
      const choice = policy === "floor"
        ? floor
        : [...available].reverse().find((candidate) => !candidate.ethicsTags.includes("non-amplification-floor")) ?? floor;
      assert.ok(choice, `no accepted ${policy} choice for ${scene.id}`);
      const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
      assert.notEqual(next, state, `accepted choice did not advance ${scene.id}`);
      state = next;
      chosen = true;
      break;
    }
    if (chosen) continue;

    const arrivals = pack.scenarios
      .filter((scenario) => !state.rooms[scenario.id].completed)
      .map((scenario) => sceneArrivalOffset(pack, scenario.id, state.rooms[scenario.id].sceneIndex))
      .filter((minute) => minute > state.elapsedMinutes)
      .sort((left, right) => left - right);
    assert.ok(arrivals.length, `night stalled at ${state.elapsedMinutes} minutes`);
    state = advanceNightTo(pack, state, arrivals[0]);
  }

  assert.ok(isNightComplete(state), `seed ${pack.seed} did not reach the conclusion`);
  assert.equal(state.decisions.length, 24);
  assert.deepEqual(validateNightState(pack, state), []);
  return { pack, state };
}

function replayRecordedChoices(pack, recorded) {
  let state = createNightState(pack);
  for (const decision of recorded.decisions) {
    const scenario = pack.scenarios.find((candidate) => candidate.id === decision.sourceScenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === decision.sourceSceneId);
    const choice = scene?.choices.find((candidate) => candidate.id === decision.choiceId);
    assert.ok(scenario && scene && choice, `cannot replay ${decision.id}`);
    state = advanceNightTo(pack, state, decision.atMinute - choice.minutes);
    state = enterNightRoom(state, scenario.id);
    state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  }
  state = advanceNightTo(pack, state, recorded.elapsedMinutes);
  for (const scenario of pack.scenarios) {
    if (recorded.rooms[scenario.id]?.entered) state = enterNightRoom(state, scenario.id);
  }
  assert.deepEqual(validateNightState(pack, state), []);
  return state;
}

function functionSource(name) {
  const start = page.indexOf(`function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextFunction = /\nfunction [A-Za-z0-9_]+/.exec(page.slice(start + 1));
  const end = nextFunction ? start + 1 + nextFunction.index : page.length;
  return page.slice(start, end);
}

test("active artifacts contain the public event, not the private misrepresentation ledger", () => {
  for (const pack of generatedPacks) {
    for (const scenario of pack.scenarios) {
      const privateLedger = scenario.communicationModel.misrepresentation;
      const forbiddenExact = [
        privateLedger.knownRecord,
        privateLedger.alteredAccount,
        privateLedger.audienceCost,
        privateLedger.correctionDuty,
        privateLedger.incentiveIntersection.combinedMotive,
      ].filter(Boolean);
      for (const scene of scenario.scenes) {
        const artifact = scene.artifactCopy ?? "";
        for (const privateCopy of forbiddenExact) {
          assert.ok(
            !artifact.includes(privateCopy),
            `${scene.id} exposes a private misrepresentation/correction record inside artifactCopy`,
          );
        }
        assert.doesNotMatch(
          artifact,
          /privately,? this seat knows|a knowingly altered account is available|if accepted,? the altered account protects|because the departure is deliberate|repair must name what this seat knew|perform forgiveness or prove a motive/i,
          `${scene.id} turns private authored interior or correction duty into a visible artifact`,
        );
      }
    }
  }
});

test("TruthLedger remains a factual ledger rather than an interior, incentive, or duty ledger", () => {
  for (const pack of generatedPacks) {
    for (const scenario of pack.scenarios) {
      const truthText = Object.values(scenario.truth).join(" ");
      const privateLedger = scenario.communicationModel.misrepresentation;
      for (const privateCopy of [
        privateLedger.alteredAccount,
        privateLedger.audienceCost,
        privateLedger.correctionDuty,
        ...Object.values(privateLedger.incentiveIntersection).filter((value) => typeof value === "string"),
      ]) {
        assert.ok(!truthText.includes(privateCopy), `${scenario.id} merges the analytic/private ledger into TruthLedger`);
      }
      assert.doesNotMatch(
        truthText,
        /privately,? this seat knows|knowingly altered account|protects this seat|protects the (?:friend|family|client|staff|collaborator)|competes for|repair must|correction duty|perform forgiveness|professional tier is the natural source|governing class/i,
        `${scenario.id} TruthLedger contains motive, class-story, competition, or correction-duty analysis`,
      );
      assert.deepEqual(
        Object.keys(scenario.truth).sort(),
        ["knownFact", "laterResolution", "unresolvedAtEntry"],
        `${scenario.id} lets a circulating claim enter TruthLedger`,
      );
      assert.equal(new Set(Object.values(scenario.truth)).size, 3, `${scenario.id} collapsed two factual states together`);
      assert.ok(!Object.values(scenario.truth).includes(scenario.propagation.circulatingFrame), `${scenario.id} treats its circulating frame as truth`);
      assert.equal(scenario.scenes[1].artifactCopy, scenario.propagation.circulatingFrame);
      for (const [field, copy] of Object.entries(scenario.truth)) {
        assert.ok(words(copy).length <= 85, `${scenario.id}.${field} exceeds the factual-ledger length bound`);
        assert.ok(sentences(copy).length <= 3, `${scenario.id}.${field} reads as an explanatory mini-essay`);
      }
    }
  }
});

test("the completed-night view is one naturalized state-derived summary followed by a separate concept receipt", () => {
  const debrief = functionSource("NightDebrief");
  assert.match(debrief, /className=["'][^"']*naturalized-summary[^"']*["']/);
  assert.match(debrief, /buildNaturalizedSummary\(\s*pack\s*,\s*state\s*\)|<NaturalizedSummary[^>]*\bpack=\{pack\}[^>]*\bstate=\{state\}/s);
  assert.match(debrief, /className=["'][^"']*plain-concept-receipt[^"']*["']/);
  assert.match(debrief, /buildConceptReceipt\(\s*pack\s*,\s*state\s*\)|<PlainConceptReceipt[^>]*\bpack=\{pack\}[^>]*\bstate=\{state\}/s);
  assert.ok(debrief.indexOf("naturalized-summary") < debrief.indexOf("plain-concept-receipt"), "concept copy must follow, not interrupt, the natural summary");
  assert.doesNotMatch(debrief, /role="tablist"|role="tab"|role="tabpanel"|const tabs:|<HouseReceipt|<ChoiceReceipt|<InterpretationReceipt|<CrossingReceipt|<FatigueReceipt|<PracticeReceipt|<HeartReceipt/);
});

test("the review separates the played story, status key, evidence, and fiction boundary", () => {
  const debrief = functionSource("NightDebrief");
  assert.match(debrief, /What the house kept moving\./);
  assert.match(debrief, /THE PLAYED NIGHT/);
  assert.match(debrief, /By closing time/);
  assert.match(debrief, /These labels describe what the night recorded, not your beliefs, motives, or character\./);
  assert.match(debrief, /<dl className="concept-status-key">/);
  for (const label of ["Played", "Experienced", "Encountered"]) assert.match(page, new RegExp(`label: "${label}"`));
  for (const gloss of ["Selected action:", "Recorded effect:", "Seen in scene:"]) assert.match(page, new RegExp(gloss));
  assert.match(page, /a chosen move matched the concept\. This does not mean its intended effect followed\./);
  assert.match(page, /something moved, changed, or was held back\. It does not mean you chose or agreed with it\./);
  assert.match(page, /no matching chosen action or change was recorded in this night\./);
  assert.match(debrief, /<strong>Why this appears:<\/strong>\{["'] ["']\}/);
  assert.match(debrief, /<strong>Keep in mind:<\/strong>\{["'] ["']\}/);
  assert.match(debrief, /\{concept\.term\}\{["'] ["']\}<small>— \{concept\.gloss\}<\/small>/);
  assert.doesNotMatch(debrief, /From the first choice|simulation record|generated night/i);
  assert.ok(debrief.indexOf("model-limit") < debrief.indexOf("plain-concept-receipt"), "the operative model boundary must precede interpretation");
});

test("completed-night copy stays inside the house and keeps technical narrator language out", async () => {
  const debrief = functionSource("NightDebrief");
  const persistentHeader = functionSource("HouseHeader");
  const statusKeySource = page.slice(page.indexOf("const CONCEPT_STATUS_COPY"), page.indexOf("const FATIGUE_COPY"));
  assert.doesNotMatch(debrief, /\b(?:simulat\w*|generated|the game|engine|runtime|player|authored)\b/i);
  assert.doesNotMatch(persistentHeader, /\b(?:simulat\w*|generated|the game|engine|runtime|player|authored)\b/i);
  assert.doesNotMatch(statusKeySource, /\b(?:simulat\w*|model\w*|generated|the game|engine|runtime|player|authored)\b/i);
  assert.match(persistentHeader, /social trust fiction/i);
  assert.match(debrief, /aria-label="Fiction boundary"/);

  const { buildNaturalizedSummary, buildConceptReceipt, DEBRIEF_MODEL_LIMIT } = await debriefBuilders();
  assert.match(DEBRIEF_MODEL_LIMIT, /^CHORUS is fiction\./);
  assert.doesNotMatch(DEBRIEF_MODEL_LIMIT, /\bsimulat\w*\b/i);
  for (let seed = 0; seed < 96; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "floor" : "contrast");
    const visibleCopy = [
      ...summaryParagraphs(buildNaturalizedSummary(pack, state)),
      ...conceptItems(buildConceptReceipt(pack, state)).flatMap((item) => [
        conceptTerm(item),
        conceptPlainCopy(item),
        item.evidence.copy,
        item.limit,
      ]),
      DEBRIEF_MODEL_LIMIT,
    ].join(" ");
    assert.doesNotMatch(visibleCopy, /\b(?:simulat\w*|model\w*|generated|the game|engine|runtime|player|authored)\b/i, `seed ${seed} breaks the in-world narrator position`);
  }
});

test("the naturalized summary changes with the played state without becoming a concept taxonomy", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const floor = playCompletedNight(0x43484f52, "floor");
  const contrast = playCompletedNight(0x43484f52, "contrast");
  const first = buildNaturalizedSummary(floor.pack, floor.state);
  const replay = buildNaturalizedSummary(floor.pack, floor.state);
  const other = buildNaturalizedSummary(contrast.pack, contrast.state);
  assert.deepEqual(replay, first, "the same completed ledger must produce the same summary");
  assert.notDeepEqual(other, first, "the summary is generic rather than derived from accepted choices");

  if (first && typeof first === "object" && !Array.isArray(first)) {
    for (const legacyKey of ["house", "choices", "interpretation", "crossings", "fatigue", "practice", "heart", "tabs", "sections", "concepts"]) {
      assert.equal(legacyKey in first, false, `naturalized summary still exposes the ${legacyKey} taxonomy`);
    }
  }
  const paragraphs = summaryParagraphs(first);
  assert.ok(paragraphs.length >= 2 && paragraphs.length <= 7, "the summary must breathe as bounded prose, not one wall or seven ledgers");
  for (const paragraph of paragraphs) {
    assert.equal(typeof paragraph, "string");
    assert.ok(words(paragraph).length >= 5 && words(paragraph).length <= 95, "summary paragraph violates the atomized prose bound");
    assert.ok(sentences(paragraph).every((sentence) => words(sentence).length <= 45), "summary contains a sentence longer than the atomization bound");
    assert.doesNotMatch(paragraph, /^(?:house|choices|interpretation|crossings|fatigue|practice|the heart)\s*:/i);
  }
});

test("naturalized summaries vary in causal shape instead of filling one hidden template", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const signatures = new Map();
  for (let seed = 0; seed < 30; seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const summary = buildNaturalizedSummary(pack, state);
      const paragraphs = summaryParagraphs(summary);
      const sources = summarySources(summary);
      const opening = /^At\b/.test(paragraphs[0])
        ? "choice-first"
        : /began from this record/i.test(paragraphs[0])
          ? "bounded-record-first"
          : "fact-first";
      const closing = /^The later record\b/.test(paragraphs.at(-1))
        ? "bounded-close"
        : /^By the later record\b/.test(paragraphs.at(-1))
          ? "resolution-first"
          : /That was the later record\b/.test(paragraphs.at(-1))
            ? "record-after-fact"
            : "room-first";
      const routes = sources.filter((source) => source.kind === "route").map((source) => [
        source.classification,
        source.selectedPathCarriage ? "selected" : source.backgroundReach > 0 ? "background" : source.avoidedReach > 0 ? "avoided" : "metric-only",
      ]);
      const decisionSources = new Set(sources.filter((source) => source.kind === "decision").map((source) => source.decisionId));
      const narratedLastResorts = state.decisions.filter((decision) => decision.lastResort && decisionSources.has(decision.id)).length;
      const afterimage = sources.find((source) => source.kind === "room-afterimage");
      const signature = JSON.stringify({
        opening,
        closing,
        routes,
        paragraphCount: paragraphs.length,
        sentenceCounts: paragraphs.map((paragraph) => sentences(paragraph).length),
        narratedLastResorts,
        residueFamily: afterimage?.metric ?? "none",
      });
      signatures.set(signature, (signatures.get(signature) ?? 0) + 1);
    }
  }
  const largestBucket = Math.max(...signatures.values());
  assert.ok(signatures.size >= 20, `only ${signatures.size} causal summary shapes appeared across 60 nights`);
  assert.ok(largestBucket <= 12, `${largestBucket}/60 summaries collapsed into one structural template`);
});

test("plain concept receipt is deduplicated from encountered SceneLessons and carries honest evidence status", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  const { pack, state } = playCompletedNight(0x43484f52, "floor");
  const receipt = conceptItems(buildConceptReceipt(pack, state));
  const decisionsById = new Set(state.decisions.map((decision) => decision.id));
  const scenesByTerm = new Map();
  for (const decision of state.decisions) {
    const scenario = pack.scenarios.find((candidate) => candidate.id === decision.sourceScenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === decision.sourceSceneId);
    assert.ok(scene);
    const sceneIds = scenesByTerm.get(scene.lesson.term) ?? new Set();
    sceneIds.add(scene.id);
    scenesByTerm.set(scene.lesson.term, sceneIds);
  }

  for (const [term, expectedSceneIds] of scenesByTerm) {
    const matches = receipt.filter((item) => conceptTerm(item).toLocaleLowerCase("en-US") === term.toLocaleLowerCase("en-US"));
    assert.equal(matches.length, 1, `${term} must appear once after repeated encounters`);
    const item = matches[0];
    const plain = conceptPlainCopy(item);
    const gloss = String(item.gloss ?? "").trim();
    const limit = String(item.limit ?? "").trim();
    assert.ok(gloss.length > 0, `${term} lacks a plain-language subtitle`);
    assert.ok(words(gloss).length <= 6, `${term} subtitle is not glanceable`);
    assert.ok(plain.length > 0, `${term} lacks a plain-language explanation`);
    assert.ok(words(plain).length <= 55, `${term} explanation is not plain and bounded`);
    assert.ok(sentences(plain).length >= 1 && sentences(plain).length <= 3, `${term} explanation is not atomized`);
    assert.match(String(conceptStatus(item)), /^(?:encountered|experienced|played)$/);
    assert.ok(words(limit).length >= 5 && words(limit).length <= 24, `${term} limit is not a short plain-language boundary`);
    assert.ok(sentences(limit).every((sentence) => words(sentence).length <= 18), `${term} limit overloads one sentence`);
    assert.doesNotMatch(limit, /Evidence here would require|modeled (?:result|effect|change)|background circulation|reaction pressure/i);
    if (term === "market value") {
      assert.match(limit, /attention can serve another goal/i);
      assert.match(limit, /without .+ proving anyone's motive/i);
    }
    if (term === "status capital") {
      assert.match(limit, /visible support can protect standing/i);
      assert.match(limit, /without proving anyone's motive/i);
    }
    assert.ok(conceptSceneIds(item).some((id) => expectedSceneIds.has(id)), `${term} has no evidence from an encountered scene`);
    if (conceptStatus(item) === "played") {
      assert.ok(conceptDecisionIds(item).length > 0, `${term} says played without a decision receipt`);
      assert.ok(conceptDecisionIds(item).every((id) => decisionsById.has(id)), `${term} cites an unplayed decision`);
      assert.equal(item.evidence?.kind, "action", `${term} hides played evidence behind an opaque count`);
      assert.ok(conceptDecisionIds(item).includes(item.evidence?.decisionId), `${term} visible action evidence is not in decisionIds`);
      assert.doesNotMatch(item.evidence?.copy ?? "", /listed separately/i, `${term} promises an effect list the card does not render`);
      assert.match(item.evidence?.copy ?? "", /^At .+, the .+ chose “.+”\./i, `${term} does not name the room, chosen action, and acting role`);
    } else if (conceptStatus(item) === "experienced") {
      assert.equal(item.evidence?.kind, "effect", `${term} hides experienced evidence behind an opaque count`);
      assert.ok(conceptEffectEventIds(item).includes(item.evidence?.effectEventId), `${term} visible effect evidence is not in effectEventIds`);
    } else {
      assert.equal(item.evidence?.kind, "scene", `${term} lacks concrete encountered-scene evidence`);
      assert.ok(conceptSceneIds(item).includes(item.evidence?.sceneId), `${term} visible scene evidence is not in sceneIds`);
    }
    assert.ok(words(item.evidence?.copy ?? "").length >= 8, `${term} visible evidence is not a concrete plain sentence`);
    assert.doesNotMatch(
      plain,
      /interpretiveGap|threadFocus|prosocialOrientation|abstract_bad_actor|sourceWork|frameworkMoves|linguisticEncounter|cross-coalition-code-convergence/,
      `${term} leaks an internal model name into plain copy`,
    );
  }
  assert.equal(new Set(receipt.map((item) => conceptTerm(item).toLocaleLowerCase("en-US"))).size, receipt.length, "concept receipt contains duplicate cards");
});

test("encountered, experienced, and played remain reachable evidence states", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  const statuses = new Set();
  for (let seed = 0; seed < 4; seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      for (const item of conceptItems(buildConceptReceipt(pack, state))) {
        statuses.add(conceptStatus(item));
      }
    }
  }
  assert.deepEqual(statuses, new Set(["encountered", "experienced", "played"]));
});

test("concept cards remain plain after room names and exact choice labels are included", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  const repeatedBoilerplate = /Evidence here would require|This records the selected action only|does not claim what happened afterward|modeled (?:result|effect|change)|net change after the room's bounds|background exposure/i;
  for (let seed = 0; seed < 24; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "floor" : "contrast");
    const cards = conceptItems(buildConceptReceipt(pack, state));
    const evidenceSentences = [];
    for (const card of cards) {
      assert.doesNotMatch(`${card.plain} ${card.limit} ${card.evidence.copy}`, repeatedBoilerplate, `${card.term} exposes proof-register boilerplate`);
      assert.ok(words(card.plain).length <= 22, `${card.term} definition exceeds the plain-copy bound`);
      assert.ok(words(card.limit).length <= 24, `${card.term} limit exceeds the plain-copy bound`);
      for (const sentence of sentences(card.evidence.copy)) {
        assert.ok(words(sentence).length <= 32, `${card.term} evidence overloads one sentence: ${sentence}`);
        evidenceSentences.push(normalizeSentence(sentence));
      }
    }
    assert.equal(new Set(evidenceSentences).size, evidenceSentences.length, `seed ${seed} repeats evidence boilerplate across cards`);
  }
});

test("concept status follows authored bindings and rules, never persuasive-looking prose", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  for (const policy of ["floor", "contrast"]) {
    for (let seed = 0; seed < 4; seed += 1) {
      const { pack, state } = playCompletedNight(seed, policy);
      const baseline = conceptItems(buildConceptReceipt(pack, state));
      const prosePack = mapPackChoices(pack, (choice) => ({
        ...choice,
        label: "Repair trusted market status signal through verified source context",
        detail: "This copy claims correction, trust, saturation, status, market value, and signaling in plain words.",
        intent: "repair trust status market correction saturation",
        signal: "trusted verified public repair signal",
        ethicsTags: [...new Set([...choice.ethicsTags, "repair", "trust", "market-value", "status", "signaling", "saturation"])],
      }));
      const proseState = replayRecordedChoices(prosePack, state);
      const mutated = conceptItems(buildConceptReceipt(prosePack, proseState));
      assert.deepEqual(
        mutated.map((item) => [conceptTerm(item), conceptStatus(item), conceptDecisionIds(item), conceptEffectEventIds(item)]),
        baseline.map((item) => [conceptTerm(item), conceptStatus(item), conceptDecisionIds(item), conceptEffectEventIds(item)]),
        `seed ${seed} ${policy} let label, detail, intent, signal, or tag prose classify a concept`,
      );
    }
  }
});

test("played and experienced concept provenance remain independent", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  let checkedPlayed = false;
  let checkedEncountered = false;

  for (let seed = 0; seed < 8 && (!checkedPlayed || !checkedEncountered); seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const baseline = conceptItems(buildConceptReceipt(pack, state));

      const played = baseline.find((item) => conceptStatus(item) === "played");
      if (played && !checkedPlayed) {
        const term = conceptTerm(played);
        const selectedIds = new Set(state.decisions.map((decision) => decision.choiceId));
        const withoutBindings = mapPackChoices(pack, (choice, scene) => ({
          ...choice,
          conceptPlays: scene.lesson.term === term && selectedIds.has(choice.id)
            ? choice.conceptPlays.filter((binding) => binding.term !== term)
            : choice.conceptPlays,
        }));
        const demoted = conceptItemByTerm(buildConceptReceipt(withoutBindings, state), term);
        assert.notEqual(conceptStatus(demoted), "played", `${term} stayed played after its selected authored bindings were removed`);
        assert.deepEqual(conceptDecisionIds(demoted), [], `${term} kept played decision IDs after its bindings were removed`);

        const actionOnlyPack = {
          ...pack,
          scenarios: pack.scenarios.map((scenario) => ({
            ...scenario,
            scenes: scenario.scenes.map((scene) => ({
              ...scene,
              lesson: scene.lesson.term === term
                ? { ...scene.lesson, experienceRules: scene.lesson.experienceRules.filter((rule) => rule.term !== term) }
                : scene.lesson,
            })),
          })),
        };
        const actionOnly = conceptItemByTerm(buildConceptReceipt(actionOnlyPack, state), term);
        assert.equal(conceptStatus(actionOnly), "played", `${term} lost its selected-action status when receipt evidence was removed`);
        assert.ok(conceptDecisionIds(actionOnly).length > 0, `${term} lost its selected decision provenance`);
        assert.deepEqual(conceptEffectEventIds(actionOnly), [], `${term} invented effect-event provenance for an action-only play`);
        assert.doesNotMatch(actionOnly.evidence?.copy ?? "", /\b(?:carried|reached|increased|changed|added)\b/i, `${term} action evidence invents a realized downstream effect`);
        assert.match(actionOnly.evidence?.copy ?? "", /\b(?:chose|designed|aimed|meant)\b/i, `${term} action evidence does not stay at choice, capability, or intent`);
        checkedPlayed = true;
      }

      const encountered = baseline.find((item) => conceptStatus(item) === "encountered");
      if (encountered && !checkedEncountered) {
        const relevantScenes = new Set(conceptSceneIds(encountered));
        const authoredMetrics = new Set(pack.scenarios.flatMap((scenario) => scenario.scenes)
          .filter((scene) => relevantScenes.has(scene.id))
          .flatMap((scene) => scene.lesson.experienceRules)
          .flatMap((rule) => rule.kind === "metric" ? [rule.metric] : []));
        const unrelatedObserved = [...state.decisions, ...state.ambientEvents]
          .filter((event) => relevantScenes.has(event.sourceSceneId))
          .flatMap((event) => event.effects)
          .some((effect) => Object.entries(effect.metrics)
            .some(([metric, value]) => value !== 0 && !authoredMetrics.has(metric)));
        assert.ok(unrelatedObserved, "encountered fixture lacks an unrelated nonzero receipt metric");
        const unchanged = conceptItemByTerm(buildConceptReceipt(pack, state), conceptTerm(encountered));
        assert.equal(conceptStatus(unchanged), "encountered", `${conceptTerm(encountered)} treated an unrelated nonzero metric as experience`);
        assert.deepEqual(conceptEffectEventIds(unchanged), []);
        checkedEncountered = true;
      }
    }
  }

  assert.ok(checkedPlayed, "sample did not expose a played concept binding");
  assert.ok(checkedEncountered, "sample did not expose an encountered-only concept rule");
});

test("a refusal-only path is not classified as a deliberate act the player never chose", async () => {
  const { buildNaturalizedSummary, buildConceptReceipt } = await debriefBuilders();
  const { pack, state } = playCompletedNight(0x43484f52, "floor");
  assert.ok(state.decisions.every((decision) => decision.relationalMove.misrepresentation.intentionality === "none"));
  assert.ok(state.decisions.every((decision) => {
    const scenario = pack.scenarios.find((candidate) => candidate.id === decision.sourceScenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === decision.sourceSceneId);
    return scene?.choices.find((choice) => choice.id === decision.choiceId)?.ethicsTags.includes("non-amplification-floor");
  }));
  const conclusion = `${flattenedText(buildNaturalizedSummary(pack, state))} ${flattenedText(buildConceptReceipt(pack, state))}`;
  assert.doesNotMatch(
    conclusion,
    /you (?:lied|deceived|misrepresented)|your deliberate|deliberate misrepresentation|deliberate protection|knowingly altered account|protected account/i,
    "the conclusion classified generated-but-unchosen deliberate material as the player's action",
  );
});

test("typed receipt semantics, not floor labels or explanatory prose, govern narrated carriage", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  let selectedContent = false;
  let selectedFormat = false;
  for (const policy of ["floor", "contrast"]) {
    for (let seed = 0; seed < 8; seed += 1) {
      const played = playCompletedNight(seed, policy);
      const summary = buildNaturalizedSummary(played.pack, played.state);
      for (const route of summarySources(summary).filter((source) => source.kind === "route")) {
        const decision = played.state.decisions.find((candidate) => candidate.id === route.decisionId);
        const receipt = decision?.effects.find((candidate) => candidate.linkId === route.linkId);
        const link = played.pack.night.links.find((candidate) => candidate.id === route.linkId);
        assert.ok(decision && receipt && link, `${route.linkId} lacks typed decision, receipt, or link provenance`);
        const expected = link.semantic === "content" ? "direct-content" : link.semantic === "format" ? "direct-format" : "ambient";
        assert.equal(route.classification, expected);
        assert.equal(receipt.semantic, link.semantic);
        assert.equal(route.selectedPathCarriage, receipt.selectedCarriage);
        assert.equal(route.selectedCarriageReach, receipt.selectedCarriageReach);
        if (!route.selectedPathCarriage) assert.equal(route.selectedCarriageReach, 0);
        if (route.classification === "direct-content") assert.equal(route.carrierKind, "shared-channel");
        if (route.classification === "direct-format") assert.equal(route.carrierKind, "artifact-format");
        if (route.classification === "ambient") assert.equal(route.carrierKind, undefined);
        selectedContent ||= route.classification === "direct-content" && route.selectedPathCarriage;
        selectedFormat ||= route.classification === "direct-format" && route.selectedPathCarriage;
      }

      for (const decision of played.state.decisions) {
        const choice = acceptedChoice(played.pack, decision);
        assert.ok(choice);
        if (choice.delivery.scope !== "private" && choice.delivery.scope !== "withheld") continue;
        for (const receipt of decision.effects.filter((candidate) => candidate.scope === "cross-room" && candidate.semantic !== "ambient")) {
          assert.equal(receipt.selectedCarriage, false, `${decision.id} privately traverses ${receipt.semantic}`);
          assert.equal(receipt.selectedCarriageReach, 0, `${decision.id} assigns selected carriage reach to a private action`);
          assert.equal(receipt.appliedReach, 0, `${decision.id} projects private selected reach through a direct carrier`);
        }
      }
    }
  }
  assert.ok(selectedContent, "typed selected content carriage never reaches the afterword sample");
  assert.ok(selectedFormat, "typed selected format carriage never reaches the afterword sample");
});

test("live echoes never turn a direct link or affirmative cue into unselected carriage", () => {
  const { pack, state } = playCompletedNight(16, "contrast");
  const incoming = pack.scenarios.flatMap((scenario) => roomIncomingEvents(state, scenario.id));
  const blockedDirect = incoming.find(({ event, effect }) =>
    event.kind === "choice"
    && event.label === "Publish the reactive campaign card"
    && effect.semantic === "content"
    && !effect.selectedCarriage
    && effect.backgroundReach > 0,
  );
  assert.ok(blockedDirect, "seed 16 must retain the reviewed direct-link/background-only counterexample");
  const blockedCopy = visibleCrossingCopy(blockedDirect.event, blockedDirect.effect, state, pack.scenarios);
  assert.match(blockedCopy, /background circulation/i);
  assert.match(blockedCopy, /did not carry (?:message content or form|its message content)/i);
  assert.doesNotMatch(blockedCopy, /crossing followed|carried part|carried the form|reached .+ through/i);
  assert.ok(!blockedCopy.includes(blockedDirect.effect.revealedCue), "an affirmative selected-crossing cue leaked into a background-only echo");

  for (const { event, effect } of incoming.filter(({ event }) => event.kind === "ambient")) {
    const copy = visibleCrossingCopy(event, effect, state, pack.scenarios);
    assert.match(copy, /autonomous house activity/i);
    assert.match(copy, /no (?:message content|recognizable form or message content|message content or format) crossed/i);
    assert.ok(!copy.includes(event.label), "an autonomous pulse was narrated as a selected move");
    assert.ok(!copy.includes(effect.revealedCue), "an affirmative selected-crossing cue leaked into an autonomous echo");
  }

  const summarySource = functionSource("effectSummary");
  assert.doesNotMatch(summarySource, /appliedReach\s*\+\s*effect\.backgroundReach/, "selected and background reach are merged into one visible number");
  assert.match(summarySource, /selectedCarriageReach/);
  assert.match(summarySource, /backgroundReach/);
});

test("ambient summary routes deny both content and recognizable-form carriage", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  let checkedAmbientRoute = false;
  for (let seed = 0; seed < 16; seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const summary = buildNaturalizedSummary(pack, state);
      const ambientAtoms = summaryAtoms(summary).filter((atom) =>
        atom.role === "route"
        && atom.sources.some((source) => source.kind === "route" && source.classification === "ambient"),
      );
      for (const atom of ambientAtoms) {
        assert.match(atom.text, /Neither the chosen message nor its presentation reached .+ from/i);
        assert.doesNotMatch(atom.text, /still affected/i);
        checkedAmbientRoute = true;
      }
    }
  }
  assert.ok(checkedAmbientRoute, "sample never exercised an ambient route in the natural summary");
});

test("a route can withhold the chosen message while attribution changes separately", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const routeFixture = ({ pack, state }) => summaryAtoms(buildNaturalizedSummary(pack, state)).find((candidate) => {
    const route = candidate.sources.find((source) => source.kind === "route");
    return candidate.role === "route"
      && route?.classification !== "ambient"
      && route?.selectedPathCarriage === false
      && route?.backgroundReach > 0
      && route?.mechanism === "attribution-carryover";
  });
  const played = findCompletedNightFixture(routeFixture, {
    description: "null selected carriage with separate attribution movement",
  });
  const fixture = routeFixture(played);

  assert.ok(fixture);
  assert.match(fixture.text, /(?:did not reach|kept .+ out of)/i);
  assert.match(fixture.text, /(?:shifted blame|blame shifted)/i);
  assert.doesNotMatch(fixture.text, /(?:message|presentation).{0,36}(?:caused|changed|shifted) blame|because|therefore|as a result/i);
});

test("concept effect provenance matches exact authored rules, including decision-only carriage", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  const { pack, state } = playCompletedNight(0x43484f52, "floor");
  const receipt = conceptItems(buildConceptReceipt(pack, state));
  const experienced = receipt.filter((item) => conceptStatus(item) === "experienced");
  const effectBacked = receipt.filter((item) => conceptEffectEventIds(item).length > 0);
  assert.ok(experienced.length > 0, "fixture needs concepts that were experienced without being played");
  const effectEvents = new Map([
    ...state.decisions.map((event) => [event.id, { event, eventKind: "choice" }]),
    ...state.ambientEvents.map((event) => [event.id, { event, eventKind: "ambient" }]),
  ]);
  let checkedDecisionOnlyRule = false;
  for (const item of effectBacked) {
    const eventIds = conceptEffectEventIds(item);
    assert.ok(eventIds.length > 0, `${conceptTerm(item)} says experienced without effect-event provenance`);
    for (const eventId of eventIds) {
      const entry = effectEvents.get(eventId);
      assert.ok(entry, `${conceptTerm(item)} cites ${eventId}, which is not a decision or ambient effect event`);
      const { event, eventKind } = entry;
      assert.ok(conceptSceneIds(item).includes(event.sourceSceneId), `${conceptTerm(item)} cites an effect from an unrelated scene`);
      const sourceScenario = pack.scenarios.find((scenario) => scenario.id === event.sourceScenarioId);
      const sourceScene = sourceScenario?.scenes.find((scene) => scene.id === event.sourceSceneId);
      assert.ok(sourceScene, `${conceptTerm(item)} cites an event whose authored scene is missing`);
      const authoredRules = sourceScene.lesson.term === conceptTerm(item)
        ? sourceScene.lesson.experienceRules.filter((rule) => rule.term === conceptTerm(item))
        : [];
      assert.ok(authoredRules.length > 0, `${conceptTerm(item)} cites an event without an authored experience rule`);
      const matchingRules = authoredRules.filter((rule) =>
        event.effects.some((effect) => receiptMatchesAuthoredRule(rule, effect, eventKind)),
      );
      assert.ok(
        matchingRules.length > 0,
        `${conceptTerm(item)} cites an event whose receipt matches no exact authored rule`,
      );
      if (matchingRules.some((rule) => rule.event === "decision")) checkedDecisionOnlyRule = true;
    }
  }
  assert.ok(checkedDecisionOnlyRule, "fixture never exercises an exact decision-only experience rule");
});

test("concept evidence keeps action design, ambient pressure, and net outcome distinct", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  let checkedActionWithoutCarriage = false;
  let checkedBackgroundMarket = false;
  let checkedDirectContentMarket = false;
  let checkedDirectFormatMarket = false;
  let checkedBoundedMetric = false;

  for (let seed = 0; seed < 96 && (
    !checkedActionWithoutCarriage
    || !checkedBackgroundMarket
    || !checkedDirectContentMarket
    || !checkedDirectFormatMarket
    || !checkedBoundedMetric
  ); seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      for (const item of conceptItems(buildConceptReceipt(pack, state))) {
        const copy = item.evidence?.copy ?? "";
        if (item.evidence?.kind === "action") {
          const designCopy = sentences(copy).slice(1).join(" ");
          assert.doesNotMatch(designCopy, /\b(?:carried|reached|increased|changed|added)\b/i, `${conceptTerm(item)} action evidence reports an outcome`);
          const decision = state.decisions.find((candidate) => candidate.id === item.evidence.decisionId);
          if (conceptTerm(item) === "signaling" && decision?.effects.every((effect) => !effect.selectedCarriage)) {
            checkedActionWithoutCarriage = true;
          }
        }
        if (item.evidence?.kind !== "effect") continue;
        if (conceptTerm(item) === "market value") {
          const event = [...state.decisions, ...state.ambientEvents]
            .find((candidate) => candidate.id === item.evidence.effectEventId);
          const receipt = event?.effects.find((effect) => effect.targetScenarioId === item.evidence.targetScenarioId);
          assert.ok(event && receipt, "market evidence lacks its exact effect receipt");
          assert.doesNotMatch(copy, /attention-seeking/i, "market evidence invents an actor motive");
          if (receipt.selectedCarriage) {
            assert.match(copy, /selected action/i, "realized selected carriage is rewritten as ambient pressure");
            if (receipt.semantic === "content") {
              assert.match(copy, /carried the message/i);
              checkedDirectContentMarket = true;
            } else if (receipt.semantic === "format") {
              assert.match(copy, /carried the presentation[^.]+but not the same message/i);
              checkedDirectFormatMarket = true;
            } else {
              assert.fail("selected market carriage lacks a content or format semantic");
            }
          } else {
            assert.doesNotMatch(copy, /selected action carried/i, "background movement is promoted to selected carriage");
            assert.match(copy, /Activity linked to .+ changed how much attention .+ received/i);
            if (!state.ambientEvents.some((candidate) => candidate.id === event.id)) checkedBackgroundMarket = true;
          }
        }
        if (["correction drag", "market value", "trust capital", "status capital"].includes(conceptTerm(item))) {
          assert.doesNotMatch(copy, /\b(?:proved|settled|succeeded|failed|final outcome)\b/i, `${conceptTerm(item)} promotes a recorded effect to a conclusion`);
          assert.ok(words(item.limit ?? "").length <= 24, `${conceptTerm(item)} lacks a bounded concept-specific limit`);
          checkedBoundedMetric = true;
        }
      }
    }
  }

  assert.ok(checkedActionWithoutCarriage, "sample lacked selected signaling with no realized selected carriage");
  assert.ok(checkedBackgroundMarket, "sample lacked experienced background market pressure without selected carriage");
  assert.ok(checkedDirectContentMarket, "sample lacked experienced direct-content market carriage");
  assert.ok(checkedDirectFormatMarket, "sample lacked experienced direct-format market carriage");
  assert.ok(checkedBoundedMetric, "sample lacked a bounded metric-effect receipt");
});

test("autonomous correction evidence does not invent a source-bearing update", async () => {
  const { buildConceptReceipt } = await debriefBuilders();
  const played = findCompletedNightFixture(({ pack, state }) => {
    const candidate = conceptItemByTerm(buildConceptReceipt(pack, state), "correction drag");
    return candidate
      && conceptStatus(candidate) === "experienced"
      && candidate.evidence?.kind === "effect"
      && state.ambientEvents.some((event) => event.id === candidate.evidence.effectEventId);
  }, {
    description: "autonomous correction-drag evidence",
  });
  const { pack, state } = played;
  const item = conceptItemByTerm(buildConceptReceipt(pack, state), "correction drag");
  assert.equal(conceptStatus(item), "experienced");
  assert.equal(item.evidence?.kind, "effect");
  assert.ok(
    state.ambientEvents.some((event) => event.id === item.evidence.effectEventId),
    "fixture no longer cites the autonomous correction event",
  );
  assert.match(item.evidence.copy, /Before a choice was made/i);
  assert.doesNotMatch(item.evidence.copy, /source-bearing update/i);
  assert.match(item.limit, /without undoing its earlier spread/i);
});

test("the afterword follows a chronological causal chain and integrates its residue", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  for (let seed = 0; seed < 12; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "floor" : "contrast");
    const summary = buildNaturalizedSummary(pack, state);
    const sources = summarySources(summary);
    assert.equal(
      sources.filter((source) => source.kind === "scenario-record" && ["knownFact", "unresolvedAtEntry"].includes(source.field)).length,
      0,
      `seed ${seed} substitutes scenario-entry slots for the narrated beat`,
    );
    const atoms = summaryAtoms(summary);
    const routeIndexes = atoms.flatMap((atom, index) => atom.role === "route" ? [index] : []);
    assert.ok(routeIndexes.length >= 1 && routeIndexes.length <= 2, `seed ${seed} lacks a small route chain`);
    for (const index of routeIndexes) {
      const route = atoms[index].sources.find((source) => source.kind === "route");
      const before = atoms.slice(0, index).reverse().find((atom) => atom.role === "decision")?.sources
        .find((source) => source.kind === "decision");
      const afterAtom = atoms.slice(index + 1).find((atom) => atom.role === "decision");
      const after = afterAtom?.sources.find((source) => source.kind === "decision");
      assert.ok(route && before, `seed ${seed} route is detached from its source action`);
      assert.ok(after && afterAtom, `seed ${seed} route is detached from its later receiving-room action`);
      assert.equal(route.decisionId, before.decisionId);
      assert.equal(after.scenarioId, route.targetScenarioId);
      assert.equal(afterAtom.relationToPrevious, "chronological-after");
      const beforeTurn = state.decisions.find((decision) => decision.id === before.decisionId)?.turn;
      const afterTurn = state.decisions.find((decision) => decision.id === after.decisionId)?.turn;
      assert.ok(beforeTurn < afterTurn, `seed ${seed} narrates a route backward in time`);
    }
    const finalRecord = sources.findLast((source) => source.kind === "scenario-record" && source.field === "laterResolution");
    const finalAfterimage = sources.findLast((source) => source.kind === "room-afterimage");
    const finalReflectionSource = sources.at(-1);
    assert.equal(finalRecord?.kind, "scenario-record");
    assert.equal(finalRecord?.field, "laterResolution");
    assert.equal(finalAfterimage?.kind, "room-afterimage");
    assert.equal(finalReflectionSource?.kind, "room-afterimage");
    assert.equal(finalRecord?.scenarioId, finalAfterimage?.scenarioId);
    assert.equal(finalReflectionSource?.scenarioId, finalAfterimage?.scenarioId);
    assert.equal(finalReflectionSource?.metric, finalAfterimage?.metric);
    const scenario = pack.scenarios.find((candidate) => candidate.id === finalRecord.scenarioId);
    const finalParagraph = summaryParagraphs(summary).at(-1);
    assert.ok(normalizeSentence(finalParagraph).includes(leadingFragment(scenario.truth.laterResolution)));
    assert.match(finalParagraph, /\b(?:closed|closing)\b/i);
    assert.doesNotMatch(
      summaryParagraphs(summary).join(" "),
      /In another room,|represents one of \d+ selections|selected repairs through the modeled rooms|The selected last-resort move was|The next audience could still/i,
    );
  }
});

test("summary decision and route provenance remains globally chronological across broad seeded paths", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  for (let seed = 0; seed < 128; seed += 1) {
    const policy = seed % 2 === 0 ? "floor" : "contrast";
    const { pack, state } = playCompletedNight(seed, policy);
    const summary = buildNaturalizedSummary(pack, state);
    const sources = summarySources(summary);
    const decisionSources = sources.filter((source) => source.kind === "decision");
    const turns = decisionSources.map((source) => source.turn);
    assert.deepEqual(turns, [...turns].sort((left, right) => left - right), `seed ${seed} reverses decision-source turns`);
    assert.equal(new Set(decisionSources.map((source) => source.decisionId)).size, decisionSources.length, `seed ${seed} repeats a decision source`);

    const atoms = summaryAtoms(summary);
    for (const [index, atom] of atoms.entries()) {
      if (atom.role !== "route") continue;
      const source = atom.sources.find((candidate) => candidate.kind === "route");
      const before = atoms.slice(0, index).reverse().find((candidate) => candidate.role === "decision")?.sources
        .find((candidate) => candidate.kind === "decision");
      const afterAtom = atoms.slice(index + 1).find((candidate) => candidate.role === "decision");
      const after = afterAtom?.sources.find((candidate) => candidate.kind === "decision");
      assert.ok(source && before, `seed ${seed} detaches a route from its origin`);
      assert.ok(after && afterAtom, `seed ${seed} detaches route ${source.linkId} from its receiver`);
      assert.equal(before.decisionId, source.decisionId);
      assert.equal(after.scenarioId, source.targetScenarioId);
      assert.equal(afterAtom.relationToPrevious, "chronological-after");
      assert.ok(before.turn < after.turn, `seed ${seed} routes ${source.linkId} backward`);
    }

    const explicitTurns = [...summaryParagraphs(summary).join(" ").matchAll(/\b(?:At turn|Turn) (\d+)\b/g)]
      .map((match) => Number(match[1]));
    assert.deepEqual(explicitTurns, [...explicitTurns].sort((left, right) => left - right), `seed ${seed} reverses explicit prose turns`);
    assert.doesNotMatch(
      summaryParagraphs(summary).join(" "),
      /Earlier in the night|Near closing time|answered|replied|responded|therefore|as a result/i,
      `seed ${seed} repairs order or invents a receiving-choice cause`,
    );

    const narratedIds = new Set(decisionSources.map((source) => source.decisionId));
    for (const decision of state.decisions.filter((candidate) => candidate.lastResort)) {
      assert.ok(narratedIds.has(decision.id), `seed ${seed} loses chronological provenance for ${decision.id}`);
    }
  }
});

test("Catalysis realization follows the narrated situation instead of a path-hash synonym wheel", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const source = await readFile(path.join(root, "app/debrief-copy.ts"), "utf8");
  assert.doesNotMatch(source, /cadenceIndex|stableIdentity|openingFamilies|residueFamilies|sequence\s*%/);
  const exercised = new Set();

  for (const seed of [...Array.from({ length: 96 }, (_, index) => index), 0xffffffff]) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const summary = buildNaturalizedSummary(pack, state);
      const atoms = summaryAtoms(summary);
      assert.deepEqual(buildNaturalizedSummary(pack, state), summary, `seed ${seed} ${policy} is not deterministic`);
      const paragraphs = summaryParagraphs(summary);
      const prose = paragraphs.join(" ");
      assert.doesNotMatch(prose, /This seat['’]s role carries trust/i, `seed ${seed} ${policy} lets an abstract pressure gloss displace the concrete scene`);
      const openingDecisionIndex = atoms.findIndex((atom) => atom.role === "decision");
      const openingWords = words(atoms.slice(0, openingDecisionIndex).map((atom) => atom.text).join(" ")).length;
      const lastResortDecisionIds = new Set(
        state.decisions.filter((decision) => decision.lastResort).map((decision) => decision.id),
      );
      const mandatoryLastResortWords = atoms
        .filter((atom) => atom.role === "cost" || (
          atom.role === "decision"
          && atom.sources.some((candidate) => candidate.kind === "decision" && lastResortDecisionIds.has(candidate.decisionId))
        ))
        .reduce((total, atom) => total + words(atom.text).length, 0);
      assert.ok(paragraphs.length >= 2 && paragraphs.length <= 10, `seed ${seed} ${policy} has ${paragraphs.length} summary paragraphs`);
      assert.ok(openingWords <= 72, `seed ${seed} ${policy} spends ${openingWords} words before the first choice`);
      assert.ok(
        words(prose).length - mandatoryLastResortWords <= 220,
        `seed ${seed} ${policy} grows beyond its bounded chain and mandatory last-resort units`,
      );
      for (const paragraph of paragraphs) {
        assert.ok(words(paragraph).length >= 5 && words(paragraph).length <= 95, `seed ${seed} ${policy} violates paragraph bounds`);
        assert.ok(sentences(paragraph).every((sentence) => words(sentence).length <= 38), `seed ${seed} ${policy} violates sentence bounds`);
      }

      const firstDecision = atoms.find((atom) => atom.role === "decision")?.sources
        .find((candidate) => candidate.kind === "decision");
      const openingScenario = pack.scenarios.find((candidate) => candidate.id === firstDecision?.scenarioId);
      const openingScene = openingScenario?.scenes.find((candidate) => candidate.id === firstDecision?.sceneId);
      assert.ok(openingScene, `seed ${seed} ${policy} lacks its opening scene`);
      const openingAtoms = atoms.slice(0, openingDecisionIndex);
      const openingOrder = {
        SURFACE: ["artifact", "record", "inquiry", "pressure"],
        BRIDGE: ["artifact", "pressure", "inquiry", "record"],
        CROSSOVER: ["artifact", "record", "pressure", "inquiry"],
        CORRECTION: ["record", "artifact", "inquiry", "pressure"],
      }[openingScene.act];
      const openingRanks = openingAtoms.map((atom) => openingOrder.indexOf(atom.role));
      assert.deepEqual(openingRanks, [...openingRanks].sort((left, right) => left - right), `seed ${seed} ${policy} ignores ${openingScene.act} opening motion`);
      assert.match(
        openingAtoms[0].text,
        openingScene.act === "BRIDGE" ? /^Inside / : openingScene.act === "CROSSOVER" ? /^In / : /^At /,
      );
      exercised.add(`act:${openingScene.act}`);

      const paragraphCopies = paragraphs.map(normalizeSentence);
      for (const [atomIndex, atom] of atoms.entries()) {
        assert.ok(
          paragraphCopies.some((paragraph) => paragraph.includes(normalizeSentence(atom.text))),
          `seed ${seed} ${policy} splits ${atom.role} atom ${atomIndex} across paragraphs`,
        );
        if (atom.role !== "decision") continue;
        const decisionSource = atom.sources.find((candidate) => candidate.kind === "decision");
        const decision = state.decisions.find((candidate) => candidate.id === decisionSource?.decisionId);
        if (!decision?.lastResort) continue;
        const costAtoms = atoms.slice(atomIndex + 1)
          .slice(0, atoms.slice(atomIndex + 1).findIndex((candidate) => candidate.role !== "cost") < 0
            ? undefined
            : atoms.slice(atomIndex + 1).findIndex((candidate) => candidate.role !== "cost"));
        const positions = [atom, ...costAtoms].map((candidate) => paragraphCopies.findIndex((paragraph) =>
          paragraph.includes(normalizeSentence(candidate.text)),
        ));
        assert.ok(positions.every((position) => position >= 0), `seed ${seed} ${policy} loses part of a last-resort event`);
        assert.deepEqual(positions, [...positions].sort((left, right) => left - right), `seed ${seed} ${policy} reorders a last-resort event`);
        assert.ok(Math.max(...positions) - Math.min(...positions) <= 1, `seed ${seed} ${policy} scatters a last-resort event across the review`);
      }

      for (const [atomIndex, atom] of atoms.entries()) {
        if (atom.role === "route") {
          const route = atom.sources.find((candidate) => candidate.kind === "route");
          assert.ok(route, `seed ${seed} ${policy} has route prose without typed provenance`);
          const branch = route.selectedPathCarriage
            ? route.classification
            : route.classification === "ambient"
              ? "ambient"
              : route.avoidedReach > 0
                ? "held"
                : route.backgroundReach > 0
                  ? "background"
                  : "no-crossing";
          exercised.add(branch);
          if (branch === "direct-content") {
            assert.match(atom.text, /The message from .+ reached .+ through/i);
            assert.doesNotMatch(atom.text, /presentation|same message/i);
          } else if (branch === "direct-format") {
            assert.match(atom.text, /A copy in .+ looked like the .+ from .+/i);
            assert.match(atom.text, /Its message was different/i);
          } else if (branch === "ambient") {
            assert.match(atom.text, /Neither the chosen message nor its presentation reached .+ from/i);
            assert.doesNotMatch(atom.text, /still affected/i, "ambient copy must name the modeled change");
          } else if (branch === "held") {
            assert.match(atom.text, /choice in .+ kept .+ out of/i);
          } else if (branch === "background") {
            assert.match(atom.text, /did not reach/i);
            assert.match(atom.text, /(?:overlap|accounts|circulation|workload|trust|ranking|blame|language|expectations|Separate circulation)/i);
          }
        }

        if (atom.role === "residue") {
          const afterimage = atom.sources.find((candidate) => candidate.kind === "room-afterimage");
          if (!afterimage) continue;
          assert.doesNotMatch(
            atom.text,
            /(?:posts|material|copies|account) from that room|attached to its source|spread from that room|appeared in (?:more|fewer) rooms/i,
            `${afterimage.metric} invents an outbound carrier or source from an aggregate room delta`,
          );
          exercised.add(`residue:${afterimage.metric}`);
          const rising = afterimage.atDebrief > afterimage.atCompletion;
          const expected = {
            reach: rising ? /more people saw material around that room/i : /fewer people saw material around that room/i,
            crossover: rising ? /path for material between that room and others became easier/i : /path for material between that room and others became harder/i,
            provenance: rising ? /more source context remained visible around that room/i : /less source context remained visible around that room/i,
            verification: rising ? /material around that room became easier to check/i : /material around that room became harder to check/i,
            heat: rising ? /reactions around that room grew more heated/i : /reactions around that room grew calmer/i,
            blame: rising ? /blame around that room rose/i : /blame around that room fell/i,
            belief: rising ? /account around that room drew stronger acceptance/i : /account around that room drew weaker acceptance/i,
            consensus: rising ? /account around that room appeared more widely accepted/i : /account around that room appeared less widely accepted/i,
            trust: rising ? /trust around that room rose/i : /trust around that room fell/i,
            coordination: rising ? /pressure to coordinate around that room rose/i : /pressure to coordinate around that room eased/i,
            commonGround: rising ? /(?:shared action|practical overlap visible there) became clearer/i : /(?:shared action|practical overlap visible there) became harder to see/i,
          }[afterimage.metric];
          assert.ok(expected, `missing residue realization contract for ${afterimage.metric}`);
          assert.match(atom.text, expected);
          if (afterimage.metric === "reach") assert.doesNotMatch(atom.text, /belie|agree|familiar/i);
          if (afterimage.metric === "trust") assert.doesNotMatch(atom.text, /trust in (?:the|its) (?:claim|account)/i);
          if (afterimage.metric === "coordination") assert.doesNotMatch(atom.text, /people became|able to coordinate|agreement/i);
          if (afterimage.metric === "commonGround") {
            assert.doesNotMatch(atom.text, /people shared|agreement/i);
            const scenario = pack.scenarios.find((candidate) => candidate.id === afterimage.scenarioId);
            if (scenario?.communicationModel.substantiveCommonGround) {
              assert.ok(
                normalizeSentence(atom.text).includes(leadingFragment(scenario.communicationModel.substantiveCommonGround)),
                "common-ground residue loses the incident's concrete shared action",
              );
              assert.ok(
                atom.sources.some((source) => source.kind === "communication-record"
                  && source.scenarioId === scenario.id
                  && source.field === "substantiveCommonGround"),
                "common-ground residue lacks provenance for the named shared action",
              );
            }
          }
          const reflection = atoms[atomIndex + 1];
          assert.equal(reflection?.role, "reflection", `${afterimage.metric} residue lacks its adjacent proof boundary`);
          const reflectionSource = reflection?.sources.find((candidate) => candidate.kind === "room-afterimage");
          assert.ok(reflectionSource, `${afterimage.metric} proof boundary is not sourced from the residue`);
          assert.equal(reflectionSource.scenarioId, afterimage.scenarioId);
          assert.equal(reflectionSource.metric, afterimage.metric);
          const proofBoundary = {
            reach: rising ? /Reaching more people does not show whether anyone believed the account or whether it was true/i : /Reaching fewer people does not show whether anyone believed the account or whether it was true/i,
            crossover: rising ? /An easier path for material does not show whether any particular message or belief crossed/i : /A harder path for material does not show whether any particular message or belief crossed/i,
            provenance: rising ? /More source context does not show whether any particular copy moved or stopped/i : /Less source context does not show whether any particular copy moved or stopped/i,
            verification: rising ? /More support for checking does not show whether anyone checked .+ changed a belief/i : /Less support for checking does not show whether anyone checked .+ changed a belief/i,
            heat: rising ? /More heated reactions do not establish what anyone believed .+ why they occurred/i : /Calmer reactions do not establish what anyone believed .+ why they occurred/i,
            blame: rising ? /Rising blame does not establish who was responsible/i : /Falling blame does not establish who was responsible/i,
            belief: rising ? /Stronger acceptance does not show whether the account was true/i : /Weaker acceptance does not show whether the account was true/i,
            consensus: rising ? /A wider appearance of agreement does not show whether belief was shared or whether the account was true/i : /A narrower appearance of agreement does not show whether belief was shared or whether the account was true/i,
            trust: rising ? /Rising trust does not show whether any account was true or any source was trustworthy/i : /Falling trust does not show whether any account was true or any source was trustworthy/i,
            coordination: rising ? /Rising pressure to coordinate does not show whether people agreed or shared a purpose/i : /Easing pressure to coordinate does not show whether people agreed or shared a purpose/i,
            commonGround: rising ? /Clearer shared action does not show whether people shared a motive, language, or belief/i : /Harder-to-see shared action does not show whether people shared a motive, language, or belief/i,
          }[afterimage.metric];
          assert.ok(proofBoundary, `missing proof-boundary contract for ${afterimage.metric}`);
          assert.match(reflection.text, proofBoundary);
          assert.doesNotMatch(reflection.text, /what the movement could not prove/i, "a generic aphorism replaced the residue-specific limit");
          assert.doesNotMatch(reflection.text, /^The night records/i, "the proof boundary decoratively restates the residue");
        }
      }
    }
  }

  for (const branch of ["direct-content", "direct-format", "ambient", "held", "background"]) {
    assert.ok(exercised.has(branch), `broad sample never exercised ${branch} realization`);
  }
  for (const act of ["SURFACE", "BRIDGE", "CROSSOVER", "CORRECTION"]) {
    assert.ok(exercised.has(`act:${act}`), `broad sample never exercised ${act} opening realization`);
  }
  assert.ok([...exercised].some((branch) => branch.startsWith("residue:")), "broad sample never exercised residue realization");
});

test("the after-summary lets juxtaposed scene evidence carry the inference instead of narrating its audit schema", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const auditScaffolding = /\b(?:bounded record beneath it|present pressure came from this|immediate pressure was concrete|room had a reason to act|question it could not settle was this|one inquiry remained|what stayed unresolved was this|artifact placed this before the seat|that was what the attributable update established|closing evidence narrowed the claim|selected response|selected answer|receiving room replied)\b|\b(?:came first|held the foreground)\s+at\b|\bbefore the choice at\b/i;

  for (let seed = 0; seed < 32; seed += 1) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const paragraphs = summaryParagraphs(buildNaturalizedSummary(pack, state));
      const prose = paragraphs.join(" ");
      assert.doesNotMatch(prose, auditScaffolding, `seed ${seed} ${policy} exposes its evidence schema`);
      for (const sentence of sentences(prose)) {
        assert.ok(
          words(sentence).length <= 38,
          `seed ${seed} ${policy} suspends the ending in a ${words(sentence).length}-word sentence`,
        );
      }
    }
  }
});

test("the after-summary names its routes and avoids stacked internal abstractions", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const opaque = /\b(?:trusted forms|unresolved frame|personal label|lower-access target|decision seat|decision role|cared-for working relationship|borrowed blame|blame carried from another room|recognizable form|re-enter on event facts|bounded repair|circulation kept gathering|concentrated blame|protected standing|reached for the last resort|handoff)\b/i;
  for (let seed = 0; seed < 48; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "floor" : "contrast");
    const summary = buildNaturalizedSummary(pack, state);
    const prose = summaryParagraphs(summary).join(" ");
    assert.doesNotMatch(prose, opaque, `seed ${seed} makes the reader decode internal abstraction`);
    for (const sentence of sentences(prose)) {
      assert.ok(words(sentence).length <= 32, `seed ${seed} overloads one review sentence: ${sentence}`);
    }
    for (const atom of summaryAtoms(summary).filter((candidate) => candidate.role === "route")) {
      const route = atom.sources.find((source) => source.kind === "route");
      assert.ok(route);
      const source = pack.scenarios.find((scenario) => scenario.id === route.sourceScenarioId);
      const target = pack.scenarios.find((scenario) => scenario.id === route.targetScenarioId);
      assert.ok(source && target);
      assert.match(atom.text, new RegExp(source.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `seed ${seed} route omits its source room`);
      assert.match(atom.text, new RegExp(target.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `seed ${seed} route omits its target room`);
    }
  }
});

test("after-summary grammar keeps seats as actors and closes authored punctuation once", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  for (const seed of [0, 6, 16, 74]) {
    for (const policy of ["floor", "contrast"]) {
      const { pack, state } = playCompletedNight(seed, policy);
      const prose = summaryParagraphs(buildNaturalizedSummary(pack, state)).join(" ");
      assert.doesNotMatch(prose, /[.!?](?:["'’”])?\s+[a-z]/u, `seed ${seed} ${policy} leaves a lowercase sentence start`);
      assert.doesNotMatch(prose, /[.!?]{2,}|[.!?](?:["'’”])[.?!]/u, `seed ${seed} ${policy} doubles terminal punctuation`);
      for (const scenario of pack.scenarios) {
        assert.ok(!prose.includes(`Later, ${scenario.title} chose`), `seed ${seed} ${policy} makes a room choose`);
        assert.ok(!prose.includes(`Later, ${scenario.title} reached for`), `seed ${seed} ${policy} makes a room reach`);
        for (const scene of scenario.scenes) assert.doesNotMatch(scene.reason, /public comments trusts/i);
      }
    }
  }
});

test("scene-first inquiry uses only the narrated beat's public disclosure provenance", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  let checkedCorrectionOpening = false;
  for (let seed = 0; seed < 64; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "contrast" : "floor");
    const summary = buildNaturalizedSummary(pack, state);
    const atoms = summaryAtoms(summary);
    const firstDecisionIndex = atoms.findIndex((atom) => atom.role === "decision");
    assert.ok(firstDecisionIndex >= 2, `seed ${seed} lacks public scene motion before its first decision`);
    const firstDecision = atoms[firstDecisionIndex].sources.find((source) => source.kind === "decision");
    const scenario = pack.scenarios.find((candidate) => candidate.id === firstDecision?.scenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === firstDecision?.sceneId);
    assert.ok(scenario && scene?.artifactCopy && firstDecision);
    const opening = atoms.slice(0, firstDecisionIndex);
    assert.ok(opening.some((atom) => atom.role === "artifact"), `seed ${seed} loses its narrated artifact`);
    assert.ok(opening.some((atom) => atom.sources.some((source) => source.kind === "scene-disclosure")), `seed ${seed} loses beat-local disclosure provenance`);
    assert.ok(
      !opening.some((atom) => atom.sources.some((source) => source.kind === "scenario-record")),
      `seed ${seed} substitutes scenario-entry truth for beat-local disclosure`,
    );

    for (const atom of opening) {
      for (const source of atom.sources) {
        assert.equal(source.scenarioId, scenario.id, `seed ${seed} crosses scenario provenance in its opening`);
        assert.equal(source.sceneId, scene.id, `seed ${seed} crosses beat provenance in its opening`);
        if (source.kind === "scene-record") {
          assert.ok(["artifactCopy", "reason"].includes(source.field));
          continue;
        }
        assert.equal(source.kind, "scene-disclosure", `seed ${seed} admits a non-scene source before its first decision`);
        const bucket = source.bucket === "record" ? scene.disclosure.records
          : source.bucket === "question" ? scene.disclosure.questions
            : scene.disclosure.unknowns;
        const record = bucket.find((candidate) => candidate.id === source.atomId);
        assert.ok(record, `seed ${seed} cites missing ${source.bucket} ${source.atomId}`);
        assert.equal(record.access, "public-record", `seed ${seed} cites non-public ${source.atomId}`);
        assert.ok(normalizeSentence(atom.text).includes(normalizeSentence(record.copy)), `seed ${seed} paraphrases beyond ${source.atomId}`);
      }
    }

    const openingProse = normalizeSentence(opening.map((atom) => atom.text).join(" "));
    const publicPressure = scene.reason.replace(/^because\s+/i, "").replace(/[.!?]+$/g, "");
    assert.ok(openingProse.includes(normalizeSentence(scene.artifactCopy)), `seed ${seed} drops its authored artifact`);
    if (scene.act === "CROSSOVER") {
      assert.ok(
        openingProse.includes(normalizeSentence(scenario.truth.unresolvedAtEntry)),
        `seed ${seed} names uncertainty without stating the concrete limit`,
      );
      assert.doesNotMatch(
        opening.map((atom) => atom.text).join(" "),
        /same unresolved claim|source['’]s uncertainty|which copies preserved/i,
        `seed ${seed} leaves the uncertainty as an unexplained label`,
      );
    }
    if (scene.act === "CORRECTION") {
      assert.ok(
        opening.some((atom) => atom.sources.some((source) =>
          source.kind === "scene-disclosure" && source.atomId.endsWith("-correction-record-1"),
        )),
        `seed ${seed} correction opening lacks its resolved beat record`,
      );
      assert.ok(
        openingProse.includes(normalizeSentence(scenario.truth.laterResolution)),
        `seed ${seed} correction opening drops the later resolution`,
      );
      assert.ok(
        !openingProse.includes(normalizeSentence(scenario.truth.unresolvedAtEntry)),
        `seed ${seed} correction opening reintroduces the stale entry-time unknown`,
      );
      checkedCorrectionOpening = true;
    }
    if (/^this seat['’]s role carries trust\b/i.test(publicPressure)) {
      assert.ok(!openingProse.includes(normalizeSentence(publicPressure)), `seed ${seed} retains an abstract role gloss as scene evidence`);
    } else {
      assert.ok(
        openingProse.includes(normalizeSentence(publicPressure)) || contentOverlap(publicPressure, scene.artifactCopy) >= 0.65,
        `seed ${seed} drops a distinct visible scene pressure`,
      );
    }
    const privateLedger = scenario.communicationModel.misrepresentation;
    for (const privateCopy of [
      privateLedger.alteredAccount,
      privateLedger.audienceCost,
      privateLedger.correctionDuty,
      privateLedger.incentiveIntersection.combinedMotive,
    ].filter(Boolean)) {
      assert.ok(!openingProse.includes(normalizeSentence(privateCopy)), `seed ${seed} leaks a sealed analytic field into the inquiry motion`);
    }
  }
  assert.ok(checkedCorrectionOpening, "broad sample never exercised a correction opening");

  const played = playCompletedNight(7, "contrast");
  const original = buildNaturalizedSummary(played.pack, played.state);
  const firstDecision = summaryAtoms(original).find((atom) => atom.role === "decision")?.sources
    .find((source) => source.kind === "decision");
  const unsupportedPack = {
    ...played.pack,
    scenarios: played.pack.scenarios.map((scenario) => scenario.id !== firstDecision.scenarioId
      ? scenario
      : {
          ...scenario,
          scenes: scenario.scenes.map((scene) => scene.id === firstDecision.sceneId
            ? {
                ...scene,
                artifactCopy: undefined,
                reason: "",
                disclosure: { ...scene.disclosure, records: [], questions: [], unknowns: [] },
              }
            : scene),
        }),
  };
  assert.deepEqual(validateNightState(unsupportedPack, played.state), []);
  const unsupported = buildNaturalizedSummary(unsupportedPack, played.state);
  const unsupportedSources = summarySources(unsupported);
  assert.ok(!unsupportedSources.some((source) => source.kind === "scene-record"), "unsupported scene fields still produce scene provenance");
  assert.ok(!unsupportedSources.some((source) => source.kind === "scene-disclosure"), "a missing disclosure is replaced with fabricated beat evidence");
});

test("repeated last-resort labels do not merge independent events and every cost keeps provenance", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const played = findCompletedNightFixture(({ state }) => {
    const lastResorts = state.decisions.filter((decision) => Boolean(decision.lastResort));
    return lastResorts.length >= 3
      && lastResorts.some((decision) =>
        lastResorts.filter((candidate) => candidate.choiceLabel === decision.choiceLabel).length > 1,
      );
  }, {
    description: "three last resorts with at least one repeated choice label",
    policies: ["contrast"],
  });
  const { pack, state } = played;
  const summary = buildNaturalizedSummary(pack, state);
  const narrative = normalizeSentence(summaryParagraphs(summary).join(" "));
  const lastResorts = state.decisions.filter((decision) => Boolean(decision.lastResort));
  assert.ok(lastResorts.length >= 3, "fixture must include repeated last-resort decisions");
  const sourceIds = new Set(summarySources(summary).filter((source) => source.kind === "decision").map((source) => source.decisionId));
  for (const decision of lastResorts) {
    assert.ok(sourceIds.has(decision.id), `${decision.id} lost its decision provenance`);
    for (const value of [
      decision.lastResort.protectedParty,
      decision.lastResort.positiveConsequence,
      decision.lastResort.harmedParty,
      decision.lastResort.negativeConsequence,
      decision.lastResort.selfCost.replace(/^the protagonist\s+/i, ""),
    ]) {
      assert.ok(narrative.includes(normalizeSentence(value)), `${decision.id} lost the complete cost ${value}`);
    }
  }
  const repeatedLabel = lastResorts.find((decision) =>
    lastResorts.filter((candidate) => candidate.choiceLabel === decision.choiceLabel).length > 1,
  )?.choiceLabel;
  assert.ok(repeatedLabel);
  assert.ok(lastResorts.filter((decision) => decision.choiceLabel === repeatedLabel).length > 1);
  assert.doesNotMatch(narrative, /earlier named move|move with the same name|last resort move with the same name/i);
  assert.doesNotMatch(narrative, /reached for the last resort|gives up its income|pressure around .+ kept building/i);
  assert.doesNotMatch(summaryParagraphs(summary).join(" "), /[.!?]{2,}/, "consequence copy contains doubled terminal punctuation");
});

test("every selected last resort keeps its complete split consequence, even before the chosen route chain ends", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  let lastResortCount = 0;
  for (let seed = 0; seed < 60; seed += 1) {
    const { pack, state } = playCompletedNight(seed, "contrast");
    const summary = buildNaturalizedSummary(pack, state);
    const narrative = normalizeSentence(summaryParagraphs(summary).join(" "));
    assert.equal(new Set(summaryParagraphs(summary)).size, summaryParagraphs(summary).length, `seed ${seed} repeats an exact summary paragraph`);
    const sourceIds = new Set(summarySources(summary).filter((source) => source.kind === "decision").map((source) => source.decisionId));
    assert.doesNotMatch(summaryParagraphs(summary).join(" "), /…/u, `seed ${seed} truncates a consequential clause`);
    for (const paragraph of summaryParagraphs(summary)) {
      assert.ok(words(paragraph).length <= 95, `seed ${seed} exceeds the complete-paragraph bound`);
      assert.ok(sentences(paragraph).every((sentence) => words(sentence).length <= 45), `seed ${seed} exceeds the complete-sentence bound`);
    }
    for (const decision of state.decisions.filter((candidate) => candidate.lastResort)) {
      lastResortCount += 1;
      assert.ok(sourceIds.has(decision.id), `seed ${seed} drops selected last resort ${decision.id}`);
      for (const value of [
        decision.lastResort.protectedParty,
        decision.lastResort.positiveConsequence,
        decision.lastResort.harmedParty,
        decision.lastResort.negativeConsequence,
        decision.lastResort.selfCost.replace(/^the protagonist\s+/i, ""),
      ]) {
        assert.ok(narrative.includes(normalizeSentence(value)), `seed ${seed} truncates ${decision.id}: ${value}`);
      }
    }
  }
  assert.ok(lastResortCount >= 10, "broad fixture did not exercise enough selected last-resort events");
});

test("strongest afterimages use comparable scales and do not mechanically select reach", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const publicMetrics = [
    "reach",
    "heat",
    "crossover",
    "belief",
    "consensus",
    "provenance",
    "verification",
    "trust",
    "coordination",
    "blame",
    "commonGround",
  ];
  const selectedMetrics = new Set();
  for (let seed = 0; seed < 16; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "contrast" : "floor");
    const source = summarySources(buildNaturalizedSummary(pack, state)).find((candidate) => candidate.kind === "room-afterimage");
    assert.ok(source, `seed ${seed} lacks an inspectable afterimage`);
    const scenario = pack.scenarios.find((candidate) => candidate.id === source.scenarioId);
    assert.ok(scenario);
    const expectedNormalized = Math.abs(source.atDebrief - source.atCompletion)
      / (source.metric === "reach" ? Math.max(1, scenario.audienceCeiling) : 100);
    assert.ok(Math.abs(source.normalizedChange - expectedNormalized) < 1e-9, `seed ${seed} exposes an unnormalized afterimage score`);

    const strongestAvailable = Math.max(...pack.scenarios.flatMap((candidate) => {
      const room = state.rooms[candidate.id];
      if (!room?.atCompletion) return [];
      return publicMetrics.flatMap((metric) => {
        const before = room.atCompletion[metric];
        const after = room.metrics[metric];
        if (typeof before !== "number" || typeof after !== "number" || before === after) return [];
        return [Math.abs(after - before) / (metric === "reach" ? Math.max(1, candidate.audienceCeiling) : 100)];
      });
    }));
    assert.ok(source.normalizedChange >= strongestAvailable - 1e-9, `seed ${seed} did not select the strongest scale-normalized afterimage`);
    selectedMetrics.add(source.metric);
  }
  assert.ok([...selectedMetrics].some((metric) => metric !== "reach"), "reach wins every seed mechanically despite scale normalization");
  assert.ok(selectedMetrics.size >= 2, "seeded paths do not vary the strongest afterimage");
});

test("every afterimage metric binds rising and falling copy to its exact proof boundary", async () => {
  const { __testResidueAtoms: residueAtoms } = await debriefInternals();
  const sharedAction = "compare the two records before acting";
  const realizations = {
    reach: {
      rising: [
        "more people saw material around that room.",
        "Reaching more people does not show whether anyone believed the account or whether it was true.",
      ],
      falling: [
        "fewer people saw material around that room.",
        "Reaching fewer people does not show whether anyone believed the account or whether it was true.",
      ],
    },
    crossover: {
      rising: [
        "the path for material between that room and others became easier.",
        "An easier path for material does not show whether any particular message or belief crossed.",
      ],
      falling: [
        "the path for material between that room and others became harder.",
        "A harder path for material does not show whether any particular message or belief crossed.",
      ],
    },
    provenance: {
      rising: [
        "more source context remained visible around that room.",
        "More source context does not show whether any particular copy moved or stopped.",
      ],
      falling: [
        "less source context remained visible around that room.",
        "Less source context does not show whether any particular copy moved or stopped.",
      ],
    },
    verification: {
      rising: [
        "material around that room became easier to check.",
        "More support for checking does not show whether anyone checked the account or changed a belief.",
      ],
      falling: [
        "material around that room became harder to check.",
        "Less support for checking does not show whether anyone checked the account or changed a belief.",
      ],
    },
    heat: {
      rising: [
        "reactions around that room grew more heated.",
        "More heated reactions do not establish what anyone believed or why they occurred.",
      ],
      falling: [
        "reactions around that room grew calmer.",
        "Calmer reactions do not establish what anyone believed or why they occurred.",
      ],
    },
    blame: {
      rising: [
        "blame around that room rose.",
        "Rising blame does not establish who was responsible.",
      ],
      falling: [
        "blame around that room fell.",
        "Falling blame does not establish who was responsible.",
      ],
    },
    belief: {
      rising: [
        "the account around that room drew stronger acceptance.",
        "Stronger acceptance does not show whether the account was true.",
      ],
      falling: [
        "the account around that room drew weaker acceptance.",
        "Weaker acceptance does not show whether the account was true.",
      ],
    },
    consensus: {
      rising: [
        "the account around that room appeared more widely accepted.",
        "A wider appearance of agreement does not show whether belief was shared or whether the account was true.",
      ],
      falling: [
        "the account around that room appeared less widely accepted.",
        "A narrower appearance of agreement does not show whether belief was shared or whether the account was true.",
      ],
    },
    trust: {
      rising: [
        "trust around that room rose.",
        "Rising trust does not show whether any account was true or any source was trustworthy.",
      ],
      falling: [
        "trust around that room fell.",
        "Falling trust does not show whether any account was true or any source was trustworthy.",
      ],
    },
    coordination: {
      rising: [
        "pressure to coordinate around that room rose.",
        "Rising pressure to coordinate does not show whether people agreed or shared a purpose.",
      ],
      falling: [
        "pressure to coordinate around that room eased.",
        "Easing pressure to coordinate does not show whether people agreed or shared a purpose.",
      ],
    },
    commonGround: {
      rising: [
        `the shared action became clearer: ${sharedAction}.`,
        "Clearer shared action does not show whether people shared a motive, language, or belief.",
      ],
      falling: [
        `the shared action became harder to see: ${sharedAction}.`,
        "Harder-to-see shared action does not show whether people shared a motive, language, or belief.",
      ],
    },
  };

  let exercised = 0;
  for (const [metric, directions] of Object.entries(realizations)) {
    for (const [direction, [residueEnding, reflectionCopy]] of Object.entries(directions)) {
      const rising = direction === "rising";
      const scenarioId = `afterimage-${metric}-${direction}`;
      const room = `Fixture · ${metric}`;
      const atCompletion = rising ? 40 : 60;
      const atDebrief = rising ? 60 : 40;
      const normalizedChange = metric === "reach" ? 0.02 : 0.2;
      const scenario = {
        id: scenarioId,
        title: room,
        audienceCeiling: 1000,
        truth: { laterResolution: "the public record stayed open" },
        communicationModel: { substantiveCommonGround: sharedAction },
      };
      const atoms = residueAtoms(scenario, {
        scenario,
        metric,
        atCompletion,
        atDebrief,
        delta: atDebrief - atCompletion,
        normalizedMagnitude: normalizedChange,
      });
      assert.deepEqual(atoms.map((atom) => atom.role), ["resolution", "residue", "reflection"]);
      assert.equal(atoms[1].text, `After ${room} closed, ${residueEnding}`);
      assert.equal(atoms[2].text, reflectionCopy);
      assert.match(
        atoms[2].text,
        /(?:does|do) not (?:show whether|establish (?:what|who))/i,
        `${metric} ${direction} lacks a direction-neutral proof boundary`,
      );

      const afterimageSource = {
        kind: "room-afterimage",
        scenarioId,
        metric,
        atCompletion,
        atDebrief,
        normalizedChange,
      };
      const expectedSources = metric === "commonGround"
        ? [{ kind: "communication-record", scenarioId, field: "substantiveCommonGround" }, afterimageSource]
        : [afterimageSource];
      assert.deepEqual(atoms[1].sources, expectedSources, `${metric} ${direction} residue source drifted`);
      assert.deepEqual(atoms[2].sources, expectedSources, `${metric} ${direction} reflection detached from its residue`);
      exercised += 1;
    }
  }
  assert.equal(exercised, 22);
});

test("equal strongest afterimages use the stable scenario-id tie-break", async () => {
  const { __testResidueAtoms, __testStrongestAfterimage } = await debriefInternals();
  const { pack, state: completedState } = playCompletedNight(0, "floor");
  const eligibleMetrics = [
    "reach",
    "heat",
    "crossover",
    "belief",
    "consensus",
    "provenance",
    "verification",
    "trust",
    "coordination",
    "blame",
    "commonGround",
  ];
  const state = structuredClone(completedState);
  const tiedScenarioIds = pack.scenarios.map((scenario) => scenario.id).sort().slice(0, 2);
  assert.equal(tiedScenarioIds.length, 2);
  for (const room of Object.values(state.rooms)) {
    assert.ok(room.atCompletion, `${room.scenarioId} lacks a completion snapshot`);
    for (const metric of eligibleMetrics) room.atCompletion[metric] = room.metrics[metric];
  }
  for (const scenarioId of tiedScenarioIds) {
    const room = state.rooms[scenarioId];
    room.atCompletion.verification = 50;
    room.metrics.verification = 53;
  }
  const candidates = pack.scenarios.flatMap((scenario) => eligibleMetrics.flatMap((metric) => {
    const room = state.rooms[scenario.id];
    const before = room.atCompletion?.[metric];
    const after = room.metrics[metric];
    if (typeof before !== "number" || before === after) return [];
    return [{
      scenarioId: scenario.id,
      metric,
      normalized: Math.abs(after - before) / (metric === "reach" ? Math.max(1, scenario.audienceCeiling) : 100),
    }];
  })).sort((left, right) =>
    right.normalized - left.normalized
    || left.scenarioId.localeCompare(right.scenarioId)
    || left.metric.localeCompare(right.metric),
  );
  assert.equal(candidates.length, 2, "the synthetic tie fixture has an unrelated changed afterimage");
  assert.equal(candidates[0].normalized, candidates[1].normalized, "fixture no longer has an exact maximum tie");
  assert.equal(candidates[0].normalized, 0.03);
  assert.deepEqual(candidates.slice(0, 2).map((candidate) => candidate.scenarioId), tiedScenarioIds);

  const first = __testStrongestAfterimage(pack, state, pack.scenarios);
  const replay = __testStrongestAfterimage(pack, state, pack.scenarios);
  assert.deepEqual(replay, first, "the equal-afterimage tie-break is not deterministic");
  assert.ok(first);
  const source = __testResidueAtoms(first.scenario, first)
    .flatMap((atom) => atom.sources)
    .find((candidate) => candidate.kind === "room-afterimage");
  assert.ok(source);
  assert.equal(source.scenarioId, tiedScenarioIds[0]);
  assert.equal(source.metric, "verification");
  assert.equal(source.normalizedChange, 0.03);
});

test("a valid completed night with no post-close change keeps a conclusion without inventing an afterimage", async () => {
  const { buildNaturalizedSummary } = await debriefBuilders();
  const generated = generateScenarioPack(0);
  const metricNames = [
    "reach",
    "heat",
    "crossover",
    "belief",
    "consensus",
    "provenance",
    "verification",
    "trust",
    "coordination",
    "blame",
    "interpretiveGap",
    "commonGround",
    "threadFocus",
    "discernment",
    "enactment",
  ];
  const saturatingEffects = Object.fromEntries(metricNames.map((metric) => [metric, metric === "reach" ? 0 : 100]));
  const pack = {
    ...generated,
    scenarios: generated.scenarios.map((scenario) => ({
      ...scenario,
      scenes: scenario.scenes.map((scene, sceneIndex) => sceneIndex !== scenario.scenes.length - 1
        ? scene
        : {
            ...scene,
            choices: scene.choices.map((choice) => choice.ethicsTags.includes("non-amplification-floor")
              ? {
                  ...choice,
                  minutes: 0,
                  effects: saturatingEffects,
                  fatigueLoad: {},
                  codeAction: undefined,
                }
              : choice),
          }),
    })),
  };
  const maximumArrival = Math.max(...pack.scenarios.flatMap((scenario) =>
    scenario.scenes.map((_, sceneIndex) => sceneArrivalOffset(pack, scenario.id, sceneIndex)),
  ));
  assert.ok(Number.isSafeInteger(maximumArrival) && maximumArrival > 0);
  let state = advanceNightTo(pack, createNightState(pack), maximumArrival);
  for (const scenario of pack.scenarios) state = enterNightRoom(state, scenario.id);
  for (let sceneIndex = 0; sceneIndex < 4; sceneIndex += 1) {
    for (const scenario of pack.scenarios) {
      const room = state.rooms[scenario.id];
      assert.equal(room.sceneIndex, sceneIndex);
      const scene = scenario.scenes[sceneIndex];
      const floor = scene.choices.find((choice) =>
        choice.ethicsTags.includes("non-amplification-floor") && !choiceAccess(choice, room).locked,
      );
      assert.ok(floor, `${scene.id} lacks its no-change floor fixture`);
      const next = applyNightChoice(pack, state, scenario.id, scene.id, floor.id);
      assert.notEqual(next, state, `${scene.id} did not advance in the no-change fixture`);
      state = next;
    }
  }

  assert.ok(isNightComplete(state));
  assert.deepEqual(validateNightState(pack, state), []);
  for (const room of Object.values(state.rooms)) {
    assert.deepEqual(room.metrics, room.atCompletion, `${room.scenarioId} changed after its completion snapshot`);
  }
  const summary = buildNaturalizedSummary(pack, state);
  assert.ok(
    summaryParagraphs(summary).length >= 2 && summaryParagraphs(summary).length <= 7,
    "the valid no-afterimage fixture loses its bounded conclusion",
  );
  const resolutionSources = summarySources(summary)
    .filter((source) => source.kind === "scenario-record" && source.field === "laterResolution");
  assert.equal(resolutionSources.length, 1);
  const settledScenarioId = resolutionSources[0].scenarioId;
  const settledScenario = pack.scenarios.find((scenario) => scenario.id === settledScenarioId);
  assert.ok(settledScenario);
  assert.ok(
    normalizeSentence(summaryAtoms(summary).find((atom) => atom.role === "resolution")?.text)
      .includes(normalizeSentence(settledScenario.truth.laterResolution)),
    "the settled-room fixture loses its source-backed later resolution",
  );
  assert.ok(!summarySources(summary).some((source) => source.kind === "room-afterimage"), "the builder fabricated a zero-change afterimage");
  assert.deepEqual(summaryAtoms(summary).slice(-3).map((atom) => atom.role), ["resolution", "residue", "reflection"]);
  assert.deepEqual(summaryAtoms(summary).at(-2).sources, [{ kind: "room-settled", scenarioId: settledScenarioId }]);
  assert.match(summaryAtoms(summary).at(-2).text, /recorded no later net change around/i);
  assert.deepEqual(summaryAtoms(summary).at(-1).sources, [{
    kind: "room-settled",
    scenarioId: settledScenarioId,
  }]);
  assert.match(summaryAtoms(summary).at(-1).text, /absence of net change does not settle the account or make it true/i);
});

test("natural narrative hides mechanism IDs and concept explanations hide metric jargon", async () => {
  const { buildNaturalizedSummary, buildConceptReceipt } = await debriefBuilders();
  const metricJargon = /\b(?:appliedReach|backgroundReach|avoidedReach|interpretiveGap|threadFocus|prosocialOrientation|commonGround|crossover|consensus|provenance|effect receipt|metric score|applied reach|background reach|avoided reach|interpretive gap|thread focus|prosocial orientation|common ground)\b/i;
  for (let seed = 0; seed < 8; seed += 1) {
    const { pack, state } = playCompletedNight(seed, seed % 2 === 0 ? "floor" : "contrast");
    const narrative = normalizeSentence(summaryParagraphs(buildNaturalizedSummary(pack, state)).join(" "));
    const mechanismIds = new Set(
      [...state.decisions, ...state.ambientEvents]
        .flatMap((event) => event.effects)
        .map((effect) => effect.mechanism)
        .filter(Boolean),
    );
    for (const mechanismId of mechanismIds) {
      assert.ok(!narrative.includes(normalizeSentence(mechanismId)), `seed ${seed} leaks internal mechanism ID ${mechanismId} into narrative`);
      assert.ok(!narrative.includes(normalizeSentence(mechanismId.replaceAll("-", " "))), `seed ${seed} exposes ${mechanismId} as spaced system jargon`);
    }
    for (const item of conceptItems(buildConceptReceipt(pack, state))) {
      const visibleCopy = `${conceptTerm(item)} ${conceptPlainCopy(item)} ${item.limit ?? item.observable ?? ""}`;
      assert.doesNotMatch(visibleCopy, metricJargon, `${conceptTerm(item)} leaks an internal metric into plain concept copy`);
    }
  }
});

test("the final view keeps its fiction boundary visible beside the conclusion", async () => {
  const debrief = functionSource("NightDebrief");
  const loaded = await loadDebriefModule();
  const debriefCopySource = loaded.error ? "" : await readFile(path.join(root, "app/debrief-copy.ts"), "utf8");
  const combined = `${debrief}\n${debriefCopySource}`;
  assert.match(debrief, /<(?:p|aside|section)[^>]*className=["'][^"']*model-limit[^"']*["'][^>]*>/s, "fiction boundary must be visible, not buried in a drawer or disclosure");
  assert.match(combined, /CHORUS is fiction\./i);
  assert.doesNotMatch(combined, /\bsimulat\w*\b/i);
  assert.match(combined, /(?:does not|is not)[^.]{0,90}(?:diagnos|predict|assess|measure|score)/i);
  assert.match(combined, /(?:real (?:person|people)|or you)/i);
});

test("format-only direct routes are not labeled as direct content crossings", async () => {
  const loaded = await loadDebriefModule();
  const debriefCopySource = loaded.error ? "" : await readFile(path.join(root, "app/debrief-copy.ts"), "utf8");
  const combined = `${page}\n${debriefCopySource}`;
  assert.doesNotMatch(combined, /effect\.layer === "direct" \? "DIRECT CROSSING"/);
  assert.match(combined, /DIRECT CONTENT CROSSING/);
  assert.match(combined, /(?:DIRECT )?FORMAT (?:CARRYOVER|CROSSING)[^"'\n]{0,40}NO SHARED (?:FACTUAL )?CLAIM/i);
  assert.match(combined, /receipt\.semantic \?\? link\?\.semantic/, "route classification must read the typed receipt/link semantic");
  assert.match(combined, /link\?\.carrier|route\.carrier/, "format and content display labels must come from the typed carrier");
  assert.doesNotMatch(debriefCopySource, /const formatOnly|const sharedContent|\/format\|imitation/, "copy regex must not determine route semantics");
});

test("generated player copy is atomized, bounded, and does not repeat one room explanation through every beat", () => {
  for (const pack of generatedPacks) {
    for (const scenario of pack.scenarios) {
      const observableRecord = scenario.communicationModel.observableRecord;
      assert.ok(Array.isArray(observableRecord), `${scenario.id} observableRecord must remain an inspectable array`);
      const normalizedEntries = observableRecord.map(normalizeSentence).filter(Boolean);
      assert.equal(new Set(normalizedEntries).size, normalizedEntries.length, `${scenario.id} repeats an observable-record entry`);
      const normalizedRecordSentences = observableRecord.flatMap(sentences).map(normalizeSentence).filter(Boolean);
      assert.equal(
        new Set(normalizedRecordSentences).size,
        normalizedRecordSentences.length,
        `${scenario.id} repeats an observable-record sentence across entries`,
      );
      const observableText = observableRecord.join(" ");
      const privateLedger = scenario.communicationModel.misrepresentation;
      for (const privateCopy of [
        privateLedger.knownRecord,
        privateLedger.alteredAccount,
        privateLedger.audienceCost,
        privateLedger.correctionDuty,
        privateLedger.incentiveIntersection.combinedMotive,
      ].filter(Boolean)) {
        assert.ok(!observableText.includes(privateCopy), `${scenario.id} puts private selection or motive analysis in observableRecord`);
      }
      assert.doesNotMatch(
        observableText,
        /while (?:selecting|choosing|using)[^.]{0,140}for (?:its|their|the) (?:contract|client|campaign|market) (?:value|gain|advantage)|\b(?:private aim|private success condition|combined motive)\b|\b(?:selection|choice|selected|chose)\b[^.]{0,120}\b(?:contract|client|campaign|market) (?:value|gain|advantage)\b/i,
        `${scenario.id} states a private contract selection or motive as an observable record item`,
      );
      const disclosureAtoms = scenario.scenes.flatMap((scene) => [
        ...scene.disclosure.records,
        ...scene.disclosure.questions,
        ...scene.disclosure.unknowns,
      ]);
      const disclosureCopies = disclosureAtoms.map((atom) => normalizeSentence(atom.copy));
      assert.equal(new Set(disclosureCopies).size, disclosureCopies.length, `${scenario.id} repeats one active record, question, or unknown across beats`);
      const privateBriefs = disclosureAtoms.filter((atom) => atom.access === "seat-private-assignment-brief");
      assert.equal(privateBriefs.length, scenario.protagonistModel.kind === "abstract_bad_actor" ? 1 : 0);
      for (const privateCopy of [
        privateLedger.knownRecord,
        privateLedger.alteredAccount,
        privateLedger.audienceCost,
        privateLedger.correctionDuty,
        privateLedger.incentiveIntersection.combinedMotive,
      ].filter(Boolean)) {
        assert.ok(!disclosureAtoms.some((atom) => atom.copy.includes(privateCopy)), `${scenario.id} exposes a sealed private ledger in active disclosure`);
      }
      const repeatedReasons = new Map();
      for (const scene of scenario.scenes) {
        const artifact = scene.artifactCopy ?? "";
        assert.ok(words(artifact).length <= 95, `${scene.id} artifactCopy exceeds 95 words`);
        assert.ok(sentences(artifact).length <= 4, `${scene.id} artifactCopy exceeds four sentences`);
        assert.ok(sentences(artifact).every((sentence) => words(sentence).length <= 45), `${scene.id} contains an overpacked sentence`);
        const normalized = sentences(artifact).map(normalizeSentence).filter((sentence) => words(sentence).length >= 8);
        assert.equal(new Set(normalized).size, normalized.length, `${scene.id} repeats the same inference or record sentence inside one artifact`);
        assert.ok(words(scene.heading).length <= 18, `${scene.id} heading is not atomized`);
        assert.ok(words(scene.reason).length <= 32, `${scene.id} arrival reason is not bounded`);
        for (const choice of scene.choices) {
          assert.ok(words(choice.label).length <= 16, `${choice.id} label is not scannable`);
          assert.ok(words(choice.detail).length <= 55, `${choice.id} detail is an explanatory mini-essay`);
        }
        const reason = normalizeSentence(scene.reason);
        repeatedReasons.set(reason, (repeatedReasons.get(reason) ?? 0) + 1);
      }
      assert.ok(
        Math.max(...repeatedReasons.values()) <= 2,
        `${scenario.id} repeats one identical WHY THIS ARRIVED explanation across more than two beats`,
      );
      assert.ok(words(scenario.description).length <= 95, `${scenario.id} scenario description exceeds the entry-copy bound`);
    }
  }
});
