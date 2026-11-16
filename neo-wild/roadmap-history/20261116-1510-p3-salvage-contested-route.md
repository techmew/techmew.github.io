# 2026-11-16 15:10 JST — P3 eastern salvage as contested exploration loop

## Previous state inspected
main HEAD c44a11bc69372399c3f0d148e40947dc41bfea1a; read ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, 20261115-p3-eastern-expedition.md, latest UFO handoff and game/east/arsenal/backup regression sources. Existing 35-species, five-tier weapon vault, eight stations, 18-point route, boss damage, 3+3, SAVE_SCHEMA2, death IDs, 100-year final boss remain intact.

## This run
- game.js e900bf9b6d749f87034bd79b5409abd8e7ac52d2: Salvage now tries a larger candidate pool near an explicitly selected station (no silent fallback to another station). Removed the blanket mountainHabitat requirement so accessible suburban east scrap can be found, while retaining real collides, waterDepth, eastern X, world bounds, spacing and vault capacity gates. Random/near-player generation uses staged anchors.
- game.js: after durable vault write and removal of identified scrap, nearby wild predators (not prey, companion, boss, or released owned IDs) receive existing AI alert/search/last-known position, creating a contested salvage pursuit without new permanent enemy IDs. No extra guaranteed spawn, avoiding early crowding. Nearby loot now takes priority in the existing late-game eastern navigation objective, sharing exact XY with 2D/WebGL/map/pickup.
- weapon-arsenal-regression.js 6ff7b97c01b5330058d4fa1147fd214135e3fa02: added real source-extracted NPC aggression/prey exclusion, station-local collision test when spawn succeeds, and objective source check. Existing 20k seeded rarity and backup, vault, 2D/WebGL, damage tests retained.
- index.html 49b3bb72135582478c9cddbb8d731debb8b29021: game.js cache revision updated to new actual blob eba46c771bc5, without UI or other scripts changes.

## Verification
- V8 new Function parse game.js and regression: PASS.
- Source-extracted regression in V8 with CommonJS assert/fs/path shim: PASS, 20,098 assertions. Actual browser/Android/WebGL pixels/FPS and old real SAVE_SCHEMA2 restore: NOT EXECUTED. Test only asserts station-local properties IF placement succeeds; eight-station spawn success rates still require repeated deterministic collision tests, not claimed as guaranteed.
- No new save keys; weapon vault write-before-remove and existing backup merge unchanged.
- Pages status: query Actions after index commit; do not assert deployment until observed.

## Remaining
P1 live unverified; P2 0 accepted complete batches/24 species pending; P3 in progress (salvage gameplay linked but actual route+boss+restore E2E pending); P4–P8 deferred. Next P3: deterministic eight-station physical placement stress test including cave, real NPC fight/loot/weapon species transfer/boss damage/Continue/JSON restore, map and projection; fix any uncovered spawn deserts. No 00/20/40 jobs, no images.
