# 2026-11-15 11:10 JST — P2 four-specialist bestiary/gacha integration (PARTIAL)
Start HEAD 251a3669b5aafec32fa2399f466b84f9a8862444; ROADMAP-RECOVERY.md, latest history, commits, index, bestiary, gacha, fauna/game and regression checked. No UI layout, title/menu, schema2, 3+3 roster, or existing game assets changed.

## Player-facing integrated implementation
- `bestiary.js` commit 4f4265abe67aa80ee0b254a0d1a0675e02a72679: all four specialists (manul, Tibetan fox, shoebill, penguin) are now real catalog entries; successful ownership reveals a species in the 2D/WebGL preview, while defeat counts remain separate and accurate. Read-only migration of already-owned animals from existing squad. Separate `wild-reclaim-bestiary-owned-v1` localStorage key; does not modify existing saves or death tombstones.
- `squad-gacha-ui.js` commit dd6e2f8c8dd7e69f88a3f192ed1076e40b00a185: after successful initial adoption and successful refill, connect actual gacha confirmation to `WildBestiary.recordAcquired`. No registration for rerolls, rejected adoption or canceled draw.
- `index.html` cache activation commit 5b97281efa57846a7e1aecdd03ec3758686122fa; source SHA `b59ee9227ba7cb9580e3127c448d7e63ca8caed2`, `c6e2fd6df75ee37d42027d7ab421dadd35697008`.
- Runnable headless regression file `p2-bestiary-acquisition-regression.js` commit 561bac0e1a9db6391d1de680a238a7d4a919cffd, command `node neo-wild/p2-bestiary-acquisition-regression.js`.

## Verification
- Real source syntax via JS Function constructor PASS for both modified modules and regression script.
- Isolated in-memory localStorage and stub DOM execution PASS: module startup with no canvas, migration of existing manul, locked unowned penguin, successful penguin acquisition, separate defeat count, persistence after reload.
- Regression script committed but Node CLI was NOT executed. Source checks for both real gacha callsites, not an end-to-end simulated DOM click. Browser/WebGL/Android/FPS NOT RUN.
- P1 implemented but real browser unverified. P2 completed batches 0, unfinished species 24. Four-species batch partial; do not mark accepted until real combat/terrain/3D game loop plus gacha DOM and bestiary flow tested. P3-P8 pending.

## Next large deliverable
Finish four-species playable end-to-end encounter: actual player-controlled attacks and wild AI through collision/cooldown, 2D/WebGL, gacha ownership and bestiary interaction. Add runnable regression, preserve old saves and all UI layout. Do not repeat previous partial bestiary work.
