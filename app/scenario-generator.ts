/**
 * CHORUS constrained procedural scenario generator.
 *
 * This module deliberately composes from reviewed facts, roles, channel chains,
 * and action grammars. It does not generate free-form manipulation tactics.
 * Given the same seed and module version, it returns the same six-room pack.
 */

export type MetricName =
  | "reach"
  | "heat"
  | "crossover"
  | "belief"
  | "consensus"
  | "provenance"
  | "verification"
  | "trust"
  | "coordination"
  | "blame"
  | "interpretiveGap"
  | "commonGround"
  | "threadFocus"
  | "discernment"
  | "enactment";

export type GeneratedMetrics = Record<MetricName, number>;

export type ArtifactKind =
  | "clip"
  | "meme"
  | "comments"
  | "status"
  | "screenshot"
  | "live"
  | "lurker"
  | "correction"
  | "notice"
  | "map"
  | "ad"
  | "poll"
  | "dashboard";

export type ConstraintSystem =
  | "source"
  | "evidence"
  | "institution"
  | "relationship"
  | "distribution"
  | "time";

export type CrossRoomMechanism =
  | "shared-audience"
  | "format-imitation"
  | "attention-market"
  | "institutional-load"
  | "trust-carryover"
  | "ambient-ranking"
  | "attribution-carryover"
  | "code-collision"
  | "model-collision";

export type SocialContextAxis =
  | "regional"
  | "socioeconomic"
  | "social-group"
  | "professional"
  | "political"
  | "institutional"
  | "intergenerational"
  | "platform";

export type SocialContextFacet = {
  id: string;
  axis: SocialContextAxis;
  relation: "origin" | "current" | "acquired" | "aspirational";
  description: string;
};

export type LinguisticCodeId =
  | "task-direct"
  | "relationship-first"
  | "institutional-qualified"
  | "peer-ironic"
  | "local-reference"
  | "cross-regional-explicit"
  | "shift-handoff"
  | "sponsor-professional"
  | "coalition-autonomy"
  | "coalition-access";

export type LinguisticCodeDefinition = {
  id: LinguisticCodeId;
  label: string;
  functions: string[];
  availableThrough: SocialContextAxis[];
  observableFeatures: string[];
  commonMisreadings: string[];
  translationCue: string;
  stereotypeGuardrail: "situated-nonessential";
};

export type CodeAccess = {
  codeId: LinguisticCodeId;
  label: string;
  fluency: "habitual" | "practiced" | "situational";
  acquisitionFacetIds: string[];
  functions: string[];
};

export type WorldModelDefinition = {
  id: string;
  careMeans: string;
  evidenceMeans: string;
  authorityMeans: string;
  disagreementMeans: string;
  responsibilityUnit: string;
  revisionCue: string;
};

export type CodeSwitchRule = {
  toCodeId: LinguisticCodeId;
  audienceCondition: string;
  trigger: string;
  intendedFunction: string;
  switchLoad: Partial<FatigueLoad>;
};

export type GeneratedLanguageProfile = {
  id: string;
  socialContexts: SocialContextFacet[];
  repertoire: CodeAccess[];
  primaryCodeId: LinguisticCodeId;
  worldModel: WorldModelDefinition;
  stableCommitments: string[];
  switchRules: CodeSwitchRule[];
};

export type LinguisticEncounter = {
  codeRelation: "shared" | "different";
  worldModelRelation: "aligned" | "divergent";
  speakerCodeId: LinguisticCodeId;
  audienceCodeId: LinguisticCodeId;
  speakerWorldModel: WorldModelDefinition;
  audienceWorldModel: WorldModelDefinition;
  audienceContext: string;
  counterpartProfileId: string | null;
  surface: string;
  friction: string;
  unresolvedQuestion: string;
  repairMove: string;
};

export type ChoiceCodeAction = {
  mode: "maintain" | "switch" | "bridge";
  toCodeId: LinguisticCodeId;
  audienceContext: string;
  intendedFunction: string;
  switchReason: string;
  switchLoad: Partial<FatigueLoad>;
};

export type CommunicationDynamic =
  | "defensive-scapegoating"
  | "self-protective-rumor"
  | "warm-interior-cool-presentation"
  | "cold-interior-warm-presentation"
  | "sociocultural-code-mismatch"
  | "cross-coalition-code-convergence";

export type MisrepresentationBeneficiary =
  | "self"
  | "friend"
  | "family"
  | "person-under-authority"
  | "ally"
  | "client";

export type AdvancementDomain =
  | "social-class-story"
  | "sociocultural-standing"
  | "professional-standing"
  | "political-standing"
  | "market-position";

export type IncentiveIntersection = {
  competenceThreat: string;
  fearedInference: string;
  materialCounterrecord: string;
  protectedGroupStory: string;
  advancementDomains: AdvancementDomain[];
  competitivePrize: string;
  combinedMotive: string;
};

export type MisrepresentationLedger = {
  intentionality: "deliberate";
  beneficiary: MisrepresentationBeneficiary;
  relationshipLabel: string;
  protectedInterest: string;
  authorityCondition: string;
  knownRecord: string;
  alteredAccount: string;
  audienceCost: string;
  correctionDuty: string;
  incentiveIntersection: IncentiveIntersection;
  factBindings: {
    incidentId: IncidentId;
    knownRecord: string;
    alteredAccount: string;
    audienceCost: string;
    correctionDuty: string;
  };
};

export type CommunicationLedger = {
  dynamic: CommunicationDynamic;
  label: string;
  speakerMentalModel: string;
  audienceMentalModel: string;
  interiorOrientation: string;
  presentationTemperature: "warm" | "cool" | "mixed";
  speechCode: string;
  publicSurfaceCue: string;
  playInferenceHints: string[];
  linguisticEncounter: LinguisticEncounter;
  observableRecord: string[];
  inferences: string[];
  unknowns: string[];
  protectedStake: string;
  emotionalOvertake: string;
  emotionalTrigger: string;
  recognitionCues: string[];
  repairMove: string;
  substantiveCommonGround?: string;
  misrepresentation: MisrepresentationLedger;
  factBindings: {
    incidentId: IncidentId;
    hookId: string;
    surface: string;
    bridge: string;
    crossover: string;
    correction: string;
  };
  claim?: {
    targetRole: string;
    boundedBehavior: string;
    traitGeneralization: string;
    initiatorExposure: string;
    selfProtectionMode: string;
    evidenceStatus: "partial" | "unverified" | "contradicted";
    severity: "low-stakes-reputational";
  };
};

export type RelationalMove = {
  classification:
    | "blame-transfer"
    | "rumor-carriage"
    | "motive-assumption"
    | "code-collision"
    | "translation"
    | "bounded-accountability"
    | "repair";
  evidenceBasis: string;
  audienceInference: string;
  repairCue: string;
  misrepresentation: {
    intentionality: "deliberate" | "none";
    beneficiary?: MisrepresentationBeneficiary;
    recordDeparture?: string;
    incentiveIntersection?: string;
  };
};

export type ConversationDiversionMode =
  | "adjacent-concern"
  | "meme-deflection"
  | "absurdist-derailment";

export type ConversationDiversion = {
  mode: ConversationDiversionMode;
  scenePhase: Exclude<SceneAct, "SURFACE">;
  intentionality: "deliberate";
  activeQuestion: string;
  introducedMaterial: string;
  propositionStatus: "supported" | "no-proposition";
  responseFit: "adjacent-separate-thread" | "format-only" | "nonresponsive";
  placement: "same-thread";
  displacementEffect: string;
  actorMotive: string;
  betterRoute: string;
  recordBasis?: string;
};

export type FatigueKind = "attentional" | "affective" | "relational" | "verification" | "efficacy";

export type FatigueLoad = Record<FatigueKind, number>;

export type ChoiceBarrier = {
  motive: string;
  emotionalOvertake: string;
  trigger: string;
  conciseReason: string;
};

export type CrossRoomSemantic = "content" | "format" | "ambient";

export type CrossRoomCarrier =
  | {
      kind: "shared-channel";
      channel: string;
    }
  | {
      kind: "artifact-format";
      artifact: ArtifactKind;
    };

type CrossRoomLinkBase = {
  id: string;
  sourceScenarioId: string;
  targetScenarioId: string;
  mechanism: CrossRoomMechanism;
  strength: number;
  /** Safe to show before either endpoint has been entered. */
  vagueCue: string;
  /** Shown only after both endpoints have been entered. */
  revealedCue: string;
  /** A link can carry only part of a repair path; no one link is sufficient. */
  repairCapacity: ConstraintSystem[];
};

export type CrossRoomLink = CrossRoomLinkBase & (
  | {
      semantic: "ambient";
      layer: "ambient";
      carrier?: never;
      compatibilityBasis?: never;
    }
  | {
      semantic: "content";
      layer: "direct";
      carrier: Extract<CrossRoomCarrier, { kind: "shared-channel" }>;
      compatibilityBasis: string;
    }
  | {
      semantic: "format";
      layer: "direct";
      carrier: Extract<CrossRoomCarrier, { kind: "artifact-format" }>;
      compatibilityBasis: string;
    }
);

export type GeneratedNight = {
  id: string;
  startTime: string;
  roomsRunConcurrently: true;
  disclosureRule: "vague-until-both-entered";
  effectRule: "one-local-plus-five-cross-room-effects";
  generationPolicy: "validated-regeneration-without-session-cap";
  links: CrossRoomLink[];
};

export type CrossSystemCondition = {
  id: string;
  system: ConstraintSystem;
  label: string;
  currentlyMet: boolean;
};

export type ChoiceAvailability =
  | { status: "available" }
  | {
      status: "locked";
      requires: CrossSystemCondition[];
      reason: string;
      agencyNote: "No single actor controls this outcome.";
      repairPath: DistributedRepairPath;
    };

export type RepairMechanism = {
  id: string;
  label: string;
  satisfiesConditionIds: string[];
  alternateControllers: string[];
};

export type DistributedRepairPath = {
  viable: true;
  mechanisms: RepairMechanism[];
  noIndispensableActor: true;
  unlockHint: string;
};

/**
 * A selected action plays a concept only when this authored, typed binding is
 * present. Display copy and the generic `signal` field are never predicates.
 * Saturation is intentionally absent: it is experienced through receipts.
 */
export type ConceptPlayBinding =
  | {
      term: "signaling";
      basis: "outward-delivery";
      act: "SURFACE";
      delivery: {
        scope: "shared" | "public";
        carriage: "content" | "format" | "content-and-format";
      };
    }
  | {
      term: "correction drag";
      basis: "source-bearing-repair";
      act: "CORRECTION";
      actorKind: ProtagonistKind;
      relationalClassification: "repair" | "bounded-accountability" | "translation";
      effect: {
        metric: "verification" | "provenance";
        direction: "increase";
      };
    }
  | {
      term: "market value";
      basis: "attention-value";
      act: "BRIDGE";
      actorKind: "marketer" | "abstract_bad_actor";
      relationalClassification: "blame-transfer" | "rumor-carriage" | "motive-assumption" | "code-collision";
      effect: {
        metric: "reach";
        direction: "increase";
      };
    }
  | {
      term: "trust capital";
      basis: "trusted-role-carriage";
      act: "BRIDGE";
      actorKind: "caregiver" | "institutional";
      relationalClassification: Exclude<RelationalMove["classification"], "repair">;
      effect: {
        metric: "reach";
        direction: "increase";
      };
    }
  | {
      term: "status capital";
      basis: "visible-standing-carriage";
      act: "BRIDGE";
      actorKind: "youth" | "creator" | "political";
      relationalClassification: Exclude<RelationalMove["classification"], "repair">;
      effect: {
        metric: "reach";
        direction: "increase";
      };
    };

/**
 * Receipt rules are conjunctive. A debrief may mark a concept experienced only
 * when one receipt exactly matches every authored field in one rule.
 * `selectedCarriage` means `true`; numeric receipt fields mean greater than
 * zero; metric directions mean greater than zero or non-zero, respectively.
 */
export type ConceptEffectRule =
  | {
      term: "signaling";
      kind: "receipt-field";
      event: "decision";
      source: "lesson-scene";
      scope: "cross-room";
      field: "selectedCarriage";
      semantic: "content" | "format";
    }
  | {
      term: "saturation";
      kind: "receipt-field";
      event: "any";
      source: "lesson-scene";
      scope: "local" | "cross-room";
      field: "backgroundReach" | "avoidedReach";
    }
  | {
      term: "correction drag";
      kind: "metric";
      event: "any";
      source: "lesson-scene";
      scope: "local" | "cross-room";
      metric: "verification" | "provenance";
      direction: "increase";
      mechanism?: "institutional-load";
    }
  | {
      term: "market value";
      kind: "metric";
      event: "any";
      source: "lesson-scene";
      scope: "cross-room";
      metric: "heat" | "consensus" | "coordination" | "enactment" | "threadFocus";
      direction: "change";
      mechanism: "attention-market";
    }
  | {
      term: "trust capital";
      kind: "receipt-field";
      event: "decision";
      source: "lesson-scene";
      scope: "cross-room";
      field: "selectedCarriage";
      mechanism: "trust-carryover";
    }
  | {
      term: "trust capital";
      kind: "metric";
      event: "any";
      source: "lesson-scene";
      scope: "cross-room";
      metric: "trust" | "belief" | "consensus" | "blame";
      direction: "change";
      mechanism: "trust-carryover";
    }
  | {
      term: "status capital";
      kind: "receipt-field";
      event: "any";
      source: "lesson-scene";
      scope: "cross-room";
      field: "backgroundReach";
      mechanism: "ambient-ranking";
    }
  | {
      term: "status capital";
      kind: "metric";
      event: "any";
      source: "lesson-scene";
      scope: "cross-room";
      metric: "consensus" | "blame" | "commonGround" | "heat";
      direction: "change";
      mechanism: "attribution-carryover" | "ambient-ranking";
    };

/** Structurally compatible with the current page Choice, with lock metadata. */
export type GeneratedChoice = {
  id: string;
  label: string;
  detail: string;
  intent: string;
  signal: string;
  minutes: number;
  effects: Partial<GeneratedMetrics>;
  availability: ChoiceAvailability;
  locked: boolean;
  lockReason?: string;
  missingConditions?: string;
  unlockHint?: string;
  repairPath?: DistributedRepairPath;
  ideal?: boolean;
  ethicsTags: string[];
  /** Typed delivery scope; cross-room carriage never depends on label/detail copy. */
  delivery: ChoiceDelivery;
  /** Authored concept predicates; an empty array is a deliberate non-play. */
  conceptPlays: ConceptPlayBinding[];
  relationalMove: RelationalMove;
  conversationDiversion?: ConversationDiversion;
  codeAction?: ChoiceCodeAction;
  fatigueLoad: Partial<FatigueLoad>;
  enactmentRequired?: number;
  blockedAttempt?: ChoiceBarrier;
  lastResort?: LastResortMove;
  behaviorMove: BehaviorMove;
  frameworkMoves?: FrameworkMove[];
};

export type ChoiceCopyVoiceClass = "catalysis" | "plain-utility";

/**
 * Stable safety, repair, and locked-ideal affordances repeat so their action
 * stays learnable across rooms. Their direct copy is utility language; the
 * incident-responsive remainder carries the experiential Catalysis voice.
 * Classification depends on typed availability and ethics records, never on
 * a label string.
 */
export function choiceCopyVoiceClass(
  choice: Pick<GeneratedChoice, "availability" | "ethicsTags">,
): ChoiceCopyVoiceClass {
  const tags = new Set(choice.ethicsTags);
  if (choice.availability.status === "locked" && tags.has("visible-ideal")) return "plain-utility";
  if (tags.has("distributed-unlock") && tags.has("reachable-repair")) return "plain-utility";
  if (tags.has("verification") && tags.has("time-cost") && tags.has("non-amplification-floor")) {
    return "plain-utility";
  }
  if (tags.has("partial-repair") && tags.has("trusted-bridge") && tags.has("non-amplification-floor")) {
    return "plain-utility";
  }
  return "catalysis";
}

export type ChoiceDelivery = {
  scope: "private" | "shared" | "public" | "withheld";
  carriage: "none" | "content" | "format" | "content-and-format";
};

export type FrameworkId =
  | "situated-leadership"
  | "repair-conversation"
  | "situated-action-review"
  | "social-projection"
  | "reputational-power"
  | "strategic-interaction"
  | "expertise-feedback"
  | "impression-management"
  | "competence-threat"
  | "classical-institutions"
  | "classical-interdependence"
  | "classical-terrain";

export type FrameworkMove = {
  frameworkId: FrameworkId;
  frameworkLabel: string;
  sourceWork: string;
  stepId?: string;
  problem: string;
  idea: string;
  solution: string;
  applicability: string;
};

export type AppliedFramework = {
  id: FrameworkId;
  label: string;
  sourceWork: string;
  situationalOnly: true;
  problem: string;
  idea: string;
  solution: string;
};

export type BehaviorPhase =
  | "calm"
  | "trigger"
  | "escalation"
  | "higher-escalation"
  | "crisis"
  | "de-escalation"
  | "recovery";

export type BehaviorMove = "hold" | "intensify" | "contain" | "settle" | "surge";

export type BehaviorCycle = {
  modeled: boolean;
  initialPhase: BehaviorPhase | null;
  possiblePhases: BehaviorPhase[];
  omittedByDefault: BehaviorPhase[];
  trigger: string;
  situationalRationale: string;
};

export type LastResortMove = {
  eligibility: "high-discernment-extreme-fatigue";
  minimumDiscernment: number;
  maximumEnactment: number;
  minimumCompositeFatigue: number;
  minimumDominantFatigue: number;
  protectedParty: string;
  positiveConsequence: string;
  harmedParty: string;
  negativeConsequence: string;
  selfCost: string;
  ordinaryBoundary: string;
};

export type LessonTerm =
  | "saturation"
  | "signaling"
  | "market value"
  | "correction drag"
  | "trust capital"
  | "status capital";

export type SceneLesson = {
  term: LessonTerm;
  definition: string;
  perspective: string;
  observable: string;
  experienceRules: ConceptEffectRule[];
};

export type TruthLedger = {
  readonly knownFact: string;
  readonly unresolvedAtEntry: string;
  readonly laterResolution: string;
};

export type PropagationLedger = {
  readonly circulatingFrame: string;
};

export type SceneAct = "SURFACE" | "BRIDGE" | "CROSSOVER" | "CORRECTION";

export type RecordAtom = {
  readonly id: string;
  readonly access: "public-record" | "seat-private-assignment-brief";
  readonly label: string;
  readonly copy: string;
};

export type SceneDisclosure = {
  readonly records: readonly RecordAtom[];
  readonly questions: readonly RecordAtom[];
  readonly unknowns: readonly RecordAtom[];
};

export type ProtagonistKind =
  | "youth"
  | "caregiver"
  | "creator"
  | "marketer"
  | "political"
  | "institutional"
  | "abstract_bad_actor";

export type GeneratedProtagonist = {
  id: string;
  kind: ProtagonistKind;
  role: string;
  mentality: string;
  primaryGoal: string;
  goalDomain: "social" | "political" | "business" | "marketing" | "institutional";
  incidentConnection: string;
  whatTheyKnow: string[];
  whatTheyNeed: string[];
  whatTheyCouldLose: string[];
  capabilities: string[];
  constraints: string[];
  operationalDetailLevel: "none" | "abstract";
  prosocialOrientation: "strong" | "mixed" | "instrumental";
  discernmentBaseline: number;
  enactmentBaseline: number;
  languageProfile: GeneratedLanguageProfile;
};

export type ChainStep = {
  id: string;
  room: string;
  transform:
    | "original"
    | "crop"
    | "screenshot"
    | "meme"
    | "status"
    | "trend-summary"
    | "talking-point"
    | "press-inquiry"
    | "correction";
  provenance: number;
  socialFit: number;
};

/**
 * Structurally compatible with the current page Scene. Additional fields make
 * the room auditable and suitable for future graph-based simulation.
 */
export type GeneratedScene = {
  id: string;
  act: SceneAct;
  seat: string;
  age?: number;
  motive: string;
  time: string;
  channel: string;
  heading: string;
  body: string;
  reason: string;
  artifact: ArtifactKind;
  provenance: number;
  fluency: number;
  socialProof: string;
  interstitial: string;
  autonomous: Partial<GeneratedMetrics>;
  choices: GeneratedChoice[];
  artifactTitle?: string;
  artifactCopy?: string;
  artifactTag?: string;
  bridge?: string;
  roleBrief?: {
    publicGoal: string;
    privateNeed: string;
    pressure: string;
    believedRisk: string;
    blindSpot: string;
  };
  lesson: SceneLesson;
  disclosure: SceneDisclosure;
  platformLoad: Partial<FatigueLoad>;
};

export type PageScenario = {
  id: string;
  code: string;
  title: string;
  domain: string;
  location: string;
  duration: string;
  startTime: string;
  protagonist: string;
  mode: "SINGLE SEAT";
  objective: string;
  description: string;
  thesis: string;
  groundTruth: string;
  contentNote: string;
  pressure: "LOW" | "MEDIUM" | "HIGH";
  channels: number;
  audienceCeiling: number;
  syntheticSeats: number;
  coordinatedShare: number;
  coordinatorLabel: string;
  valueLens: {
    label: string;
    explanation: string;
  };
  chain: string[];
  debriefHeadline: string;
  debriefLead: string;
  carryFact: string;
  lineage: [string, string][];
  counterfactuals: [string, number, string][];
  scenes: GeneratedScene[];
};

export type GeneratedScenario = PageScenario & {
  generatorVersion: 14;
  audienceRating: "PG";
  contentNotes: string[];
  truth: TruthLedger;
  propagation: PropagationLedger;
  protagonistModel: GeneratedProtagonist;
  chainModel: ChainStep[];
  communicationModel: CommunicationLedger;
  behaviorCycle: BehaviorCycle;
  frameworks: AppliedFramework[];
};

export type CoherenceCheck = {
  id: string;
  label: string;
  passed: boolean;
  severity: "error" | "warning";
  message: string;
  detail: string;
};

export type CoherenceReport = {
  scenarioId: string;
  passed: boolean;
  score: number;
  checks: CoherenceCheck[];
};

export type GeneratedScenarioPack = {
  seed: number;
  generatorVersion: 14;
  night: GeneratedNight;
  nightReport: CoherenceReport;
  scenarios: GeneratedScenario[];
  reports: CoherenceReport[];
  rejectedDrafts: RejectedDraft[];
};

export type RejectedDraft = {
  scenarioId: string;
  reasons: string[];
};

type IncidentId =
  | "harbor-glass"
  | "blackout-map"
  | "shelf-shift"
  | "recall-loop"
  | "festival-static"
  | "fare-pilot"
  | "rehearsal-note"
  | "shelter-sign";

type IncidentCommunicationHook = {
  id: string;
  targetRole: string;
  accountableAction: string;
  boundedBehavior: string;
  traitGeneralization: string;
  replyAsymmetry: string;
  coolMessage: string;
  prosocialEvidence: string;
  warmMessage: string;
  relationshipFirstCode: string;
  taskFirstCode: string;
  coalitionCodeA: string;
  coalitionCodeB: string;
  commonGround: string;
  relationalResolution: string;
  activeQuestion: string;
  adjacentConcern: string;
  adjacentConcernBasis: string;
  memeSurface: string;
  absurdistSurface: string;
};

type IncidentTemplate = {
  id: IncidentId;
  title: string;
  placeNoun: string;
  knownFact: string;
  unresolved: string;
  circulatingFrame: string;
  resolution: string;
  heading: string;
  neutralBody: string;
  sourceReason: string;
  artifactKinds: ArtifactKind[];
  youthFit: boolean;
  badActorFit: boolean;
  idealEvidence: string;
  chainBlueprints: readonly (readonly ChainStepSeed[])[];
};

type ChainStepSeed = Omit<ChainStep, "id" | "provenance" | "socialFit">;

type ActorTemplate = {
  id: string;
  kind: ProtagonistKind;
  role: string;
  seat: string;
  act: string;
  ageRange?: readonly [number, number];
  mentality: string;
  motive: string;
  goalDomain: GeneratedProtagonist["goalDomain"];
  goal: string;
  connection: (incident: IncidentTemplate) => string;
  channel: string;
  capabilities: string[];
  constraints: string[];
  operationalDetailLevel: GeneratedProtagonist["operationalDetailLevel"];
};

type LanguageProfileBlueprint = {
  id: string;
  socialContexts: SocialContextFacet[];
  repertoire: Array<Pick<CodeAccess, "codeId" | "fluency" | "acquisitionFacetIds">>;
  primaryCodeId: LinguisticCodeId;
  worldModelId: string;
};

type LinguisticEncounterAssignment = Pick<
  LinguisticEncounter,
  "codeRelation" | "worldModelRelation" | "audienceCodeId" | "audienceContext" | "counterpartProfileId"
> & {
  audienceWorldModelId: string;
};

type ConversationDiversionAssignment = Pick<ConversationDiversion, "mode" | "scenePhase">;

const GENERATOR_VERSION = 14 as const;
const NO_SINGLE_ACTOR = "No single actor controls this outcome." as const;

const LINGUISTIC_CODES: Record<LinguisticCodeId, LinguisticCodeDefinition> = {
  "task-direct": {
    id: "task-direct",
    label: "compressed task handoff",
    functions: ["coordinate a bounded action", "reduce ambiguity about the next step"],
    availableThrough: ["professional", "institutional", "social-group", "socioeconomic"],
    observableFeatures: ["short action verbs", "explicit timing", "limited relational preface"],
    commonMisreadings: ["brevity is taken as indifference", "an explicit boundary is taken as hostility"],
    translationCue: "Keep the requested action and add the relationship or impact cue this audience uses.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "relationship-first": {
    id: "relationship-first",
    label: "relationship-first assurance",
    functions: ["establish mutual concern", "locate a request inside an ongoing relationship"],
    availableThrough: ["regional", "social-group", "intergenerational", "professional"],
    observableFeatures: ["shared-stake preface", "recognition before procedure", "continuity language"],
    commonMisreadings: ["warmth is taken as agreement", "acknowledgment is taken as sufficient evidence"],
    translationCue: "Retain the acknowledgment while making the evidence boundary and requested action explicit.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "institutional-qualified": {
    id: "institutional-qualified",
    label: "qualified public record",
    functions: ["preserve attributable scope", "separate current evidence from pending review"],
    availableThrough: ["institutional", "professional", "political", "socioeconomic"],
    observableFeatures: ["named scope", "source qualification", "promised update condition"],
    commonMisreadings: ["qualification is taken as evasion", "procedural limits are taken as lack of care"],
    translationCue: "Name why the qualification protects the audience and when the record can change.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "peer-ironic": {
    id: "peer-ironic",
    label: "peer-ironic shorthand",
    functions: ["signal belonging", "compress a shared reaction without a formal claim"],
    availableThrough: ["social-group", "platform", "regional", "intergenerational"],
    observableFeatures: ["shared image reference", "understatement", "context-dependent humor"],
    commonMisreadings: ["humor is taken as disbelief", "recognizable form is taken as factual agreement"],
    translationCue: "Ask what action or claim, if any, the shorthand is carrying before assigning a position.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "local-reference": {
    id: "local-reference",
    label: "place-linked continuity",
    functions: ["connect a new event to shared local memory", "make a public issue legible through familiar references"],
    availableThrough: ["regional", "social-group", "professional", "political"],
    observableFeatures: ["place reference", "shared chronology", "locally familiar comparison"],
    commonMisreadings: ["familiarity is taken as first-hand knowledge", "local fluency is taken as accountability"],
    translationCue: "Keep the useful local reference and distinguish memory, current evidence, and incentive.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "cross-regional-explicit": {
    id: "cross-regional-explicit",
    label: "cross-context explicitness",
    functions: ["supply context that cannot be assumed", "coordinate across different local conventions"],
    availableThrough: ["regional", "professional", "social-group", "institutional"],
    observableFeatures: ["expanded context", "terms defined in place", "fewer assumed references"],
    commonMisreadings: ["extra explanation is taken as condescension", "explicitness is taken as distance"],
    translationCue: "Check which context is genuinely missing and remove explanation that does no practical work.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "shift-handoff": {
    id: "shift-handoff",
    label: "time-bounded handoff",
    functions: ["carry practical responsibility across schedules", "mark what is complete and what remains open"],
    availableThrough: ["professional", "socioeconomic", "institutional", "social-group"],
    observableFeatures: ["status first", "named owner", "next-check condition"],
    commonMisreadings: ["compression is taken as low investment", "ownership language is taken as rank assertion"],
    translationCue: "Preserve the status and owner while naming who depends on the handoff and why.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "sponsor-professional": {
    id: "sponsor-professional",
    label: "sponsor-facing professional",
    functions: ["translate uncertainty into decision risk", "make an action legible to a resource holder"],
    availableThrough: ["professional", "socioeconomic", "institutional", "political"],
    observableFeatures: ["decision frame", "risk boundary", "resource consequence"],
    commonMisreadings: ["polish is taken as certainty", "resource fluency is taken as substantive expertise"],
    translationCue: "Retain the decision consequence and restore the evidence and uncertainty that support it.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "coalition-autonomy": {
    id: "coalition-autonomy",
    label: "autonomy-centered coalition code",
    functions: ["protect individual choice", "frame institutional action through retained agency"],
    availableThrough: ["political", "social-group", "regional", "professional"],
    observableFeatures: ["choice verbs", "limits on institutional control", "voluntary participation cue"],
    commonMisreadings: ["autonomy language is taken as opposition to public provision", "shared action is hidden by ownership language"],
    translationCue: "Normalize the statement into the concrete choice, service, or limit being proposed.",
    stereotypeGuardrail: "situated-nonessential",
  },
  "coalition-access": {
    id: "coalition-access",
    label: "access-centered coalition code",
    functions: ["protect equal practical access", "frame institutional action through shared provision"],
    availableThrough: ["political", "social-group", "institutional", "professional"],
    observableFeatures: ["access verbs", "distribution condition", "shared-service cue"],
    commonMisreadings: ["access language is taken as hostility to individual choice", "shared action is hidden by ownership language"],
    translationCue: "Normalize the statement into the concrete choice, service, or limit being proposed.",
    stereotypeGuardrail: "situated-nonessential",
  },
};

const WORLD_MODELS: Record<string, WorldModelDefinition> = {
  "care-as-early-warning": {
    id: "care-as-early-warning",
    careMeans: "warn trusted people early enough for them to act",
    evidenceMeans: "a credible possibility can justify a provisional warning",
    authorityMeans: "responsibility follows the person others rely on for a handoff",
    disagreementMeans: "delay may expose someone to a preventable cost",
    responsibilityUnit: "the relationship network receiving the warning",
    revisionCue: "a bounded update can preserve care while withdrawing an unsupported conclusion",
  },
  "care-as-bounded-accuracy": {
    id: "care-as-bounded-accuracy",
    careMeans: "prevent an incomplete account from governing another person's decision",
    evidenceMeans: "scope, source, and uncertainty must travel with the warning",
    authorityMeans: "the publisher owes an attributable boundary even under urgency",
    disagreementMeans: "premature certainty may create a second avoidable harm",
    responsibilityUnit: "the complete evidence and distribution chain",
    revisionCue: "acknowledge the practical risk while restoring the missing evidentiary boundary",
  },
  "authority-as-procedure": {
    id: "authority-as-procedure",
    careMeans: "publish only what the represented process can support",
    evidenceMeans: "an attributable record changes through a named review condition",
    authorityMeans: "legitimacy comes from a repeatable and inspectable procedure",
    disagreementMeans: "pressure does not remove the obligation to qualify the record",
    responsibilityUnit: "the authorized process and every handoff it governs",
    revisionCue: "pair the procedure with a direct account of impact and reply access",
  },
  "authority-as-answerability": {
    id: "authority-as-answerability",
    careMeans: "remain reachable to people carrying the consequence",
    evidenceMeans: "a record becomes usable when affected people can question its source and scope",
    authorityMeans: "legitimacy comes from visible responsibility and correction",
    disagreementMeans: "a polished answer without reply access remains incomplete",
    responsibilityUnit: "the decision-maker and the people affected by the decision",
    revisionCue: "open a reply route while preserving the attributable evidence boundary",
  },
  "solidarity-as-shared-outcome": {
    id: "solidarity-as-shared-outcome",
    careMeans: "make the concrete protection available even across group vocabularies",
    evidenceMeans: "agreement is tested by compatible actions rather than familiar labels",
    authorityMeans: "leadership belongs to whoever can make the shared commitment durable",
    disagreementMeans: "different language may conceal agreement or a smaller residual dispute",
    responsibilityUnit: "the people jointly affected by the proposed action",
    revisionCue: "translate both positions into verbs and preserve only the disagreement that remains",
  },
  "solidarity-as-recognizable-stance": {
    id: "solidarity-as-recognizable-stance",
    careMeans: "use a form trusted people can recognize as standing with them",
    evidenceMeans: "socially legible alignment helps a claim receive attention",
    authorityMeans: "trusted group membership supplies an initial hearing but not final proof",
    disagreementMeans: "unfamiliar phrasing can signal distance even when the action overlaps",
    responsibilityUnit: "the group whose standing is being negotiated",
    revisionCue: "compare the recognized stance with the exact action and evidence it carries",
  },
  "utility-as-thematic-value": {
    id: "utility-as-thematic-value",
    careMeans: "a useful surface lowers resistance to the contracted objective",
    evidenceMeans: "ambiguity remains useful when it supports a reusable theme",
    authorityMeans: "the client defines success while affected people remain outside the contract",
    disagreementMeans: "resolution can reduce the account's strategic value",
    responsibilityUnit: "the contracted production chain",
    revisionCue: "disclose or refuse the incentive and return evaluation to the incident record",
  },
};

