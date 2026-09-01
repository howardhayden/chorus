import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  choiceCopyVoiceClass,
  generateScenarioPack,
} from "../app/scenario-generator.ts";
import {
  advanceNightTo,
  applyNightChoice,
  choiceAccess,
  createNightState,
  enterNightRoom,
  isNightComplete,
  isSceneDue,
  sceneArrivalOffset,
  visibleCrossingCopy,
} from "../app/night-engine.ts";
import {
  buildConceptReceipt,
  buildNaturalizedSummary,
} from "../app/debrief-copy.ts";
import {
  PORTABLE_SAVE_SCHEMA_VERSION,
  createPortableSave,
  parsePortableSave,
} from "../app/save-model.ts";

const root = path.resolve(import.meta.dirname, "..");
const page = await readFile(path.join(root, "app/page.tsx"), "utf8");
const privacy = await readFile(path.join(root, "app/privacy-panel.tsx"), "utf8");
const register = await readFile(path.join(root, "docs/requirements/LINGUISTICS-REGISTER.md"), "utf8");

function firstAcceptedDecision(seed = 0) {
  const pack = generateScenarioPack(seed);
  let state = createNightState(pack);
  for (const scenario of pack.scenarios) {
    state = advanceNightTo(pack, state, sceneArrivalOffset(pack, scenario.id, 0));
    state = enterNightRoom(state, scenario.id);
    const scene = scenario.scenes[0];
    const choice = scene.choices.find((candidate) => !choiceAccess(candidate, state.rooms[scenario.id]).locked);
    if (!choice) continue;
    const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    if (next.turn === 1) return { pack, state: next };
  }
  assert.fail(`seed ${seed} had no accepted first decision`);
}

function completeNight(seed, policy = "first") {
  const pack = generateScenarioPack(seed);
  let state = createNightState(pack);
  for (const scenario of pack.scenarios) state = enterNightRoom(state, scenario.id);

  for (let guard = 0; guard < 400 && !isNightComplete(state); guard += 1) {
    let moved = false;
    for (const scenario of pack.scenarios) {
      const room = state.rooms[scenario.id];
      if (room.completed || !isSceneDue(pack, state, scenario.id)) continue;
      const scene = scenario.scenes[room.sceneIndex];
      const available = scene.choices.filter((choice) => !choiceAccess(choice, room).locked);
      const choice = policy === "last" ? available.at(-1) : available[0];
      assert.ok(choice, `no available choice for ${scene.id}`);
      state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
      moved = true;
      break;
    }
    if (moved) continue;
    const nextMinute = pack.scenarios
      .filter((scenario) => !state.rooms[scenario.id].completed)
      .map((scenario) => sceneArrivalOffset(pack, scenario.id, state.rooms[scenario.id].sceneIndex))
      .filter((minute) => minute > state.elapsedMinutes)
      .sort((left, right) => left - right)[0];
    assert.notEqual(nextMinute, undefined, `seed ${seed} stalled`);
    state = advanceNightTo(pack, state, nextMinute);
  }
  assert.equal(state.turn, 24);
  return { pack, state };
}

function crossingFixture(overrides = {}) {
  const scenarios = [{ id: "source", title: "Source Room" }, { id: "target", title: "Target Room" }];
  const state = {
    rooms: {
      source: { entered: true },
      target: { entered: true },
    },
  };
  const event = {
    kind: "choice",
    id: "event-1",
    sourceScenarioId: "source",
    atMinute: 10,
    label: "Selected words",
    signal: "selected signal",
    ...overrides.event,
  };
  const effect = {
    targetScenarioId: "target",
    scope: "cross-room",
    linkId: "link-1",
    layer: "direct",
    semantic: "content",
    metrics: {},
    backgroundReach: 0,
    avoidedReach: 0,
    appliedReach: 5,
    selectedCarriage: true,
    selectedCarriageReach: 5,
    supportAdded: [],
    vagueCue: "A vague house condition changed.",
    revealedCue: "Source Room and Target Room share a channel.",
    ...overrides.effect,
  };
  return { event, effect, state, scenarios };
}

