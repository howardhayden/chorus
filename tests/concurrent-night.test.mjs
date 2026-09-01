import assert from "node:assert/strict";
import test from "node:test";

import { generateScenarioPack, validateConcurrentNight } from "../app/scenario-generator.ts";
import {
  advanceNightTo,
  advanceToNextOpening,
  applyNightChoice,
  behaviorTransitionFor,
  choiceAccess,
  createNightState,
  enterNightRoom,
  isNightComplete,
  isRoomOpen,
  roomIncomingEvents,
  sceneArrivalOffset,
  validateNightState,
  visibleCrossingCopy,
} from "../app/night-engine.ts";

function firstAvailable(scene, room) {
  const choice = scene.choices.find((item) => !choiceAccess(item, room).locked);
  assert.ok(choice, `expected an available choice for ${scene.id}`);
  return choice;
}

function advanceToCurrentScene(pack, state, scenarioId) {
  const room = state.rooms[scenarioId];
  const arrival = sceneArrivalOffset(pack, scenarioId, room.sceneIndex);
  return state.elapsedMinutes < arrival ? advanceNightTo(pack, state, arrival) : state;
}

function playOrder(pack, ids) {
  let state = createNightState(pack);
  const actions = [];
  for (const id of ids) {
    const scenario = pack.scenarios.find((item) => item.id === id);
    assert.ok(scenario);
    while (!isRoomOpen(pack, state, id)) state = advanceToNextOpening(pack, state);
    state = enterNightRoom(state, id);
    while (!state.rooms[id].completed) {
      state = advanceToCurrentScene(pack, state, id);
      const room = state.rooms[id];
      const scene = scenario.scenes[room.sceneIndex];
      const choice = firstAvailable(scene, room);
      actions.push([id, scene.id, choice.id]);
      state = applyNightChoice(pack, state, id, scene.id, choice.id);
    }
  }
  return { state, actions };
}

function applyOpeningChoice(pack, scenario, choice) {
  let state = createNightState(pack);
  state = enterNightRoom(state, scenario.id);
  state = advanceNightTo(pack, state, sceneArrivalOffset(pack, scenario.id, 0));
  state = applyNightChoice(pack, state, scenario.id, scenario.scenes[0].id, choice.id);
  const decision = state.decisions.at(-1);
  assert.ok(decision, `expected ${choice.id} to produce a decision`);
  return { state, decision };
}

function deliverySupportsLink(choice, link) {
  if (["private", "withheld"].includes(choice.delivery.scope)) return false;
  if (link.semantic === "content") return ["content", "content-and-format"].includes(choice.delivery.carriage);
  if (link.semantic === "format") return ["format", "content-and-format"].includes(choice.delivery.carriage);
  return false;
}

test("1,000 generated nights satisfy room and night coherence", () => {
  for (let seed = 0; seed < 1_000; seed += 1) {
    const pack = generateScenarioPack(seed);
    assert.equal(pack.scenarios.length, 6);
    assert.equal(pack.night.links.length, 30);
    assert.ok(pack.nightReport.passed);
    assert.ok(pack.reports.every((report) => report.passed));
  }
});

test("cross-room semantic classes and carriers are typed independently of explanatory copy", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const pack = generateScenarioPack(seed);
    for (const link of pack.night.links) {
      assert.ok(["content", "format", "ambient"].includes(link.semantic));
      if (link.semantic === "ambient") {
        assert.equal(link.layer, "ambient");
        assert.equal(link.carrier, undefined);
        assert.equal(link.compatibilityBasis, undefined);
      } else if (link.semantic === "content") {
        assert.equal(link.layer, "direct");
        assert.equal(link.carrier.kind, "shared-channel");
        assert.ok(link.carrier.channel.length > 0);
      } else {
        assert.equal(link.layer, "direct");
        assert.equal(link.carrier.kind, "artifact-format");
        assert.ok(link.carrier.artifact.length > 0);
      }
    }
  }

  const pack = generateScenarioPack(0);
  const editedNight = structuredClone(pack.night);
  for (const link of editedNight.links) {
    link.vagueCue = "A generic neighboring condition has shifted without identifying either represented room.";
    link.revealedCue = "This deliberately contradictory copy mentions content, format imitation, and ambient pressure together.";
    if (link.semantic !== "ambient") {
      link.compatibilityBasis = "Contradictory prose mentions both format and a shared channel, but cannot change the typed route.";
    }
  }
  const report = validateConcurrentNight(editedNight, pack.scenarios);
  assert.ok(report.passed, report.checks.filter((check) => !check.passed).map((check) => check.id).join(", "));
  assert.deepEqual(
    editedNight.links.map((link) => link.semantic),
    pack.night.links.map((link) => link.semantic),
  );
});

test("private floor choices cannot use shared content or format carriers", () => {
  const observed = new Set();
  for (const [seed, expectedSemantic] of [[0, "format"], [0xffffffff, "content"]]) {
    const pack = generateScenarioPack(seed);
    const fixture = pack.scenarios.map((scenario) => ({
      scenario,
      choice: scenario.scenes[0].choices.find((choice) => choice.delivery.scope === "private"),
      link: pack.night.links.find((link) => link.sourceScenarioId === scenario.id && link.semantic !== "ambient"),
    })).find(({ choice, link }) => choice && link?.semantic === expectedSemantic);
    assert.ok(fixture?.choice && fixture.link, `seed ${seed} needs a private-choice direct-route fixture`);
    observed.add(fixture.link.semantic);
    assert.ok(fixture.choice.ethicsTags.includes("non-amplification-floor"));
    const { state, decision } = applyOpeningChoice(pack, fixture.scenario, fixture.choice);
    const receipt = decision.effects.find((effect) => effect.linkId === fixture.link.id);
    assert.ok(receipt);
    assert.equal(receipt.semantic, fixture.link.semantic);
    assert.equal(receipt.selectedCarriage, false);
    assert.equal(receipt.selectedCarriageReach, 0);
    assert.equal(receipt.appliedReach, 0);
    assert.deepEqual(validateNightState(pack, state), []);
  }
  assert.deepEqual(observed, new Set(["format", "content"]));
});

test("typed public delivery—not an ethics tag—can produce selected carriage", () => {
  let floorFixture;
  let contrastFixture;
  for (let seed = 0; seed < 100 && (!floorFixture || !contrastFixture); seed += 1) {
    const pack = generateScenarioPack(seed);
    for (const scenario of pack.scenarios) {
      const link = pack.night.links.find((candidate) =>
        candidate.sourceScenarioId === scenario.id && candidate.semantic !== "ambient",
      );
      if (!link) continue;
      for (const choice of scenario.scenes[0].choices) {
        if ((choice.effects.reach ?? 0) <= 0 || !deliverySupportsLink(choice, link)) continue;
        const fixture = { pack, scenario, choice, link };
        if (choice.ethicsTags.includes("non-amplification-floor")) floorFixture ??= fixture;
        else contrastFixture ??= fixture;
      }
    }
  }
  assert.ok(floorFixture, "expected a bounded public floor with a compatible direct carrier");
  assert.ok(contrastFixture, "expected a non-floor choice with a compatible direct carrier");
  for (const fixture of [floorFixture, contrastFixture]) {
    const { state, decision } = applyOpeningChoice(fixture.pack, fixture.scenario, fixture.choice);
    const receipt = decision.effects.find((effect) => effect.linkId === fixture.link.id);
    assert.ok(receipt);
    assert.equal(receipt.semantic, fixture.link.semantic);
    assert.equal(receipt.selectedCarriage, true);
    assert.ok(receipt.selectedCarriageReach > 0);
    assert.equal(receipt.selectedCarriageReach, receipt.appliedReach);
    assert.deepEqual(validateNightState(fixture.pack, state), []);
  }
});

test("all six seats can be entered in any order without advancing the shared clock", () => {
  const pack = generateScenarioPack(0x43484f52);
  let state = createNightState(pack);
  const initialMinute = state.elapsedMinutes;
  const initialTurn = state.turn;
  const order = pack.scenarios.map((scenario) => scenario.id).reverse();
  for (const id of order) state = enterNightRoom(state, id);
  assert.equal(state.elapsedMinutes, initialMinute);
  assert.equal(state.turn, initialTurn);
  assert.equal(state.decisions.length, 0);
  assert.ok(Object.values(state.rooms).every((room) => room.entered));
  assert.ok(pack.scenarios.some((scenario) => sceneArrivalOffset(pack, scenario.id, 0) > state.elapsedMinutes), "scheduled artifacts remain time-gated after seat entry");
});