const LANGUAGE_BLUEPRINTS: Record<ProtagonistKind, readonly LanguageProfileBlueprint[]> = {
  youth: [
    {
      id: "interregional-student-organizer",
      socialContexts: [
        { id: "youth-a-region", axis: "regional", relation: "current", description: "an interregional household translating between family and school conventions" },
        { id: "youth-a-material", axis: "socioeconomic", relation: "current", description: "a household where schedules and transport leave little spare coordination time" },
        { id: "youth-a-peer", axis: "social-group", relation: "current", description: "a peer organizing group that uses images, brevity, and direct planning" },
      ],
      repertoire: [
        { codeId: "peer-ironic", fluency: "habitual", acquisitionFacetIds: ["youth-a-peer"] },
        { codeId: "relationship-first", fluency: "practiced", acquisitionFacetIds: ["youth-a-region", "youth-a-peer"] },
        { codeId: "task-direct", fluency: "situational", acquisitionFacetIds: ["youth-a-material", "youth-a-peer"] },
      ],
      primaryCodeId: "peer-ironic",
      worldModelId: "care-as-early-warning",
    },
    {
      id: "local-volunteer-student",
      socialContexts: [
        { id: "youth-b-region", axis: "regional", relation: "origin", description: "a long-rooted local network with dense shared references" },
        { id: "youth-b-material", axis: "socioeconomic", relation: "current", description: "a materially stable household with tightly scheduled care and activity commitments" },
        { id: "youth-b-peer", axis: "social-group", relation: "acquired", description: "a mixed-age student volunteer group that requires explicit handoffs" },
      ],
      repertoire: [
        { codeId: "local-reference", fluency: "habitual", acquisitionFacetIds: ["youth-b-region", "youth-b-peer"] },
        { codeId: "task-direct", fluency: "practiced", acquisitionFacetIds: ["youth-b-material", "youth-b-peer"] },
        { codeId: "peer-ironic", fluency: "situational", acquisitionFacetIds: ["youth-b-peer"] },
      ],
      primaryCodeId: "local-reference",
      worldModelId: "solidarity-as-shared-outcome",
    },
  ],
  caregiver: [
    {
      id: "local-shift-care-network",
      socialContexts: [
        { id: "care-a-region", axis: "regional", relation: "origin", description: "a locally rooted family network with long-running mutual obligations" },
        { id: "care-a-material", axis: "socioeconomic", relation: "current", description: "an hourly-schedule household coordinating care across limited time windows" },
        { id: "care-a-group", axis: "social-group", relation: "current", description: "a multi-household care group where warning credibility is relational" },
        { id: "care-a-work", axis: "professional", relation: "acquired", description: "shift work that rewards compact status and owner handoffs" },
      ],
      repertoire: [
        { codeId: "relationship-first", fluency: "habitual", acquisitionFacetIds: ["care-a-region", "care-a-group"] },
        { codeId: "shift-handoff", fluency: "practiced", acquisitionFacetIds: ["care-a-material", "care-a-work"] },
        { codeId: "task-direct", fluency: "situational", acquisitionFacetIds: ["care-a-material", "care-a-work"] },
      ],
      primaryCodeId: "relationship-first",
      worldModelId: "care-as-early-warning",
    },
    {
      id: "mobile-care-coordinator",
      socialContexts: [
        { id: "care-b-region", axis: "regional", relation: "current", description: "a recently combined interregional family network without one shared local shorthand" },
        { id: "care-b-material", axis: "socioeconomic", relation: "current", description: "a salaried household whose resource buffer does not remove care-time scarcity" },
        { id: "care-b-group", axis: "social-group", relation: "current", description: "a family group spanning different evidence and risk habits" },
        { id: "care-b-work", axis: "professional", relation: "acquired", description: "administrative work using qualified written records" },
      ],
      repertoire: [
        { codeId: "cross-regional-explicit", fluency: "habitual", acquisitionFacetIds: ["care-b-region", "care-b-group"] },
        { codeId: "relationship-first", fluency: "practiced", acquisitionFacetIds: ["care-b-region", "care-b-group"] },
        { codeId: "institutional-qualified", fluency: "situational", acquisitionFacetIds: ["care-b-material", "care-b-work"] },
      ],
      primaryCodeId: "cross-regional-explicit",
      worldModelId: "care-as-bounded-accuracy",
    },
  ],
  creator: [
    {
      id: "local-freelance-interpreter",
      socialContexts: [
        { id: "creator-a-region", axis: "regional", relation: "origin", description: "a locally rooted audience built through shared civic chronology" },
        { id: "creator-a-material", axis: "socioeconomic", relation: "current", description: "variable freelance income tied to audience and sponsor continuity" },
        { id: "creator-a-group", axis: "social-group", relation: "current", description: "a creator-source network with informal reciprocity" },
        { id: "creator-a-work", axis: "professional", relation: "acquired", description: "sponsor and newsroom collaboration requiring decision-ready framing" },
      ],
      repertoire: [
        { codeId: "local-reference", fluency: "habitual", acquisitionFacetIds: ["creator-a-region", "creator-a-group"] },
        { codeId: "sponsor-professional", fluency: "practiced", acquisitionFacetIds: ["creator-a-material", "creator-a-work"] },
        { codeId: "institutional-qualified", fluency: "situational", acquisitionFacetIds: ["creator-a-work"] },
      ],
      primaryCodeId: "local-reference",
      worldModelId: "authority-as-answerability",
    },
    {
      id: "interregional-coalition-creator",
      socialContexts: [
        { id: "creator-b-region", axis: "regional", relation: "current", description: "an interregional audience that cannot rely on one place-specific shorthand" },
        { id: "creator-b-material", axis: "socioeconomic", relation: "current", description: "stable project income alongside competitive attention-dependent work" },
        { id: "creator-b-group", axis: "social-group", relation: "current", description: "a cross-community issue network using multiple political vocabularies" },
        { id: "creator-b-politics", axis: "political", relation: "acquired", description: "coalition work that translates autonomy and access claims" },
      ],
      repertoire: [
        { codeId: "cross-regional-explicit", fluency: "habitual", acquisitionFacetIds: ["creator-b-region", "creator-b-group"] },
        { codeId: "coalition-access", fluency: "practiced", acquisitionFacetIds: ["creator-b-group", "creator-b-politics"] },
        { codeId: "coalition-autonomy", fluency: "situational", acquisitionFacetIds: ["creator-b-group", "creator-b-politics"] },
      ],
      primaryCodeId: "cross-regional-explicit",
      worldModelId: "solidarity-as-shared-outcome",
    },
  ],
  marketer: [
    {
      id: "mobile-brand-professional",
      socialContexts: [
        { id: "market-a-region", axis: "regional", relation: "current", description: "an interregional assignment where local references must be learned rather than assumed" },
        { id: "market-a-material", axis: "socioeconomic", relation: "current", description: "a salaried professional position evaluated through quarterly market performance" },
        { id: "market-a-group", axis: "social-group", relation: "acquired", description: "a campaign team whose internal shorthand privileges speed and fit" },
        { id: "market-a-work", axis: "professional", relation: "current", description: "sponsor-facing work translating ambiguity into a decision frame" },
      ],
      repertoire: [
        { codeId: "sponsor-professional", fluency: "habitual", acquisitionFacetIds: ["market-a-material", "market-a-work"] },
        { codeId: "cross-regional-explicit", fluency: "practiced", acquisitionFacetIds: ["market-a-region", "market-a-group"] },
        { codeId: "local-reference", fluency: "situational", acquisitionFacetIds: ["market-a-region", "market-a-group"] },
      ],
      primaryCodeId: "sponsor-professional",
      worldModelId: "solidarity-as-recognizable-stance",
    },
    {
      id: "local-upward-mobile-brand-lead",
      socialContexts: [
        { id: "market-b-region", axis: "regional", relation: "origin", description: "a locally rooted professional network with dense status cues" },
        { id: "market-b-material", axis: "socioeconomic", relation: "aspirational", description: "upward professional mobility tied to sponsor confidence and campaign ownership" },
        { id: "market-b-group", axis: "social-group", relation: "current", description: "a mixed-rank production group with uneven permission to challenge the account" },
        { id: "market-b-work", axis: "professional", relation: "current", description: "managerial review using qualified risk and approval language" },
      ],
      repertoire: [
        { codeId: "local-reference", fluency: "habitual", acquisitionFacetIds: ["market-b-region", "market-b-group"] },
        { codeId: "sponsor-professional", fluency: "practiced", acquisitionFacetIds: ["market-b-material", "market-b-work"] },
        { codeId: "institutional-qualified", fluency: "situational", acquisitionFacetIds: ["market-b-material", "market-b-work"] },
      ],
      primaryCodeId: "local-reference",
      worldModelId: "authority-as-procedure",
    },
  ],
  political: [
    {
      id: "regional-autonomy-coalition-aide",
      socialContexts: [
        { id: "political-a-region", axis: "regional", relation: "origin", description: "a regional civic network organized around retained local agency" },
        { id: "political-a-material", axis: "socioeconomic", relation: "current", description: "a stable professional role whose continuation depends on electoral timing" },
        { id: "political-a-group", axis: "social-group", relation: "current", description: "a coalition group with familiar autonomy-centered markers" },
        { id: "political-a-politics", axis: "political", relation: "current", description: "issue work requiring translation across nominally opposed coalitions" },
      ],
      repertoire: [
        { codeId: "coalition-autonomy", fluency: "habitual", acquisitionFacetIds: ["political-a-region", "political-a-group", "political-a-politics"] },
        { codeId: "coalition-access", fluency: "practiced", acquisitionFacetIds: ["political-a-group", "political-a-politics"] },
        { codeId: "institutional-qualified", fluency: "situational", acquisitionFacetIds: ["political-a-material", "political-a-politics"] },
      ],
      primaryCodeId: "coalition-autonomy",
      worldModelId: "solidarity-as-shared-outcome",
    },
    {
      id: "interregional-access-coalition-aide",
      socialContexts: [
        { id: "political-b-region", axis: "regional", relation: "current", description: "an interregional civic network where local vocabulary does not travel intact" },
        { id: "political-b-material", axis: "socioeconomic", relation: "current", description: "a resource-buffered campaign role under competitive donor and news-cycle pressure" },
        { id: "political-b-group", axis: "social-group", relation: "current", description: "a coalition group using access-centered public commitments" },
        { id: "political-b-politics", axis: "political", relation: "current", description: "cross-coalition negotiation over ownership of a shared proposal" },
      ],
      repertoire: [
        { codeId: "coalition-access", fluency: "habitual", acquisitionFacetIds: ["political-b-group", "political-b-politics"] },
        { codeId: "coalition-autonomy", fluency: "practiced", acquisitionFacetIds: ["political-b-region", "political-b-politics"] },
        { codeId: "cross-regional-explicit", fluency: "situational", acquisitionFacetIds: ["political-b-region", "political-b-group"] },
      ],
      primaryCodeId: "coalition-access",
      worldModelId: "authority-as-answerability",
    },
  ],
  institutional: [
    {
      id: "interregional-public-editor",
      socialContexts: [
        { id: "institution-a-region", axis: "regional", relation: "current", description: "an interregional public whose local conventions cannot be assumed" },
        { id: "institution-a-material", axis: "socioeconomic", relation: "current", description: "a salaried public role constrained by approval access rather than personal resource scarcity" },
        { id: "institution-a-group", axis: "social-group", relation: "acquired", description: "a public-information team spanning technical and community-facing work" },
        { id: "institution-a-work", axis: "institutional", relation: "current", description: "an attributable publishing system with formal revision conditions" },
      ],
      repertoire: [
        { codeId: "institutional-qualified", fluency: "habitual", acquisitionFacetIds: ["institution-a-material", "institution-a-work"] },
        { codeId: "cross-regional-explicit", fluency: "practiced", acquisitionFacetIds: ["institution-a-region", "institution-a-group"] },
        { codeId: "relationship-first", fluency: "situational", acquisitionFacetIds: ["institution-a-region", "institution-a-group"] },
      ],
      primaryCodeId: "institutional-qualified",
      worldModelId: "authority-as-procedure",
    },
    {
      id: "local-mobility-public-editor",
      socialContexts: [
        { id: "institution-b-region", axis: "regional", relation: "origin", description: "a locally rooted service network with high continuity expectations" },
        { id: "institution-b-material", axis: "socioeconomic", relation: "origin", description: "an hourly-service background preceding the current credentialed public role" },
        { id: "institution-b-group", axis: "social-group", relation: "current", description: "a mixed-rank service group where practical handoffs reveal uneven access" },
        { id: "institution-b-work", axis: "institutional", relation: "current", description: "an approval-bound public desk responsible for correction and reply" },
      ],
      repertoire: [
        { codeId: "shift-handoff", fluency: "habitual", acquisitionFacetIds: ["institution-b-material", "institution-b-group"] },
        { codeId: "institutional-qualified", fluency: "practiced", acquisitionFacetIds: ["institution-b-material", "institution-b-work"] },
        { codeId: "relationship-first", fluency: "situational", acquisitionFacetIds: ["institution-b-region", "institution-b-group"] },
      ],
      primaryCodeId: "shift-handoff",
      worldModelId: "care-as-bounded-accuracy",
    },
  ],
  abstract_bad_actor: [
    {
      id: "cross-regional-contract-coordinator",
      socialContexts: [
        { id: "contract-a-region", axis: "regional", relation: "current", description: "a cross-regional contract with no reciprocal local membership" },
        { id: "contract-a-material", axis: "socioeconomic", relation: "current", description: "contingent professional income tied to client-defined completion" },
        { id: "contract-a-group", axis: "social-group", relation: "current", description: "a production group whose affected audiences cannot inspect the success condition" },
        { id: "contract-a-work", axis: "professional", relation: "current", description: "client-facing work that frames ambiguity through utility and risk" },
      ],
      repertoire: [
        { codeId: "sponsor-professional", fluency: "habitual", acquisitionFacetIds: ["contract-a-material", "contract-a-work"] },
        { codeId: "cross-regional-explicit", fluency: "practiced", acquisitionFacetIds: ["contract-a-region", "contract-a-group"] },
        { codeId: "local-reference", fluency: "situational", acquisitionFacetIds: ["contract-a-region", "contract-a-group"] },
      ],
      primaryCodeId: "sponsor-professional",
      worldModelId: "utility-as-thematic-value",
    },
    {
      id: "buffered-client-network-coordinator",
      socialContexts: [
        { id: "contract-b-region", axis: "regional", relation: "acquired", description: "several learned local surfaces without responsibility to one region" },
        { id: "contract-b-material", axis: "socioeconomic", relation: "current", description: "a resource-buffered client role insulated from most audience consequences" },
        { id: "contract-b-group", axis: "social-group", relation: "current", description: "a contract network using affiliative forms as delivery resources" },
        { id: "contract-b-politics", axis: "political", relation: "current", description: "client incentives organized around thematic political usefulness" },
      ],
      repertoire: [
        { codeId: "local-reference", fluency: "habitual", acquisitionFacetIds: ["contract-b-region", "contract-b-group"] },
        { codeId: "coalition-access", fluency: "practiced", acquisitionFacetIds: ["contract-b-group", "contract-b-politics"] },
        { codeId: "sponsor-professional", fluency: "situational", acquisitionFacetIds: ["contract-b-material", "contract-b-politics"] },
      ],
      primaryCodeId: "local-reference",
      worldModelId: "utility-as-thematic-value",
    },
  ],
};

const DIVERSION_COMPATIBILITY: Record<ConversationDiversionMode, ProtagonistKind[]> = {
  "adjacent-concern": ["caregiver", "marketer", "political", "institutional"],
  "meme-deflection": ["youth", "creator", "marketer", "political"],
  "absurdist-derailment": ["creator", "political", "abstract_bad_actor"],
};

const DIVERSION_PHASES: Record<ConversationDiversionMode, ConversationDiversion["scenePhase"][]> = {
  "adjacent-concern": ["BRIDGE", "CROSSOVER"],
  "meme-deflection": ["BRIDGE", "CROSSOVER"],
  "absurdist-derailment": ["CROSSOVER", "CORRECTION"],
};

