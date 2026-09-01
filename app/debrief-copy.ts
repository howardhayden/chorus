import type {
  ConceptEffectRule,
  ConceptPlayBinding,
  GeneratedChoice,
  CrossRoomCarrier,
  GeneratedScenario,
  GeneratedScenarioPack,
  GeneratedScene,
  LessonTerm,
  MetricName,
  RecordAtom,
} from "./scenario-generator";
import type { DecisionEvent, EffectReceipt, NightState } from "./night-engine";
import { isNightComplete, validateNightState } from "./night-engine.ts";

/**
 * This sentence belongs beside the debrief, not inside its narrative ending.
 * Keeping the boundary separate lets the summary end on the night's residue.
 */
export const DEBRIEF_MODEL_LIMIT =
  "CHORUS is a fictional simulation. It does not diagnose, predict, assess, measure, or score real people or the player.";

/** Inspectable labels for receipts; neither label is used as a summary heading. */
export const DIRECT_CONTENT_CROSSING = "DIRECT CONTENT CROSSING";
export const DIRECT_FORMAT_CARRYOVER = "DIRECT FORMAT CARRYOVER · NO SHARED FACTUAL CLAIM";

export type NarrativeSource =
  | {
      kind: "scenario-record";
      scenarioId: string;
      field: "knownFact" | "unresolvedAtEntry" | "laterResolution";
    }
  | {
      kind: "scene-record";
      scenarioId: string;
      sceneId: string;
      field: "artifactCopy" | "reason";
    }
  | {
      kind: "scene-disclosure";
      scenarioId: string;
      sceneId: string;
      bucket: "record" | "question" | "unknown";
      atomId: string;
    }
  | {
      kind: "decision";
      decisionId: string;
      scenarioId: string;
      sceneId: string;
      choiceId: string;
      turn: number;
    }
  | {
      kind: "route";
      decisionId: string;
      sourceScenarioId: string;
      targetScenarioId: string;
      linkId: string;
      classification: "direct-content" | "direct-format" | "ambient";
      selectedPathCarriage: boolean;
      selectedCarriageReach: number;
      appliedReach: number;
      backgroundReach: number;
      avoidedReach: number;
      crossover: number;
      compatibilityBasis?: string;
      revealedCue?: string;
      carrierKind?: CrossRoomCarrier["kind"];
      carrierLabel?: string;
    }
  | {
      kind: "room-afterimage";
      scenarioId: string;
      metric: MetricName;
      atCompletion: number;
      atDebrief: number;
      normalizedChange: number;
    }
  | {
      kind: "room-settled";
      scenarioId: string;
    }
  | {
      kind: "last-resort-cost";
      decisionId: string;
      scenarioId: string;
      field: "protectedParty" | "positiveConsequence" | "harmedParty" | "negativeConsequence" | "selfCost";
    };

export type NaturalizedSummary = {
  paragraphs: string[];
  sources: NarrativeSource[];
  atoms: NarrativeAtom[];
};

export type NarrativeAtom = {
  role: "artifact" | "record" | "pressure" | "inquiry" | "decision" | "route" | "cost" | "resolution" | "residue";
  text: string;
  sources: NarrativeSource[];
  relationToPrevious?: "chronological-after";
};

export type ConceptStatus = "encountered" | "experienced" | "played";

export type ConceptEvidence =
  | {
      kind: "scene";
      copy: string;
      scenarioId: string;
      sceneId: string;
    }
  | {
      kind: "effect";
      copy: string;
      scenarioId: string;
      sceneId: string;
      effectEventId: string;
      targetScenarioId: string;
    }
  | {
      kind: "action";
      copy: string;
      scenarioId: string;
      sceneId: string;
      decisionId: string;
    };

export type ConceptReceiptItem = {
  term: string;
  gloss: string;
  plain: string;
  limit: string;
  status: ConceptStatus;
  sceneIds: string[];
  decisionIds: string[];
  effectEventIds: string[];
  evidence: ConceptEvidence;
};

export type ConceptReceipt = {
  concepts: ConceptReceiptItem[];
};

type AcceptedDecision = {
  decision: DecisionEvent;
  scenario: GeneratedScenario;
  scene: GeneratedScene;
  choice: GeneratedChoice;
};

type ClassifiedRoute = {
  accepted: AcceptedDecision;
  targetScenario?: GeneratedScenario;
  receipt: EffectReceipt;
  classification: "direct-content" | "direct-format" | "ambient";
  carrier?: CrossRoomCarrier;
  compatibilityBasis?: string;
  revealedCue?: string;
};

type NarrativeEdge = {
  route: ClassifiedRoute;
  next: AcceptedDecision;
  originIndex: number;
  nextIndex: number;
};

type NarrativeBlock = {
  turn: number;
  order: number;
  item: AcceptedDecision;
  atoms: NarrativeAtom[];
};

type Afterimage = {
  scenario: GeneratedScenario;
  metric: MetricName;
  atCompletion: number;
  atDebrief: number;
  delta: number;
  normalizedMagnitude: number;
};

type ConceptExperienceMatch = {
  item: AcceptedDecision;
  eventId: string;
  eventKind: "decision" | "ambient";
  receipt: EffectReceipt;
  rule: ConceptEffectRule;
};

const METRIC_LABELS: Partial<Record<MetricName, string>> = {
  reach: "circulation",
  heat: "pressure",
  crossover: "movement between rooms",
  belief: "acceptance",
  consensus: "apparent agreement",
  provenance: "source context",
  verification: "checking",
  trust: "trust",
  coordination: "coordination",
  blame: "blame",
  commonGround: "shared ground",
};

