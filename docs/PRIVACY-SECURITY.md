# Privacy and security

## Summary

CHORUS is memory-first and local by design. After the application assets load,
generation, play, relationship exploration, debrief, save validation, browser
slots, and portable text require no remote service. The application does not
create an account, transmit a night, synchronize state, collect analytics, load
advertising, or write browser storage without a deliberate player action.

This document owns the data inventory, trust boundaries, threat model,
persistence behavior, deletion behavior, and security limitations. The exact
portable envelope is specified in [Portable save format](SAVE-FORMAT.md).

## Data inventory

| Data | Origin | Default location | Default lifetime | Network use |
|---|---|---|---|---|
| Generated seed and scenario pack | Local generator | Memory | Current tab | None |
| Entered-room state and selected choices | Player interaction | Memory | Current tab | None |
| Decision and effect receipts | Local reducer | Memory | Current tab | None |
| Interface state such as selected room, tab, drawer, filters, film, and motion | Player interaction | Component memory | Current tab | None |
| Browser save slot A, B, or C | Explicit player save | `localStorage` in the current browser profile | Until overwritten, cleared, or browser data is removed | None |
| Portable save text | Explicit player export | Player-selected file location | Controlled by player and operating system | None |
| Portable import preview | Player-selected file | Memory | Until loaded, cancelled, or tab closes | None |

CHORUS does not request a player's name, email address, demographic profile,
contacts, location, microphone, camera, notification permission, clipboard,
advertising identifier, or cross-site identity.

## Persistence modes

### Session only

This is the default. Importing the save module and opening the application
perform no storage read or write. Closing or refreshing the tab discards the
night unless the player has explicitly chosen another mode.

### Browser slots

The privacy panel offers three namespaced slots: A, B, and C.

- Slot inventory is not read until the player chooses **Check local slots**.
- Enabling a slot creates a short-lived in-memory capability; it does not write.
- Saving touches only the selected CHORUS key.
- Loading validates the complete slot before replacing memory state.
- Clearing requires an explicit confirmation and touches only the selected key.
- A corrupt slot is marked for review without blocking the other slots.

The consent capability belongs to the currently open panel. It is not a durable
preference or blanket permission for future writes.

### Portable text

Export creates one human-inspectable UTF-8 text file. The browser controls where
it is stored. Import follows a two-step sequence:

1. select and validate the file, then inspect a bounded preview; and
2. explicitly load the validated night.

Selection alone never changes the current night.

## Storage keys and isolation

Browser slots use only:

```text
chorus:local-save:v1:A
chorus:local-save:v1:B
chorus:local-save:v1:C
```

Inventory reads exactly those three keys. CHORUS does not enumerate unrelated
browser storage and does not use cookies, session storage, or an indexed
database for game state.

## Network boundary

The browser requests application files and may request ordinary same-origin
navigation assets. The game model itself performs no outbound request during:

- new-night generation;
- room entry or switching;
- choice acceptance;
- logical-clock advancement;
- relationship filtering;
- debrief construction;
- browser-slot inspection, save, load, or clear; or
- portable save creation, inspection, or restore.

No remote endpoint receives the seed, decisions, fatigue, relationships,
receipts, save preview, or imported file.

Network behavior should be verified from a production build with browser
developer tools, not inferred only from source search. See
[Testing and traceability](TESTING-TRACEABILITY.md).

## Threat model

### Protected assets

- the player's choice history and inferred play state;
- the integrity of deterministic replay;
- the current playable night;
- other data in the same browser profile;
- availability of the interface after malformed input; and
- the disclosure boundary between active play and the conclusion.

### Untrusted inputs

- portable text selected from disk;
- data already present in a CHORUS browser slot;
- stale or fabricated action identifiers presented to the reducer;
- malformed generator seeds or non-finite coefficients during development; and
- generated copy that might accidentally contain restricted or identity-bearing
  terms.

### Out of scope

CHORUS cannot protect a save file after the player shares it, a compromised
browser or operating system, malicious extensions with page access, physical
access to an unlocked browser profile, or modification of the application
bundle before it reaches the browser.

