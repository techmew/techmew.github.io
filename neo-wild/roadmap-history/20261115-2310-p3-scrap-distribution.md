# P3 east scrap distribution — 2026-11-15
Previous handoff read: 20261115-2230-p3-weapon-scrap-arsenal.md. Existing arsenal and SAVE_SCHEMA2 unchanged.
## Implemented
- On NEW GAME, attempts one unidentified weapon scrap near each of eight east expedition stops; adds a nearby attempt for eastern random spawns.
- Subsequent 18-second respawns prefer the least-served east stop instead of random crowding. Existing terrain, water, collision, storage cap and durable claim protections remain.
- No weapon rarity, damage, equip, food, death ledger, title or menu changes.
## Commits
- game.js: 1b1e82e5bcdeccd1ca94acc4945cf457dd6feee7
- index cache: 811874d6ff31840bfd16d23d07d8f0554ca9124a
## Status
- Code re-fetched and source anchors verified. JS parsing, DOM/Canvas integration, old-save E2E, real browser/WebGL, Android/FPS NOT RUN. Distribution success in all eight areas is NOT verified: terrain collision may reject attempts. P3 incomplete.
## Next
- Executable integrated DOM/Canvas harness for eastern random spawn, scavenging, vault for alternate species, individual equip, boss hit, title/continue and JSON restore; then verify eight biome accessibility and 2D/WebGL projection.
