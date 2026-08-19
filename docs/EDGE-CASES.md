# Edge cases and failure behavior

## Purpose

This catalogue defines expected behavior when timing, access, storage,
generation, layout, or disclosure reaches a boundary. It is organized by player
effect so a failure can be distinguished from an intentional constraint.

## Generation

| Condition | Expected behavior | State effect | Recovery |
|---|---|---|---|
| Seed is 0 | Generate normally; 0 is a valid 32-bit seed. | New validated pack. | None required. |
| Seed is outside 32-bit unsigned range | Reject before generation or import. | Current night unchanged. | Use a valid seed or save. |
| Candidate fails coherence | Do not display or replace current night. | Current night unchanged. | Generate another candidate through the same gates. |
| Sparse leadership or repair structure is absent | Omit it; absence is valid. | No synthetic framework event. | None; concluding receipt may state contextual absence. |
| Pressure contour omits phases | Preserve only supported states. | No fabricated transitions. | None. |
| Instrumental actor has no pressure contour | Keep pressure state null. | No pressure receipt. | None. |
| No authored direct carrier between two rooms | Use systemic effect only. | Metrics may change; content does not cross. | None. |
| New-night random sample is zero | Use deterministic arithmetic fallback for the next seed. | New validated pack. | None. |

## Scheduling and room switching

| Condition | Expected behavior | State effect | Recovery |
|---|---|---|---|
| Player enters rooms in any order | Entry flags change; clock does not. | No choice or fatigue event. | Continue from any room. |
| Selected room's next artifact is not due | Return to house with an arrival cue; do not show empty future content. | No mutation beyond prior entry. | Switch rooms or explicitly advance the clock. |
| Clock passes several scheduled pulses | Process every due pulse once in chronological order. | Append bounded ambient events. | Continue normally. |
| Same logical minute is processed repeatedly | Idempotent result. | No duplicate pulse or fatigue. | None. |
| Player delays a room | Conditions may worsen through modeled events; choices do not expire. | Live room state changes through valid receipts. | Enter later and use remaining legal paths. |
| Room closes before the rest of the night | Freeze `atCompletion`; keep current afterimage live. | Later cross-room effects may change current metrics only. | Inspect both close and afterimage. |
| Player requests isolated room replay | Not offered. | No mutation. | Replay the complete night. |

## Choice access

| Condition | Expected behavior | State effect | Recovery |
|---|---|---|---|
| Choice is stale or belongs to another scene | Reject. | Night object remains unchanged. | Use the current scene controls. |
| Artifact has not arrived | Reject. | Unchanged. | Wait through simulation clock, not wall time. |
| Choice requirements are disconnected | Expand concise local reason. | Unchanged. | Assemble support elsewhere or choose another route. |
| Enactment is below requirement | Expand motive, emotional pressure, dominant fatigue, and capacity reason. | Unchanged. | Use a carryable action; later support may change access. |
| Player activates the same open reason | Collapse it and restore card format. | Unchanged. | Activate again to reopen. |
| Non-amplification floor under extreme fatigue | Remains available regardless of enactment depletion. | Changes only if accepted. | Use it or another accessible choice. |
| Last resort before thresholds | Hidden and reducer-inaccessible. | Unchanged. | It may become visible only under complete eligibility. |
| Last resort after thresholds | Visible as an extraordinary costly option; not required. | If accepted, persist benefit, shifted cost, and self-cost. | Continue with consequences recorded. |
| Two rapid activations | Choice lock permits one accepted transition. | At most one turn appended. | Continue at resulting scene. |

## Disclosure

| Condition | Expected behavior |
|---|---|
| Neither crossing endpoint entered | Generic mechanism cue only. |
| One endpoint entered | Same generic cue; do not reveal the other endpoint. |
| Both endpoints entered | Attributable crossing or systemic distinction may be named. |
| Content is visually collapsed | Sealed analytic content must also be absent from hidden DOM and accessible names. |
| Night is at turn 23 | Whole-night interpretation remains unavailable. |
| Night reaches turn 24 | Complete debrief becomes available. |
| Actor switched registers during play | Active surface shows concrete wording; full history appears only in concluding Interpretation disclosure. |
| Actors share a register | Do not add relationship or direct-crossing edge for that fact. |

## Browser storage

