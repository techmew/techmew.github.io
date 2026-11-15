# 2026-11-15 17:10 JST — P2 specialist hunt-to-harvest integration (PARTIAL)

Starting main be80406c76ffb115c9e2634c82080c84363eee33. Reviewed ROADMAP-RECOVERY, 16:10 animation handoff, durable survival loop and 15:10 transport handoff, latest commits and game/fauna/WebGL/index blobs. Title/menu/roster and SAVE_SCHEMA2 unchanged.

## Playable integration
Four wild species (manul, tibetanFox, shoebill, penguin) have two real hunt paths. The alternate close-range ambush could reduce prey HP to zero but never create an edible carcass; dead prey was deleted at frame end. Now that lethal hit calls the existing claimPredatorKill pipeline, producing a real meat corpse, a hunter feeding claim, recoverable player meat, a later den deposit and meal. Updates prey ecology and guards _killRegistered against duplicate carcasses. Existing 2D/WebGL combat animation and player action/food transport unchanged.

## Commits and evidence
- game.js bab02793dfda2eebf9b47b702abe6435b4d01aef; blob 1f1c98c93cbbc9da90a753e4641f1ddae5a017a4
- p2-specialist-kill-to-food-regression.js fecd026bf7da4bae2662886dd6218c6348496ab9 (remove space to identify SHA)
- index.html c08fcb8ca7223e196e333d54d1099cc382292a30, game.js?rev=1f1c98c93cbb
- V8 actual full game.js syntax parse PASS; source-extracted four-species lethal branch 44 assertions PASS, including claimed meat, feeding lease, ecology and duplicate prevention. Mock is not actual browser or real localStorage. Node CLI not executed.

## Status and next
P1 source integrated, browser unverified. P2 complete batches 0 / unfinished 24; current four species **実装済み未検証**. Baseline 11 **検証済みではない**; other 20 **要実装**. P3-P8 pending. This run fixes a real player-facing broken death/harvest route but does NOT meet all four-species acceptance criteria. Next major deliverable: real 2D/WebGL browser combat, species selection/gacha/bestiary and saved continue/legacy schema test for these four, then advance to next species batch. Real browser/mobile/FPS and old saves not executed; do not claim otherwise. No user work.
