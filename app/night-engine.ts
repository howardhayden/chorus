import type {
  BehaviorMove,
  BehaviorPhase,
  ConversationDiversion,
  ConstraintSystem,
  CrossRoomLink,
  GeneratedChoice,
  GeneratedMetrics,
  GeneratedScenario,
  GeneratedScenarioPack,
  FatigueKind,
  FatigueLoad,
  FrameworkMove,
  LastResortMove,
  LinguisticCodeId,
  MetricName,
  RelationalMove,
} from "./scenario-generator";

export type Metrics = GeneratedMetrics;

export const INITIAL_METRICS: Metrics = {
  reach: 31,
  heat: 12,
  crossover: 2,
  belief: 6,
  consensus: 9,
  provenance: 92,
  verification: 4,
  trust: 52,
  coordination: 0,
  blame: 12,
  interpretiveGap: 14,
  commonGround: 28,
  threadFocus: 76,
  discernment: 84,
  enactment: 88,
};

export type RoomRuntime = {
  scenarioId: string;
  activeCodeId: LinguisticCodeId;
  entered: boolean;
  completed: boolean;
  sceneIndex: number;
  metrics: Metrics;
  atCompletion?: Metrics;
  inboundEventIds: string[];
  localDecisionIds: string[];
  support: Partial<Record<ConstraintSystem, string[]>>;
  fatigue: FatigueLoad;
  platformMinutes: number;
  behaviorPhase: BehaviorPhase | null;
};

export type EffectReceipt = {
  targetScenarioId: string;
  scope: "local" | "cross-room";
  linkId?: string;
  layer?: CrossRoomLink["layer"];
  semantic?: CrossRoomLink["semantic"];
  mechanism?: CrossRoomLink["mechanism"];
  metrics: Partial<Metrics>;
  backgroundReach: number;
  avoidedReach: number;
  appliedReach: number;
  /** True only when a selected choice's typed delivery can use this typed carrier. */
  selectedCarriage: boolean;
  /** Selected reach on a compatible content or format carrier; background is separate. */
  selectedCarriageReach: number;
  supportAdded: ConstraintSystem[];
  vagueCue?: string;
  revealedCue?: string;
};

export type DecisionEvent = {
  id: string;
  turn: number;
  atMinute: number;
  sourceScenarioId: string;
  sourceSceneId: string;
  sourceSeat: string;
  choiceId: string;
  choiceLabel: string;
  intent: string;
  signal: string;
  minutes: number;
  relationalMove: RelationalMove;
  conversationDiversion?: ConversationDiversion;
  codeTransition?: CodeTransition;
  lastResort?: LastResortMove;
  behaviorTransition?: BehaviorTransition;
  frameworkMoves: FrameworkMove[];
  effects: EffectReceipt[];
};

export type CodeTransition = {
  fromCodeId: LinguisticCodeId;
  toCodeId: LinguisticCodeId;
  mode: "maintain" | "switch" | "bridge";
  audienceContext: string;
  intendedFunction: string;
  switchReason: string;
  switchLoad: Partial<FatigueLoad>;
};

export type BehaviorTransition = {
  from: BehaviorPhase;
  to: BehaviorPhase;
  move: BehaviorMove;
  reason: string;
};

export type AmbientPulseEvent = {
  id: string;
  atMinute: number;
  sourceScenarioId: string;
  sourceSceneId: string;
  sourceSeat: string;
  label: string;
  signal: string;
  effects: EffectReceipt[];
};

export type IncomingHouseEvent = {
  id: string;
  atMinute: number;
  sourceScenarioId: string;
  label: string;
  signal: string;
  kind: "choice" | "ambient";
  effects: EffectReceipt[];
};

export type NightState = {
  seed: number;
  elapsedMinutes: number;
  turn: number;
  rooms: Record<string, RoomRuntime>;
  decisions: DecisionEvent[];
  ambientEvents: AmbientPulseEvent[];
  processedPulseIds: string[];
};

export type ChoiceAccess = {
  locked: boolean;
  assembledElsewhere: boolean;
  unmet: ConstraintSystem[];
  willDepleted: boolean;
  enactmentRequired: number;
  enactmentAvailable: number;
  lastResortUnavailable: boolean;
  compositeFatigue: number;
};