const AFTERIMAGE_METRICS = Object.keys(METRIC_LABELS) as MetricName[];

const AMBIENT_EFFECT_COPY: Record<NonNullable<EffectReceipt["mechanism"]>, (target: string) => string> = {
  "shared-audience": (target) => `Audience overlap still changed what people saw in ${target}.`,
  "format-imitation": (target) => `Other accounts still copied presentation styles in ${target}.`,
  "attention-market": (target) => `Other circulation still drew attention in ${target}.`,
  "institutional-load": (target) => `Institutional workload still slowed the response in ${target}.`,
  "trust-carryover": (target) => `Trust borrowed elsewhere still shaped reception in ${target}.`,
  "ambient-ranking": (target) => `Ranking systems still changed what people saw in ${target}.`,
  "attribution-carryover": (target) => `Activity elsewhere still shifted blame in ${target}.`,
  "code-collision": (target) => `A language mismatch still complicated the exchange in ${target}.`,
  "model-collision": (target) => `Different expectations still complicated the exchange in ${target}.`,
};

const CONCEPT_GLOSSES: Record<LessonTerm, string> = {
  signaling: "What an action communicates",
  saturation: "Familiarity through repetition",
  "correction drag": "Why corrections travel slowly",
  "market value": "Attention serving another goal",
  "trust capital": "Borrowing trust",
  "status capital": "Protecting standing",
};

export function buildNaturalizedSummary(
  pack: GeneratedScenarioPack,
  state: NightState,
): NaturalizedSummary {
  if (!isNightComplete(state) || validateNightState(pack, state).length > 0) {
    return { paragraphs: [], sources: [], atoms: [] };
  }
  const accepted = acceptedDecisions(pack, state)
    .sort((left, right) => left.decision.turn - right.decision.turn);
  const sources: NarrativeSource[] = [];
  const paragraphs: string[] = [];
  const visitedScenarios = uniqueBy(accepted.map((item) => item.scenario), (scenario) => scenario.id);
  const afterimage = strongestAfterimage(pack, state, visitedScenarios);
  const routes = classifiedRoutes(pack, accepted);
  const chain = narrativeChain(routes, accepted, afterimage);
  const chainDecisionIds = new Set(chain.flatMap((edge) => [
    edge.route.accepted.decision.id,
    edge.next.decision.id,
  ]));
  const blocks: NarrativeBlock[] = [];

  const chainStart = chain[0]?.route.accepted;
  if (chainStart) {
    blocks.push({
      turn: chainStart.decision.turn,
      order: 0,
      item: chainStart,
      atoms: [decisionAtom(chainStart, "standalone"), ...lastResortCostAtoms(chainStart)],
    });
    for (const edge of chain) {
      blocks.push({
        turn: edge.next.decision.turn,
        order: 0,
        item: edge.next,
        atoms: [
          routeAtom(edge.route, edge.next),
          decisionAtom(edge.next, "later"),
          ...lastResortCostAtoms(edge.next),
        ],
      });
    }
  }

  for (const item of accepted.filter((candidate) =>
    Boolean(candidate.decision.lastResort) && !chainDecisionIds.has(candidate.decision.id),
  )) {
    blocks.push({
      turn: item.decision.turn,
      order: 0,
      item,
      atoms: [decisionAtom(item, "standalone"), ...lastResortCostAtoms(item)],
    });
  }

  if (blocks.length === 0 && accepted[0]) {
    blocks.push({
      turn: accepted[0].decision.turn,
      order: 0,
      item: accepted[0],
      atoms: [decisionAtom(accepted[0], "standalone"), ...lastResortCostAtoms(accepted[0])],
    });
  }

  blocks.sort((left, right) => left.turn - right.turn || left.order - right.order);
  const firstBlock = blocks[0];
  const first = firstBlock?.item;
  if (firstBlock && first) {
    const opening = sceneFirstOpening(first);
    if (opening.length > 0) {
      firstBlock.atoms.unshift(...opening);
    }
  }

  for (const [index, block] of blocks.entries()) {
    const decision = block.atoms.find((atom) => atom.role === "decision");
    if (!decision) continue;
    decision.text = decisionSentence(block.item, index === 0 ? "opening" : "later", index);
    if (index > 0) decision.relationToPrevious = "chronological-after";
  }

  const narrativeAtoms = blocks.flatMap((block) => block.atoms);
  paragraphs.push(...paragraphsFromBlocks(blocks, 92));
  for (const atom of narrativeAtoms) sources.push(...atom.sources);

  const terminal = afterimage
    ? accepted.filter((item) => item.scenario.id === afterimage.scenario.id).at(-1)
    : accepted.at(-1);
  const residueScenario = afterimage?.scenario ?? terminal?.scenario ?? first?.scenario ?? pack.scenarios[0];
  let closingAtoms: NarrativeAtom[] = [];
  if (residueScenario) {
    closingAtoms = afterimage
      ? residueAtoms(residueScenario, afterimage)
      : settledResidueAtoms(residueScenario);
    paragraphs.push(...paragraphsFromAtoms(closingAtoms, 95));
    for (const atom of closingAtoms) sources.push(...atom.sources);
  }

  return {
    paragraphs: paragraphs.map((paragraph) => boundedParagraph(paragraph)).filter(Boolean),
    sources,
    atoms: [...narrativeAtoms, ...closingAtoms],
  };
}

