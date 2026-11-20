# 2026-11-20 11:14 JST — P3 salvage sortie priority and land route

Scope: only main/neo-wild; no image generation, menu, title or scheduler changes. Source HEAD 49b367958f7cdedb2e497131ad8aa558d7f04ae0. Inspected ROADMAP-RECOVERY and mandatory 20261115-2230 arsenal and 20261115 eastern expedition histories, plus recent aquatic and salvage handoffs.

## Actual player-facing correction
- Before change, even when a matching weapon already existed in the vault and a live strong boss was nearby, the HUD always chose an unrelated nearby salvage crate. This was reproduced by executing the pre-change production function with cat weapon, live boss and cache: the result was salvagePhase=pickup.
- New priorities: genuinely engaged nearby guardian > species-eligible stored weapon needing den equipment > real live boss when the current individual is armed > new salvage crate.
- Adds source-world-space corridor guide for those objectives when a mountain blocks line-of-sight or the objective is far. This reuses the existing 18-point route, preserves actual NPC/loot/den/boss coordinates, leaves physical Canvas2D/WebGL models where they are, and does not change weapon rarity or storage.
- Gacha and SAVE_SCHEMA2, permanent death/release IDs, 3+3 roster, years, world-end and existing meat pantry were not edited.

## Verification boundaries
- Executed V8 parser for modified game.js, east-expedition.js, and unmodified wild-arsenal.js.
- Executed new production-source regression (Node-compatible with in-memory fs shim): 39+ assertions spanning cached weapon priority, real individual equip, real boss damage, ongoing guardian combat, all 8 target coordinates, near target and cliff route. Inspect actual console result in this commit; do not infer a real browser.
- Actual Node CLI, browser Canvas/WebGL pixel frame, Android gamepad/touch, saved-game full migration and measured FPS: NOT RUN.

## Open P3 gates
Real device/browser traverse across random eastern starts and terrain blocks; complete 8-zone NPC/loot balance, visual screen alignment and file-backed SAVE_SCHEMA2/JSON import. Only P0 fatal data corruption supersedes P3. P1 unverified, P2 0 accepted batches/24 remaining, P3 IN PROGRESS, P4-P8 deferred.
