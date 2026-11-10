# 2026-11-11 00:10 JST

Latest starting main: 99eef63c59d94054b9ebaf8ce1006b544f4fdb77.

Implemented: Carp is disabled in debug actor selection until connected aquatic gameplay is ready. Existing carp save records, roster IDs and old saves were not modified. Fixed index.html game.js revision to expose previous crow glide gameplay code (20f29924). Refreshed debug-actor-panel.js revision.

Commits: 8dcdc7d8cbab1a09305a0ece7749fa9ac51585c3; d344a9ccb3385f140ab88d06d53d6be21556db78; 1747cfde255e0b711e70b5f8473926bb887b7646.

Validation: JS parse (new Function) for debug panel; tested anchor/revision and disabled-option logic statically; re-fetched HTML. Browser/Android and Pages runtime not verified. Gacha already excludes carp from gachaReady; legacy fish remains untouched. Debug mode may still have alternative actor switching paths to inspect.

Next: boss per-species visual ID/geometry mismatch; then crow aerial small prey dive/capture and consume, including satiety and healing. Verify in browser and protect save compatibility.
