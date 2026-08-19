"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  generateScenarioPack,
  type BehaviorPhase,
  type FatigueKind,
  type GeneratedChoice,
  type GeneratedScenario,
  type GeneratedScenarioPack,
  type ProtagonistKind,
} from "./scenario-generator";
import {
  advanceNightTo,
  applyNightChoice,
  choiceAccess,
  completedRoomCount,
  createNightState,
  enterNightRoom,
  formatNightClock,
  isNightComplete,
  isChoiceVisible,
  isSceneDue,
  roomIncomingEvents,
  roomStartOffset,
  sceneArrivalOffset,
  visibleCrossingCopy,
  type ChoiceAccess,
  type EffectReceipt,
  type NightState,
  type RoomRuntime,
} from "./night-engine";
import { PrivacyPanel } from "./privacy-panel";

type Scenario = GeneratedScenario;
type Choice = GeneratedChoice;
type Drawer = "notes" | "lineage" | "signals" | "privacy" | null;
type BlockedAttempt = { choice: Choice; access: ChoiceAccess } | null;
type ScenePanel = "source" | "seat" | "record" | "echoes";
type DebriefTab = "house" | "choices" | "interpretation" | "crossings" | "fatigue" | "practice" | "heart";
type RelationshipKind = "authority" | "care" | "peer" | "professional" | "political" | "market" | "audience" | "house-effect";
type RelationshipStatus = "trusted" | "accountable" | "dependent" | "contested" | "competitive" | "responsible" | "peripheral" | "active";
type RelationshipProfile = { target: string; label: string; kind: RelationshipKind; status: RelationshipStatus };

const OUTWARD_RELATIONSHIPS: Record<ProtagonistKind, RelationshipProfile[]> = {
  youth: [
    { target: "friends", label: "trusted peer standing", kind: "peer", status: "trusted" },
    { target: "family", label: "plans depend on the update", kind: "care", status: "dependent" },
    { target: "organizers", label: "answerable for what is relayed", kind: "authority", status: "accountable" },
  ],
  caregiver: [
    { target: "family", label: "trusted warning channel", kind: "care", status: "trusted" },
    { target: "households", label: "care responsibility", kind: "care", status: "responsible" },
    { target: "source-desk", label: "dependent on source access", kind: "authority", status: "dependent" },
  ],
  creator: [
    { target: "audience", label: "public trust under review", kind: "audience", status: "contested" },
    { target: "sources", label: "reciprocal source access", kind: "professional", status: "trusted" },
    { target: "sponsors", label: "market reliance", kind: "market", status: "dependent" },
  ],
  marketer: [
    { target: "client", label: "campaign accountability", kind: "market", status: "accountable" },
    { target: "professional-team", label: "standing under competition", kind: "professional", status: "competitive" },
    { target: "audience", label: "indirect public exposure", kind: "audience", status: "peripheral" },
  ],
  political: [
    { target: "coalition", label: "trusted coalition standing", kind: "political", status: "trusted" },
    { target: "constituents", label: "public claim contested", kind: "audience", status: "contested" },
    { target: "other-coalition", label: "competitive issue relation", kind: "political", status: "competitive" },
  ],
  institutional: [
    { target: "approvers", label: "dependent on authorization", kind: "authority", status: "dependent" },
    { target: "public", label: "answerable for the record", kind: "audience", status: "accountable" },
    { target: "source-desk", label: "professional source trust", kind: "professional", status: "trusted" },
  ],
  abstract_bad_actor: [
    { target: "contract-principal", label: "contract dependence", kind: "market", status: "dependent" },
    { target: "production-team", label: "authority over assigned work", kind: "authority", status: "responsible" },
    { target: "audience", label: "aggregate audience exposure", kind: "audience", status: "peripheral" },
  ],
};

const OPENING_SEED = 0x43484f52;
const FATIGUE_COPY: Record<FatigueKind, string> = {
  attentional: "too many competing artifacts and context switches",
  affective: "repeated urgency, outrage, and anticipatory threat",
  relational: "continuous calculation of tone, loyalty, and reply cost",
  verification: "source recovery and comparison across fragmented copies",
  efficacy: "the sense that careful repair cannot catch the moving cascade",
};

export default function Home() {
  const systemMotionOn = useSyncExternalStore(
    subscribeToMotionPreference,
    readMotionPreference,
    () => true,
  );
  const [motionOverride, setMotionOverride] = useState(true);
  const motionOn = systemMotionOn && motionOverride;
  const [filmOn, setFilmOn] = useState(true);
  const [seed, setSeed] = useState(OPENING_SEED);
  const pack = useMemo(() => generateScenarioPack(seed), [seed]);
  const [state, setState] = useState<NightState>(() => createNightState(pack));
  const [introOpen, setIntroOpen] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [relationsOpen, setRelationsOpen] = useState(false);
  const [debriefOpen, setDebriefOpen] = useState(false);
  const [drawer, setDrawer] = useState<Drawer>(null);
  const [blockedAttempt, setBlockedAttempt] = useState<BlockedAttempt>(null);
  const [announcement, setAnnouncement] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const choiceLock = useRef(false);
  const stageRef = useRef<HTMLElement>(null);
  const drawerReturnRef = useRef<string | null>(null);
  const scenarios = pack.scenarios;
  const activeScenario = scenarios.find((scenario) => scenario.id === selectedId) ?? null;
  const activeRoom = activeScenario ? state.rooms[activeScenario.id] : null;
  const houseClock = formatNightClock(pack.night.startTime, state.elapsedMinutes);
  const nightComplete = isNightComplete(state);

  function focusStage(id: string) {
    requestAnimationFrame(() => {
      stageRef.current?.scrollTo({ top: 0, behavior: "auto" });
      document.getElementById(id)?.focus({ preventScroll: true });
    });
  }

  function focusInsideActivePane(id: string, focusId = id) {
    requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (!target) return;
      const owningPane = target.closest<HTMLElement>("[data-scroll-region]");
      const regions = [owningPane, stageRef.current].filter((region, index, all): region is HTMLElement => Boolean(region) && all.indexOf(region) === index);
      for (const region of regions) {
        if (region.scrollHeight <= region.clientHeight + 1) continue;
        const offset = target.getBoundingClientRect().top - region.getBoundingClientRect().top;
        region.scrollTo({ top: Math.max(0, region.scrollTop + offset - 12), behavior: "auto" });
      }
      document.getElementById(focusId)?.focus({ preventScroll: true });
    });
  }

  function enterHouse() {
    setIntroOpen(false);
    setDrawer(null);
    setAnnouncement("The concurrent house is open. Six incidents share one clock.");
    focusStage("house-title");
  }

  function openDrawer(kind: Exclude<Drawer, null>, returnId: string) {
    drawerReturnRef.current = returnId;
    setDrawer(kind);
  }

  function closeDrawer() {
    setDrawer(null);
    window.setTimeout(() => {
      if (drawerReturnRef.current) document.getElementById(drawerReturnRef.current)?.focus({ preventScroll: true });
    }, 0);
  }

  function selectScenario(id: string) {
    const scenario = scenarios.find((item) => item.id === id);
    if (!scenario) return;
    setIntroOpen(false);
    setDebriefOpen(false);
    setRelationsOpen(false);
    const room = state.rooms[id];
    if (room.entered && !room.completed && !isSceneDue(pack, state, id)) {
      setSelectedId(null);
      setBlockedAttempt(null);
      setAnnouncement(scenario.title + " remains in motion. Its next artifact will appear on the switchboard when it arrives.");
      focusStage("house-title");
      return;
    }
    setSelectedId(id);
    setBlockedAttempt(null);
    setAnnouncement(room.entered ? scenario.title + " resumed without resetting the house." : scenario.title + " selected. Earlier crossings remain vague until entry.");
    focusStage(room.entered ? (room.completed ? "closed-title" : "scene-title") : "invitation-title");
  }

  function beginIncident() {
    if (!activeScenario || !activeRoom) return;
    const incoming = roomIncomingEvents(state, activeScenario.id).length;
    setState((current) => enterNightRoom(current, activeScenario.id));
    setBlockedAttempt(null);
    setAnnouncement(activeScenario.title + " entered at " + houseClock + ". " + incoming + " earlier house effects are now attributable where both rooms have been entered.");
    if (isSceneDue(pack, state, activeScenario.id)) {
      focusStage("scene-title");
    } else {
      setSelectedId(null);
      focusStage("house-title");
    }
  }

  function returnToHouse() {
    setSelectedId(null);
    setDebriefOpen(false);
    setRelationsOpen(false);
    setBlockedAttempt(null);
    setAnnouncement("Returned to the house map at " + houseClock + ". No room was reset.");
    focusStage("house-title");
  }

  function openRelations() {
    setIntroOpen(false);
    setDebriefOpen(false);
    setRelationsOpen(true);
    setBlockedAttempt(null);
    setAnnouncement("Outward relationships view opened. Filters do not change the night.");
    focusStage("relations-title");
  }

  function regenerate() {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    const nextSeed = values[0] || ((seed * 1664525 + 1013904223) >>> 0);
    const nextPack = generateScenarioPack(nextSeed);
    setSeed(nextSeed);
    setState(createNightState(nextPack));
    setSelectedId(null);
    setDebriefOpen(false);
    setRelationsOpen(false);
    setBlockedAttempt(null);
    setAnnouncement("A new fictional concurrent night was generated locally.");
    focusStage("house-title");
  }

  function replay() {
    setState(createNightState(pack));
    setSelectedId(null);
    setDebriefOpen(false);
    setRelationsOpen(false);
    setBlockedAttempt(null);
    setAnnouncement("The whole night was rewound. No room was replayed outside its consequences.");
    focusStage("house-title");
  }

  function restoreNight(restored: NightState) {
    setSeed(restored.seed);
    setState(restored);
    setIntroOpen(false);
    setSelectedId(null);
    setDebriefOpen(false);
    setRelationsOpen(false);
    setBlockedAttempt(null);
    setDrawer(null);
    window.setTimeout(() => focusStage("house-title"), 0);
  }

  function advanceClock() {
    const arrival = nextHouseArrival(pack, state);
    if (arrival === undefined) return;
    const next = advanceNightTo(pack, state, arrival);
    setState(next);
    setSelectedId(null);
    setAnnouncement("The shared clock advanced to " + formatNightClock(pack.night.startTime, next.elapsedMinutes) + ". New activity is now visible on the switchboard.");
    focusStage("house-title");
  }

  function attemptChoice(choice: Choice) {
    if (!activeScenario || !activeRoom || activeRoom.completed || transitioning) return;
    const access = choiceAccess(choice, activeRoom);
    if (access.locked) {
      if (blockedAttempt?.choice.id === choice.id) {
        setBlockedAttempt(null);
        setAnnouncement("Unavailable action reason concealed.");
        focusInsideActivePane("choice-" + choice.id);
        return;
      }
      setBlockedAttempt({ choice, access });
      setAnnouncement(blockedReason(choice, access, activeRoom));
      focusInsideActivePane("blocked-choice-receipt-" + choice.id, "choice-" + choice.id);
      return;
    }
    const scene = activeScenario.scenes[activeRoom.sceneIndex];
    if (!scene || !isSceneDue(pack, state, activeScenario.id) || choiceLock.current) return;
    choiceLock.current = true;
    setTransitioning(true);
    setBlockedAttempt(null);
    const next = applyNightChoice(pack, state, activeScenario.id, scene.id, choice.id);
    if (next === state) {
      choiceLock.current = false;
      setTransitioning(false);
      return;
    }
    setState(next);
    const completed = next.rooms[activeScenario.id].completed;
    setAnnouncement(choice.label + " recorded. One local and five cross-room receipts were created.");
    if (completed) {
      focusStage("closed-title");
    } else if (isSceneDue(pack, next, activeScenario.id)) {
      focusStage("scene-title");
    } else {
      setSelectedId(null);
      focusStage("house-title");
    }
    window.setTimeout(() => {
      choiceLock.current = false;
      setTransitioning(false);
    }, motionOn ? 260 : 0);
  }

  return (
    <main className={"site-shell " + (filmOn ? "film-is-on " : "") + (motionOn ? "motion-is-on" : "motion-is-off")}>
      <div className="room-glow" aria-hidden="true" />
      <FilmLayer />
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <div className="site-content" inert={drawer ? true : undefined} aria-hidden={drawer ? true : undefined}>
      <HouseHeader
        clock={houseClock}
        turn={state.turn}
        filmOn={filmOn}
        motionOn={motionOn}
        motionAvailable={systemMotionOn}
        onHome={() => { setIntroOpen(true); setSelectedId(null); setDebriefOpen(false); setRelationsOpen(false); setDrawer(null); }}
        onFilm={() => setFilmOn((current) => !current)}
        onMotion={() => setMotionOverride((current) => !current)}
        onNotes={() => openDrawer("notes", "header-notes")}
        onLineage={() => openDrawer("lineage", "header-lineage")}
        onSignals={() => openDrawer("signals", "header-signals")}
        onPrivacy={() => openDrawer("privacy", "header-privacy")}
        onRelations={openRelations}
        analysisAvailable={nightComplete}
      />
      <div className={"house-workspace" + (introOpen ? " is-intro" : "")}>
        {!introOpen && <RoomRail pack={pack} state={state} activeId={selectedId} relationsOpen={relationsOpen} onSelect={selectScenario} onHouse={returnToHouse} onRelations={openRelations} onDebrief={() => { setDebriefOpen(true); setRelationsOpen(false); setSelectedId(null); focusStage("debrief-title"); }} onAdvance={advanceClock} onRegenerate={regenerate} />}
        <section className="stage-view" ref={stageRef} role="region" aria-labelledby={stageHeadingId(introOpen, debriefOpen, relationsOpen, activeRoom)} tabIndex={0} data-scroll-region="primary">
          {introOpen ? (
            <Prelude onEnter={enterHouse} />
          ) : debriefOpen ? (
            <NightDebrief pack={pack} state={state} onReplay={replay} onHouse={returnToHouse} />
          ) : relationsOpen ? (
            <RelationshipPlot pack={pack} state={state} activeId={selectedId} />
          ) : !activeScenario || !activeRoom ? (
            <HouseMap pack={pack} state={state} />
          ) : !activeRoom.entered ? (
            <Invitation scenario={activeScenario} room={activeRoom} state={state} pack={pack} onBegin={beginIncident} />
          ) : activeRoom.completed ? (
            <RoomClosed scenario={activeScenario} room={activeRoom} state={state} pack={pack} onHouse={returnToHouse} onDebrief={() => { setDebriefOpen(true); setSelectedId(null); }} />
          ) : (
            <SimulationRoom key={`${activeScenario.id}-${activeRoom.sceneIndex}`} scenario={activeScenario} room={activeRoom} state={state} pack={pack} blockedAttempt={blockedAttempt} choicesLocked={transitioning} onChoice={attemptChoice} />
          )}
        </section>
      </div>
      </div>
      {drawer && <HouseDrawer kind={drawer} pack={pack} state={state} scenario={activeScenario} room={activeRoom} analysisAvailable={nightComplete} onRestore={restoreNight} onAnnounce={setAnnouncement} onClose={closeDrawer} />}
    </main>
  );
}