test("the dedicated linguistic register binds exact authority without inventing WV identifiers", () => {
  assert.match(register, /`CHR-LING-REGISTER`/);
  assert.match(register, /6f3045c41a3287dcf82d2c8657034dbc968fa26f8afb9d63b438316423be91d3/);
  assert.match(register, /566f7c653142b239c098a0a3a0b628f3a3179535b219a99d889fdd48cc9513af/);
  assert.match(register, /does not\s+claim to reproduce a missing prior reusable Catalysis register/i);
});

test("occupied-seat copy stays with the fictional seat instead of assigning the player an interior", () => {
  const secondPerson = /\b(?:you|your|yours|yourself)\b/i;
  for (let seed = 0; seed < 128; seed += 1) {
    for (const scenario of generateScenarioPack(seed).scenarios) {
      assert.doesNotMatch(scenario.protagonistModel.mentality, secondPerson, `${scenario.id} mentality`);
      assert.doesNotMatch(scenario.protagonistModel.incidentConnection, secondPerson, `${scenario.id} connection`);
    }
  }
});

test("active choices leave analytic motive in subtext rather than repeating it", () => {
  const premature = /this seat's record|leaving (?:that|it) out protects|protected interest|incentive intersection|misrepresentation|blame transfer|rumor carriage|warmth halo|code collision|identity defense/i;
  for (let seed = 0; seed < 128; seed += 1) {
    for (const scenario of generateScenarioPack(seed).scenarios) {
      for (const scene of scenario.scenes) {
        for (const choice of scene.choices) {
          assert.doesNotMatch(`${choice.label} ${choice.detail}`, premature, `${choice.id} pre-solves its analysis`);
        }
      }
    }
  }
});

test("stable safety and repair affordances stay plain while incident-responsive choices carry Catalysis", () => {
  const repeatedAffordances = new Set([
    "Assemble a verified handoff before the next room",
    "Open the mapped cross-room correction path now",
    "Refuse the motive claim and compare records",
    "Carry the distributed correction",
    "Correct only the room that trusts you",
  ]);
  let utilityCount = 0;
  let catalysisCount = 0;
  const classifiedRepeated = new Set();
  for (let seed = 0; seed < 128; seed += 1) {
    for (const scenario of generateScenarioPack(seed).scenarios) {
      for (const scene of scenario.scenes) {
        for (const choice of scene.choices) {
          const voiceClass = choiceCopyVoiceClass(choice);
          if (voiceClass === "catalysis") {
            catalysisCount += 1;
            continue;
          }
          utilityCount += 1;
          if (repeatedAffordances.has(choice.label)) classifiedRepeated.add(choice.label);
          const tags = new Set(choice.ethicsTags);
          const supported = (choice.availability.status === "locked" && tags.has("visible-ideal"))
            || (tags.has("distributed-unlock") && tags.has("reachable-repair"))
            || (tags.has("verification") && tags.has("time-cost") && tags.has("non-amplification-floor"))
            || (tags.has("partial-repair") && tags.has("trusted-bridge") && tags.has("non-amplification-floor"));
          assert.ok(supported, `${choice.id} entered the utility class without a stable typed affordance`);
        }
      }
    }
  }
  assert.deepEqual(classifiedRepeated, repeatedAffordances);
  assert.ok(utilityCount > 0, "sample lacks stable utility affordances");
  assert.ok(catalysisCount > utilityCount, "incident-responsive choice language is no longer the dominant class");
});

