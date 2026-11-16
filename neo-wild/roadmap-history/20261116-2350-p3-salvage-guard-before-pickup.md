# 2026-11-16 23:50 JST — P3 pre-pickup salvage guardian, combat-to-vault integration

## Context
User requested immediate execution of existing minute-10 automation after an error notification. `run_now` returned a successful **inline_run**, which is executed in this same conversation. Target solely `techmew/techmew.github.io` `main/neo-wild/`, no automation schedule changes. Read `ROADMAP-RECOVERY.md`, historical P3 weapon arsenal (20261115-2230), east expedition baseline, and latest 20261116 handoffs (16:45 eight stations, 19:18 backup ownership, 20:12 continuous corridor, 21:18 salvage guardians). Existing weapon, route and save mechanics not reimplemented.

## New playable P3 experience
Previously the player's action **claimed the scrap first**, then conditionally spawned a hostile, leaving a misleading "dangerous eastern cache" with no combat before reward. A new `wakeWeaponScrapGuardian` connects the *live gameplay loop* `tickWeaponScraps` to existing `spawnMob` and NPC alert/search, once the player approaches a tier 2–4 cache (~430 world units). It tries 12 collision-, water-, player-distance- and ecology-safe positions (270–354 world units out), chooses from actually available hostile fauna, and spawns no more than one real animal. Existing crowding caps, den protection, physical collision and east-side enemy buff remain authoritative. If a native fauna restriction blocks every spawn, no fake NPC is manufactured; the same loot remains accessible and the system throttles retries.

The per-cache `guardianAwake` boolean is retained in the optional SAVE_SCHEMA2 weaponScraps payload and defaults false for older snapshots; the transient timer is not persisted. Previously alerted or defeated guardians never spawn again just because loot is collected. The pickup code reuses the same helper only for caches never approached. Ordinary predator alert on pickup, seed-based five-rarity reveal, wrong-species shared 240 capacity vault, individual ID equipment, boss damage and JSON backup stay on original production paths. The Canvas2D warning overlay also appears in WebGL mode (it is the same UI overlay), using the existing NPC world coordinates.

## Commits
- Implementation `450033950ed2cde7ad960fd5b46afc11f4964232`, game.js blob `91ee9f92d8e589ec75e4dadfc8298f9a0d32f4ad`
- Regression extension for physical pre-pickup patrol `3c5a9ee86f2edbcfd9acaf89389f729d0cd499b0`
- Integrated regression extension `9949b85be93a4ecc87b68ae975282ad5b970f007`, blob `d39a015b2473aeea53b9ff3af0ca0d777fe6eea8`
- index cache `d76351480a95343679c353816f86d75b9a925864`, `game.js?rev=91ee9f92d8e5`

## Executed validations
- Exact re-fetched game.js full JS parse using V8 `new Function`: PASS.
- Actual extracted `tickWeaponScraps` + `wakeWeaponScrapGuardian` tick: one physical guarded NPC, in-range detection, non-overlap with player, alert/search=7: PASS.
- Re-fetched source regressions actually executed via V8 CommonJS compatibility shim:
  - `random-start-regression.js`: **8,411 assertions PASS**, land 15 / carp waterways 2, first food and terrain, no change to new-game clock / Continue wiring.
  - `east-corridor-regression.js`: **263 assertions PASS**, 18 route markers, 8 points, rejoin guidance, live HUD/rewards hookups.
  - `weapon-arsenal-regression.js`: **20,155 assertions PASS**, 35 owners, 5 rarity weights, 8 collision-safe stations, pre-pickup real guard spawn/alert, no doubled guard after defeat/pickup, vault verified write, wrong-species refusal, same-ID equip after simulated reload, physical boss HP loss via gear damage, JSON-imported gear on a new in-memory storage and backup consistency.
- Total executed in this run: **28,829 assertions** across these *three separate V8 shims*. These are not browser-end-to-end proof.
- Browser / real DOM, actual WebGL GPU frames, Android, FPS, actual old SAVE_SCHEMA2 live load, full game lifecycle Continue and backup UI: NOT EXECUTED. Existing combat is exercised in source extraction and damage calculation; manual control/visual fight remains unverified.
- Published Pages status must be queried for the final index revision; success for intermediate commits does not imply latest history deployed.

## Outstanding P3 gates
- IMPLEMENTED BUT UNVERIFIED ON DEVICE: 8-station salvage ecology, real combat, alternate-species weapons and den, boss damage, shared camera overlays, save safety.
- TO IMPLEMENT / TEST: a truly continuous live browser or DOM+Canvas player route from randomized east spawn through collision/nav, actual NPC combat, pickup, den UI, individual switching, title-Continue and JSON import. Detailed mountain cave rates and real Android FPS. Avoid claiming completed until those pass. Consider retry success per biome without spawning crowds.
- P1 integrated/device unverified; P2 accepted species batches 0/24, held; P3 top priority / unfinished; P4–P8 held. P0 remains only fatal-save exception.
- Existing 3+3 roster, released/dead individual IDs, meat pantry, SAVE_SCHEMA2, 100-year boss, title/menu placement unchanged. No images. No new automations / old 00-20-40 schedules.