function FilmLayer() {
  return <div className="film-layer" aria-hidden="true"><span className="film-grain" /><span className="film-dust" /><span className="film-scratch" /></div>;
}

function ChorusMark() {
  return <svg className="wordmark-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path className="serpent-outline" d="M54 11 L44 8 L33 14 L21 11 L11 22 L14 34 L9 45 L21 54 L34 50 L48 55" />
    <path className="serpent-green" d="M54 11 L44 8 L33 14 L21 11 L11 22 L14 34 L9 45 L21 54 L34 50 L48 55" />
    <path className="serpent-outline" d="M53 20 L44 14 L34 8 L22 15 L14 28 L9 38 L17 49 L29 56 L41 50 L52 45" />
    <path className="serpent-gold" d="M53 20 L44 14 L34 8 L22 15 L14 28 L9 38 L17 49 L29 56 L41 50 L52 45" />
    <path className="serpent-outline" d="M55 29 L46 24 L38 15 L25 9 L14 18 L9 31 L15 42 L24 51 L37 56 L50 49" />
    <path className="serpent-silver" d="M55 29 L46 24 L38 15 L25 9 L14 18 L9 31 L15 42 L24 51 L37 56 L50 49" />
    <path className="serpent-outline serpent-crossing serpent-weave-over" d="M33 14 L21 11 L11 22" />
    <path className="serpent-green serpent-crossing serpent-weave-over" d="M33 14 L21 11 L11 22" />
    <path className="serpent-outline serpent-crossing serpent-weave-over" d="M9 38 L17 49 L29 56" />
    <path className="serpent-gold serpent-crossing serpent-weave-over" d="M9 38 L17 49 L29 56" />
    <path className="serpent-outline serpent-crossing serpent-weave-over" d="M24 51 L37 56 L50 49" />
    <path className="serpent-silver serpent-crossing serpent-weave-over" d="M24 51 L37 56 L50 49" />
    <polygon className="serpent-head head-green" points="50,7 59,8 61,12 56,16 49,14" />
    <polygon className="serpent-head head-gold" points="49,16 58,17 60,21 55,25 48,22" />
    <polygon className="serpent-head head-silver" points="51,25 60,26 62,30 57,34 50,31" />
    <circle className="serpent-eye" cx="57" cy="10.8" r="1" /><circle className="serpent-eye" cx="56" cy="19.8" r=".9" /><circle className="serpent-eye" cx="58" cy="28.8" r=".9" />
    <path className="serpent-facet facet-green" d="M44 8 L33 14 M11 22 L14 34 M21 54 L34 50" />
    <path className="serpent-facet facet-gold" d="M44 14 L34 8 M14 28 L9 38 M29 56 L41 50" />
    <path className="serpent-facet facet-silver" d="M46 24 L38 15 M9 31 L15 42 M37 56 L50 49" />
  </svg>;
}

function HouseHeader(props: {
  clock: string; turn: number; filmOn: boolean; motionOn: boolean; motionAvailable: boolean;
  onHome: () => void; onFilm: () => void; onMotion: () => void; onNotes: () => void;
  onLineage: () => void; onSignals: () => void; onPrivacy: () => void; onRelations: () => void; analysisAvailable: boolean;
}) {
  return <header className="house-header warm-frame">
    <button className="wordmark" type="button" onClick={props.onHome} aria-label="Open CHORUS introduction"><ChorusMark /><span><strong>CHORUS</strong><small>social trust simulation</small></span></button>
    <div className="house-status"><span className="status-lamp" aria-hidden="true" />HOUSE {props.clock} · TURN {props.turn}/24</div>
    <nav className="header-nav" aria-label="House tools">
      <button id="header-privacy" type="button" onClick={props.onPrivacy}>Privacy</button><button id="header-signals" className="signals-button" type="button" onClick={props.onSignals}>Signals</button><button id="header-relations" className="relations-header-button" type="button" onClick={props.onRelations}>Relations</button><button id="header-lineage" type="button" onClick={props.onLineage}>{props.analysisAvailable ? "Meme trace" : "Trace guide"}</button><button id="header-notes" type="button" onClick={props.onNotes}>{props.analysisAvailable ? "Field notes" : "House guide"}</button>
      <button type="button" aria-pressed={props.filmOn} onClick={props.onFilm}>Film {props.filmOn ? "on" : "off"}</button>
      <button type="button" aria-pressed={props.motionOn} disabled={!props.motionAvailable} onClick={props.onMotion}>Motion {props.motionOn ? "on" : "off"}</button>
    </nav>
  </header>;
}

function Prelude({ onEnter }: { onEnter: () => void }) {
  const dynamics = [
    ["01", "RECORD", "Notice what is present, what arrives later, and what never appears."],
    ["02", "PRESSURE", "Watch where a cost settles when a room needs a quick account."],
    ["03", "SIGNAL", "Tone travels quickly; its meaning may not travel with it."],
    ["04", "TRANSLATION", "The same practical concern can sound unlike itself across rooms."],
    ["05", "REPLY", "Access to answer is uneven, and timing changes what a room can hear."],
    ["06", "LOAD", "A clear path can become harder to carry as the house keeps moving."],
  ];
  return <article className="prelude">
    <div className="prelude-copy"><p className="eyebrow">ONE HOUSE · SIX CONCURRENT ROOMS · TWENTY-FOUR DECISIONS</p><h1 id="prelude-title" tabIndex={-1}>Every feed has a <em>back room.</em></h1><p className="prelude-lede">Enter six fictional seats sharing one clock. Follow the record, notice what each room can and cannot know, and decide what to carry forward.</p><blockquote>The house will not tell you what to conclude. It will keep the receipts.</blockquote><div className="prelude-actions"><button className="primary-action" type="button" onClick={onEnter}>Enter the concurrent night <span>↘</span></button></div></div>
    <div className="prelude-board warm-frame"><header><span>HOUSE LISTENING BOARD</span><strong>FOLLOW THE RECORD</strong></header><div className="prelude-orb" aria-hidden="true"><i /><i /><b /></div><div className="dynamic-grid">{dynamics.map(([number, label, copy]) => <article key={number}><span>{number}</span><strong>{label}</strong><p>{copy}</p></article>)}</div></div>
  </article>;
}

