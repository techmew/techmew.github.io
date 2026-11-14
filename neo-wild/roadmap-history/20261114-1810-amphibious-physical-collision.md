# 2026-11-14 18:10 JST — actual player/NPC amphibious collision

Latest main at start: a41a87f87fc1a2f9273eca4c3dfad3489583e00a. Read ROADMAP-RECOVERY.md and 17:10 handoff. Discovered prior 17:10 change added frog species to WATER_PLAYABLES, but the real move(o,dx,dy) allowed() gate still hardcoded only otter and hippo. Thus the claim that frogs could swim was not actually true for physical collision.

Gameplay: connect WATER_PLAYABLES to the actual move() water collision path for all player movement inputs (touch, pad, keyboard). Wild NPC frog/giantTreeFrog/pacmanFrog/otter also enter shallow-to-medium water up to depth .65, including existing wetland escape leaps and hunting movement; other land wildlife still blocked. Carp remains water-only and shoebill shallow-only; all existing gameplay and title UI preserved. This is a real physics/movement fix, not a cosmetic roster update.

Game commit 5c54ae0d8ec51859e3221ada38e82a6294b9f2e1; blob d67dafce832df9127dded570fbf9d610246252a3.
Cache commit 4c9972d5370dc4063bdc50eb7bb3c17c88303120; index blob dc92b7e05a846df4e1ca9f5bf99af2da3815fdb6.
Static regression assertions: exactly one intended replacement in game.js, WATER_PLAYABLES and existing wild frog leap remain, all other source unchanged, index has only one script revision replacement. Full JS syntax, live browser, Android, 2D/WebGL appearance, collision runtime mock, save restoration and FPS are NOT verified.
Outstanding: run actual browser collision and visual tests; verify wild frog depth transitions and safe bank exit. Then implement amphibian-specific water combat and player/NPC escape interaction with real hitboxes and cooldowns. Do not change title UI or SAVE_SCHEMA2/permanent death IDs.
