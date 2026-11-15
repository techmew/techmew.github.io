# 2026-11-15 13:10 JST — P2 four specialist food-web integration

Starting HEAD: 8726c3d1f544a719fdb98337ce9b19c82c743fb4. Inspected ROADMAP-RECOVERY.md, latest 1210/1110 histories, commits, game.js, fauna.js, webgl3d.js and existing P2 regressions. Previous 12:10 NPC damage changes existed but the four species were ABSENT from WILD_PREDATOR_TYPES and WILD_DIETS, so the live huntWildPrey() returned immediately. This is a major functional wiring omission.

## Actual new player experience
- manul, tibetanFox, shoebill and penguin are now in the live NPC predator food web, with distinct small-prey diets, terrain/depth limits and chase speeds.
- Their wild attack damages live non-owned prey, activates visible species-specific 2D/WebGL strike pose fields, respects cooldown, leaves exactly one edible corpse and starts the existing predator carcass claim/feeding route.
- No fake player trophies or XP. Existing ownership exclusions, player 3+boss 3 roster, death records, save schema and title/menu layout unchanged.
- Implementation 0377aac93076dc3fa0935409a63bd7cc3d76593b; game.js blob c00b78d392b9ca1b325abe388965668450bc39ed.
- Cache 6461a98da0a088a461bcc2a9e7ae61450085761a, game.js?rev=c00b78d392b9.
- New executable regression p2-specialist-foodweb-regression.js committed 187a6983 then corrected 87c3d3e2ea98ebf8b2dd7f8b4d7fe1b548abb13b.

## Verification
- Full game.js V8 JavaScript parser PASS.
- Executed real extracted huntWildPrey and predator set/diets in V8 with isolated world mocks: all four species kill real prey, generate exactly one carcass and activate strike poses, PASS 4/4.
- Runnable Node regression script authored and syntax-parsed but Node CLI not executed; do not claim Node pass.
- Browser visual, actual WebGL, Android, FPS, full live game loop, save migration, boss/100-year checks NOT executed in this run. Existing source save schema unchanged, not equivalent to verification.
- P2 0 accepted full batches / 24 unfinished species; current four-species batch is IMPLEMENTED BUT NOT BROWSER-VERIFIED. P1 source-integrated, browser unverified. P3-P8 pending.

## Next single large deliverable
Finish the same four-species full game-flow acceptance (player-controlled hunt -> prey death -> corpse feeding/carry -> bestiary, NPC AI and 2D/WebGL), execute Node regressions and browser if possible. If browser unavailable, record limits and do not waste another run on only microfixes. No user action needed.