test("serial and reverse runs create one local plus five remote receipts", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const pack = generateScenarioPack(seed);
    const ids = pack.scenarios.map((scenario) => scenario.id);
    const order = seed % 2 ? ids.reverse() : ids;
    const { state } = playOrder(pack, order);
    assert.ok(isNightComplete(state));
    assert.equal(state.decisions.length, 24);
    assert.equal(state.ambientEvents.length, 24);
    assert.deepEqual(validateNightState(pack, state), []);
    for (const decision of state.decisions) {
      assert.equal(decision.effects.length, 6);
      assert.equal(decision.effects.filter((effect) => effect.scope === "local").length, 1);
      assert.equal(decision.effects.filter((effect) => effect.scope === "cross-room").length, 5);
      assert.equal(new Set(decision.effects.map((effect) => effect.targetScenarioId)).size, 6);
    }
  }
});

test("interleaved room switching completes 256 whole nights with attributable causal ledgers", () => {
  let switches = 0;
  let acceptedChoices = 0;
  let remoteReceipts = 0;

  for (let seed = 0; seed < 256; seed += 1) {
    const pack = generateScenarioPack(seed);
    const ids = pack.scenarios.map((scenario) => scenario.id);
    const stride = [1, 5, 7, 11][seed % 4] % ids.length || 1;
    let state = createNightState(pack);
    let cursor = seed % ids.length;
    let selected = null;
    let guard = 0;

    while (!isNightComplete(state)) {
      guard += 1;
      assert.ok(guard < 300, `seed ${seed} exceeded the complete-night action bound`);
      let acted = false;

      for (let offset = 0; offset < ids.length; offset += 1) {
        const index = (cursor + offset * stride) % ids.length;
        const id = ids[index];
        const room = state.rooms[id];
        if (room.completed) continue;

        if (selected !== id) switches += 1;
        selected = id;
        state = enterNightRoom(state, id);
        const arrival = sceneArrivalOffset(pack, id, state.rooms[id].sceneIndex);
        if (state.elapsedMinutes < arrival) continue;

        const scenario = pack.scenarios[index];
        const scene = scenario.scenes[state.rooms[id].sceneIndex];
        const available = scene.choices.filter((choice) => !choiceAccess(choice, state.rooms[id]).locked);
        assert.ok(available.length, `seed ${seed} ${scene.id} has no accepted action`);
        const choice = available[(seed + state.turn + index) % available.length];
        const next = applyNightChoice(pack, state, id, scene.id, choice.id);
        assert.notEqual(next, state, `seed ${seed} ${scene.id} rejected its selected available action`);
        state = next;
        acceptedChoices += 1;
        remoteReceipts += state.decisions.at(-1).effects.filter((effect) => effect.scope === "cross-room").length;
        cursor = (index + stride) % ids.length;
        acted = true;
        break;
      }

      if (acted) continue;
      const nextArrival = pack.scenarios
        .filter((scenario) => !state.rooms[scenario.id].completed)
        .map((scenario) => sceneArrivalOffset(pack, scenario.id, state.rooms[scenario.id].sceneIndex))
        .filter((arrival) => arrival > state.elapsedMinutes)
        .sort((left, right) => left - right)[0];
      assert.ok(Number.isFinite(nextArrival), `seed ${seed} has no reachable next artifact`);
      state = advanceNightTo(pack, state, nextArrival);
      cursor = (cursor + stride) % ids.length;
    }

    assert.equal(state.turn, 24);
    assert.equal(state.decisions.length, 24);
    assert.equal(state.ambientEvents.length, 24);
    assert.deepEqual(validateNightState(pack, state), []);
    assert.ok(Object.values(state.rooms).every((room) => room.entered && room.completed && room.sceneIndex === 4));
    for (const decision of state.decisions) {
      for (const effect of decision.effects.filter((candidate) => candidate.scope === "cross-room")) {
        assert.ok(
          state.rooms[effect.targetScenarioId].inboundEventIds.includes(decision.id),
          `${decision.id} is missing from ${effect.targetScenarioId}'s inbound ledger`,
        );
      }
    }
  }

  assert.equal(acceptedChoices, 256 * 24);
  assert.equal(remoteReceipts, 256 * 24 * 5);
  assert.ok(switches > acceptedChoices, "the proof must switch rooms between, not merely after, decisions");
});

test("scheduled autonomous pulses fire once and do not depend on repeated clock reads", () => {
  const pack = generateScenarioPack(41);
  const initial = createNightState(pack);
  const advanced = advanceNightTo(pack, initial, 180);
  const repeated = advanceNightTo(pack, advanced, 180);
  assert.equal(advanced.ambientEvents.length, 24);
  assert.equal(new Set(advanced.processedPulseIds).size, 24);
  assert.deepEqual(repeated, advanced);
});

