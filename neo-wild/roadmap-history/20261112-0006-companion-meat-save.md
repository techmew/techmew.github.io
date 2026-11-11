# PHASE A — Den companion recruitment is save-safe (2026-11-12 00:06 JST)

Baseline main HEAD 390957ef4f117b0b2f525e40a2d65b89c104f985; read recent commits, ROADMAP-RECOVERY.md, 20261111-2325-boss-offer-retry.md, current game.js blob 6e9d9e5881f39559d623002750053a32ce370e36 and index.html blob 0e1730ad23d4558f79089eec3460938c392df6c8.

Problem: recruitCompanion spawned an ally, deducted 24 meat, then ignored pantry and autosave failures. Meat lots also retained stale quantities. This allowed free companions, food loss, and a mismatched shared-den inventory after reload.

Change: recruitment now deducts the actual 24pt from meat lot detail, commits shared pantry first, spawns ally only after successful pantry save, and rolls back ally and pantry on world autosave failure. Failed rollback warns the player to protect JSON backup. Existing UI, roster, save schemas, irreversible IDs and other paths unchanged.

Game commit 87f6c4f627fec0042699ebfa8e217f35f8653fa3 (game blob 8ac8e91a176257e4e9864543557a9dd61390bde0).
HTML cache rev commit 41a6d355f64f7c9f4ebb5968c6f1055a7d8f994e (index blob 0cf48f863db7cf2e8597d178122dca7d45f7b514).
Validation: full game.js parsed; meat-lot accounting mock 4 cases; extracted live recruitment function mock tested successful purchase, pantry failure, autosave failure (12 checks); game and HTML re-fetched, rev matched. Not Android or browser tested.

Remaining: pantry rollback itself can fail when storage is full; player receives warning. Future improvement: durable transaction log / restore reconciliation for simultaneous autosave and pantry writes. Next: test and fix takeMeatFromDen and eatFromDen atomic save failures and cross-tab recovery.
