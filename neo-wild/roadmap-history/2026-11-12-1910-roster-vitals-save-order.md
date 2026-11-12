# PHASE A / verified roster vitals autosave guard (2026-11-12 19:10 JST)

Implementation: 9185b6e371dc5b78a1927accde2f56098399928c
Publication revision: c9ac0d121a515585dce6923e0c9fd2ff2128b0b1
game.js blob: 3a55dc0e5fd4d74f12ca499776cbd542e0bf0e1a
index.html blob: b78650f8826504889701b31a819d5e78ff174719

Change: The active squad HP/level/XP roster write now happens only after the world autosave has passed durable readback. Before this change a quota failure, interrupted write, or concurrent autosave could still advance roster vitals while Continue retained the older world snapshot. No changes to UI, roster slots, dead/released ID rules, or SAVE_SCHEMA2.

Checks: Full game.js compiled using JavaScript Function constructor. Five mocked saveAuto branches passed: success, quota before write, interruption after write, readback mismatch, and concurrent replacement. Verified game.js and index.html blobs and HTML rev on main. No browser/Android gameplay or true browser-kill test.

Pending: atomic world/pantry transaction journal, cross-key interruption and quota tests, save/roster cross-tab races, Pages live delivery and Android playtest. Next: implement a safe cross-key recovery journal without reviving permanently dead or released IDs.