test("a completed room keeps a frozen close receipt and a moving afterimage", () => {
  const pack = generateScenarioPack(2026);
  let state = createNightState(pack);
  const [first, second] = pack.scenarios;
  while (!isRoomOpen(pack, state, first.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, first.id);
  while (!state.rooms[first.id].completed) {
    state = advanceToCurrentScene(pack, state, first.id);
    const room = state.rooms[first.id];
    const scene = first.scenes[room.sceneIndex];
    const choice = firstAvailable(scene, room);
    state = applyNightChoice(pack, state, first.id, scene.id, choice.id);
  }
  const snapshot = structuredClone(state.rooms[first.id].atCompletion);
  const reachAtClose = state.rooms[first.id].metrics.reach;
  while (!isRoomOpen(pack, state, second.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, second.id);
  const scene = second.scenes[0];
  const choice = firstAvailable(scene, state.rooms[second.id]);
  state = applyNightChoice(pack, state, second.id, scene.id, choice.id);
  assert.deepEqual(state.rooms[first.id].atCompletion, snapshot);
  assert.notEqual(state.rooms[first.id].metrics.reach, reachAtClose);
});

test("stale scene IDs and locked choices do not mutate the night", () => {
  const pack = generateScenarioPack(77);
  let state = createNightState(pack);
  const scenario = pack.scenarios.find((item) => isRoomOpen(pack, state, item.id));
  assert.ok(scenario);
  state = enterNightRoom(state, scenario.id);
  const scene = scenario.scenes[0];
  const available = firstAvailable(scene, state.rooms[scenario.id]);
  assert.equal(applyNightChoice(pack, state, scenario.id, "stale-scene", available.id), state);
  const locked = scene.choices.find((choice) => choiceAccess(choice, state.rooms[scenario.id]).locked);
  assert.ok(locked);
  assert.equal(applyNightChoice(pack, state, scenario.id, scene.id, locked.id), state);
});

test("a future artifact cannot be revealed through an early decision", () => {
  const pack = generateScenarioPack(31337);
  let state = createNightState(pack);
  const scenario = pack.scenarios.find((item) => isRoomOpen(pack, state, item.id));
  assert.ok(scenario);
  state = enterNightRoom(state, scenario.id);
  const firstScene = scenario.scenes[0];
  const firstChoice = firstAvailable(firstScene, state.rooms[scenario.id]);
  state = applyNightChoice(pack, state, scenario.id, firstScene.id, firstChoice.id);
  const nextScene = scenario.scenes[1];
  const nextChoice = firstAvailable(nextScene, state.rooms[scenario.id]);
  const arrival = sceneArrivalOffset(pack, scenario.id, 1);
  assert.ok(state.elapsedMinutes < arrival);
  assert.equal(applyNightChoice(pack, state, scenario.id, nextScene.id, nextChoice.id), state);
  assert.deepEqual(validateNightState(pack, state), []);
});

test("visible crossing copy binds every claim to event kind, semantic, carriage, and reach receipts", () => {
  const scenarios = [
    { id: "source", title: "Source Room" },
    { id: "target", title: "Target Room" },
  ];
  const state = {
    rooms: {
      source: { entered: true },
      target: { entered: true },
    },
  };
  const baseEvent = {
    id: "event-1",
    atMinute: 1,
    sourceScenarioId: "source",
    label: "Send selected words",
    signal: "a visible signal",
    kind: "choice",
    effects: [],
  };
  const baseEffect = {
    targetScenarioId: "target",
    scope: "cross-room",
    layer: "direct",
    semantic: "content",
    metrics: {},
    backgroundReach: 0,
    avoidedReach: 0,
    appliedReach: 0,
    selectedCarriage: false,
    selectedCarriageReach: 0,
    supportAdded: [],
    vagueCue: "A neighboring pressure changed.",
    revealedCue: "Source Room and Target Room share a visible channel.",
  };
  const cases = [
    {
      name: "selected content with applied selected reach",
      effect: { selectedCarriage: true, selectedCarriageReach: 5, appliedReach: 5 },
      begins: baseEffect.revealedCue,
      matches: [/carried its message content/i, /selected carrier added reach here/i],
      rejects: [/part of the record|factual claim/i],
    },
    {
      name: "selected format without a content claim",
      effect: { semantic: "format", selectedCarriage: true, selectedCarriageReach: 4, appliedReach: 4 },
      begins: baseEffect.revealedCue,
      matches: [/carried the recognizable form, not its message content/i, /selected carrier added reach here/i],
      rejects: [/part of the record|factual claim/i],
    },
    {
      name: "selected content with crossover but zero selected reach",
      effect: { metrics: { crossover: 1 }, selectedCarriage: true },
      begins: baseEffect.revealedCue,
      matches: [/carried its message content/i, /changed crossover conditions without adding reach/i],
      rejects: [/selected carrier added reach here/i],
    },
    {
      name: "tampered carriage flag without realized movement",
      effect: { selectedCarriage: true },
      matches: [/did not carry its message content/i, /no applied, background, or avoided reach/i],
      rejects: [/carried its message content[.]/i],
    },
    {
      name: "background-only content route",
      effect: { backgroundReach: 12 },
      matches: [/did not carry its message content/i, /background circulation continued separately/i],
      rejects: [/carried its message content[.]/i, /selected carrier added reach/i],
    },
    {
      name: "avoided-only format route",
      effect: { semantic: "format", avoidedReach: 7 },
      matches: [/did not carry a recognizable form or its message content/i, /background circulation was avoided/i],
      rejects: [/carried the recognizable form/i],
    },
    {
      name: "ambient choice with a hostile selected-carriage flag",
      effect: { semantic: "ambient", selectedCarriage: true, selectedCarriageReach: 3, appliedReach: 3 },
      matches: [/carrier-free shared conditions/i, /added reach here without a selected carrier/i],
      rejects: [/carried its message content[.]/i, /carried the recognizable form/i],
    },
    {
      name: "autonomous activity on a content-capable route",
      event: { kind: "ambient", label: "Selected move carried the whole record" },
      effect: { selectedCarriage: true, selectedCarriageReach: 6, appliedReach: 6 },
      matches: [/autonomous house activity/i, /content-capable route; no message content crossed/i, /autonomous activity added reach here without a selected carrier/i],
      rejects: [/selected move/i, /part of the record/i, /carried the whole record/i],
    },
    {
      name: "legacy autonomous kind also fails closed",
      event: { kind: "autonomous", label: "Selected move copied the format" },
      effect: { semantic: "format", selectedCarriage: true, selectedCarriageReach: 6, appliedReach: 6 },
      matches: [/autonomous house activity/i, /format-capable route; no recognizable form or message content crossed/i],
      rejects: [/selected move/i, /carried the recognizable form/i, /copied the format/i],
    },
    {
      name: "metric-only choice with no reach movement",
      effect: { semantic: undefined, metrics: { heat: 1 } },
      matches: [/metric-only change/i, /no message content or format crossed/i, /no applied, background, or avoided reach/i],
      rejects: [/carried its message content[.]/i, /carried the recognizable form/i],
    },
    {
      name: "mixed selected, background, and avoided reach",
      effect: { semantic: "format", selectedCarriage: true, selectedCarriageReach: 4, appliedReach: 4, backgroundReach: 9, avoidedReach: 2 },
      begins: baseEffect.revealedCue,
      matches: [/selected carrier added reach here/i, /background circulation continued separately/i, /background circulation was avoided/i],
      rejects: [/carried its message content[.]/i],
    },
  ];

  for (const fixture of cases) {
    const event = { ...baseEvent, ...fixture.event };
    const effect = { ...baseEffect, ...fixture.effect };
    const copy = visibleCrossingCopy(event, effect, state, scenarios);
    assert.ok(
      copy.startsWith(fixture.begins ?? "A route between Source Room and Target Room is now visible."),
      `${fixture.name} must lead with the observable cue: ${copy}`,
    );
    for (const pattern of fixture.matches) assert.match(copy, pattern, fixture.name);
    for (const pattern of fixture.rejects) assert.doesNotMatch(copy, pattern, fixture.name);
  }
});

test("generated crossing copy never promotes autonomous or uncarried effects", () => {
  for (let seed = 0; seed < 8; seed += 1) {
    const pack = generateScenarioPack(seed);
    const { state } = playOrder(pack, pack.scenarios.map((scenario) => scenario.id));
    for (const target of pack.scenarios) {
      for (const { event, effect } of roomIncomingEvents(state, target.id)) {
        const copy = visibleCrossingCopy(event, effect, state, pack.scenarios);
        if (event.kind === "ambient") {
          assert.doesNotMatch(copy, /selected move/i, `${event.id} presented autonomous activity as a selection`);
          assert.ok(!copy.includes(event.label), `${event.id} exposed an autonomous label as selected-action copy`);
        }
        if (effect.semantic === "content" && !effect.selectedCarriage) {
          assert.doesNotMatch(copy, /carried its message content[.]/i, `${event.id} promoted an uncarried content route`);
        }
        if (effect.semantic === "format" && !effect.selectedCarriage) {
          assert.doesNotMatch(copy, /carried the recognizable form/i, `${event.id} promoted an uncarried format route`);
        }
        if (effect.backgroundReach > 0) assert.match(copy, /background circulation continued separately/i, event.id);
        if (effect.avoidedReach > 0) assert.match(copy, /background circulation was avoided/i, event.id);
        if (effect.appliedReach > 0 && !effect.selectedCarriage) {
          assert.match(copy, /added reach here without a selected carrier/i, event.id);
        }
      }
    }
  }
});

test("disclosure remains vague in every entered/unentered combination", () => {
  const pack = generateScenarioPack(91);
  const base = advanceNightTo(pack, createNightState(pack), 180);
  for (let mask = 0; mask < 64; mask += 1) {
    const rooms = Object.fromEntries(pack.scenarios.map((scenario, index) => [
      scenario.id,
      { ...base.rooms[scenario.id], entered: Boolean(mask & (1 << index)) },
    ]));
    const state = { ...base, rooms };
    for (const target of pack.scenarios) {
      for (const { event, effect } of roomIncomingEvents(state, target.id)) {
        const copy = visibleCrossingCopy(event, effect, state, pack.scenarios);
        const bothEntered = rooms[event.sourceScenarioId].entered && rooms[target.id].entered;
        if (!bothEntered) {
          assert.equal(copy, effect.vagueCue);
          for (const scenario of pack.scenarios) assert.ok(!copy.toLowerCase().includes(scenario.title.toLowerCase()));
        } else {
          assert.ok(copy.includes(pack.scenarios.find((scenario) => scenario.id === event.sourceScenarioId).title));
          assert.ok(copy.includes(target.title));
        }
      }
    }
  }
});

test("distributed choices can make a previously blocked crossover ideal reachable", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const pack = generateScenarioPack(seed);
    let state = createNightState(pack);
    const target = pack.scenarios.at(-1);
    for (const scenario of pack.scenarios.slice(0, -1)) {
      while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
      state = enterNightRoom(state, scenario.id);
      while (!state.rooms[scenario.id].completed) {
        state = advanceToCurrentScene(pack, state, scenario.id);
        const room = state.rooms[scenario.id];
        const scene = scenario.scenes[room.sceneIndex];
        const choice = scene.act === "CORRECTION"
          ? scene.choices.find((item) => item.ethicsTags.includes("distributed-unlock"))
          : firstAvailable(scene, room);
        assert.ok(choice);
        state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
      }
    }
    while (!isRoomOpen(pack, state, target.id)) state = advanceToNextOpening(pack, state);
    state = enterNightRoom(state, target.id);
    for (let beat = 0; beat < 2; beat += 1) {
      state = advanceToCurrentScene(pack, state, target.id);
      const room = state.rooms[target.id];
      const scene = target.scenes[room.sceneIndex];
      const choice = firstAvailable(scene, room);
      state = applyNightChoice(pack, state, target.id, scene.id, choice.id);
    }
    const ideal = target.scenes[2].choices.find((choice) => choice.ideal);
    assert.ok(ideal);
    assert.equal(choiceAccess(ideal, state.rooms[target.id]).locked, false);
    assert.equal(choiceAccess(ideal, state.rooms[target.id]).assembledElsewhere, true);
  }
});

