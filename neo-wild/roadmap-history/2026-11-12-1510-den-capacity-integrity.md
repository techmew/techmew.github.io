# PHASE A / den capacity integrity

Implementation: c7ad65b07f587f776e42ee747ad8651514f0056b
Publication revision: 738ee54ae92b941b5c113d57b9d057a239335c55
game.js blob: e2f6de09ba05d5b125214ee4f4bcb65b6a3b6b5b

Changed: Shared pantry refuses a durable save when combined meat, berries, and legacy food exceed actual den capacity. Previously only individual nonnegative totals and meat-lot equality were validated, allowing overfilled stores to be serialized and later silently truncated on load. This prevents disappearing food after a full den deposit. Save failure remains visible to the player. Existing menu and roster unchanged.

Tests: Entire 595 KB game.js parsed with JavaScript Function constructor. Five focused positive/negative capacity and meat-lot cases passed. Updated game.js and index.html blob SHAs and script rev re-fetched. Pages deployment pending at verification time. Browser gameplay, Android device and crash interruption untested.

Pending: interrupted cross-key world/pantry writes, recovery journal, crash/quota tests, full browser gameplay. Next priority: safe cross-key recovery without resurrecting dead/released animals.
