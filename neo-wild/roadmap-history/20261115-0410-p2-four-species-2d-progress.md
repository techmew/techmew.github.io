# 2026-11-15 04:10 JST — P2 four-species batch PARTIAL

Starting main 90efa9a71d6fe3571b2c1df898f12422d7d1f800. Previous combat commit 1327d48 preserved.

Implemented: Canvas fauna.draw2D now has separate manul and Tibetan fox anatomy, tail, walking legs and actual attack-driven foreleg extension/claw animation. Both are reached by the existing WildFauna.draw2D renderer entry point. Shoebill and penguin already had distinct 2D silhouettes. Existing WebGL specialist models for manul, Tibetan fox and shoebill, and habitat meshes for penguin, were inspected but NOT changed in this run.

Implementation commit 6c8cf972d3e9178479fff8c40c8e7c9df10b1f78; index cache commit 842b021b360841b98a119225a9c074bca66b7aee (fauna rev 717df4940c08).

Validation: V8 new Function JavaScript parse PASS for entire fauna.js. Canvas mock draw2D with real swing and movement state PASS for manul and tibetanFox (27 drawing operations each). Full browser/WebGL/game loop integration, save compatibility, Android, FPS NOT RUN. No changes to title/menu/party/save logic.

P1: source implementation, browser unverified. P2: 0 completed batches, 24 animals remain under acceptance criteria. Current batch four: manul, tibetanFox, shoebill, penguin. Status: 2D anatomy implemented; full acceptance NOT MET. Next: finish four-species 3D attack body pose, player and wild combat paths, terrain-aware AI, gacha/bestiary integration with executable regression tests. Do not count this partial as completed or repeat 2D work.

P3-P8: not started under this roadmap.