test("the same seed and action order replay to the same state", () => {
  const pack = generateScenarioPack(8080);
  const ids = pack.scenarios.map((scenario) => scenario.id).reverse();
  const first = playOrder(pack, ids);
  let replay = createNightState(pack);
  for (const [roomId, sceneId, choiceId] of first.actions) {
    while (!isRoomOpen(pack, replay, roomId)) replay = advanceToNextOpening(pack, replay);
    replay = enterNightRoom(replay, roomId);
    replay = advanceToCurrentScene(pack, replay, roomId);
    replay = applyNightChoice(pack, replay, roomId, sceneId, choiceId);
  }
  assert.deepEqual(replay, first.state);
});

test("every night contains the six distinct communication dynamics exactly once", () => {
  const expected = new Set([
    "defensive-scapegoating",
    "self-protective-rumor",
    "warm-interior-cool-presentation",
    "cold-interior-warm-presentation",
    "sociocultural-code-mismatch",
    "cross-coalition-code-convergence",
  ]);
  for (let seed = 0; seed < 250; seed += 1) {
    const pack = generateScenarioPack(seed);
    const actual = new Set(pack.scenarios.map((scenario) => scenario.communicationModel.dynamic));
    assert.deepEqual(actual, expected);
    assert.equal(pack.scenarios.find((scenario) => scenario.protagonistModel.kind === "youth").communicationModel.dynamic, "warm-interior-cool-presentation");
    assert.equal(pack.scenarios.find((scenario) => scenario.protagonistModel.kind === "abstract_bad_actor").communicationModel.dynamic, "cold-interior-warm-presentation");
  }
});

test("generated actors keep cohesive situated repertoires while code and world model remain independent", () => {
  const codeContexts = new Map();
  const primaryByKind = new Map();
  for (let seed = 0; seed < 400; seed += 1) {
    const pack = generateScenarioPack(seed);
    assert.equal(pack.generatorVersion, 14);
    assert.equal(pack.night.generationPolicy, "validated-regeneration-without-session-cap");
    const sharedDivergent = pack.scenarios.filter((scenario) => {
      const encounter = scenario.communicationModel.linguisticEncounter;
      return encounter.codeRelation === "shared" && encounter.worldModelRelation === "divergent";
    });
    const differentAligned = pack.scenarios.filter((scenario) => {
      const encounter = scenario.communicationModel.linguisticEncounter;
      return encounter.codeRelation === "different" && encounter.worldModelRelation === "aligned";
    });
    assert.equal(sharedDivergent.length, 1);
    assert.ok(differentAligned.length >= 1);

    const source = sharedDivergent[0];
    const sourceEncounter = source.communicationModel.linguisticEncounter;
    const counterpart = pack.scenarios.find((scenario) =>
      scenario.protagonistModel.languageProfile.id === sourceEncounter.counterpartProfileId,
    );
    assert.ok(counterpart, `seed ${seed} must bind the shared-code audience to another generated actor`);
    assert.notEqual(counterpart.id, source.id);
    assert.equal(sourceEncounter.speakerCodeId, sourceEncounter.audienceCodeId);
    assert.notEqual(sourceEncounter.speakerWorldModel.id, sourceEncounter.audienceWorldModel.id);
    assert.equal(counterpart.protagonistModel.languageProfile.worldModel.id, sourceEncounter.audienceWorldModel.id);
    assert.ok(counterpart.protagonistModel.languageProfile.repertoire.some((access) => access.codeId === sourceEncounter.speakerCodeId));
    const exactModelLinks = pack.night.links.filter((link) => link.mechanism === "model-collision");
    assert.equal(exactModelLinks.length, 1);
    assert.equal(exactModelLinks[0].sourceScenarioId, source.id);
    assert.equal(exactModelLinks[0].targetScenarioId, counterpart.id);
    assert.doesNotMatch(`${exactModelLinks[0].vagueCue} ${exactModelLinks[0].revealedCue}`, /linguistic code|model collision|world model/i);

    for (const scenario of pack.scenarios) {
      const profile = scenario.protagonistModel.languageProfile;
      const axes = new Set(profile.socialContexts.map((facet) => facet.axis));
      const repertoireIds = new Set(profile.repertoire.map((access) => access.codeId));
      assert.ok(axes.has("regional"));
      assert.ok(axes.has("socioeconomic"));
      assert.ok(axes.has("social-group"));
      assert.ok(profile.repertoire.length >= 3);
      assert.equal(repertoireIds.size, profile.repertoire.length);
      assert.ok(repertoireIds.has(profile.primaryCodeId));
      assert.equal(profile.switchRules.length, profile.repertoire.length);
      assert.deepEqual(new Set(profile.switchRules.map((rule) => rule.toCodeId)), repertoireIds);
      assert.ok(profile.switchRules.every((rule) => Object.keys(rule.switchLoad).every((kind) => ["attentional", "relational"].includes(kind))));
      assert.ok(profile.stableCommitments.includes(scenario.objective));
      assert.doesNotMatch(
        `${scenario.communicationModel.publicSurfaceCue} ${scenario.communicationModel.playInferenceHints.join(" ")}`,
        /same[- ]code|different[- ]code|world[- ]model|socioeconomic|class status|linguistic repertoire|code switch/i,
      );
      assert.equal(scenario.communicationModel.playInferenceHints.length, 2);
      assert.ok(scenario.scenes.every((scene) => scene.choices.every((choice) => choice.codeAction && repertoireIds.has(choice.codeAction.toCodeId))));
      assert.ok(scenario.scenes.flatMap((scene) => scene.choices).some((choice) => ["switch", "bridge"].includes(choice.codeAction.mode)));

      const primarySet = primaryByKind.get(scenario.protagonistModel.kind) ?? new Set();
      primarySet.add(profile.primaryCodeId);
      primaryByKind.set(scenario.protagonistModel.kind, primarySet);
      for (const access of profile.repertoire) {
        const record = codeContexts.get(access.codeId) ?? { regions: new Set(), socioeconomic: new Set(), models: new Set() };
        profile.socialContexts.filter((facet) => facet.axis === "regional").forEach((facet) => record.regions.add(facet.description));
        profile.socialContexts.filter((facet) => facet.axis === "socioeconomic").forEach((facet) => record.socioeconomic.add(facet.description));
        record.models.add(profile.worldModel.id);
        codeContexts.set(access.codeId, record);
      }
    }
  }
  assert.equal(codeContexts.size, 10);
  for (const [codeId, record] of codeContexts) {
    assert.ok(record.regions.size >= 2, `${codeId} must span regional contexts`);
    assert.ok(record.socioeconomic.size >= 2, `${codeId} must span socioeconomic contexts`);
    assert.ok(record.models.size >= 2, `${codeId} must span world models`);
  }
  for (const [kind, primaryCodes] of primaryByKind) {
    assert.ok(primaryCodes.size >= 2, `${kind} must not map to one essentialized primary code`);
  }
});

test("a selected code switch persists bounded load without changing truth or discernment", () => {
  const pack = generateScenarioPack(20260820);
  const scenario = pack.scenarios.find((candidate) => {
    const primary = candidate.protagonistModel.languageProfile.primaryCodeId;
    return candidate.scenes[0].choices.some((choice) =>
      choice.availability.status === "available" && choice.codeAction?.toCodeId !== primary,
    );
  });
  assert.ok(scenario);
  let state = createNightState(pack);
  while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, scenario.id);
  state = advanceToCurrentScene(pack, state, scenario.id);
  const roomBefore = state.rooms[scenario.id];
  const scene = scenario.scenes[roomBefore.sceneIndex];
  const choice = scene.choices.find((candidate) =>
    candidate.availability.status === "available"
      && candidate.codeAction?.toCodeId !== roomBefore.activeCodeId
      && !choiceAccess(candidate, roomBefore).locked,
  );
  assert.ok(choice?.codeAction);
  const truthBefore = structuredClone(scenario.truth);
  const discernmentBefore = roomBefore.metrics.discernment;
  const fatigueBefore = structuredClone(roomBefore.fatigue);
  const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  const roomAfter = next.rooms[scenario.id];
  const event = next.decisions.at(-1);
  assert.ok(event?.codeTransition);
  assert.equal(event.codeTransition.fromCodeId, roomBefore.activeCodeId);
  assert.equal(event.codeTransition.toCodeId, choice.codeAction.toCodeId);
  assert.equal(roomAfter.activeCodeId, choice.codeAction.toCodeId);
  assert.deepEqual(event.codeTransition.switchLoad, choice.codeAction.switchLoad);
  assert.ok(Object.keys(event.codeTransition.switchLoad).every((kind) => ["attentional", "relational"].includes(kind)));
  for (const [kind, amount] of Object.entries(choice.codeAction.switchLoad)) {
    assert.ok(roomAfter.fatigue[kind] - fatigueBefore[kind] >= amount);
  }
  assert.ok(roomAfter.metrics.discernment >= discernmentBefore);
  assert.deepEqual(scenario.truth, truthBefore);
  assert.deepEqual(validateNightState(pack, next), []);
});

