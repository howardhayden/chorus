# ADR 0005: Memory-first, player-controlled saves

- Status: Accepted
- Date: 2026-08-18

## Context

A social-trust simulation can produce a detailed choice history. Persistence
should not be assumed merely because browser storage is available.

## Decision

Default to tab memory. Read browser slots only when the player requests an
inventory. Require a short-lived per-slot capability before write or clear.
Offer portable UTF-8 text with validation and preview before restore. Perform no
network write.

## Consequences

- Refreshing can lose an unsaved session, which the privacy panel states.
- Local slots remain device and browser-profile specific.
- Portable files are readable and player-controlled, not encrypted.
- Import must be bounded, versioned, integrity-checked, and replay-validated.
- There is no remote recovery service.

## Alternatives considered

- Automatic local saving was rejected because silence is not consent.
- Account synchronization was rejected because it adds identity, retention, and
  network boundaries unnecessary to play.
- Direct import without preview was rejected because file selection should not
  mutate state.

See [Privacy and security](../PRIVACY-SECURITY.md) and
[Portable save format](../SAVE-FORMAT.md).

