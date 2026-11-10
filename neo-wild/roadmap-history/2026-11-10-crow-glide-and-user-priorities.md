# Crow glide and current priorities

Commit: 20f29924ea391b9dd1482abd788d4003a07b82b9

Implemented: crow flight cruises at altitude 112+, reduces flight stamina drain from 30/s to 7/s; climbing crow costs 15/s. Pigeon unchanged. Existing UI and save schema unchanged.

Verified: JavaScript parse using new Function on updated full game.js before commit. No browser/Android playtest. No Pages deployment confirmation.

Next: inspect boss actor IDs and rendering mapping; repair per-boss geometry, attack visuals and debug spawn. Then crow aerial small-prey capture/eat with hunger and HP gains. Temporarily disable carp for new play until continuous water stage exists; preserve historical saves and individual IDs, do not delete or rewrite old carp records. Validate game start/continue and roster paths before implementing carp gate.

User action: none for code changes; Android playtest later.