export function buildConceptReceipt(
  pack: GeneratedScenarioPack,
  state: NightState,
): ConceptReceipt {
  if (!isNightComplete(state) || validateNightState(pack, state).length > 0) {
    return { concepts: [] };
  }
  const accepted = acceptedDecisions(pack, state);
  const terms = uniqueBy(
    accepted.map((item) => item.scene.lesson.term),
    (term) => term.toLocaleLowerCase(),
  );

  return {
    concepts: terms.map((term) => {
      const related = accepted.filter((item) => item.scene.lesson.term === term);
      const canonicalLesson = related[0].scene.lesson;
      const played = related.flatMap((item) => item.choice.conceptPlays
        .filter((binding) => binding.term === term)
        .map((binding) => ({ item, binding })));
      const experienced = uniqueBy(
        related.flatMap((item) => conceptExperienceMatches(term, item, state)),
        (match) => match.eventId,
      );
      const status: ConceptStatus = played.length > 0
        ? "played"
        : experienced.length > 0
          ? "experienced"
          : "encountered";
      const playedDecisionIds = uniqueBy(played.map(({ item }) => item.decision.id), (id) => id);
      const effectEventIds = status === "encountered" ? [] : experienced.map((match) => match.eventId);
      return {
        term,
        gloss: CONCEPT_GLOSSES[term],
        plain: normalizedCopy(canonicalLesson.definition),
        limit: normalizedCopy(canonicalLesson.observable),
        status,
        sceneIds: uniqueBy(related.map((item) => item.scene.id), (id) => id),
        decisionIds: status === "played" ? playedDecisionIds : [],
        effectEventIds,
        evidence: conceptEvidence(status, related, played, experienced, pack),
      };
    }),
  };
}

function acceptedDecisions(pack: GeneratedScenarioPack, state: NightState): AcceptedDecision[] {
  return state.decisions.flatMap((decision) => {
    const scenario = pack.scenarios.find((item) => item.id === decision.sourceScenarioId);
    const scene = scenario?.scenes.find((item) => item.id === decision.sourceSceneId);
    const choice = scene?.choices.find((item) => item.id === decision.choiceId);
    return scenario && scene && choice ? [{ decision, scenario, scene, choice }] : [];
  });
}

function classifiedRoutes(pack: GeneratedScenarioPack, accepted: AcceptedDecision[]): ClassifiedRoute[] {
  return accepted.flatMap((item) => item.decision.effects
    .filter((receipt) => receipt.scope === "cross-room" && Boolean(receipt.linkId))
    .map((receipt) => {
      const link = pack.night.links.find((candidate) => candidate.id === receipt.linkId);
      const compatibilityBasis = link?.compatibilityBasis;
      const revealedCue = receipt.revealedCue ?? link?.revealedCue;
      const semantic = receipt.semantic ?? link?.semantic;
      const classification: ClassifiedRoute["classification"] = semantic === "content"
        ? "direct-content"
        : semantic === "format"
          ? "direct-format"
          : "ambient";
      return {
        accepted: item,
        targetScenario: pack.scenarios.find((scenario) => scenario.id === receipt.targetScenarioId),
        receipt,
        classification,
        carrier: link?.semantic === "ambient" ? undefined : link?.carrier,
        compatibilityBasis,
        revealedCue,
      };
    }));
}

function narrativeChain(
  routes: ClassifiedRoute[],
  accepted: AcceptedDecision[],
  afterimage: Afterimage | undefined,
): NarrativeEdge[] {
  const position = new Map(accepted.map((item, index) => [item.decision.id, index]));
  const edges = routes.flatMap((route): NarrativeEdge[] => {
    const originIndex = position.get(route.accepted.decision.id);
    if (originIndex === undefined || !routeHasNarrativeEvidence(route)) return [];
    const nextIndex = accepted.findIndex((candidate, index) =>
      index > originIndex && candidate.scenario.id === route.receipt.targetScenarioId,
    );
    return nextIndex < 0 ? [] : [{ route, next: accepted[nextIndex], originIndex, nextIndex }];
  });
  const lastResortIndexes = accepted.flatMap((item, index) =>
    item.decision.lastResort ? [index] : [],
  );
  const chronologicalEdges = edges.filter((edge) => !lastResortIndexes.some((index) =>
    index > edge.originIndex && index < edge.nextIndex,
  ));
  if (chronologicalEdges.length === 0) return [];

  const terminalScenarioId = afterimage?.scenario.id;
  const primary = [...chronologicalEdges].sort((left, right) =>
    Number(right.next.scenario.id === terminalScenarioId) - Number(left.next.scenario.id === terminalScenarioId)
    || routeNarrativeRank(right.route) - routeNarrativeRank(left.route)
    || (left.nextIndex - left.originIndex) - (right.nextIndex - right.originIndex)
    || left.route.receipt.linkId!.localeCompare(right.route.receipt.linkId!),
  )[0];
  return [primary];
}

function routeHasNarrativeEvidence(route: ClassifiedRoute): boolean {
  return route.receipt.selectedCarriage
    || route.receipt.backgroundReach > 0
    || route.receipt.avoidedReach > 0
    || route.receipt.appliedReach > 0
    || Object.values(route.receipt.metrics).some((value) => typeof value === "number" && value !== 0);
}

