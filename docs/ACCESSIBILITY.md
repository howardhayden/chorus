# Accessibility

## Standard and scope

CHORUS targets WCAG 2.0 Level AA as its minimum conformance floor and applies
later compatible guidance where it improves keyboard, touch, reflow, motion,
focus, and cognitive accessibility. Conformance applies to the complete player
journey: prelude, house map, invitations, active scenes, blocked-action
expansions, room-close receipts, relationships, drawers, privacy controls,
portable input, and the continuous completed-night view.

An automated test is evidence for a contract, not a conformance claim by
itself. Release review includes keyboard, zoom/reflow, reduced motion, forced
colors, and screen-reader checks.

## Accessibility principles

1. Information is never encoded by color, glow, position, sound, or animation
   alone.
2. Reading speed and input method never change simulated fatigue or outcomes.
3. All state-changing controls are keyboard operable and have visible focus.
4. Progressive disclosure reduces simultaneous load without hiding necessary
   evidence or the only route forward.
5. Motion and surface effects may be reduced without removing information.
6. The document remains zoomable and text remains reflowable.
7. A graph is paired with an equivalent text representation.
8. Dynamic updates are announced without seizing focus unpredictably.

## Structure and semantics

- The page has one primary application landmark and a stable heading hierarchy.
- Every stage has a focusable heading used as the navigation destination.
- Scene-information tabs use `role="tablist"`, `role="tab"`, `aria-selected`,
  and linked tab panels with roving keyboard focus. The completed-night view is
  not a tabset.
- Drawers use a labelled modal dialog pattern and make the background inert.
- Expandable material uses native `details` and `summary` unless activation
  must remain on the existing choice button.
- Scrollable named regions have a programmatic label and can receive keyboard
  focus when their content requires independent scrolling.
- Metrics expose text labels and values in addition to visual bars.
- The relationship SVG exposes focusable named nodes and has a textual list
  that provides the same relations.
- Status messages use a polite live region. Destructive confirmation and import
  preview remain visible in normal document flow.

## Keyboard model

| Context | Keys | Result |
|---|---|---|
| Ordinary controls | Tab / Shift+Tab | Move through operable controls in reading order. |
| Buttons, summaries, nodes | Enter or Space | Activate or toggle. |
| Scene panel tabs | Left / Right, Home / End | Move roving focus and select the corresponding panel. |
| Drawer | Escape | Close and restore focus to the invoking control. |
| Drawer boundary | Tab / Shift+Tab | Wrap within the open modal. |
| Relationship nodes | Tab / Shift+Tab | Explore focusable visible nodes; details update without hiding the text list. |

No keyboard shortcut is required to play. Pointer gestures have button or form
control equivalents.

## Focus management

Focus moves only after a meaningful view transition:

- entering the house focuses the house heading;
- selecting or resuming a room focuses its invitation, active-scene, or
  room-close heading;
- opening a blocked explanation keeps activation on the choice and ensures the
  expanded receipt is within the active scroll region;
- closing the explanation restores the original card format and focus;
- opening a drawer focuses its close control;
- closing a drawer restores its invoker;
- accepting a choice focuses the next active stage;
- opening the completed-night view focuses its heading before the naturalized
  summary; and
- restoring a save focuses the house heading after validation.

Focus movement uses `preventScroll` and explicit scroll-owner adjustment rather
than smooth-scroll dependence. Reduced motion does not change the destination.

## Text, zoom, and reflow

- Viewport metadata permits pinch zoom.
- Text is not fixed to pixel-only layout assumptions.
- Long words, filenames, labels, and generated copy may wrap.
- At mobile widths, multi-column regions become one column.
- The page has no horizontal scroll requirement at 320 CSS pixels.
- The relationship view, room switcher, choice cards, blocked explanations,
  privacy panel, naturalized summary, model-limit note, and concept receipt
  remain within the viewport.
- At 200% browser zoom and text-only enlargement, content remains reachable in
  named scroll regions.
- At 400% zoom-equivalent narrow reflow, no action requires two-dimensional
  scrolling to read its associated text.

The viewport contract is described structurally in
[Interaction and progressive disclosure](INTERACTION-DISCLOSURE.md).

## Color and contrast

The green, silver, gold, cream, and dark-surface palette is decorative only
after semantic labels are present. Release review checks:

- normal text at 4.5:1 or greater;
- large text at 3:1 or greater;
- essential graphical objects and control boundaries at 3:1 or greater;
- focus indicators against adjacent colors;
- selected, current, completed, and unavailable states without color alone;
  and
- text over every glass, glow, film, and hover state actually used.

Film grain and texture sit behind content and cannot lower text contrast below
the target. Glass opacity increases where a moving or detailed background would
interfere with reading.

## Motion, film, and vestibular safety

- The system `prefers-reduced-motion` setting disables continuous and
  transitional motion.
- A visible Motion control can further reduce presentation without changing
  game state.
- A visible Film control removes celluloid movement and surface effects without
  removing content.
