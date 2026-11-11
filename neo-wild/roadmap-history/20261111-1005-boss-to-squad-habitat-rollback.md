# PHASE A: boss-to-squad leader switch safety (2026-11-11 JST)
Baseline HEAD b9553efad9b9b436d42a09058c3d91440922319c. Read latest commits, roadmap-history, ROADMAP-RECOVERY.md, boss-roster.js (blob 5c2b6abdd252100a3f6dcb5022ce4fee3b43f954), game.js (blob 926796987ecc1418c2948edb9488dc4e5f892304), and index.html.

Found a player-facing bug in applySquadLeader(): when switching from a boss to a normal squad animal, a failed ensureOwnedAnimalHabitat() returned false after mutating P, choice and bossIndividualId. The player could remain an unplayable/stranded normal animal while the outgoing boss state was lost from the live actor. Boss vitals were also written before the incoming placement succeeded.

Fixed by snapshotting the outgoing actor and choice, rolling both back on failed habitat placement, and postponing boss vitals persistence until successful switch. Existing UI, normal 3 + boss 3 slots, permanent death IDs, old saves, clock and world state untouched.

Code commit 3a1074b43480998a5a223a5150b600fd44c8f678; game blob f85ee23b4a44432399e5a981d6dcabd61fb2ea3c.
Cache commit 24372a1a0329a74fe6da0d05d9b06890a5957e79; index.html game.js?rev=f85ee23b4a44.

Tests: full JavaScript syntax parses. Extracted applySquadLeader() mocked failure: returned false, restored oldBear boss ID, no boss vitals write, no autosave. Mocked success: switched to cat, wrote outgoing boss vitals and autosaved. Re-fetched game and HTML SHA/rev. GitHub Pages action observed in progress; live browser/Android and old save E2E unverified.

Next priority: cover reverse boss selection failures and ensure roster activeId remains consistent if placement fails, without changing existing menu. No user action required for this code patch; Android old-save testing remains useful.
