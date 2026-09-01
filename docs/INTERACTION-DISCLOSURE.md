# Interaction and progressive disclosure

## Purpose

This document owns player-visible states, navigation, disclosure timing,
responsive behavior, blocked-action interaction, relationship exploration, and
the completed-night summary and concept receipt. It does not redefine the
underlying communication model or event coefficients.

## Interaction thesis

CHORUS should make complexity explorable without making it simultaneous. The
player is allowed to move freely between incidents, but each view has one clear
question and one scroll owner. Analytic labels are delayed until the player has
completed the causal experience needed to interpret them.

Progressive disclosure is not the removal of evidence. It is the staged release
of classification:

- early play exposes records, uncertainty, immediate pressure, and action;
- room-close views expose bounded consequences and unresolved questions; and
- the completed-night view derives a continuous account from the causal state,
  then explains supported concepts separately in plain language.

## Application states

| State | Primary task | Available secondary views | Sealed information |
|---|---|---|---|
| Prelude | Enter the house with minimal directional cues. | House guide, trace guide, privacy. | Room classifications, actor profiles, lesson names. |
| House map | Inspect six live rooms and choose where to enter. | Relationships, live signals, guides, privacy. | Future artifacts and endpoint identities not yet entered. |
| Invitation | Understand one seat's immediate goal, outward form, and reply conditions. | Same persistent secondary views. | Complete motive ledger, repertoire, and final communication label. |
| Active beat | Read one artifact and choose a concrete response. | Source/seat/record/echo panels; live signals. | Future beats, analytic relational labels, full cross-room attribution. |
| Blocked expansion | Understand why this visible action cannot currently be carried. | The same choice card remains the toggle. | Additional coaching, future repair sequence, preferred answer. |
| Waiting room | Return to the map until the next scheduled artifact. | All house-level views. | Future artifact content. |
| Room close | Compare the immutable close snapshot with current afterimage. | Other rooms remain playable. | Whole-night interpretation. |
| Relationships | Explore public outward relationships and current house effects. | Filters, keyboard node exploration, textual relation list. | Linguistic profiles and inferred hidden alliances. |
| Completed-night view | Read the naturalized summary, its adjacent model limit, and then the plain concept receipt. | House map and whole-night replay. | Nothing required for the completed synthesis. |

## Single-viewport contract

The application document is fixed to the current viewport. The shell uses
`100dvh` with a `100vh` fallback and safe-area padding. The page itself does not
become a stack of full-screen sections.

On wide viewports the workspace contains:

1. a persistent header;
2. a room rail;
3. the primary stage; and
4. the stage's contextual information.

The stage and explicitly labelled panes own overflow. Drawers are bounded modal
overlays with one internal scroll region.

On mobile:

- the room rail becomes a persistent two-by-three switcher;
- the primary stage remains the main scroll owner;
- live signals move into a drawer;
- multi-column content reflows to one column;
- the relationship plot and text alternative fit the stage width without page
  side-scrolling; and
- nonessential ornament yields before text or controls become inaccessible.

Short landscape layouts reduce headings and decoration while preserving room
switching, the primary action, and readable content.

## Navigation rules

- Selecting a room does not advance the clock.
- Returning to the house does not reset the room.
- A waiting room returns the player to the map rather than showing an empty
  scene placeholder.
- A completed room remains available and shows its close snapshot plus later
  afterimage.
- Regeneration is one global action, not duplicated in each viewport variant.
- Replay rewinds the entire night because an isolated room replay would break
  downstream receipts.
- Every persistent destination has one control in a given viewport; separate
  labels never open the same panel.

## Room reading panels

An active scene separates four questions:

- **Source:** what artifact arrived and how much trace remains;
- **Seat:** the protagonist's immediate goal, known condition, and pressure;
- **Record:** the current beat's typed public record, current question, and
  current unknown, plus the single actual private assignment brief only for
  the contracted Bridge seat; and