function routeNarrativeRank(route: ClassifiedRoute): number {
  const semanticRank = route.receipt.selectedCarriage
    ? route.classification === "direct-content" ? 500 : route.classification === "direct-format" ? 450 : 0
    : route.classification === "ambient" ? 250 : route.receipt.backgroundReach > 0 ? 350 : 300;
  const movement = route.receipt.selectedCarriageReach
    + Math.min(100, route.receipt.backgroundReach)
    + Math.min(100, route.receipt.avoidedReach);
  return semanticRank + movement;
}

function sceneFirstOpening(item: AcceptedDecision): NarrativeAtom[] {
  const room = completeFragment(item.scenario.title);
  const artifactCopy = normalizedCopy(item.scene.artifactCopy ?? "");
  const record = firstPublicDisclosure(item.scene.disclosure.records);
  const pressure = reasonClause(item.scene.reason);
  const question = firstPublicDisclosure(item.scene.disclosure.questions);
  const unknown = firstPublicDisclosure(item.scene.disclosure.unknowns);
  const atoms: NarrativeAtom[] = [];
  const usedCopies = new Set<string>();

  if (artifactCopy) {
    const artifactSources: NarrativeSource[] = [{
      kind: "scene-record",
      scenarioId: item.scenario.id,
      sceneId: item.scene.id,
      field: "artifactCopy",
    }];
    if (record && sameCopy(record.copy, artifactCopy)) {
      artifactSources.push(disclosureSource(item, "record", record));
    }
    atoms.push({
      role: "artifact",
      text: sentenceFrom(artifactCopy),
      sources: artifactSources,
    });
    usedCopies.add(normalizeSentenceForComparison(artifactCopy));
  }

  if (record
    && !usedCopies.has(normalizeSentenceForComparison(record.copy))
    && !substantiallyRepeats(record.copy, [artifactCopy])) {
    atoms.push({
      role: "record",
      text: sentenceFrom(record.copy),
      sources: [disclosureSource(item, "record", record)],
    });
    usedCopies.add(normalizeSentenceForComparison(record.copy));
  }

  if (pressure
    && !usedCopies.has(normalizeSentenceForComparison(pressure))
    && !substantiallyRepeats(pressure, [artifactCopy, record?.copy ?? ""])) {
    atoms.push({
      role: "pressure",
      text: sentenceCase(sentenceFrom(pressure)),
      sources: [{
        kind: "scene-record",
        scenarioId: item.scenario.id,
        sceneId: item.scene.id,
        field: "reason",
      }],
    });
    usedCopies.add(normalizeSentenceForComparison(pressure));
  }

  const inquiry = [question, unknown].find((candidate) =>
    candidate && !usedCopies.has(normalizeSentenceForComparison(candidate.copy)),
  );
  if (inquiry) {
    const bucket = inquiry === question ? "question" : "unknown";
    atoms.push({
      role: "inquiry",
      text: sentenceFrom(inquiry.copy),
      sources: [disclosureSource(item, bucket, inquiry)],
    });
  }

  const ordered = selectOpeningAtoms(orderOpeningAtoms(item.scene.act, atoms));
  if (ordered.length === 0) return [];
  const location = item.scene.act === "BRIDGE" ? "Inside" : item.scene.act === "CROSSOVER" ? "In" : "At";
  return [
    { ...ordered[0], text: `${location} ${room}, ${lowercaseFirst(ordered[0].text)}` },
    ...ordered.slice(1),
  ];
}

function selectOpeningAtoms(ordered: NarrativeAtom[]): NarrativeAtom[] {
  if (ordered.length <= 3) return ordered;
  const selected = new Set<NarrativeAtom>();
  const anchor = ordered[0];
  if (anchor) selected.add(anchor);

  const disclosure = ordered.find((atom) => atom.sources.some((source) => source.kind === "scene-disclosure"));
  if (disclosure) selected.add(disclosure);

  const pressure = ordered.find((atom) => atom.role === "pressure");
  if (pressure) selected.add(pressure);

  for (const atom of ordered) {
    if (selected.size >= 3) break;
    selected.add(atom);
  }
  return ordered.filter((atom) => selected.has(atom));
}

function orderOpeningAtoms(act: GeneratedScene["act"], atoms: NarrativeAtom[]): NarrativeAtom[] {
  const order: NarrativeAtom["role"][] = act === "BRIDGE"
    ? ["artifact", "pressure", "inquiry", "record"]
    : act === "CORRECTION"
      ? ["record", "artifact", "inquiry", "pressure"]
      : act === "SURFACE"
        ? ["artifact", "record", "inquiry", "pressure"]
        : ["artifact", "record", "pressure", "inquiry"];
  return [...atoms].sort((left, right) => order.indexOf(left.role) - order.indexOf(right.role));
}

function firstPublicDisclosure(records: readonly RecordAtom[]): RecordAtom | undefined {
  return records.find((record) => record.access === "public-record" && normalizedCopy(record.copy));
}

function disclosureSource(
  item: AcceptedDecision,
  bucket: "record" | "question" | "unknown",
  atom: RecordAtom,
): NarrativeSource {
  return {
    kind: "scene-disclosure",
    scenarioId: item.scenario.id,
    sceneId: item.scene.id,
    bucket,
    atomId: atom.id,
  };
}

function sameCopy(left: string, right: string): boolean {
  return normalizeSentenceForComparison(left) === normalizeSentenceForComparison(right);
}

function substantiallyRepeats(candidate: string, existing: string[]): boolean {
  const candidateTokens = contentTokens(candidate);
  if (candidateTokens.size < 3) return existing.some((value) => sameCopy(candidate, value));
  return existing.some((value) => {
    const existingTokens = contentTokens(value);
    if (existingTokens.size < 3) return false;
    const shorter = Math.min(candidateTokens.size, existingTokens.size);
    const overlap = [...candidateTokens].filter((token) => existingTokens.has(token)).length;
    return overlap / shorter >= 0.65;
  });
}