function RoomRail(props: {
  pack: GeneratedScenarioPack; state: NightState; activeId: string | null; onSelect: (id: string) => void;
  relationsOpen: boolean; onHouse: () => void; onRelations: () => void; onDebrief: () => void; onAdvance: () => void; onRegenerate: () => void;
}) {
  const nextOpening = nextHouseArrival(props.pack, props.state);
  return <aside className="room-rail warm-frame" aria-label="Concurrent rooms">
    <div className="rail-heading"><div><button type="button" onClick={props.onHouse} aria-current={!props.activeId && !props.relationsOpen ? "page" : undefined}>MAP</button><button type="button" onClick={props.onRelations} aria-current={props.relationsOpen ? "page" : undefined}>RELATIONS</button></div><span>{completedRoomCount(props.state)}/6 CLOSED</span></div>
    <div className="room-tabs" aria-label="Room selector">{props.pack.scenarios.map((scenario, index) => { const room = props.state.rooms[scenario.id]; const due = !room.completed && isSceneDue(props.pack, props.state, scenario.id); return <button key={scenario.id} type="button" aria-current={!props.relationsOpen && props.activeId === scenario.id ? "page" : undefined} onClick={() => props.onSelect(scenario.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{scenario.title.split(" · ").at(-1)}</strong><small>{room.completed ? "AFTERIMAGE" : room.entered ? (due ? "WAITING ON YOU" : "HOUSE MOVING") : "ENTER ANY TIME"}</small><i>{roomSignal(index)}</i></button>; })}</div>
    <div className="rail-actions">{isNightComplete(props.state) && <button type="button" onClick={props.onDebrief}>Whole-night receipt ↘</button>}{nextOpening !== undefined && <button type="button" onClick={props.onAdvance}>Advance +{nextOpening - props.state.elapsedMinutes}m</button>}<button type="button" onClick={props.onRegenerate}>{props.state.turn ? "Close and regenerate" : "Regenerate night"} ↻</button></div>
  </aside>;
}

function nextHouseArrival(pack: GeneratedScenarioPack, state: NightState): number | undefined {
  return pack.scenarios
    .map((scenario) => {
      const room = state.rooms[scenario.id];
      if (!room || room.completed) return Number.POSITIVE_INFINITY;
      return room.entered
        ? sceneArrivalOffset(pack, scenario.id, room.sceneIndex)
        : roomStartOffset(pack, scenario.id);
    })
    .filter((minute) => Number.isFinite(minute) && minute > state.elapsedMinutes)
    .sort((left, right) => left - right)[0];
}

function HouseMap({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  const impressions = Object.values(state.rooms).reduce((sum, room) => sum + room.metrics.reach, 0);
  return <article className="house-map">
    <header className="stage-heading"><div><p className="eyebrow">HOUSE SWITCHBOARD · {formatNightClock(pack.night.startTime, state.elapsedMinutes)}</p><h2 id="house-title" tabIndex={-1}>Six facts. One social atmosphere.</h2></div><div className="stage-summary"><strong>{formatNumber(impressions)}</strong><span>modeled overlapping impressions</span><small>Every decision leaves one local and five remote receipts.</small></div></header>
    <div className="map-stats"><span><b>{state.turn}/24</b> decisions</span><span><b>{completedRoomCount(state)}/6</b> rooms closed</span><span><b>{Math.round(averageMetric(state, "interpretiveGap"))}%</b> mean interpretation gap</span><span><b>{pack.nightReport.score}%</b> causal coherence</span></div>
    <div className="room-map-grid">{pack.scenarios.map((scenario, index) => { const room = state.rooms[scenario.id]; const firstArrival = roomStartOffset(pack, scenario.id); const incoming = roomIncomingEvents(state, scenario.id); return <article className={"room-map-card warm-frame " + (room.entered ? "is-entered " : "") + (room.completed ? "is-complete" : "")} key={scenario.id}><header><span>ROOM {String(index + 1).padStart(2, "0")}</span><strong>{room.completed ? "AFTERIMAGE LIVE" : firstArrival <= state.elapsedMinutes ? "ARTIFACT PRESENT" : "SEAT OPEN · +" + (firstArrival - state.elapsedMinutes) + "M"}</strong></header><h3>{scenario.title.split(" · ").at(-1)}</h3><p>{scenario.protagonistModel.role}</p><div className="pattern-chip">{roomSignal(index)}</div><small>{incoming.length ? incoming.length + " vague or attributable house effects have reached this room." : "No recorded house crossing yet."}</small></article>; })}</div>
  </article>;
}

type PlotNode = { id: string; label: string; sublabel: string; x: number; y: number; actorId?: string; status: string };
type PlotEdge = RelationshipProfile & { id: string; source: string; sourceLabel: string; targetId: string };

function RelationshipPlot({ pack, state, activeId }: { pack: GeneratedScenarioPack; state: NightState; activeId: string | null }) {
  const [kind, setKind] = useState<"all" | RelationshipKind>("all");
  const [status, setStatus] = useState<"all" | RelationshipStatus>("all");
  const [scope, setScope] = useState<"all" | "entered" | "active">(activeId ? "active" : "all");
  const [query, setQuery] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState(pack.scenarios[0]?.id ?? "");

  const baseEdges: PlotEdge[] = pack.scenarios.flatMap((scenario) => OUTWARD_RELATIONSHIPS[scenario.protagonistModel.kind].map((relationship, index) => ({
    ...relationship,
    id: `${scenario.id}-${relationship.target}-${index}`,
    source: scenario.id,
    sourceLabel: scenario.protagonistModel.role,
    targetId: `out-${relationship.target}`,
  })));
  const enteredIds = new Set(pack.scenarios.filter((scenario) => state.rooms[scenario.id].entered).map((scenario) => scenario.id));
  const effectEdges: PlotEdge[] = state.decisions.flatMap((event) => event.effects.filter((effect) => effect.scope === "cross-room" && enteredIds.has(event.sourceScenarioId) && enteredIds.has(effect.targetScenarioId)).map((effect) => {
    const source = pack.scenarios.find((scenario) => scenario.id === event.sourceScenarioId)!;
    return {
      id: `effect-${event.id}-${effect.targetScenarioId}`,
      source: event.sourceScenarioId,
      sourceLabel: source.protagonistModel.role,
      targetId: effect.targetScenarioId,
      target: effect.targetScenarioId,
      label: "revealed house effect",
      kind: "house-effect" as const,
      status: "active" as const,
    };
  }));
  const allEdges = [...baseEdges, ...effectEdges];
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEdges = allEdges.filter((edge) => {
    const inScope = scope === "all" || (scope === "entered" ? enteredIds.has(edge.source) : activeId ? edge.source === activeId : true);
    const matchesQuery = !normalizedQuery || `${edge.sourceLabel} ${edge.target.replaceAll("-", " ")} ${edge.label} ${edge.kind} ${edge.status}`.toLowerCase().includes(normalizedQuery);
    return inScope && (kind === "all" || edge.kind === kind) && (status === "all" || edge.status === status) && matchesQuery;
  });
  const actorScenarios = pack.scenarios.filter((scenario) => filteredEdges.some((edge) => edge.source === scenario.id || edge.targetId === scenario.id));
  const targetIds = Array.from(new Set(filteredEdges.filter((edge) => edge.targetId.startsWith("out-")).map((edge) => edge.targetId)));
  const actorNodes: PlotNode[] = actorScenarios.map((scenario, index) => ({
    id: scenario.id,
    label: scenario.protagonistModel.role,
    sublabel: scenario.title.split(" · ").at(-1) ?? scenario.code,
    x: 180,
    y: actorScenarios.length === 1 ? 300 : 65 + index * (470 / Math.max(1, actorScenarios.length - 1)),
    actorId: scenario.id,
    status: state.rooms[scenario.id].completed ? "afterimage" : state.rooms[scenario.id].entered ? "entered · in motion" : "seat available",
  }));
  const targetNodes: PlotNode[] = targetIds.map((id, index) => ({
    id,
    label: id.replace(/^out-/, "").replaceAll("-", " "),
    sublabel: "outward relationship",
    x: 820,
    y: targetIds.length === 1 ? 300 : 45 + index * (510 / Math.max(1, targetIds.length - 1)),
    status: Array.from(new Set(filteredEdges.filter((edge) => edge.targetId === id).map((edge) => edge.status))).join(" · "),
  }));
  const nodes = [...actorNodes, ...targetNodes];
  const positions = new Map(nodes.map((node) => [node.id, node]));
  const visibleEdges = filteredEdges.filter((edge) => positions.has(edge.source) && positions.has(edge.targetId));
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? nodes[0] ?? null;
  const selectedEdges = selectedNode ? visibleEdges.filter((edge) => edge.source === selectedNode.id || edge.targetId === selectedNode.id) : [];

  function selectNode(node: PlotNode) {
    setSelectedNodeId(node.id);
  }

  return <article className="relations-view">
    <header className="stage-heading"><div><p className="eyebrow">OUTWARD RELATIONSHIPS · PUBLIC LAYER</p><h2 id="relations-title" tabIndex={-1}>Who this seat answers to, relies on, and reaches.</h2></div><div className="stage-summary"><strong>{visibleEdges.length}</strong><span>visible relationships</span><small>Filters change the view, never the night.</small></div></header>
    <p className="relations-disclosure">This view shows authored outward roles, public status, and already-revealed house effects. Private motives, sealed claims, and unrevealed crossings are excluded.</p>
    <form className="relations-filters" onSubmit={(event) => event.preventDefault()} aria-label="Relationship plot filters">
      <label>Find<span className="sr-only"> a relationship</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="role, status, relation" /></label>
      <label>Scope<select value={scope} onChange={(event) => setScope(event.target.value as typeof scope)}><option value="all">All seats</option><option value="entered">Entered seats</option><option value="active" disabled={!activeId}>Last active seat</option></select></label>
      <label>Relationship<select value={kind} onChange={(event) => setKind(event.target.value as typeof kind)}><option value="all">All kinds</option><option value="authority">Authority</option><option value="care">Care / family</option><option value="peer">Peer</option><option value="professional">Professional</option><option value="political">Political</option><option value="market">Market</option><option value="audience">Audience</option><option value="house-effect">House effect</option></select></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="all">All statuses</option><option value="trusted">Trusted</option><option value="accountable">Accountable</option><option value="dependent">Dependent</option><option value="contested">Contested</option><option value="competitive">Competitive</option><option value="responsible">Responsible</option><option value="peripheral">Peripheral</option><option value="active">Active effect</option></select></label>
    </form>
    <div className="relations-layout">
      <section className="relations-plot warm-frame" aria-labelledby="plot-heading"><h3 id="plot-heading" className="sr-only">Interactive node-link plot</h3>{nodes.length ? <svg viewBox="0 0 1000 600" role="img" aria-label={`${nodes.length} nodes and ${visibleEdges.length} visible relationships. Use the relationship list after the plot for a complete accessible equivalent.`}>
        <g className="graph-edges" aria-hidden="true">{visibleEdges.map((edge) => { const source = positions.get(edge.source)!; const target = positions.get(edge.targetId)!; return <line key={edge.id} x1={source.x} y1={source.y} x2={target.x} y2={target.y} data-kind={edge.kind} />; })}</g>
        <g className="graph-nodes">{nodes.map((node) => <g key={node.id} className={"graph-node " + (selectedNode?.id === node.id ? "is-selected" : "")} role="button" tabIndex={0} aria-label={`${node.label}. ${node.status}`} onClick={() => selectNode(node)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectNode(node); } }} transform={`translate(${node.x} ${node.y})`}><circle r={node.actorId ? 27 : 21} /><text y={node.actorId ? 43 : 36} textAnchor="middle">{node.label.length > 25 ? node.label.slice(0, 24) + "…" : node.label}</text></g>)}</g>
      </svg> : <p className="empty-plot">No relationship matches these filters.</p>}</section>
      <aside className="relations-detail warm-frame" aria-live="polite"><span className="panel-label">SELECTED NODE</span>{selectedNode ? <><h3>{selectedNode.label}</h3><p>{selectedNode.sublabel}</p><strong>{selectedNode.status}</strong><ul>{selectedEdges.map((edge) => <li key={edge.id}><b>{edge.source === selectedNode.id ? "OUTWARD" : "INBOUND"}</b><span>{edge.label}</span><small>{edge.kind.replace("-", " ")} · {edge.status}</small></li>)}</ul></> : <p>Select a node or broaden the filters.</p>}</aside>
    </div>
    <section className="relationship-list" aria-labelledby="relationship-list-title"><h3 id="relationship-list-title">Relationship list</h3><p>Text equivalent of every currently visible edge.</p><div className="relationship-table" role="list">{visibleEdges.map((edge) => <article key={edge.id} role="listitem"><span>{edge.sourceLabel}</span><i aria-hidden="true">→</i><span>{positions.get(edge.targetId)?.label ?? edge.target.replaceAll("-", " ")}</span><small>{edge.kind.replace("-", " ")} · {edge.status} · {edge.label}</small></article>)}</div></section>
  </article>;
}

function Invitation({ scenario, state, pack, onBegin }: { scenario: Scenario; room: RoomRuntime; state: NightState; pack: GeneratedScenarioPack; onBegin: () => void }) {
  const incoming = roomIncomingEvents(state, scenario.id);
  return <article className="invitation">
    <header className="stage-heading"><div><p className="eyebrow">{scenario.code} · HOUSE {formatNightClock(pack.night.startTime, state.elapsedMinutes)}</p><h2 id="invitation-title" tabIndex={-1}>{scenario.title}</h2></div><div className="time-seal" aria-hidden="true">{scenario.startTime.replace(" ", "")}</div></header>
    <div className="invitation-grid is-progressive">
      <section className="brief-panel warm-frame invitation-seat"><span className="panel-label">YOUR SEAT</span><h3>{scenario.protagonistModel.role}</h3><p>{scenario.protagonistModel.mentality}</p><dl><div><dt>Actual objective</dt><dd>{scenario.objective}</dd></div></dl><details><summary>Seat stakes</summary><dl><div><dt>Why this touches your world</dt><dd>{scenario.protagonistModel.incidentConnection}</dd></div><div><dt>What could be lost</dt><dd>{scenario.protagonistModel.whatTheyCouldLose.join(" · ")}</dd></div><div><dt>Content note</dt><dd>{scenario.contentNote}</dd></div></dl></details></section>
      <section className="brief-panel warm-frame invitation-entry-details"><span className="panel-label">BEFORE ENTRY</span><h3>Meaning is still unsettled.</h3><details><summary>Signal conditions</summary><div className="signal-preview"><p><b>Outward form</b>{scenario.communicationModel.presentationTemperature} · {scenario.communicationModel.publicSurfaceCue}</p><p><b>Reply access</b>{scenario.communicationModel.claim?.targetRole ? "Not everyone named can answer at the same time." : "The same words may not carry the same practical expectation in every room."}</p></div></details><details><summary>House pressure <span>{incoming.length}</span></summary>{incoming.length ? <ul className="echo-list">{incoming.slice(-4).map(({ event, effect }) => <li key={event.id}>{visibleCrossingCopy(event, effect, state, pack.scenarios)}</li>)}</ul> : <p>No crossing has reached this room yet.</p>}</details></section>
    </div>
    <div className="invitation-action"><button className="primary-action" type="button" onClick={onBegin}>Enter at {formatNightClock(pack.night.startTime, state.elapsedMinutes)} <span>↘</span></button></div>
  </article>;
}

function SimulationRoom(props: {
  scenario: Scenario; room: RoomRuntime; state: NightState; pack: GeneratedScenarioPack;
  blockedAttempt: BlockedAttempt; choicesLocked: boolean; onChoice: (choice: Choice) => void;
}) {
  const scene = props.scenario.scenes[props.room.sceneIndex];
  const [panel, setPanel] = useState<ScenePanel>("source");
  const due = isSceneDue(props.pack, props.state, props.scenario.id);
  const incoming = roomIncomingEvents(props.state, props.scenario.id);
  const panels: Array<[ScenePanel, string, number | null]> = [
    ["source", "Source", null],
    ["seat", "Seat", null],
    ["record", "Record", null],
    ["echoes", "Echoes", incoming.length],
  ];

  function movePanel(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? panels.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length;
    const nextPanel = panels[nextIndex][0];
    setPanel(nextPanel);
    requestAnimationFrame(() => document.getElementById(`scene-tab-${nextPanel}`)?.focus());
  }

  if (!due) return null;
  return <article className="simulation-view">
    <header className="simulation-heading"><div><p className="eyebrow">{scene.act} · {scene.channel} · {scene.time}</p><h2 id="scene-title" tabIndex={-1}>{scene.heading}</h2></div><ol className="beat-dots" aria-label={"Decision " + (props.room.sceneIndex + 1) + " of 4"}>{props.scenario.scenes.map((item, index) => <li key={item.id} className={index < props.room.sceneIndex ? "complete" : index === props.room.sceneIndex ? "current" : ""}><span>{index + 1}</span><small>{item.act}</small></li>)}</ol></header>
    <div className="simulation-grid">
      <section className="scene-reading-pane artifact-pane warm-frame" aria-label="Scene reading">
        <div className="scene-panel-tabs" role="tablist" aria-label="Scene information">
          {panels.map(([id, label, count], index) => <button key={id} className="scene-panel-tab" id={`scene-tab-${id}`} type="button" role="tab" aria-selected={panel === id} aria-controls={`scene-panel-${id}`} tabIndex={panel === id ? 0 : -1} onClick={() => setPanel(id)} onKeyDown={(event) => movePanel(event, index)}>{label}{count !== null && <span aria-label={`${count} inbound house echoes`}>{count}</span>}</button>)}
        </div>
        <div className="scene-panel-content scene-source-panel pane-scroll" id="scene-panel-source" role="tabpanel" aria-labelledby="scene-tab-source" tabIndex={panel === "source" ? 0 : -1} hidden={panel !== "source"} data-scroll-region="scene-reading" data-scene-panel="source"><PlayArtifact scene={scene} /></div>
        <div className="scene-panel-content scene-seat-panel pane-scroll" id="scene-panel-seat" role="tabpanel" aria-labelledby="scene-tab-seat" tabIndex={panel === "seat" ? 0 : -1} hidden={panel !== "seat"} data-scroll-region="scene-reading" data-scene-panel="seat">
            <span className="panel-label">FROM THIS SEAT</span>
            <div className="seat-summary"><h3>{props.scenario.protagonistModel.role}</h3><p className="why-arrived"><b>WHY THIS ARRIVED</b>{scene.reason}</p><p><b>What this seat is trying to do</b>{props.scenario.objective}</p></div>
            {props.room.behaviorPhase && <div className="play-hint pressure-hint"><span>SEAT PRESSURE</span><p>{behaviorPressureCue(props.room.behaviorPhase)}</p></div>}
        </div>
        <div className="scene-panel-content scene-record-panel pane-scroll" id="scene-panel-record" role="tabpanel" aria-labelledby="scene-tab-record" tabIndex={panel === "record" ? 0 : -1} hidden={panel !== "record"} data-scroll-region="scene-reading" data-scene-panel="record">
            <article><span>IN THE RECORD</span>{scene.communication.observableRecord.map((item) => <p key={item}>{item}</p>)}</article>
            <article><span>ROOM READING</span>{scene.communication.playInferenceHints.map((item) => <p key={item}>{item}</p>)}</article>
            <article><span>NOT YET KNOWN</span>{scene.communication.unknowns.map((item) => <p key={item}>{item}</p>)}</article>
        </div>
        <div className="scene-panel-content scene-echoes-panel pane-scroll" id="scene-panel-echoes" role="tabpanel" aria-labelledby="scene-tab-echoes" tabIndex={panel === "echoes" ? 0 : -1} hidden={panel !== "echoes"} data-scroll-region="scene-reading" data-scene-panel="echoes"><InboundEchoes incoming={incoming} state={props.state} pack={props.pack} variant="panel" /></div>
      </section>
      <section className="choices-pane pane-scroll warm-frame" data-scroll-region="choices">
        <header><span className="panel-label">WHAT HAPPENS FROM THIS SEAT?</span></header>
        <div className="choice-list">{scene.choices.filter((choice) => isChoiceVisible(choice, props.room)).map((choice, index) => {
          const access = choiceAccess(choice, props.room);
          const expanded = Boolean(access.locked && props.blockedAttempt?.choice.id === choice.id);
          const receiptId = `blocked-choice-receipt-${choice.id}`;
          return <article key={choice.id} className={`choice-shell choice-row${expanded ? " is-expanded" : ""}`} data-choice-id={choice.id}>
            <button id={`choice-${choice.id}`} type="button" className={"choice " + (access.locked ? "is-locked " : "") + (access.assembledElsewhere ? "is-assembled " : "") + (choice.lastResort ? "is-last-resort " : "") + (choice.ethicsTags.includes("non-amplification-floor") ? "is-floor" : "")} disabled={props.choicesLocked} aria-disabled={props.choicesLocked} aria-label={access.locked ? choice.label + (expanded ? ". Reason open; activate again to close." : ". Currently unavailable; activate for the reason.") : undefined} aria-expanded={access.locked ? expanded : undefined} aria-controls={access.locked ? receiptId : undefined} aria-describedby={expanded ? `${receiptId}-copy` : undefined} onClick={() => props.onChoice(choice)}><span className="choice-index">{String(index + 1).padStart(2, "0")}</span><span className="choice-copy">{choice.lastResort && <em>EXTREME LOAD · LAST RESORT</em>}<strong>{choice.label}</strong><small>{choice.detail}</small><i>{choice.lastResort ? "Clarity intact · split protection and harm" : `${choice.minutes} modeled min`}</i></span><span className="choice-state">{access.locked ? (expanded ? "REASON OPEN ↑" : "WHY UNAVAILABLE →") : access.assembledElsewhere ? "PATH BUILT →" : "CHOOSE →"}</span></button>
            {expanded && props.blockedAttempt && <BlockedReceipt id={receiptId} attempt={props.blockedAttempt} room={props.room} />}
          </article>;
        })}</div>
      </section>
    </div>
  </article>;
}

function BlockedReceipt({ id, attempt, room }: { id: string; attempt: NonNullable<BlockedAttempt>; room: RoomRuntime }) {
  const dominant = dominantFatigue(room);
  const barrier = attempt.choice.blockedAttempt;
  const structural = attempt.access.unmet.length ? ` Needs ${attempt.access.unmet.join(" · ")}.` : "";
  const capacity = attempt.access.willDepleted ? ` Follow-through ${Math.round(attempt.access.enactmentAvailable)}/${attempt.access.enactmentRequired}.` : "";
  return <aside className="choice-blocked-detail blocked-receipt" id={id} role="status"><div className="blocked-copy" id={`${id}-copy`}><strong><span>Motive</span>{barrier?.motive ?? attempt.choice.lockReason}</strong><p><span>Pressure</span>{barrier ? `${barrier.emotionalOvertake}; ${barrier.trigger}.` : attempt.choice.lockReason}</p><small>{dominant.label} load is highest.{structural}{capacity}</small></div></aside>;
}

function InboundEchoes({ incoming, state, pack, variant = "disclosure" }: { incoming: ReturnType<typeof roomIncomingEvents>; state: NightState; pack: GeneratedScenarioPack; variant?: "disclosure" | "panel" }) {
  const content = incoming.length ? <ol>{(variant === "panel" ? [...incoming].reverse() : incoming.slice(-5).reverse()).map(({ event, effect }) => <li key={event.id}><span>{event.kind === "choice" ? "CHOICE" : "AUTONOMOUS"} · +{event.atMinute}m</span><p>{visibleCrossingCopy(event, effect, state, pack.scenarios)}</p><small>{effectSummary(effect)}</small></li>)}</ol> : <p>No other room has registered here yet.</p>;
  if (variant === "panel") return <section className="inbound-echoes is-panel" aria-labelledby="echoes-panel-title"><h3 id="echoes-panel-title">Inbound house echoes <span>{incoming.length}</span></h3>{content}</section>;
  return <details className="inbound-echoes"><summary>Inbound house echoes <span>{incoming.length}</span></summary>{content}</details>;
}

function PlayArtifact({ scene }: { scene: Scenario["scenes"][number] }) {
  return <div className={"play-artifact artifact-" + scene.artifact} style={{ "--fluency": scene.fluency / 100 } as React.CSSProperties}><TraceFrame provenance={scene.provenance} /><header><span>{scene.socialProof}</span><span>TRACE {scene.provenance}% · FIT {scene.fluency}%</span></header><div className="artifact-body"><span>{scene.artifactTag}</span><strong>{scene.artifactTitle}</strong><p>{scene.artifactCopy}</p><small>{scene.channel} · {scene.time}</small></div></div>;
}

function TraceFrame({ provenance }: { provenance: number }) {
  const top = Math.min(100, provenance * 1.35);
  const right = Math.max(0, Math.min(100, (provenance - 18) * 1.4));
  const bottom = Math.max(0, Math.min(100, (provenance - 38) * 1.7));
  const left = Math.max(0, Math.min(100, (provenance - 62) * 2.7));
  return <span className="trace-frame" aria-hidden="true"><i style={{ width: top + "%" }} /><i style={{ height: right + "%" }} /><i style={{ width: bottom + "%" }} /><i style={{ height: left + "%" }} /></span>;
}

function ContextRail({ state, scenario, room }: { pack: GeneratedScenarioPack; state: NightState; scenario: Scenario | null; room: RoomRuntime | null }) {
  const liveRoom = scenario && room ? room : null;
  const metrics = liveRoom ?? aggregateRoom(state);
  const fatigue = liveRoom?.fatigue ?? aggregateFatigue(state);
  return <aside className="context-rail live-signals-glass" aria-label="Live house signals">
    <header><span className="status-lamp" />{liveRoom ? "SEAT SIGNAL" : "HOUSE SIGNAL"}</header>
    <Metric label="Reach" value={Math.min(100, Math.log10(metrics.metrics.reach + 1) * 24)} display={formatNumber(metrics.metrics.reach)} /><Metric label="Pressure transfer" value={metrics.metrics.blame} display={Math.round(metrics.metrics.blame) + "%"} /><Metric label="Reading gap" value={metrics.metrics.interpretiveGap} display={Math.round(metrics.metrics.interpretiveGap) + "%"} /><Metric label="Overlap visible" value={metrics.metrics.commonGround} display={Math.round(metrics.metrics.commonGround) + "%"} tone="mint" />
    <div className="capacity-ledger"><span>CLARITY / CARRYING POWER</span><div role="progressbar" aria-label="Clarity" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(metrics.metrics.discernment)}><b aria-hidden="true" style={{ width: metrics.metrics.discernment + "%" }} /><strong>{Math.round(metrics.metrics.discernment)}</strong></div><div role="progressbar" aria-label="Carrying power" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(metrics.metrics.enactment)}><b aria-hidden="true" style={{ width: metrics.metrics.enactment + "%" }} /><strong>{Math.round(metrics.metrics.enactment)}</strong></div><small>Only modeled house time changes these values. Reading speed and assistive technology do not.</small></div>
    <div className="fatigue-ledger"><span>SEAT LOAD</span>{(Object.keys(FATIGUE_COPY) as FatigueKind[]).map((kind) => <div key={kind}><label>{fatigueHint(kind)}</label><i role="progressbar" aria-label={fatigueHint(kind) + " load"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(fatigue[kind])}><b aria-hidden="true" style={{ width: fatigue[kind] + "%" }} /></i><strong>{Math.round(fatigue[kind])}</strong></div>)}</div>
    {scenario && <div className="context-pattern"><span>HOUSE HINT</span><strong>Keep the layers separate.</strong><p>{scenario.communicationModel.unknowns[0]}</p></div>}
    <small className="surface-note">A polished or terse surface can guide attention. It cannot settle the record.</small>
  </aside>;
}