- **Echoes:** attributable prior house effects permitted by current disclosure.

Tabs use roving keyboard focus. Their content follows the same reading order as
their visual order, and the selected panel is the only active tab panel.

The Record panel consumes only `scene.disclosure`. Every disclosure atom has a
stable ID, access class, label, and copy. It does not render the room-wide
analytic communication ledger, and the room-close receipt does not repeat all
four beats' atoms. This keeps laterResolution, circulatingFrame, audience
inference, private motive, and unresolved questions from collapsing into one
apparently authoritative block.

## Choice interaction

Each visible choice is an operable control. An unavailable choice is not a
disabled dead end.

### Available action

Activation performs one reducer request using the current scenario, scene, and
choice identities. A successful action announces the receipt, advances the
logical clock by its modeled duration, and routes focus to the next scene, room
close, or house map.

### Unavailable action

Activation expands that choice card in normal flow. The explanation is concise
and limited to:

- the immediate motive or identity being protected;
- the modeled emotional overtake and its reason;
- the highest fatigue channel;
- whether follow-through is below the modeled requirement; and
- which source, evidence, institution, relationship, or distribution systems
  remain disconnected.

The action control itself changes to `REASON OPEN` and remains the control used
to close the explanation. Closing restores the previous card dimensions and
returns focus to that control. The explanation does not add coaching copy,
reveal future choices, or move to a detached alert.

Unavailable-card order is generated and shuffled; a player cannot infer the
ideal from a fixed bottom position.

## Cross-room disclosure

Cross-room event history is mechanically complete from the moment an event is
accepted, but its copy depends on entry state.

| Source entered | Target entered | Visible copy |
|---|---|---|
| No | No | Generic reviewed mechanism cue. |
| Yes | No | Generic reviewed mechanism cue. |
| No | Yes | Generic reviewed mechanism cue. |
| Yes | Yes | Attributable source, target, event, and causal distinction. |

The generic form excludes room title, place, protagonist, target, resolution,
choice label, unique time, and incident noun. The same restriction applies to
hidden DOM, accessible names, live announcements, and relationship labels.

Entry changes what may be named. It never changes what already happened.

## Linguistic disclosure

Before completion, the interface may expose only an actor's readable public
surface cue and bounded scene-specific hints. It may not expose:

- the complete repertoire;
- regional or socioeconomic acquisition anchors;
- internal register identifiers;
- the reason for a code switch;
- a same-register/different-world-model classification; or
- a cohesion score.

After the night closes, the naturalized summary may name a repertoire or
assumption difference only when the completed pack, selected route, and state
support it. The conclusion does not expose a separate repertoire tab, inferred
relationship edge, score, or nested scroll region. Internal profile detail
that is not required by the supported synthesis remains model data rather than
being expanded into a concluding taxonomy.

## Relationship exploration

The Relationships view exposes outward, authored relations and current
house-effect connections. It supports:

- text search;
- relationship-kind filter;
- status filter;
- room filter;
- pointer selection;
- keyboard traversal of focusable SVG nodes; and
- an equivalent textual list.

The plot never creates an edge because two actors share a register, vocabulary,
identity, inferred motive, or political position. Such similarity does not
establish a relationship. On mobile, plot and text alternative remain within
the stage width and require no horizontal page movement.

## Drawers and secondary information

Guides, trace material, live signals, and privacy controls use one shared
drawer pattern:

- one distinct button per destination;
- `role="dialog"` with a labelled title;
- focus placed on the close control when opened;
- background content inert while open;
- Tab and Shift+Tab contained within the drawer;
- Escape and close control both dismiss; and
- focus restored to the invoking control.

Drawers contain supporting information and controls; they never hide the only
way to progress the current beat.

