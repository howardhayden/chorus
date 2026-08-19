# Interaction and progressive disclosure

## Purpose

This document owns player-visible states, navigation, disclosure timing,
responsive behavior, blocked-action interaction, relationship exploration, and
the final receipt. It does not redefine the underlying communication model or
event coefficients.

## Interaction thesis

CHORUS should make complexity explorable without making it simultaneous. The
player is allowed to move freely between incidents, but each view has one clear
question and one scroll owner. Analytic labels are delayed until the player has
completed the causal experience needed to interpret them.

Progressive disclosure is not the removal of evidence. It is the staged release
of classification:

- early play exposes records, uncertainty, immediate pressure, and action;
- room-close views expose bounded consequences and unresolved questions; and
- the whole-night debrief exposes complete causal and interpretive ledgers.

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
| Whole-night debrief | Reconstruct causality after all 24 decisions. | Seven receipt sections. | Nothing required for interpretation. |

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
- **Record:** what is directly represented, what the room is reading, and what
  remains unknown; and
- **Echoes:** attributable prior house effects permitted by current disclosure.

Tabs use roving keyboard focus. Their content follows the same reading order as
their visual order, and the selected panel is the only active tab panel.

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

After the night closes, one native collapsed disclosure inside Interpretation
may show the repertoire, registers actually used by accepted decisions, switch
pressure, continuity anchors, and mental-model comparison. It does not add
another tab, drawer, graph edge, score, or nested scroll region.

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

## Whole-night debrief

The debrief opens only after all 24 choices have been accepted. Its sections
have distinct ownership:

| Section | Question answered |
|---|---|
| House | What changed across the shared system? |
| Choices | Which concrete actions were taken, including conversation routing? |
| Interpretation | What did each communication and protection ledger represent? |
| Crossings | Which effects carried content and which changed only the surrounding condition? |
| Fatigue | Which loads reduced follow-through while discernment remained intact? |
| Practice | Which sparse critical lenses and repair structures were contextually relevant? |
| Heart | What do the encountered ideas mean after play? |

“The Heart” defines the represented ideas rather than instructing the player to
adopt a conclusion. Its central question is phrased as a matter of willingness:
whether the player will understand every seat without declaring every choice
innocent.

## Cognitive-load rules

- Do not repeat how to play in every view.
- Do not expose a placeholder for content that does not yet exist.
- Prefer a labelled native disclosure to a new panel or nested modal.
- Keep a single source of truth for Trace and Fit explanations.
- Do not show repository, privacy, rating, or explanatory disclaimers in the
  active play footer when they do not help the current decision.
- Preserve readable text before decorative film, glow, or density.
- Keep consequences available by request rather than permanently surrounding
  the active choice.

## Verification

The accessibility and viewport suites inspect navigation uniqueness, disclosure
gates, operable blocked choices, focus transfer, relation-plot semantics,
normal-flow expansions, scroll ownership, dynamic viewport use, mobile reflow,
and the absence of premature analytic labels. Manual verification is specified
in [Accessibility](ACCESSIBILITY.md).