function Metric({ label, value, display, tone = "amber" }: { label: string; value: number; display: string; tone?: "amber" | "mint" }) {
  return <div className="metric"><div><span>{label}</span><strong>{display}</strong></div><i role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(clamp(value, 0, 100))}><b aria-hidden="true" className={tone} style={{ width: clamp(value, 1, 100) + "%" }} /></i></div>;
}

function RoomClosed({ scenario, room, state, pack, onHouse, onDebrief }: { scenario: Scenario; room: RoomRuntime; state: NightState; pack: GeneratedScenarioPack; onHouse: () => void; onDebrief: () => void }) {
  const snapshot = room.atCompletion ?? room.metrics;
  const incoming = roomIncomingEvents(state, scenario.id);
  return <article className="closed-view">
    <header className="stage-heading"><div><p className="eyebrow">INTERIM RECEIPT · {scenario.code}</p><h2 id="closed-title" tabIndex={-1}>This seat is finished. The room is not.</h2></div><div className="debrief-actions"><button className="rail-fallback-action" type="button" onClick={onHouse}>House map <span aria-hidden="true">→</span></button>{isNightComplete(state) && <button className="rail-fallback-action" type="button" onClick={onDebrief}>Whole-night receipt <span aria-hidden="true">↘</span></button>}</div></header>
    <div className="closed-grid"><article><span>AT CLOSE</span><strong>{formatNumber(snapshot.reach)}</strong><small>modeled impressions</small></article><article><span>AFTERIMAGE</span><strong>+{formatNumber(Math.max(0, room.metrics.reach - snapshot.reach))}</strong><small>later impressions</small></article><article><span>BLAME</span><strong>{Math.round(room.metrics.blame)}%</strong><small>concentration</small></article><article><span>FOLLOW-THROUGH</span><strong>{Math.round(room.metrics.enactment)}</strong><small>discernment remains {Math.round(room.metrics.discernment)}</small></article></div>
    <section className="closed-interpretation warm-frame"><span className="panel-label">ROOM RECEIPT · INTERPRETATION WITHHELD</span><h3>What did this room know, assume, and leave unresolved?</h3><div><p><b>In the record</b>{scenario.communicationModel.observableRecord.join(" ")}</p><p><b>Room reading</b>{scenario.communicationModel.playInferenceHints.join(" ")}</p><p><b>Not resolved</b>{scenario.communicationModel.unknowns.join(" ")}</p></div><small>The whole-night receipt will name the pattern after every seat is complete.</small></section>
    <InboundEchoes incoming={incoming} state={state} pack={pack} />
  </article>;
}

