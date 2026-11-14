# 2026-11-14 17:10 JST — playable frog flood and river traversal

Starting main HEAD: 0a6032afcfd5654d95e904034f89c079833a1575. Read latest 16:10 UFO handoff and ROADMAP-RECOVERY.md; checked current game.js, disaster-world.js and index.html. Disaster frequency escalation already exists in disaster-world.js and rain healing/wetland seeking already exists in game.js; do not duplicate.

Gameplay improvement: frog, giantTreeFrog and pacmanFrog can now actually enter river/canal/flood water using existing shared WATER_PLAYABLES gate. This unblocks water collision, applies swimVisual in movement, prevents forced dry-bank relocation on save resume, and permits navigation paths through water. This connects amphibian rain recovery to reachable flooded habitats instead of merely applying recovery stats near shore. Otter, hippo, carp and terrestrial land barriers remain as before. Existing UI and SAVE_SCHEMA2/permanent-death/ownership logic untouched.

Game commit 61d7ddce50d285c47b40bec23daa518514cd39d2, blob 069714e8e5adf0bcfc37ac1d965e054edb36ac6f.
Index cache commit 88e1532fbb3493b6c1a67991d0f7f7f3b3a73c30, cache ./game.js?rev=069714e8e5ad.
Tests: targeted source invariants pass (only WATER_PLAYABLES set changed, all four shared call sites remain, title UI CSS retained); mocked flood collision 7/7 pass for three frogs, otter, carp, cat water/dry. Full JavaScript syntax, browser, Android, FPS, save restoration and 2D/WebGL visual tests NOT run; do not mark verified.
Outstanding: validate real frog swimming animation, combat, depth transitions and underwater 2D/WebGL appearance, UFO formation in actual browser, 24 unpolished animals and biomes. Next implement one substantial amphibian-specific water combat/escape move with player+NPC interactions after checking the latest HEAD and regression safety.
