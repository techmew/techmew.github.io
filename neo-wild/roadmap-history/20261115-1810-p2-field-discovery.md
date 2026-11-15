# 2026-11-15 18:10 JST — P2 four-specialist field discovery, bestiary and hunt integration (PARTIAL)

Starting main 83fca87d554a0ee08e65e67d62f92046bc8830a7. Reviewed ROADMAP-RECOVERY, 17:10 and 16:10 handoffs, durable survival handoff, recent commits and game/fauna/WebGL/index/bestiary. Existing title, menu, 3+3 slots, 35 species, SAVE_SCHEMA2, prey corpses and gacha odds unchanged.

## Newly playable integrated experience
Player can approach any living wild manul, tibetanFox, shoebill or penguin within 245 world units with clear LOS, identify it in the world, and immediately unlock its name and 2D/WebGL preview in the persistent bestiary. Game update(dt) checks encounters every 0.9s; no extra spawn, no automatic ownership, kill reward or gacha ticket. New sightings-v1 key is independent of autosave and owned/kill counts, so older saves stay intact. Existing wild hunting, corpse claim, theft, transport and feeding remain operational. Acquisition via gacha still unlocks independently, and real kills still increment separate kill counts. The four specialists now have a player exploration-to-encyclopedia loop rather than only being discoverable by gacha/defeat.

## Commits
- bestiary.js 6a6d66811f5eaab78b7a2e159e7ec203ae0a0c29 blob eef7374f1e7619c878aebeb47eedadbc9613086b
- game.js 4c622ec7faf2e4c608ee2ce7fe976b6d52b2d139 blob 6256db92d2cda1dca30ad1ca8cb06772f663aa17
- index.html 460f9b8a8c9cbf6b588165a6f86959f11919c731; game.js?rev=6256db92d2cd and bestiary.js?rev=eef7374f1e76

## Executed checks
- V8 real game.js and bestiary.js full syntax: PASS.
- Isolated real bestiary module + extracted real update(dt) hook: 22 checks PASS, all four species, sightings persist, duplicate suppression, no false kill or ownership, LOS blocking and range.
- Existing four-species core/gacha/death/2D regression: PASS this run (V8 shim). Existing bestiary acquisition regression PASS. Specialist kill-to-food 44 checks, survival 96 checks, animation 39 checks PASS this run (V8 shim). These are source-based isolated mocks, not a real browser.
- Legacy SAVE_SCHEMA2 import, actual localStorage quota failures, 3D rendered pixels, mobile, FPS, long run and 100-year boss not executed this run. No false acceptance.

## Status / 35-species ledger
11 baseline: 既存・今回未検証. Four focus manul/tibetanFox/shoebill/penguin: 実装済み未検証 (real browser acceptance pending). Other 20: 要実装. P2 completed batches 0 / unfinished 24. P1 source integrated but browser-unverified; P3-P8 pending.

## Next one major deliverable
Finish four-species real browser attack/kill/food/3D render + gacha/bestiary + save/reload/legacy compatibility in one end-to-end acceptance batch; do not rework small animation values. If real browser cannot be run, document the limitation and continue a different multi-species batch rather than loop on micro-tweaks. User action: none.