function NightDebrief({ pack, state, onReplay, onHouse }: { pack: GeneratedScenarioPack; state: NightState; onReplay: () => void; onHouse: () => void }) {
  const [tab, setTab] = useState<DebriefTab>("house");
  const tabs: Array<[DebriefTab, string]> = [["house", "House"], ["choices", "Choices"], ["interpretation", "Interpretation"], ["crossings", "Crossings"], ["fatigue", "Fatigue"], ["practice", "Practice"], ["heart", "The heart"]];
  return <article className="debrief-view">
    <header className="debrief-header"><div><p className="eyebrow">WHOLE-NIGHT CAUSAL RECEIPT · {state.turn} DECISIONS</p><h2 id="debrief-title" tabIndex={-1}>The chorus was never six separate stories.</h2></div><div className="debrief-actions"><button className="rail-fallback-action" type="button" onClick={onHouse}>House map <span aria-hidden="true">→</span></button><button type="button" onClick={onReplay}>Replay whole night ↻</button></div></header>
    <div className="debrief-tabs" role="tablist" aria-label="Whole-night receipt">{tabs.map(([id, label], index) => <button key={id} type="button" role="tab" id={"tab-" + id} aria-controls={"panel-" + id} aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => setTab(id)} onKeyDown={(event) => { if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return; event.preventDefault(); const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length; setTab(tabs[nextIndex][0]); requestAnimationFrame(() => document.getElementById("tab-" + tabs[nextIndex][0])?.focus()); }}>{label}</button>)}</div>
    <section className="debrief-panel pane-scroll" role="tabpanel" id={"panel-" + tab} aria-labelledby={"tab-" + tab} tabIndex={0} data-scroll-region="debrief">{tab === "house" && <HouseReceipt pack={pack} state={state} />}{tab === "choices" && <ChoiceReceipt pack={pack} state={state} />}{tab === "interpretation" && <InterpretationReceipt pack={pack} state={state} />}{tab === "crossings" && <CrossingReceipt pack={pack} state={state} />}{tab === "fatigue" && <FatigueReceipt pack={pack} state={state} />}{tab === "practice" && <PracticeReceipt pack={pack} state={state} />}{tab === "heart" && <HeartReceipt pack={pack} />}</section>
  </article>;
}

function HouseReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  const impressions = Object.values(state.rooms).reduce((sum, room) => sum + room.metrics.reach, 0);
  return <div className="receipt-layout"><div className="receipt-hero warm-frame"><span>MODELED OVERLAPPING IMPRESSIONS</span><strong>{formatNumber(impressions)}</strong><p>{state.decisions.length * 5} cross-room decision receipts plus {state.ambientEvents.length} once-only scheduled pulses.</p></div><div className="receipt-metrics">{["blame", "interpretiveGap", "commonGround", "threadFocus", "discernment", "enactment"].map((metric) => <article key={metric}><span>{metricDisplay(metric)}</span><strong>{Math.round(averageMetric(state, metric as keyof RoomRuntime["metrics"]))}%</strong></article>)}</div><div className="truth-ledgers">{pack.scenarios.map((scenario) => <article key={scenario.id}><span>{scenario.code}</span><strong>{scenario.groundTruth}</strong><small>Seat objective: {scenario.objective}</small></article>)}</div></div>;
}

function ChoiceReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  const offered = pack.scenarios.flatMap((scenario) => scenario.scenes.flatMap((scene) => scene.choices.filter((choice) => choice.conversationDiversion)));
  const taken = state.decisions.filter((event) => event.conversationDiversion);
  return <div className="choice-receipt"><details className="conversation-routes"><summary><span>Conversation routes</span><strong>{taken.length} taken · {offered.length} offered</strong></summary><div className="conversation-routes-body"><p>A moved question is not automatically a lie. Classification here follows the represented function, timing, and still-unanswered question—not style alone.</p><div className="conversation-route-key"><article><span>VALID CONCERN · SEPARATE THREAD</span><p>The concern remained supported and related. Used as the reply, it replaced rather than answered the bounded question.</p></article><article><span>MEME · ANSWER-SHAPED DEFLECTION</span><p>The image supplied affiliation and reaction without adding a proposition or answering the record question.</p></article><article><span>ABSURDISM · QUESTION DISPLACED</span><p>The exaggeration made direct engagement socially costly. Absurdism itself is not evidence of evasion.</p></article></div>{taken.length > 0 && <ol className="conversation-route-list">{taken.map((event) => { const route = event.conversationDiversion!; const scenario = pack.scenarios.find((item) => item.id === event.sourceScenarioId); return <li key={event.id}><span>{formatNightClock(pack.night.startTime, event.atMinute)} · {scenario?.code}</span><strong>{route.mode.replaceAll("-", " ")}</strong><p><b>QUESTION LEFT</b>{route.activeQuestion}</p><p><b>WHAT ENTERED</b>{route.introducedMaterial}</p><p><b>FUNCTION</b>{route.displacementEffect}</p><p><b>BETTER ROUTE</b>{route.betterRoute}</p></li>; })}</ol>}</div></details><header><span>TIME / SEAT</span><span>CHOICE</span><span>RELATIONAL MOVE</span><span>SYSTEM READ</span></header>{state.decisions.map((event) => { const scenario = pack.scenarios.find((item) => item.id === event.sourceScenarioId); const deliberate = event.relationalMove.misrepresentation.intentionality === "deliberate"; return <article key={event.id}><span><small>{formatNightClock(pack.night.startTime, event.atMinute)}</small><strong>{scenario?.code}</strong></span><span>{event.choiceLabel}{event.lastResort && <em>LAST RESORT · CLARITY INTACT</em>}</span><span><b>{event.relationalMove.classification.replaceAll("-", " ")}</b>{deliberate && <em>DELIBERATE · FOR {event.relationalMove.misrepresentation.beneficiary?.replaceAll("-", " ").toUpperCase()}</em>}{event.lastResort ? `Protected: ${event.lastResort.protectedParty}. Cost borne by: ${event.lastResort.harmedParty}.` : event.relationalMove.audienceInference}</span><span>{event.lastResort ? `${event.lastResort.positiveConsequence} ${event.lastResort.negativeConsequence} ${event.lastResort.selfCost}` : event.signal}</span></article>; })}</div>;
}

function InterpretationReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  return <div className="interpretation-receipt"><p className="receipt-intro">You know each protagonist&apos;s authored interior because you occupied that seat. Outside the simulation, motive remains unknown until evidence resolves it. Compare timing, incentives, records, reply access, and correction behavior. A deliberate departure requires represented private knowledge; it is not inferred from warmth, reserve, loyalty, or a wrong conclusion alone.</p><LanguageReceipt pack={pack} state={state} />{pack.scenarios.map((scenario) => { const ledger = scenario.communicationModel; const room = state.rooms[scenario.id]; const misrepresentation = ledger.misrepresentation; const incentive = misrepresentation.incentiveIntersection; return <article className="warm-frame" key={scenario.id}><header><span>{scenario.code}</span><strong>{ledger.label}</strong></header><div><p><b>EVENT RECORD</b>{ledger.observableRecord.join(" ")}</p><p><b>CHARACTER / MOTIVE LEAP</b>{ledger.inferences.join(" ")}</p><p><b>UNKNOWN</b>{ledger.unknowns.join(" ")}</p><p><b>WHAT ACCEPTANCE PROTECTS</b>{ledger.protectedStake}</p></div><section className="misrepresentation-receipt" aria-label="Deliberate misrepresentation receipt"><span>DELIBERATE MISREPRESENTATION · FOR {misrepresentation.beneficiary.replaceAll("-", " ")}</span><p><b>KNOWN RECORD</b>{misrepresentation.knownRecord}</p><p><b>ALTERED ACCOUNT</b>{misrepresentation.alteredAccount}</p><p><b>POWER / RELATIONSHIP</b>{misrepresentation.authorityCondition}</p><p><b>CORRECTION DUTY</b>{misrepresentation.correctionDuty}</p></section><section className="incentive-intersection" aria-label="Intersecting incentive receipt"><span>WHY THE SIMPLIFICATION REMAINED USEFUL</span><p><b>COMPETENCE THREAT</b>{incentive.competenceThreat}</p><p><b>FEARED INFERENCE</b>{incentive.fearedInference}</p><p><b>MATERIAL COUNTER-RECORD</b>{incentive.materialCounterrecord}</p><p><b>GROUP / CLASS STORY PROTECTED</b>{incentive.protectedGroupStory}</p><p><b>ADVANCEMENT</b>{incentive.advancementDomains.map((domain) => domain.replaceAll("-", " ")).join(" · ")}</p><p><b>COMPETITIVE PRIZE</b>{incentive.competitivePrize}</p><blockquote>{incentive.combinedMotive}</blockquote></section>{ledger.claim && <dl><div><dt>Bounded behavior</dt><dd>{ledger.claim.boundedBehavior}</dd></div><div><dt>Trait generalization</dt><dd>{ledger.claim.traitGeneralization}</dd></div><div><dt>Initiator exposure</dt><dd>{ledger.claim.initiatorExposure}</dd></div><div><dt>Evidence</dt><dd>{ledger.claim.evidenceStatus}</dd></div></dl>}<footer><span>BLAME {Math.round(room.metrics.blame)}%</span><span>INTERPRETATION GAP {Math.round(room.metrics.interpretiveGap)}%</span><p>{ledger.repairMove}</p></footer></article>; })}</div>;
}

function LanguageReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  const transitionEvents = state.decisions.filter((event) => event.codeTransition);
  const playedSwitches = transitionEvents.filter((event) => event.codeTransition!.fromCodeId !== event.codeTransition!.toCodeId);
  const sharedCodeFrictions = pack.scenarios.filter((scenario) => {
    const encounter = scenario.communicationModel.linguisticEncounter;
    return encounter.codeRelation === "shared" && encounter.worldModelRelation === "divergent";
  });

  return <details className="language-receipt"><summary><span>Registers and assumptions</span><strong>{playedSwitches.length} played shifts · {sharedCodeFrictions.length} shared-code frictions</strong></summary><div className="language-receipt-body"><p className="language-guardrail">These are fictional repertoires learned through particular places, resource settings, groups, institutions, and platforms. A shared register does not establish shared belief, motive, truth, class position, competence, or care. Switching registers does not prove deceit.</p><div className="language-profile-list">{pack.scenarios.map((scenario) => {
    const profile = scenario.protagonistModel.languageProfile;
    const encounter = scenario.communicationModel.linguisticEncounter;
    const decisions = transitionEvents.filter((event) => event.sourceScenarioId === scenario.id);
    const usedIds = new Set([profile.primaryCodeId, ...decisions.flatMap((event) => [event.codeTransition!.fromCodeId, event.codeTransition!.toCodeId])]);
    const usedCodes = profile.repertoire.filter((access) => usedIds.has(access.codeId));
    const switches = decisions.filter((event) => event.codeTransition!.fromCodeId !== event.codeTransition!.toCodeId);
    const codeLabel = (codeId: string) => profile.repertoire.find((access) => access.codeId === codeId)?.label ?? codeId.replaceAll("-", " ");
    return <details className="language-profile" key={scenario.id}><summary><span>{scenario.code}</span><strong>{scenario.protagonistModel.role}</strong><small>Used tonight: {usedCodes.map((access) => access.label).join(" · ")}</small></summary><div className="language-profile-body"><section aria-labelledby={`${scenario.id}-registers`}><h3 id={`${scenario.id}-registers`}>Registers at disposal</h3><ul className="language-register-list">{profile.repertoire.map((access) => { const acquisition = profile.socialContexts.filter((context) => access.acquisitionFacetIds.includes(context.id)); return <li key={access.codeId}><strong>{access.label}</strong><span>{access.fluency}</span><p>{access.functions.join(" · ")}</p>{acquisition.length > 0 && <small>Learned through {acquisition.map((context) => context.description).join(" · ")}</small>}</li>; })}</ul></section><section aria-labelledby={`${scenario.id}-contexts`}><h3 id={`${scenario.id}-contexts`}>Context history</h3><ul className="language-context-list">{profile.socialContexts.map((context) => <li key={context.id}><span>{context.axis.replaceAll("-", " ")} · {context.relation}</span><p>{context.description}</p></li>)}</ul></section><section aria-labelledby={`${scenario.id}-continuity`}><h3 id={`${scenario.id}-continuity`}>What stayed constant</h3><ul className="language-continuity-list">{profile.stableCommitments.map((commitment) => <li key={commitment}>{commitment}</li>)}</ul></section><section aria-labelledby={`${scenario.id}-switches`}><h3 id={`${scenario.id}-switches`}>Played register actions</h3>{decisions.length ? <ol className="language-switch-list">{decisions.map((event) => { const transition = event.codeTransition!; return <li key={event.id}><span>{transition.mode.replaceAll("-", " ")} · {codeLabel(transition.fromCodeId)} → {codeLabel(transition.toCodeId)}</span><p>{transition.switchReason}</p><small>{transition.audienceContext} · {transition.intendedFunction}</small></li>; })}</ol> : <p className="language-empty">This path used the entry register without a represented register action.</p>}{decisions.length > 0 && switches.length === 0 && <p className="language-empty">This path maintained or bridged the active register without switching it.</p>}</section><section className="language-encounter" aria-labelledby={`${scenario.id}-encounter`}><h3 id={`${scenario.id}-encounter`}>{encounter.codeRelation === "shared" ? "Shared surface" : "Different surfaces"} · {encounter.worldModelRelation === "divergent" ? "different assumptions" : "aligned assumptions"}</h3><p><b>SURFACE</b>{encounter.surface}</p><p><b>REGISTER RELATION</b>{codeLabel(encounter.speakerCodeId)} · {encounter.codeRelation} with {codeLabel(encounter.audienceCodeId)}</p><p><b>AUDIENCE CONTEXT</b>{encounter.audienceContext}</p><div className="language-model-comparison"><article><h4>This seat&apos;s model</h4><dl><div><dt>Care</dt><dd>{encounter.speakerWorldModel.careMeans}</dd></div><div><dt>Evidence</dt><dd>{encounter.speakerWorldModel.evidenceMeans}</dd></div><div><dt>Authority</dt><dd>{encounter.speakerWorldModel.authorityMeans}</dd></div><div><dt>Disagreement</dt><dd>{encounter.speakerWorldModel.disagreementMeans}</dd></div><div><dt>Responsibility</dt><dd>{encounter.speakerWorldModel.responsibilityUnit}</dd></div></dl></article><article><h4>Receiving model</h4><dl><div><dt>Care</dt><dd>{encounter.audienceWorldModel.careMeans}</dd></div><div><dt>Evidence</dt><dd>{encounter.audienceWorldModel.evidenceMeans}</dd></div><div><dt>Authority</dt><dd>{encounter.audienceWorldModel.authorityMeans}</dd></div><div><dt>Disagreement</dt><dd>{encounter.audienceWorldModel.disagreementMeans}</dd></div><div><dt>Responsibility</dt><dd>{encounter.audienceWorldModel.responsibilityUnit}</dd></div></dl></article></div><p><b>FRICTION</b>{encounter.friction}</p><p><b>UNRESOLVED</b>{encounter.unresolvedQuestion}</p><p><b>TRANSLATION ROUTE</b>{encounter.repairMove}</p></section></div></details>;
  })}</div></div></details>;
}

function CrossingReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  return <div className="crossing-receipt"><p className="receipt-intro">Only compatible routes claim a direct content crossing. Every other receipt describes a shared social condition—not a shared rumor, target, or truth.</p>{state.decisions.map((event) => { const source = pack.scenarios.find((item) => item.id === event.sourceScenarioId); return <details key={event.id}><summary><span>{formatNightClock(pack.night.startTime, event.atMinute)} · {source?.code}</span><strong>{event.choiceLabel}</strong></summary><ul>{event.effects.filter((effect) => effect.scope === "cross-room").map((effect) => <li key={effect.targetScenarioId}><span>{effect.layer === "direct" ? "DIRECT CROSSING" : "AMBIENT SYSTEM EFFECT"}</span><p>{visibleCrossingCopy({ id: event.id, atMinute: event.atMinute, sourceScenarioId: event.sourceScenarioId, label: event.choiceLabel, signal: event.signal, kind: "choice", effects: event.effects }, effect, state, pack.scenarios)}</p><small>{effectSummary(effect)}</small></li>)}</ul></details>; })}</div>;
}

function FatigueReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  return <div className="fatigue-receipt"><p className="receipt-intro">Discernment is not spent. Modeled platform exposure can reduce a prosocial seat&apos;s follow-through through five different loads. Wall-clock reading time, assistive technology, and hesitation never change this state. Under extreme combined load, a high-discernment seat may make one extraordinary, costly attempt; fatigue explains its availability, not its innocence.</p><div className="fatigue-definition">{(Object.keys(FATIGUE_COPY) as FatigueKind[]).map((kind) => <article key={kind}><span>{kind}</span><p>{FATIGUE_COPY[kind]}</p></article>)}</div>{pack.scenarios.map((scenario) => { const room = state.rooms[scenario.id]; const lastResort = state.decisions.find((event) => event.sourceScenarioId === scenario.id && event.lastResort)?.lastResort; return <article className="fatigue-room warm-frame" key={scenario.id}><header><span>{scenario.code}</span><strong>{scenario.protagonistModel.prosocialOrientation}</strong></header><div className="judgment-split"><p><span>DISCERNMENT</span><b>{Math.round(room.metrics.discernment)}</b><small>baseline {scenario.protagonistModel.discernmentBaseline}</small></p><p><span>FOLLOW-THROUGH</span><b>{Math.round(room.metrics.enactment)}</b><small>baseline {scenario.protagonistModel.enactmentBaseline}</small></p></div><div className="fatigue-bars">{(Object.keys(FATIGUE_COPY) as FatigueKind[]).map((kind) => <div key={kind}><span>{kind}</span><i><b style={{ width: room.fatigue[kind] + "%" }} /></i><strong>{Math.round(room.fatigue[kind])}</strong></div>)}</div><p>{dominantFatigue(room).label} fatigue dominated this seat. That explains a capacity barrier; it does not make harmful action inevitable or innocent.</p>{lastResort && <aside className="last-resort-receipt"><span>LAST RESORT TAKEN</span><p><b>Protected</b>{lastResort.protectedParty}: {lastResort.positiveConsequence}</p><p><b>Cost shifted</b>{lastResort.harmedParty}: {lastResort.negativeConsequence}</p><p><b>Self cost</b>{lastResort.selfCost}</p></aside>}</article>; })}</div>;
}

function behaviorPressureCue(phase: BehaviorPhase): string {
  const cues: Record<BehaviorPhase, string> = {
    calm: "This seat still has access to its ordinary range of responses.",
    trigger: "A specific pressure has begun narrowing what feels urgent.",
    escalation: "Urgency and protective stakes are crowding out pause.",
    "higher-escalation": "Immediate action is starting to feel more available than proportionate action.",
    crisis: "A drastic move may feel singularly available even while its split costs remain visible.",
    "de-escalation": "Pressure is falling, but capacity and relationships have not reset.",
    recovery: "Ordinary range is returning; consequences still require repair.",
  };
  return cues[phase];
}

function PracticeReceipt({ pack, state }: { pack: GeneratedScenarioPack; state: NightState }) {
  const frameworks = pack.scenarios.flatMap((scenario) => scenario.frameworks
    .filter((framework) => framework.id !== "situated-action-review")
    .map((framework) => ({ scenario, framework })));
  const sparseIds = new Set(frameworks.map(({ framework }) => framework.id));
  return <div className="practice-receipt"><p className="receipt-intro">These critical lenses appear only where the generated role, evidence, power relation, and available action make them coherent. They diagnose no real person and supply no tactics against one. The receipt shows what the played night made relevant without exposing the simulation&apos;s internal action-review scaffold.</p><div className="practice-absence"><span>SPARSE BY DESIGN</span><p>{sparseIds.has("situated-leadership") ? "One room carried a situated-leadership thread." : "No room in this night carried a situated-leadership thread."}</p><p>{sparseIds.has("repair-conversation") ? "One conflict supported an accountable repair conversation." : "No conflict in this night supported the complete repair conversation."}</p></div><div className="practice-grid">{frameworks.map(({ scenario, framework }) => { const offered = scenario.scenes.flatMap((scene) => scene.choices.flatMap((choice) => choice.frameworkMoves ?? [])).filter((move) => move.frameworkId === framework.id); const played = state.decisions.flatMap((event) => event.frameworkMoves.map((move) => ({ event, move }))).filter(({ move }) => move.frameworkId === framework.id); return <article className="warm-frame" key={`${scenario.id}-${framework.id}`}><header><span>{scenario.code}</span><strong>{framework.label}</strong></header><div className="problem-idea-solution"><p><b>CONDITION</b>{framework.problem}</p><p><b>READING</b>{framework.idea}</p><p><b>ACCOUNTABLE MOVE</b>{framework.solution}</p></div><ol>{offered.map((move) => { const chosen = played.find(({ move: playedMove }) => playedMove.stepId === move.stepId || (!move.stepId && playedMove.frameworkId === move.frameworkId)); return <li key={move.stepId ?? move.frameworkId} className={chosen ? "was-played" : "was-available"}><span>{move.stepId?.replaceAll("-", " ") ?? "critical lens"}</span><p>{move.applicability}</p><small>{chosen ? `PLAYED THROUGH “${chosen.event.choiceLabel}”` : "AVAILABLE IN THE PLAYED ROOM · NOT SELECTED"}</small></li>; })}</ol></article>; })}</div></div>;
}

function HeartReceipt({ pack }: { pack: GeneratedScenarioPack }) {
  return <div className="heart-receipt warm-frame"><p className="panel-label">FACT WITHOUT CRUELTY · COMPASSION WITHOUT SURRENDER</p><h3>Will you understand every seat without pretending every choice was innocent?</h3><p>Self-protection can explain why a rumor began. It does not prove the rumor false; the event record does. Motive and truth remain separate.</p><div><article><span>SCAPEGOATING</span><p>Scapegoating concentrates a distributed failure on a lower-power target, often while shifting the burden of explanation, warmth, and repair toward that target.</p></article><article><span>DELIBERATE PROTECTION</span><p>Deliberate protection is a knowingly altered account used to shield self, friend, family, ally, client, or someone under authority. Power shapes who can impose the account and who must live inside it.</p></article><article><span>STATUS THREAT</span><p>Status threat is fear that another person&apos;s competence will expose one&apos;s own weakness. An oversimplified group story can protect status; the material record remains the test of that story.</p></article><article><span>ADVANCEMENT / COMPETITION</span><p>Intersecting incentives occur when class reassurance, cultural belonging, professional authority, political ownership, and market advantage reward the same distortion at once.</p></article><article><span>COMMUNICATION</span><p>Warmth and reserve are presentation signals, not proof of care or contempt. Meaning emerges from their relation to record, incentive, context, and correction behavior.</p></article><article><span>COMMON GROUND</span><p>Cross-code agreement is a shared concrete action expressed through different coalition vocabularies; surface conflict can coexist with material agreement.</p></article></div><blockquote>Understanding a protective motive does not move responsibility onto the person made to absorb its cost.</blockquote><small>{pack.scenarios.map((scenario) => scenario.valueLens.label).join(" · ")}</small></div>;
}