## Import defenses

Portable input fails closed through layered checks:

1. maximum UTF-8 size of 512 KiB;
2. optional CHORUS header or direct JSON opening;
3. JSON parse with plain-object requirements;
4. maximum depth of 48;
5. maximum 80,000 traversed nodes;
6. maximum 32,768 characters per general input string;
7. maximum 1,000 values per general input array;
8. maximum 128 characters per field name;
9. exact format and supported schema version;
10. strict provenance and timestamp shape;
11. finite, bounded seed, clock, turn, metric, reach, fatigue, and collection
    values;
12. current generator-version match;
13. deterministic corruption check;
14. room, scene, choice, effect, support, register, conversation, pressure, and
    event shape validation;
15. full state validation against a newly generated pack; and
16. event-by-event reconstruction whose canonical result must equal the import.

Recomputing the checksum is insufficient to authorize fabricated state because
the state must reproduce from authored choices, timing, and the current
generator.

## Integrity limitation

The save uses FNV-1a over canonical JSON as a deterministic corruption check.
It detects ordinary modification and supports reproducible fixtures. It is not
a digital signature, message authentication code, encryption method, or proof
of authorship. Anyone who can edit a file can also calculate a new checksum;
replay validation is the stronger application-level control.

Portable saves are readable text and contain the complete represented night
state, including decisions and receipts. Players should treat the file as they
would any personal gameplay record.

## Rendering and injection boundary

Portable input does not supply a new executable scenario grammar or arbitrary
markup. The current generator reconstructs the pack from the seed, validates
identifiers and event history, and renders ordinary framework text nodes. Story
content is not inserted as raw HTML.

Generated authored copy is also checked against restricted real-platform,
operational, and non-PG term sets before a pack can be played.

## Availability and denial-of-service controls

Byte, depth, node, string, array, and ledger-count caps bound import work. Turns
are limited to 24; elapsed logical time is bounded to one day; ambient events,
effects, support paths, and strings have explicit maxima. A rejected import
leaves the current memory state unchanged.

The generator validates one candidate before replacing the current night.
Repeated DOM reads and repeated advancement to the same logical minute are
idempotent and cannot accumulate simulation load.

## Deletion and retention

- Session-only data disappears when the tab is discarded.
- A browser slot remains until the player clears that slot, overwrites it, or
  removes site data through the browser.
- Clearing a slot is immediate and cannot be undone by CHORUS.
- A portable file is outside CHORUS after download; delete it through the file
  system and any backup or synchronization service chosen by the player.
- CHORUS has no remote copy to delete and no recovery service for a lost save.

## Dependency and build security

- Exact versions and integrity records are committed in the lockfile.
- Installation scripts are reviewed and pinned narrowly rather than approved
  as a blanket category.
- Dependency advisories are inspected before release; forced major upgrades are
  not applied without compatibility review.
- Production and development exposure are assessed separately.
- A clean source archive is verified to install, build, test, and start without
  repository identity or local cache state.
- Generated build directories, credentials, logs, dependency directories, and
  local runtime state are excluded from source archives.

The complete update and audit procedure is in
[Dependencies and supply chain](DEPENDENCIES-SUPPLY-CHAIN.md).

## Security regression requirements

A release is blocked by:

- a storage read or write before player action;
- a write outside the selected slot;
- a portable import that mutates state before confirmation;
- acceptance of an oversized, deep, foreign, unsupported, non-finite, or
  irreproducible save;
- a stale, early, locked, or duplicate choice that changes the night;
- imported raw markup or script execution;
- a network transmission of night state;
- premature analytic content in hidden or accessible markup; or
- a clean source archive that depends on omitted repository identity.

## Reporting

A useful report includes version or commit, browser and operating system,
whether the issue concerns session state, a named slot, or portable text, exact
steps, expected result, observed result, and whether state or unrelated browser
data changed. Do not attach a personal save unless its complete contents have
been reviewed and intentionally shared.

