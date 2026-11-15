# 2026-11-15 — Randomized game starts: all districts and eastern wilderness

Starting main 2b931ff462d7b559d0c6f1d6806ffbef0717d22e; ROADMAP-RECOVERY.md and last three P2 handoffs reviewed. User-directed world-start change. Only neo-wild/ edited, no image generation or title/menu/roster redesign.

## Actual player change
- Fresh games uniformly shuffle 15 land-area candidates across city, ruins, forest, riverbank, northern woods, foothill, slope, gorge, headwater, snow mountain and cave; terrain-safe position probes enforce real collision, regional boundaries and dry land.
- Carp randomly spawns at one of two separately selectable actual waterways (river/canal), never dry ground.
- Four new eastern dens (northwood, foothill, gorge, alpine) access the same existing shared pantry. Starter edible plants now spawn close to the player on compatible terrain. Start notification identifies the generated area and directs player to the map for den/objectives.
- Exact saved position always wins on Continue/restore (restoringSavedWorld guard). P0 0-year start and 08:00, 120 seconds/year, 85 seconds/day, permanent death/release IDs, 3+3 roster, prior SAVE_SCHEMA2, boss lifecycle and old map/title UI untouched.

## Commits
Implementation 301699544b8f5ede3d3831405c79adfed8a3f68e; game.js blob 971bb43a99d9f151f62b037e5040aba9a63ad502.
Regression 8db106b374a24f0deefa6afd3eb2d119ed8dfc29; random-start-regression.js.
Cache 1f2e0b5b5d75f3408362a2dd67006dff3c43ad50; game.js?rev=971bb43a99d9.

## Verification and limits
Full updated game.js parsed by actual V8 new Function: PASS.
First source-extracted terrain mock 5,250 checks PASS (7 animal sizes x 250 deterministic seeds x 3 terrain constraints). New committed standalone test run in V8 CommonJS shim: 8,411 assertions PASS (7 animals, 15 land candidate types, 2 fish waterways, nearby starter food, 4 eastern den definitions, Continue branch).
Node CLI, real complete browser world generation, WebGL pixels, Android, real FPS and old-save restore: NOT RUN. Mark feature IMPLEMENTED / REAL-DEVICE UNVERIFIED.

## Status and next
P1 code integrated / browser unverified. P2 0 accepted batches / 24 unfinished, 4 specialist animals still not accepted. P3 right-hand route ordering, exploration value and marker/FX coordinate consistency remain REQUIRED and unchanged by this random-spawn improvement. P4-P8 remain pending. Next major deliverable: coherent city-to-mountain traversal plus guaranteed rewards and unified 2D/WebGL indicator projection, after user design agreement. User action: none.