function HouseDrawer({ kind, pack, state, scenario, room, analysisAvailable, onRestore, onAnnounce, onClose }: { kind: Exclude<Drawer, null>; pack: GeneratedScenarioPack; state: NightState; scenario: Scenario | null; room: RoomRuntime | null; analysisAvailable: boolean; onRestore: (state: NightState) => void; onAnnounce: (message: string) => void; onClose: () => void }) {
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });

    function keepFocusInside(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(panelRef.current.querySelectorAll<HTMLElement>("button, a[href], input, select, textarea, summary, [tabindex]:not([tabindex='-1'])")).filter((element) => {
        const closedDisclosure = element.closest("details:not([open])");
        const isClosedSummary = closedDisclosure && element.parentElement === closedDisclosure && element.tagName === "SUMMARY";
        return !element.hasAttribute("disabled")
          && (!closedDisclosure || isClosedSummary)
          && (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
      });
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1)!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", keepFocusInside);
    return () => {
      document.removeEventListener("keydown", keepFocusInside);
    };
  }, []);

  const title = kind === "notes" ? (analysisAvailable ? "Field notes" : "House guide") : kind === "lineage" ? (analysisAvailable ? "Meme trace" : "Trace guide") : kind === "signals" ? "Live signals" : "Privacy & saves";
  return <div className="drawer-scrim" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}><aside ref={panelRef} className={`house-drawer warm-frame${kind === "privacy" ? " is-privacy" : ""}`} role="dialog" aria-modal="true" aria-labelledby="drawer-title"><header><div><span>CHORUS HOUSE FILE</span><h2 id="drawer-title">{title}</h2></div><button ref={closeRef} type="button" onClick={onClose} aria-label="Close house file">×</button></header><div className="drawer-body pane-scroll" role="region" aria-labelledby="drawer-title" tabIndex={0} data-scroll-region="drawer">{kind === "notes" && (analysisAvailable ? <FieldNotes /> : <HouseGuide />)}{kind === "lineage" && (analysisAvailable ? <MemeLineage /> : <TraceGuide />)}{kind === "signals" && <ContextRail pack={pack} state={state} scenario={scenario} room={room} />}{kind === "privacy" && <PrivacyPanel state={state} onRestore={onRestore} onAnnounce={onAnnounce} />}</div></aside></div>;
}

function HouseGuide() {
  return <div className="field-notes"><p>The interpretation stays sealed until the whole night is complete. These controls help you inspect the simulation without pointing to a preferred conclusion.</p><article><span>01</span><h3>Follow the record</h3><p>Keep what appeared in the artifact separate from the room&apos;s reading and what remains unknown.</p></article><article><span>02</span><h3>Use any pace</h3><p>Reading speed, pausing, keyboard navigation, and assistive technology never increase modeled load or change outcomes.</p></article><article><span>03</span><h3>Try a marked path</h3><p>If an action is visible but unavailable, activate it. The seat will name its immediate motive, emotional pressure, and capacity barrier.</p></article><article><span>04</span><h3>Keep your own hypothesis</h3><p>The final receipt will reveal the authored interior and compare it with the record. You do not need to guess a diagnosis.</p></article></div>;
}

function TraceGuide() {
  return <div className="field-notes"><p>Two visible measures describe circulation conditions, not truth.</p><article><span>01</span><h3>Trace</h3><p>How much source, time, boundary, and context remain attached to an artifact.</p></article><article><span>02</span><h3>Fit</h3><p>How readily an artifact feels native to the room receiving it.</p></article><article><span>03</span><h3>Crossings</h3><p>Some effects carry content; others only change the surrounding atmosphere. The final receipt distinguishes them.</p></article></div>;
}

function FieldNotes() {
  const notes = [
    ["Scapegoating needs a pattern", "Look for an accountability threat, an event-to-character leap, benefit to the initiator, unequal reply access, and missing direct evidence. One negative claim alone is insufficient."],
    ["A defensive motive is not a truth test", "A rumor may protect its source and still contain a bounded true detail. Test the claim against the event record; do not infer falsity from motive alone."],
    ["Warm and cool are presentation", "Warm delivery can carry harm; terse delivery can carry care. Neither establishes the speaker's interior without timing, incentive, record, and correction behavior."],
    ["Codes are situated, not essential", "Regional, classed, institutional, occupational, political, family, peer, and platform registers are learned resources, not destinies. Sharing a register does not mean sharing a model of what the exchange is for."],
    ["Agreement can wear opposing uniforms", "Normalize political claims into concrete actions before treating coalition vocabulary as a substantive difference."],
    ["Discernment is not follow-through", "Prosocial seats can know the sound action while attention, affect, relationships, verification work, and low efficacy make it harder to enact."],
  ];
  return <div className="field-notes"><p>These are fictional composites of recurring communication systems, not recreations of particular people or a diagnostic tool.</p>{notes.map(([title, copy], index) => <article key={title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>;
}

function MemeLineage() {
  const steps = [["ORIGINAL", "A question retains source, time, uncertainty, and visual context.", "TRACE 88 · FIT 24"], ["CROP", "The striking image remains. The boundary and timestamp disappear.", "TRACE 52 · FIT 61"], ["MEME", "A familiar joke supplies feeling, belonging, and deniability.", "TRACE 27 · FIT 86"], ["PERSON-LABEL", "A character story explains the ambiguity more quickly than chronology.", "TRACE 16 · FIT 91"], ["CORRECTION", "Evidence returns, but no longer travels inside every trusted relationship.", "TRACE 94 · FIT 43"]];
  return <div className="meme-lineage"><p>Aesthetic fluency is a transmission condition. It can preserve uncertainty, disguise incentive, or make an unsupported social interpretation feel locally native.</p><ol>{steps.map(([label, copy, metric], index) => <li key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong><p>{copy}</p><small>{metric}</small>{index < steps.length - 1 && <i aria-hidden="true">→</i>}</li>)}</ol><blockquote>The source outline becomes incomplete as social fit warms—until repair restores the record without pretending the earlier audience can be fully recovered.</blockquote></div>;
}

function aggregateRoom(state: NightState): Pick<RoomRuntime, "metrics"> {
  const rooms = Object.values(state.rooms);
  const metrics = { ...rooms[0].metrics };
  (Object.keys(metrics) as Array<keyof typeof metrics>).forEach((metric) => { metrics[metric] = rooms.reduce((sum, room) => sum + room.metrics[metric], 0) / rooms.length; });
  metrics.reach = rooms.reduce((sum, room) => sum + room.metrics.reach, 0);
  return { metrics };
}

function aggregateFatigue(state: NightState): RoomRuntime["fatigue"] {
  const rooms = Object.values(state.rooms);
  return Object.fromEntries((Object.keys(FATIGUE_COPY) as FatigueKind[]).map((kind) => [kind, rooms.reduce((sum, room) => sum + room.fatigue[kind], 0) / rooms.length])) as RoomRuntime["fatigue"];
}

function averageMetric(state: NightState, metric: keyof RoomRuntime["metrics"]) {
  const rooms = Object.values(state.rooms);
  return rooms.reduce((sum, room) => sum + room.metrics[metric], 0) / rooms.length;
}

function dominantFatigue(room: RoomRuntime): { kind: FatigueKind; label: string; value: number } {
  const [kind, value] = (Object.entries(room.fatigue) as Array<[FatigueKind, number]>).sort((left, right) => right[1] - left[1])[0] ?? ["attentional", 0];
  return { kind, label: kind.charAt(0).toUpperCase() + kind.slice(1), value };
}

function blockedReason(choice: Choice, access: ChoiceAccess, room: RoomRuntime) {
  const barrier = choice.blockedAttempt?.conciseReason ?? choice.lockReason ?? "The path is not connected.";
  const fatigue = dominantFatigue(room);
  return barrier + " " + fatigue.label + " fatigue is highest. " + (access.willDepleted ? "Follow-through is below the action's modeled requirement." : "Required systems remain disconnected.");
}

function stageHeadingId(intro: boolean, debrief: boolean, relations: boolean, room: RoomRuntime | null) {
  if (intro) return "prelude-title";
  if (debrief) return "debrief-title";
  if (relations) return "relations-title";
  if (!room) return "house-title";
  if (!room.entered) return "invitation-title";
  if (room.completed) return "closed-title";
  return "scene-title";
}

function roomSignal(index: number) {
  return ["reply access shifting", "tone under pressure", "warm signal / thin record", "shared concern / split words", "meaning between rooms", "conflict gaining value"][index] ?? "signal unsettled";
}

function fatigueHint(kind: FatigueKind) {
  return ({ attentional: "focus", affective: "alarm", relational: "social", verification: "checking", efficacy: "impact" } as const)[kind];
}

function effectSummary(effect: EffectReceipt) {
  const deltas = Object.entries(effect.metrics).filter(([metric, value]) => metric !== "reach" && value && Math.abs(value) >= 0.1).slice(0, 3).map(([metric, value]) => metricDisplay(metric) + " " + (Number(value) > 0 ? "+" : "") + (Math.round(Number(value) * 10) / 10));
  const reach = effect.appliedReach > 0 ? "reach +" + formatNumber(effect.appliedReach + effect.backgroundReach) : effect.avoidedReach > 0 ? formatNumber(effect.avoidedReach) + " future impressions avoided" : formatNumber(effect.backgroundReach) + " ambient impressions";
  return [reach, ...deltas].join(" · ");
}

function metricDisplay(metric: string) {
  const labels: Record<string, string> = { interpretiveGap: "interpretation gap", commonGround: "common ground visible", threadFocus: "active-question focus", coordination: "coordination pressure", crossover: "cross-room fluency", provenance: "source trace", verification: "verification capacity", consensus: "perceived consensus", enactment: "follow-through" };
  return labels[metric] ?? metric.replace(/([A-Z])/g, " $1").toLowerCase();
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(value));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function subscribeToMotionPreference(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function readMotionPreference() {
  return typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
