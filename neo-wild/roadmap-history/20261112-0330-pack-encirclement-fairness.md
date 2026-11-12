# PHASE A — Pack encirclement fairness (2026-11-12 JST)

Baseline main 7108c2330262d0129391425fdeed8a1de04458e7. Read latest commits, 20261112-0230-pantry-world-mismatch-warning.md, ROADMAP-RECOVERY.md; game.js blob 17abd66230e2eff6010496e613f673448af3985a, pack-tactics.js blob 85b4d13747e001a9550f80cdaf4df1de1b5a866b.

Gameplay: hostile pack encirclement now requires two visible, alerted pack members separated by >=2.1 radians (about 120 degrees) around the player, rather than >0.62 radians (36 degrees). Dogs pursuing from one side or at a right angle can no longer falsely trigger the unavoidable-looking 0.9-second warning and hit. Genuine opposed flanks still warn and hit; hiding, escaping, pack cooldown and movement remain unchanged.

Game commit 6b057ed03e75a2249963b13e5f96c5c12ac9d5b0, new pack blob be5a9bbf74a83e8b1a5e0fd64013130f49437ed4. HTML revision commit 7cc50bafa9d35f4c8ce4da4bfa854d453ab2ff83; index.html pack rev updated to be5a9bbf74a8. GitHub file and HTML re-read confirmed.

Full pack-tactics.js syntax parse passed; nine isolated behavior assertions passed (same-side, opposite, 135 degree, right angle, no flank, range, no false ambush, true hit, hiding). No actual browser/Android playtest.

Remaining: two-key pantry/world save interrupted-write journal and verified crash recovery still unimplemented; mismatch detection is already implemented. Next priority: implement narrowly scoped, tested durable journal for meat withdrawal/deposit without overwriting older saves or permanent IDs. No user action required.
