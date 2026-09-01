# Privacy and security

## Summary

CHORUS is memory-first and local by design. After the application assets load,
generation, play, relationship exploration, completed-night summary and
concept derivation, save validation, browser slots, and portable text require
no remote service. The application does not
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
| Interface state such as selected room, scene tab, drawer, filters, film, and motion | Player interaction | Component memory | Current tab | None |
| Naturalized summary and plain concept receipt | Pure derivation from validated completed pack/state | Component memory | Current view; reconstructable | None |
| Browser replay-trace slot A, B, or C | Explicit player save | `localStorage` in the current browser profile | Until overwritten, cleared, or browser data is removed | None |
| Portable numeric replay trace | Explicit player export | Player-selected file location | Controlled by player and operating system | None |
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
- Saving writes only the selected schema-2 CHORUS key and retires that selected
  slot's schema-1 key if present.
- Loading validates the complete slot before replacing memory state.
- Clearing requires explicit confirmation and removes both versioned keys for
  only the selected logical slot.
- A corrupt slot is marked for review without blocking the other slots.

The consent capability belongs to the currently open panel. It is not a durable
preference or blanket permission for future writes.

### Portable text

Export creates one human-inspectable UTF-8 text file containing a seed, logical
time, entered-room ordinals, and numeric decision coordinates. It contains no
generated prose or derived analytic state. The browser controls where it is
stored. Import follows a two-step sequence:

1. select and validate the file, then inspect a bounded preview; and
2. explicitly load the validated night.

Selection alone never changes the current night.

## Storage keys and isolation

Current browser slots use:

```text
chorus:local-save:v2:A
chorus:local-save:v2:B
chorus:local-save:v2:C
```

Inventory may also read the matching `chorus:local-save:v1:A`, `:B`, or `:C`
key when the current key for that slot is absent. These are migration candidates
for the earlier complete-state format. Reads and in-memory migration never write
or delete them. An explicit save writes the selected v2 key and then removes the
selected v1 key if present; explicit clear removes both keys for that selected
slot. CHORUS never enumerates unrelated browser storage and does not use cookies,
session storage, or an indexed database for game state.

## Network boundary

The browser requests application files and may request ordinary same-origin
navigation assets. The game model itself performs no outbound request during:

- new-night generation;
- room entry or switching;
- choice acceptance;
- logical-clock advancement;
- relationship filtering;
- naturalized-summary and plain-concept-receipt construction;
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
- the disclosure boundary between active play and the conclusion, including
  the source-bound summary and concept statuses.

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
9. exact format, header agreement, and supported schema version;
10. exact top-level, provenance, payload, coordinate, and integrity keys;
11. strict provenance and timestamp shape;
12. finite, bounded seed, clock, room ordinals, choice ordinals, start minutes,
    and coordinate counts;
13. sorted unique entered-room ordinals;
14. current generator-version match, presently version 15;
15. deterministic corruption check;
16. coordinate-by-coordinate reconstruction through the current reducer;
17. rejection of stale, early, locked, reordered, or out-of-range choices;
18. final entered-room and runtime-invariant validation; and
19. for schema-1 or schema-0 input only, validation of the original checksum,
    complete state, and canonical legacy replay before trace migration.

Replay prevents an editor from injecting arbitrary metrics, receipts, prose, or
an impossible history. A recomputed checksum can still describe a different
valid history. CHORUS does not treat that trace as authenticated or true.

## Integrity limitation

The save uses FNV-1a over canonical JSON as a deterministic corruption check.
It detects ordinary modification and supports reproducible fixtures. It is not
a digital signature, message authentication code, encryption method, proof of
authorship, or truth claim. Anyone who can edit a file can also calculate a new
checksum. Replay establishes only that the numeric trace describes a possible
night under the stated generator.

Schema-2 saves are readable text but contain only the minimum replay projection:
seed, final modeled time, entered-room ordinals, and numeric choice coordinates
with start times. They do not directly store generated narrative or conclusion
copy. This is data minimization, not secrecy: the seed, trace, and matching
CHORUS code are sufficient to reconstruct the represented night. Players should
treat the file as a gameplay record they control.

## Rendering and injection boundary

Portable input does not supply a new executable scenario grammar or arbitrary
markup. The current generator reconstructs the pack from the seed, validates
identifiers and event history, and renders ordinary framework text nodes. Story
content is not inserted as raw HTML.

Generated authored copy is also checked against restricted real-platform,
operational, and outside-PG-bounded term sets before a pack can be played.

## Availability and denial-of-service controls

Byte, depth, node, string, array, and coordinate-count caps bound import work.
Turns are limited to 24; elapsed logical time and every decision start are
bounded to one day. Legacy state, event, effect, support, and string limits remain
in place only for the documented migration path. A rejected import leaves the
current memory state unchanged.

The generator validates one candidate before replacing the current night.
Repeated DOM reads and repeated advancement to the same logical minute are
idempotent and cannot accumulate simulation load.

## Deletion and retention

- Session-only data disappears when the tab is discarded.
- A browser slot remains until the player clears it, saves over it, or removes
  site data through the browser. Explicit schema-2 save retires a matching
  schema-1 value only after the new selected-slot write succeeds.
- Clearing a slot removes both current and legacy keys for that logical slot. It
  is immediate and cannot be undone by CHORUS.
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
- generated or analytic string values in a schema-2 payload;
- an unknown schema-2 field accepted after checksum recomputation;
- a portable import that mutates state before confirmation;
- acceptance of an oversized, deep, foreign, unsupported, non-finite, or
  irreproducible save or mismatched header;
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
