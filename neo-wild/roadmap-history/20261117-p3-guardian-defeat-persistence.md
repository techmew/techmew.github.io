# 2026-11-17 JST — P3 contested eastern salvage: real-kill progression, safe continue, 2D/WebGL feedback

## Scope and existing work
Target only techmew/techmew.github.io main/neo-wild; HEAD at start 56bce5ae3f69e1c11412cfbf4a8b71ce857a996c. Inspected ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, east expedition baseline and three 20261117 P3 handoffs. Reused the already-shipped east map, eight stops, 35-species/240-cap vault, guardians, damage and SAVE_SCHEMA2. Did not restart any minute-00/20/40 automations or generate images.

## Defect corrected and usable result
- Previously a dangerous eastern scrap could be claimed before the 1.5-second guardian AI tick; after guard creation the 300-radius test could also be bypassed by luring the guard farther away. Actual kill was not a condition for claimed equipment.
- New caches in dangerous tiers 2-4 now have explicit pending/engaged/cleared guard states, with a real specific living predator tagged by scrap ID (existing local predator or one actual wildlife spawn). Before player kill, the existing Action refuses the scrap even if the guard is far away. No cosmetic-only enemy claims.
- Actual `kill(m)` calls `recordWeaponScrapGuardianDefeat(m)`; the exact cache is unlocked only after successful SAVE_SCHEMA2 autosave of the defeated guard. An unsuccessful autosave rolls back the cache's cleared flag; prey or unrelated wild animals cannot grant victory. If a live guardian disappears through wildlife recycling or a stale reload rather than being killed, the encounter resets to pending for a later guarded respawn.
- New `guardState` is optional in SAVE_SCHEMA2 weaponScraps; legacy scraps continue to load with original guardian behavior (legacy state), no save migration or roster deletion. Unique inventory IDs, death/release ledger, 3+3 roster, existing food/meat pantry, final boss, all-den equipment and JSON merge unchanged.
- Canvas2D sprite, screen labels, full/mini map and WebGL world geometry now use the same pending/engaged/cleared status with world XY and mountain elevation. The player sees pending, fight or earned status without leaking rarity or animal owner prior to pickup.
- The already-existing downstream system (35-owner random reveal -> shared vault -> individual equipment -> boss damage -> reload and JSON backup merge) remains unchanged and is covered by source-extracted executable V8 tests.

## Commits in this run
- cc8e2c0234d64eef49dc9b289db565a37707f33b: enforced guard duel and SAVE_SCHEMA2 state, 2D UI and minimap.
- 25a3276b09a6b64ef0376894da3c6a7a3d20f680: extract real kill-credit function for executable regression.
- a5a3f148ee21e9a81a5cdd8e75ab0a1b7d022ea5: combat bypass regression update.
- 60f1f3e3264b602d8f2158ca53ec6e3ad908e0f0: Canvas2D world-space threat phase ring.
- 7fdb3ca523042c4ff46571ddc7f5dd02ada2acab: matching WebGL threat-phase geometry.
- c9fd5d9c5e2ba0a5f3aa672cdb55c7ac6f94cfa5: index.html game/WebGL revision cache updated.
- ef1f89141c5d571c6b6bd8710c6021d7606b26ff: regression for missing guard / failed autosave without loot.

## Executed validation (V8 shims, NOT device/browser)
- Full V8 `new Function` syntax parse of modified game.js and webgl3d.js: PASS.
- V8 CommonJS source-loaded executable regression: random-start 8,411; east-corridor 263; east-expedition 76; weapon arsenal 20,172; P3 east + arsenal integration 289. Total **29,211 assertions PASS**.
- The 20,172 weapon checks exercise actual extracted Action/tick/spawn/kill-credit, duel rejection when predator lives or moves out of old radius, reset on despawn, failed-save rejection, successful kill and persistent loot unlock, cross-species vault, per-ID equip, physical simulated boss HP, reload and JSON merge.
- Actual Node CLI, real browser DOM/Canvas pixels/WebGL frame, Android input and FPS, full old SAVE_SCHEMA2 E2E load and UI-driven JSON restore: NOT EXECUTED. No claim of full E2E completion.
- GitHub Pages status queried before this history commit: current main regression commit ef1f891's pages run 44063620794 in_progress. A later build supersedes it; report latest actual result separately.

## Handoff: P3 still in progress
Next large gate is a real browser or genuinely full DOM/Canvas integrated route from east random start -> living NPC duel -> recovered scrap -> different-species den equip -> actual boss HP -> title Continue and JSON file restore, together with 8-site placement and aquatic passage; measure WebGL/Android and 2D projection when available. Existing P1/P2 hold; P2 accepted 0 batches/24 species outstanding. P0 only for fatal save/start failures. No automation changes.