test("locked ideals are deterministically shuffled through every choice position", () => {
  const positions = new Set();
  for (let seed = 0; seed < 250; seed += 1) {
    const first = generateScenarioPack(seed);
    const replay = generateScenarioPack(seed);
    assert.deepEqual(
      first.scenarios.map((scenario) => scenario.scenes.map((scene) => scene.choices.map((choice) => choice.id))),
      replay.scenarios.map((scenario) => scenario.scenes.map((scene) => scene.choices.map((choice) => choice.id))),
    );
    for (const scenario of first.scenarios) {
      for (const scene of scenario.scenes.slice(0, 3)) {
        const position = scene.choices.findIndex((choice) => choice.ideal && choice.availability.status === "locked");
        assert.notEqual(position, -1);
        positions.add(position);
      }
    }
  }
  assert.deepEqual(positions, new Set([0, 1, 2]));
});

test("every night keeps deliberate-protection ledgers internally bound, private, and available through player agency", () => {
  const required = new Set(["self", "friend", "family", "person-under-authority"]);
  const requiredDomains = new Set(["social-class-story", "sociocultural-standing", "professional-standing", "political-standing", "market-position"]);
  for (let seed = 0; seed < 250; seed += 1) {
    const pack = generateScenarioPack(seed);
    const beneficiaries = new Set(pack.scenarios.map((scenario) => scenario.communicationModel.misrepresentation.beneficiary));
    for (const beneficiary of required) assert.ok(beneficiaries.has(beneficiary), `seed ${seed} missing ${beneficiary}`);
    const domains = new Set(pack.scenarios.flatMap((scenario) => scenario.communicationModel.misrepresentation.incentiveIntersection.advancementDomains));
    for (const domain of requiredDomains) assert.ok(domains.has(domain), `seed ${seed} missing ${domain}`);

    for (const scenario of pack.scenarios) {
      const ledger = scenario.communicationModel.misrepresentation;
      const bindings = ledger.factBindings;
      assert.equal(ledger.intentionality, "deliberate");
      assert.ok(scenario.id.startsWith(`${bindings.incidentId}-`));
      assert.equal(bindings.knownRecord, ledger.knownRecord);
      assert.equal(bindings.alteredAccount, ledger.alteredAccount);
      assert.equal(bindings.audienceCost, ledger.audienceCost);
      assert.equal(bindings.correctionDuty, ledger.correctionDuty);
      const publicTruthAndArtifacts = [
        ...Object.values(scenario.truth),
        ...Object.values(scenario.propagation),
        ...scenario.scenes.map((scene) => scene.artifactCopy),
        ...scenario.scenes.flatMap((scene) => [
          ...scene.disclosure.records,
          ...scene.disclosure.questions,
          ...scene.disclosure.unknowns,
        ].map((atom) => atom.copy)),
      ].join(" ");
      for (const privateBinding of [bindings.knownRecord, bindings.alteredAccount, bindings.audienceCost, bindings.correctionDuty]) {
        assert.ok(!publicTruthAndArtifacts.includes(privateBinding), `${scenario.id} leaked a private deliberate-protection binding`);
      }
      const incentive = ledger.incentiveIntersection;
      assert.ok(incentive.competenceThreat.length > 40);
      assert.ok(incentive.fearedInference.length > 40);
      assert.ok(incentive.materialCounterrecord.length > 55);
      assert.ok(incentive.protectedGroupStory.length > 50);
      assert.ok(incentive.advancementDomains.length >= 2);
      assert.ok(incentive.competitivePrize.length > 20);
      assert.notEqual(incentive.materialCounterrecord, incentive.protectedGroupStory);

      for (const scene of scenario.scenes.slice(1)) {
        const deliberate = scene.choices.find((choice) => choice.relationalMove.misrepresentation.intentionality === "deliberate");
        assert.ok(deliberate, `${scenario.id} ${scene.act} must offer a deliberate route`);
        assert.equal(deliberate.relationalMove.misrepresentation.beneficiary, ledger.beneficiary);
        assert.equal(deliberate.relationalMove.misrepresentation.recordDeparture, ledger.alteredAccount);
        assert.equal(deliberate.relationalMove.misrepresentation.incentiveIntersection, incentive.combinedMotive);
        assert.ok(deliberate.ethicsTags.includes("deliberate-misrepresentation"));
      }
      if (ledger.beneficiary === "person-under-authority") {
        assert.match(ledger.authorityCondition, /supervis|official account|depends on its evaluation/i);
      }
    }
  }
});

test("conversation diversion stays sparse, deterministic, and distinct from truth status", () => {
  const expectedModes = new Set(["adjacent-concern", "meme-deflection", "absurdist-derailment"]);
  const compatible = {
    "adjacent-concern": new Set(["caregiver", "marketer", "political", "institutional"]),
    "meme-deflection": new Set(["youth", "creator", "marketer", "political"]),
    "absurdist-derailment": new Set(["creator", "political", "abstract_bad_actor"]),
  };
  const positions = new Set();
  for (let seed = 0; seed < 250; seed += 1) {
    const pack = generateScenarioPack(seed);
    const replay = generateScenarioPack(seed);
    const entries = pack.scenarios.flatMap((scenario) => scenario.scenes.flatMap((scene) => scene.choices
      .map((choice, index) => ({ scenario, scene, choice, index }))
      .filter(({ choice }) => choice.conversationDiversion)));
    const replayEntries = replay.scenarios.flatMap((scenario) => scenario.scenes.flatMap((scene) => scene.choices
      .filter((choice) => choice.conversationDiversion)
      .map((choice) => [scenario.id, scene.id, choice.id, choice.conversationDiversion])));

    assert.equal(entries.length, 3);
    assert.equal(new Set(entries.map(({ scenario }) => scenario.id)).size, 3);
    assert.deepEqual(new Set(entries.map(({ choice }) => choice.conversationDiversion.mode)), expectedModes);
    assert.deepEqual(entries.map(({ scenario, scene, choice }) => [scenario.id, scene.id, choice.id, choice.conversationDiversion]), replayEntries);

    for (const { scenario, scene, choice, index } of entries) {
      const route = choice.conversationDiversion;
      positions.add(index);
      assert.ok(compatible[route.mode].has(scenario.protagonistModel.kind));
      assert.equal(route.scenePhase, scene.act);
      assert.equal(route.intentionality, "deliberate");
      assert.equal(route.placement, "same-thread");
      assert.ok(route.activeQuestion.length > 45);
      assert.ok(route.displacementEffect.length > 65);
      assert.ok(route.betterRoute.length > 60);
      assert.ok(choice.effects.threadFocus < 0);
      assert.ok((choice.effects.discernment ?? 0) >= 0);
      assert.equal(choice.lastResort, undefined);
      assert.notEqual(choice.behaviorMove, "surge");
      assert.equal(choice.relationalMove.misrepresentation.intentionality, "deliberate", "diversion remains orthogonal to the underlying relational move");
      assert.doesNotMatch(`${choice.label} ${choice.detail} ${choice.signal}`, /diversion|deflection|derailment|off-topic|wrong thread/i);

      if (route.mode === "adjacent-concern") {
        assert.equal(route.propositionStatus, "supported");
        assert.equal(route.responseFit, "adjacent-separate-thread");
        assert.ok(route.recordBasis.length > 70);
        assert.ok(route.betterRoute.toLowerCase().includes("separate post"));
        assert.ok([...Object.values(scenario.truth), ...Object.values(scenario.propagation)].every((value) => !value.includes(route.recordBasis)), "the separate concern must not merge into the active incident ledger");
        assert.ok(choice.effects.commonGround > 0, "a true adjacent concern may retain some material common ground");
      } else {
        assert.equal(route.propositionStatus, "no-proposition");
        assert.equal(route.responseFit, route.mode === "meme-deflection" ? "format-only" : "nonresponsive");
        assert.doesNotMatch(JSON.stringify(route), /false meme|meme is false|falsehood/i);
      }
    }
  }
  assert.deepEqual(positions, new Set([0, 1, 2]), "the wrapped choice remains inside deterministic shuffled ordering");
});

