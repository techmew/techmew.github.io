# 2026-11-15 16:10 JST — P2 four-species live strike/Canvas/WebGL integration (PARTIAL)

Starting main d548ce8d3ba5dc7b936e6c78f80e83e67059b8d4. Reviewed ROADMAP-RECOVERY.md, previous four recent P2 handoffs, last eight commits, game.js, fauna.js, webgl3d.js, index.html. Preserved previous durable meat/den implementation and old SAVE_SCHEMA2, menus, roster and death IDs.

## What changed in actual game loop
The existing four specialist NPCs (manul, tibetanFox, shoebill, penguin) already perform real prey hunting and carcass/food transport encounters, but their combat animation timers were NEVER decremented for NPCs, leaving forepaw, beak and flipper permanently extended after attacks. The Canvas2D renderer also explicitly ignored NPC attackAction, while WebGL3D already had species-specific articulated strike models. This created a visible disconnect between real damage and the animal body.

- game.js now advances all four NPC combat pose timers on every live frame BEFORE feed/ambush/far-AI early returns. No new save schema fields or global attack stats.
- Canvas2D now uses the actual NPC attackAction for the four specialists, translating and rotating the full body with timed recoil; existing species-specific 2D silhouette rendering continues to animate paws/beak/flippers.
- WebGL existing 3D model motion now returns to idle because the same live NPC strike fields expire. Player attacks and world physics remain intact.
- No new UI or images. No reimplementation of the prior food storage feature.

## Commits
- Initial integrated animation f907a915e927d0833ab10f73e271dd7dedae3453
- Early-return-safe animation correction 1047a333e05ec8280f26df4d36b704a3a27b746c
- Source-executed animation regression 1517fc51c927679bb4766471d5371e0d0d48fe42 (p2-specialist-animation-regression.js)
- index cache abc31714b1e1048c6cc27960e2a6d9187dadee2c; game.js?rev=41bd03eb8db7
- game.js blob 41bd03eb8db76cd607058388c42672ca31647cd4

## Verification and limits
- Full modified game.js: V8 new Function parse PASS.
- Executed extracted real NPC animation timer code for four species with V8: all five pose fields reset, combo clears, pause does not advance. PASS.
- New Node-compatible regression executed in V8 shim: 39 checks PASS including Canvas/WebGL source wiring, real timer and pause behavior. Node CLI not run.
- Previous survival loop 96 checks PASS in previous run; not rerun after this patch.
- Real browser Canvas pixels/WebGL frame rendering, mobile, FPS, long run, actual legacy save import, NEW GAME/100-year boss NOT RUN. Do not infer full P2 acceptance from source mocks.
- 35 playable species: baseline 11, focus four implemented but browser-unverified, other 20 unverified/uncompleted. Accepted P2 batches 0 / unfinished 24.

## Next major batch
Complete actual four-species hunt/bite/death/visual rendering + gacha/bestiary and legacy save/browser acceptance in one end-to-end test if browser available. Then progress to a DIFFERENT 3-5 species batch. Do not spend next run on another pose timer or micro-adjustment. P1 source integrated/browser unverified; P3-P8 pending. No user action.
