# PHASE A — cross-key save conflict guard (2026-11-12 16:10 JST)

Implementation: 1fc6ca68830b876d2e97c11b69492aa9b5ffe6aa
Publication revision: 554123c746fab11c831ba8c1e1b8c0d4b5c6e685
game.js blob: b50c51a51d8328b09742b044b467f6f008f4208a

Change: When a valid shared pantry and valid world autosave disagree on meat/berries/legacy counts at Continue, preserve both and mark the session conflicted. Subsequent world autosave and shared pantry writes are rejected rather than silently converting the disagreement into a new durable state. Conflict flag resets only on a fresh restoreSharedDen call; the existing UI layout, roster, death IDs, and SAVE_SCHEMA2 are unchanged.

Checks: JavaScript Function parse passed, five focused static invariants passed, GitHub game.js blob and index.html cache revision re-fetched. No browser/Android playtest, storage quota fault injection, or crash simulation performed.

Pending: transaction journal for world/pantry writes and safe replay or rollback; test corruption/quota/interruptions; ensure recovery does not resurrect dead/released individuals. Next: implement and test cross-key interrupted-write journal, preserving raw bytes and current roster safety.