test("a chosen diversion persists beside its relational move and emits no incident repair support", () => {
  const pack = generateScenarioPack(20260819);
  for (const scenario of pack.scenarios) {
    const targetIndex = scenario.scenes.findIndex((scene) => scene.choices.some((choice) => choice.conversationDiversion));
    if (targetIndex < 0) continue;
    let state = createNightState(pack);
    while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
    state = enterNightRoom(state, scenario.id);
    for (let index = 0; index < targetIndex; index += 1) {
      state = advanceToCurrentScene(pack, state, scenario.id);
      const room = state.rooms[scenario.id];
      const scene = scenario.scenes[room.sceneIndex];
      const choice = scene.choices.find((item) => !item.conversationDiversion && !choiceAccess(item, room).locked);
      assert.ok(choice);
      state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    }
    state = advanceToCurrentScene(pack, state, scenario.id);
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const choice = scene.choices.find((item) => item.conversationDiversion);
    assert.ok(choice && !choiceAccess(choice, room).locked);
    state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    const event = state.decisions.at(-1);
    assert.deepEqual(event.conversationDiversion, choice.conversationDiversion);
    assert.deepEqual(event.relationalMove, choice.relationalMove);
    assert.ok(event.effects.every((effect) => effect.supportAdded.length === 0));
    assert.deepEqual(validateNightState(pack, state), []);
  }
});

test("truth, propagation, beat disclosure, and communication analysis remain separately incident-bound", () => {
  for (let seed = 0; seed < 250; seed += 1) {
    const pack = generateScenarioPack(seed);
    for (const scenario of pack.scenarios) {
      const ledger = scenario.communicationModel;
      const bindings = ledger.factBindings;
      assert.ok(scenario.id.startsWith(`${bindings.incidentId}-`), "binding must identify the active incident");
      assert.ok(bindings.hookId.startsWith(`${bindings.incidentId}-`), "binding must use that incident's reviewed hook");
      assert.deepEqual(Object.keys(scenario.truth), ["knownFact", "unresolvedAtEntry", "laterResolution"]);
      assert.deepEqual(Object.keys(scenario.propagation), ["circulatingFrame"]);
      assert.equal(scenario.scenes[0].artifactCopy, scenario.truth.knownFact);
      assert.equal(scenario.scenes[1].artifactCopy, scenario.propagation.circulatingFrame);
      assert.ok(scenario.scenes[2].artifactCopy.includes(scenario.truth.unresolvedAtEntry));
      assert.equal(scenario.scenes[3].artifactCopy, scenario.truth.laterResolution);
      const publicTruthAndArtifacts = [
        ...Object.values(scenario.truth),
        ...Object.values(scenario.propagation),
        ...scenario.scenes.map((scene) => scene.artifactCopy),
      ].join(" ");
      for (const analyticBinding of [bindings.surface, bindings.bridge, bindings.crossover, bindings.correction]) {
        assert.ok(!publicTruthAndArtifacts.includes(analyticBinding), `${scenario.id} merged analytic copy into the public incident arc`);
      }
      assert.ok(ledger.observableRecord.join(" ").includes(bindings.surface));
      assert.ok(ledger.inferences.includes(bindings.bridge));
      assert.ok(ledger.recognitionCues.includes(bindings.crossover));
      assert.ok(ledger.repairMove.includes(bindings.correction));
      const assignmentBrief = ledger.observableRecord.find((copy) => copy.startsWith("The assignment brief rewards"));
      const contractedSeat = scenario.protagonistModel.kind === "abstract_bad_actor";
      const atoms = [];
      const privateAtoms = [];
      const publicLabels = new Set();
      scenario.scenes.forEach((scene) => {
        assert.equal("communication" in scene, false, `${scene.id} must not retain the shared communication ledger`);
        const expectsPrivateBrief = contractedSeat && scene.act === "BRIDGE";
        assert.equal(scene.disclosure.records.length, expectsPrivateBrief ? 2 : 1);
        assert.equal(scene.disclosure.questions.length, 1);
        assert.equal(scene.disclosure.unknowns.length, 1);
        const publicRecord = scene.disclosure.records.find((atom) => atom.access === "public-record");
        const privateBrief = scene.disclosure.records.find((atom) => atom.access === "seat-private-assignment-brief");
        assert.ok(publicRecord);
        if (expectsPrivateBrief) {
          assert.ok(privateBrief);
          assert.equal(privateBrief.label, "PRIVATE ASSIGNMENT BRIEF");
          assert.equal(privateBrief.copy, assignmentBrief);
          privateAtoms.push(privateBrief);
        } else {
          assert.equal(privateBrief, undefined);
        }
        publicLabels.add(publicRecord.label);
        for (const atom of [...scene.disclosure.questions, ...scene.disclosure.unknowns]) {
          assert.equal(atom.access, "public-record");
        }
        for (const atom of [...scene.disclosure.records, ...scene.disclosure.questions, ...scene.disclosure.unknowns]) {
          assert.ok(atom.id.startsWith(`${scene.id}-`));
          assert.ok(atom.label.length > 0);
          assert.ok(atom.copy.length > 20);
          atoms.push(atom);
        }
      });
      assert.equal(privateAtoms.length, contractedSeat ? 1 : 0, "only the contracted seat's bridge beat may expose one assignment brief");
      assert.equal(publicLabels.size, 4, "each beat needs its own public record label");
      assert.equal(new Set(atoms.map((atom) => atom.id)).size, atoms.length, "disclosure atoms must be unique by id");
      if (ledger.claim) {
        assert.ok(bindings.surface.includes(ledger.claim.boundedBehavior));
        assert.equal(bindings.bridge, ledger.claim.traitGeneralization);
        assert.equal(ledger.claim.initiatorExposure, ledger.observableRecord[0]);
        assert.ok(ledger.recognitionCues.join(" ").includes(ledger.claim.targetRole));
      }
    }
  }
});

test("relational crossing mechanisms require compatible represented dynamics", () => {
  const personLabelSources = new Set(["defensive-scapegoating", "self-protective-rumor"]);
  const attributionTargets = new Set([
    "defensive-scapegoating",
    "self-protective-rumor",
    "warm-interior-cool-presentation",
    "cold-interior-warm-presentation",
  ]);
  const codeBearing = new Set(["sociocultural-code-mismatch", "cross-coalition-code-convergence"]);
  for (let seed = 0; seed < 250; seed += 1) {
    const pack = generateScenarioPack(seed);
    let attributionCount = 0;
    let codeCount = 0;
    for (const link of pack.night.links) {
      const source = pack.scenarios.find((scenario) => scenario.id === link.sourceScenarioId);
      const target = pack.scenarios.find((scenario) => scenario.id === link.targetScenarioId);
      assert.ok(source && target);
      if (link.mechanism === "attribution-carryover") {
        attributionCount += 1;
        assert.ok(personLabelSources.has(source.communicationModel.dynamic));
        assert.ok(attributionTargets.has(target.communicationModel.dynamic));
      }
      if (link.mechanism === "code-collision") {
        codeCount += 1;
        assert.ok(codeBearing.has(source.communicationModel.dynamic));
        assert.ok(codeBearing.has(target.communicationModel.dynamic));
      }
    }
    assert.ok(attributionCount > 0);
    assert.ok(codeCount > 0);
  }
});

test("scapegoat and defensive-rumor ledgers separate event, character, benefit, and reply asymmetry", () => {
  const pack = generateScenarioPack(808);
  for (const dynamic of ["defensive-scapegoating", "self-protective-rumor"]) {
    const scenario = pack.scenarios.find((item) => item.communicationModel.dynamic === dynamic);
    assert.ok(scenario);
    const ledger = scenario.communicationModel;
    assert.ok(ledger.claim);
    assert.notEqual(ledger.claim.boundedBehavior, ledger.claim.traitGeneralization);
    assert.equal(ledger.claim.severity, "low-stakes-reputational");
    assert.ok(ledger.claim.initiatorExposure.length > 20);
    assert.ok(ledger.protectedStake.length > 20);
    assert.ok(ledger.unknowns.length >= 2);
    const harmful = scenario.scenes[1].choices.find((choice) => ["blame-transfer", "rumor-carriage"].includes(choice.relationalMove.classification));
    const floor = scenario.scenes[1].choices.find((choice) => choice.ethicsTags.includes("non-amplification-floor"));
    assert.ok(harmful.effects.blame > 0 && harmful.effects.interpretiveGap > 0);
    assert.ok(floor.effects.blame < 0 && floor.effects.interpretiveGap < 0);
  }
});