const SYSTEMS: ConstraintSystem[] = ["source", "evidence", "institution", "relationship", "distribution"];
const METRIC_NAMES: MetricName[] = [
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
const FATIGUE_KINDS: FatigueKind[] = ["attentional", "affective", "relational", "verification", "efficacy"];

export function createNightState(pack: GeneratedScenarioPack): NightState {
  const base: NightState = {
    seed: pack.seed,
    elapsedMinutes: 0,
    turn: 0,
    rooms: Object.fromEntries(pack.scenarios.map((scenario) => [
      scenario.id,
      {
        scenarioId: scenario.id,
        activeCodeId: scenario.protagonistModel.languageProfile.primaryCodeId,
        entered: false,
        completed: false,
        sceneIndex: 0,
        metrics: {
          ...INITIAL_METRICS,
          discernment: scenario.protagonistModel.discernmentBaseline,
          enactment: scenario.protagonistModel.enactmentBaseline,
        },
        inboundEventIds: [],
        localDecisionIds: [],
        support: {},
        fatigue: emptyFatigue(),
        platformMinutes: 0,
        behaviorPhase: scenario.behaviorCycle.initialPhase,
      } satisfies RoomRuntime,
    ])),
    decisions: [],
    ambientEvents: [],
    processedPulseIds: [],
  };
  return advanceNightTo(pack, base, 0);
}

export function enterNightRoom(state: NightState, scenarioId: string): NightState {
  const room = state.rooms[scenarioId];
  if (!room || room.entered) return state;
  return {
    ...state,
    rooms: {
      ...state.rooms,
      [scenarioId]: { ...room, entered: true },
    },
  };
}

export function choiceAccess(choice: GeneratedChoice, room: RoomRuntime): ChoiceAccess {
  const unmet = choice.availability.status === "locked"
    ? choice.availability.requires
      .filter((condition) => !condition.currentlyMet && !(room.support[condition.system]?.length))
      .map((condition) => condition.system)
    : [];
  const enactmentRequired = choice.enactmentRequired ?? 0;
  const willDepleted = !choice.ethicsTags.includes("non-amplification-floor")
    && enactmentRequired > 0
    && room.metrics.enactment < enactmentRequired;
  const structurallyLocked = unmet.length > 0;
  const compositeFatigue = Object.values(room.fatigue).reduce((sum, value) => sum + value, 0);
  const dominantFatigue = Math.max(...Object.values(room.fatigue));
  const lastResortUnavailable = Boolean(choice.lastResort) && !(
    room.metrics.discernment >= choice.lastResort!.minimumDiscernment
    && room.metrics.enactment <= choice.lastResort!.maximumEnactment
    && compositeFatigue >= choice.lastResort!.minimumCompositeFatigue
    && dominantFatigue >= choice.lastResort!.minimumDominantFatigue
  );
  return {
    locked: structurallyLocked || willDepleted || lastResortUnavailable,
    assembledElsewhere: choice.availability.status === "locked" && !structurallyLocked && !willDepleted,
    unmet,
    willDepleted,
    enactmentRequired,
    enactmentAvailable: room.metrics.enactment,
    lastResortUnavailable,
    compositeFatigue,
  };
}

export function isChoiceVisible(choice: GeneratedChoice, room: RoomRuntime): boolean {
  return !choice.lastResort || !choiceAccess(choice, room).lastResortUnavailable;
}

const BEHAVIOR_ORDER: BehaviorPhase[] = ["calm", "trigger", "escalation", "higher-escalation", "crisis", "de-escalation", "recovery"];

export function behaviorTransitionFor(
  scenario: GeneratedScenario,
  room: RoomRuntime,
  choice: GeneratedChoice,
): BehaviorTransition | undefined {
  const from = room.behaviorPhase;
  if (!scenario.behaviorCycle.modeled || !from) return undefined;
  const allowed = scenario.behaviorCycle.possiblePhases;
  let to = from;
  if (choice.behaviorMove === "surge") {
    to = allowed.includes("crisis") ? "crisis" : from;
  } else if (choice.behaviorMove === "intensify") {
    const restart = from === "de-escalation" || from === "recovery" ? "trigger" : null;
    if (restart && allowed.includes(restart)) to = restart;
    else {
      const current = BEHAVIOR_ORDER.indexOf(from);
      to = BEHAVIOR_ORDER.slice(current + 1, 5).find((phase) => allowed.includes(phase)) ?? from;
    }
  } else if (choice.behaviorMove === "contain" || choice.behaviorMove === "settle") {
    if (["escalation", "higher-escalation", "crisis"].includes(from) && allowed.includes("de-escalation")) to = "de-escalation";
    else if (from === "de-escalation" && allowed.includes("recovery")) to = "recovery";
    else if (from === "trigger" && choice.behaviorMove === "settle") to = allowed.includes("calm") ? "calm" : allowed.includes("de-escalation") ? "de-escalation" : from;
  }
  const reason = choice.behaviorMove === "surge"
    ? "Extreme modeled load made an extraordinary, high-cost break from the seat's ordinary boundary available."
    : choice.behaviorMove === "intensify"
      ? "The choice narrowed options around threat, status, loyalty, or urgency and increased behavioral pressure."
      : choice.behaviorMove === "hold"
        ? "The choice maintained the present level of behavioral pressure without presuming movement."
        : to === "recovery"
          ? "A second stabilizing move after de-escalation began rebuilding ordinary capacity and relationships."
          : "The choice interrupted further escalation; interruption does not imply that recovery is complete.";
  return { from, to, move: choice.behaviorMove, reason };
}

export function applyNightChoice(
  pack: GeneratedScenarioPack,
  state: NightState,
  sourceScenarioId: string,
  sourceSceneId: string,
  choiceId: string,
): NightState {
  const sourceScenario = pack.scenarios.find((scenario) => scenario.id === sourceScenarioId);
  const sourceRoom = state.rooms[sourceScenarioId];
  if (!sourceScenario || !sourceRoom || !sourceRoom.entered || sourceRoom.completed) return state;
  const scene = sourceScenario.scenes[sourceRoom.sceneIndex];
  const choice = scene?.choices.find((item) => item.id === choiceId);
  if (!scene || scene.id !== sourceSceneId || !choice || choiceAccess(choice, sourceRoom).locked) return state;
  if (!isSceneDue(pack, state, sourceScenarioId)) return state;

  const turn = state.turn + 1;
  const eventId = `${pack.night.id}-turn-${turn}-${choice.id}`;
  if (state.decisions.some((decision) => decision.id === eventId)) return state;
  const atMinute = state.elapsedMinutes + choice.minutes;
  const advancedState = advanceNightTo(pack, state, atMinute);
  const activeSourceRoom = advancedState.rooms[sourceScenarioId];
  const codeTransition = codeTransitionFor(sourceScenario, activeSourceRoom, choice);
  if (choice.codeAction && !codeTransition) return state;
  const behaviorTransition = behaviorTransitionFor(sourceScenario, activeSourceRoom, choice);
  const emittedSupport = supportEmittedByChoice(choice);
  const nextRooms: Record<string, RoomRuntime> = {};
  const receipts: EffectReceipt[] = [];

  pack.scenarios.forEach((targetScenario) => {
    const targetRoom = advancedState.rooms[targetScenario.id];
    if (targetScenario.id === sourceScenarioId) {
      const localLoad = addFatigue(
        addFatigue(emptyFatigue(), choice.fatigueLoad),
        codeTransition?.switchLoad ?? {},
      );
      const local = calculateLocalReceipt(choice, targetRoom.metrics, targetScenario.audienceCeiling);
      const loadedMetrics = applyModeledLoad(
        applyReceipt(targetRoom.metrics, local),
        localLoad,
        targetScenario.protagonistModel.prosocialOrientation,
      );
      const metrics = preserveDiscernment(targetRoom.metrics, loadedMetrics);
      const completes = activeSourceRoom.sceneIndex === sourceScenario.scenes.length - 1;
      const advanced: RoomRuntime = {
        ...targetRoom,
        activeCodeId: codeTransition?.toCodeId ?? targetRoom.activeCodeId,
        completed: completes,
        sceneIndex: completes ? sourceScenario.scenes.length : activeSourceRoom.sceneIndex + 1,
        metrics,
        atCompletion: completes ? { ...metrics } : targetRoom.atCompletion,
        localDecisionIds: [...targetRoom.localDecisionIds, eventId],
        fatigue: addFatigue(targetRoom.fatigue, localLoad),
        platformMinutes: targetRoom.platformMinutes + choice.minutes,
        behaviorPhase: behaviorTransition?.to ?? targetRoom.behaviorPhase,
      };
      nextRooms[targetScenario.id] = advanced;
      receipts.push({
        targetScenarioId: targetScenario.id,
        scope: "local",
        metrics: local.effects,
        backgroundReach: local.backgroundReach,
        avoidedReach: local.avoidedReach,
        appliedReach: local.appliedReach,
        selectedCarriage: false,
        selectedCarriageReach: 0,
        supportAdded: [],
      });
      return;
    }

    const link = pack.night.links.find((item) =>
      item.sourceScenarioId === sourceScenarioId && item.targetScenarioId === targetScenario.id,
    );
    if (!link) throw new Error(`Missing CHORUS cross-room link ${sourceScenarioId} -> ${targetScenario.id}`);
    const cross = calculateCrossRoomReceipt(choice, link, targetRoom.metrics, targetScenario.audienceCeiling);
    const remoteLoad = crossFatigue(choice.fatigueLoad, link);
    const metrics = preserveDiscernment(targetRoom.metrics, applyModeledLoad(
      applyReceipt(targetRoom.metrics, cross),
      remoteLoad,
      targetScenario.protagonistModel.prosocialOrientation,
    ));
    const supportAdded = emittedSupport.filter((system) => link.repairCapacity.includes(system));
    const support = addSupport(targetRoom.support, supportAdded, eventId);
    nextRooms[targetScenario.id] = {
      ...targetRoom,
      metrics,
      support,
      inboundEventIds: [...targetRoom.inboundEventIds, eventId],
      fatigue: addFatigue(targetRoom.fatigue, remoteLoad),
    };
    receipts.push({
      targetScenarioId: targetScenario.id,
      scope: "cross-room",
      linkId: link.id,
      layer: link.layer,
      semantic: link.semantic,
      mechanism: link.mechanism,
      metrics: cross.effects,
      backgroundReach: cross.backgroundReach,
      avoidedReach: cross.avoidedReach,
      appliedReach: cross.appliedReach,
      selectedCarriage: cross.selectedCarriage,
      selectedCarriageReach: cross.selectedCarriageReach,
      supportAdded,
      vagueCue: link.vagueCue,
      revealedCue: link.revealedCue,
    });
  });

  if (receipts.length !== pack.scenarios.length || receipts.filter((receipt) => receipt.scope === "cross-room").length !== pack.scenarios.length - 1) {
    throw new Error("Every CHORUS decision must materialize one local and five cross-room receipts.");
  }

  const event: DecisionEvent = {
    id: eventId,
    turn,
    atMinute,
    sourceScenarioId,
    sourceSceneId: scene.id,
    sourceSeat: scene.seat,
    choiceId: choice.id,
    choiceLabel: choice.label,
    intent: choice.intent,
    signal: choice.availability.status === "locked"
      ? "source-linked repair · path assembled across rooms"
      : choice.signal,
    minutes: choice.minutes,
    relationalMove: choice.relationalMove,
    conversationDiversion: choice.conversationDiversion,
    codeTransition,
    lastResort: choice.lastResort,
    behaviorTransition,
    frameworkMoves: choice.frameworkMoves ?? [],
    effects: receipts,
  };

  return {
    ...advancedState,
    elapsedMinutes: atMinute,
    turn,
    rooms: nextRooms,
    decisions: [...advancedState.decisions, event],
  };
}

export function advanceNightTo(
  pack: GeneratedScenarioPack,
  state: NightState,
  targetMinute: number,
): NightState {
  if (!Number.isSafeInteger(targetMinute) || targetMinute < 0 || targetMinute < state.elapsedMinutes) return state;
  const rooms = { ...state.rooms };
  const processed = new Set(state.processedPulseIds);
  const ambientEvents = [...state.ambientEvents];
  const due = pack.scenarios.flatMap((scenario) =>
    scenario.scenes.map((scene) => ({
      scenario,
      scene,
      atMinute: minutesBetween(pack.night.startTime, scene.time),
      id: `pulse-${scene.id}`,
    })),
  ).filter((pulse) => pulse.atMinute <= targetMinute && !processed.has(pulse.id))
    .sort((left, right) => left.atMinute - right.atMinute || left.id.localeCompare(right.id));

  due.forEach((pulse) => {
    const receipts: EffectReceipt[] = [];
    pack.scenarios.forEach((targetScenario) => {
      const targetRoom = rooms[targetScenario.id];
      if (targetScenario.id === pulse.scenario.id) {
        const local = calculatePulseReceipt(pulse.scene.autonomous, targetRoom.metrics, targetScenario.audienceCeiling, 0.42);
        const metrics = preserveDiscernment(targetRoom.metrics, applyModeledLoad(
          applyReceipt(targetRoom.metrics, local),
          pulse.scene.platformLoad,
          targetScenario.protagonistModel.prosocialOrientation,
        ));
        rooms[targetScenario.id] = {
          ...targetRoom,
          metrics,
          fatigue: addFatigue(targetRoom.fatigue, pulse.scene.platformLoad),
          platformMinutes: targetRoom.platformMinutes + Math.max(2, Math.round(pulse.atMinute / 12)),
        };
        receipts.push({
          targetScenarioId: targetScenario.id,
          scope: "local",
          metrics: local.effects,
          backgroundReach: 0,
          avoidedReach: local.avoidedReach,
          appliedReach: local.appliedReach,
          selectedCarriage: false,
          selectedCarriageReach: 0,
          supportAdded: [],
        });
        return;
      }
      const link = pack.night.links.find((item) =>
        item.sourceScenarioId === pulse.scenario.id && item.targetScenarioId === targetScenario.id,
      );
      if (!link) throw new Error(`Missing CHORUS ambient route ${pulse.scenario.id} -> ${targetScenario.id}`);
      const remote = calculateAmbientPulseReceipt(pulse.scene.autonomous, link, targetRoom.metrics, targetScenario.audienceCeiling);
      const remoteLoad = crossFatigue(pulse.scene.platformLoad, link);
      rooms[targetScenario.id] = {
        ...targetRoom,
        metrics: preserveDiscernment(targetRoom.metrics, applyModeledLoad(
          applyReceipt(targetRoom.metrics, remote),
          remoteLoad,
          targetScenario.protagonistModel.prosocialOrientation,
        )),
        fatigue: addFatigue(targetRoom.fatigue, remoteLoad),
        inboundEventIds: [...targetRoom.inboundEventIds, pulse.id],
      };
      receipts.push({
        targetScenarioId: targetScenario.id,
        scope: "cross-room",
        linkId: link.id,
        layer: link.layer,
        semantic: link.semantic,
        mechanism: link.mechanism,
        metrics: remote.effects,
        backgroundReach: 0,
        avoidedReach: remote.avoidedReach,
        appliedReach: remote.appliedReach,
        selectedCarriage: false,
        selectedCarriageReach: 0,
        supportAdded: [],
        vagueCue: link.vagueCue,
        revealedCue: link.revealedCue,
      });
    });
    ambientEvents.push({
      id: pulse.id,
      atMinute: pulse.atMinute,
      sourceScenarioId: pulse.scenario.id,
      sourceSceneId: pulse.scene.id,
      sourceSeat: pulse.scene.seat,
      label: `${pulse.scene.act.toLowerCase()} activity arrived before this seat chose`,
      signal: pulse.scene.interstitial,
      effects: receipts,
    });
    processed.add(pulse.id);
  });

  return {
    ...state,
    elapsedMinutes: targetMinute,
    rooms,
    ambientEvents,
    processedPulseIds: [...processed],
  };
}

export function roomIncomingEvents(state: NightState, scenarioId: string): Array<{ event: IncomingHouseEvent; effect: EffectReceipt }> {
  const choiceEvents: IncomingHouseEvent[] = state.decisions.map((event) => ({
    id: event.id,
    atMinute: event.atMinute,
    sourceScenarioId: event.sourceScenarioId,
    label: event.choiceLabel,
    signal: event.signal,
    kind: "choice",
    effects: event.effects,
  }));
  const ambientEvents: IncomingHouseEvent[] = state.ambientEvents.map((event) => ({
    id: event.id,
    atMinute: event.atMinute,
    sourceScenarioId: event.sourceScenarioId,
    label: event.label,
    signal: event.signal,
    kind: "ambient",
    effects: event.effects,
  }));
  return [...choiceEvents, ...ambientEvents].sort((left, right) => left.atMinute - right.atMinute).flatMap((event) => {
    const effect = event.effects.find((item) => item.targetScenarioId === scenarioId && item.scope === "cross-room");
    return effect ? [{ event, effect }] : [];
  });
}

export function isNightComplete(state: NightState): boolean {
  const rooms = Object.values(state.rooms);
  return rooms.length > 0 && rooms.every((room) => room.completed);
}

export function completedRoomCount(state: NightState): number {
  return Object.values(state.rooms).filter((room) => room.completed).length;
}

export function enteredRoomCount(state: NightState): number {
  return Object.values(state.rooms).filter((room) => room.entered).length;
}

export function roomStartOffset(pack: GeneratedScenarioPack, scenarioId: string): number {
  const scenario = pack.scenarios.find((item) => item.id === scenarioId);
  return scenario ? minutesBetween(pack.night.startTime, scenario.startTime) : 0;
}

export function sceneArrivalOffset(
  pack: GeneratedScenarioPack,
  scenarioId: string,
  sceneIndex: number,
): number {
  const scenario = pack.scenarios.find((item) => item.id === scenarioId);
  const scene = scenario?.scenes[sceneIndex];
  return scene ? minutesBetween(pack.night.startTime, scene.time) : Number.POSITIVE_INFINITY;
}

export function isSceneDue(
  pack: GeneratedScenarioPack,
  state: NightState,
  scenarioId: string,
): boolean {
  const room = state.rooms[scenarioId];
  if (!room || room.completed) return false;
  return state.elapsedMinutes >= sceneArrivalOffset(pack, scenarioId, room.sceneIndex);
}

export function isRoomOpen(pack: GeneratedScenarioPack, state: NightState, scenarioId: string): boolean {
  return state.elapsedMinutes >= roomStartOffset(pack, scenarioId);
}

export function advanceToNextOpening(pack: GeneratedScenarioPack, state: NightState): NightState {
  const next = pack.scenarios
    .filter((scenario) => !state.rooms[scenario.id]?.entered)
    .map((scenario) => roomStartOffset(pack, scenario.id))
    .filter((minute) => minute > state.elapsedMinutes)
    .sort((left, right) => left - right)[0];
  return next === undefined ? state : advanceNightTo(pack, state, next);
}

export function formatNightClock(startTime: string, elapsedMinutes: number): string {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(startTime);
  if (!match) return startTime;
  const baseHour = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
  const total = (baseHour * 60 + Number(match[2]) + elapsedMinutes) % (24 * 60);
  const hour24 = Math.floor(total / 60);
  return `${hour24 % 12 || 12}:${String(total % 60).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

export function visibleCrossingCopy(
  event: IncomingHouseEvent,
  effect: EffectReceipt,
  state: NightState,
  scenarios: GeneratedScenario[],
): string {
  const sourceEntered = state.rooms[event.sourceScenarioId]?.entered;
  const targetEntered = state.rooms[effect.targetScenarioId]?.entered;
  if (!sourceEntered || !targetEntered) return effect.vagueCue ?? "Pressure elsewhere in the house changed this room.";
  const source = scenarios.find((scenario) => scenario.id === event.sourceScenarioId);
  const target = scenarios.find((scenario) => scenario.id === effect.targetScenarioId);
  const sourceTitle = source?.title ?? "Another room";
  const targetTitle = target?.title ?? "this room";
  const neutralCue = `A route between ${sourceTitle} and ${targetTitle} is now visible.`;
  const isChoice = event.kind === "choice";
  const hasCoherentSelectedCarriage = isChoice
    && effect.selectedCarriage
    && effect.selectedCarriageReach >= 0
    && effect.selectedCarriageReach === effect.appliedReach
    && (effect.selectedCarriageReach > 0 || (effect.metrics.crossover ?? 0) > 0);
  const selectedContent = effect.semantic === "content" && hasCoherentSelectedCarriage;
  const selectedFormat = effect.semantic === "format" && hasCoherentSelectedCarriage;
  const cue = selectedContent
    ? effect.revealedCue ?? `A shared channel between ${sourceTitle} and ${targetTitle} is now visible.`
    : selectedFormat
      ? effect.revealedCue ?? `A recognizable format links ${sourceTitle} and ${targetTitle}.`
      : neutralCue;

  let semanticCopy: string;
  if (!isChoice) {
    semanticCopy = effect.semantic === "content"
      ? "Autonomous house activity changed conditions along a content-capable route; no message content crossed."
      : effect.semantic === "format"
        ? "Autonomous house activity changed conditions along a format-capable route; no recognizable form or message content crossed."
        : effect.semantic === "ambient"
          ? "Autonomous house activity changed carrier-free shared conditions; no message content or format crossed."
          : "Autonomous house activity changed modeled conditions only; no message content or format crossed.";
  } else if (selectedContent) {
    semanticCopy = `The selected move “${event.label}” carried its message content.`;
  } else if (selectedFormat) {
    semanticCopy = `The selected move “${event.label}” carried the recognizable form, not its message content.`;
  } else if (effect.semantic === "content") {
    semanticCopy = `The selected move “${event.label}” did not carry its message content on this content-capable route.`;
  } else if (effect.semantic === "format") {
    semanticCopy = `The selected move “${event.label}” did not carry a recognizable form or its message content on this format-capable route.`;
  } else if (effect.semantic === "ambient") {
    semanticCopy = `The selected move “${event.label}” changed carrier-free shared conditions; no message content or format crossed.`;
  } else {
    semanticCopy = `The selected move “${event.label}” produced a metric-only change; no message content or format crossed.`;
  }

  const reachCopy: string[] = [];
  if (effect.appliedReach > 0) {
    reachCopy.push(selectedContent || selectedFormat
      ? "That selected carrier added reach here."
      : isChoice
        ? "The modeled effect added reach here without a selected carrier."
        : "Autonomous activity added reach here without a selected carrier.");
  } else if (selectedContent || selectedFormat) {
    reachCopy.push("The selected carrier changed crossover conditions without adding reach; no background or avoided reach is recorded.");
  }
  if (effect.backgroundReach > 0) reachCopy.push("Background circulation continued separately.");
  if (effect.avoidedReach > 0) reachCopy.push("Some background circulation was avoided; it did not cross.");
  if (!reachCopy.length) reachCopy.push("No applied, background, or avoided reach is recorded.");

  return `${cue} ${semanticCopy} ${reachCopy.join(" ")}`;
}

export function validateNightState(pack: GeneratedScenarioPack, state: NightState): string[] {
  if (!hasNightStateValidationShape(state)) return ["STATE_STRUCTURE"];
  try {
    return validateNightStateInternal(pack, state);
  } catch {
    return ["STATE_VALIDATION_ERROR"];
  }
}

function validateNightStateInternal(pack: GeneratedScenarioPack, state: NightState): string[] {
  const issues: string[] = [];
  if (state.seed !== pack.seed) issues.push("STATE_SEED_MISMATCH");
  if (!Number.isSafeInteger(state.turn) || state.turn < 0) issues.push("TURN_RANGE");
  if (!Number.isSafeInteger(state.elapsedMinutes) || state.elapsedMinutes < 0) issues.push("ELAPSED_MINUTE_RANGE");
  if (state.turn !== state.decisions.length) issues.push("TURN_LEDGER_MISMATCH");
  const scenarioIds = pack.scenarios.map((scenario) => scenario.id);
  const scenarioIdSet = new Set(scenarioIds);
  const roomIds = Object.keys(state.rooms);
  if (roomIds.length !== scenarioIds.length) issues.push("ROOM_COUNT_MISMATCH");
  scenarioIds.filter((id) => !state.rooms[id]).forEach((id) => issues.push(`ROOM_MISSING:${id}`));
  roomIds.filter((id) => !scenarioIdSet.has(id)).forEach((id) => issues.push(`ROOM_UNKNOWN:${id}`));
  roomIds.filter((id) => state.rooms[id]?.scenarioId !== id).forEach((id) => issues.push(`ROOM_IDENTITY_MISMATCH:${id}`));

  const decisionIds = state.decisions.map((decision) => decision.id);
  if (new Set(decisionIds).size !== decisionIds.length) issues.push("DECISION_ID_DUPLICATE");
  const ambientIds = state.ambientEvents.map((event) => event.id);
  if (new Set(ambientIds).size !== ambientIds.length) issues.push("AMBIENT_ID_DUPLICATE");
  if (new Set(state.processedPulseIds).size !== state.processedPulseIds.length) issues.push("PROCESSED_PULSE_ID_DUPLICATE");

  const pulseDefinitions = new Map(pack.scenarios.flatMap((scenario) => scenario.scenes.map((scene) => {
    const id = `pulse-${scene.id}`;
    return [id, {
      id,
      atMinute: minutesBetween(pack.night.startTime, scene.time),
      sourceScenarioId: scenario.id,
      sourceSceneId: scene.id,
    }] as const;
  })));
  const duePulseIds = [...pulseDefinitions.values()]
    .filter((pulse) => pulse.atMinute <= state.elapsedMinutes)
    .map((pulse) => pulse.id)
    .sort();
  if (!sameStringSet(state.processedPulseIds, ambientIds)) issues.push("PROCESSED_AMBIENT_LEDGER_MISMATCH");
  if (!sameStringSet(state.processedPulseIds, duePulseIds)) issues.push("DUE_PULSE_LEDGER_MISMATCH");

  state.ambientEvents.forEach((event) => {
    const pulse = pulseDefinitions.get(event.id);
    if (!pulse) {
      issues.push(`AMBIENT_UNKNOWN:${event.id}`);
      return;
    }
    if (event.atMinute !== pulse.atMinute || event.sourceScenarioId !== pulse.sourceScenarioId || event.sourceSceneId !== pulse.sourceSceneId) {
      issues.push(`AMBIENT_IDENTITY_MISMATCH:${event.id}`);
    }
    if (event.atMinute > state.elapsedMinutes) issues.push(`AMBIENT_FROM_FUTURE:${event.id}`);
    validateEffectRouting(pack, event.id, event.sourceScenarioId, event.effects, undefined, issues);
  });

  const replayedCodes = Object.fromEntries(pack.scenarios.map((scenario) => [
    scenario.id,
    scenario.protagonistModel.languageProfile.primaryCodeId,
  ])) as Record<string, LinguisticCodeId>;
  state.decisions.forEach((decision, index) => {
    if (decision.turn !== index + 1) issues.push(`DECISION_TURN_SEQUENCE:${decision.id}`);
    if (!Number.isSafeInteger(decision.atMinute) || decision.atMinute < 0 || decision.atMinute > state.elapsedMinutes) issues.push(`DECISION_MINUTE_RANGE:${decision.id}`);
    if (index > 0 && decision.atMinute < state.decisions[index - 1].atMinute) issues.push(`DECISION_TIME_ORDER:${decision.id}`);
    const sourceScenario = pack.scenarios.find((scenario) => scenario.id === decision.sourceScenarioId);
    const sourceSceneIndex = sourceScenario?.scenes.findIndex((scene) => scene.id === decision.sourceSceneId) ?? -1;
    const sourceChoice = sourceScenario?.scenes[sourceSceneIndex]?.choices.find((choice) => choice.id === decision.choiceId);
    if (!sourceScenario) issues.push(`DECISION_SOURCE_UNKNOWN:${decision.id}`);
    if (sourceSceneIndex < 0) issues.push(`DECISION_SCENE_UNKNOWN:${decision.id}`);
    if (!sourceChoice) issues.push(`DECISION_CHOICE_UNKNOWN:${decision.id}`);
    validateEffectRouting(pack, decision.id, decision.sourceScenarioId, decision.effects, sourceChoice, issues);
    const arrival = sceneArrivalOffset(pack, decision.sourceScenarioId, sourceSceneIndex);
    if (decision.atMinute < arrival) issues.push(`DECISION_BEFORE_ARTIFACT:${decision.id}`);
    if (sourceScenario?.behaviorCycle.modeled) {
      if (!decision.behaviorTransition) issues.push(`BEHAVIOR_TRANSITION_MISSING:${decision.id}`);
      else if (!sourceScenario.behaviorCycle.possiblePhases.includes(decision.behaviorTransition.to)) issues.push(`BEHAVIOR_PHASE_UNSUPPORTED:${decision.id}`);
    } else if (decision.behaviorTransition) issues.push(`BEHAVIOR_OVERINFERENCE:${decision.id}`);
    if (JSON.stringify(decision.frameworkMoves) !== JSON.stringify(sourceChoice?.frameworkMoves ?? [])) issues.push(`FRAMEWORK_RECEIPT_MISMATCH:${decision.id}`);
    if (JSON.stringify(decision.conversationDiversion) !== JSON.stringify(sourceChoice?.conversationDiversion)) issues.push(`CONVERSATION_DIVERSION_RECEIPT_MISMATCH:${decision.id}`);
    const currentCodeId = replayedCodes[decision.sourceScenarioId];
    const sourceRoom = state.rooms[decision.sourceScenarioId];
    const expectedTransition = sourceScenario && sourceChoice
      ? codeTransitionFor(sourceScenario, { activeCodeId: currentCodeId ?? sourceRoom?.activeCodeId }, sourceChoice)
      : undefined;
    if (JSON.stringify(decision.codeTransition) !== JSON.stringify(expectedTransition)) issues.push(`CODE_TRANSITION_RECEIPT_MISMATCH:${decision.id}`);
    if (expectedTransition) replayedCodes[decision.sourceScenarioId] = expectedTransition.toCodeId;
  });

  const allEvents = [
    ...state.decisions.map((event) => ({ id: event.id, sourceScenarioId: event.sourceScenarioId, effects: event.effects })),
    ...state.ambientEvents.map((event) => ({ id: event.id, sourceScenarioId: event.sourceScenarioId, effects: event.effects })),
  ];
  const expectedInbound = Object.fromEntries(scenarioIds.map((id) => [id, [] as string[]])) as Record<string, string[]>;
  allEvents.forEach((event) => event.effects.forEach((effect) => {
    if (effect.scope === "cross-room" && expectedInbound[effect.targetScenarioId]) expectedInbound[effect.targetScenarioId].push(event.id);
  }));

  Object.values(state.rooms).forEach((room) => {
    const metricKeys = Object.keys(room.metrics);
    if (!sameStringSet(metricKeys, METRIC_NAMES)) issues.push(`METRIC_SCHEMA:${room.scenarioId}`);
    METRIC_NAMES.forEach((metric) => {
      const value = room.metrics[metric];
      const inRange = metric === "reach"
        ? Number.isSafeInteger(value) && value >= 0
        : Number.isFinite(value) && value >= 0 && value <= 100;
      if (!inRange) issues.push(`METRIC_RANGE:${room.scenarioId}:${metric}`);
    });
    if (!sameStringSet(Object.keys(room.fatigue), FATIGUE_KINDS)) issues.push(`FATIGUE_SCHEMA:${room.scenarioId}`);
    if (!FATIGUE_KINDS.every((kind) => Number.isFinite(room.fatigue[kind]) && room.fatigue[kind] >= 0 && room.fatigue[kind] <= 100)) issues.push(`FATIGUE_RANGE:${room.scenarioId}`);
    if (!Number.isSafeInteger(room.platformMinutes) || room.platformMinutes < 0) issues.push(`PLATFORM_MINUTES_RANGE:${room.scenarioId}`);
    if (room.metrics.discernment < INITIAL_METRICS.discernment - 30) issues.push(`DISCERNMENT_COLLAPSE:${room.scenarioId}`);
    if (room.completed && !room.atCompletion) issues.push(`COMPLETION_SNAPSHOT_MISSING:${room.scenarioId}`);
    if (!room.completed && room.atCompletion) issues.push(`PREMATURE_COMPLETION_SNAPSHOT:${room.scenarioId}`);
    const scenario = pack.scenarios.find((item) => item.id === room.scenarioId);
    const sceneCount = scenario?.scenes.length ?? 0;
    if (!Number.isSafeInteger(room.sceneIndex) || room.sceneIndex < 0 || room.sceneIndex > sceneCount) issues.push(`SCENE_INDEX_RANGE:${room.scenarioId}`);
    if (room.completed !== (room.sceneIndex === sceneCount)) issues.push(`COMPLETION_SCENE_MISMATCH:${room.scenarioId}`);
    const completionMetrics = room.atCompletion;
    if (completionMetrics) {
      METRIC_NAMES.forEach((metric) => {
        const value = completionMetrics[metric];
        const inRange = metric === "reach"
          ? Number.isSafeInteger(value) && value >= 0
          : Number.isFinite(value) && value >= 0 && value <= 100;
        if (!inRange) issues.push(`COMPLETION_METRIC_RANGE:${room.scenarioId}:${metric}`);
      });
    }
    const repertoire = scenario?.protagonistModel.languageProfile.repertoire ?? [];
    if (!repertoire.some((access) => access.codeId === room.activeCodeId)) issues.push(`ACTIVE_CODE_OUTSIDE_REPERTOIRE:${room.scenarioId}`);
    if (replayedCodes[room.scenarioId] !== room.activeCodeId) issues.push(`ACTIVE_CODE_LEDGER_MISMATCH:${room.scenarioId}`);
    if (scenario?.behaviorCycle.modeled && (!room.behaviorPhase || !scenario.behaviorCycle.possiblePhases.includes(room.behaviorPhase))) issues.push(`BEHAVIOR_PHASE_RANGE:${room.scenarioId}`);
    if (scenario && !scenario.behaviorCycle.modeled && room.behaviorPhase !== null) issues.push(`BEHAVIOR_PHASE_SHOULD_BE_NULL:${room.scenarioId}`);
    const localDecisions = state.decisions.filter((decision) => decision.sourceScenarioId === room.scenarioId).map((decision) => decision.id);
    if (!sameStringArray(room.localDecisionIds, localDecisions)) issues.push(`LOCAL_DECISION_LEDGER_MISMATCH:${room.scenarioId}`);
    if (room.sceneIndex !== localDecisions.length) issues.push(`SCENE_DECISION_COUNT_MISMATCH:${room.scenarioId}`);
    if (!sameStringSet(room.inboundEventIds, expectedInbound[room.scenarioId] ?? [])) issues.push(`INBOUND_LEDGER_MISMATCH:${room.scenarioId}`);
    if (new Set(room.inboundEventIds).size !== room.inboundEventIds.length) issues.push(`INBOUND_EVENT_DUPLICATE:${room.scenarioId}`);
    if ((localDecisions.length > 0 || room.completed) && !room.entered) issues.push(`UNENTERED_ROOM_HAS_DECISION:${room.scenarioId}`);
  });

  const replayed = reconstructRecordedNight(pack, state);
  if (!replayed) issues.push("STATE_REPLAY_FAILED");
  else if (canonicalStateString(replayed) !== canonicalStateString(state)) issues.push("STATE_REPLAY_MISMATCH");
  return issues;
}

function hasNightStateValidationShape(value: unknown): value is NightState {
  if (!isRecord(value)
    || !isRecord(value.rooms)
    || !Array.isArray(value.decisions)
    || !Array.isArray(value.ambientEvents)
    || !isStringArray(value.processedPulseIds)) return false;

  const roomsValid = Object.values(value.rooms).every((room) => isRecord(room)
    && typeof room.scenarioId === "string"
    && typeof room.activeCodeId === "string"
    && typeof room.entered === "boolean"
    && typeof room.completed === "boolean"
    && isRecord(room.metrics)
    && (room.atCompletion === undefined || isRecord(room.atCompletion))
    && Array.isArray(room.inboundEventIds)
    && isStringArray(room.inboundEventIds)
    && Array.isArray(room.localDecisionIds)
    && isStringArray(room.localDecisionIds)
    && isRecord(room.support)
    && isRecord(room.fatigue));
  if (!roomsValid) return false;

  const effectsValid = (effects: unknown): effects is EffectReceipt[] => Array.isArray(effects)
    && effects.every((effect) => isRecord(effect)
      && typeof effect.targetScenarioId === "string"
      && (effect.scope === "local" || effect.scope === "cross-room")
      && isRecord(effect.metrics)
      && typeof effect.selectedCarriage === "boolean"
      && typeof effect.selectedCarriageReach === "number"
      && (effect.scope === "local"
        ? effect.semantic === undefined && effect.selectedCarriage === false && effect.selectedCarriageReach === 0
        : effect.semantic === "content" || effect.semantic === "format" || effect.semantic === "ambient")
      && Array.isArray(effect.supportAdded));
  const decisionsValid = value.decisions.every((decision) => isRecord(decision)
    && typeof decision.id === "string"
    && typeof decision.sourceScenarioId === "string"
    && typeof decision.sourceSceneId === "string"
    && typeof decision.choiceId === "string"
    && Array.isArray(decision.frameworkMoves)
    && effectsValid(decision.effects));
  const ambientValid = value.ambientEvents.every((event) => isRecord(event)
    && typeof event.id === "string"
    && typeof event.sourceScenarioId === "string"
    && typeof event.sourceSceneId === "string"
    && effectsValid(event.effects));
  return decisionsValid && ambientValid;
}

function reconstructRecordedNight(pack: GeneratedScenarioPack, recorded: NightState): NightState | null {
  let rebuilt = createNightState(pack);
  for (const decision of recorded.decisions) {
    const scenario = pack.scenarios.find((candidate) => candidate.id === decision.sourceScenarioId);
    const scene = scenario?.scenes.find((candidate) => candidate.id === decision.sourceSceneId);
    const choice = scene?.choices.find((candidate) => candidate.id === decision.choiceId);
    if (!scenario || !scene || !choice) return null;
    const decisionStart = decision.atMinute - choice.minutes;
    if (!Number.isSafeInteger(decision.atMinute)
      || !Number.isSafeInteger(decisionStart)
      || decisionStart < rebuilt.elapsedMinutes) return null;
    rebuilt = advanceNightTo(pack, rebuilt, decisionStart);
    rebuilt = enterNightRoom(rebuilt, scenario.id);
    const beforeTurn = rebuilt.turn;
    rebuilt = applyNightChoice(pack, rebuilt, scenario.id, scene.id, choice.id);
    if (rebuilt.turn !== beforeTurn + 1) return null;
  }
  if (!Number.isSafeInteger(recorded.elapsedMinutes) || recorded.elapsedMinutes < rebuilt.elapsedMinutes) return null;
  rebuilt = advanceNightTo(pack, rebuilt, recorded.elapsedMinutes);
  for (const scenario of pack.scenarios) {
    if (recorded.rooms[scenario.id]?.entered) rebuilt = enterNightRoom(rebuilt, scenario.id);
  }
  return rebuilt;
}

function canonicalStateString(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map((item) => canonicalStateString(item)).join(",")}]`;
  if (isRecord(value)) {
    const fields = Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalStateString(value[key])}`);
    return `{${fields.join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function validateEffectRouting(
  pack: GeneratedScenarioPack,
  eventId: string,
  sourceScenarioId: string,
  effects: EffectReceipt[],
  sourceChoice: GeneratedChoice | undefined,
  issues: string[],
): void {
  const scenarioIds = pack.scenarios.map((scenario) => scenario.id);
  if (effects.length !== scenarioIds.length) issues.push(`EFFECT_COUNT:${eventId}`);
  const targets = effects.map((effect) => effect.targetScenarioId);
  if (new Set(targets).size !== effects.length) issues.push(`TARGET_DUPLICATE:${eventId}`);
  if (!sameStringSet(targets, scenarioIds)) issues.push(`TARGET_SET_MISMATCH:${eventId}`);
  const local = effects.filter((effect) => effect.scope === "local");
  const remote = effects.filter((effect) => effect.scope === "cross-room");
  if (local.length !== 1 || local[0]?.targetScenarioId !== sourceScenarioId) issues.push(`LOCAL_EFFECT_ROUTE:${eventId}`);
  if (local.some((effect) => effect.semantic !== undefined || effect.selectedCarriage || effect.selectedCarriageReach !== 0)) {
    issues.push(`LOCAL_CARRIAGE_OVERCLAIM:${eventId}`);
  }
  if (remote.length !== scenarioIds.length - 1) issues.push(`CROSS_EFFECT_COUNT:${eventId}`);
  remote.forEach((effect) => {
    const link = pack.night.links.find((candidate) =>
      candidate.sourceScenarioId === sourceScenarioId && candidate.targetScenarioId === effect.targetScenarioId,
    );
    if (!link
      || effect.linkId !== link.id
      || effect.layer !== link.layer
      || effect.semantic !== link.semantic
      || effect.mechanism !== link.mechanism) {
      issues.push(`CROSS_EFFECT_ROUTE:${eventId}:${effect.targetScenarioId}`);
      return;
    }
    const selectedCarriage = sourceChoice !== undefined
      && choiceCanUseCrossRoomCarrier(sourceChoice, link)
      && (effect.appliedReach > 0 || (effect.metrics.crossover ?? 0) > 0);
    if (effect.selectedCarriage !== selectedCarriage
      || effect.selectedCarriageReach !== (selectedCarriage ? effect.appliedReach : 0)) {
      issues.push(`SELECTED_CARRIAGE_RECEIPT:${eventId}:${effect.targetScenarioId}`);
    }
    if (sourceChoice
      && link.semantic !== "ambient"
      && !choiceCanUseCrossRoomCarrier(sourceChoice, link)
      && effect.appliedReach !== 0) {
      issues.push(`INCOMPATIBLE_CARRIER_REACH:${eventId}:${effect.targetScenarioId}`);
    }
  });
}

function sameStringSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((value, index) => value === sortedRight[index]);
}

function sameStringArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function codeTransitionFor(
  scenario: GeneratedScenario,
  room: Pick<RoomRuntime, "activeCodeId">,
  choice: GeneratedChoice,
): CodeTransition | undefined {
  const action = choice.codeAction;
  if (!action) return undefined;
  const repertoire = scenario.protagonistModel.languageProfile.repertoire;
  if (!repertoire.some((access) => access.codeId === room.activeCodeId)) return undefined;
  if (!repertoire.some((access) => access.codeId === action.toCodeId)) return undefined;
  const changed = room.activeCodeId !== action.toCodeId;
  return {
    fromCodeId: room.activeCodeId,
    toCodeId: action.toCodeId,
    mode: changed && action.mode === "maintain"
      ? "switch"
      : !changed && action.mode === "switch"
        ? "maintain"
        : action.mode,
    audienceContext: action.audienceContext,
    intendedFunction: action.intendedFunction,
    switchReason: !changed && action.mode === "switch"
      ? "The active register already matched the represented audience and purpose."
      : action.switchReason,
    switchLoad: changed ? action.switchLoad : {},
  };
}

type CalculatedReceipt = {
  effects: Partial<Metrics>;
  backgroundReach: number;
  avoidedReach: number;
  appliedReach: number;
  selectedCarriage: boolean;
  selectedCarriageReach: number;
};

function calculateLocalReceipt(
  choice: GeneratedChoice,
  current: Metrics,
  audienceCeiling: number,
): CalculatedReceipt {
  const saturation = calculateSaturation(current.reach, audienceCeiling);
  const marginalFactor = clamp(1 - saturation * 0.74, 0.2, 1);
  const rawReach = choice.effects.reach ?? 0;
  const appliedReach = Math.round(Math.max(0, rawReach) * marginalFactor);
  const avoidedReach = Math.max(0, -rawReach);
  const backgroundReach = Math.max(
    0,
    Math.round(
      choice.minutes * (18 + current.heat * 0.72 + current.crossover * 0.24) * marginalFactor,
    ) - avoidedReach,
  );
  return {
    effects: { ...choice.effects, reach: appliedReach },
    backgroundReach,
    avoidedReach,
    appliedReach,
    selectedCarriage: false,
    selectedCarriageReach: 0,
  };
}

function calculateCrossRoomReceipt(
  choice: GeneratedChoice,
  link: CrossRoomLink,
  current: Metrics,
  audienceCeiling: number,
): CalculatedReceipt {
  const scale = link.strength * (link.layer === "direct" ? 0.34 : 0.16);
  const effects = projectSystemicEffects(choice.effects, link, scale);
  const rawReach = choice.effects.reach ?? 0;
  const saturation = calculateSaturation(current.reach, audienceCeiling);
  const marginalFactor = clamp(1 - saturation * 0.74, 0.2, 1);
  const carrierCompatible = choiceCanUseCrossRoomCarrier(choice, link);
  const appliedReach = rawReach > 0 && (link.semantic === "ambient" || carrierCompatible)
    ? Math.max(1, Math.round(rawReach * link.strength * (link.layer === "direct" ? 0.09 : 0.035) * marginalFactor))
    : 0;
  const avoidedReach = rawReach < 0
    ? Math.max(1, Math.round(Math.abs(rawReach) * link.strength * 0.05))
    : 0;
  effects.reach = appliedReach;
  if (!Object.entries(effects).some(([metric, value]) => metric !== "reach" && value !== 0)) {
    effects.heat = rawReach < 0 ? -1 : 1;
  }
  const backgroundReach = Math.max(0, Math.round(
    choice.minutes * (3.2 + current.heat * 0.08 + current.crossover * 0.05) * marginalFactor,
  ) - avoidedReach);
  const selectedCarriage = carrierCompatible
    && (appliedReach > 0 || (effects.crossover ?? 0) > 0);
  return {
    effects,
    backgroundReach,
    avoidedReach,
    appliedReach,
    selectedCarriage,
    selectedCarriageReach: selectedCarriage ? appliedReach : 0,
  };
}

function choiceCanUseCrossRoomCarrier(choice: GeneratedChoice, link: CrossRoomLink): boolean {
  if (choice.delivery.scope === "private" || choice.delivery.scope === "withheld") return false;
  switch (link.semantic) {
    case "ambient":
      return false;
    case "content":
      return link.carrier.kind === "shared-channel"
        && (choice.delivery.carriage === "content" || choice.delivery.carriage === "content-and-format");
    case "format":
      return link.carrier.kind === "artifact-format"
        && (choice.delivery.carriage === "format" || choice.delivery.carriage === "content-and-format");
  }
}

function calculatePulseReceipt(
  autonomous: Partial<Metrics>,
  current: Metrics,
  audienceCeiling: number,
  scale: number,
): CalculatedReceipt {
  const saturation = calculateSaturation(current.reach, audienceCeiling);
  const marginalFactor = clamp(1 - saturation * 0.74, 0.2, 1);
  const rawReach = autonomous.reach ?? 0;
  const appliedReach = Math.max(0, Math.round(rawReach * scale * marginalFactor));
  const effects: Partial<Metrics> = {};
  (Object.keys(autonomous) as MetricName[]).forEach((metric) => {
    if (metric === "reach") return;
    const raw = autonomous[metric] ?? 0;
    if (raw) effects[metric] = raw * scale;
  });
  effects.reach = appliedReach;
  return {
    effects,
    backgroundReach: 0,
    avoidedReach: 0,
    appliedReach,
    selectedCarriage: false,
    selectedCarriageReach: 0,
  };
}

function calculateAmbientPulseReceipt(
  autonomous: Partial<Metrics>,
  link: CrossRoomLink,
  current: Metrics,
  audienceCeiling: number,
): CalculatedReceipt {
  const scale = link.strength * (link.layer === "direct" ? 0.12 : 0.055);
  const effects = projectSystemicEffects(autonomous, link, scale);
  const saturation = calculateSaturation(current.reach, audienceCeiling);
  const marginalFactor = clamp(1 - saturation * 0.74, 0.2, 1);
  const rawReach = autonomous.reach ?? 0;
  const appliedReach = rawReach > 0
    ? Math.max(1, Math.round(rawReach * scale * 0.42 * marginalFactor))
    : 0;
  effects.reach = appliedReach;
  if (!Object.entries(effects).some(([metric, value]) => metric !== "reach" && value !== 0)) effects.heat = 0.25;
  return {
    effects,
    backgroundReach: 0,
    avoidedReach: 0,
    appliedReach,
    selectedCarriage: false,
    selectedCarriageReach: 0,
  };
}

function projectSystemicEffects(
  source: Partial<Metrics>,
  link: CrossRoomLink,
  scale: number,
): Partial<Metrics> {
  const relevant: Record<CrossRoomLink["mechanism"], MetricName[]> = {
    "shared-audience": ["consensus", "belief", "crossover", "interpretiveGap", "threadFocus"],
    "format-imitation": ["heat", "crossover", "provenance", "interpretiveGap", "threadFocus"],
    "attention-market": ["heat", "consensus", "coordination", "enactment", "threadFocus"],
    "institutional-load": ["verification", "trust", "provenance", "heat", "enactment"],
    "trust-carryover": ["trust", "crossover", "belief", "consensus", "blame"],
    "ambient-ranking": ["heat", "consensus", "crossover", "commonGround", "threadFocus"],
    "attribution-carryover": ["blame", "interpretiveGap", "trust", "consensus"],
    "code-collision": ["interpretiveGap", "commonGround", "heat", "crossover"],
    "model-collision": ["interpretiveGap", "commonGround", "trust", "threadFocus"],
  };
  const effects: Partial<Metrics> = {};
  relevant[link.mechanism].forEach((metric) => {
    const raw = source[metric] ?? 0;
    if (raw) effects[metric] = Math.sign(raw) * Math.max(0.25, Math.abs(raw) * scale);
  });
  if (Object.keys(effects).length === 0) {
    const repairDirection = (source.verification ?? 0) + (source.provenance ?? 0) + (source.trust ?? 0)
      - Math.max(0, source.heat ?? 0) - Math.max(0, source.consensus ?? 0);
    effects.heat = repairDirection >= 2 ? -0.5 : 0.5;
  }
  return effects;
}

function applyReceipt(
  current: Metrics,
  receipt: CalculatedReceipt,
): Metrics {
  const next = { ...current };
  (Object.keys(next) as MetricName[]).forEach((metric) => {
    if (metric === "reach") return;
    const delta = receipt.effects[metric] ?? 0;
    const minimum = metric === "belief" ? 4 : metric === "discernment" ? 40 : 0;
    next[metric] = clamp(next[metric] + delta, minimum, 100);
  });
  next.reach = Math.max(0, current.reach + receipt.appliedReach + receipt.backgroundReach);
  return next;
}

function supportEmittedByChoice(choice: GeneratedChoice): ConstraintSystem[] {
  if (choice.conversationDiversion) return [];
  const emitted = new Set<ConstraintSystem>();
  if ((choice.effects.provenance ?? 0) >= 3) emitted.add("source");
  if ((choice.effects.verification ?? 0) >= 5) emitted.add("evidence");
  if ((choice.effects.trust ?? 0) >= 2) emitted.add("relationship");
  if (choice.ethicsTags.some((tag) => ["institutional-constraint", "distributed-unlock", "reachable-repair"].includes(tag))) emitted.add("institution");
  if (choice.ethicsTags.includes("distributed-unlock") || ((choice.effects.crossover ?? 0) >= 5 && (choice.effects.provenance ?? 0) > 0)) emitted.add("distribution");
  if (choice.ethicsTags.includes("distributed-unlock")) SYSTEMS.forEach((system) => emitted.add(system));
  return [...emitted];
}

function addSupport(
  current: RoomRuntime["support"],
  systems: ConstraintSystem[],
  eventId: string,
): RoomRuntime["support"] {
  const next = { ...current };
  systems.forEach((system) => {
    next[system] = [...(next[system] ?? []), eventId];
  });
  return next;
}

function calculateSaturation(reach: number, audienceCeiling: number): number {
  return clamp(reach / Math.max(1, audienceCeiling), 0, 1);
}

function minutesBetween(start: string, end: string): number {
  const toMinutes = (time: string) => {
    const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
    if (!match) return 0;
    return (Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0)) * 60 + Number(match[2]);
  };
  const difference = toMinutes(end) - toMinutes(start);
  return difference >= 0 ? difference : difference + 24 * 60;
}

function emptyFatigue(): FatigueLoad {
  return { attentional: 0, affective: 0, relational: 0, verification: 0, efficacy: 0 };
}

function addFatigue(current: FatigueLoad, load: Partial<FatigueLoad>): FatigueLoad {
  const next = { ...current };
  (Object.keys(next) as FatigueKind[]).forEach((kind) => {
    next[kind] = clamp(next[kind] + (load[kind] ?? 0), 0, 100);
  });
  return next;
}

function crossFatigue(load: Partial<FatigueLoad>, link: CrossRoomLink): Partial<FatigueLoad> {
  const factor = link.strength * (link.layer === "direct" ? 0.12 : 0.055);
  return Object.fromEntries(
    (Object.entries(load) as Array<[FatigueKind, number]>).map(([kind, value]) => [kind, Number((value * factor).toFixed(2))]),
  ) as Partial<FatigueLoad>;
}

function applyModeledLoad(
  metrics: Metrics,
  load: Partial<FatigueLoad>,
  orientation: GeneratedScenario["protagonistModel"]["prosocialOrientation"],
): Metrics {
  const total = Object.values(load).reduce((sum, value) => sum + (value ?? 0), 0);
  const multiplier = orientation === "strong" ? 0.11 : orientation === "mixed" ? 0.075 : 0.025;
  return {
    ...metrics,
    enactment: clamp(metrics.enactment - total * multiplier, 0, 100),
  };
}

function preserveDiscernment(previous: Metrics, next: Metrics): Metrics {
  return { ...next, discernment: Math.max(previous.discernment, next.discernment) };
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