function contentTokens(value: string): Set<string> {
  const stopWords = new Set(["about", "after", "again", "also", "because", "before", "from", "into", "only", "over", "same", "that", "their", "there", "these", "this", "those", "under", "while", "with"]);
  const tokens = normalizedCopy(value).toLocaleLowerCase("en-US").match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(tokens.filter((token) => token.length > 3 && !stopWords.has(token)));
}

function reasonClause(value: string): string {
  return normalizedCopy(value)
    .replace(/^because\s+/i, "")
    .replace(/[.!?]+$/g, "")
    .trim();
}

function normalizeSentenceForComparison(value: string): string {
  return normalizedCopy(value).replace(/[.!?]+$/g, "").toLocaleLowerCase("en-US");
}

function routeAtom(route: ClassifiedRoute, next: AcceptedDecision): NarrativeAtom {
  return {
    role: "route",
    text: joinSentences(routeNarration(route, next)),
    sources: [routeSource(route)],
  };
}

function routeNarration(route: ClassifiedRoute, next: AcceptedDecision): string[] {
  const source = completeFragment(route.accepted.scenario.title);
  const target = completeFragment(next.scenario.title);
  if (route.classification === "direct-content" && route.receipt.selectedCarriage) {
    const carrier = completeFragment(
      route.carrier?.kind === "shared-channel" ? route.carrier.channel : "a shared channel",
    );
    const channel = naturalCarrierPhrase(carrier);
    return [`The message produced by ${decisionLabel(route.accepted)} in ${source} reached ${target} through ${channel}.`];
  }
  if (route.classification === "direct-format" && route.receipt.selectedCarriage) {
    const format = completeFragment(route.carrier?.kind === "artifact-format" ? route.carrier.artifact : "recognizable");
    return [
      `People in ${target} saw a copy that looked like the ${format} from ${source}.`,
      "It did not carry the same message.",
    ];
  }
  if (route.classification !== "ambient") {
    const object = route.receipt.semantic === "content"
      ? "the selected message"
      : route.receipt.semantic === "format"
        ? "the selected presentation style"
        : "the selected message or presentation style";
    const held = route.receipt.avoidedReach > 0
      ? `The choice in ${source} kept ${object} out of ${target}.`
      : `${sentenceCase(object)} did not reach ${target} from ${source}.`;
    if (route.receipt.backgroundReach <= 0) return [held];
    return [held, `Other circulation continued in ${target}.`];
  }
  const ambientEffect = route.receipt.mechanism
    ? AMBIENT_EFFECT_COPY[route.receipt.mechanism](target)
    : `Nearby activity still changed the pressure in ${target}.`;
  return [
    `No selected message or presentation reached ${target} from ${source}.`,
    ambientEffect,
  ];
}

function decisionAtom(
  item: AcceptedDecision,
  placement: "opening" | "later" | "standalone",
): NarrativeAtom {
  return {
    role: "decision",
    text: decisionSentence(item, placement),
    sources: [decisionSource(item)],
    ...(placement === "later" ? { relationToPrevious: "chronological-after" as const } : {}),
  };
}

function decisionSentence(
  item: AcceptedDecision,
  placement: "opening" | "later" | "standalone",
  sequence = 1,
): string {
  const room = completeFragment(item.scenario.title);
  const actor = roleSubject(item);
  const transition = sequence <= 1
    ? "Later"
    : sequence % 3 === 2
      ? "After that"
      : sequence % 3 === 0
        ? "Later still"
        : "Afterward";
  if (item.decision.lastResort) {
    const move = lastResortDecisionReference(item);
    if (placement === "opening") return `${sentenceCase(actor)} chose ${move}.`;
    if (placement === "later") return `${transition}, ${actor} at ${room} chose ${move}.`;
    return `At ${room}, ${actor} chose ${move}.`;
  }
  if (placement === "opening") return `${sentenceCase(actor)} chose ${decisionLabel(item)}.`;
  if (placement === "later") return `${transition}, ${actor} at ${room} chose ${decisionLabel(item)}.`;
  return `At ${room}, ${actor} chose ${decisionLabel(item)}.`;
}

function decisionLabel(item: AcceptedDecision): string {
  return `“${completeFragment(item.decision.choiceLabel)}”`;
}

function lastResortDecisionReference(item: AcceptedDecision): string {
  return `the last resort “${completeFragment(item.decision.choiceLabel)}”`;
}

function lastResortCostAtoms(item: AcceptedDecision): NarrativeAtom[] {
  const move = item.decision.lastResort;
  if (!move) return [];
  return [
    costAtom(item, ["positiveConsequence"], sentenceFrom(move.positiveConsequence)),
    costAtom(item, ["protectedParty"], sentenceFrom(`This protects ${normalizedCopy(move.protectedParty)}`)),
    costAtom(item, ["harmedParty"], sentenceFrom(`${sentenceCase(normalizedCopy(move.harmedParty))} bears the cost`)),
    costAtom(item, ["negativeConsequence"], sentenceFrom(move.negativeConsequence)),
    costAtom(item, ["selfCost"], sentenceFrom(`${sentenceCase(roleSubject(item))} ${seatAction(move.selfCost)}`)),
  ];
}