test("cross-code conflict preserves one concrete common-ground proposition", () => {
  for (let seed = 0; seed < 100; seed += 1) {
    const scenario = generateScenarioPack(seed).scenarios.find((item) => item.communicationModel.dynamic === "cross-coalition-code-convergence");
    assert.ok(scenario.communicationModel.substantiveCommonGround);
    assert.ok(scenario.communicationModel.substantiveCommonGround.length >= 70);
    assert.ok(scenario.communicationModel.factBindings.surface.includes("Two coalitions attach"));
    assert.ok(scenario.communicationModel.factBindings.bridge.includes(scenario.communicationModel.substantiveCommonGround));
    assert.ok(scenario.communicationModel.factBindings.correction.includes(scenario.communicationModel.substantiveCommonGround));
    const midpointChoices = scenario.scenes.slice(1, 3).flatMap((scene) => scene.choices);
    const collision = midpointChoices.find((choice) => choice.relationalMove.classification === "code-collision" && !choice.conversationDiversion);
    const translation = midpointChoices.find((choice) => choice.relationalMove.classification === "translation");
    assert.ok(collision, "a non-diverting code-collision route remains available for metric comparison");
    assert.ok(collision.effects.commonGround < 0);
    assert.ok(translation.effects.commonGround > 0);
  }
});

test("modeled platform exposure lowers prosocial follow-through without lowering discernment", () => {
  const pack = generateScenarioPack(20260818);
  const initial = createNightState(pack);
  const advanced = advanceNightTo(pack, initial, 180);
  for (const scenario of pack.scenarios) {
    const before = initial.rooms[scenario.id];
    const after = advanced.rooms[scenario.id];
    assert.ok(after.metrics.discernment >= before.metrics.discernment);
    if (scenario.protagonistModel.prosocialOrientation !== "instrumental") {
      assert.ok(after.metrics.enactment < before.metrics.enactment);
      assert.ok(Object.values(after.fatigue).every((value) => value > 0));
    }
  }
  assert.deepEqual(advanceNightTo(pack, advanced, 180), advanced, "wall-clock delay and repeated reads cannot spend capacity");
});

test("a tired seat still sees the ideal and can always refuse amplification", () => {
  const pack = generateScenarioPack(5150);
  const scenario = pack.scenarios.find((item) => item.protagonistModel.prosocialOrientation === "strong");
  const state = createNightState(pack);
  const tiredRoom = { ...state.rooms[scenario.id], metrics: { ...state.rooms[scenario.id].metrics, enactment: 12 } };
  for (const scene of scenario.scenes) {
    assert.ok(scene.choices.some((choice) => choice.ethicsTags.includes("non-amplification-floor") && !choiceAccess(choice, tiredRoom).locked));
    const ideal = scene.choices.find((choice) => choice.ideal);
    if (ideal) {
      const access = choiceAccess(ideal, tiredRoom);
      assert.ok(access.locked);
      assert.ok(access.willDepleted || access.unmet.length > 0);
      assert.ok(ideal.blockedAttempt?.motive);
      assert.ok(ideal.blockedAttempt?.emotionalOvertake);
      assert.ok(ideal.blockedAttempt?.trigger);
    }
  }
});

test("high-discernment prosocial seats gain one last resort only under extreme modeled fatigue", () => {
  const pack = generateScenarioPack(2608);
  for (const scenario of pack.scenarios) {
    const moves = scenario.scenes.flatMap((scene) => scene.choices.filter((choice) => choice.lastResort));
    const eligible = scenario.protagonistModel.prosocialOrientation === "strong"
      && scenario.protagonistModel.discernmentBaseline >= 84;
    assert.equal(moves.length, eligible ? 1 : 0);
    if (!eligible) continue;
    const move = moves[0];
    const freshRoom = createNightState(pack).rooms[scenario.id];
    assert.equal(choiceAccess(move, freshRoom).lastResortUnavailable, true);
    const extremeRoom = {
      ...freshRoom,
      metrics: { ...freshRoom.metrics, discernment: 86, enactment: 50 },
      fatigue: { attentional: 40, affective: 40, relational: 40, verification: 35, efficacy: 35 },
    };
    assert.equal(choiceAccess(move, extremeRoom).locked, false);
    assert.ok(move.lastResort.positiveConsequence.length > 35);
    assert.ok(move.lastResort.negativeConsequence.length > 35);
    assert.notEqual(move.lastResort.protectedParty, move.lastResort.harmedParty);
    assert.ok((move.effects.discernment ?? 0) >= 0);
    assert.ok((move.effects.enactment ?? 0) <= -18);
  }
});

test("a last-resort decision persists its asymmetric protection and cost receipt", () => {
  const pack = generateScenarioPack(2609);
  const scenario = pack.scenarios.find((item) => item.protagonistModel.prosocialOrientation === "strong");
  assert.ok(scenario);
  let state = createNightState(pack);
  while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, scenario.id);
  for (let beat = 0; beat < 3; beat += 1) {
    state = advanceToCurrentScene(pack, state, scenario.id);
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const choice = scene.choices.find((item) => !item.lastResort && !choiceAccess(item, room).locked);
    assert.ok(choice);
    state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  }
  state = advanceToCurrentScene(pack, state, scenario.id);
  const room = state.rooms[scenario.id];
  state = {
    ...state,
    rooms: {
      ...state.rooms,
      [scenario.id]: {
        ...room,
        metrics: { ...room.metrics, discernment: 86, enactment: 50 },
        fatigue: { attentional: 40, affective: 40, relational: 40, verification: 35, efficacy: 35 },
      },
    },
  };
  const scene = scenario.scenes[state.rooms[scenario.id].sceneIndex];
  const choice = scene.choices.find((item) => item.lastResort);
  assert.ok(choice);
  const next = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  const event = next.decisions.at(-1);
  assert.ok(event?.lastResort);
  assert.equal(event.lastResort.protectedParty, choice.lastResort.protectedParty);
  assert.equal(event.lastResort.harmedParty, choice.lastResort.harmedParty);
  assert.ok(next.rooms[scenario.id].metrics.discernment >= state.rooms[scenario.id].metrics.discernment);
});

test("escalation phases are situational rather than a mandatory seven-step script", () => {
  for (let seed = 0; seed < 200; seed += 1) {
    const pack = generateScenarioPack(seed);
    const coordinator = pack.scenarios.find((scenario) => scenario.protagonistModel.kind === "abstract_bad_actor");
    assert.ok(coordinator);
    assert.equal(coordinator.behaviorCycle.modeled, false);
    assert.equal(coordinator.behaviorCycle.initialPhase, null);
    assert.deepEqual(coordinator.behaviorCycle.possiblePhases, []);
    const human = pack.scenarios.filter((scenario) => scenario.protagonistModel.kind !== "abstract_bad_actor");
    assert.ok(human.every((scenario) => scenario.behaviorCycle.modeled));
    assert.ok(human.some((scenario) => scenario.behaviorCycle.omittedByDefault.length > 0));
    assert.ok(human.every((scenario) => scenario.scenes.every((scene) => scene.choices.every((choice) => choice.behaviorMove))));
  }
});

test("choices can intensify, interrupt, skip crisis, relapse, and reach recovery only after de-escalation", () => {
  const pack = generateScenarioPack(2610);
  const scenario = pack.scenarios.find((item) => item.protagonistModel.prosocialOrientation === "strong" && item.behaviorCycle.initialPhase === "calm");
  assert.ok(scenario);
  const room = createNightState(pack).rooms[scenario.id];
  const intensify = scenario.scenes.flatMap((scene) => scene.choices).find((choice) => choice.behaviorMove === "intensify");
  const contain = scenario.scenes.flatMap((scene) => scene.choices).find((choice) => choice.behaviorMove === "contain");
  const settle = scenario.scenes.flatMap((scene) => scene.choices).find((choice) => choice.behaviorMove === "settle");
  assert.ok(intensify && contain && settle);
  assert.equal(behaviorTransitionFor(scenario, room, intensify)?.to, "trigger");
  assert.equal(behaviorTransitionFor(scenario, { ...room, behaviorPhase: "higher-escalation" }, contain)?.to, "de-escalation");
  assert.equal(behaviorTransitionFor(scenario, { ...room, behaviorPhase: "de-escalation" }, settle)?.to, "recovery");
  assert.equal(behaviorTransitionFor(scenario, { ...room, behaviorPhase: "recovery" }, intensify)?.to, "trigger");
  assert.equal(behaviorTransitionFor(scenario, { ...room, behaviorPhase: "trigger" }, settle)?.to, "calm");
});