- No required information appears only during animation.
- Focus changes, drawers, room transitions, meters, and receipts work with
  transitions removed.
- There is no flashing or rapid alternating pattern.

## Forced colors and high contrast

In forced-colors mode:

- ornamental backgrounds, film, glow, and transparency yield;
- system colors and explicit borders preserve control boundaries;
- focus indicators remain visible;
- meter values remain textual;
- file-picker focus remains visible; and
- collapsed and expanded states remain distinguishable without shadow or hue.

## Touch and pointer

- Primary buttons, room-switcher buttons, scene tabs, relationship filters, drawer
  controls, and privacy controls provide a minimum 44-by-44 CSS pixel target
  where space permits.
- Adjacent targets have separation that reduces accidental activation.
- Hover never reveals information unavailable to focus or activation.
- No drag, pinch, precise path, or multi-pointer gesture is required.

## Time and fatigue fairness

CHORUS has a logical clock, not a player deadline. The following never add
modeled fatigue or reduce follow-through:

- reading slowly;
- pausing;
- rereading a pane;
- navigating by keyboard;
- using a screen reader, magnifier, switch, voice input, or other assistive
  technology;
- opening a guide or privacy panel; and
- exploring relationships or consequences.

Only scheduled simulation exposure and accepted modeled actions affect fatigue.

## Cognitive accessibility

- Interpretive taxonomies are sealed until the conclusion.
- Active scenes separate source, seat, record, and echoes.
- Beat-local records, questions, and unknowns use stable labels.
- Blocked explanations are concise, local to the selected action, and
  reversible.
- Empty future content is not rendered as an explanatory placeholder.
- Guides provide hints rather than revealing the expected conclusion.
- Repeated instructions and duplicated destinations are prohibited.
- The completed-night view preserves one predictable order: naturalized summary,
  adjacent labelled model limit, then plain concept receipt.
- The naturalized summary is continuous prose rather than a tabset, card
  taxonomy, or visually fragmented sequence.
- Concept status and model limits use text, not color, position, or badges
  alone. Each entry renders a plain scene, effect, or action evidence sentence;
  users are not asked to interpret opaque identifier counts.

## Screen-reader disclosure boundary

Information hidden visually must also be absent from accessible names, live
regions, offscreen text, graph labels, and collapsed-but-mounted analytic
content. In particular, unrevealed cross-room identities, full linguistic
profiles, code-switch rationales, and communication classifications cannot be
leaked through the accessibility tree.

## Verification matrix

### Automated

| Contract | Evidence |
|---|---|
| Directional prelude without lesson disclosure | `tests/accessibility-disclosure.test.mjs` |
| Classification and linguistic profile gates | `tests/accessibility-disclosure.test.mjs` |
| Unique navigation destinations | `tests/accessibility-disclosure.test.mjs` |
| Relationship plot keyboard and text parity | `tests/accessibility-disclosure.test.mjs` |
| Modal isolation and focus return | `tests/accessibility-disclosure.test.mjs` |
| Metric names and values independent of color | `tests/accessibility-disclosure.test.mjs` |
| Focus, scaling, and target-size styles | `tests/accessibility-disclosure.test.mjs` |
| Operable unavailable actions | `tests/viewport-contract.test.mjs` |
| One dynamic viewport and named scroll owners | `tests/viewport-contract.test.mjs` |
| Mobile and short-landscape reflow | `tests/viewport-contract.test.mjs` |
| Tab-free naturalized summary and separate plain concept receipt in normal flow | `tests/viewport-contract.test.mjs` and `tests/accessibility-disclosure.test.mjs` |
| Reading and repeated state inspection do not add fatigue | `tests/concurrent-night.test.mjs` |

### Manual release checks

Test at minimum:

1. Keyboard-only play from prelude through one complete room, all drawers,
   relationships, blocked expansion, privacy preview, and completed-night
   summary/concept view.
2. VoiceOver with Safari on macOS and iOS.
3. NVDA with Firefox or Chromium on Windows when available.
4. Browser zoom at 200% and narrow reflow equivalent to 400%.
5. 320-by-568 portrait, a short landscape viewport, and a modern notched mobile
   viewport with safe-area insets.
6. System reduced motion plus in-application Motion and Film controls.
7. Forced-colors or operating-system high-contrast mode.
8. Long generated titles, large metric changes, open reasons, invalid save
   messages, long summary paragraphs, and every concept-status/limit shape.

Record browser, operating system, assistive technology, viewport, result, and
known limitation in the release evidence. A failed critical path blocks
release. These manual browser and assistive-technology checks have not yet been
renewed for the version-14 copy and conclusion binding.

## Known limits and reporting

Visual graph exploration is supplementary; the text relation list is the
canonical accessible fallback. Celluloid and glass effects vary by browser and
may be reduced without semantic loss. Local file-picker presentation also
varies by platform, but its label, focus, preview, and confirmation sequence
must remain intact.

Accessibility regressions should include the affected view, input method,
viewport or assistive technology, expected result, observed result, and whether
simulation state changed unexpectedly.