function costAtom(
  item: AcceptedDecision,
  fields: Array<Extract<NarrativeSource, { kind: "last-resort-cost" }>["field"]>,
  text: string,
): NarrativeAtom {
  return {
    role: "cost",
    text,
    sources: fields.map((field) => ({
      kind: "last-resort-cost",
      decisionId: item.decision.id,
      scenarioId: item.scenario.id,
      field,
    })),
  };
}

function residueAtoms(
  scenario: GeneratedScenario,
  afterimage: Afterimage,
): NarrativeAtom[] {
  const room = completeFragment(scenario.title);
  const residue = METRIC_LABELS[afterimage.metric] ?? "pressure";
  const residueSentence = afterimageSentence(room, residue, afterimage);
  return [
    {
      role: "resolution",
      text: sentenceFrom(`In ${room}, ${lowercaseFirst(scenario.truth.laterResolution)}`),
      sources: [{ kind: "scenario-record", scenarioId: scenario.id, field: "laterResolution" }],
    },
    {
      role: "residue",
      text: residueSentence,
      sources: [{
        kind: "room-afterimage",
        scenarioId: afterimage.scenario.id,
        metric: afterimage.metric,
        atCompletion: afterimage.atCompletion,
        atDebrief: afterimage.atDebrief,
        normalizedChange: afterimage.normalizedMagnitude,
      }],
    },
  ];
}

function afterimageSentence(room: string, residue: string, afterimage: Afterimage): string {
  const rising = afterimage.delta > 0;
  switch (afterimage.metric) {
    case "reach":
      return `After ${room} closed, posts from that room ${rising ? "continued to spread" : "reached fewer people"}.`;
    case "crossover":
      return `After ${room} closed, material from that room appeared in ${rising ? "more" : "fewer"} rooms.`;
    case "provenance":
      return `After ${room} closed, copies linked to that room carried ${rising ? "more" : "less"} source context.`;
    case "verification":
      return `After ${room} closed, people had ${rising ? "more" : "less"} support for checking the claim discussed in that room.`;
    case "heat":
      return `After ${room} closed, reactions to the claim discussed in that room grew ${rising ? "more heated" : "calmer"}.`;
    case "blame":
      return `After ${room} closed, blame tied to the claim discussed in that room ${rising ? "concentrated further" : "eased"}.`;
    case "belief":
      return rising
        ? `After ${room} closed, people accepted the claim discussed in that room more strongly.`
        : `After ${room} closed, people became less certain about the claim discussed in that room.`;
    case "consensus":
      return `After ${room} closed, the claim discussed in that room appeared ${rising ? "more widely accepted" : "less widely accepted"}.`;
    case "trust":
      return `After ${room} closed, trust in the claim discussed in that room ${rising ? "increased" : "decreased"}.`;
    case "coordination":
      return `After ${room} closed, people became ${rising ? "more" : "less"} able to coordinate around the claim discussed in that room.`;
    case "commonGround":
      return `After ${room} closed, people shared ${rising ? "more" : "less"} common ground about the claim discussed in that room.`;
    default:
      return `After ${room} closed, ${residue} in that room ${rising ? "increased" : "decreased"}.`;
  }
}

function settledResidueAtoms(scenario: GeneratedScenario): NarrativeAtom[] {
  const room = completeFragment(scenario.title);
  return [
    {
      role: "resolution",
      text: sentenceFrom(`In ${room}, ${lowercaseFirst(scenario.truth.laterResolution)}`),
      sources: [{ kind: "scenario-record", scenarioId: scenario.id, field: "laterResolution" }],
    },
    {
      role: "residue",
      text: `Nothing around ${room} moved after closing.`,
      sources: [{ kind: "room-settled", scenarioId: scenario.id }],
    },
  ];
}

function routeSource(route: ClassifiedRoute): NarrativeSource {
  return {
    kind: "route",
    decisionId: route.accepted.decision.id,
    sourceScenarioId: route.accepted.scenario.id,
    targetScenarioId: route.receipt.targetScenarioId,
    linkId: route.receipt.linkId ?? "",
    classification: route.classification,
    selectedPathCarriage: hasSelectedPathCarriage(route),
    selectedCarriageReach: route.receipt.selectedCarriageReach,
    appliedReach: route.receipt.appliedReach,
    backgroundReach: route.receipt.backgroundReach,
    avoidedReach: route.receipt.avoidedReach,
    crossover: route.receipt.metrics.crossover ?? 0,
    compatibilityBasis: route.compatibilityBasis,
    revealedCue: route.revealedCue,
    carrierKind: route.carrier?.kind,
    carrierLabel: route.carrier?.kind === "shared-channel" ? route.carrier.channel : route.carrier?.artifact,
  };
}

function hasSelectedPathCarriage(route: ClassifiedRoute): boolean {
  return route.receipt.selectedCarriage;
}

function decisionSource(item: AcceptedDecision): NarrativeSource {
  return {
    kind: "decision",
    decisionId: item.decision.id,
    scenarioId: item.scenario.id,
    sceneId: item.scene.id,
    choiceId: item.choice.id,
    turn: item.decision.turn,
  };
}