test("played behavior transitions persist without fabricating phases for instrumental strategy", () => {
  const pack = generateScenarioPack(2611);
  const scenario = pack.scenarios.find((item) => item.protagonistModel.kind !== "abstract_bad_actor");
  assert.ok(scenario);
  let state = createNightState(pack);
  while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, scenario.id);
  while (!state.rooms[scenario.id].completed) {
    state = advanceToCurrentScene(pack, state, scenario.id);
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const choice = scene.choices.find((item) => item.behaviorMove === "contain" && !choiceAccess(item, room).locked)
      ?? firstAvailable(scene, room);
    state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
  }
  const transitions = state.decisions.filter((event) => event.sourceScenarioId === scenario.id).map((event) => event.behaviorTransition);
  assert.equal(transitions.length, 4);
  assert.ok(transitions.every(Boolean));
  assert.ok(!transitions.some((transition) => transition.to === "crisis"));

  const coordinator = pack.scenarios.find((item) => item.protagonistModel.kind === "abstract_bad_actor");
  assert.ok(coordinator);
  const coordinatorRoom = state.rooms[coordinator.id];
  assert.equal(coordinatorRoom.behaviorPhase, null);
  const coordinatorChoice = coordinator.scenes[0].choices.find((choice) => !choiceAccess(choice, coordinatorRoom).locked);
  assert.ok(coordinatorChoice);
  assert.equal(behaviorTransitionFor(coordinator, coordinatorRoom, coordinatorChoice), undefined);
  assert.deepEqual(validateNightState(pack, state), []);
});

test("situated leadership and repair conversation remain sparse and situational", () => {
  let nightsWithoutLeading = 0;
  let nightsWithoutConflict = 0;
  let nightsWithLeading = 0;
  let nightsWithConflict = 0;
  for (let seed = 0; seed < 300; seed += 1) {
    const pack = generateScenarioPack(seed);
    const leading = pack.scenarios.filter((scenario) => scenario.frameworks.some((framework) => framework.id === "situated-leadership"));
    const conflict = pack.scenarios.filter((scenario) => scenario.frameworks.some((framework) => framework.id === "repair-conversation"));
    assert.ok(leading.length <= 1);
    assert.ok(conflict.length <= 1);
    if (!leading.length) nightsWithoutLeading += 1;
    else {
      nightsWithLeading += 1;
      assert.ok(["youth", "caregiver", "institutional"].includes(leading[0].protagonistModel.kind));
      const moves = leading[0].scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.frameworkMoves ?? [])).filter((move) => move.frameworkId === "situated-leadership");
      assert.deepEqual(moves.map((move) => move.stepId), ["orient-self", "read-the-room", "keep-relation-open", "carry-your-part"]);
    }
    if (!conflict.length) nightsWithoutConflict += 1;
    else {
      nightsWithConflict += 1;
      assert.notEqual(conflict[0].protagonistModel.kind, "youth");
      assert.ok(["defensive-scapegoating", "self-protective-rumor", "sociocultural-code-mismatch", "cross-coalition-code-convergence"].includes(conflict[0].communicationModel.dynamic));
      const moves = conflict[0].scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.frameworkMoves ?? [])).filter((move) => move.frameworkId === "repair-conversation");
      assert.deepEqual(moves.map((move) => move.stepId), ["name-record", "surface-stakes", "open-options", "bind-follow-through"]);
    }
  }
  assert.ok(nightsWithoutLeading > 0 && nightsWithLeading > 0);
  assert.ok(nightsWithoutConflict > 0 && nightsWithConflict > 0);
});

test("the internal situated action review remains sparse, ordered, and situational", () => {
  let nightsWithoutReview = 0;
  let nightsWithReview = 0;
  for (let seed = 0; seed < 300; seed += 1) {
    const pack = generateScenarioPack(seed);
    const reviews = pack.scenarios.filter((scenario) => scenario.frameworks.some((framework) => framework.id === "situated-action-review"));
    assert.ok(reviews.length <= 1);
    if (!reviews.length) {
      nightsWithoutReview += 1;
      continue;
    }
    nightsWithReview += 1;
    const scenario = reviews[0];
    assert.notEqual(scenario.protagonistModel.kind, "youth");
    assert.ok(scenario.behaviorCycle.modeled);
    const moves = scenario.scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.frameworkMoves ?? [])).filter((move) => move.frameworkId === "situated-action-review");
    assert.equal(moves.length, 4);
    assert.deepEqual(moves.map((move) => move.stepId), ["condition", "publics", "limits", "conduct"]);
    assert.ok(moves.every((move) => move.sourceWork === "CHORUS · situated action review"));
    assert.match(moves[0].solution, /what must be decided or repaired/);
    assert.match(moves[1].solution, /represented audiences/);
    assert.match(moves[2].solution, /non-amplification floor/);
    assert.match(moves[3].solution, /reply and privacy/);
  }
  assert.ok(nightsWithoutReview > 0 && nightsWithReview > 0);
});

test("academic social-theory lenses represent context-bound problems, ideas, and solutions without operational tactics", () => {
  const theoryIds = new Set(["social-projection", "reputational-power", "strategic-interaction", "expertise-feedback", "impression-management", "competence-threat"]);
  const works = new Set();
  for (let seed = 0; seed < 300; seed += 1) {
    const pack = generateScenarioPack(seed);
    const lenses = pack.scenarios.flatMap((scenario) => scenario.frameworks.filter((framework) => theoryIds.has(framework.id)));
    assert.equal(lenses.length, 2);
    assert.equal(new Set(lenses.map((lens) => lens.id)).size, 2);
    for (const lens of lenses) {
      works.add(lens.sourceWork);
      assert.ok(lens.problem.length >= 55);
      assert.ok(lens.idea.length >= 55);
      assert.ok(lens.solution.length >= 55);
      assert.doesNotMatch(lens.solution, /targeting|automation|evasion|harassment/i);
    }
  }
  assert.ok(works.size >= 5);
});

test("one unnamed classical strategy tradition is reappropriated as social theory per night", () => {
  const represented = new Set();
  for (let seed = 0; seed < 300; seed += 1) {
    const pack = generateScenarioPack(seed);
    const lenses = pack.scenarios.flatMap((scenario) => scenario.frameworks.filter((framework) => framework.id.startsWith("classical-")));
    assert.equal(lenses.length, 1);
    const lens = lenses[0];
    represented.add(lens.id);
    assert.ok(["classical-institutions", "classical-interdependence", "classical-terrain"].includes(lens.id));
    assert.match(lens.sourceWork, /^Classical .*social-theory reappropriation$/);
    assert.ok(lens.problem.length >= 55 && lens.idea.length >= 55 && lens.solution.length >= 55);
    assert.doesNotMatch(lens.solution, /targeting|automation|evasion|harassment|infiltration/i);
  }
  assert.deepEqual(represented, new Set(["classical-institutions", "classical-interdependence", "classical-terrain"]));
});

test("selected framework applications persist on the decision receipt", () => {
  const pack = generateScenarioPack(2612);
  const theoryIds = new Set(["social-projection", "reputational-power", "strategic-interaction", "expertise-feedback", "impression-management", "competence-threat"]);
  const scenario = pack.scenarios.find((item) => item.scenes.some((scene) => scene.choices.some((choice) => choice.frameworkMoves?.some((move) => theoryIds.has(move.frameworkId)))));
  assert.ok(scenario);
  let state = createNightState(pack);
  while (!isRoomOpen(pack, state, scenario.id)) state = advanceToNextOpening(pack, state);
  state = enterNightRoom(state, scenario.id);
  while (!state.rooms[scenario.id].completed) {
    state = advanceToCurrentScene(pack, state, scenario.id);
    const room = state.rooms[scenario.id];
    const scene = scenario.scenes[room.sceneIndex];
    const tagged = scene.choices.find((choice) => choice.frameworkMoves?.length && !choiceAccess(choice, room).locked);
    const choice = tagged ?? firstAvailable(scene, room);
    state = applyNightChoice(pack, state, scenario.id, scene.id, choice.id);
    if (tagged) {
      const event = state.decisions.at(-1);
      assert.deepEqual(event.frameworkMoves, tagged.frameworkMoves);
      assert.deepEqual(validateNightState(pack, state), []);
      return;
    }
  }
  assert.fail("expected a selectable framework move");
});
