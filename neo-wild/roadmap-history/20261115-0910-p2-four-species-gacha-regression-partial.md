# 2026-11-15 09:10 JST — P2 four-species playable acquisition and regression integration (PARTIAL)

Starting main d154da3d190b57e792588ab073931b5c8ee47b8c. Read ROADMAP-RECOVERY.md, latest 20261115-0852 UFO handoff, prior 0710 P2 terrain patrol handoff, latest commits, game/fauna/WebGL/squad/gacha modules. Prior commits preserved; title/menu/roster layout unchanged.

## Player-visible implementation
- Penguin was already playable in game.js and modelled in fauna.js and WebGL, but squad-core.js gachaReady excluded it, making it impossible to acquire through the actual gacha. Now enabled with other three specialist species. Existing 7-year rare unlock, weighted draws, 3 ordinary slots, and legacy 4/5 saves remain unchanged.
- Penguin now has a distinctive Canvas gacha preview fallback (webbed feet, dark body, white chest, articulated flippers, orange bill). Existing native WebGL preview takes precedence; no generated images.
- Changes: squad-core.js commit 30ea10731282e124b4edf945c5751734a26e2caa; squad-gacha-ui.js commit 65931507ae51fa59fae57b8357a0fe0a7ca7c50a; index.html asset revisions commit 0eed7abe24bd354aa1bc03d886b9ce40c037ffd8.
- Executable regression file p2-four-species-regression.js commit 4c276124a8f83d5aaff302a79dd9b32b6515e22d; uses the real three JS modules and an isolated memory store, does not touch actual saves.

## Tests / acceptance
- JavaScript new Function parser PASS for modified squad-core.js, squad-gacha-ui.js and real regression modules.
- Isolated regression PASS: four species playable and in gachaReady, all four appear in weighted draws after unlock, combat variants and fauna roster present, three-slot new squad, persisted leader change, irreversible death tombstone, stale save cannot resurrect dead ID, Canvas 2D drawing produces 47 ellipse primitives across four species.
- Full live game loop including 3D render and terrain hunting not executed; real browser, Android, FPS, old SAVE_SCHEMA2 import, 100-year boss not tested this run. Source still has prior 2D/WebGL and terrain/AI code. No claim of complete batch acceptance.
- P1 source implemented / browser unverified; P2 completed batches 0, unfinished species 24. This four-species batch is IMPLEMENTED IN PART / UNVERIFIED as a whole. P3-P8 pending.

## Next large epic work
Finish four-species batch by executable integrated game-loop tests of attacks/AI/collision and actual 2D/WebGL scene, ensure bestiary and gacha flows under player ownership. Then mark accepted or retain precise failures. Do not repeat UFO work, tweak a single pose, or alter title UI.