| Condition | Expected behavior | Recovery |
|---|---|---|
| Privacy panel has not been opened | No storage read or write. | None. |
| Player enables a slot but does not save | Capability exists only in panel memory; no write. | Save or close panel. |
| Browser denies storage | Report `STORAGE_UNAVAILABLE`; current night remains in memory. | Use portable text or session-only play. |
| Slot is empty | Report `SLOT_EMPTY` when directly loaded; inventory shows empty. | Select another slot or save. |
| One slot is corrupt | Inventory marks that slot invalid; other slots remain inspectable. | Clear that slot after confirmation or use another. |
| Player clears a slot | Remove only that selected key. | No application recovery is offered. |
| Browser profile or device changes | Slots do not follow automatically. | Use player-controlled portable text. |
| Private browsing discards local data | Treat as browser behavior, not a failed save promise. | Export portable text before closing if persistence is needed. |

## Portable input

| Condition | Error | Current state |
|---|---|---|
| File exceeds 512 KiB | `SAVE_TOO_LARGE` | Unchanged. |
| Invalid JSON | `INVALID_JSON` | Unchanged. |
| Foreign header or format | `INVALID_FORMAT` | Unchanged. |
| Unknown schema | `UNSUPPORTED_SCHEMA` | Unchanged. |
| Invalid or noncanonical time | `INVALID_TIMESTAMP` | Unchanged. |
| Seed outside range | `SEED_RANGE` | Unchanged. |
| Content changed without digest update | `INTEGRITY_MISMATCH` | Unchanged. |
| Digest recomputed over fabricated metrics | `STATE_INVALID` after replay comparison | Unchanged. |
| Generator version differs | `GENERATOR_VERSION_MISMATCH` | Unchanged. |
| Tree too deep, large, long, or complex | `INVALID_STRUCTURE` | Unchanged. |
| Valid file selected but player cancels preview | No error | Unchanged. |
| Valid file confirmed | Restore complete night and return to house. | Replaced atomically. |

## Responsive layout

| Condition | Expected behavior |
|---|---|
| Narrow portrait | Two-by-three room switcher above one stage scroll owner. |
| Very narrow portrait | Generated text wraps; action and reason remain within card width. |
| Short landscape | Reduce ornament and heading scale; preserve controls and internal scrolling. |
| Safe-area inset | Shell and drawer padding keep controls outside cutouts. |
| Text enlargement | Reflow to one column before clipping or page side-scroll. |
| Relationship graph too dense | Filters and text list remain available; plot stays within width. |
| Long filename in import preview | Wrap within the preview; controls remain reachable. |
| Long generated room title | Wrap in stage; compact rail may truncate only where full title is available in the destination. |
| Content exceeds a pane | That named pane scrolls; the document does not. |

## Accessibility and presentation

| Condition | Expected behavior |
|---|---|
| Reduced motion requested | Remove animation and smooth transitions without changing state or information. |
| Motion control is off | Same semantic content and focus destinations. |
| Film control is off | Remove celluloid effects only. |
| Forced colors active | Remove ornamental effects and preserve borders, text, and focus with system colors. |
| Graph cannot be interpreted visually | Use the equivalent relation list and filters. |
| Screen reader reads unrevealed content | Release-blocking defect. |
| Player reads slowly or repeatedly | No simulation fatigue or clock cost. |
| Drawer opens from any invoker | Focus close control, contain Tab, inert background, restore original invoker on close. |

## Build and source portability

| Condition | Expected behavior |
|---|---|
| Fresh source archive lacks repository-local identity | Install, build, and local development still work. |
| Optional local configuration is malformed | Fail visibly with a useful configuration error. |
| Dependency directory or build output is absent | `npm ci` and build reproduce them from manifest and lockfile. |
| Cache is absent | Installation may use the registry and integrity-pinned lockfile. |
| Advisory suggests a breaking forced upgrade | Stop and review the dependency path and compatibility; do not apply blindly. |
| Executed notebook HTML is missing | Documentation validation fails; source notebook alone is insufficient. |

## Triage order

When an edge case fails, preserve evidence in this order:

1. seed and ordered choice identities;
2. turn and logical minute;
3. current room, scene, and access result;
4. exact save error code or browser state;
5. viewport, zoom, motion, and input method;
6. console and network evidence; and
7. whether replay or a clean-source run reproduces the failure.

Do not repair a visible symptom by weakening generation, state, disclosure,
security, or accessibility validation.