test("spoiler-bearing research records are gated while the operational House Guide remains available", () => {
  assert.match(page, /kind === "notes"\s*&&\s*\(analysisAvailable\s*\?\s*<>\s*<FieldNotes\s*\/>\s*<ResearchRecordLinks\s*\/>\s*<\/>\s*:\s*<HouseGuide\s*\/>\)/s);
  assert.match(privacy, /\{isNightComplete\(state\) && <details className="privacy-disclosure">[\s\S]*?<summary><span>Technical record<\/span>/);
  assert.doesNotMatch(page, /final receipt will reveal the authored interior/i);
  assert.match(page, /GENERAL REFERENCE|general reference/i);
});

test("conclusion builders fail closed for an unfinished night", () => {
  const pack = generateScenarioPack(0);
  const state = createNightState(pack);
  assert.deepEqual(buildNaturalizedSummary(pack, state), { paragraphs: [], sources: [], atoms: [] });
  assert.deepEqual(buildConceptReceipt(pack, state), { concepts: [] });
});

test("conclusion builders fail closed for malformed completed ledgers", () => {
  const { pack, state } = completeNight(28, "last");
  const malformed = [];

  const reversed = structuredClone(state);
  reversed.decisions.reverse();
  malformed.push(reversed);

  const missing = structuredClone(state);
  missing.decisions.splice(4, 1);
  malformed.push(missing);

  const spoofed = structuredClone(state);
  spoofed.decisions[0].choiceLabel = "A stored label that the accepted choice never authored";
  malformed.push(spoofed);

  for (const candidate of malformed) {
    assert.deepEqual(buildNaturalizedSummary(pack, candidate), { paragraphs: [], sources: [], atoms: [] });
    assert.deepEqual(buildConceptReceipt(pack, candidate), { concepts: [] });
  }
});

test("live crossing copy follows event kind, semantic, and realized selected carriage", () => {
  const selectedContent = crossingFixture();
  const selectedContentCopy = visibleCrossingCopy(...Object.values(selectedContent));
  assert.match(selectedContentCopy, /Selected words/);
  assert.match(selectedContentCopy, /message content/i);
  assert.doesNotMatch(selectedContentCopy, /part of the record|factual claim/i);

  const selectedFormat = crossingFixture({
    effect: { semantic: "format", selectedCarriage: true, selectedCarriageReach: 4, appliedReach: 4 },
  });
  const selectedFormatCopy = visibleCrossingCopy(...Object.values(selectedFormat));
  assert.match(selectedFormatCopy, /form|format/i);
  assert.match(selectedFormatCopy, /not its message content/i);
  assert.doesNotMatch(selectedFormatCopy, /part of the record|factual claim/i);

  const backgroundOnly = crossingFixture({
    effect: { selectedCarriage: false, selectedCarriageReach: 0, appliedReach: 0, backgroundReach: 12 },
  });
  const backgroundCopy = visibleCrossingCopy(...Object.values(backgroundOnly));
  assert.match(backgroundCopy, /background|did not carry|no selected/i);
  assert.doesNotMatch(backgroundCopy, /crossing followed/i);

  const autonomous = crossingFixture({
    event: { kind: "ambient", label: "Autonomous pulse" },
    effect: { selectedCarriage: false, selectedCarriageReach: 0, appliedReach: 3, backgroundReach: 0 },
  });
  const autonomousCopy = visibleCrossingCopy(...Object.values(autonomous));
  assert.doesNotMatch(autonomousCopy, /Autonomous pulse|selected move|crossing followed/i);
  assert.match(autonomousCopy, /autonomous|house activity|conditions/i);
});

test("pre-completion save bytes contain only a replay trace, not sealed linguistic analysis", () => {
  const { state } = firstAcceptedDecision(0);
  const text = createPortableSave(state, { exportedAt: "2026-08-31T20:00:00.000Z" });
  const envelope = JSON.parse(text.slice(text.indexOf("\n") + 1));
  assert.equal(PORTABLE_SAVE_SCHEMA_VERSION, 2);
  assert.equal(envelope.schemaVersion, 2);
  assert.equal("state" in envelope.payload, false);
  assert.ok(Array.isArray(envelope.payload.decisions));
  assert.ok(Array.isArray(envelope.payload.enteredRoomOrdinals));
  assert.doesNotMatch(text, /activeCodeId|codeTransition|switchReason|repertoire|relationalMove|misrepresentation|conversationDiversion|actorMotive|frameworkMoves|lastResort|choiceLabel|revealedCue|privateKnowledge/i);
  assert.deepEqual(parsePortableSave(text).state, JSON.parse(JSON.stringify(state)));
});

test("natural summaries retain complete causal clauses without false cross-room aliases", () => {
  for (const [seed, policy] of [[0, "first"], [1, "last"], [0xffff_ffff, "first"]]) {
    const { pack, state } = completeNight(seed, policy);
    const summary = buildNaturalizedSummary(pack, state);
    const copy = summary.paragraphs.join(" ");
    assert.doesNotMatch(copy, /…/u, `seed ${seed} contains destructive ellipsis`);
    assert.doesNotMatch(copy, /earlier named move from/i, `seed ${seed} invents cross-room move identity`);
    assert.doesNotMatch(copy, /part of the record|factual claim/i, `seed ${seed} upgrades generic content into a factual record`);
    assert.ok(summary.paragraphs.every((paragraph) => /[.!?]$/.test(paragraph)));
  }
});
