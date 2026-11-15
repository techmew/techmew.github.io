# 2026-11-15 15:10 JST — P2 four specialist meat-transport encounters (PARTIAL)

Starting main 17f8c1150692e9942ebe7fa58e26237f43fa7bc4. Reviewed ROADMAP-RECOVERY.md, latest five P2 histories, commits, game.js, index.html, and live NPC/den/meat path. No rollback or title/menu/roster/save schema edits.

## Player-facing integrated gameplay
Four wild specialist hunters (manul, tibetanFox, shoebill, penguin) now intercept meat the player carries back to a shared den, rather than limiting meat ambush to dogs. They visibly pursue, telegraph a species-specific lunge with strike pose, and can knock meat from the player's mouth; it remains recoverable on the ground. Terrain depth prevents shoebill/penguin pursuing across unsuitable deep water; concealment, shelter, den boundaries and building LOS stop ambush. Owned, released and boss individuals are excluded. Existing dog behavior retained.

Crucial transaction correction: when any meat thief successfully steals, world save must accept both loss of carried meat and ground meat in the same snapshot; failure restores carried meat and removes the drop. No duplicate meat after reload on storage failure. This ties player-controlled hunting, NPC prey hunting, carcass competition, carry, den route and survival to a physical counterplay encounter.

Implementation commit fa5339faf43cba8ccea6ad8173b42cf8bc8134cd, game.js blob 50eb1e93e302597d44b9c16db6ab01b7857098cd.
Cache activation b259b5ac19b48d22888537e3faeabaa90a0e16f5, index game.js?rev=50eb1e93e302.
Runnable regression file p2-specialist-transport-regression.js commit e823d58e31b45e7c47a59ecbc247ca48cbb96cb4.

## Actual verification
- Full game.js JavaScript parse with V8 new Function: PASS.
- Executed real source-extracted updateFoodThief in V8, 5 predator species including dog: physical ambush drops exact 22 meat and saves once; hidden/blocked/save failure rollback all pass. Shoebill and penguin deep water restriction PASS. No production localStorage used.
- Node CLI regression file authored, NOT executed via Node CLI. Actual browser Canvas/WebGL, Android, FPS, long run, old schema import, full NEW GAME and 100-year boss NOT executed. Do not mark whole batch complete.
- Main and index updated, title/menu layout unchanged.

## Epic status
P1 source-integrated, browser unverified. P2 completed batches 0, 24 unfinished species; current four-species batch has integrated gacha/bestiary, NPC hunt, player combat, food transport counterplay, but full end-to-end browser and WebGL acceptance remains unverified. P3-P8 pending.

## Next one major deliverable
Execute the full four-species controlled hunt -> prey death -> corpse pickup -> den deposit -> shared pantry -> eating -> reload, with real Canvas/WebGL if available; run committed Node regressions and preserve 3+3 roster, death/release tombstones, legacy saves. Avoid repeating prior feature patches.
