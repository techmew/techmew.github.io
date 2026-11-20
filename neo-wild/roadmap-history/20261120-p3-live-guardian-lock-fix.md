# P3 eastern guardian pickup lock — 2026-11-20

## Observed source bypass
- Eastern region tier 1 (X=8400..10099) previously generated loot with guardState=cleared without any kill.
- Pickup guard validation only searched within the old 300-unit ring and only when guardianAwake was true; inconsistent old cleared state could leave a living salvageCacheId guardian and still allow a vault claim.

## Connected fix
- Every new eastern scrap starts pending and must clear its existing living guardian fight before it can be claimed. The same AI, combat, durable kill/save transaction, vault and 2D/WebGL markers are reused; no duplicate weapon logic.
- Before every pickup, any living NPC with a matching salvageCacheId blocks the item regardless of distance or stale cleared/legacy state. Enemy alert and pickup notification identify the blocking guardian.
- Old unearned cleared/guardianAwake=false saves are converted to pending on restore and on Action. Confirmed cleared/guardianAwake=true states retain earned credit. Old legacy caches remain compatible except where a living named guardian exists.
- A claimed cache cannot spawn a new guardian after granting its loot. Items already in the durable 240-weapon vault are not revoked.
- Existing species 35, equip per ID, 3+3 squad, final boss 100 years, death/release ledger, meat pantry, SAVE_SCHEMA2 and JSON backup are preserved.

## Executed regression
- V8 full game.js syntax parse PASS.
- Source-backed weapon regression with new gate/distance/old-save assertions: 20,181 PASS.
- Salvage DOM/Canvas extraction integration: 45 PASS.
- P3 weapon-to-boss navigation: 38 PASS.
These are V8 source-backed mocks, not a real browser, GPU, Android, actual old SAVE_SCHEMA2 import, or measured FPS.

## P3 open
Browser/Android verify east gate guardian spawning under wildlife limits, all eight-zone battles, loot pickup after kill, 2D/WebGL and HUD alignment, full save/JSON import and FPS. P3 NOT completed. P2 accepted batches 0, 24 animals outstanding. No scheduler or other folder modified.
