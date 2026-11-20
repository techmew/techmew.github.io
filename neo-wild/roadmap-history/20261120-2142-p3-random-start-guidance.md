# 2026-11-20 21:42 JST — P3 all random-start guidance and existing HUD

Base main `e3f7b59fa0e5c3de3ec0149644e4fa51c798fa4c`. Read ROADMAP-RECOVERY, 20261115-2230 weapon-arsenal, 20261115 east expedition and latest P3 siege/salvage handoffs. Did not reimplement weapons, maps, encounter AI or redo earlier changes.

## Real connected gameplay change
- The active getObjective() previously hid all eastern guardian/scrap/equipment/boss waypoints until mission>=7; legacy freeStep==2 could also obscure P3 guidance. All 15 sampled eastern land starts now prioritize the real existing combat/salvage/den/boss encounter regardless of mission; if no cache exists, guide the existing eight-stop walkable expedition.
- Carp's two sample water starts now receive only physically water-validated aquatic path objectives immediately, rather than dry tutorial targets.
- Existing survival-goal HUD displays 8/8 eastern or 4/4 fish station progress, next real resupply post and climatic danger/status before tutorial completion. No layout changes.
- Western tutorial, current mission scoring, original title/menu, 3+3 individual ID ledger, permanent deaths/releases, food, weapon vault, 100-year final boss, SAVE_SCHEMA2/JSON untouched. Only neo-wild files edited; no images or scheduler changes.

## Validation
- V8 new Function full game.js, east-expedition.js, added Node-compatible regression source: syntax PASS.
- Production getObjective extracted and invoked: 36 source-backed assertions PASS covering 15 eastern land positions at mission 0 & mission 7 with freeStep==2, 2 water start sites, tagged living guardian, western tutorial, blocked menu and current HUD integration.
- Node CLI execution, actual browser/GPU/Android FPS and old real SAVE_SCHEMA2/JSON import: NOT RUN. Not an acceptance of P3 completion.
- New reusable regression p3-random-start-guidance-regression.cjs (Node CLI requires future execution).

## Next P3 gate
Exercise actual guarded cache spawn/kill/collect through full 8 land starts and 2 fish start sites with old save+Continue+JSON, real 2D/WebGL coordinate frames and measured mobile FPS. P3 ongoing. P2 0 accepted batches / 24 remaining; P1/P4-P8 deferred.