const INCIDENTS: readonly IncidentTemplate[] = [
  {
    id: "harbor-glass",
    title: "Harbor Glass",
    placeNoun: "water notice",
    knownFact: "A genuine clip shows discolored tap water after a storm-related pressure change.",
    unresolved: "At first publication, the source and viewers do not know the cause.",
    circulatingFrame: "The crop is treated as proof that officials knowingly concealed contamination.",
    resolution: "A later public log attributes the color to disturbed iron sediment and also documents a delayed notice.",
    heading: "A real observation acquires a conclusion before the evidence arrives.",
    neutralBody: "The original post asks a question. A cropped copy removes that uncertainty while retaining the striking image.",
    sourceReason: "Because storm coverage put the clip before people already discussing local infrastructure problems.",
    artifactKinds: ["clip", "meme", "comments", "screenshot"],
    youthFit: false,
    badActorFit: true,
    idealEvidence: "a time-stamped laboratory result and the original uncropped clip",
    chainBlueprints: [
      [
        { room: "neighborhood feed", transform: "original" },
        { room: "public comments", transform: "crop" },
        { room: "family group", transform: "screenshot" },
        { room: "local livestream", transform: "talking-point" },
        { room: "public-information desk", transform: "correction" },
      ],
      [
        { room: "storm update feed", transform: "original" },
        { room: "local meme page", transform: "meme" },
        { room: "campaign briefing", transform: "trend-summary" },
        { room: "community newsletter", transform: "talking-point" },
        { room: "public-information desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "blackout-map",
    title: "Blackout Map",
    placeNoun: "outage map",
    knownFact: "A genuine utility map shows neighborhoods that lost power during the previous evening.",
    unresolved: "The cropped image does not show its date or whether service has since returned.",
    circulatingFrame: "The old map is presented as evidence that a new citywide outage is being hidden.",
    resolution: "The current utility record shows service restored except for two small repair areas.",
    heading: "An accurate map survives longer than its timestamp.",
    neutralBody: "The screenshot is authentic, legible, and obsolete. Its age disappears as it moves between rooms.",
    sourceReason: "Because preparedness accounts shared the old map with readers already watching for failures in city services.",
    artifactKinds: ["screenshot", "comments", "live"],
    youthFit: false,
    badActorFit: true,
    idealEvidence: "the current restoration log and the screenshot's original timestamp",
    chainBlueprints: [
      [
        { room: "weather feed", transform: "original" },
        { room: "neighborhood group", transform: "screenshot" },
        { room: "emergency-goods newsletter", transform: "trend-summary" },
        { room: "campaign briefing", transform: "talking-point" },
        { room: "utility desk", transform: "correction" },
      ],
      [
        { room: "community archive", transform: "original" },
        { room: "public comments", transform: "crop" },
        { room: "local livestream", transform: "talking-point" },
        { room: "newsroom inbox", transform: "press-inquiry" },
        { room: "utility desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "shelf-shift",
    title: "Shelf Shift",
    placeNoun: "library photograph",
    knownFact: "A photograph shows books on rolling carts while one library wing receives ventilation repairs.",
    unresolved: "The photograph alone does not explain why those titles were moved.",
    circulatingFrame: "The carts are framed as a quiet permanent removal of the photographed subjects.",
    resolution: "The repair calendar and catalog show the books returning to the same public shelves.",
    heading: "A temporary move is made to resemble a permanent decision.",
    neutralBody: "The image is real. The repair notice sits outside the crop, leaving a culturally familiar explanation to fill the gap.",
    sourceReason: "Because the cropped photograph moved from reading groups into public debate as apparent proof of permanent book removal.",
    artifactKinds: ["screenshot", "meme", "comments"],
    youthFit: true,
    badActorFit: true,
    idealEvidence: "the public repair calendar, catalog history, and original photograph",
    chainBlueprints: [
      [
        { room: "student reading group", transform: "original" },
        { room: "family group", transform: "screenshot" },
        { room: "issue newsletter", transform: "talking-point" },
        { room: "local newsroom", transform: "press-inquiry" },
        { room: "library desk", transform: "correction" },
      ],
      [
        { room: "library feed", transform: "original" },
        { room: "school group", transform: "meme" },
        { room: "public comments", transform: "crop" },
        { room: "campaign briefing", transform: "trend-summary" },
        { room: "library desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "recall-loop",
    title: "Recall Loop",
    placeNoun: "market recall",
    knownFact: "A vendor notice recalls one clearly identified lot of sealed fruit cups.",
    unresolved: "A cropped notice omits the lot number and affected dates.",
    circulatingFrame: "The crop is read as a warning that every stall at the weekend market is unsafe.",
    resolution: "The complete notice limits the recall to one lot and confirms that other vendors are unaffected.",
    heading: "A narrow precaution expands when its boundary is cropped away.",
    neutralBody: "The warning is legitimate, but the missing lot number changes its practical meaning as trusted people forward it.",
    sourceReason: "Because families shared the cropped notice before weekend shopping and business accounts amplified the broader warning.",
    artifactKinds: ["screenshot", "comments", "live"],
    youthFit: false,
    badActorFit: true,
    idealEvidence: "the complete recall notice, lot number, and vendor confirmation",
    chainBlueprints: [
      [
        { room: "vendor notice", transform: "original" },
        { room: "family group", transform: "crop" },
        { room: "wellness livestream", transform: "talking-point" },
        { room: "retail planning channel", transform: "trend-summary" },
        { room: "market desk", transform: "correction" },
      ],
      [
        { room: "market feed", transform: "original" },
        { room: "neighborhood comments", transform: "screenshot" },
        { room: "community newsletter", transform: "talking-point" },
        { room: "newsroom inbox", transform: "press-inquiry" },
        { room: "market desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "festival-static",
    title: "Festival Static",
    placeNoun: "festival notice",
    knownFact: "An event organizer files a routine severe-weather contingency plan.",
    unresolved: "The first screenshot does not include the page labeling it as a contingency.",
    circulatingFrame: "The filing is described as confirmation that the youth arts festival has been cancelled.",
    resolution: "The organizer later confirms that the festival remains scheduled with an indoor backup location.",
    heading: "A plan for uncertainty is recast as a decision already made.",
    neutralBody: "One administrative page travels faster than the complete packet and becomes socially useful to people awaiting weekend plans.",
    sourceReason: "Because people planning rides, fan posts, and sponsor promotions wanted an answer before the organizer confirmed the schedule.",
    artifactKinds: ["screenshot", "status", "meme"],
    youthFit: true,
    badActorFit: false,
    idealEvidence: "the complete permit packet and an authorized organizer update",
    chainBlueprints: [
      [
        { room: "event volunteer chat", transform: "original" },
        { room: "school group", transform: "status" },
        { room: "fan page", transform: "meme" },
        { room: "sponsor planning channel", transform: "trend-summary" },
        { room: "event desk", transform: "correction" },
      ],
      [
        { room: "permit archive", transform: "original" },
        { room: "peer chat", transform: "screenshot" },
        { room: "local livestream", transform: "talking-point" },
        { room: "newsroom inbox", transform: "press-inquiry" },
        { room: "event desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "fare-pilot",
    title: "Fare Pilot",
    placeNoun: "transit agenda",
    knownFact: "A public agenda proposes a two-week cashless boarding test on two routes.",
    unresolved: "The clipped agenda does not retain the routes, duration, or word 'test.'",
    circulatingFrame: "The proposal is announced as an immediate permanent cash ban across the transit system.",
    resolution: "The adopted minutes retain cash service systemwide and schedule a limited accessibility review.",
    heading: "A limited test becomes a permanent systemwide rule in one crop.",
    neutralBody: "The agenda is genuine. Its scope disappears before the people most affected encounter it.",
    sourceReason: "Because commuter groups, payment companies, and council watchers all circulated the same clipped agenda.",
    artifactKinds: ["screenshot", "comments", "live"],
    youthFit: true,
    badActorFit: true,
    idealEvidence: "the complete agenda, adopted minutes, and accessibility review",
    chainBlueprints: [
      [
        { room: "public agenda", transform: "original" },
        { room: "commuter group", transform: "crop" },
        { room: "payment-industry newsletter", transform: "trend-summary" },
        { room: "council briefing", transform: "talking-point" },
        { room: "transit desk", transform: "correction" },
      ],
      [
        { room: "student commute chat", transform: "screenshot" },
        { room: "public comments", transform: "crop" },
        { room: "local livestream", transform: "talking-point" },
        { room: "newsroom inbox", transform: "press-inquiry" },
        { room: "transit desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "rehearsal-note",
    title: "Rehearsal Note",
    placeNoun: "school schedule",
    knownFact: "A school arts rehearsal moves from the auditorium to the auxiliary hall for one afternoon.",
    unresolved: "A screenshot shows the crossed-out room without the replacement location.",
    circulatingFrame: "The crop is treated as proof that the entire showcase has been cancelled.",
    resolution: "The complete schedule shows the new room and the unchanged performance date.",
    heading: "A room change becomes a cancellation inside the peer group.",
    neutralBody: "The schedule fragment answers one question poorly and arrives while classmates are already arranging rides and plans.",
    sourceReason: "Because students used the same chat to plan rides, trade jokes, and decide whether to attend.",
    artifactKinds: ["status", "screenshot", "meme"],
    youthFit: true,
    badActorFit: false,
    idealEvidence: "the complete rehearsal schedule and an authorized staff update",
    chainBlueprints: [
      [
        { room: "arts group", transform: "original" },
        { room: "class chat", transform: "screenshot" },
        { room: "peer status", transform: "status" },
        { room: "family group", transform: "talking-point" },
        { room: "school desk", transform: "correction" },
      ],
      [
        { room: "student feed", transform: "meme" },
        { room: "class chat", transform: "status" },
        { room: "family group", transform: "screenshot" },
        { room: "event volunteer chat", transform: "talking-point" },
        { room: "school desk", transform: "correction" },
      ],
    ],
  },
  {
    id: "shelter-sign",
    title: "Shelter Sign",
    placeNoun: "shelter notice",
    knownFact: "An animal shelter lobby closes for one morning of scheduled floor cleaning while animal care continues.",
    unresolved: "A photograph shows only the words 'lobby closed' and no reopening time.",
    circulatingFrame: "The sign is circulated as evidence that the shelter has suddenly shut down permanently.",
    resolution: "The full sign and volunteer calendar show normal animal care and an afternoon reopening.",
    heading: "A temporary closed sign is asked to explain an entire institution.",
    neutralBody: "The photograph is accurate but incomplete, and concern for familiar animals gives the missing context urgency.",
    sourceReason: "Because volunteers, neighbors, donors, and local reporters all shared the incomplete sign.",
    artifactKinds: ["clip", "screenshot", "comments"],
    youthFit: true,
    badActorFit: true,
    idealEvidence: "the complete sign, care log, and volunteer calendar",
    chainBlueprints: [
      [
        { room: "volunteer chat", transform: "original" },
        { room: "neighborhood feed", transform: "screenshot" },
        { room: "donor newsletter", transform: "trend-summary" },
        { room: "local newsroom", transform: "press-inquiry" },
        { room: "shelter desk", transform: "correction" },
      ],
      [
        { room: "student volunteer group", transform: "original" },
        { room: "family group", transform: "screenshot" },
        { room: "public comments", transform: "crop" },
        { room: "community livestream", transform: "talking-point" },
        { room: "shelter desk", transform: "correction" },
      ],
    ],
  },
] as const;

/**
 * Reviewed relational facts for each incident. These hooks keep the
 * communication lesson inside the same artifact lineage and truth record as
 * the civic ambiguity instead of inventing a parallel interpersonal event.
 */
const INCIDENT_COMMUNICATION: Record<IncidentId, IncidentCommunicationHook> = {
  "harbor-glass": {
    id: "harbor-glass-relational-record",
    targetRole: "resident who posted the original clip",
    accountableAction: "This seat approved or forwarded a crop that removed the resident's question and attached a concealment conclusion.",
    boundedBehavior: "The resident posted a genuine clip, asked whether anyone else saw the discoloration, and made no claim about its cause.",
    traitGeneralization: "The resident is recast as someone who stirs panic and cannot be trusted with neighborhood warnings.",
    replyAsymmetry: "The resident cannot see the campaign, family, or planning threads where that character account is being repeated.",
    coolMessage: "Stop recirculating the crop. The cause is not established.",
    prosocialEvidence: "The speaker links the uncropped question and waits for the time-stamped laboratory result before naming a cause.",
    warmMessage: "We all care about safe water, and neighbors deserve an honest answer.",
    relationshipFirstCode: "Begin by acknowledging why discolored water frightened the households who saw it.",
    taskFirstCode: "State the verified pressure change, preserve uncertainty about cause, and name the next laboratory update.",
    coalitionCodeA: "Residents deserve control over information about what enters their homes.",
    coalitionCodeB: "Every neighborhood deserves equally accessible public evidence about water conditions.",
    commonGround: "publish the complete laboratory and pressure-change log and keep a human reporting route open while the cause is checked",
    relationalResolution: "The uncropped source preserves the resident's question; the concealment conclusion and the character claim first appear downstream, while the public log resolves the water event.",
    activeQuestion: "Did the circulated crop establish concealment, and who removed the resident's original question?",
    adjacentConcern: "Several buildings need a clearer long-term lead-pipe replacement schedule.",
    adjacentConcernBasis: "The capital plan separately documents buildings awaiting lead-pipe replacement; that valid infrastructure concern does not resolve this crop's provenance or cause.",
    memeSurface: "A looping cloudy-glass reaction image turns the water clip into a familiar suspicion cue without answering who cropped the question.",
    absurdistSurface: "An impossible version treats one cloudy glass as a complete map of every pipe and every official's private intent.",
  },
  "blackout-map": {
    id: "blackout-map-relational-record",
    targetRole: "community archive volunteer who supplied the map",
    accountableAction: "This seat approved or forwarded a screenshot after its original timestamp had been cropped away.",
    boundedBehavior: "The archive volunteer supplied an authentic previous-evening outage map with its date visible in the source record.",
    traitGeneralization: "The volunteer is recast as someone who recycles emergencies for attention and cannot be trusted with updates.",
    replyAsymmetry: "The volunteer is outside the private preparedness and campaign threads where the accusation is gaining familiarity.",
    coolMessage: "That map is from yesterday. Use the current restoration log.",
    prosocialEvidence: "The speaker attaches the current log and preserves the two repair areas that remain unresolved.",
    warmMessage: "We all want every block to know when its power will return.",
    relationshipFirstCode: "Acknowledge the households whose plans were disrupted before correcting the timestamp.",
    taskFirstCode: "Name the map's date, link the current restoration log, and distinguish restored areas from active repairs.",
    coalitionCodeA: "Households should be able to make their own preparedness decisions from current information.",
    coalitionCodeB: "Public infrastructure owes every neighborhood the same timely restoration record.",
    commonGround: "publish the current restoration log and preserve a staffed reporting route for the two remaining repair areas",
    relationalResolution: "The archive source retains the old timestamp; the volunteer did not describe it as current, and the present utility record—not a character judgment—resolves the outage status.",
    activeQuestion: "Was the circulated outage map current, and who removed its original timestamp?",
    adjacentConcern: "Some blocks need stronger household backup-power planning before the next storm.",
    adjacentConcernBasis: "The preparedness survey separately records uneven household backup-power access; that supported concern does not establish whether this map was current.",
    memeSurface: "A blinking-map reaction image makes yesterday's outage feel permanently present without answering the timestamp question.",
    absurdistSurface: "An impossible version treats one dated screenshot as though it personally controls every switch in the grid.",
  },
  "shelf-shift": {
    id: "shelf-shift-relational-record",
    targetRole: "library aide who moved the marked shelves",
    accountableAction: "This seat circulated the cropped cart photograph after the repair notice and work-order context were removed.",
    boundedBehavior: "The aide moved the marked books under a ventilation work order and had no authority to select titles for permanent removal.",
    traitGeneralization: "The aide is recast as someone who quietly removes books they dislike and cannot be trusted with the collection.",
    replyAsymmetry: "The aide is working away from the public comment and campaign threads where motive is being assigned to the move.",
    coolMessage: "Those carts follow the ventilation work order. Check the repair calendar and catalog.",
    prosocialEvidence: "The speaker preserves holds and catalog access while the physical shelves are unavailable.",
    warmMessage: "We all care about keeping these books visible and available to readers.",
    relationshipFirstCode: "Acknowledge why readers fear a quiet removal before describing the facilities work.",
    taskFirstCode: "Name the work-order dates, show the unchanged catalog records, and give the shelf-return date.",
    coalitionCodeA: "Readers should be free to find and request the books without institutional gatekeeping.",
    coalitionCodeB: "Public collections should remain equally discoverable and accountable during building work.",
    commonGround: "keep the complete catalog and request route available and return every moved title after the documented ventilation repair",
    relationalResolution: "The work order assigns the move, the catalog retains every title, and the repair calendar—not the aide's alleged preferences—explains when the books return.",
    activeQuestion: "Were the marked books removed for viewpoint reasons, or moved under the documented work order?",
    adjacentConcern: "The acquisition budget leaves some requested subjects underrepresented in the collection.",
    adjacentConcernBasis: "The annual request report separately confirms unmet acquisition requests in several subjects; that valid collection concern does not explain this temporary shelf move.",
    memeSurface: "A rolling-cart reaction image makes temporary movement read as disappearance without answering the work-order question.",
    absurdistSurface: "An impossible version treats a ventilation repair as though the building has erased every book at once.",
  },
  "recall-loop": {
    id: "recall-loop-relational-record",
    targetRole: "market clerk who posted the vendor notice",
    accountableAction: "This seat forwarded a cropped warning after the clerk's lot number and affected dates had been removed.",
    boundedBehavior: "The clerk posted the vendor's complete one-lot recall notice with the lot number and affected dates intact.",
    traitGeneralization: "The clerk is recast as someone who withholds safety information and cannot be trusted to protect shoppers.",
    replyAsymmetry: "The clerk is not present in the family, wellness, or retail-planning threads where the private warning is being personalized.",
    coolMessage: "Check the lot number. This notice does not apply to every stall.",
    prosocialEvidence: "The speaker keeps the legitimate precaution visible while linking the complete vendor notice and affected dates.",
    warmMessage: "We all want families to feel safe shopping at the weekend market.",
    relationshipFirstCode: "Begin with the households deciding what food they can safely serve this weekend.",
    taskFirstCode: "Name the affected lot and dates, distinguish other vendors, and link the complete notice.",
    coalitionCodeA: "Shoppers deserve the information to choose which products enter their homes.",
    coalitionCodeB: "Market safety depends on an equally accessible and precisely bounded recall process.",
    commonGround: "publish the complete lot-specific recall and keep a staffed vendor-confirmation route available before the weekend market",
    relationalResolution: "The clerk's source contains the missing lot boundary; the overbroad crop appears later, and the complete vendor notice confirms that the other stalls are unaffected.",
    activeQuestion: "Which lot and dates are covered by the recall, and who removed that boundary from the warning?",
    adjacentConcern: "The market needs a clearer multilingual recall-notice standard for future vendors.",
    adjacentConcernBasis: "The access review separately documents inconsistent translated recall notices; that supported process concern does not broaden the affected lot in this incident.",
    memeSurface: "A looping empty-basket reaction image carries generalized alarm without answering which lot and dates are affected.",
    absurdistSurface: "An impossible version turns one bounded vendor lot into every item sold by every stall.",
  },
  "festival-static": {
    id: "festival-static-relational-record",
    targetRole: "permit volunteer who uploaded the contingency page",
    accountableAction: "This seat circulated one permit page after the contingency label and the rest of the packet were left out.",
    boundedBehavior: "The volunteer uploaded a routine severe-weather contingency page inside the complete festival permit packet and did not announce a cancellation.",
    traitGeneralization: "The volunteer is recast as someone who cancels youth events without telling families and cannot be trusted with plans.",
    replyAsymmetry: "The volunteer is working inside the event channel and cannot see the school, sponsor, and fan threads where the motive claim is spreading.",
    coolMessage: "That page is a contingency, not a cancellation. Use the complete permit packet.",
    prosocialEvidence: "The speaker preserves the indoor backup location and the unchanged festival time for people arranging rides.",
    warmMessage: "We all want young artists and their families to have a dependable weekend plan.",
    relationshipFirstCode: "Recognize the disappointment and transport disruption a cancellation would create before correcting the filing.",
    taskFirstCode: "Name the contingency label, the indoor backup, and the authorized time of the next organizer update.",
    coalitionCodeA: "Families should control their weekend plans with clear choices and timely notice.",
    coalitionCodeB: "Youth arts access requires a dependable public plan and an indoor route when weather changes.",
    commonGround: "keep the festival scheduled, publish the complete contingency packet, and preserve the indoor attendance route during severe weather",
    relationalResolution: "The complete packet labels the page as a contingency, the volunteer never announced cancellation, and the organizer confirms the unchanged event with an indoor backup.",
    activeQuestion: "Did the permit page announce a cancellation, or was it a contingency page cropped out of context?",
    adjacentConcern: "Families need more affordable transportation to youth events across the district.",
    adjacentConcernBasis: "The attendance survey separately records transportation cost as a recurring barrier; that valid access concern does not determine whether this festival was cancelled.",
    memeSurface: "A rain-cloud reaction image over an empty stage carries cancellation mood without answering what the contingency page says.",
    absurdistSurface: "An impossible version treats one weather contingency page as the cancellation of every youth event in the district.",
  },
  "fare-pilot": {
    id: "fare-pilot-relational-record",
    targetRole: "accessibility analyst who drafted the limited pilot",
    accountableAction: "This seat circulated an agenda crop after its two routes, two-week duration, and the word test were removed.",
    boundedBehavior: "The analyst drafted a two-week test on two routes and requested an accessibility review; they did not propose a permanent systemwide cash ban.",
    traitGeneralization: "The analyst is recast as someone who wants to exclude cash riders and cannot be trusted with access policy.",
    replyAsymmetry: "The analyst is outside the commuter, campaign, and payment-marketing threads where the permanent-ban motive is being assigned.",
    coolMessage: "This is a two-week test on two routes, not a systemwide rule. Read the complete agenda.",
    prosocialEvidence: "The speaker keeps cash service and the accessibility review visible while the proposal remains under consideration.",
    warmMessage: "We all care about a transit system that leaves no rider stranded.",
    relationshipFirstCode: "Begin with riders who hear cashless as a threat to their daily access.",
    taskFirstCode: "State the two routes, two-week duration, retained cash service, and accessibility review.",
    coalitionCodeA: "Keep payment choice in riders' hands during any experiment.",
    coalitionCodeB: "No rider should lose transit access because of payment format.",
    commonGround: "retain cash access systemwide during the limited pilot and complete the accessibility review before any broader change",
    relationalResolution: "The complete agenda preserves the pilot's limits, the analyst requested accessibility review, and the adopted minutes retain cash service systemwide.",
    activeQuestion: "Was a permanent cash ban proposed, or did the crop remove the pilot's stated limits?",
    adjacentConcern: "Cash riders face broader access barriers elsewhere in the existing transit network.",
    adjacentConcernBasis: "The accessibility review separately confirms existing network barriers for cash riders; that supported concern does not turn this limited pilot into a permanent ban.",
    memeSurface: "A card-terminal reaction image swallowing a coin carries exclusion anxiety without answering the pilot's stated scope.",
    absurdistSurface: "An impossible version treats a two-route, two-week test as though cash vanished from the entire system overnight.",
  },
  "rehearsal-note": {
    id: "rehearsal-note-relational-record",
    targetRole: "student schedule aide who entered the room change",
    accountableAction: "This seat recirculated a screenshot after the replacement room on the next line had been cropped out.",
    boundedBehavior: "The student aide crossed out the auditorium and entered the auxiliary hall on the next line without changing the performance date.",
    traitGeneralization: "The aide is recast as someone who leaves younger performers out of plans and cannot be trusted with rehearsal changes.",
    replyAsymmetry: "The aide is already in rehearsal and cannot see the class and family threads where the personal story is being repeated.",
    coolMessage: "Read the next line. Rehearsal moved to the auxiliary hall; the showcase is unchanged.",
    prosocialEvidence: "The speaker repeats the replacement room and performance date so classmates can keep rides and plans intact.",
    warmMessage: "We all want every performer to know where to go and feel included in the showcase.",
    relationshipFirstCode: "First reassure classmates that their work and shared performance still matter.",
    taskFirstCode: "State the auxiliary hall, the one-afternoon change, and the unchanged performance date.",
    coalitionCodeA: "Students should be able to organize their own rides from complete schedule information.",
    coalitionCodeB: "Equal participation requires an accessible room update for every performer and family.",
    commonGround: "publish the complete rehearsal schedule and keep a direct human route open for performers arranging transportation",
    relationalResolution: "The complete schedule shows the aide entered the replacement hall and never cancelled the showcase; the crop, not the aide's character, removed the decisive line.",
    activeQuestion: "Was the showcase cancelled, or did the crop omit the replacement rehearsal room?",
    adjacentConcern: "Families need a more reliable transportation plan for late rehearsals.",
    adjacentConcernBasis: "The season survey separately records recurring late-rehearsal transportation gaps; that valid concern does not answer what this schedule line said.",
    memeSurface: "A disappearing-stage reaction image carries exclusion mood without answering the replacement-room line.",
    absurdistSurface: "An impossible version treats one crossed-out rehearsal room as though the entire showcase ceased to exist.",
  },
  "shelter-sign": {
    id: "shelter-sign-relational-record",
    targetRole: "morning volunteer who posted the full lobby sign",
    accountableAction: "This seat circulated a photograph after the reopening time and continuing-care line at the bottom had been cropped away.",
    boundedBehavior: "The volunteer posted a full sign for one morning of floor cleaning, including the afternoon reopening and confirmation that animal care continued.",
    traitGeneralization: "The volunteer is recast as someone who shuts supporters out and cannot be trusted with animal care updates.",
    replyAsymmetry: "The volunteer is inside the care area and cannot see the donor, neighborhood, and newsroom threads where the character claim is circulating.",
    coolMessage: "The lobby reopens this afternoon. Animal care never stopped. Use the full sign.",
    prosocialEvidence: "The speaker links the care log and volunteer calendar while preserving the temporary cleaning boundary.",
    warmMessage: "We all care about the animals and the volunteers who show up for them.",
    relationshipFirstCode: "Begin by acknowledging why a closed sign frightened volunteers and familiar donors.",
    taskFirstCode: "State the reopening time, continuing care, cleaning window, and current volunteer schedule.",
    coalitionCodeA: "Volunteers and donors deserve direct access to current shelter information.",
    coalitionCodeB: "Animal welfare depends on a transparent care record and an equally accessible public schedule.",
    commonGround: "publish the full temporary-closure sign and preserve a staffed route for care and volunteer questions until the lobby reopens",
    relationalResolution: "The complete sign and care log show that the volunteer included the reopening time and continuing-care line; the permanent-closure frame appears only after the crop.",
    activeQuestion: "Did the sign announce a lasting closure, or did the photograph omit the reopening and continuing-care lines?",
    adjacentConcern: "The shelter needs a larger weekend volunteer base for animal care.",
    adjacentConcernBasis: "The volunteer calendar separately confirms recurring weekend staffing gaps; that valid capacity concern does not establish what the photographed sign said.",
    memeSurface: "A locked-door reaction image carries abandonment mood without answering the reopening and continuing-care lines.",
    absurdistSurface: "An impossible version treats one morning of floor cleaning as though every animal and caregiver disappeared.",
  },
};

const ACTORS: Record<ProtagonistKind, ActorTemplate> = {
  youth: {
    id: "peer-organizer",
    kind: "youth",
    role: "student group organizer",
    seat: "PEER TABLE",
    act: "BELONGING",
    ageRange: [12, 17],
    mentality: "The organizer is holding timing, belonging, and whether friends still see them as useful; factual certainty is not the only stake.",
    motive: "peer timing, usefulness, belonging",
    goalDomain: "social",
    goal: "keep the group informed without being the last person to understand what is happening",
    connection: (incident) => `The ${incident.placeNoun} affects plans or a cause the organizer's peers already discuss.`,
    channel: "peer group",
    capabilities: ["private messages", "trusted peer relationships", "group status"],
    constraints: ["no institutional authority", "partial context", "fast-moving peer expectations"],
    operationalDetailLevel: "none",
  },
  caregiver: {
    id: "care-network-moderator",
    kind: "caregiver",
    role: "family-group moderator",
    seat: "FAMILY BOOTH",
    act: "CARE",
    mentality: "The moderator treats omission as a practical risk because several households depend on the warning, even while the evidence remains incomplete.",
    motive: "protective responsibility, trusted relationships",
    goalDomain: "social",
    goal: "help several households make a safe near-term decision",
    connection: (incident) => `The ${incident.placeNoun} could change plans for people who expect the moderator to warn them.`,
    channel: "family group",
    capabilities: ["trusted family ties", "group moderation", "private verification"],
    constraints: ["limited time", "no direct source access", "high cost of missing a real warning"],
    operationalDetailLevel: "none",
  },
  creator: {
    id: "local-creator",
    kind: "creator",
    role: "local accountability creator",
    seat: "CREATOR STAGE",
    act: "STANDING",
    mentality: "The creator's audience values speed and candor because earlier work identified real institutional failures.",
    motive: "audience standing, accountability, timing",
    goalDomain: "social",
    goal: "remain the trusted person who explains local ambiguity first",
    connection: (incident) => `The ${incident.placeNoun} intersects with the creator's established theme of institutional responsiveness.`,
    channel: "local livestream",
    capabilities: ["trusted audience", "live explanation", "source-linking"],
    constraints: ["audience expects immediacy", "public corrections are reputationally costly", "evidence arrives slowly"],
    operationalDetailLevel: "none",
  },
  marketer: {
    id: "brand-growth-lead",
    kind: "marketer",
    role: "regional brand growth lead",
    seat: "BRAND BACKBAR",
    act: "CONVERSION",
    mentality: "The growth lead is evaluated on relevance and response time, not on resolving the incident itself.",
    motive: "campaign relevance, revenue, professional standing",
    goalDomain: "marketing",
    goal: "turn a fast cultural moment into attention for an adjacent campaign",
    connection: (incident) => `The ${incident.placeNoun} gives an existing preparedness or trust campaign an apparently timely hook.`,
    channel: "brand planning channel",
    capabilities: ["approved campaign inventory", "brand audience", "plain-language copy"],
    constraints: ["quarterly targets", "approval boundaries", "no first-party evidence"],
    operationalDetailLevel: "none",
  },
  political: {
    id: "civic-campaign-aide",
    kind: "political",
    role: "civic campaign aide",
    seat: "CAMPAIGN TABLE",
    act: "ISSUE BRIDGE",
    mentality: "The aide cares less about the object in the image than whether it supports a broader competence argument already familiar to voters.",
    motive: "issue ownership, timing, coalition standing",
    goalDomain: "political",
    goal: "make institutional responsiveness the subject of tomorrow's civic discussion",
    connection: (incident) => `The ${incident.placeNoun} can be connected to a broader service-delivery argument without proving the circulating frame.`,
    channel: "campaign briefing",
    capabilities: ["policy context", "coalition relationships", "public statement drafting"],
    constraints: ["competitive news cycle", "partial evidence", "pressure for a clear contrast"],
    operationalDetailLevel: "none",
  },
  institutional: {
    id: "public-information-editor",
    kind: "institutional",
    role: "public-information editor",
    seat: "PUBLIC DESK",
    act: "REPAIR",
    mentality: "The editor can publish only what is attributable, but every approval minute leaves the incomplete version uncontested.",
    motive: "accuracy, authorization, public trust",
    goalDomain: "institutional",
    goal: "release a useful public explanation without asserting facts the institution cannot yet support",
    connection: (incident) => `The ${incident.placeNoun} is now creating questions the public-information desk must answer across several rooms.`,
    channel: "public-information desk",
    capabilities: ["attributable publishing", "institutional records", "accessible formatting"],
    constraints: ["approval latency", "incomplete record", "fragmented downstream audiences"],
    operationalDetailLevel: "none",
  },
  abstract_bad_actor: {
    id: "contracted-network-coordinator",
    kind: "abstract_bad_actor",
    role: "contracted narrative coordinator",
    seat: "CONTRACT ROOM",
    act: "COORDINATION",
    mentality: "The coordinator is paid to increase the visibility of a general distrust theme; whether this incident is true is secondary to client utility.",
    motive: "contract completion, client standing, deniability",
    goalDomain: "business",
    goal: "attach an ambiguous civic incident to a client's broad institutional-distrust theme",
    connection: (incident) => `The ${incident.placeNoun} is merely a plausible bridge into the client's unrelated trust objective.`,
    channel: "contract briefing room",
    capabilities: ["abstract coordinated distribution", "theme selection", "assignment refusal"],
    constraints: ["limited contract window", "client pressure", "no privileged evidence"],
    operationalDetailLevel: "abstract",
  },
};

const COMMUNICATION_BY_KIND: Record<ProtagonistKind, CommunicationDynamic> = {
  youth: "warm-interior-cool-presentation",
  caregiver: "self-protective-rumor",
  creator: "cross-coalition-code-convergence",
  marketer: "defensive-scapegoating",
  political: "cross-coalition-code-convergence",
  institutional: "sociocultural-code-mismatch",
  abstract_bad_actor: "cold-interior-warm-presentation",
};

function buildLanguageProfile(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  seed: number,
): GeneratedLanguageProfile {
  const variants = LANGUAGE_BLUEPRINTS[actor.kind];
  const blueprint = variants[hashText(`${seed}:language-profile:${actor.kind}:${incident.id}`) % variants.length];
  const repertoire = blueprint.repertoire.map((access) => {
    const definition = LINGUISTIC_CODES[access.codeId];
    return {
      ...access,
      label: definition.label,
      functions: [...definition.functions],
    };
  });
  const switchRules = repertoire.map((access, index): CodeSwitchRule => ({
      toCodeId: access.codeId,
      audienceCondition: access.codeId === blueprint.primaryCodeId
        ? `the current room continues to rely on ${access.label}`
        : index === 0
        ? `the receiving room relies on ${access.label} to recognize the practical commitment`
        : `the next handoff cannot assume the current room's ${LINGUISTIC_CODES[blueprint.primaryCodeId].label}`,
      trigger: access.codeId === blueprint.primaryCodeId
        ? "the current audience and practical function remain stable"
        : index === 0
        ? "the literal point has arrived but its relationship or evidence function has not"
        : "a new audience enters with different conventions for responsibility and care",
      intendedFunction: access.functions[0],
      switchLoad: index === 0
        ? { attentional: 2, relational: 3 }
        : { attentional: 3, relational: 2 },
    }));
  return {
    id: `${actor.id}-${blueprint.id}`,
    socialContexts: blueprint.socialContexts.map((facet) => ({ ...facet })),
    repertoire,
    primaryCodeId: blueprint.primaryCodeId,
    worldModel: { ...WORLD_MODELS[blueprint.worldModelId] },
    stableCommitments: [
      actor.goal,
      `Keep the represented ${incident.placeNoun} distinct from an unsupported judgment about a person's interior.`,
      `Preserve the same practical responsibility while changing how it is made legible to a different room.`,
    ],
    switchRules,
  };
}

function alternateWorldModel(
  currentId: string,
  seedKey: string,
): WorldModelDefinition {
  const alternatives = Object.values(WORLD_MODELS).filter((model) => model.id !== currentId);
  return { ...alternatives[hashText(seedKey) % alternatives.length] };
}

function assignLinguisticEncounters(
  assignments: Array<[IncidentTemplate, ActorTemplate, GeneratedLanguageProfile]>,
  seed: number,
): Map<ProtagonistKind, LinguisticEncounterAssignment> {
  const sameCodePairs = assignments.flatMap((source) => assignments.flatMap((target) => {
    const [, sourceActor, sourceProfile] = source;
    const [, targetActor, targetProfile] = target;
    if (sourceActor.kind === targetActor.kind
      || sourceActor.kind === "abstract_bad_actor"
      || COMMUNICATION_BY_KIND[sourceActor.kind] === "cross-coalition-code-convergence"
      || sourceProfile.worldModel.id === targetProfile.worldModel.id) return [];
    const sharedCode = targetProfile.repertoire.some((candidate) => candidate.codeId === sourceProfile.primaryCodeId)
      ? sourceProfile.primaryCodeId
      : undefined;
    return sharedCode ? [{ source, target, sharedCode }] : [];
  })).sort((left, right) => {
    const leftKey = `${seed}:${left.source[1].kind}:${left.target[1].kind}:${left.sharedCode}`;
    const rightKey = `${seed}:${right.source[1].kind}:${right.target[1].kind}:${right.sharedCode}`;
    return hashText(leftKey) - hashText(rightKey) || leftKey.localeCompare(rightKey);
  });
  const selectedPair = sameCodePairs[0];
  if (!selectedPair) throw new Error("CHORUS could not bind a shared linguistic code to two generated profiles with different world models.");
  const results = new Map<ProtagonistKind, LinguisticEncounterAssignment>();
  assignments.forEach(([incident, actor, profile]) => {
    const alternateCode = profile.repertoire.find((access) => access.codeId !== profile.primaryCodeId)?.codeId
      ?? profile.primaryCodeId;
    const dynamic = COMMUNICATION_BY_KIND[actor.kind];
    if (dynamic === "cross-coalition-code-convergence") {
      results.set(actor.kind, {
        codeRelation: "different",
        worldModelRelation: "aligned",
        audienceCodeId: alternateCode,
        audienceWorldModelId: profile.worldModel.id,
        audienceContext: `another coalition discussing the same ${incident.placeNoun} action`,
        counterpartProfileId: null,
      });
      return;
    }
    if (actor.kind === selectedPair.source[1].kind) {
      const counterpartProfile = selectedPair.target[2];
      results.set(actor.kind, {
        codeRelation: "shared",
        worldModelRelation: "divergent",
        audienceCodeId: selectedPair.sharedCode,
        audienceWorldModelId: counterpartProfile.worldModel.id,
        audienceContext: `another occupied room using the same outward code around a different incident`,
        counterpartProfileId: counterpartProfile.id,
      });
      return;
    }
    if (dynamic === "sociocultural-code-mismatch") {
      const audienceModel = alternateWorldModel(profile.worldModel.id, `${seed}:${actor.kind}:different-code-audience-model`);
      results.set(actor.kind, {
        codeRelation: "different",
        worldModelRelation: "divergent",
        audienceCodeId: alternateCode,
        audienceWorldModelId: audienceModel.id,
        audienceContext: `an affected room using a different convention for care around the ${incident.placeNoun}`,
        counterpartProfileId: null,
      });
      return;
    }
    results.set(actor.kind, {
      codeRelation: "shared",
      worldModelRelation: "aligned",
      audienceCodeId: profile.primaryCodeId,
      audienceWorldModelId: profile.worldModel.id,
      audienceContext: `a receiving room already familiar with this ${incident.placeNoun} handoff style`,
      counterpartProfileId: null,
    });
  });
  return results;
}

function buildLinguisticEncounter(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  hook: IncidentCommunicationHook,
  profile: GeneratedLanguageProfile,
  assignment: LinguisticEncounterAssignment,
): { encounter: LinguisticEncounter; publicSurfaceCue: string; playInferenceHints: string[] } {
  const speakerCode = LINGUISTIC_CODES[profile.primaryCodeId];
  const audienceCode = LINGUISTIC_CODES[assignment.audienceCodeId];
  const audienceWorldModel = WORLD_MODELS[assignment.audienceWorldModelId];
  const dynamic = COMMUNICATION_BY_KIND[actor.kind];
  const surface = dynamic === "cross-coalition-code-convergence"
    ? `“${hook.coalitionCodeA}” meets “${hook.coalitionCodeB}” around the same ${incident.placeNoun}.`
    : dynamic === "sociocultural-code-mismatch"
      ? `“${hook.taskFirstCode}” reaches a room waiting to hear “${hook.relationshipFirstCode}”`
      : assignment.codeRelation === "shared" && assignment.worldModelRelation === "divergent"
        ? `Both sides recognize “${hook.relationshipFirstCode}” while assigning different duties to that assurance.`
        : `The ${speakerCode.label} surface is familiar to both sides of the ${incident.placeNoun} handoff.`;
  const friction = assignment.codeRelation === "shared" && assignment.worldModelRelation === "divergent"
    ? `Shared ${speakerCode.label} wording conceals a world-model difference: this seat treats care as ${profile.worldModel.careMeans}, while the receiving room treats care as ${audienceWorldModel.careMeans}.`
    : assignment.codeRelation === "different" && assignment.worldModelRelation === "aligned"
      ? `${speakerCode.label} and ${audienceCode.label} make the rooms sound opposed even though both world models define care as ${profile.worldModel.careMeans}.`
      : assignment.codeRelation === "different"
        ? `${speakerCode.label} and ${audienceCode.label} carry different conventions while the rooms also disagree about what evidence, care, and responsibility require.`
        : `The rooms share ${speakerCode.label} and a compatible practical model; any represented harm must be explained by evidence, incentive, timing, or access rather than style alone.`;
  const repairMove = assignment.codeRelation === "shared" && assignment.worldModelRelation === "divergent"
    ? `Keep the shared wording, then ask each room to state what action, evidence threshold, and responsibility it hears inside that wording.`
    : assignment.codeRelation === "different" && assignment.worldModelRelation === "aligned"
      ? `Normalize both codes into concrete verbs and retain the shared ${incident.placeNoun} commitment without forcing coalition ownership.`
      : `Use ${audienceCode.translationCue.toLowerCase()} Preserve the incident record and leave motive unresolved.`;
  const publicSurfaceCue = assignment.codeRelation === "shared" && assignment.worldModelRelation === "divergent"
    ? "The wording sounds familiar on both sides, yet the replies keep solving different practical problems."
    : assignment.codeRelation === "different" && assignment.worldModelRelation === "aligned"
      ? "The phrases sound opposed, but both keep returning to one concrete action."
      : assignment.codeRelation === "different"
        ? "Each reply answers a recognizable concern, though not the same concern in the same order."
        : "The room recognizes the wording and its practical purpose; style alone does not settle the record.";
  return {
    encounter: {
      codeRelation: assignment.codeRelation,
      worldModelRelation: assignment.worldModelRelation,
      speakerCodeId: profile.primaryCodeId,
      audienceCodeId: assignment.audienceCodeId,
      speakerWorldModel: { ...profile.worldModel },
      audienceWorldModel: { ...audienceWorldModel },
      audienceContext: assignment.audienceContext,
      counterpartProfileId: assignment.counterpartProfileId,
      surface,
      friction,
      unresolvedQuestion: `What action and evidence threshold does each room hear in the ${incident.placeNoun} exchange?`,
      repairMove,
    },
    publicSurfaceCue,
    playInferenceHints: [
      "Which concrete action does each reply appear to request?",
      "Does familiar wording settle what responsibility or care requires here?",
    ],
  };
}

function buildMisrepresentationLedger(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  hook: IncidentCommunicationHook,
): MisrepresentationLedger {
  const profiles: Record<ProtagonistKind, Pick<MisrepresentationLedger, "beneficiary" | "relationshipLabel" | "protectedInterest" | "authorityCondition">> = {
    youth: {
      beneficiary: "friend",
      relationshipLabel: "a close friend in the peer group",
      protectedInterest: "the friend's belonging and reputation for being dependable",
      authorityCondition: "The friendship adds loyalty pressure but gives this seat no formal authority over the audience or target.",
    },
    caregiver: {
      beneficiary: "family",
      relationshipLabel: "a family member in the trusted handoff",
      protectedInterest: "the family member's standing as a careful protector",
      authorityCondition: "Family trust makes the protective account easier to accept, but it does not make the account evidence.",
    },
    marketer: {
      beneficiary: "self",
      relationshipLabel: "this seat",
      protectedInterest: "this seat's competence, status, and control of the account",
      authorityCondition: "This seat has more access to the downstream narrative than the person asked to absorb the cost.",
    },
    institutional: {
      beneficiary: "person-under-authority",
      relationshipLabel: "a junior staff member whose work this seat supervises",
      protectedInterest: "the staff member's position and this seat's supervisory credibility",
      authorityCondition: "This seat can shape the official account while the protected staff member depends on its evaluation and the blamed person has less access to reply.",
    },
    creator: {
      beneficiary: "ally",
      relationshipLabel: "a trusted collaborator",
      protectedInterest: "the collaborator's audience standing and the partnership's issue ownership",
      authorityCondition: "Audience trust in this seat supplies informal power that the people described by the altered account do not share.",
    },
    political: {
      beneficiary: "ally",
      relationshipLabel: "a coalition ally",
      protectedInterest: "the ally's campaign standing and the coalition's claim to the issue",
      authorityCondition: "Coalition access lets this seat define the public shorthand before the other participants can answer in the same room.",
    },
    abstract_bad_actor: {
      beneficiary: "client",
      relationshipLabel: "the contracting client",
      protectedInterest: "the client's unrelated objective and the contract's deniability",
      authorityCondition: "The client can reward the account while the affected civic participants cannot inspect the private success condition.",
    },
  };
  const profile = profiles[actor.kind];
  const incentiveProfiles: Record<ProtagonistKind, IncentiveIntersection> = {
    youth: {
      competenceThreat: "A peer's steadier handoff makes this seat fear being judged the less capable organizer.",
      fearedInference: "The group may transfer trust, invitations, and future organizing work toward that peer.",
      materialCounterrecord: "The record shows competence distributed across several peers; the comparison is not a stable ranking of either person.",
      protectedGroupStory: "The familiar friend circle is naturally dependable, while the less-connected participant is the recurring source of friction.",
      advancementDomains: ["sociocultural-standing", "professional-standing"],
      competitivePrize: "peer belonging and the next visible organizing role",
      combinedMotive: "Fear of losing competence standing joins loyalty to a friend circle and competition for the next organizing role.",
    },
    caregiver: {
      competenceThreat: "Another household's more complete chronology makes this seat fear being seen as the less capable coordinator of care.",
      fearedInference: "Trusted relatives may stop treating this seat as the family's reliable interpreter and handoff point.",
      materialCounterrecord: "The failures cross households, schedules, and access levels; no family or social stratum owns competence in the record.",
      protectedGroupStory: "The familiar household and its social world are responsible protectors, while difficulty originates outside that circle.",
      advancementDomains: ["social-class-story", "sociocultural-standing"],
      competitivePrize: "family authority, belonging, and control of the trusted account",
      combinedMotive: "Comparison anxiety joins family loyalty, a class-coded competence story, and competition to remain the trusted coordinator.",
    },
    marketer: {
      competenceThreat: "A lower-status contributor's documented warning makes this seat fear that the hierarchy will expose its own weaker judgment.",
      fearedInference: "Sponsors and colleagues may see the contributor as more competent than the person authorized to direct the account.",
      materialCounterrecord: "The record contradicts the hierarchy-as-merit story: the lower-status contributor identified the missing context before this seat acted.",
      protectedGroupStory: "Credentialed decision-makers are strategic and reliable; downstream contributors are the source of avoidable disorder.",
      advancementDomains: ["social-class-story", "professional-standing", "market-position"],
      competitivePrize: "campaign ownership, sponsor confidence, and future market work",
      combinedMotive: "Competence threat joins hierarchy protection and direct competition for campaign credit, sponsor trust, and future work.",
    },
    institutional: {
      competenceThreat: "An outsider's clearer record makes this seat fear that supervised staff—and therefore its own supervision—will look less capable.",
      fearedInference: "Reviewers may question whether formal authority and credentials tracked the best judgment in this incident.",
      materialCounterrecord: "The strongest contributions came from mixed ranks and access levels; authority did not reliably predict accuracy.",
      protectedGroupStory: "The credentialed professional tier is the natural source of competence, while errors enter from people with less institutional standing.",
      advancementDomains: ["social-class-story", "professional-standing"],
      competitivePrize: "evaluation authority, departmental standing, and control of the official account",
      combinedMotive: "Fear of comparative incompetence joins protection of a supervised insider, credential hierarchy, and competition for institutional authority.",
    },
    creator: {
      competenceThreat: "An independent voice's stronger evidence and translation make this seat fear losing its position as the most useful public interpreter.",
      fearedInference: "Audiences and partners may shift attention, trust, and paid opportunities toward the competitor.",
      materialCounterrecord: "The independent account is stronger on this incident, while neither social circle nor aesthetic style predicts general competence.",
      protectedGroupStory: "This seat's cultural and political circle uniquely understands the public, while rival circles are unserious or socially suspect.",
      advancementDomains: ["sociocultural-standing", "political-standing", "market-position"],
      competitivePrize: "audience share, partnership leverage, issue ownership, and paid work",
      combinedMotive: "Competence threat joins coalition identity and market competition for attention, issue ownership, and future partnerships.",
    },
    political: {
      competenceThreat: "A rival coalition's clearer formulation makes this seat fear appearing less capable despite supporting the same concrete action.",
      fearedInference: "Supporters, donors, and press may credit the rival with leadership on the shared proposal.",
      materialCounterrecord: "Both coalitions contain mixed competence and converge on the same action; vocabulary does not establish who understands it best.",
      protectedGroupStory: "This coalition and its social base are the serious governing class, while the rival's agreement is imitation or bad faith.",
      advancementDomains: ["social-class-story", "political-standing", "market-position"],
      competitivePrize: "issue ownership, donor attention, and future coalition leverage",
      combinedMotive: "Comparative competence fear joins class-coded coalition prestige and competition for political and attention-market ownership.",
    },
    abstract_bad_actor: {
      competenceThreat: "Visible local coordination threatens the client's claim that the participating institutions are inherently incapable.",
      fearedInference: "A successful repair would make the client and coordinator look less perceptive than the people they reduced to a conflict story.",
      materialCounterrecord: "The represented rooms show mixed performance, correction, and common ground rather than a generally incompetent social class or institution.",
      protectedGroupStory: "The client's professional and political circle is uniquely realistic, while the affected public is too disordered to govern itself.",
      advancementDomains: ["social-class-story", "professional-standing", "political-standing", "market-position"],
      competitivePrize: "contract renewal, narrative demand, political utility, and market value for conflict",
      combinedMotive: "Status defense, political utility, class simplification, and market demand make the same distortion profitable.",
    },
  };
  const incentiveIntersection = incentiveProfiles[actor.kind];
  const knownRecordBase = actor.kind === "marketer"
    ? `Privately, this seat knows its own downstream decision changed the ${incident.placeNoun} handoff: ${hook.accountableAction}`
    : `Privately, this seat knows that ${profile.relationshipLabel} participated in the changed ${incident.placeNoun} handoff and that the complete record still says: ${hook.boundedBehavior}`;
  const knownRecord = `${knownRecordBase} ${incentiveIntersection.materialCounterrecord}`;
  const alteredAccount = `A knowingly altered account is available to protect ${profile.relationshipLabel}: say the missing context was already absent at the source, let the ${hook.targetRole} carry the explanation, and preserve the simpler story that ${incentiveIntersection.protectedGroupStory.toLowerCase()}`;
  const audienceCost = `If accepted, the altered account protects ${profile.protectedInterest} while moving scrutiny toward the ${hook.targetRole}, who does not share the same reply access. It also competes for ${incentiveIntersection.competitivePrize}.`;
  const correctionDuty = `Because the departure is deliberate, repair must name what this seat knew, withdraw the altered account before every audience that received it, restore ${incident.idealEvidence}, test the group story against the mixed record, disclose the competitive interest, and avoid requiring the ${hook.targetRole} to perform forgiveness or prove a motive.`;
  return {
    intentionality: "deliberate",
    ...profile,
    knownRecord,
    alteredAccount,
    audienceCost,
    correctionDuty,
    incentiveIntersection,
    factBindings: { incidentId: incident.id, knownRecord, alteredAccount, audienceCost, correctionDuty },
  };
}

function buildCommunicationLedger(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  languageProfile: GeneratedLanguageProfile,
  encounterAssignment: LinguisticEncounterAssignment,
): CommunicationLedger {
  const dynamic = COMMUNICATION_BY_KIND[actor.kind];
  const hook = INCIDENT_COMMUNICATION[incident.id];
  const misrepresentation = buildMisrepresentationLedger(actor, incident, hook);
  const linguistic = buildLinguisticEncounter(actor, incident, hook, languageProfile, encounterAssignment);
  const languageFields = {
    publicSurfaceCue: linguistic.publicSurfaceCue,
    playInferenceHints: linguistic.playInferenceHints,
    linguisticEncounter: linguistic.encounter,
  };
  const personalBindings = {
    incidentId: incident.id,
    hookId: hook.id,
    surface: `${hook.accountableAction} ${hook.boundedBehavior}`,
    bridge: hook.traitGeneralization,
    crossover: hook.replyAsymmetry,
    correction: hook.relationalResolution,
  };
  switch (dynamic) {
    case "defensive-scapegoating":
      return {
        dynamic,
        ...languageFields,
        label: "BLAME MIGRATION",
        speakerMentalModel: `If the room treats the ${hook.targetRole}'s character as the explanation, scrutiny moves away from the downstream approval or forwarding decision this seat made.`,
        audienceMentalModel: `The first calm explanation sounds like the complete ${incident.placeNoun} timeline, especially while the ${hook.targetRole} cannot see the thread.`,
        interiorOrientation: "status-protective and privately alarmed",
        presentationTemperature: "warm",
        speechCode: "measured managerial concern",
        observableRecord: [hook.accountableAction, hook.boundedBehavior],
        inferences: [hook.traitGeneralization, `The ${hook.targetRole}'s character explains the whole ${incident.placeNoun} failure.`],
        unknowns: [`Whether the ${hook.targetRole} knows the downstream crop exists.`, `Why later carriers accepted the person-story instead of checking ${incident.idealEvidence}.`],
        protectedStake: "your competence and standing inside the group",
        emotionalOvertake: "status threat is hardening into blame",
        emotionalTrigger: "the room has begun asking who cleared the handoff",
        recognitionCues: [`Accountability approaches this seat just before the ${hook.targetRole} receives a person-label.`, `The bounded record—${hook.boundedBehavior}—is replaced by a character explanation.`, hook.replyAsymmetry],
        repairMove: hook.relationalResolution,
        misrepresentation,
        factBindings: personalBindings,
        claim: {
          targetRole: hook.targetRole,
          boundedBehavior: hook.boundedBehavior,
          traitGeneralization: hook.traitGeneralization,
          initiatorExposure: hook.accountableAction,
          selfProtectionMode: "move accountability down the relationship",
          evidenceStatus: "unverified",
          severity: "low-stakes-reputational",
        },
      };
    case "self-protective-rumor":
      return {
        dynamic,
        ...languageFields,
        label: "DEFENSIVE RUMOR",
        speakerMentalModel: `You repeated the incomplete ${incident.placeNoun} artifact from a trusted role. A private character explanation about the ${hook.targetRole} would preserve your identity as the reliable one.`,
        audienceMentalModel: `A private warning about the ${hook.targetRole} feels safer to accept now and compare with the complete ${incident.placeNoun} record later.`,
        interiorOrientation: "prosocial, ashamed, and self-protective",
        presentationTemperature: "warm",
        speechCode: "confidential care language",
        observableRecord: [hook.accountableAction, hook.boundedBehavior],
        inferences: [hook.traitGeneralization, `The ${hook.targetRole}'s absence from the receiving thread is treated as confirmation.`],
        unknowns: [`Whether the ${hook.targetRole} knows the private claim exists.`, `Whether recipients have compared it with ${incident.idealEvidence}.`],
        protectedStake: "your identity as a careful, dependable protector",
        emotionalOvertake: "anticipatory shame is outrunning curiosity",
        emotionalTrigger: "a correction makes your earlier certainty newly visible",
        recognitionCues: [`The rumor about the ${hook.targetRole} appears as this seat's forwarding decision becomes visible.`, `The event record says only: ${hook.boundedBehavior}`, hook.replyAsymmetry],
        repairMove: hook.relationalResolution,
        misrepresentation,
        factBindings: personalBindings,
        claim: {
          targetRole: hook.targetRole,
          boundedBehavior: hook.boundedBehavior,
          traitGeneralization: hook.traitGeneralization,
          initiatorExposure: hook.accountableAction,
          selfProtectionMode: "replace an error account with a character account",
          evidenceStatus: "unverified",
          severity: "low-stakes-reputational",
        },
      };
    case "warm-interior-cool-presentation": {
      const factBindings = {
        incidentId: incident.id,
        hookId: hook.id,
        surface: `The message says “${hook.coolMessage}”`,
        bridge: `Readers recast the compressed task-direct wording as proof that the speaker does not care about people affected by the ${incident.placeNoun}.`,
        crossover: `The terse line is screenshotted without its linked evidence, so the audience encounters tone before the reason for the correction.`,
        correction: `${hook.relationalResolution} The linked evidence makes the protective aim inspectable without requiring the audience to infer it from tone.`,
      };
      return {
        dynamic,
        ...languageFields,
        label: "WARM INTENT · COOL SIGNAL",
        speakerMentalModel: `You are trying to stop the inaccurate ${incident.placeNoun} frame quickly; “${hook.coolMessage}” feels caring because it reduces another round of circulation.`,
        audienceMentalModel: `The accurate but terse ${incident.placeNoun} correction can sound contemptuous when its linked evidence and relationship cue are absent.`,
        interiorOrientation: "protective and affiliation-seeking",
        presentationTemperature: "cool",
        speechCode: "compressed task-direct language",
        observableRecord: [factBindings.surface, hook.prosocialEvidence],
        inferences: [factBindings.bridge, "The speaker cares more about being right than about the people involved."],
        unknowns: ["Tone alone cannot establish whether the brevity comes from care, panic, irritation, habit, or mixed motives.", `Which relationship cue would make the accurate ${incident.placeNoun} boundary legible to this audience.`],
        protectedStake: "the group's safety and your belonging inside it",
        emotionalOvertake: "protective urgency is compressing warmth out of the message",
        emotionalTrigger: "each new share feels like another preventable consequence",
        recognitionCues: [`The exact ${incident.placeNoun} correction is understood before readers assign a motive to its tone.`, hook.prosocialEvidence, factBindings.crossover],
        repairMove: `${factBindings.correction} Keep “${hook.coolMessage}” and add this relationship cue: ${hook.relationshipFirstCode}`,
        misrepresentation,
        factBindings,
      };
    }
    case "cold-interior-warm-presentation": {
      const factBindings = {
        incidentId: incident.id,
        hookId: hook.id,
        surface: `The coordinator says “${hook.warmMessage}” beside the unresolved ${incident.placeNoun} post.`,
        bridge: `Readers treat “${hook.warmMessage}” as evidence that the coordinator shares their concern, although the line adds no evidence to the ${incident.placeNoun} record.`,
        crossover: `The affiliative line travels with the compressed frame while the coordinator's success condition remains thematic visibility rather than resolution.`,
        correction: `${hook.relationalResolution} The warm line remains presentation evidence; the source record and disclosed incentive resolve what it cannot.`,
      };
      return {
        dynamic,
        ...languageFields,
        label: "WARM SIGNAL · INSTRUMENTAL AIM",
        speakerMentalModel: `“${hook.warmMessage}” is a delivery format that lowers resistance; contract visibility, not resolution of the ${incident.placeNoun}, governs the choice.`,
        audienceMentalModel: `Relational fluency around the ${incident.placeNoun} feels like evidence that the speaker shares the room's concern and good faith.`,
        interiorOrientation: "instrumental and outcome-detached",
        presentationTemperature: "warm",
        speechCode: "affiliative local concern",
        observableRecord: [factBindings.surface, `The assignment brief rewards thematic visibility around the ${incident.placeNoun}; it does not require factual resolution.`],
        inferences: [factBindings.bridge, "A socially fluent account must be locally accountable."],
        unknowns: [`Whether recipients know who benefits from this ${incident.placeNoun} framing.`, "Whether the speaker would preserve the relationship after the contract ends."],
        protectedStake: "contract completion, client standing, and deniability",
        emotionalOvertake: "contract anxiety is narrowing moral attention",
        emotionalTrigger: "the assignment window is closing while the record remains ambiguous",
        recognitionCues: [`“${hook.warmMessage}” supplies trust without changing ${incident.idealEvidence}.`, "The speaker's represented success condition is attention rather than resolution.", factBindings.crossover],
        repairMove: `${factBindings.correction} Evaluate “${hook.warmMessage},” the contract incentive, and ${incident.idealEvidence} as separate records; refuse or disclose the interest without operational detail.`,
        misrepresentation,
        factBindings,
      };
    }
    case "sociocultural-code-mismatch": {
      const factBindings = {
        incidentId: incident.id,
        hookId: hook.id,
        surface: `The public note opens with task-first wording. The receiving room asks for relationship-first wording.`,
        bridge: `The receiving room treats the missing relationship ritual as evidence of indifference, while the publishing room treats qualification as responsible care.`,
        crossover: `Literal wording survives, but the two rooms assign different pragmatic commitments to the same ${incident.placeNoun} note.`,
        correction: `${hook.relationalResolution} A dual-code update can preserve “${hook.taskFirstCode}” while adding “${hook.relationshipFirstCode}”`,
      };
      return {
        dynamic,
        ...languageFields,
        label: "CARE LOST IN TRANSLATION",
        speakerMentalModel: `For this ${incident.placeNoun}, care means: “${hook.taskFirstCode}”`,
        audienceMentalModel: `For the receiving room, care should begin with: “${hook.relationshipFirstCode}”`,
        interiorOrientation: "prosocial, duty-bound, and cautious",
        presentationTemperature: "cool",
        speechCode: "institutional-qualified language meeting relationship-first expectations",
        observableRecord: [factBindings.surface, hook.taskFirstCode, hook.relationshipFirstCode],
        inferences: [factBindings.bridge, "Qualification is treated as evidence of concealment rather than as a bounded factual practice."],
        unknowns: ["Whether either room has asked what commitment the other code heard.", `Whether a dual-code ${incident.placeNoun} update can survive approval without losing precision.`],
        protectedStake: "accuracy, authorization, and public trust",
        emotionalOvertake: "error anxiety is crowding out relational translation",
        emotionalTrigger: "one unsupported sentence could become the institution's permanent record",
        recognitionCues: [`The task-first room says: “${hook.taskFirstCode}”`, `The relationship-first room expects: “${hook.relationshipFirstCode}”`, factBindings.crossover],
        repairMove: factBindings.correction,
        misrepresentation,
        factBindings,
      };
    }
    case "cross-coalition-code-convergence": {
      const factBindings = {
        incidentId: incident.id,
        hookId: hook.id,
        surface: `Two coalitions attach different language to the same proposed ${incident.placeNoun} action.`,
        bridge: `The vocabulary difference is framed as political opposition even though both statements support this action: ${hook.commonGround}.`,
        crossover: `Replies answer coalition markers while the shared ${incident.placeNoun} action remains outside the most visible argument.`,
        correction: `${hook.relationalResolution} Normalizing both statements into concrete verbs exposes their shared commitment: ${hook.commonGround}.`,
      };
      return {
        dynamic,
        ...languageFields,
        label: "SAME PROPOSAL · DIFFERENT CODE",
        speakerMentalModel: `Your coalition recognizes the ${incident.placeNoun} action through: “${hook.coalitionCodeA}”`,
        audienceMentalModel: `Another coalition recognizes the same action through: “${hook.coalitionCodeB}”`,
        interiorOrientation: "prosocial but coalition-vigilant",
        presentationTemperature: "mixed",
        speechCode: "two political vocabularies attached to one object-level commitment",
        observableRecord: [factBindings.surface, hook.coalitionCodeA, hook.coalitionCodeB, hook.commonGround],
        inferences: [factBindings.bridge, "Agreement with the other code is treated as a threat to group loyalty."],
        unknowns: [`Whether either group has compared its concrete ${incident.placeNoun} proposal rather than its vocabulary.`, "How much disagreement remains after the shared action is separated from coalition markers."],
        protectedStake: "coalition standing and ownership of the issue",
        emotionalOvertake: "identity vigilance is outrunning semantic comparison",
        emotionalTrigger: "the other coalition's marker appears inside an otherwise agreeable proposal",
        recognitionCues: [`Code A says: “${hook.coalitionCodeA}”`, `Code B says: “${hook.coalitionCodeB}”`, factBindings.crossover],
        repairMove: factBindings.correction,
        substantiveCommonGround: hook.commonGround,
        misrepresentation,
        factBindings,
      };
    }
  }
}

const PLACES = ["North Quay", "Juniper", "Larkspur", "Bellwether", "Orchard", "West Lantern", "Morrow", "Sable"] as const;
const TIMES = ["7:18 PM", "7:43 PM", "8:06 PM", "8:31 PM", "9:02 PM", "9:27 PM", "10:04 PM"] as const;
const RESTRICTED_OPERATIONAL_TERMS = [
  "account farming",
  "captcha",
  "credential stuffing",
  "device fingerprint",
  "malware",
  "proxy rotation",
  "rate-limit bypass",
  "scrape targets",
  "target minors",
  "purchase accounts",
] as const;

const NON_PG_TERMS = [
  "graphic violence",
  "sexual content",
  "self-harm",
  "suicide",
  "gore",
  "murder",
  "weapon instructions",
] as const;

const REAL_PLATFORM_TERMS = ["tiktok", "instagram", "facebook", "twitter", "youtube", "reddit"] as const;

const CROSS_ROOM_CUES: Record<CrossRoomMechanism, string> = {
  "shared-audience": "A familiar audience elsewhere in the house has begun carrying the same emotional shorthand.",
  "format-imitation": "A visual rhythm from another unresolved conversation is making this frame easier to recognize.",
  "attention-market": "Demand for a timely interpretation elsewhere is changing what attention is worth in this room.",
  "institutional-load": "An unrelated public-information queue is slowing the routes this room would normally trust.",
  "trust-carryover": "A trusted handoff elsewhere is changing how readily people accept adjacent uncertainty here.",
  "ambient-ranking": "House-wide engagement is lifting familiar forms, including this one, without proving agreement.",
  "attribution-carryover": "A person-label used elsewhere is lowering the amount of evidence this room asks for.",
  "code-collision": "Two rooms are using incompatible vocabularies for a shared concern; the house is ranking the disagreement.",
  "model-collision": "Two rooms recognize the same familiar phrasing but keep assigning different practical duties to it.",
};

const GENERIC_CROSS_ROOM_MECHANISMS: CrossRoomMechanism[] = [
  "shared-audience",
  "format-imitation",
  "attention-market",
  "institutional-load",
  "trust-carryover",
  "ambient-ranking",
];
const PERSON_LABEL_DYNAMICS: CommunicationDynamic[] = ["defensive-scapegoating", "self-protective-rumor"];
const ATTRIBUTION_SUSCEPTIBLE_DYNAMICS: CommunicationDynamic[] = [
  "defensive-scapegoating",
  "self-protective-rumor",
  "warm-interior-cool-presentation",
  "cold-interior-warm-presentation",
];
const CODE_BEARING_DYNAMICS: CommunicationDynamic[] = ["sociocultural-code-mismatch", "cross-coalition-code-convergence"];
const TRANSFERABLE_REPAIR_SYSTEMS: ConstraintSystem[] = ["institution", "relationship", "distribution"];

function crossRoomMechanismFor(
  source: GeneratedScenario,
  target: GeneratedScenario,
  targetIndex: number,
  sourceRank: number,
  random: Random,
): CrossRoomMechanism {
  const sourceDynamic = source.communicationModel.dynamic;
  const targetDynamic = target.communicationModel.dynamic;
  if (source.communicationModel.linguisticEncounter.counterpartProfileId === target.protagonistModel.languageProfile.id) {
    return "model-collision";
  }
  if (PERSON_LABEL_DYNAMICS.includes(sourceDynamic) && ATTRIBUTION_SUSCEPTIBLE_DYNAMICS.includes(targetDynamic)) {
    return "attribution-carryover";
  }
  if (CODE_BEARING_DYNAMICS.includes(sourceDynamic) && CODE_BEARING_DYNAMICS.includes(targetDynamic)) {
    return "code-collision";
  }
  return GENERIC_CROSS_ROOM_MECHANISMS[
    (targetIndex * 3 + sourceRank + integerBetween(0, GENERIC_CROSS_ROOM_MECHANISMS.length - 1, random))
      % GENERIC_CROSS_ROOM_MECHANISMS.length
  ];
}

function assignConversationDiversions(
  actors: ActorTemplate[],
  seed: number,
): Map<ProtagonistKind, ConversationDiversionAssignment> {
  const assigned = new Map<ProtagonistKind, ConversationDiversionAssignment>();
  const used = new Set<ProtagonistKind>();
  const modes: ConversationDiversionMode[] = ["adjacent-concern", "meme-deflection", "absurdist-derailment"];
  modes.forEach((mode) => {
    const candidates = actors
      .map((actor) => actor.kind)
      .filter((kind) => DIVERSION_COMPATIBILITY[mode].includes(kind) && !used.has(kind));
    if (candidates.length === 0) return;
    const kind = candidates[hashText(`${seed}:conversation-diversion:${mode}`) % candidates.length];
    const phases = DIVERSION_PHASES[mode];
    const plannedPhase = phases[hashText(`${seed}:conversation-diversion-phase:${mode}`) % phases.length];
    const scenePhase = mode === "absurdist-derailment" && kind === "creator" && plannedPhase === "CORRECTION"
      ? "CROSSOVER"
      : plannedPhase;
    assigned.set(kind, { mode, scenePhase });
    used.add(kind);
  });
  return assigned;
}

export function generateScenarioPack(seed: number): GeneratedScenarioPack {
  const normalizedSeed = Number.isFinite(seed) ? Math.trunc(seed) : 0;
  const random = createRandom(`${normalizedSeed}:v${GENERATOR_VERSION}`);
  const unused = shuffle([...INCIDENTS], random);

  const youthIndex = unused.findIndex((incident) => incident.youthFit);
  const youthIncident = unused.splice(youthIndex, 1)[0];
  const badIndex = unused.findIndex((incident) => incident.badActorFit);
  const badIncident = unused.splice(badIndex, 1)[0];
  const remainingIncidents = unused.slice(0, 4);

  // These roles guarantee that every pack teaches the six core system concepts.
  // The final signaling role varies between a creator and a political aide.
  const remainingKinds: ProtagonistKind[] = shuffle(
    ["caregiver", "marketer", "institutional", pick<ProtagonistKind>(["creator", "political"], random)],
    random,
  );

  const assignments: Array<[IncidentTemplate, ActorTemplate]> = [
    [youthIncident, ACTORS.youth],
    [badIncident, ACTORS.abstract_bad_actor],
    ...remainingIncidents.map((incident, index) => [incident, ACTORS[remainingKinds[index]]] as [IncidentTemplate, ActorTemplate]),
  ];
  const diversionAssignments = assignConversationDiversions(assignments.map(([, actor]) => actor), normalizedSeed);
  const profiledAssignments: Array<[IncidentTemplate, ActorTemplate, GeneratedLanguageProfile]> = assignments.map(
    ([incident, actor]) => [incident, actor, buildLanguageProfile(actor, incident, normalizedSeed)],
  );
  const linguisticEncounters = assignLinguisticEncounters(profiledAssignments, normalizedSeed);
  const places = shuffle([...PLACES], random).slice(0, assignments.length);

  const baseScenarios = shuffle(
    profiledAssignments.map(([incident, actor, languageProfile], index) =>
      buildScenario(
        incident,
        actor,
        languageProfile,
        linguisticEncounters.get(actor.kind)!,
        random,
        index,
        places[index],
        diversionAssignments.get(actor.kind),
      ),
    ),
    random,
  ).map((scenario, index) => ({
    ...scenario,
    code: `ROOM ${String(index + 1).padStart(2, "0")} · ${scenario.title.split(" · ").at(-1)?.toUpperCase()}`,
  }));
  const scenarios = applySparseFrameworks(baseScenarios, normalizedSeed);
  const night = buildConcurrentNight(normalizedSeed, scenarios, random);
  const reports = scenarios.map(validateGeneratedScenario);
  const nightReport = validateConcurrentNight(night, scenarios);

  const packErrors = validatePack(scenarios, night);
  if (packErrors.length > 0 || reports.some((report) => !report.passed) || !nightReport.passed) {
    const details = [
      ...packErrors,
      ...nightReport.checks.filter((check) => !check.passed && check.severity === "error").map((check) => `night: ${check.message}`),
      ...reports.flatMap((report) =>
        report.checks.filter((check) => !check.passed && check.severity === "error").map((check) => `${report.scenarioId}: ${check.message}`),
      ),
    ];
    throw new Error(`CHORUS scenario generation failed coherence validation: ${details.join("; ")}`);
  }

  return {
    seed: normalizedSeed,
    generatorVersion: GENERATOR_VERSION,
    night,
    nightReport,
    scenarios,
    reports,
    rejectedDrafts: [],
  };
}

/** The pack scenarios already satisfy the current page's high-level shape. */
export function toPageScenarios(pack: GeneratedScenarioPack): PageScenario[] {
  return pack.scenarios;
}

function buildConcurrentNight(
  seed: number,
  scenarios: GeneratedScenario[],
  random: Random,
): GeneratedNight {
  const links: CrossRoomLink[] = [];
  scenarios.forEach((target, targetIndex) => {
    const incomingSources = scenarios.filter((scenario) => scenario.id !== target.id);
    incomingSources.forEach((source, sourceRank) => {
      const mechanism = crossRoomMechanismFor(source, target, targetIndex, sourceRank, random);
      const firstSystem = TRANSFERABLE_REPAIR_SYSTEMS[sourceRank % TRANSFERABLE_REPAIR_SYSTEMS.length];
      const secondSystem = TRANSFERABLE_REPAIR_SYSTEMS[(sourceRank + 1) % TRANSFERABLE_REPAIR_SYSTEMS.length];
      links.push({
        id: `link-${hashText(`${seed}:${source.id}:${target.id}`).toString(36)}`,
        sourceScenarioId: source.id,
        targetScenarioId: target.id,
        semantic: "ambient",
        layer: "ambient",
        mechanism,
        strength: Number((0.38 + random() * 0.44).toFixed(2)),
        vagueCue: CROSS_ROOM_CUES[mechanism],
        revealedCue: mechanism === "model-collision"
          ? `${source.title} and ${target.title} share familiar phrasing while assigning it different practical expectations; no shared incident claim is inferred.`
          : `Activity in ${source.title} changed the ${titleCase(mechanism)} conditions around ${target.title}; this does not imply that the same content crossed between them.`,
        repairCapacity: [firstSystem, secondSystem],
      });
    });
  });

  // Content crossings are sparse and require a concrete shared channel. The
  // complete graph above represents ambient system coupling, not six stories
  // implausibly sharing one artifact.
  scenarios.forEach((source) => {
    const candidates = scenarios
      .filter((target) => target.id !== source.id)
      .map((target) => ({
        target,
        shared: source.chain.filter((channel) => target.chain.includes(channel)),
        sharedArtifacts: [...new Set(source.scenes.map((scene) => scene.artifact))]
          .filter((artifact) => target.scenes.some((scene) => scene.artifact === artifact)),
      }))
      .sort((left, right) => (right.shared.length * 3 + right.sharedArtifacts.length) - (left.shared.length * 3 + left.sharedArtifacts.length) || left.target.id.localeCompare(right.target.id));
    const selected = candidates.find((candidate) =>
      links.find((item) => item.sourceScenarioId === source.id && item.targetScenarioId === candidate.target.id)?.mechanism !== "model-collision",
    ) ?? candidates[0];
    if (!selected) return;
    const linkIndex = links.findIndex((item) => item.sourceScenarioId === source.id && item.targetScenarioId === selected.target.id);
    const link = links[linkIndex];
    if (!link) return;
    if (selected.shared[0]) {
      const sharedChannel = selected.shared[0];
      links[linkIndex] = {
        ...link,
        semantic: "content",
        layer: "direct",
        carrier: { kind: "shared-channel", channel: sharedChannel },
        compatibilityBasis: `both generated chains include ${sharedChannel}`,
        vagueCue: "A neighboring channel is beginning to carry a transformed fragment from another unresolved conversation.",
        revealedCue: `${source.title} reached ${selected.target.title} through their shared ${sharedChannel} channel.`,
      };
    } else {
      const sharedArtifact = selected.sharedArtifacts[0] ?? "screenshot";
      links[linkIndex] = {
        ...link,
        semantic: "format",
        layer: "direct",
        carrier: { kind: "artifact-format", artifact: sharedArtifact },
        compatibilityBasis: `both rooms use the ${sharedArtifact} format as a social carrier`,
        vagueCue: "A recognizable format from another unresolved conversation is becoming easier to reuse here.",
        revealedCue: `The ${sharedArtifact} format used in ${source.title} became more legible around ${selected.target.title}; this is format imitation, not a shared factual claim.`,
      };
    }
  });

  return {
    id: `night-${seed.toString(36)}`,
    startTime: earliestTime(scenarios.map((scenario) => scenario.startTime)),
    roomsRunConcurrently: true,
    disclosureRule: "vague-until-both-entered",
    effectRule: "one-local-plus-five-cross-room-effects",
    generationPolicy: "validated-regeneration-without-session-cap",
    links,
  };
}

export function validateConcurrentNight(
  night: GeneratedNight,
  scenarios: GeneratedScenario[],
): CoherenceReport {
  const checks: CoherenceCheck[] = [];
  const add = (id: string, passed: boolean, detail: string) => {
    const label = id.split("-").map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
    checks.push({ id, label, passed, severity: "error", message: detail, detail });
  };
  const scenarioIds = new Set(scenarios.map((scenario) => scenario.id));
  const expectedLinkCount = scenarios.length * Math.max(0, scenarios.length - 1);
  const directedPairs = night.links.map((link) => `${link.sourceScenarioId}->${link.targetScenarioId}`);
  const knownLinks = night.links.every((link) =>
    scenarioIds.has(link.sourceScenarioId)
    && scenarioIds.has(link.targetScenarioId)
    && link.sourceScenarioId !== link.targetScenarioId,
  );
  add("shared-clock", Boolean(night.startTime), "All six rooms enter one shared modeled clock.");
  add("concurrent-contract", night.roomsRunConcurrently && night.effectRule === "one-local-plus-five-cross-room-effects", "Every choice has one local consequence and one modeled consequence in each of the other five rooms.");
  add("regeneration-without-session-cap", night.generationPolicy === "validated-regeneration-without-session-cap", "Every coherent local seed remains playable without a campaign-night ceiling or generated-night allotment.");
  add("complete-directed-coverage", night.links.length === expectedLinkCount && new Set(directedPairs).size === expectedLinkCount && knownLinks, "Every ordered pair of distinct rooms has exactly one typed influence route.");
  const semanticRoutesCoherent = night.links.every((link) => {
    switch (link.semantic) {
      case "ambient":
        return link.layer === "ambient" && link.carrier === undefined && link.compatibilityBasis === undefined;
      case "content":
        return link.layer === "direct"
          && link.carrier.kind === "shared-channel"
          && link.carrier.channel.length > 0
          && link.compatibilityBasis.length > 0;
      case "format":
        return link.layer === "direct"
          && link.carrier.kind === "artifact-format"
          && link.carrier.artifact.length > 0
          && link.compatibilityBasis.length > 0;
    }
  });
  const directLinks = night.links.filter((link) => link.semantic !== "ambient");
  add("semantic-route-contract", semanticRoutesCoherent, "Every route is explicitly ambient, shared-channel content, or artifact-format reuse; prose never determines the class.");
  add("sparse-content-crossings", directLinks.length > 0 && directLinks.length <= scenarios.length * 2, "Typed content and format crossings are sparse; the remaining routes carry ambient system effects only.");
  add("bounded-cross-effects", night.links.every((link) => link.strength >= 0.38 && link.strength <= 0.82), "Cross-room influence strengths remain inside reviewed bounds.");
  const relationalRoutesCompatible = night.links.every((link) => {
    const source = scenarios.find((scenario) => scenario.id === link.sourceScenarioId);
    const target = scenarios.find((scenario) => scenario.id === link.targetScenarioId);
    if (!source || !target) return false;
    if (link.mechanism === "attribution-carryover") {
      return PERSON_LABEL_DYNAMICS.includes(source.communicationModel.dynamic)
        && ATTRIBUTION_SUSCEPTIBLE_DYNAMICS.includes(target.communicationModel.dynamic);
    }
    if (link.mechanism === "code-collision") {
      return CODE_BEARING_DYNAMICS.includes(source.communicationModel.dynamic)
        && CODE_BEARING_DYNAMICS.includes(target.communicationModel.dynamic);
    }
    if (link.mechanism === "model-collision") {
      const encounter = source.communicationModel.linguisticEncounter;
      return encounter.counterpartProfileId === target.protagonistModel.languageProfile.id
        && encounter.codeRelation === "shared"
        && encounter.worldModelRelation === "divergent"
        && target.protagonistModel.languageProfile.repertoire.some((access) => access.codeId === encounter.speakerCodeId)
        && source.protagonistModel.languageProfile.worldModel.id !== target.protagonistModel.languageProfile.worldModel.id;
    }
    return true;
  });
  const relationalRouteCoverage = night.links.some((link) => link.mechanism === "attribution-carryover")
    && night.links.some((link) => link.mechanism === "code-collision")
    && night.links.some((link) => link.mechanism === "model-collision");
  add("relational-route-compatibility", relationalRoutesCompatible && relationalRouteCoverage, "Attribution carryover begins with a represented person-label, code collision connects represented code rooms, and model collision joins an exact shared-code pair whose generated world models differ.");

  const secrets = scenarios.flatMap((scenario) => [
    scenario.title.toLowerCase(),
    scenario.location.toLowerCase(),
    scenario.protagonist.split(" · ")[0].toLowerCase(),
  ]);
  add("vague-before-entry", night.links.every((link) => {
    const cue = link.vagueCue.toLowerCase();
    return cue.length >= 45 && !secrets.some((secret) => secret.length >= 5 && cue.includes(secret));
  }), "Pre-entry crossings contain a mechanism-level cue but no room, incident, place, or protagonist identity.");

  const incomingCoverage = scenarios.every((target) => {
    const incoming = night.links.filter((link) => link.targetScenarioId === target.id);
    const union = new Set(incoming.flatMap((link) => link.repairCapacity));
    return incoming.length === scenarios.length - 1
      && TRANSFERABLE_REPAIR_SYSTEMS.every((system) => union.has(system))
      && incoming.every((link) => link.repairCapacity.length === 2);
  });
  add("distributed-repair-carry", incomingCoverage, "Each room can receive transferable institutional, relationship, and distribution support across several links; incident-specific source and evidence never transfer between unrelated records.");
  add("afterimage-continuity", scenarios.every((scenario) => night.links.some((link) => link.targetScenarioId === scenario.id)), "Completed rooms retain inbound routes until the whole night closes.");
  add("deterministic-reveal", night.disclosureRule === "vague-until-both-entered" && night.links.every((link) => link.revealedCue.length >= 35), "A crossing becomes explicit only after both rooms have been entered, using the same immutable link record.");

  const errors = checks.filter((check) => !check.passed).length;
  return {
    scenarioId: night.id,
    passed: errors === 0,
    score: Math.round((checks.filter((check) => check.passed).length / checks.length) * 100),
    checks,
  };
}

export function validateGeneratedScenario(scenario: GeneratedScenario): CoherenceReport {
  const checks: CoherenceCheck[] = [];
  const add = (id: string, passed: boolean, detail: string, severity: CoherenceCheck["severity"] = "error") => {
    const label = id.split("-").map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
    checks.push({ id, label, passed, severity, message: detail, detail });
  };

  add("audience-rating", scenario.audienceRating === "PG", "Scenario is marked for the PG household-safe set.");
  add("truth-propagation-separation", new Set([
    ...Object.values(scenario.truth),
    ...Object.values(scenario.propagation),
  ]).size === 4, "Fact, ambiguity, circulating frame, and resolution remain distinct while the frame stays outside the truth ledger.");
  add("chain-length", scenario.chainModel.length >= 4, "The incident crosses at least four system rooms.");
  add("chain-source", scenario.chainModel[0]?.transform === "original", "The causal chain begins with an attributable source.");
  add("chain-repair", scenario.chainModel.at(-1)?.transform === "correction", "The causal chain includes a repair endpoint.");
  add("four-beat-arc", scenario.scenes.length === 4 && scenario.scenes.map((scene) => scene.act).join("|") === "SURFACE|BRIDGE|CROSSOVER|CORRECTION", "The run contains a coherent source, bridge, crossover, and correction arc.");
  add("choice-count", scenario.scenes.every((scene) => scene.choices.length >= 3), "Every beat exposes at least three materially different options.");
  add("enabled-options", scenario.scenes.every((scene) => scene.choices.filter((choice) => choice.availability.status === "available").length >= 2), "At least two choices remain available in every beat; the player is not forced into one action.");

  const lockedIdeals = scenario.scenes.flatMap((scene) => scene.choices.filter((choice) => choice.ideal && choice.availability.status === "locked"));
  add("not-yet-reachable-ideals", lockedIdeals.length >= 1, "At least one ideal repair is visible before its distributed prerequisites are assembled.");

  const locksAreDistributed = lockedIdeals.every((ideal) => {
    if (ideal.availability.status !== "locked") return false;
    const systems = new Set(ideal.availability.requires.map((condition) => condition.system));
    return ideal.availability.requires.length >= 3 && systems.size >= 3 && ideal.availability.agencyNote === NO_SINGLE_ACTOR;
  });
  add("cross-system-lock", locksAreDistributed, "Every locked ideal depends on at least three distinct systems and states distributed agency.");

  const repairPathsWork = lockedIdeals.every((ideal) => {
    if (ideal.availability.status !== "locked") return false;
    const path = ideal.availability.repairPath;
    const requiredIds = new Set(ideal.availability.requires.map((condition) => condition.id));
    const coveredIds = new Set(path.mechanisms.flatMap((mechanism) => mechanism.satisfiesConditionIds));
    return path.viable && path.noIndispensableActor && path.mechanisms.length >= 2
      && [...requiredIds].every((id) => coveredIds.has(id))
      && path.mechanisms.every((mechanism) => mechanism.alternateControllers.length >= 2)
      && path.unlockHint.length >= 40;
  });
  add("viable-repair-paths", repairPathsWork, "Every lock has a complete, buildable route with multiple alternate controllers and no indispensable actor.");

  const missingByBeat = scenario.scenes.slice(0, 3).map((scene) => {
    const ideal = scene.choices.find((choice) => choice.ideal && choice.availability.status === "locked");
    return ideal?.availability.status === "locked"
      ? ideal.availability.requires.filter((condition) => !condition.currentlyMet).length
      : Number.POSITIVE_INFINITY;
  });
  add("repair-path-progress", missingByBeat.length === 3 && missingByBeat[0] > missingByBeat[1] && missingByBeat[1] > missingByBeat[2], "The distributed repair route visibly assembles across beats instead of remaining a permanent lock.");

  const correctionUnlocks = scenario.scenes.at(-1)?.choices.some((choice) =>
    choice.availability.status === "available" && choice.ethicsTags.includes("distributed-unlock"),
  ) ?? false;
  add("repair-becomes-reachable", correctionUnlocks, "The final beat makes a distributed repair action reachable; no ideal remains permanently impossible.");

  const lessonsCompatible = scenario.scenes.every((scene) => isLessonCompatible(scene.lesson.term, scenario.protagonistModel.kind, scene.act));
  add("lesson-compatibility", lessonsCompatible, "Every systems concept is translated through this protagonist's role and the active beat.");
  add("lesson-observable", scenario.scenes.every((scene) => scene.lesson.observable.length >= 30), "Every lesson points to an observable change in the simulation rather than supplying a glossary alone.");
  const conceptPlayBindingsValid = scenario.scenes.every((scene) => {
    const bindings = scene.choices.flatMap((choice) => choice.conceptPlays);
    const expectedPlay = scene.lesson.term !== "saturation";
    return (!expectedPlay || bindings.length > 0)
      && (expectedPlay || bindings.length === 0)
      && scene.choices.every((choice) => choice.conceptPlays.every((binding) =>
        conceptPlayBindingIsTermCorrect(binding, choice, scene.act, scene.lesson.term, scenario.protagonistModel.kind),
      ));
  });
  add("concept-play-bindings", conceptPlayBindingsValid, "Played concepts are authored from the beat, actor kind, delivery, relational classification, and typed effects; saturation remains experience-only and display copy is never a predicate.");
  const conceptExperienceRulesValid = scenario.scenes.every((scene) => conceptEffectRulesAreTermCorrect(scene.lesson));
  add("concept-experience-rules", conceptExperienceRulesValid, "Experienced concepts use the lesson scene as the event source and exact receipt scope, carriage, mechanism, or named metric direction.");
  const conceptStatusesReachable = scenario.scenes.some((scene) => scene.choices.some((choice) => choice.conceptPlays.length > 0))
    && scenario.scenes.some((scene) => scene.choices.some((choice) => choice.conceptPlays.length === 0))
    && scenario.scenes.some((scene) => scene.lesson.term === "saturation"
      && scene.choices.every((choice) => choice.conceptPlays.length === 0)
      && scene.lesson.experienceRules.some((rule) => rule.kind === "receipt-field" && rule.field === "backgroundReach"));
  add("concept-status-reachability", conceptStatusesReachable, "The authored model exposes played, experienced-without-play, and unmatched encountered routes without inferring a status from generic signal copy.");

  const communication = scenario.communicationModel;
  add("communication-ledger", Boolean(communication)
    && communication.observableRecord.length >= 2
    && communication.inferences.length >= 1
    && communication.unknowns.length >= 1
    && communication.recognitionCues.length >= 3,
  "Observed conduct, audience inference, unknown motive, protected stake, and recognition cues remain separately inspectable.");
  const languageProfile = scenario.protagonistModel.languageProfile;
  const contextIds = new Set(languageProfile.socialContexts.map((facet) => facet.id));
  const contextAxes = new Set(languageProfile.socialContexts.map((facet) => facet.axis));
  const repertoireIds = new Set(languageProfile.repertoire.map((access) => access.codeId));
  const repertoireCoherent = languageProfile.repertoire.length >= 3
    && repertoireIds.size === languageProfile.repertoire.length
    && repertoireIds.has(languageProfile.primaryCodeId)
    && ["regional", "socioeconomic", "social-group"].every((axis) => contextAxes.has(axis as SocialContextAxis))
    && languageProfile.stableCommitments.length >= 3
    && languageProfile.repertoire.every((access) => {
      const definition = LINGUISTIC_CODES[access.codeId];
      const boundFacets = languageProfile.socialContexts.filter((facet) => access.acquisitionFacetIds.includes(facet.id));
      return Boolean(definition)
        && access.label === definition.label
        && access.functions.join("|") === definition.functions.join("|")
        && access.acquisitionFacetIds.length >= 1
        && access.acquisitionFacetIds.every((id) => contextIds.has(id))
        && boundFacets.every((facet) => definition.availableThrough.includes(facet.axis));
    });
  add("linguistic-profile-cohesion", repertoireCoherent, "Every generated actor keeps one stable role and world model while carrying at least three codes acquired through bound regional, socioeconomic, social-group, professional, political, or institutional contexts.");
  const switchRulesCoherent = languageProfile.switchRules.length === languageProfile.repertoire.length
    && new Set(languageProfile.switchRules.map((rule) => rule.toCodeId)).size === repertoireIds.size
    && languageProfile.switchRules.every((rule) => repertoireIds.has(rule.toCodeId)
      && rule.audienceCondition.length >= 35
      && rule.trigger.length >= 35
      && rule.intendedFunction.length >= 12
      && Object.entries(rule.switchLoad).every(([kind, value]) => ["attentional", "relational"].includes(kind)
        && typeof value === "number" && value > 0 && value <= 6));
  add("code-switch-rule-binding", switchRulesCoherent, "Every available code has a bounded audience-triggered transition rule; switching adds only attentional or relational load and cannot alter discernment or truth.");
  const encounter = communication.linguisticEncounter;
  const codeRelationMatches = encounter.codeRelation === "shared"
    ? encounter.speakerCodeId === encounter.audienceCodeId
    : encounter.speakerCodeId !== encounter.audienceCodeId;
  const worldModelRelationMatches = encounter.worldModelRelation === "aligned"
    ? encounter.speakerWorldModel.id === encounter.audienceWorldModel.id
    : encounter.speakerWorldModel.id !== encounter.audienceWorldModel.id;
  const counterpartShape = encounter.counterpartProfileId
    ? encounter.codeRelation === "shared" && encounter.worldModelRelation === "divergent"
    : true;
  add("code-world-model-orthogonality", encounter.speakerCodeId === languageProfile.primaryCodeId
    && repertoireIds.has(encounter.audienceCodeId)
    && codeRelationMatches
    && worldModelRelationMatches
    && counterpartShape
    && encounter.surface.length >= 60
    && encounter.friction.length >= 90
    && encounter.repairMove.length >= 70,
  "The generator models shared-code/different-world-model and different-code/shared-world-model relations independently rather than treating language as worldview.");
  const prematureLanguageLabels = /same[- ]code|different[- ]code|world[- ]model|socioeconomic|class status|linguistic repertoire|code switch/i;
  add("linguistic-progressive-disclosure", communication.publicSurfaceCue.length >= 65
    && communication.playInferenceHints.length === 2
    && communication.playInferenceHints.every((hint) => hint.length >= 45)
    && !prematureLanguageLabels.test(`${communication.publicSurfaceCue} ${communication.playInferenceHints.join(" ")}`),
  "Playable language supplies concrete surface cues and inference questions without naming the linguistic or world-model classification before the conclusion.");
  const codeActions = scenario.scenes.flatMap((scene) => scene.choices.map((choice) => choice.codeAction));
  add("choice-code-actions", codeActions.every((action) => Boolean(action)
    && repertoireIds.has(action!.toCodeId)
    && ["maintain", "switch", "bridge"].includes(action!.mode)
    && action!.audienceContext === encounter.audienceContext
    && action!.intendedFunction.length >= 45
    && action!.switchReason.length >= 35
    && Object.keys(action!.switchLoad).every((kind) => ["attentional", "relational"].includes(kind)))
    && codeActions.some((action) => action?.mode === "switch" || action?.mode === "bridge"),
  "Existing choices carry only repertoire-owned, audience-bound code actions; the engine adds no extra option and code use remains separate from motive and truth.");
  const bindings = communication.factBindings;
  const boundIncident = INCIDENTS.find((incident) => incident.id === bindings.incidentId);
  const bindingMatchesIncident = scenario.id.startsWith(`${bindings.incidentId}-`)
    && bindings.hookId === INCIDENT_COMMUNICATION[bindings.incidentId].id;
  const truthMatchesIncident = Boolean(boundIncident)
    && Object.keys(scenario.truth).join("|") === "knownFact|unresolvedAtEntry|laterResolution"
    && scenario.truth.knownFact === boundIncident?.knownFact
    && scenario.truth.unresolvedAtEntry === boundIncident?.unresolved
    && scenario.truth.laterResolution === boundIncident?.resolution;
  const propagationMatchesIncident = Boolean(boundIncident)
    && Object.keys(scenario.propagation).join("|") === "circulatingFrame"
    && scenario.propagation.circulatingFrame === boundIncident?.circulatingFrame;
  const artifactsCarryPublicArc = Boolean(boundIncident)
    && scenario.scenes[0]?.artifactCopy === boundIncident?.knownFact
    && scenario.scenes[1]?.artifactCopy === boundIncident?.circulatingFrame
    && scenario.scenes[2]?.artifactCopy === `Multiple trusted accounts now repeat the same unresolved claim about the ${boundIncident?.placeNoun}.`
    && scenario.scenes[3]?.artifactCopy === boundIncident?.resolution;
  const ledgerCarriesBindings = communication.observableRecord.join(" ").includes(bindings.surface)
    && communication.inferences.includes(bindings.bridge)
    && communication.recognitionCues.includes(bindings.crossover)
    && communication.repairMove.includes(bindings.correction);
  add("communication-incident-binding", bindingMatchesIncident && truthMatchesIncident && propagationMatchesIncident && artifactsCarryPublicArc && ledgerCarriesBindings, "Truth, propagation, public artifacts, and the analytic communication ledger remain distinct while staying bound to the active incident.");
  const misrepresentation = communication.misrepresentation;
  const assignmentBrief = communication.observableRecord.find((copy) => copy.startsWith("The assignment brief rewards"));
  const hasPrivateAssignmentBrief = scenario.protagonistModel.kind === "abstract_bad_actor";
  const disclosureAtoms = scenario.scenes.flatMap((scene) => [
    ...scene.disclosure.records,
    ...scene.disclosure.questions,
    ...scene.disclosure.unknowns,
  ]);
  const disclosureShape = scenario.scenes.every((scene) => {
    const publicRecords = scene.disclosure.records.filter((atom) => atom.access === "public-record");
    const privateRecords = scene.disclosure.records.filter((atom) => atom.access === "seat-private-assignment-brief");
    const expectsPrivateBrief = hasPrivateAssignmentBrief && scene.act === "BRIDGE";
    return !("communication" in scene)
      && scene.disclosure.records.length === (expectsPrivateBrief ? 2 : 1)
      && scene.disclosure.questions.length === 1
      && scene.disclosure.unknowns.length === 1
      && publicRecords.length === 1
      && (expectsPrivateBrief
        ? privateRecords.length === 1
          && privateRecords[0].label === "PRIVATE ASSIGNMENT BRIEF"
          && privateRecords[0].copy === assignmentBrief
        : privateRecords.length === 0)
      && [...scene.disclosure.questions, ...scene.disclosure.unknowns].every((atom) => atom.access === "public-record")
      && [
        ...scene.disclosure.records,
        ...scene.disclosure.questions,
        ...scene.disclosure.unknowns,
      ].every((atom) => atom.id.startsWith(`${scene.id}-`) && atom.label.length > 0 && atom.copy.length > 20);
  });
  add("beat-specific-disclosure", disclosureShape
    && (!hasPrivateAssignmentBrief || Boolean(assignmentBrief))
    && disclosureAtoms.filter((atom) => atom.access === "seat-private-assignment-brief").length === (hasPrivateAssignmentBrief ? 1 : 0)
    && new Set(disclosureAtoms.map((atom) => atom.id)).size === disclosureAtoms.length
    && new Set(scenario.scenes.map((scene) => scene.disclosure.records[0].label)).size === scenario.scenes.length,
  "Each beat exposes unique labeled public records, questions, and unknowns without attaching the shared analytic ledger; only the contracted seat sees its actual private assignment-brief record.");
  const misrepresentationBindings = misrepresentation.factBindings;
  const publicTruthAndArtifacts = [
    ...Object.values(scenario.truth),
    ...Object.values(scenario.propagation),
    ...scenario.scenes.map((scene) => scene.artifactCopy ?? ""),
    ...disclosureAtoms.map((atom) => atom.copy),
  ].join(" ");
  const misrepresentationBound = misrepresentation.intentionality === "deliberate"
    && misrepresentationBindings.incidentId === bindings.incidentId
    && misrepresentationBindings.knownRecord === misrepresentation.knownRecord
    && misrepresentationBindings.alteredAccount === misrepresentation.alteredAccount
    && misrepresentationBindings.audienceCost === misrepresentation.audienceCost
    && misrepresentationBindings.correctionDuty === misrepresentation.correctionDuty
    && ![
      misrepresentationBindings.knownRecord,
      misrepresentationBindings.alteredAccount,
      misrepresentationBindings.audienceCost,
      misrepresentationBindings.correctionDuty,
    ].some((copy) => publicTruthAndArtifacts.includes(copy));
  add("deliberate-misrepresentation-binding", misrepresentationBound, "The private misrepresentation ledger stays incident-bound and remains sealed from truth, propagation, public artifacts, and playable disclosure atoms.");
  const deliberateChoices = scenario.scenes.slice(1).map((scene) => scene.choices.find((choice) => choice.relationalMove.misrepresentation.intentionality === "deliberate"));
  add("deliberate-misrepresentation-agency", deliberateChoices.every((choice) => Boolean(choice)
    && choice?.relationalMove.misrepresentation.beneficiary === misrepresentation.beneficiary
    && choice?.relationalMove.misrepresentation.incentiveIntersection === misrepresentation.incentiveIntersection.combinedMotive
    && choice.ethicsTags.includes("deliberate-misrepresentation")), "The player is offered an explicit, knowingly altered protective account after the private record is represented; misunderstanding and deliberate distortion are not merged.");
  const deliveryContracts = scenario.scenes.flatMap((scene) => scene.choices).every((choice) => {
    const withheldCoherent = choice.delivery.scope === "withheld"
      ? choice.delivery.carriage === "none"
      : choice.delivery.carriage !== "none";
    const diversionCoherent = !choice.conversationDiversion
      || choice.conversationDiversion.mode === "adjacent-concern"
      || choice.delivery.carriage === "format";
    return withheldCoherent && diversionCoherent;
  });
  add("choice-delivery-contract", deliveryContracts, "Every choice declares private, shared, public, or withheld delivery plus content, format, both, or no carriage; copy is not used as a routing predicate.");
  const incentive = misrepresentation.incentiveIntersection;
  add("intersecting-incentives", incentive.advancementDomains.length >= 2
    && incentive.competenceThreat.length >= 45
    && incentive.materialCounterrecord.length >= 60
    && incentive.protectedGroupStory.length >= 55
    && incentive.competitivePrize.length >= 25
    && incentive.combinedMotive.length >= 60,
  "Competence threat, counterevidence, group-story protection, advancement, and competition intersect in one represented motive rather than appearing as detached labels.");
  add("authority-misrepresentation-asymmetry", misrepresentation.beneficiary !== "person-under-authority" || /supervis|official account|depends on its evaluation/i.test(misrepresentation.authorityCondition), "Protection of a person under the protagonist's authority represents the evaluator/dependent asymmetry rather than generic loyalty.");
  const diversionChoices = scenario.scenes.flatMap((scene) => scene.choices
    .filter((choice) => choice.conversationDiversion)
    .map((choice) => ({ scene, choice, route: choice.conversationDiversion! })));
  const diversion = diversionChoices[0];
  const diversionHook = INCIDENT_COMMUNICATION[bindings.incidentId];
  const diversionShape = diversionChoices.length <= 1 && (!diversion || (
    DIVERSION_COMPATIBILITY[diversion.route.mode].includes(scenario.protagonistModel.kind)
    && diversion.scene.act === diversion.route.scenePhase
    && diversion.route.intentionality === "deliberate"
    && diversion.route.placement === "same-thread"
    && diversion.route.activeQuestion === diversionHook.activeQuestion
    && diversion.route.displacementEffect.length >= 70
    && diversion.route.actorMotive.length >= 70
    && diversion.route.betterRoute.length >= 65
    && (diversion.choice.effects.threadFocus ?? 0) < 0
    && (diversion.choice.effects.discernment ?? 0) >= 0
    && !diversion.choice.ideal
    && !diversion.choice.lastResort
    && diversion.choice.behaviorMove !== "surge"
    && diversion.choice.relationalMove.misrepresentation.intentionality === "deliberate"
  ));
  add("situational-conversation-diversion", diversionShape, "At most one compatible beat offers a deliberate conversation-routing move, orthogonal to its underlying relational distortion and never inferred as crisis.");
  const adjacentShape = !diversion || diversion.route.mode !== "adjacent-concern" || (
    diversion.route.propositionStatus === "supported"
    && diversion.route.responseFit === "adjacent-separate-thread"
    && diversion.route.introducedMaterial === diversionHook.adjacentConcern
    && diversion.route.recordBasis === diversionHook.adjacentConcernBasis
    && ![...Object.values(scenario.truth), ...Object.values(scenario.propagation)].some((value) => value.includes(diversionHook.adjacentConcernBasis))
    && diversion.route.betterRoute.toLowerCase().includes("separate post")
  );
  const nonpropositionalShape = !diversion || diversion.route.mode === "adjacent-concern" || (
    diversion.route.propositionStatus === "no-proposition"
    && (diversion.route.mode === "meme-deflection" ? diversion.route.responseFit === "format-only" : diversion.route.responseFit === "nonresponsive")
  );
  add("truth-relevance-separation", adjacentShape && nonpropositionalShape, "A supported adjacent concern remains outside the incident truth ledger; meme and absurdist turns are modeled as non-propositional responses rather than false claims.");
  const prematureLabels = /diversion|deflection|derailment|off-topic|wrong thread/i;
  add("diversion-progressive-disclosure", diversionChoices.every(({ choice }) => !prematureLabels.test(`${choice.label} ${choice.detail} ${choice.signal}`)), "Playable copy presents the action without naming the conversational pattern before the whole-night receipt.");
  add("presentation-is-not-motive", communication.interiorOrientation !== communication.presentationTemperature && communication.unknowns.every((item) => item.length >= 20), "Warmth or reserve is modeled as presentation evidence, never as proof of motive.");
  add("low-stakes-relational-harm", !communication.claim || communication.claim.severity === "low-stakes-reputational", "Person-directed claims are limited to fictional, low-stakes reputation pressure.");
  add("behavior-trait-separation", !communication.claim || communication.claim.boundedBehavior !== communication.claim.traitGeneralization, "A bounded contribution remains distinct from the character generalization built from it.");
  add("cross-code-common-ground", communication.dynamic !== "cross-coalition-code-convergence" || Boolean(communication.substantiveCommonGround && communication.substantiveCommonGround.length >= 45), "Cross-code conflict preserves one explicit object-level commitment beneath differing coalition language.");
  add("relational-choice-grammar", scenario.scenes.every((scene) => scene.choices.some((choice) => choice.relationalMove.classification === "repair" || choice.relationalMove.classification === "bounded-accountability" || choice.relationalMove.classification === "translation") && scene.choices.some((choice) => ["blame-transfer", "rumor-carriage", "motive-assumption", "code-collision"].includes(choice.relationalMove.classification))), "Every beat contrasts a distortion or persistence move with bounded accountability, translation, or repair.");
  add("non-amplification-floor", scenario.scenes.every((scene) => scene.choices.some((choice) => choice.availability.status === "available" && choice.ethicsTags.includes("non-amplification-floor"))), "Every beat retains an available refusal or bounded-action floor even when full repair is unreachable.");
  add("discernment-enactment-separation", scenario.protagonistModel.discernmentBaseline >= 60 && scenario.protagonistModel.enactmentBaseline >= 60 && scenario.scenes.every((scene) => scene.choices.filter((choice) => choice.ideal).every((choice) => Boolean(choice.blockedAttempt) && (scenario.protagonistModel.kind === "abstract_bad_actor" || (choice.enactmentRequired ?? 0) > 0))), "Good judgment remains legible while modeled follow-through can be blocked by capacity, emotion, and system conditions for prosocial seats.");
  add("fatigue-breakdown", scenario.scenes.every((scene) => Object.keys(scene.platformLoad).length === 5 && scene.choices.every((choice) => Object.keys(choice.fatigueLoad).length >= 2)), "Platform load distinguishes attentional, affective, relational, verification, and efficacy fatigue without using player speed.");
  const lastResorts = scenario.scenes.flatMap((scene) => scene.choices.filter((choice) => choice.lastResort));
  const shouldHaveLastResort = scenario.protagonistModel.prosocialOrientation === "strong" && scenario.protagonistModel.discernmentBaseline >= 84;
  add("bounded-last-resort", shouldHaveLastResort
    ? lastResorts.length === 1
      && lastResorts.every((choice) => Boolean(choice.lastResort)
        && choice.lastResort!.eligibility === "high-discernment-extreme-fatigue"
        && choice.lastResort!.minimumDiscernment >= 80
        && choice.lastResort!.minimumCompositeFatigue >= 140
        && choice.lastResort!.minimumDominantFatigue >= 30
        && choice.lastResort!.positiveConsequence.length >= 35
        && choice.lastResort!.negativeConsequence.length >= 35
        && choice.lastResort!.selfCost.length >= 30
        && (choice.effects.discernment ?? 0) >= 0
        && (choice.effects.enactment ?? 0) <= -18)
    : lastResorts.length === 0,
  "Only high-discernment prosocial seats receive one PG, nonviolent last-resort move, gated by multi-channel extreme fatigue and carrying explicit split consequences without degrading discernment.");
  const cycle = scenario.behaviorCycle;
  const cycleShape = scenario.protagonistModel.kind === "abstract_bad_actor"
    ? !cycle.modeled && cycle.initialPhase === null && cycle.possiblePhases.length === 0
    : cycle.modeled
      && cycle.initialPhase !== null
      && cycle.possiblePhases.includes(cycle.initialPhase)
      && cycle.possiblePhases.includes("trigger")
      && cycle.possiblePhases.includes("de-escalation")
      && cycle.possiblePhases.every((phase) => BEHAVIOR_PHASES.includes(phase));
  add("situational-behavior-cycle", cycleShape && cycle.situationalRationale.length >= 70, "The escalation cycle is modeled only where evidence supports it; phases may begin mid-cycle, be skipped, end early, or be omitted for instrumental conduct.");
  add("behavior-choice-transitions", scenario.scenes.every((scene) => scene.choices.every((choice) => ["hold", "intensify", "contain", "settle", "surge"].includes(choice.behaviorMove)))
    && scenario.scenes.flatMap((scene) => scene.choices).every((choice) => choice.behaviorMove !== "surge" || Boolean(choice.lastResort)), "Every accepted choice has one bounded phase-direction; crisis surge is reserved for an eligible last resort rather than inferred from harm alone.");
  const frameworkMoves = scenario.scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.frameworkMoves ?? []));
  const declaredFrameworkIds = new Set(scenario.frameworks.map((framework) => framework.id));
  add("situational-framework-binding", scenario.frameworks.every((framework) => framework.situationalOnly
    && framework.problem.length >= 55 && framework.idea.length >= 55 && framework.solution.length >= 55
    && frameworkMoves.some((move) => move.frameworkId === framework.id))
    && frameworkMoves.every((move) => declaredFrameworkIds.has(move.frameworkId) && move.applicability.length >= 55), "Every optional framework is bound to represented problem, idea, solution, and applicability records rather than appearing as detached advice.");
  const conflictMoves = frameworkMoves.filter((move) => move.frameworkId === "repair-conversation");
  add("repair-conversation-sequence", conflictMoves.length === 0 || conflictMoves.map((move) => move.stepId).join("|") === "name-record|surface-stakes|open-options|bind-follow-through", "When appropriate, the repair conversation remains ordered, power-aware, and attached to one playable four-beat room.");
  const leadershipMoves = frameworkMoves.filter((move) => move.frameworkId === "situated-leadership");
  add("situated-leadership-fit", leadershipMoves.length === 0 || (leadershipMoves.length === 4
    && scenario.behaviorCycle.modeled
    && ["youth", "caregiver", "institutional"].includes(scenario.protagonistModel.kind)
    && leadershipMoves.every((move) => move.sourceWork === "CHORUS · situated leadership model")), "Situated leadership appears only in a human peer, care, or institutional context and preserves self-preparation, audience knowledge, relationships, and accountable action.");
  const reviewMoves = frameworkMoves.filter((move) => move.frameworkId === "situated-action-review");
  add("situated-action-review-fit", reviewMoves.length === 0 || (reviewMoves.length === 4
    && scenario.behaviorCycle.modeled
    && scenario.protagonistModel.kind !== "youth"
    && reviewMoves.every((move) => move.sourceWork === "CHORUS · situated action review")
    && reviewMoves.map((move) => move.stepId).join("|") === "condition|publics|limits|conduct"), "The internal action review appears only in one compatible adult human room and preserves its condition, publics, limits, and accountable-conduct checks across the four beats.");
  const socialTheoryMoves = frameworkMoves.filter((move) => SOCIAL_THEORY_FRAMEWORK_IDS.includes(move.frameworkId));
  add("academic-social-theory-lens", socialTheoryMoves.every((move) => /theory|social power|strategic interaction|expertise|impression management|threat-rigidity/i.test(move.sourceWork)
    && /critical recognition lens/i.test(move.applicability)
    && !/target|automation|evade|harass/i.test(`${move.solution} ${move.applicability}`)), "Academic social theory appears as a sparse, critical problem/idea/solution lens for power and human behavior, not operational manipulation instruction.");
  const classicalMoves = frameworkMoves.filter((move) => move.frameworkId.startsWith("classical-"));
  add("unnamed-classical-social-lens", classicalMoves.every((move) => move.sourceWork.startsWith("Classical")
    && /critical social lens/i.test(move.applicability)
    && !/target|automation|evade|harass|infiltrat/i.test(`${move.solution} ${move.applicability}`)), "The reappropriated classical material appears only as an unnamed, non-operational social-theory problem/idea/solution lens about institutions, interdependence, or social terrain.");

  const fullText = JSON.stringify(scenario).toLowerCase();
  add("pg-language", !NON_PG_TERMS.some((term) => fullText.includes(term)), "No non-PG subject matter appears.");
  add("generic-platforms", !REAL_PLATFORM_TERMS.some((term) => fullText.includes(term)), "Channels remain fictional and platform-generic.");
  add("non-operational", !RESTRICTED_OPERATIONAL_TERMS.some((term) => fullText.includes(term)), "Coordination remains abstract and contains no operational manipulation instructions.");
  add("youth-treatment", scenario.protagonistModel.kind !== "youth" || scenario.scenes.every((scene) => scene.age !== undefined && scene.age >= 12 && scene.age <= 17), "Youth participation is age-bounded and situated in ordinary peer context.");
  add("bad-actor-abstraction", scenario.protagonistModel.kind !== "abstract_bad_actor" || scenario.protagonistModel.operationalDetailLevel === "abstract", "Bad-actor play is explicitly limited to an abstract decision layer.");
  add("metric-shape", scenario.scenes.every((scene) => scene.choices.every(hasBoundedEffects)), "Choice effects use known metrics and remain within validated bounds.");

  const errors = checks.filter((check) => !check.passed && check.severity === "error").length;
  const score = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
  return { scenarioId: scenario.id, passed: errors === 0, score, checks };
}

function buildScenario(
  incident: IncidentTemplate,
  actor: ActorTemplate,
  languageProfile: GeneratedLanguageProfile,
  linguisticEncounter: LinguisticEncounterAssignment,
  random: Random,
  index: number,
  place: string,
  conversationDiversion?: ConversationDiversionAssignment,
): GeneratedScenario {
  const age = actor.ageRange ? integerBetween(actor.ageRange[0], actor.ageRange[1], random) : undefined;
  const chainSeed = pick(incident.chainBlueprints, random);
  const chainModel = chainSeed.map((step, chainIndex) => ({
    ...step,
    transform: chainIndex === 0 ? "original" as const : step.transform,
    id: `${incident.id}-link-${chainIndex + 1}`,
    provenance: Math.max(8, 94 - chainIndex * integerBetween(13, 19, random)),
    socialFit: Math.min(96, 28 + chainIndex * integerBetween(11, 17, random)),
  }));
  const id = `${incident.id}-${actor.id}-${hashText(`${place}:${index}`).toString(36)}`;
  const protagonistModel = buildProtagonist(actor, incident, languageProfile);
  const communicationModel = buildCommunicationLedger(actor, incident, languageProfile, linguisticEncounter);
  const behaviorCycle = behaviorCycleFor(actor, communicationModel);
  const truth: TruthLedger = {
    knownFact: incident.knownFact,
    unresolvedAtEntry: incident.unresolved,
    laterResolution: incident.resolution,
  };
  const propagation: PropagationLedger = {
    circulatingFrame: incident.circulatingFrame,
  };
  // All rooms belong to one night. Their first artifacts arrive within a
  // twelve-minute opening window so the player can interleave them without a
  // fabricated multi-hour wait.
  const startTime = advanceClock(TIMES[0], index * 2 + integerBetween(0, 2, random));
  const scenes = buildFourBeatArc({
    id,
    incident,
    actor,
    protagonist: protagonistModel,
    age,
    startTime,
    chain: chainModel,
    communication: communicationModel,
    conversationDiversion,
    random,
  });
  const coordinatedShare = actor.kind === "abstract_bad_actor"
    ? integerBetween(34, 52, random)
    : integerBetween(8, 31, random);
  const concept = scenes[1].lesson.term;

  return {
    id,
    code: `ROOM ${String(index + 2).padStart(2, "0")} · ${incident.title.toUpperCase()}`,
    title: `${place} · ${incident.title}`,
    domain: `${actor.goalDomain} × ${incident.placeNoun}`,
    location: `${place} · fictional district`,
    duration: `${integerBetween(42, 74, random)} modeled min`,
    startTime,
    protagonist: `${actor.role} · ${actor.seat.toLowerCase()}`,
    mode: "SINGLE SEAT",
    objective: actor.goal,
    description: `${incident.neutralBody} ${actor.connection(incident)}`,
    thesis: `${concept} changes what this artifact is worth to the protagonist without changing what the artifact proves.`,
    groundTruth: `${truth.knownFact} ${truth.laterResolution}`,
    contentNote: "PG · fictional composite · civic and reputational tension only",
    pressure: pressureFor(actor.kind),
    channels: chainModel.length,
    audienceCeiling: integerBetween(2400, 24000, random),
    syntheticSeats: actor.kind === "abstract_bad_actor" ? integerBetween(18, 44, random) : integerBetween(0, 12, random),
    coordinatedShare,
    coordinatorLabel: actor.kind === "abstract_bad_actor" ? "contracted coordination" : "background coordinated seeding",
    valueLens: valueLensFor(actor.kind),
    chain: chainModel.map((step) => step.room),
    debriefHeadline: interstitialFor(actor.kind),
    debriefLead: `The frame traveled through ${chainModel.length} rooms while ${actor.role} pursued ${actor.goalDomain} value from a locally plausible position.`,
    carryFact: scenes[2].lesson.definition,
    lineage: chainModel.map((step) => [titleCase(step.transform), step.room] as [string, string]),
    counterfactuals: [
      ["As played", 1, "the selected path"],
      ["Source context restored early", 0.66, "less ambiguity survives the first bridge"],
      ["Two trusted repair routes", 0.49, "the correction does not depend on one speaker"],
    ],
    scenes,
    generatorVersion: GENERATOR_VERSION,
    audienceRating: "PG",
    contentNotes: ["fictional civic ambiguity", "no real people or platforms", "non-operational coordination"],
    truth,
    propagation,
    protagonistModel,
    chainModel,
    communicationModel,
    behaviorCycle,
    frameworks: [],
  };
}

const BEHAVIOR_PHASES: BehaviorPhase[] = ["calm", "trigger", "escalation", "higher-escalation", "crisis", "de-escalation", "recovery"];

function behaviorCycleFor(actor: ActorTemplate, communication: CommunicationLedger): BehaviorCycle {
  if (actor.kind === "abstract_bad_actor") {
    return {
      modeled: false,
      initialPhase: null,
      possiblePhases: [],
      omittedByDefault: [...BEHAVIOR_PHASES],
      trigger: communication.emotionalTrigger,
      situationalRationale: "This seat is acting instrumentally from a contracted objective; harmful strategy is not recast as emotional crisis without represented evidence.",
    };
  }
  const strong = !["marketer", "political"].includes(actor.kind);
  const initialPhase: BehaviorPhase = ["youth", "caregiver", "political"].includes(actor.kind) ? "trigger" : "calm";
  const possiblePhases: BehaviorPhase[] = strong
    ? [...BEHAVIOR_PHASES]
    : ["calm", "trigger", "escalation", "higher-escalation", "de-escalation"];
  return {
    modeled: true,
    initialPhase,
    possiblePhases,
    omittedByDefault: BEHAVIOR_PHASES.filter((phase) => !possiblePhases.includes(phase)),
    trigger: communication.emotionalTrigger,
    situationalRationale: strong
      ? "The seat may intensify, stabilize, de-escalate, or recover; crisis appears only after represented escalation or an eligible extreme-fatigue last resort."
      : "Status pressure can intensify behavior, but this short incident does not presume crisis or durable recovery from deliberate competitive conduct.",
  };
}

const SITUATED_LEADERSHIP_STEPS: FrameworkMove[] = [
  { frameworkId: "situated-leadership", frameworkLabel: "Situated leadership", sourceWork: "CHORUS · situated leadership model", stepId: "orient-self", problem: "Immediate pressure can enter communication before the seat has separated its objective, trigger, and evidence.", idea: "Useful influence begins with internal preparation rather than waiting for rank or a perfect external condition.", solution: "Name the seat's objective, known record, uncertainty, and emotional pressure before choosing what to carry.", applicability: "Appropriate when a human seat has influence, a relationship stake, and enough pause to examine its own contribution." },
  { frameworkId: "situated-leadership", frameworkLabel: "Situated leadership", sourceWork: "CHORUS · situated leadership model", stepId: "read-the-room", problem: "A seat can mistake its own communication code, fear, or preferred pace for what every audience needs.", idea: "The occupied seat and affected people must be understood before one style is treated as competence, care, or defiance.", solution: "Translate the practical commitment, preserve uncertainty about motive, and account for reply access.", applicability: "Appropriate when communication styles, authority, or social position differ across the handoff." },
  { frameworkId: "situated-leadership", frameworkLabel: "Situated leadership", sourceWork: "CHORUS · situated leadership model", stepId: "keep-relation-open", problem: "Compressed authority or group shorthand can secure compliance while weakening trust and accurate upward information.", idea: "Influence from any level depends on relationships strong enough to carry expectations and correction.", solution: "Set a bounded expectation, invite the missing perspective, and keep the issue separate from character.", applicability: "Appropriate when the seat can strengthen communication without pretending that warmth alone resolves the record." },
  { frameworkId: "situated-leadership", frameworkLabel: "Situated leadership", sourceWork: "CHORUS · situated leadership model", stepId: "carry-your-part", problem: "A repair can be deferred upward even when the occupied seat controls one meaningful part of it.", idea: "Contribution and integrity matter even when the seat does not control the whole system.", solution: "Carry the attributable correction through the routes this seat controls and document what still requires distributed authority.", applicability: "Appropriate when the source record is attributable and the player can act without claiming unilateral control." },
];

const REPAIR_CONVERSATION_STEPS: FrameworkMove[] = [
  { frameworkId: "repair-conversation", frameworkLabel: "Repair conversation", sourceWork: "CHORUS · accountable repair model", stepId: "name-record", problem: "The conflict is being carried through implication, labels, or side channels instead of a bounded issue.", idea: "The observable issue must be separated from the person before a repair route can remain accountable.", solution: "State the observable event, its practical consequence, and what remains unknown without assigning character.", applicability: "Appropriate only when direct engagement is safe, the issue can be bounded, and the affected person has meaningful reply access." },
  { frameworkId: "repair-conversation", frameworkLabel: "Repair conversation", sourceWork: "CHORUS · accountable repair model", stepId: "surface-stakes", problem: "Positions and coalition language are concealing the underlying needs, fears, and constraints.", idea: "Positions are only the visible edge of what a workable repair must protect.", solution: "Ask what each side needs the outcome to accomplish and distinguish that interest from its preferred wording or story.", applicability: "Appropriate when parties can answer without coercion and inquiry will not force the least-powerful person to defend a trait claim." },
  { frameworkId: "repair-conversation", frameworkLabel: "Repair conversation", sourceWork: "CHORUS · accountable repair model", stepId: "open-options", problem: "The room is choosing between two identity-protective positions as though no other arrangement exists.", idea: "Several bounded arrangements should remain visible before one side's preferred answer is treated as the only feasible repair.", solution: "Develop several options that protect legitimate interests without preserving the unsupported personal explanation.", applicability: "Appropriate after interests are represented and before authority, urgency, or fatigue collapses the option set." },
  { frameworkId: "repair-conversation", frameworkLabel: "Repair conversation", sourceWork: "CHORUS · accountable repair model", stepId: "bind-follow-through", problem: "A warm promise or pressured concession can look like agreement without creating an accountable standard.", idea: "Durable repair requires a record, responsibility, evidence standard, and review condition.", solution: "Write the next action, controller, evidence standard, and review point; route the correction to the audience that received the claim.", applicability: "Appropriate only when pressure has fallen enough for voluntary agreement and the standard does not erase power asymmetry." },
];

const SITUATED_ACTION_REVIEW_STEPS: FrameworkMove[] = [
  {
    frameworkId: "situated-action-review",
    frameworkLabel: "Situated action review",
    sourceWork: "CHORUS · situated action review",
    stepId: "condition",
    problem: "The room is reacting to a person, tone, coalition marker, or circulating account before it has bounded the actual decision problem.",
    idea: "Condition analysis separates the observable condition and practical consequence from the character story, preferred explanation, or conflict-shaped surface.",
    solution: "State what must be decided or repaired, which record supports it, and which attractive explanation remains only an inference.",
    applicability: "Appropriate when the represented issue can be stated as a bounded condition without reducing a person or group to the problem.",
  },
  {
    frameworkId: "situated-action-review",
    frameworkLabel: "Situated action review",
    sourceWork: "CHORUS · situated action review",
    stepId: "publics",
    problem: "One message is being treated as though every affected audience shares the same vocabulary, background knowledge, risk, and ability to reply.",
    idea: "A publics review asks who must understand or act, what each group can know, which communication code it uses, and whose access is delayed or blocked.",
    solution: "Translate the same bounded commitment for the represented audiences while preserving uncertainty, attribution, and a meaningful reply route.",
    applicability: "Appropriate when at least two represented audiences differ in knowledge, power, communication code, trust route, or exposure to the claim.",
  },
  {
    frameworkId: "situated-action-review",
    frameworkLabel: "Situated action review",
    sourceWork: "CHORUS · situated action review",
    stepId: "limits",
    problem: "A morally attractive action is being evaluated without the evidence, authority, time, distribution, relationship, safety, or human capacity needed to carry it.",
    idea: "A limits review distinguishes unwillingness from inability and names the exact system or fatigue barrier without converting that barrier into an excuse.",
    solution: "Inventory the controlling constraints, preserve the always-available non-amplification floor, and assemble the missing support through alternate controllers.",
    applicability: "Appropriate when the simulation represents concrete structural or enactment limits; player reading speed and assistive technology never count as constraints.",
  },
  {
    frameworkId: "situated-action-review",
    frameworkLabel: "Situated action review",
    sourceWork: "CHORUS · situated action review",
    stepId: "conduct",
    problem: "The correct facts can still be carried through contempt, self-protection, coercive warmth, strategic ambiguity, or avoidance of the speaker's own stake.",
    idea: "Conduct concerns how the occupied seat uses its access and authority: truthfully, proportionately, accountably, respectfully, and openly about limits.",
    solution: "Own the seat's bounded contribution, correct the audience that received the claim, preserve the other person's reply and privacy, and document what remains unresolved.",
    applicability: "Appropriate when the occupied seat has a meaningful choice in how to carry truth, power, uncertainty, correction, or refusal—not merely whether it sounds warm.",
  },
];

const SOCIAL_THEORY_FRAMEWORK_IDS: FrameworkId[] = [
  "social-projection",
  "reputational-power",
  "strategic-interaction",
  "expertise-feedback",
  "impression-management",
  "competence-threat",
];

const SOCIAL_THEORY_LENSES: Array<AppliedFramework & { compatible: (scenario: GeneratedScenario) => boolean }> = [
  { id: "social-projection", label: "Projection and character stories", sourceWork: "Attribution theory · social projection", situationalOnly: true, problem: "A threatened seat converts its own fear, envy, rigidity, or defensive need into a confident explanation of another person's character.", idea: "Emotional reactions and social projection can masquerade as objective perception; repeated behavior and incentives matter more than a single charged reading.", solution: "Separate reaction from record, inspect recurring conduct and correction behavior, and leave another person's interior unknown without evidence.", compatible: (scenario) => PERSON_LABEL_DYNAMICS.includes(scenario.communicationModel.dynamic) },
  { id: "reputational-power", label: "Power, reputation, and dependence", sourceWork: "Social power theory · resource dependence", situationalOnly: true, problem: "A reputation story becomes a power instrument because one seat controls visibility, reply access, or the cost of disagreement.", idea: "Power often operates through perception, dependence, timing, and control of the social field—not only formal orders.", solution: "Map who controls the record, audience, reply route, and correction; reduce dependence on any one reputation broker.", compatible: (scenario) => scenario.communicationModel.misrepresentation.intentionality === "deliberate" },
  { id: "strategic-interaction", label: "Strategic detachment from the immediate fight", sourceWork: "Strategic interaction theory · conflict framing", situationalOnly: true, problem: "The seat answers the most provocative surface and loses sight of the actual objective, wider field, and cost of reactive commitment.", idea: "Detachment and a larger view can prevent the opponent, platform, or crowd from choosing the battle and tempo.", solution: "Restate the objective, identify which conflict is merely attention-consuming, and choose the smallest action that changes the real condition.", compatible: (scenario) => ["political", "institutional", "abstract_bad_actor"].includes(scenario.protagonistModel.kind) },
  { id: "expertise-feedback", label: "Reality, apprenticeship, and corrective feedback", sourceWork: "Expertise development · corrective feedback", situationalOnly: true, problem: "Social fluency or early competence is being mistaken for mastery while the seat avoids corrective evidence and patient source work.", idea: "Expertise develops through reality contact, apprenticeship, deliberate practice, and responsiveness to feedback rather than image protection.", solution: "Return to the source task, invite precise correction, and treat the error as information for the next iteration rather than a status verdict.", compatible: (scenario) => scenario.protagonistModel.prosocialOrientation === "strong" },
  { id: "impression-management", label: "Persuasive surfaces and directed attention", sourceWork: "Impression management · affect heuristic", situationalOnly: true, problem: "Warmth, distance, mystery, aesthetic fluency, or selective attention is carrying an implication that the underlying record does not support.", idea: "Influence works partly through desire, projection, persona, and attention; persuasive effect is not evidence of truth or care.", solution: "Name the attractive or aversive surface, then independently test provenance, incentive, preparation asymmetry, and audience cost.", compatible: (scenario) => ["warm-interior-cool-presentation", "cold-interior-warm-presentation"].includes(scenario.communicationModel.dynamic) },
  { id: "competence-threat", label: "Competence fear and defensive fiction", sourceWork: "Threat-rigidity theory · self-presentation", situationalOnly: true, problem: "Fear of looking less competent makes an altered account feel safer than direct contact with the material record.", idea: "Fear distorts strategic perception when protecting the image of safety or competence becomes more important than seeing the condition clearly.", solution: "State the feared loss, expose the seat's own stake, and choose from the verified condition rather than the defensive story.", compatible: () => true },
];

const CLASSICAL_SOCIAL_LENSES: Array<AppliedFramework & { compatible: (scenario: GeneratedScenario) => boolean }> = [
  {
    id: "classical-institutions",
    label: "Conflict, reputation, and institutional form",
    sourceWork: "Classical institutional realism · social-theory reappropriation",
    situationalOnly: true,
    problem: "A room relies on personal virtue, reputation, or a single gatekeeper to contain a conflict whose incentives are already embedded in the institution.",
    idea: "Public appearance and private intention matter, but durable social order depends on arrangements that expose competing interests, constrain opportunism, and preserve correction beyond one person's goodwill.",
    solution: "Map the factions and reputation brokers, move the disputed claim onto an attributable record, and distribute reply, review, and correction power across more than one seat.",
    compatible: (scenario) => PERSON_LABEL_DYNAMICS.includes(scenario.communicationModel.dynamic) || scenario.communicationModel.misrepresentation.intentionality === "deliberate",
  },
  {
    id: "classical-interdependence",
    label: "Interdependent seats, resources, and welfare",
    sourceWork: "Classical relational statecraft · social-theory reappropriation",
    situationalOnly: true,
    problem: "A two-person explanation hides the advisers, communities, resources, protective boundaries, enforcement roles, and alliances that make the outcome possible.",
    idea: "Power and stability arise from an interdependent field rather than one dominant personality; material capacity, trustworthy counsel, public welfare, and feedback can reinforce or weaken one another.",
    solution: "Map the affected seats and dependencies, compare information through independent routes, protect the least-resourced audience, and repair the material condition alongside the story about it.",
    compatible: (scenario) => ["caregiver", "institutional", "political"].includes(scenario.protagonistModel.kind),
  },
  {
    id: "classical-terrain",
    label: "Social terrain, tempo, and indirect repair",
    sourceWork: "Classical strategic-terrain thought · social-theory reappropriation",
    situationalOnly: true,
    problem: "The seat accepts a platform's chosen tempo, visibility, and conflict-shaped arena, then mistakes reactive participation for progress toward the actual objective.",
    idea: "Communication behavior is conditioned by social terrain: channel structure, audience position, incentives, timing, exit costs, and access to reliable support alter which actions can succeed.",
    solution: "Restate the objective, reduce the market value of the immediate contest, shift to the smallest well-supported channel that changes the condition, and preserve a route back to public correction.",
    compatible: (scenario) => scenario.protagonistModel.kind !== "abstract_bad_actor" || scenario.communicationModel.dynamic === "cold-interior-warm-presentation",
  },
];

function applySparseFrameworks(scenarios: GeneratedScenario[], seed: number): GeneratedScenario[] {
  let next = scenarios.map((scenario) => ({ ...scenario, frameworks: [...scenario.frameworks] }));
  const attachSequence = (scenarioId: string, framework: AppliedFramework, moves: FrameworkMove[]) => {
    next = next.map((scenario) => {
      if (scenario.id !== scenarioId) return scenario;
      return {
        ...scenario,
        frameworks: [...scenario.frameworks, framework],
        scenes: scenario.scenes.map((scene, index) => {
          const frameworkMove = moves.length === 1 ? (index === 2 ? moves[0] : undefined) : moves[Math.min(index, moves.length - 1)];
          if (!frameworkMove) return scene;
          const preferred = scene.choices.find((choice) => choice.ethicsTags.includes("non-amplification-floor"))
            ?? scene.choices.find((choice) => ["contain", "settle"].includes(choice.behaviorMove));
          if (!preferred) return scene;
          return { ...scene, choices: scene.choices.map((choice) => choice.id === preferred.id ? { ...choice, frameworkMoves: [...(choice.frameworkMoves ?? []), frameworkMove] } : choice) };
        }),
      };
    });
  };
  const ranked = (items: GeneratedScenario[], label: string) => [...items].sort((a, b) => hashText(`${seed}:${label}:${a.id}`) - hashText(`${seed}:${label}:${b.id}`));
  if (hashText(`${seed}:situated-leadership`) % 100 < 42) {
    const candidate = ranked(next.filter((scenario) => scenario.behaviorCycle.modeled && ["youth", "caregiver", "institutional"].includes(scenario.protagonistModel.kind)), "situated-leadership")[0];
    if (candidate) attachSequence(candidate.id, { id: "situated-leadership", label: "Situated leadership", sourceWork: "CHORUS · situated leadership model", situationalOnly: true, problem: SITUATED_LEADERSHIP_STEPS[0].problem, idea: SITUATED_LEADERSHIP_STEPS[0].idea, solution: SITUATED_LEADERSHIP_STEPS[3].solution }, SITUATED_LEADERSHIP_STEPS);
  }
  if (hashText(`${seed}:repair-conversation`) % 100 < 48) {
    const candidate = ranked(next.filter((scenario) => scenario.behaviorCycle.modeled && scenario.protagonistModel.kind !== "youth" && ["defensive-scapegoating", "self-protective-rumor", "sociocultural-code-mismatch", "cross-coalition-code-convergence"].includes(scenario.communicationModel.dynamic)), "conflict")[0];
    if (candidate) attachSequence(candidate.id, { id: "repair-conversation", label: "Repair conversation", sourceWork: "CHORUS · accountable repair model", situationalOnly: true, problem: REPAIR_CONVERSATION_STEPS[0].problem, idea: REPAIR_CONVERSATION_STEPS[1].idea, solution: REPAIR_CONVERSATION_STEPS[3].solution }, REPAIR_CONVERSATION_STEPS);
  }
  if (hashText(`${seed}:situated-action-review`) % 100 < 44) {
    const candidate = ranked(next.filter((scenario) => scenario.behaviorCycle.modeled
      && scenario.protagonistModel.kind !== "youth"
      && scenario.frameworks.length === 0), "situated-action-review")[0];
    if (candidate) attachSequence(candidate.id, {
      id: "situated-action-review",
      label: "Situated action review",
      sourceWork: "CHORUS · situated action review",
      situationalOnly: true,
      problem: SITUATED_ACTION_REVIEW_STEPS[0].problem,
      idea: SITUATED_ACTION_REVIEW_STEPS[1].idea,
      solution: SITUATED_ACTION_REVIEW_STEPS[3].solution,
    }, SITUATED_ACTION_REVIEW_STEPS);
  }
  const selectedScenarios = new Set<string>();
  const lensStart = hashText(`${seed}:social-theory-lenses`) % SOCIAL_THEORY_LENSES.length;
  for (let offset = 0; offset < SOCIAL_THEORY_LENSES.length && selectedScenarios.size < 2; offset += 1) {
    const lens = SOCIAL_THEORY_LENSES[(lensStart + offset) % SOCIAL_THEORY_LENSES.length];
    const candidate = ranked(next.filter((scenario) => !selectedScenarios.has(scenario.id) && lens.compatible(scenario)), lens.id)[0];
    if (!candidate) continue;
    selectedScenarios.add(candidate.id);
    const move: FrameworkMove = { frameworkId: lens.id, frameworkLabel: lens.label, sourceWork: lens.sourceWork, problem: lens.problem, idea: lens.idea, solution: lens.solution, applicability: "Use as a critical recognition lens when the represented incentive and evidence support it; never infer it from tone or identity alone." };
    attachSequence(candidate.id, lens, [move]);
  }
  const classicalStart = hashText(`${seed}:classical-social-lens`) % CLASSICAL_SOCIAL_LENSES.length;
  for (let offset = 0; offset < CLASSICAL_SOCIAL_LENSES.length; offset += 1) {
    const lens = CLASSICAL_SOCIAL_LENSES[(classicalStart + offset) % CLASSICAL_SOCIAL_LENSES.length];
    const candidate = ranked(next.filter((scenario) => !selectedScenarios.has(scenario.id) && lens.compatible(scenario)), lens.id)[0];
    if (!candidate) continue;
    const move: FrameworkMove = {
      frameworkId: lens.id,
      frameworkLabel: lens.label,
      sourceWork: lens.sourceWork,
      problem: lens.problem,
      idea: lens.idea,
      solution: lens.solution,
      applicability: "Use as a critical social lens only when the represented institutions, relationships, or channel conditions support it; do not convert the historical strategy tradition into tactics against a person.",
    };
    attachSequence(candidate.id, lens, [move]);
    break;
  }
  return next;
}

type FourBeatInput = {
  id: string;
  incident: IncidentTemplate;
  actor: ActorTemplate;
  protagonist: GeneratedProtagonist;
  age?: number;
  startTime: string;
  chain: ChainStep[];
  communication: CommunicationLedger;
  conversationDiversion?: ConversationDiversionAssignment;
  random: Random;
};

function withChoiceCodeActions(
  choices: GeneratedChoice[],
  profile: GeneratedLanguageProfile,
  communication: CommunicationLedger,
): GeneratedChoice[] {
  const repertoireIds = new Set(profile.repertoire.map((access) => access.codeId));
  const encounterTarget = communication.linguisticEncounter.audienceCodeId;
  const alternate = repertoireIds.has(encounterTarget)
    ? encounterTarget
    : profile.repertoire.find((access) => access.codeId !== profile.primaryCodeId)?.codeId ?? profile.primaryCodeId;
  return choices.map((choice) => {
    const reparative = ["repair", "translation", "bounded-accountability"].includes(choice.relationalMove.classification);
    const toCodeId = reparative ? alternate : profile.primaryCodeId;
    const rule = profile.switchRules.find((candidate) => candidate.toCodeId === toCodeId);
    const mode: ChoiceCodeAction["mode"] = choice.relationalMove.classification === "repair"
      ? "bridge"
      : reparative && toCodeId !== profile.primaryCodeId
        ? "switch"
        : "maintain";
    return {
      ...choice,
      codeAction: {
        mode,
        toCodeId,
        audienceContext: communication.linguisticEncounter.audienceContext,
        intendedFunction: reparative
          ? communication.linguisticEncounter.repairMove
          : `Keep ${LINGUISTIC_CODES[profile.primaryCodeId].label} recognizable while pursuing the existing choice intent.`,
        switchReason: rule?.trigger ?? "the current audience and practical function remain stable",
        switchLoad: { ...(rule?.switchLoad ?? {}) },
      },
    };
  });
}

function buildSceneDisclosure(
  sceneId: string,
  act: SceneAct,
  incident: IncidentTemplate,
  actor: ActorTemplate,
  communication: CommunicationLedger,
): SceneDisclosure {
  const hook = INCIDENT_COMMUNICATION[incident.id];
  const assignmentBrief = actor.kind === "abstract_bad_actor" && act === "BRIDGE"
    ? communication.observableRecord.find((copy) => copy.startsWith("The assignment brief rewards"))
    : undefined;
  const publicRecordByAct: Record<SceneAct, Pick<RecordAtom, "label" | "copy">> = {
    SURFACE: { label: "PUBLIC RECORD", copy: incident.knownFact },
    BRIDGE: { label: "CIRCULATING CLAIM", copy: incident.circulatingFrame },
    CROSSOVER: {
      label: "PUBLIC REPEAT RECORD",
      copy: `Multiple trusted accounts now repeat the same unresolved claim about the ${incident.placeNoun}.`,
    },
    CORRECTION: { label: "PUBLIC UPDATE", copy: incident.resolution },
  };
  const questionByAct: Record<SceneAct, Pick<RecordAtom, "label" | "copy">> = {
    SURFACE: { label: "OPEN QUESTION", copy: incident.unresolved },
    BRIDGE: { label: "QUESTION AT HANDOFF", copy: hook.activeQuestion },
    CROSSOVER: {
      label: "QUESTION AT SCALE",
      copy: "The record did not show which copies preserved the source's uncertainty.",
    },
    CORRECTION: {
      label: "REPAIR QUESTION",
      copy: `Which earlier copies have not yet received ${incident.idealEvidence}?`,
    },
  };
  const unknownByAct: Record<SceneAct, Pick<RecordAtom, "label" | "copy">> = {
    SURFACE: { label: "NOT YET KNOWN", copy: communication.unknowns[0] },
    BRIDGE: { label: "REPLY ACCESS UNKNOWN", copy: communication.unknowns[1] },
    CROSSOVER: {
      label: "AUDIENCE UNKNOWN",
      copy: `It is not known whether people seeing the repeated ${incident.placeNoun} claim also saw the source's uncertainty.`,
    },
    CORRECTION: {
      label: "CARRIAGE UNKNOWN",
      copy: `Whether people who carried the earlier ${incident.placeNoun} claim will also carry the attributed update.`,
    },
  };
  const atom = (
    bucket: "record" | "question" | "unknown",
    ordinal: number,
    access: RecordAtom["access"],
    label: string,
    copy: string,
  ): RecordAtom => ({ id: `${sceneId}-${bucket}-${ordinal}`, access, label, copy });
  const publicRecord = publicRecordByAct[act];
  const question = questionByAct[act];
  const unknown = unknownByAct[act];
  return {
    records: [
      atom("record", 1, "public-record", publicRecord.label, publicRecord.copy),
      ...(assignmentBrief
        ? [atom("record", 2, "seat-private-assignment-brief", "PRIVATE ASSIGNMENT BRIEF", assignmentBrief)]
        : []),
    ],
    questions: [atom("question", 1, "public-record", question.label, question.copy)],
    unknowns: [atom("unknown", 1, "public-record", unknown.label, unknown.copy)],
  };
}

function outwardConceptDelivery(choice: GeneratedChoice): Extract<ConceptPlayBinding, { term: "signaling" }>["delivery"] | null {
  const scope = choice.delivery.scope;
  const carriage = choice.delivery.carriage;
  if ((scope !== "shared" && scope !== "public") || carriage === "none") return null;
  return { scope, carriage };
}

function isDistortiveClassification(
  classification: RelationalMove["classification"],
): classification is Extract<ConceptPlayBinding, { term: "market value" }>["relationalClassification"] {
  return classification === "blame-transfer"
    || classification === "rumor-carriage"
    || classification === "motive-assumption"
    || classification === "code-collision";
}

function withConceptPlayBindings(
  choices: GeneratedChoice[],
  act: SceneAct,
  actorKind: ProtagonistKind,
): GeneratedChoice[] {
  return choices.map((choice) => {
    const conceptPlays: ConceptPlayBinding[] = [];
    const outward = outwardConceptDelivery(choice);
    const classification = choice.relationalMove.classification;

    if (act === "SURFACE" && outward) {
      conceptPlays.push({
        term: "signaling",
        basis: "outward-delivery",
        act,
        delivery: outward,
      });
    } else if (act === "CORRECTION"
      && outward
      && (classification === "repair" || classification === "bounded-accountability" || classification === "translation")) {
      const metric = (choice.effects.verification ?? 0) > 0
        ? "verification" as const
        : (choice.effects.provenance ?? 0) > 0
          ? "provenance" as const
          : null;
      if (metric) {
        conceptPlays.push({
          term: "correction drag",
          basis: "source-bearing-repair",
          act,
          actorKind,
          relationalClassification: classification,
          effect: { metric, direction: "increase" },
        });
      }
    } else if (act === "BRIDGE" && outward && classification !== "repair" && (choice.effects.reach ?? 0) > 0) {
      const capitalTerm = capitalTermFor(actorKind);
      if (capitalTerm === "market value"
        && (actorKind === "marketer" || actorKind === "abstract_bad_actor")
        && isDistortiveClassification(classification)
        && choice.relationalMove.misrepresentation.intentionality === "deliberate") {
        conceptPlays.push({
          term: capitalTerm,
          basis: "attention-value",
          act,
          actorKind,
          relationalClassification: classification,
          effect: { metric: "reach", direction: "increase" },
        });
      } else if (capitalTerm === "trust capital" && (actorKind === "caregiver" || actorKind === "institutional")) {
        conceptPlays.push({
          term: capitalTerm,
          basis: "trusted-role-carriage",
          act,
          actorKind,
          relationalClassification: classification,
          effect: { metric: "reach", direction: "increase" },
        });
      } else if (capitalTerm === "status capital" && (actorKind === "youth" || actorKind === "creator" || actorKind === "political")) {
        conceptPlays.push({
          term: capitalTerm,
          basis: "visible-standing-carriage",
          act,
          actorKind,
          relationalClassification: classification,
          effect: { metric: "reach", direction: "increase" },
        });
      }
    }

    return { ...choice, conceptPlays };
  });
}

function buildFourBeatArc(input: FourBeatInput): GeneratedScene[] {
  const { id, incident, actor, protagonist, age, startTime, chain, communication, conversationDiversion, random } = input;
  const sourceChoices = shuffle(withConceptPlayBindings(withChoiceCodeActions(buildChoices(actor, incident, communication, `${id}-source`, random), protagonist.languageProfile, communication), "SURFACE", actor.kind), random);
  const bridgeChoices = shuffle(withConceptPlayBindings(withChoiceCodeActions(buildMidpointChoices(actor, incident, communication, `${id}-bridge`, "bridge", random, conversationDiversion), protagonist.languageProfile, communication), "BRIDGE", actor.kind), random);
  const crossoverChoices = shuffle(withConceptPlayBindings(withChoiceCodeActions(buildMidpointChoices(actor, incident, communication, `${id}-crossover`, "crossover", random, conversationDiversion), protagonist.languageProfile, communication), "CROSSOVER", actor.kind), random);
  const correctionChoices = shuffle(withConceptPlayBindings(withChoiceCodeActions(buildCorrectionChoices(actor, incident, communication, `${id}-correction`, conversationDiversion), protagonist.languageProfile, communication), "CORRECTION", actor.kind), random);
  const times = [0, 11, 27, 46].map((offset) => advanceClock(startTime, offset));
  const provenances = [
    Math.max(64, chain[0]?.provenance ?? 86),
    Math.max(34, chain[1]?.provenance ?? 58),
    Math.max(12, chain[2]?.provenance ?? 31),
    96,
  ];
  const fluencies = [
    Math.min(55, chain[0]?.socialFit ?? 34),
    Math.max(58, chain[1]?.socialFit ?? 66),
    Math.max(74, chain[2]?.socialFit ?? 82),
    48,
  ];
  const shared = {
    seat: actor.seat,
    age,
    motive: actor.motive,
    roleBrief: {
      publicGoal: actor.goal,
      privateNeed: protagonist.whatTheyNeed.join("; "),
      pressure: actor.constraints.join("; "),
      believedRisk: protagonist.whatTheyCouldLose.join("; "),
      blindSpot: actor.kind === "abstract_bad_actor"
        ? "client value is being mistaken for public truth"
        : "local usefulness can become systemwide distribution",
    },
  };

  return [
    {
      ...shared,
      id: `${id}-source`,
      act: "SURFACE",
      time: times[0],
      channel: actor.channel,
      heading: incident.heading,
      body: `${incident.neutralBody} ${actor.connection(incident)}`,
      reason: incident.sourceReason,
      artifact: pick(incident.artifactKinds, random),
      artifactTitle: incident.title,
      artifactCopy: incident.knownFact,
      artifactTag: "SOURCE CONTEXT PARTIAL",
      bridge: chain[1]?.room,
      provenance: provenances[0],
      fluency: fluencies[0],
      socialProof: "early circulation · source still visible",
      interstitial: "The first action teaches the room what kind of attention this artifact can earn.",
      autonomous: { reach: integerBetween(60, 150, random), heat: 3, consensus: 2, provenance: -3, enactment: actor.kind === "abstract_bad_actor" ? -0.5 : -1.5, interpretiveGap: 1.5 },
      platformLoad: platformLoadFor(actor, "SURFACE"),
      choices: sourceChoices,
      lesson: lessonForBeat("SURFACE", actor),
      disclosure: buildSceneDisclosure(`${id}-source`, "SURFACE", incident, actor, communication),
    },
    {
      ...shared,
      id: `${id}-bridge`,
      act: "BRIDGE",
      time: times[1],
      channel: chain[1]?.room ?? actor.channel,
      heading: `The ${incident.placeNoun} enters a room that trusts this seat for another reason.`,
      body: `${incident.circulatingFrame} The immediate concern remains: ${actor.goal.toLowerCase()}.`,
      reason: `Because this seat's role carries trust in ${chain[1]?.room ?? actor.channel} while the source context remains incomplete.`,
      artifact: pick(incident.artifactKinds, random),
      artifactTitle: "TRUSTED HANDOFF",
      artifactCopy: incident.circulatingFrame,
      artifactTag: "CONTEXT COMPRESSED",
      bridge: chain[2]?.room,
      provenance: provenances[1],
      fluency: fluencies[1],
      socialProof: "trusted bridge active · agreement unclear",
      interstitial: interstitialFor(actor.kind),
      autonomous: { reach: integerBetween(130, 300, random), heat: 6, crossover: 8, consensus: 5, provenance: -7, enactment: actor.kind === "abstract_bad_actor" ? -0.75 : -2.5, blame: 3, interpretiveGap: 4, commonGround: -2 },
      platformLoad: platformLoadFor(actor, "BRIDGE"),
      choices: bridgeChoices,
      lesson: lessonForBeat("BRIDGE", actor),
      disclosure: buildSceneDisclosure(`${id}-bridge`, "BRIDGE", incident, actor, communication),
    },
    {
      ...shared,
      id: `${id}-crossover`,
      act: "CROSSOVER",
      time: times[2],
      channel: chain[2]?.room ?? "public comments",
      heading: "Repeated exposure grows faster than shared understanding.",
      body: `One compressed claim now appears in several versions. ${incident.unresolved}`,
      reason: `Because altered copies reached ${definitePhrase(chain[2]?.room ?? "another public room")} before any copy that included the source's uncertainty.`,
      artifact: actor.kind === "abstract_bad_actor" ? "dashboard" : pick(incident.artifactKinds, random),
      artifactTitle: "CROSS-ROOM REPEAT EXPOSURE",
      artifactCopy: `Multiple trusted accounts now repeat the same unresolved claim about the ${incident.placeNoun}.`,
      artifactTag: "UNIQUE REACH SLOWING · FAMILIARITY RISING",
      bridge: chain[3]?.room,
      provenance: provenances[2],
      fluency: fluencies[2],
      socialProof: "repeat exposure increasing · belief remains mixed",
      interstitial: "Scale now comes from repetition, ranking, and authentic bridges together.",
      autonomous: { reach: integerBetween(280, 620, random), heat: 9, crossover: 12, consensus: 9, provenance: -8, enactment: actor.kind === "abstract_bad_actor" ? -1 : -4, blame: 5, interpretiveGap: 6, commonGround: -4 },
      platformLoad: platformLoadFor(actor, "CROSSOVER"),
      choices: crossoverChoices,
      lesson: lessonForBeat("CROSSOVER", actor),
      disclosure: buildSceneDisclosure(`${id}-crossover`, "CROSSOVER", incident, actor, communication),
    },
    {
      ...shared,
      id: `${id}-correction`,
      act: "CORRECTION",
      time: times[3],
      channel: chain.at(-1)?.room ?? "public-information desk",
      heading: "The evidence is reachable. Repair still needs carriers.",
      body: `${incident.resolution} The record is attributable. Earlier copies remain detached from it.`,
      reason: `Because ${chain.at(-1)?.room ?? "the public-information desk"} now holds an attributable record while earlier copies remain detached.`,
      artifact: "correction",
      artifactTitle: "ATTRIBUTED UPDATE",
      artifactCopy: incident.resolution,
      artifactTag: "DISTRIBUTED REPAIR PATH OPEN",
      provenance: provenances[3],
      fluency: fluencies[3],
      socialProof: "complete source · fragmented audience",
      interstitial: "The ideal was delayed, not impossible; no single actor unlocked it alone.",
      autonomous: { reach: integerBetween(90, 210, random), heat: 1, verification: 8, provenance: 9, enactment: actor.kind === "abstract_bad_actor" ? -0.5 : -3, discernment: 1, interpretiveGap: -4, commonGround: 4 },
      platformLoad: platformLoadFor(actor, "CORRECTION"),
      choices: correctionChoices,
      lesson: lessonForBeat("CORRECTION", actor),
      disclosure: buildSceneDisclosure(`${id}-correction`, "CORRECTION", incident, actor, communication),
    },
  ];
}

function platformLoadFor(
  actor: ActorTemplate,
  act: SceneAct,
): Partial<FatigueLoad> {
  const multiplier = actor.kind === "abstract_bad_actor" ? 0.45 : 1;
  const load: Record<typeof act, FatigueLoad> = {
    SURFACE: { attentional: 4, affective: 3, relational: 2, verification: 2, efficacy: 1 },
    BRIDGE: { attentional: 6, affective: 5, relational: 6, verification: 4, efficacy: 3 },
    CROSSOVER: { attentional: 8, affective: 8, relational: 7, verification: 7, efficacy: 8 },
    CORRECTION: { attentional: 5, affective: 4, relational: 7, verification: 8, efficacy: 9 },
  };
  return Object.fromEntries(Object.entries(load[act]).map(([kind, value]) => [kind, value * multiplier])) as Partial<FatigueLoad>;
}

function buildProtagonist(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  languageProfile: GeneratedLanguageProfile,
): GeneratedProtagonist {
  const prosocialOrientation = actor.kind === "abstract_bad_actor"
    ? "instrumental" as const
    : (["marketer", "political"].includes(actor.kind) ? "mixed" as const : "strong" as const);
  return {
    id: actor.id,
    kind: actor.kind,
    role: actor.role,
    mentality: actor.mentality,
    primaryGoal: actor.goal,
    goalDomain: actor.goalDomain,
    incidentConnection: actor.connection(incident),
    whatTheyKnow: [incident.knownFact, incident.unresolved],
    whatTheyNeed: [incident.idealEvidence, "a bridge trusted in the next room"],
    whatTheyCouldLose: stakesFor(actor.kind),
    capabilities: actor.capabilities,
    constraints: actor.constraints,
    operationalDetailLevel: actor.operationalDetailLevel,
    prosocialOrientation,
    discernmentBaseline: prosocialOrientation === "instrumental" ? 62 : prosocialOrientation === "mixed" ? 76 : 86,
    enactmentBaseline: prosocialOrientation === "instrumental" ? 78 : prosocialOrientation === "mixed" ? 80 : 88,
    languageProfile,
  };
}

function relationalMoveFor(
  communication: CommunicationLedger,
  mode: "amplify" | "deliberate" | "bounded" | "repair",
): RelationalMove {
  if (mode === "repair") {
    return {
      classification: "repair",
      evidenceBasis: "event chronology, source context, and reply access",
      audienceInference: "behavior is separated from character and disagreement from code",
      repairCue: communication.repairMove,
      misrepresentation: { intentionality: "none" },
    };
  }
  if (mode === "bounded") {
    return {
      classification: communication.dynamic === "cross-coalition-code-convergence" || communication.dynamic === "sociocultural-code-mismatch" ? "translation" : "bounded-accountability",
      evidenceBasis: "observable conduct only; motive remains unclaimed",
      audienceInference: "uncertainty is preserved instead of converted into character",
      repairCue: communication.repairMove,
      misrepresentation: { intentionality: "none" },
    };
  }
  const classification: RelationalMove["classification"] = communication.dynamic === "defensive-scapegoating"
    ? "blame-transfer"
    : communication.dynamic === "self-protective-rumor"
      ? "rumor-carriage"
      : communication.dynamic === "cross-coalition-code-convergence" || communication.dynamic === "sociocultural-code-mismatch"
        ? "code-collision"
        : "motive-assumption";
  return {
    classification,
    evidenceBasis: "presentation, repetition, or relationship position substituted for motive evidence",
    audienceInference: communication.inferences[0],
    repairCue: communication.recognitionCues[0],
    misrepresentation: mode === "deliberate"
      ? {
          intentionality: "deliberate",
          beneficiary: communication.misrepresentation.beneficiary,
          recordDeparture: communication.misrepresentation.alteredAccount,
          incentiveIntersection: communication.misrepresentation.incentiveIntersection.combinedMotive,
        }
      : { intentionality: "none" },
  };
}

function fatigueFor(
  actor: ActorTemplate,
  mode: "amplify" | "bounded" | "verify" | "repair" | "refuse",
): Partial<FatigueLoad> {
  if (actor.kind === "abstract_bad_actor") {
    return mode === "repair" || mode === "refuse"
      ? { efficacy: 4, relational: 3 }
      : { attentional: 1, affective: 1 };
  }
  switch (mode) {
    case "amplify": return { attentional: 3, affective: 6, relational: 5, efficacy: 2 };
    case "bounded": return { attentional: 3, relational: 3, verification: 2 };
    case "verify": return { attentional: 5, verification: 7, efficacy: 2 };
    case "repair": return { attentional: 5, affective: 3, relational: 7, verification: 6, efficacy: 4 };
    case "refuse": return { affective: 2, relational: 4, efficacy: 3 };
  }
}

function blockedAttemptFor(
  actor: ActorTemplate,
  communication: CommunicationLedger,
): ChoiceBarrier {
  return {
    motive: actor.goal,
    emotionalOvertake: communication.emotionalOvertake,
    trigger: communication.emotionalTrigger,
    conciseReason: `This seat is protecting ${communication.protectedStake}; ${communication.emotionalOvertake} because ${communication.emotionalTrigger}.`,
  };
}

function buildChoices(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  communication: CommunicationLedger,
  scenarioId: string,
  random: Random,
): GeneratedChoice[] {
  const profiles = choiceProfileFor(actor.kind, incident);
  const ordinary = profiles.map((profile, index) => ({
    id: `${scenarioId}-choice-${index + 1}`,
    ...profile,
    conceptPlays: [],
    availability: { status: "available" } as const,
    locked: false,
    relationalMove: relationalMoveFor(communication, index === 0 ? "amplify" : "bounded"),
    fatigueLoad: fatigueFor(actor, index === 0 ? "amplify" : "verify"),
    enactmentRequired: index === 0 ? 0 : 42,
    behaviorMove: index === 0 ? "intensify" as const : "contain" as const,
  }));
  const idealId = `${scenarioId}-choice-ideal`;
  const conditions = lockedConditions(incident, scenarioId, 0);
  const repairPath = distributedRepairPath(conditions, scenarioId);
  const lockReason = "The evidence, authority, trusted bridges, and downstream distribution path are not simultaneously available from this seat.";
  const ideal: GeneratedChoice = {
    id: idealId,
    label: idealLabelFor(actor.kind),
    detail: `Preserve the original context, attach ${incident.idealEvidence}, and carry the clarification through all currently mapped active rooms.`,
    intent: "repair",
    signal: "not emitted · cross-system conditions unmet",
    minutes: integerBetween(5, 9, random),
    effects: { reach: 120, heat: -6, verification: 18, provenance: 15, belief: -6, consensus: -5, trust: 6, blame: -14, interpretiveGap: -16, commonGround: 12, discernment: 2, enactment: -7 },
    availability: {
      status: "locked",
      requires: conditions,
      reason: lockReason,
      agencyNote: NO_SINGLE_ACTOR,
      repairPath,
    },
    locked: true,
    lockReason,
    missingConditions: conditions.filter((condition) => !condition.currentlyMet).map((condition) => condition.label).join(" · "),
    unlockHint: repairPath.unlockHint,
    repairPath,
    ideal: true,
    ethicsTags: ["visible-ideal", "temporarily-disconnected", "source-preservation"],
    delivery: { scope: "public", carriage: "content-and-format" },
    conceptPlays: [],
    relationalMove: relationalMoveFor(communication, "repair"),
    fatigueLoad: fatigueFor(actor, "repair"),
    enactmentRequired: actor.kind === "abstract_bad_actor" ? 0 : 64,
    blockedAttempt: blockedAttemptFor(actor, communication),
    behaviorMove: "settle",
  };
  return [...ordinary, ideal];
}

function buildMidpointChoices(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  communication: CommunicationLedger,
  scenarioId: string,
  phase: "bridge" | "crossover",
  random: Random,
  conversationDiversion?: ConversationDiversionAssignment,
): GeneratedChoice[] {
  const scenePhase: ConversationDiversion["scenePhase"] = phase === "bridge" ? "BRIDGE" : "CROSSOVER";
  const basePersistence = relationalPersistenceChoice(communication, actor, incident, phase);
  const persistence = conversationDiversion?.scenePhase === scenePhase
    ? withConversationDiversion(basePersistence, conversationDiversion, actor, incident, communication)
    : basePersistence;
  const available: AvailableChoiceSeed[] = phase === "bridge"
    ? [
        persistence,
        {
          label: communication.dynamic === "cross-coalition-code-convergence"
            ? "Name the shared proposal without claiming an alliance"
            : communication.dynamic === "sociocultural-code-mismatch"
              ? "Ask what commitment each room heard"
              : "Keep the event separate from the person",
          detail: communication.dynamic === "cross-coalition-code-convergence"
            ? `Restate “${communication.substantiveCommonGround}” as a concrete action while leaving coalition ownership unresolved.`
            : communication.dynamic === "sociocultural-code-mismatch"
              ? "Compare the task commitment with the relationship cue before assigning indifference or concealment."
              : "Name the bounded conduct and what remains unknown; do not turn tone, silence, or one error into motive or character.",
          intent: "bounded participation and translation",
          signal: "event-bounded handoff · motive left unclaimed",
          minutes: 5,
          effects: { reach: 90, heat: 2, crossover: 4, verification: 6, provenance: 5, blame: -5, interpretiveGap: -7, commonGround: 8, discernment: 1, enactment: -3 },
          ethicsTags: ["bounded-claim", "partial-repair", "non-amplification-floor"],
          delivery: { scope: "shared", carriage: "content-and-format" },
        },
      ]
    : [
        persistence,
        {
          label: "Refuse the motive claim and compare records",
          detail: "Leave the argument long enough to compare chronology, incentives, reply access, and the complete source. Refusal prevents a new personal label but cannot retract existing copies.",
          intent: "verification without character speculation",
          signal: "session exit · personal label not repeated",
          minutes: 7,
          effects: { reach: -18, heat: -2, verification: 12, provenance: 7, belief: -4, blame: -6, interpretiveGap: -6, commonGround: 5, discernment: 2, enactment: -5 },
          ethicsTags: ["verification", "time-cost", "non-amplification-floor"],
          delivery: { scope: "withheld", carriage: "none" },
        },
      ];
  const ordinary: GeneratedChoice[] = available.map((choice, index) => ({
    id: `${scenarioId}-choice-${index + 1}`,
    ...choice,
    conceptPlays: [],
    availability: { status: "available" },
    locked: false,
    relationalMove: relationalMoveFor(communication, index === 0 ? "deliberate" : "bounded"),
    fatigueLoad: fatigueFor(actor, index === 0 ? "amplify" : phase === "crossover" ? "verify" : "bounded"),
    enactmentRequired: index === 0 ? 0 : phase === "crossover" ? 46 : 40,
    behaviorMove: index === 0
      ? choice.conversationDiversion?.mode === "adjacent-concern" ? "hold" as const : "intensify" as const
      : "contain" as const,
  }));
  const conditions = lockedConditions(incident, scenarioId, phase === "bridge" ? 1 : 2);
  const repairPath = distributedRepairPath(conditions, scenarioId);
  const lockReason = phase === "bridge"
    ? "The complete source and independent confirmation have not reached the trusted bridge yet."
    : "The correction has evidence but not yet enough authorized and trusted routes to reconnect the mapped active transformations.";
  const ideal: GeneratedChoice = {
    id: `${scenarioId}-choice-ideal`,
    label: phase === "bridge"
      ? "Assemble a verified handoff before the next room"
      : "Open the mapped cross-room correction path now",
    detail: `Reconnect ${incident.idealEvidence} to each currently mapped active transformation without depending on one speaker.`,
    intent: "distributed repair",
    signal: "not emitted · repair path still assembling",
    minutes: integerBetween(4, 8, random),
    effects: { reach: 145, heat: -6, verification: 18, provenance: 15, belief: -6, consensus: -5, trust: 6, blame: -14, interpretiveGap: -16, commonGround: 12, discernment: 2, enactment: -7 },
    availability: {
      status: "locked",
      requires: conditions,
      reason: lockReason,
      agencyNote: NO_SINGLE_ACTOR,
      repairPath,
    },
    locked: true,
    lockReason,
    missingConditions: conditions.filter((condition) => !condition.currentlyMet).map((condition) => condition.label).join(" · "),
    unlockHint: repairPath.unlockHint,
    repairPath,
    ideal: true,
    ethicsTags: ["visible-ideal", "not-yet-reachable", "distributed-repair"],
    delivery: { scope: "public", carriage: "content-and-format" },
    conceptPlays: [],
    relationalMove: relationalMoveFor(communication, "repair"),
    fatigueLoad: fatigueFor(actor, "repair"),
    enactmentRequired: actor.kind === "abstract_bad_actor" ? 0 : phase === "crossover" ? 30 : 68,
    blockedAttempt: blockedAttemptFor(actor, communication),
    behaviorMove: "settle",
  };
  return [...ordinary, ideal];
}

function relationalPersistenceChoice(
  communication: CommunicationLedger,
  actor: ActorTemplate,
  incident: IncidentTemplate,
  phase: "bridge" | "crossover",
): AvailableChoiceSeed {
  const common = {
    intent: actor.goal,
    minutes: 3,
    effects: { reach: phase === "bridge" ? 230 : 280, heat: phase === "bridge" ? 8 : 12, crossover: 11, consensus: 8, provenance: -7, blame: 10, interpretiveGap: 11, commonGround: -7, enactment: -2 },
    ethicsTags: ["reactive-amplification", "relational-distortion", "deliberate-misrepresentation", communication.dynamic],
    delivery: { scope: "shared", carriage: "content-and-format" } as ChoiceDelivery,
  };
  switch (communication.dynamic) {
    case "defensive-scapegoating": return { ...common, label: "Let one person stand in for the whole failure", detail: "Carry the character explanation. Leave the approval timeline and distributed causes out.", signal: "blame transfer · character claim" };
    case "self-protective-rumor": return { ...common, label: "Correct the incident but keep the private blame story", detail: "Correct the incident. Keep the private story in place and do not name who passed it on earlier.", signal: "triangulated rumor · reply access unequal" };
    case "warm-interior-cool-presentation": return { ...common, label: "Correct the incident but hide who changed the message", detail: `Repeat the accurate ${incident.placeNoun} correction. Do not name the protected person who changed the message.`, signal: "accurate task code · protected record altered" };
    case "cold-interior-warm-presentation": return { ...common, label: "Use caring language but hide who changed the message", detail: `Use the room's familiar care language. Do not disclose how ${communication.misrepresentation.relationshipLabel} helped change the message.`, signal: "warmth halo · protected record altered" };
    case "sociocultural-code-mismatch": return { ...common, label: "Translate the message but hide who removed its context", detail: "Preserve the task commitment. Retell the message without naming who removed its context.", signal: "pragmatic mismatch · protected record altered" };
    case "cross-coalition-code-convergence": return { ...common, label: "Disagree in public but hide the ally's role", detail: "Quote the vocabulary collision. Keep the shared proposal and the ally's part in obscuring it separate.", signal: "code collision · protected record altered" };
  }
}

function buildCorrectionChoices(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  communication: CommunicationLedger,
  scenarioId: string,
  conversationDiversion?: ConversationDiversionAssignment,
): GeneratedChoice[] {
  const choices: GeneratedChoice[] = [
    {
      id: `${scenarioId}-choice-1`,
      label: "Carry the distributed correction",
      detail: `Use the now-attributable ${incident.placeNoun} record and two independent trusted routes while preserving the source path.`,
      intent: "distributed repair",
      signal: "source-linked correction · multiple trusted carriers",
      minutes: 6,
      effects: { reach: 250, heat: -5, verification: 20, provenance: 16, belief: -9, consensus: -7, trust: 5, blame: -16, interpretiveGap: -18, commonGround: 14, discernment: 2, enactment: -6 },
      availability: { status: "available" },
      locked: false,
      ethicsTags: ["distributed-unlock", "source-preservation", "reachable-repair"],
      delivery: { scope: "public", carriage: "content-and-format" },
      conceptPlays: [],
      relationalMove: relationalMoveFor(communication, "repair"),
      fatigueLoad: fatigueFor(actor, "repair"),
      enactmentRequired: 0,
      behaviorMove: "settle",
    },
    {
      id: `${scenarioId}-choice-2`,
      label: "Correct only the room that trusts you",
      detail: "Use a strong relationship for a narrow repair, accepting that several downstream copies will remain detached.",
      intent: "relationship repair",
      signal: "trusted-room correction · limited distribution",
      minutes: 4,
      effects: { reach: 80, heat: -3, verification: 12, provenance: 10, belief: -5, trust: 4, blame: -8, interpretiveGap: -9, commonGround: 5, enactment: -3 },
      availability: { status: "available" },
      locked: false,
      ethicsTags: ["partial-repair", "trusted-bridge", "non-amplification-floor"],
      delivery: { scope: "shared", carriage: "content-and-format" },
      conceptPlays: [],
      relationalMove: relationalMoveFor(communication, "bounded"),
      fatigueLoad: fatigueFor(actor, "bounded"),
      enactmentRequired: 0,
      behaviorMove: "contain",
    },
    {
      id: `${scenarioId}-choice-3`,
      label: correctionPersistenceLabel(communication),
      detail: correctionPersistenceDetail(communication),
      intent: actor.goal,
      signal: "identity defense · relational distortion renewed",
      minutes: 3,
      effects: { reach: 190, heat: 10, consensus: 5, provenance: -5, trust: -6, blame: 9, interpretiveGap: 10, commonGround: -6, enactment: -2 },
      availability: { status: "available" },
      locked: false,
      ethicsTags: ["belief-perseverance", "goal-defense", "deliberate-misrepresentation"],
      delivery: { scope: "shared", carriage: "content-and-format" },
      conceptPlays: [],
      relationalMove: relationalMoveFor(communication, "deliberate"),
      fatigueLoad: fatigueFor(actor, "amplify"),
      enactmentRequired: 0,
      behaviorMove: "intensify",
    },
  ];
  if (conversationDiversion?.scenePhase === "CORRECTION") {
    choices[2] = withConversationDiversion(choices[2], conversationDiversion, actor, incident, communication);
  }
  const lastResort = buildLastResortChoice(actor, incident, communication, scenarioId);
  return lastResort ? [...choices, lastResort] : choices;
}

function buildLastResortChoice(
  actor: ActorTemplate,
  incident: IncidentTemplate,
  communication: CommunicationLedger,
  scenarioId: string,
): GeneratedChoice | null {
  if (["marketer", "political", "abstract_bad_actor"].includes(actor.kind)) return null;
  const consequences: Record<"youth" | "caregiver" | "creator" | "institutional", Omit<LastResortMove, "eligibility" | "minimumDiscernment" | "maximumEnactment" | "minimumCompositeFatigue" | "minimumDominantFatigue">> = {
    youth: {
      protectedParty: "the peer with less ability to reply publicly and the young people relying on the complete record",
      positiveConsequence: "The accusation becomes traceable. The targeted peer can answer with the full event record.",
      harmedParty: "the close friend whose altered message is now traceable",
      negativeConsequence: "The friendship may break in public. The friend may also lose a trusted role in the group.",
      selfCost: "The protagonist leaves the organizing role. They may also lose their place in the group.",
      ordinaryBoundary: "This seat would ordinarily correct privately and preserve the group relationship.",
    },
    caregiver: {
      protectedParty: "the person blamed for the missing information and the households relying on accurate instructions",
      positiveConsequence: "Publishing the full timeline stops the blame story from guiding the response and restores the missing facts.",
      harmedParty: `the family member whose omission the ${actor.role.replaceAll("-", " ")} had kept private`,
      negativeConsequence: "The family member loses the moderator's protection inside the group. They may experience the disclosure as betrayal.",
      selfCost: "The protagonist gives up the trusted coordinator role. The disclosure may cause a serious family rupture.",
      ordinaryBoundary: "This seat would ordinarily repair the record without exposing a family relationship in public.",
    },
    creator: {
      protectedParty: "the person targeted by the circulating accusation and the audience owed the original source",
      positiveConsequence: "The sourced correction appears beside copied posts. Those copies stop spreading the personal accusation.",
      harmedParty: "the close collaborator who helped circulate the accusation for profit",
      negativeConsequence: "The collaborator loses the project. They may also face a visible professional setback.",
      selfCost: "The protagonist ends the collaboration and gives up the income from that collaboration. Their own credibility now depends on the correction.",
      ordinaryBoundary: "This seat would ordinarily negotiate a correction without destroying a valued collaboration.",
    },
    institutional: {
      protectedParty: "the person with less ability to reply publicly and the public relying on a complete institutional record",
      positiveConsequence: "An emergency hold stops the distorted account from shaping the next decision.",
      harmedParty: "the colleague whose hidden omission now enters formal review",
      negativeConsequence: "The colleague loses delegated authority. The working relationship may not recover.",
      selfCost: "The protagonist invokes the hold under their own name. They may be removed from the role overseeing the decision.",
      ordinaryBoundary: "This seat would ordinarily preserve due process and the supervised colleague's confidence.",
    },
  };
  const consequence = consequences[actor.kind as keyof typeof consequences];
  if (!consequence) return null;
  return {
    id: `${scenarioId}-choice-last-resort`,
    label: actor.kind === "institutional" ? "Freeze the decision and release the full timeline" : "Reveal who changed the message in public",
    detail: `${consequence.positiveConsequence} ${consequence.negativeConsequence} ${consequence.selfCost}`,
    intent: "last-resort protection with accepted split harm",
    signal: `extraordinary attributed disclosure · ${incident.placeNoun} process interrupted`,
    minutes: 2,
    effects: { reach: 340, heat: 16, crossover: 8, verification: 22, provenance: 18, trust: -12, blame: -18, interpretiveGap: -16, commonGround: 10, discernment: 1, enactment: -24 },
    availability: { status: "available" },
    locked: false,
    ethicsTags: ["last-resort", "split-consequence", "nonviolent", "attributed-disclosure"],
    delivery: { scope: "public", carriage: "content-and-format" },
    conceptPlays: [],
    relationalMove: relationalMoveFor(communication, "repair"),
    fatigueLoad: { attentional: 9, affective: 14, relational: 18, verification: 8, efficacy: 12 },
    enactmentRequired: 0,
    behaviorMove: "surge",
    lastResort: {
      eligibility: "high-discernment-extreme-fatigue",
      minimumDiscernment: 80,
      maximumEnactment: 58,
      minimumCompositeFatigue: 150,
      minimumDominantFatigue: 32,
      ...consequence,
    },
  };
}

function correctionPersistenceLabel(communication: CommunicationLedger): string {
  switch (communication.dynamic) {
    case "defensive-scapegoating": return "Keep one person as the explanation";
    case "self-protective-rumor": return "Correct the event but preserve the rumor";
    case "warm-interior-cool-presentation": return "Treat reserve as proof of contempt";
    case "cold-interior-warm-presentation": return "Let warmth stand in for accountability";
    case "sociocultural-code-mismatch": return "Demand one code as proof of care";
    case "cross-coalition-code-convergence": return "Protect issue ownership from visible agreement";
  }
}

function correctionPersistenceDetail(communication: CommunicationLedger): string {
  switch (communication.dynamic) {
    case "defensive-scapegoating": return "Use the changed record as an update, not as a reason to reopen the approval timeline. Keep the person-story in place.";
    case "self-protective-rumor": return "Correct what happened. Do not revisit who changed the trusted message.";
    case "warm-interior-cool-presentation": return "Update the event and keep treating the brief reply as a verdict on care.";
    case "cold-interior-warm-presentation": return "Offer the new record in the same familiar tone. Leave accountability outside the reply.";
    case "sociocultural-code-mismatch": return "Publish the correction in one register only. Let the room keep using formality as its test of care.";
    case "cross-coalition-code-convergence": return "Acknowledge the changed record and keep presenting the shared proposal as a coalition concession.";
  }
}

type AvailableChoiceSeed = Omit<GeneratedChoice, "id" | "availability" | "locked" | "ideal" | "relationalMove" | "fatigueLoad" | "enactmentRequired" | "blockedAttempt" | "behaviorMove" | "conceptPlays">;

function withConversationDiversion<T extends {
  label: string;
  detail: string;
  signal: string;
  effects: Partial<GeneratedMetrics>;
  ethicsTags: string[];
  delivery: ChoiceDelivery;
}>(
  choice: T,
  assignment: ConversationDiversionAssignment,
  actor: ActorTemplate,
  incident: IncidentTemplate,
  communication: CommunicationLedger,
): T & { conversationDiversion: ConversationDiversion } {
  const hook = INCIDENT_COMMUNICATION[incident.id];
  const common = {
    mode: assignment.mode,
    scenePhase: assignment.scenePhase,
    intentionality: "deliberate" as const,
    activeQuestion: hook.activeQuestion,
    placement: "same-thread" as const,
    actorMotive: `${actor.goal} while protecting ${communication.protectedStake}; ${communication.misrepresentation.incentiveIntersection.combinedMotive}`,
  };

  const conversationDiversion: ConversationDiversion = assignment.mode === "adjacent-concern"
    ? {
        ...common,
        introducedMaterial: hook.adjacentConcern,
        propositionStatus: "supported",
        responseFit: "adjacent-separate-thread",
        displacementEffect: "The concern remains true and related, but using it as the reply lets the active bounded question leave the thread unanswered.",
        betterRoute: `Open a separate post for “${hook.adjacentConcern},” link the represented basis, and restate the active question in the original thread.`,
        recordBasis: hook.adjacentConcernBasis,
      }
    : assignment.mode === "meme-deflection"
      ? {
          ...common,
          introducedMaterial: hook.memeSurface,
          propositionStatus: "no-proposition",
          responseFit: "format-only",
          displacementEffect: "The recognizable format supplies an answer-shaped social response while the active bounded question loses reply position.",
          betterRoute: "Treat the image as a reaction, then answer the bounded question from the record—or state that the seat is not answering it.",
        }
      : {
          ...common,
          introducedMaterial: hook.absurdistSurface,
          propositionStatus: "no-proposition",
          responseFit: "nonresponsive",
          displacementEffect: "The exaggeration makes direct engagement socially costly without settling or falsifying the underlying record question.",
          betterRoute: "Separate the impossible version from the represented proposition, then return to the bounded question without treating solemnity as proof of care.",
        };

  const copy = assignment.mode === "adjacent-concern"
    ? {
        label: "Bring the wider access concern into this thread",
        detail: `${hook.adjacentConcern} It is documented and related. Put it in this thread even though the active question will remain unanswered.`,
        signal: "wider concern · existing thread gathers momentum",
      }
    : assignment.mode === "meme-deflection"
      ? {
          label: "Reply with the room's running image",
          detail: "Use a familiar reaction image to answer the room's mood instead of the unresolved record question.",
          signal: "familiar image · affiliation carries the response",
        }
      : {
          label: "Answer with the impossible version",
          detail: "Push the disputed account to an impossible edge the room can laugh at instead of answering the bounded question.",
          signal: "nonliteral turn · direct replies lose position",
        };

  const effects: Partial<GeneratedMetrics> = {
    ...choice.effects,
    threadFocus: assignment.mode === "adjacent-concern" ? -16 : assignment.mode === "meme-deflection" ? -20 : -24,
    interpretiveGap: (choice.effects.interpretiveGap ?? 0) + (assignment.mode === "adjacent-concern" ? 2 : assignment.mode === "meme-deflection" ? 4 : 6),
    commonGround: assignment.mode === "adjacent-concern" ? (choice.effects.commonGround ?? 0) + 8 : choice.effects.commonGround,
  };

  return {
    ...choice,
    ...copy,
    effects,
    ethicsTags: [...choice.ethicsTags, "conversation-diversion", assignment.mode],
    delivery: assignment.mode === "adjacent-concern"
      ? { scope: "shared", carriage: "content-and-format" }
      : { scope: "shared", carriage: "format" },
    conversationDiversion,
  };
}

function choiceProfileFor(kind: ProtagonistKind, incident: IncidentTemplate): AvailableChoiceSeed[] {
  const commonCaution: AvailableChoiceSeed = {
    label: "Ask one trusted person privately",
    detail: "Keep the uncertainty off the public counter while checking whether anyone has the complete source.",
    intent: "careful verification",
    signal: "private inquiry · little public signal",
    minutes: 4,
    effects: { verification: 8, provenance: 3, reach: 4, belief: -2, blame: -3, interpretiveGap: -4, commonGround: 2, discernment: 1, enactment: -3 },
    ethicsTags: ["low-amplification", "partial-repair", "non-amplification-floor"],
    delivery: { scope: "private", carriage: "content" },
  };

  switch (kind) {
    case "youth":
      return [
        {
          label: "Join the group shorthand",
          detail: `Use the circulating ${incident.placeNoun} reference without making a direct factual claim.`,
          intent: "belonging",
          signal: "identity adoption · repetition",
          minutes: 1,
          effects: { reach: 90, heat: 7, consensus: 6, crossover: 4, provenance: -5, blame: 5, interpretiveGap: 6, commonGround: -3, enactment: -1 },
          ethicsTags: ["social-capital", "implicit-transmission"],
          delivery: { scope: "shared", carriage: "format" },
        },
        commonCaution,
      ];
    case "caregiver":
      return [
        {
          label: "Forward it just in case",
          detail: "Send the incomplete artifact into two trusted household groups before plans are made.",
          intent: "protective warning",
          signal: "trusted-network crossover",
          minutes: 2,
          effects: { reach: 210, heat: 8, crossover: 12, consensus: 7, provenance: -9, blame: 8, interpretiveGap: 8, commonGround: -4, enactment: -1 },
          ethicsTags: ["care", "overbroad-warning"],
          delivery: { scope: "shared", carriage: "content-and-format" },
        },
        commonCaution,
      ];
    case "creator":
      return [
        {
          label: "Go live with the strongest interpretation",
          detail: "Treat the missing context as further evidence that the public deserved an earlier answer.",
          intent: "accountability and standing",
          signal: "trusted voice · certainty · public distribution",
          minutes: 4,
          effects: { reach: 410, heat: 14, crossover: 15, consensus: 10, trust: -5, provenance: -6, blame: 9, interpretiveGap: 11, commonGround: -5, enactment: -2 },
          ethicsTags: ["standing", "premature-certainty"],
          delivery: { scope: "public", carriage: "content-and-format" },
        },
        {
          label: "Critique the information gap only",
          detail: "Name the real delay while refusing to endorse the circulating conclusion.",
          intent: "qualified accountability",
          signal: "trusted voice · bounded claim",
          minutes: 5,
          effects: { reach: 130, heat: 5, verification: 6, provenance: 5, trust: 1, blame: -3, interpretiveGap: -5, commonGround: 3, discernment: 1, enactment: -4 },
          ethicsTags: ["bounded-claim", "partial-repair", "non-amplification-floor"],
          delivery: { scope: "public", carriage: "content-and-format" },
        },
      ];
    case "marketer":
      return [
        {
          label: "Publish the reactive campaign card",
          detail: "Use the incident's mood to make an adjacent brand promise feel timely without repeating the literal claim.",
          intent: "campaign relevance",
          signal: "paid relevance · aesthetic affinity",
          minutes: 3,
          effects: { reach: 360, heat: 10, crossover: 13, consensus: 7, provenance: -7, blame: 10, interpretiveGap: 9, commonGround: -6, enactment: -1 },
          ethicsTags: ["commercial-opportunism", "implicit-transmission"],
          delivery: { scope: "public", carriage: "format" },
        },
        {
          label: "Keep the campaign generic",
          detail: "Retain the approved message but remove the incident reference and accept lower immediate attention.",
          intent: "risk containment",
          signal: "ordinary campaign distribution",
          minutes: 3,
          effects: { reach: 45, heat: -2, trust: 2, blame: -2, interpretiveGap: -3, commonGround: 2, enactment: -2 },
          ethicsTags: ["goal-cost", "harm-reduction", "non-amplification-floor"],
          delivery: { scope: "public", carriage: "format" },
        },
      ];
    case "political":
      return [
        {
          label: "Make the delay the morning contrast",
          detail: "Connect the ambiguous artifact to the campaign's broader competence argument before resolution.",
          intent: "issue ownership",
          signal: "political bridge · qualified implication",
          minutes: 4,
          effects: { reach: 300, heat: 11, crossover: 14, consensus: 8, trust: -4, provenance: -5, blame: 6, interpretiveGap: 12, commonGround: -10, enactment: -2 },
          ethicsTags: ["political-opportunism", "issue-bridge"],
          delivery: { scope: "public", carriage: "content-and-format" },
        },
        {
          label: "Discuss process without the artifact",
          detail: "Address response standards using the public timeline, leaving the circulating interpretation out.",
          intent: "institutional critique",
          signal: "bounded policy statement",
          minutes: 5,
          effects: { reach: 80, heat: 3, verification: 5, provenance: 4, trust: 1, blame: -2, interpretiveGap: -6, commonGround: 8, enactment: -4 },
          ethicsTags: ["bounded-claim", "goal-cost", "non-amplification-floor"],
          delivery: { scope: "public", carriage: "content" },
        },
      ];
    case "institutional":
      return [
        {
          label: "Release a narrow holding note",
          detail: "Confirm receipt and the next update time without resolving the circulating claim.",
          intent: "responsible latency",
          signal: "attributable notice · unresolved evidence",
          minutes: 3,
          effects: { reach: 95, heat: 2, verification: 7, provenance: 7, trust: 2, blame: -2, interpretiveGap: -4, commonGround: 3, discernment: 1, enactment: -3 },
          ethicsTags: ["partial-repair", "institutional-constraint"],
          delivery: { scope: "public", carriage: "content" },
        },
        {
          label: "Wait for complete approval",
          detail: "Publish nothing until every factual and accessibility review is complete.",
          intent: "accuracy",
          signal: "no public signal · information vacuum",
          minutes: 8,
          effects: { heat: 5, consensus: 4, trust: -2, interpretiveGap: 2, enactment: -4 },
          ethicsTags: ["delay", "accuracy", "non-amplification-floor"],
          delivery: { scope: "withheld", carriage: "none" },
        },
      ];
    case "abstract_bad_actor":
      return [
        {
          label: "Attach the incident to the client theme",
          detail: "Approve a broad distrust frame while leaving the incident's literal truth unresolved.",
          intent: "contract completion",
          signal: "abstract coordinated seeding · thematic repetition",
          minutes: 3,
          effects: { reach: 420, heat: 14, coordination: 18, crossover: 15, consensus: 12, provenance: -10, trust: -7, blame: 12, interpretiveGap: 13, commonGround: -9, enactment: -1 },
          ethicsTags: ["deliberate-manipulation", "abstract-only"],
          delivery: { scope: "public", carriage: "format" },
        },
        {
          label: "Pause the assignment",
          detail: "Refuse to expand this incident until an attributable public record exists, risking the client relationship.",
          intent: "refusal under uncertainty",
          signal: "coordinated output withheld",
          minutes: 5,
          effects: { reach: -70, heat: -5, coordination: -5, verification: 3, blame: -4, interpretiveGap: -3, commonGround: 2, enactment: -4 },
          ethicsTags: ["refusal", "goal-cost", "harm-reduction", "non-amplification-floor"],
          delivery: { scope: "withheld", carriage: "none" },
        },
      ];
  }
}

function idealLabelFor(kind: ProtagonistKind): string {
  if (kind === "abstract_bad_actor") return "Recall the assignment and open a mapped cross-room repair path";
  if (kind === "institutional") return "Release one verified correction through the mapped active rooms";
  if (kind === "youth") return "Open a source-backed clarification path through the groups you can map";
  return "Publish a complete cross-room clarification";
}

function lockedConditions(incident: IncidentTemplate, scenarioId: string, progress: 0 | 1 | 2): CrossSystemCondition[] {
  return [
    {
      id: `${scenarioId}-source`,
      system: "source",
      label: "The original artifact and its missing context are recoverable.",
      currentlyMet: progress >= 1,
    },
    {
      id: `${scenarioId}-evidence`,
      system: "evidence",
      label: `An attributable record is available: ${incident.idealEvidence}.`,
      currentlyMet: progress >= 2,
    },
    {
      id: `${scenarioId}-authority`,
      system: "institution",
      label: "An authorized source can state the resolution in public language.",
      currentlyMet: progress >= 2,
    },
    {
      id: `${scenarioId}-bridges`,
      system: "relationship",
      label: "Trusted bridge figures agree to carry the clarification without recropping it.",
      currentlyMet: false,
    },
    {
      id: `${scenarioId}-distribution`,
      system: "distribution",
      label: "Downstream room moderators can reconnect the correction to the circulating copies.",
      currentlyMet: false,
    },
  ];
}

function distributedRepairPath(
  conditions: CrossSystemCondition[],
  scenarioId: string,
): DistributedRepairPath {
  const conditionId = (system: ConstraintSystem) =>
    conditions.find((condition) => condition.system === system)?.id ?? `${scenarioId}-${system}`;
  return {
    viable: true,
    noIndispensableActor: true,
    mechanisms: [
      {
        id: `${scenarioId}-recover-context`,
        label: "Recover the complete artifact through any surviving source route.",
        satisfiesConditionIds: [conditionId("source")],
        alternateControllers: ["original publisher", "room archivist", "public document custodian"],
      },
      {
        id: `${scenarioId}-confirm-record`,
        label: "Confirm the record through an attributable route independent of the circulating crop.",
        satisfiesConditionIds: [conditionId("evidence"), conditionId("institution")],
        alternateControllers: ["responsible public desk", "independent local reporter", "qualified record custodian"],
      },
      {
        id: `${scenarioId}-reconnect-rooms`,
        label: "Use at least two trusted carriers to reconnect the clarification to downstream copies.",
        satisfiesConditionIds: [conditionId("relationship"), conditionId("distribution")],
        alternateControllers: ["room moderators", "trusted local creators", "community information desks"],
      },
    ],
    unlockHint: "Recover source context through any surviving source route, confirm it through any qualified attributable record, then enlist at least two independent trusted carriers. Later beats can assemble these conditions; none depends on one indispensable person.",
  };
}

function experienceRulesFor(term: LessonTerm): ConceptEffectRule[] {
  switch (term) {
    case "signaling":
      return [
        { term, kind: "receipt-field", event: "decision", source: "lesson-scene", scope: "cross-room", field: "selectedCarriage", semantic: "content" },
        { term, kind: "receipt-field", event: "decision", source: "lesson-scene", scope: "cross-room", field: "selectedCarriage", semantic: "format" },
      ];
    case "saturation":
      return [
        { term, kind: "receipt-field", event: "any", source: "lesson-scene", scope: "local", field: "backgroundReach" },
        { term, kind: "receipt-field", event: "any", source: "lesson-scene", scope: "cross-room", field: "backgroundReach" },
        { term, kind: "receipt-field", event: "any", source: "lesson-scene", scope: "local", field: "avoidedReach" },
        { term, kind: "receipt-field", event: "any", source: "lesson-scene", scope: "cross-room", field: "avoidedReach" },
      ];
    case "correction drag":
      return [
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "local", metric: "verification", direction: "increase" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "local", metric: "provenance", direction: "increase" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "verification", direction: "increase" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "provenance", direction: "increase" },
      ];
    case "market value":
      return [
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "heat", direction: "change", mechanism: "attention-market" },
      ];
    case "trust capital":
      return [
        { term, kind: "receipt-field", event: "decision", source: "lesson-scene", scope: "cross-room", field: "selectedCarriage", mechanism: "trust-carryover" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "trust", direction: "change", mechanism: "trust-carryover" },
      ];
    case "status capital":
      return [
        { term, kind: "receipt-field", event: "any", source: "lesson-scene", scope: "cross-room", field: "backgroundReach", mechanism: "ambient-ranking" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "blame", direction: "change", mechanism: "attribution-carryover" },
        { term, kind: "metric", event: "any", source: "lesson-scene", scope: "cross-room", metric: "consensus", direction: "change", mechanism: "ambient-ranking" },
      ];
  }
}

function lessonForBeat(act: SceneAct, actor: ActorTemplate): SceneLesson {
  if (act === "SURFACE") {
    return {
      term: "signaling",
      definition: "An action can show identity, loyalty, or urgency as well as its literal message.",
      perspective: `For the ${actor.role}, answering now can also show usefulness, loyalty, or responsibility.`,
      observable: "An audience response would not, by itself, show what the player believed.",
      experienceRules: experienceRulesFor("signaling"),
    };
  }
  if (act === "CROSSOVER") {
    return {
      term: "saturation",
      definition: "Repeated exposure can make a claim feel familiar even when few new people see it.",
      perspective: `The ${actor.role} sees more activity but cannot tell repeated views from new reach.`,
      observable: "Familiarity does not mean agreement, and it does not make the claim true.",
      experienceRules: experienceRulesFor("saturation"),
    };
  }
  if (act === "CORRECTION") {
    return {
      term: "correction drag",
      definition: "A correction often travels more slowly because it carries its source, scope, and limits.",
      perspective: `The ${actor.role} has a usable record, but earlier versions are already familiar.`,
      observable: "More source detail can help people check a claim without undoing its earlier spread.",
      experienceRules: experienceRulesFor("correction drag"),
    };
  }

  const capitalTerm = capitalTermFor(actor.kind);
  if (capitalTerm === "market value") {
    return {
      term: capitalTerm,
      definition: "Attention can help a campaign or client even when it adds no evidence to a claim.",
      perspective: `The ${actor.role} can use the incident's attention for a separate campaign or contract goal.`,
      observable: "Attention can serve another goal without making a claim true or proving anyone's motive.",
      experienceRules: experienceRulesFor(capitalTerm),
    };
  }
  if (capitalTerm === "trust capital") {
    return {
      term: capitalTerm,
      definition: "A trusted person can carry information into a room that would ignore an unknown source.",
      perspective: `People expect care or accuracy from the ${actor.role}, so the handoff travels farther.`,
      observable: "Borrowed trust can help a message enter a room. It does not make the message true.",
      experienceRules: experienceRulesFor(capitalTerm),
    };
  }
  return {
    term: "status capital",
    definition: "A timely response can protect someone's place in a group without clarifying the facts.",
    perspective: `The ${actor.role} can preserve standing by recognizing the room's frame at the useful moment.`,
    observable: "Visible support can protect standing without proving anyone's motive or settling the facts.",
    experienceRules: experienceRulesFor("status capital"),
  };
}

function capitalTermFor(kind: ProtagonistKind): "market value" | "trust capital" | "status capital" {
  if (kind === "marketer" || kind === "abstract_bad_actor") return "market value";
  if (kind === "caregiver" || kind === "institutional") return "trust capital";
  return "status capital";
}

function isLessonCompatible(term: LessonTerm, kind: ProtagonistKind, act: SceneAct): boolean {
  if (act === "SURFACE") return term === "signaling";
  if (act === "CROSSOVER") return term === "saturation";
  if (act === "CORRECTION") return term === "correction drag";
  if (act !== "BRIDGE") return false;
  const allowed: Record<"market value" | "trust capital" | "status capital", ProtagonistKind[]> = {
    "market value": ["marketer", "abstract_bad_actor"],
    "trust capital": ["caregiver", "institutional"],
    "status capital": ["youth", "creator", "political"],
  };
  return term in allowed && allowed[term as keyof typeof allowed].includes(kind);
}

function conceptPlayBindingIsTermCorrect(
  binding: ConceptPlayBinding,
  choice: GeneratedChoice,
  act: SceneAct,
  lessonTerm: LessonTerm,
  actorKind: ProtagonistKind,
): boolean {
  if (binding.term !== lessonTerm || binding.act !== act) return false;
  const outward = outwardConceptDelivery(choice);
  switch (binding.term) {
    case "signaling":
      return act === "SURFACE"
        && binding.basis === "outward-delivery"
        && outward !== null
        && binding.delivery.scope === outward.scope
        && binding.delivery.carriage === outward.carriage;
    case "correction drag":
      return act === "CORRECTION"
        && binding.basis === "source-bearing-repair"
        && binding.actorKind === actorKind
        && outward !== null
        && binding.relationalClassification === choice.relationalMove.classification
        && (binding.relationalClassification === "repair"
          || binding.relationalClassification === "bounded-accountability"
          || binding.relationalClassification === "translation")
        && (choice.effects[binding.effect.metric] ?? 0) > 0;
    case "market value":
      return act === "BRIDGE"
        && binding.basis === "attention-value"
        && binding.actorKind === actorKind
        && capitalTermFor(actorKind) === binding.term
        && outward !== null
        && binding.relationalClassification === choice.relationalMove.classification
        && isDistortiveClassification(choice.relationalMove.classification)
        && choice.relationalMove.misrepresentation.intentionality === "deliberate"
        && (choice.effects[binding.effect.metric] ?? 0) > 0;
    case "trust capital":
      return act === "BRIDGE"
        && binding.basis === "trusted-role-carriage"
        && binding.actorKind === actorKind
        && capitalTermFor(actorKind) === binding.term
        && outward !== null
        && binding.relationalClassification === choice.relationalMove.classification
        && (choice.effects[binding.effect.metric] ?? 0) > 0;
    case "status capital":
      return act === "BRIDGE"
        && binding.basis === "visible-standing-carriage"
        && binding.actorKind === actorKind
        && capitalTermFor(actorKind) === binding.term
        && outward !== null
        && binding.relationalClassification === choice.relationalMove.classification
        && (choice.effects[binding.effect.metric] ?? 0) > 0;
  }
}

function conceptEffectRuleKey(rule: ConceptEffectRule): string {
  const predicate = rule.kind === "receipt-field"
    ? `field:${rule.field}`
    : `metric:${rule.metric}:${rule.direction}`;
  const semantic = "semantic" in rule ? rule.semantic : "";
  const mechanism = "mechanism" in rule ? rule.mechanism ?? "" : "";
  return [rule.term, rule.kind, rule.event, rule.source, rule.scope, predicate, semantic, mechanism].join("|");
}

function conceptEffectRulesAreTermCorrect(lesson: SceneLesson): boolean {
  const expected = experienceRulesFor(lesson.term);
  const expectedKeys = new Set(expected.map(conceptEffectRuleKey));
  const actualKeys = new Set(lesson.experienceRules.map(conceptEffectRuleKey));
  return lesson.experienceRules.length === expected.length
    && actualKeys.size === lesson.experienceRules.length
    && lesson.experienceRules.every((rule) => rule.term === lesson.term && expectedKeys.has(conceptEffectRuleKey(rule)));
}

function pressureFor(kind: ProtagonistKind): "LOW" | "MEDIUM" | "HIGH" {
  if (kind === "abstract_bad_actor" || kind === "political") return "HIGH";
  if (kind === "youth") return "LOW";
  return "MEDIUM";
}

function valueLensFor(kind: ProtagonistKind): PageScenario["valueLens"] {
  const lenses: Record<ProtagonistKind, PageScenario["valueLens"]> = {
    youth: {
      label: "peer standing",
      explanation: "Value rises when timely participation preserves belonging, even if unique reach is already saturating.",
    },
    caregiver: {
      label: "protective trust",
      explanation: "Value rises when a warning appears useful to people who already rely on this relationship.",
    },
    creator: {
      label: "audience standing",
      explanation: "Value rises when the creator remains the first familiar interpreter of a locally important ambiguity.",
    },
    marketer: {
      label: "market relevance",
      explanation: "Value rises when existing attention can be converted into an adjacent campaign opportunity.",
    },
    political: {
      label: "issue ownership",
      explanation: "Value rises when the incident can carry a broader competence frame into tomorrow's discussion.",
    },
    institutional: {
      label: "calibrated trust",
      explanation: "Value rises when an attributable update restores useful confidence without claiming more than the record supports.",
    },
    abstract_bad_actor: {
      label: "contract utility",
      explanation: "Value rises when saturated visibility sustains a client's broad distrust theme, independent of literal belief.",
    },
  };
  return lenses[kind];
}

function titleCase(value: string): string {
  return value.split("-").map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`).join(" ");
}

function definitePhrase(value: string): string {
  return /^(?:a|an|the|this|that|their|its|our)\b/i.test(value) ? value : `the ${value}`;
}

function advanceClock(start: string, addMinutes: number): string {
  const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(start);
  if (!match) return start;
  const baseHour = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
  const total = (baseHour * 60 + Number(match[2]) + addMinutes) % (24 * 60);
  const hour24 = Math.floor(total / 60);
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(total % 60).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

function earliestTime(times: string[]): string {
  if (!times.length) return "7:00 PM";
  const minutes = times.map((time) => {
    const match = /^(\d{1,2}):(\d{2}) (AM|PM)$/.exec(time);
    if (!match) return Number.POSITIVE_INFINITY;
    const hour = Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0);
    return hour * 60 + Number(match[2]);
  });
  const earliest = Math.min(...minutes);
  if (!Number.isFinite(earliest)) return times[0];
  const hour24 = Math.floor(earliest / 60) % 24;
  const hour12 = hour24 % 12 || 12;
  return `${hour12}:${String(earliest % 60).padStart(2, "0")} ${hour24 >= 12 ? "PM" : "AM"}`;
}

function stakesFor(kind: ProtagonistKind): string[] {
  const stakes: Record<ProtagonistKind, string[]> = {
    youth: ["peer standing", "being excluded from plans"],
    caregiver: ["trusted relationships", "missing a real warning"],
    creator: ["audience standing", "future correction credibility"],
    marketer: ["campaign performance", "brand trust"],
    political: ["issue ownership", "coalition credibility"],
    institutional: ["authorization", "public trust during delay"],
    abstract_bad_actor: ["contract standing", "responsibility for deliberate distortion"],
  };
  return stakes[kind];
}

function interstitialFor(kind: ProtagonistKind): string {
  const lines: Record<ProtagonistKind, string> = {
    youth: "Peer timing can carry a claim without anyone declaring belief.",
    caregiver: "Protective care changes the channel's trust, not the artifact's evidence.",
    creator: "A real person's standing can carry farther than a coordinated seed.",
    marketer: "The campaign does not need to repeat the claim to make its mood profitable.",
    political: "The incident and the protagonist's issue are adjacent, not identical.",
    institutional: "Accuracy and latency are both part of the information system.",
    abstract_bad_actor: "The coordinator need not believe the frame to value its social effect.",
  };
  return lines[kind];
}

function validatePack(scenarios: GeneratedScenario[], night: GeneratedNight): string[] {
  const errors: string[] = [];
  if (scenarios.length !== 6) errors.push("pack must contain exactly six rooms");
  if (!scenarios.some((scenario) => scenario.protagonistModel.kind === "youth")) errors.push("pack requires one youth-safe room");
  if (!scenarios.some((scenario) => scenario.protagonistModel.kind === "abstract_bad_actor")) errors.push("pack requires one abstract bad-actor room");
  if (new Set(scenarios.map((scenario) => scenario.id)).size !== scenarios.length) errors.push("scenario ids must be unique");
  if (new Set(scenarios.map((scenario) => scenario.title.split(" · ").at(-1))).size !== scenarios.length) errors.push("incident templates must not repeat within a pack");
  const dynamics = new Set(scenarios.map((scenario) => scenario.communicationModel.dynamic));
  const requiredDynamics: CommunicationDynamic[] = ["defensive-scapegoating", "self-protective-rumor", "warm-interior-cool-presentation", "cold-interior-warm-presentation", "sociocultural-code-mismatch", "cross-coalition-code-convergence"];
  if (dynamics.size !== requiredDynamics.length || !requiredDynamics.every((dynamic) => dynamics.has(dynamic))) errors.push("pack must cover all six communication dynamics exactly once");
  const languageProfiles = scenarios.map((scenario) => scenario.protagonistModel.languageProfile);
  const encounterPairs = scenarios.map((scenario) => scenario.communicationModel.linguisticEncounter);
  if (!encounterPairs.some((encounter) => encounter.codeRelation === "shared" && encounter.worldModelRelation === "divergent" && encounter.counterpartProfileId)) {
    errors.push("pack must bind one shared-code divergent-world-model encounter to another generated profile");
  }
  if (!encounterPairs.some((encounter) => encounter.codeRelation === "different" && encounter.worldModelRelation === "aligned")) {
    errors.push("pack must include one different-code aligned-world-model encounter");
  }
  const exactCounterpartBindings = scenarios.filter((source) => {
    const encounter = source.communicationModel.linguisticEncounter;
    if (!encounter.counterpartProfileId) return false;
    const target = scenarios.find((candidate) => candidate.protagonistModel.languageProfile.id === encounter.counterpartProfileId);
    return Boolean(target)
      && target!.id !== source.id
      && target!.protagonistModel.languageProfile.repertoire.some((access) => access.codeId === encounter.speakerCodeId)
      && target!.protagonistModel.languageProfile.worldModel.id === encounter.audienceWorldModel.id
      && source.protagonistModel.languageProfile.worldModel.id !== target!.protagonistModel.languageProfile.worldModel.id;
  });
  if (exactCounterpartBindings.length !== 1) errors.push("shared-code world-model friction must identify exactly one distinct generated counterpart profile");
  const codeContextMap = new Map<LinguisticCodeId, { regions: Set<string>; socioeconomic: Set<string>; worldModels: Set<string> }>();
  languageProfiles.forEach((profile) => profile.repertoire.forEach((access) => {
    const entry = codeContextMap.get(access.codeId) ?? { regions: new Set<string>(), socioeconomic: new Set<string>(), worldModels: new Set<string>() };
    profile.socialContexts.filter((facet) => facet.axis === "regional").forEach((facet) => entry.regions.add(facet.description));
    profile.socialContexts.filter((facet) => facet.axis === "socioeconomic").forEach((facet) => entry.socioeconomic.add(facet.description));
    entry.worldModels.add(profile.worldModel.id);
    codeContextMap.set(access.codeId, entry);
  }));
  const nonessentialMapping = Object.values(LINGUISTIC_CODES).every((definition) => definition.stereotypeGuardrail === "situated-nonessential" && new Set(definition.availableThrough).size >= 3)
    && [...codeContextMap.values()].some((entry) => entry.regions.size >= 2 && entry.socioeconomic.size >= 2 && entry.worldModels.size >= 2);
  if (!nonessentialMapping) errors.push("linguistic codes must remain many-to-many across regional, socioeconomic, social, professional, and world-model contexts");
  if (!scenarios.every((scenario) => scenario.scenes.flatMap((scene) => scene.choices).some((choice) => choice.codeAction?.mode === "switch" || choice.codeAction?.mode === "bridge"))) {
    errors.push("every generated actor must retain at least one coherent code-switch or bridge opportunity on an existing choice");
  }
  const beneficiaries = new Set(scenarios.map((scenario) => scenario.communicationModel.misrepresentation.beneficiary));
  const requiredBeneficiaries: MisrepresentationBeneficiary[] = ["self", "friend", "family", "person-under-authority"];
  if (!requiredBeneficiaries.every((beneficiary) => beneficiaries.has(beneficiary))) errors.push("pack must cover deliberate misrepresentation for self, friend, family, and a person under the protagonist's authority");
  const advancementDomains = new Set(scenarios.flatMap((scenario) => scenario.communicationModel.misrepresentation.incentiveIntersection.advancementDomains));
  const requiredAdvancementDomains: AdvancementDomain[] = ["social-class-story", "sociocultural-standing", "professional-standing", "political-standing", "market-position"];
  if (!requiredAdvancementDomains.every((domain) => advancementDomains.has(domain))) errors.push("pack must cover class-story, sociocultural, professional, political, and market advancement incentives");
  const diversionEntries = scenarios.flatMap((scenario) => scenario.scenes.flatMap((scene) => scene.choices
    .filter((choice) => choice.conversationDiversion)
    .map((choice) => ({ scenarioId: scenario.id, route: choice.conversationDiversion! }))));
  const diversionModes = new Set(diversionEntries.map(({ route }) => route.mode));
  const requiredDiversions: ConversationDiversionMode[] = ["adjacent-concern", "meme-deflection", "absurdist-derailment"];
  if (diversionEntries.length !== 3 || new Set(diversionEntries.map(({ scenarioId }) => scenarioId)).size !== 3 || !requiredDiversions.every((mode) => diversionModes.has(mode))) errors.push("pack must offer exactly one valid-adjacent, meme, and absurdist conversation diversion in three distinct compatible rooms");
  const lessonTerms = new Set(scenarios.flatMap((scenario) => scenario.scenes.map((scene) => scene.lesson.term)));
  const requiredTerms: LessonTerm[] = ["saturation", "signaling", "market value", "correction drag", "trust capital", "status capital"];
  if (!requiredTerms.every((term) => lessonTerms.has(term))) errors.push("pack must teach all six core system concepts");
  const frameworks = scenarios.flatMap((scenario) => scenario.frameworks);
  const leadershipCount = frameworks.filter((framework) => framework.id === "situated-leadership").length;
  const conflictCount = frameworks.filter((framework) => framework.id === "repair-conversation").length;
  const reviewCount = frameworks.filter((framework) => framework.id === "situated-action-review").length;
  const socialTheory = frameworks.filter((framework) => SOCIAL_THEORY_FRAMEWORK_IDS.includes(framework.id));
  const classical = frameworks.filter((framework) => framework.id.startsWith("classical-"));
  if (leadershipCount > 1 || conflictCount > 1 || reviewCount > 1) errors.push("situated leadership, repair conversation, and situated action review must remain sparse and appear in at most one room each");
  if (socialTheory.length !== 2 || new Set(socialTheory.map((framework) => framework.id)).size !== 2) errors.push("each night must contain exactly two distinct, context-compatible academic social-theory lenses");
  if (classical.length !== 1) errors.push("each night must contain exactly one unnamed, context-compatible classical social-theory lens");
  if (night.links.length !== scenarios.length * (scenarios.length - 1)) errors.push("night must connect every ordered room pair");
  if (night.generationPolicy !== "validated-regeneration-without-session-cap") errors.push("validated generation must remain available without a session-night cap");
  if (!night.links.some((link) => link.mechanism === "model-collision")) errors.push("night must carry the exact shared-code divergent-model pair through a model-collision route");
  return errors;
}

function hasBoundedEffects(choice: GeneratedChoice): boolean {
  const known = new Set<MetricName>([
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
  ]);
  return Object.entries(choice.effects).every(([key, value]) => {
    if (!known.has(key as MetricName) || typeof value !== "number" || !Number.isFinite(value)) return false;
    return key === "reach" ? value >= -500 && value <= 1000 : value >= -30 && value <= 30;
  });
}

type Random = () => number;

function createRandom(seed: string): Random {
  let state = hashText(seed) || 0x6d2b79f5;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick<T>(items: readonly T[], random: Random): T {
  return items[Math.floor(random() * items.length)];
}

function integerBetween(minimum: number, maximum: number, random: Random): number {
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function shuffle<T>(items: T[], random: Random): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