function conceptExperienceMatches(
  term: LessonTerm,
  item: AcceptedDecision,
  state: NightState,
): ConceptExperienceMatch[] {
  const rules = item.scene.lesson.experienceRules.filter((rule) => rule.term === term);
  const events = [
    { id: item.decision.id, effects: item.decision.effects, kind: "decision" as const },
    ...state.ambientEvents
      .filter((event) =>
        event.sourceScenarioId === item.scenario.id && event.sourceSceneId === item.scene.id,
      )
      .map((event) => ({ id: event.id, effects: event.effects, kind: "ambient" as const })),
  ];
  return events.flatMap((event) => event.effects.flatMap((receipt) => rules.flatMap((rule) =>
    effectMatchesRule(rule, receipt, event.kind)
      ? [{ item, eventId: event.id, eventKind: event.kind, receipt, rule }]
      : [],
  )));
}

function conceptEvidence(
  status: ConceptStatus,
  related: AcceptedDecision[],
  played: Array<{ item: AcceptedDecision; binding: ConceptPlayBinding }>,
  experienced: ConceptExperienceMatch[],
  pack: GeneratedScenarioPack,
): ConceptEvidence {
  const first = related[0];
  if (status === "played") {
    const selected = played[0];
    const item = selected?.item ?? first;
    return {
      kind: "action",
      copy: selected ? playedEvidenceCopy(selected.binding, item) : encounteredEvidenceCopy(item),
      scenarioId: item.scenario.id,
      sceneId: item.scene.id,
      decisionId: item.decision.id,
    };
  }

  if (status === "experienced") {
    const match = experienced[0];
    const item = match?.item ?? first;
    const effectEventId = match?.eventId ?? item.decision.id;
    const targetScenarioId = match?.receipt.targetScenarioId ?? item.scenario.id;
    const target = pack.scenarios.find((candidate) => candidate.id === targetScenarioId);
    return {
      kind: "effect",
      copy: match
        ? experiencedEvidenceCopy(match, target)
        : encounteredEvidenceCopy(item),
      scenarioId: item.scenario.id,
      sceneId: item.scene.id,
      effectEventId,
      targetScenarioId,
    };
  }

  return {
    kind: "scene",
    copy: encounteredEvidenceCopy(first),
    scenarioId: first.scenario.id,
    sceneId: first.scene.id,
  };
}

function encounteredEvidenceCopy(item: AcceptedDecision): string {
  return `This concept appeared in a scene at ${completeFragment(item.scenario.title)}. No matching action or effect was recorded there.`;
}

function playedEvidenceCopy(binding: ConceptPlayBinding, item: AcceptedDecision): string {
  const label = completeFragment(item.decision.choiceLabel);
  const room = completeFragment(item.scenario.title);
  const selection = `In ${room}, you selected “${label}” for ${roleSubject(item)}.`;
  switch (binding.term) {
    case "signaling": {
      const capability = binding.delivery.carriage === "content"
        ? "The action was designed to share its wording beyond the room."
        : binding.delivery.carriage === "format"
          ? "The action reused the original post's appearance for a different message."
          : "The action was designed to share both its wording and presentation.";
      return `${selection} ${capability}`;
    }
    case "correction drag":
      return `${selection} ${binding.effect.metric === "verification" ? "The action was designed to make the claim easier to check." : "The action was designed to show where the claim came from."}`;
    case "market value":
      return `${selection} The action used attention to support a separate campaign or client goal.`;
    case "trust capital":
      return `${selection} The action relied on a person or role the room already trusted.`;
    case "status capital":
      return `${selection} The action used public visibility to protect someone's standing in the group.`;
  }
}

function experiencedEvidenceCopy(
  match: ConceptExperienceMatch,
  target: GeneratedScenario | undefined,
): string {
  const { item, eventKind, receipt, rule } = match;
  const source = completeFragment(item.scenario.title);
  const destination = completeFragment(target?.title ?? "another room");
  if (rule.kind === "receipt-field") {
    if (rule.field === "selectedCarriage") {
      return receipt.semantic === "format"
        ? `A selected action carried the presentation from ${source} into ${destination}, but not the same message.`
        : `A selected action carried the message from ${source} into ${destination}.`;
    }
    if (rule.field === "backgroundReach") {
      if (eventKind === "ambient") {
        return source === destination
          ? `People in ${source} saw more material as other circulation continued there.`
          : `People in ${destination} saw more material as other circulation continued from ${source}.`;
      }
      return source === destination
        ? `People in ${source} saw more material circulating separately from the selected message.`
        : `People in ${destination} saw more material from ${source}, but not the message selected there.`;
    }
    return `A choice in ${source} prevented some new exposure in ${destination}.`;
  }

  switch (rule.term) {
    case "correction drag": {
      const movement = match.eventKind === "ambient"
        ? `Before a choice was made in ${source}, the simulation recorded ${rule.metric === "verification" ? "more support for checking the claim" : "more information about its source"} in ${destination}.`
        : `After a choice in ${source}, the simulation recorded ${rule.metric === "verification" ? "more support for checking the claim" : "more information about its source"} in ${destination}.`;
      return movement;
    }
    case "market value":
      if (receipt.selectedCarriage) {
        const movement = receipt.semantic === "format"
          ? `A selected action carried the presentation from ${source} into ${destination}, but not the same message.`
          : `A selected action carried the message from ${source} into ${destination}.`;
        return `${movement} Attention in ${destination} also changed.`;
      }
      return `Activity linked to ${source} changed how much attention ${destination} received. The selected message and presentation did not cause that change.`;
    case "trust capital":
      return `The simulation recorded trust from ${source} affecting how people received information in ${destination}.`;
    case "status capital":
      if (rule.metric === "blame") return `Blame linked to ${source} changed in ${destination}.`;
      return `The appearance of agreement linked to ${source} changed in ${destination}.`;
  }
}