The pre-completion Notes drawer contains only the House Guide, and the Privacy
drawer withholds its Technical record disclosure. Research-record cards,
embedded notebooks, and the notebook-index link enter the product navigation
only after the same whole-night completion check. This is a progressive-
disclosure boundary, not access control: static notebook URLs remain public if
someone already knows or guesses them. CHORUS does not claim those public
assets are confidential.

## Completed-night view

The view opens only after all 24 choices have been accepted. It is one
continuous stage and one named scroll owner; it has no receipt tablist and no
Heart panel. Its reading order is fixed:

1. **Naturalized summary.** `buildNaturalizedSummary(pack, state)` derives
   paragraphs and supporting narrative-source identifiers from the completed
   generated pack and night state. It may synthesize only supported choices,
   routes, crossings, pressure, fatigue, repair, and consequences. It ends on
   the remaining afterimage or unresolved reach of the night, not on a lesson,
   command, score, or model disclaimer. Route sources distinguish selected-path
   carriage from background-only model movement. When several post-close
   metrics changed, the cited residue is selected by normalized magnitude and
   retains raw close/debrief values plus the normalized change.
2. **Model limit.** A visible labelled note sits adjacent to the summary but
   outside its prose thesis. It states that authored fictional interiors and
   modeled effects do not diagnose or predict real people. It cannot be
   appended as the summary's final moral.
3. **Plain concept receipt.** `buildConceptReceipt(pack, state)` deduplicates
   `SceneLesson` terms belonging to scenes with actual accepted decisions. Each
   entry uses the first related `lesson.definition` as plain meaning and its
   `lesson.observable` as the limit, then gives the strongest supported status
   under `played > experienced > encountered`. Encountered means an accepted
   decision resolved the lesson scene. Experienced means an actual decision or
   ambient-pulse receipt matched every field in one of that lesson's typed
   `experienceRules`. Played means an accepted choice carried an explicit
   term-matching `conceptPlays` binding. Saturation has no play binding. Scene
   IDs, exact matched `effectEventIds`, and played decision IDs are derived
   separately; played status does not require or invent an effect ID.

Each concept entry also exposes one visible discriminated evidence sentence:
scene evidence identifies the accepted scene, effect evidence identifies the
recorded event and target room, and action evidence identifies the selected
decision. A requested metric delta can meet a room bound, so effect prose does
not promote its direction into a net increase without realized-delta evidence.
Provenance is player-readable copy, not an opaque count of hidden IDs.

The summary and concept receipt have different jobs. The summary carries the
experienced relationships in a natural voice without restating every
definition. The receipt explains model concepts directly without imitating the
narrative voice. An offered action or accepted scene alone is not reported as
played; selection counts only through an explicit authored binding. Labels,
detail, intent, tags, and generic signal copy are not predicates, and a
selected fictional action is not treated as the player's belief or character.

Both derivations are pure: the same completed `GeneratedScenarioPack` and
`NightState` produce the same ordered output. Reading, focus, reflow, opening a
native disclosure, or returning to the house does not alter simulation state.

## Cognitive-load rules

- Do not repeat how to play in every view.
- Do not expose a placeholder for content that does not yet exist.
- Prefer a labelled native disclosure to a new panel or nested modal during
  play; keep the completed-night view in one continuous reading order.
- Keep a single source of truth for Trace and Fit explanations.
- Do not show repository, privacy, rating, or explanatory disclaimers in the
  active play footer when they do not help the current decision.
- Preserve readable text before decorative film, glow, or density.
- Keep consequences available by request rather than permanently surrounding
  the active choice.

## Verification

The accessibility and viewport suites inspect navigation uniqueness, disclosure
gates, operable blocked choices, focus transfer, relation-plot semantics,
normal-flow expansions, the tab-free completed-night order, scroll ownership,
dynamic viewport use, mobile reflow, and the absence of premature analytic
labels. Browser and assistive-technology renewal for the version-15 source is
still required under [Accessibility](ACCESSIBILITY.md) and
[Release status](RELEASE-STATUS.md).