function effectMatchesRule(
  rule: ConceptEffectRule,
  receipt: EffectReceipt,
  eventKind: "decision" | "ambient",
): boolean {
  if (rule.event === "decision" && eventKind !== "decision") return false;
  if (receipt.scope !== rule.scope) return false;
  if ("semantic" in rule && receipt.semantic !== rule.semantic) return false;
  if ("mechanism" in rule && rule.mechanism && receipt.mechanism !== rule.mechanism) return false;
  if (rule.kind === "receipt-field") {
    if (rule.field === "selectedCarriage") return receipt.selectedCarriage;
    if (rule.field === "backgroundReach") return receipt.backgroundReach > 0;
    return receipt.avoidedReach > 0;
  }
  const value = receipt.metrics[rule.metric] ?? 0;
  return rule.direction === "increase" ? value > 0 : value !== 0;
}

function naturalCarrierPhrase(carrier: string): string {
  return /^(?:a|an|the|this|that|their|its|our)\b/i.test(carrier) ? carrier : `the ${carrier}`;
}

function strongestAfterimage(
  pack: GeneratedScenarioPack,
  state: NightState,
  visitedScenarios: GeneratedScenario[],
): Afterimage | undefined {
  const eligible = visitedScenarios.length > 0 ? visitedScenarios : pack.scenarios;
  return eligible.flatMap((scenario) => {
    const room = state.rooms[scenario.id];
    if (!room?.atCompletion) return [];
    return AFTERIMAGE_METRICS.flatMap((metric) => {
      const atCompletion = room.atCompletion?.[metric];
      const atDebrief = room.metrics[metric];
      if (typeof atCompletion !== "number" || atCompletion === atDebrief) return [];
      const delta = atDebrief - atCompletion;
      const scale = metric === "reach" ? Math.max(1, scenario.audienceCeiling) : 100;
      return [{
        scenario,
        metric,
        atCompletion,
        atDebrief,
        delta,
        normalizedMagnitude: Math.abs(delta) / scale,
      }];
    });
  }).sort((left, right) =>
    right.normalizedMagnitude - left.normalizedMagnitude
    || left.scenario.id.localeCompare(right.scenario.id)
    || left.metric.localeCompare(right.metric),
  )[0];
}

function sentenceFrom(value: string): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return ensureSentence(normalized);
}

function joinSentences(sentences: string[]): string {
  return sentences.map((sentence) => ensureSentence(sentence)).join(" ");
}

function ensureSentence(value: string): string {
  const cleaned = value.replace(/\s+/g, " ").trim();
  return /[.!?](?:["'’”\)\]])?$/.test(cleaned) ? cleaned : `${cleaned}.`;
}

function normalizedCopy(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function lowercaseFirst(value: string): string {
  return value.length === 0 ? value : `${value.charAt(0).toLocaleLowerCase()}${value.slice(1)}`;
}

function completeFragment(value: string): string {
  return value
    .replace(/[.!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function seatAction(value: string): string {
  const action = value.replace(/^the protagonist\s+/i, "");
  return lowercaseFirst(normalizedCopy(action));
}

function roleSubject(item: AcceptedDecision): string {
  const role = normalizedCopy(item.scenario.protagonistModel.role).replaceAll("-", " ");
  return /^(?:a|an|the)\b/i.test(role) ? role : `the ${role}`;
}

function wordCount(value: string): number {
  return value.trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
}

function paragraphsFromBlocks(blocks: NarrativeBlock[], maximumWords = 95): string[] {
  const paragraphs: string[] = [];
  let current = "";
  for (const block of blocks) {
    for (const unit of narrativeUnits(block)) {
      const unitText = joinAtomTexts(unit);
      if (wordCount(unitText) > maximumWords) {
        if (current) paragraphs.push(current);
        paragraphs.push(...paragraphsFromAtoms(unit, maximumWords));
        current = "";
        continue;
      }
      const candidate = joinAtomTexts([{ text: current }, { text: unitText }]);
      if (current && wordCount(candidate) > maximumWords) {
        paragraphs.push(current);
        current = unitText;
      } else {
        current = candidate;
      }
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

function narrativeUnits(block: NarrativeBlock): NarrativeAtom[][] {
  if (!block.item.decision.lastResort) return [block.atoms];
  const decisionIndex = block.atoms.findIndex((atom) => atom.role === "decision");
  if (decisionIndex <= 0) return [block.atoms];
  return [block.atoms.slice(0, decisionIndex), block.atoms.slice(decisionIndex)];
}

function paragraphsFromAtoms(atoms: NarrativeAtom[], maximumWords = 95): string[] {
  const paragraphs: string[] = [];
  let current = "";
  for (const atom of atoms) {
    const candidate = joinAtomTexts([{ text: current }, atom]);
    if (current && wordCount(candidate) > maximumWords) {
      paragraphs.push(current);
      current = normalizedCopy(atom.text);
    } else {
      current = candidate;
    }
  }
  if (current) paragraphs.push(current);
  return paragraphs;
}

function joinAtomTexts(atoms: Array<Pick<NarrativeAtom, "text">>): string {
  return atoms.map((atom) => normalizedCopy(atom.text)).filter(Boolean).join(" ");
}

function sentenceCase(value: string): string {
  return value.length === 0 ? value : `${value.charAt(0).toLocaleUpperCase()}${value.slice(1)}`;
}

function boundedParagraph(paragraph: string): string {
  return ensureSentence(normalizedCopy(paragraph));
}

function uniqueBy<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const id = key(value);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
