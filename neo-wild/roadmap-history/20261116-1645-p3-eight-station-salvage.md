# 2026-11-16 16:45 JST — P3 eight-stop salvage placement reliability

## State and priorities
Read main HEAD 280696cc471d9d916ec433899443121bf82e4cd2, ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, 20261115-p3-eastern-expedition.md and 20261116-1510-p3-salvage-contested-route.md. Existing 35-owner weapon inventory, weighted rarity, all-den 240 vault, NPC alert on salvage, 8 expedition stops, boss damage, SAVE_SCHEMA2 and permanent IDs retained. P3 is still active.

## Playable fix
- Previously the first citygate at x=8360 was excluded from `spawnWeaponScrap` because `active=stops.filter(s=>s.x>=8400)`. This prevented eight-stop loot coverage. The new function includes all eight stop anchors but requires every actual item to be x>=8400, placing the first station cache on the east side of the gate.
- The 112+ randomized attempts are followed by a finite, spatially distributed 64-point ring search around each anchor, retaining world bounds, physical 25-radius collision, dry land, station radius, other loot and carcass exclusion, full vault checks, unique IDs and authoritative save-before-remove pickup. The same game loop calls this function during world initialization and recurring salvage ticks.
- Existing AI contest on pickup, rarity reveal, 2D/WebGL models, weapon storage and boss multipliers were not rewritten.
- Test now requires all 8 stops to actually spawn a physical cache (not a conditional assertion that silently passes on failure). Every successful cache must be x>=8400, <=260 world units from station and pass actual `WildMountain.blocked(x,y,25)`.

## Commits and verification
- Implementation `32f6fe5120cdc3700e809f8e59bb1e2fbf2ad8e2` (game.js blob b9f22277b1cdf5a7559da7588cee11068e20a162).
- Regression `2e0dfbb54c393d2b4bf78c4c28bd48f235bba1f1` (blob 7e147d3895a62d0856f5e94d844836fb4737238b).
- index cache `7256045a833339ba7c8f753a366d3f7e24e059a0` (game.js?rev=b9f22277b1cd).
- V8 actual JS parsing: PASS; committed source-extracted regression executed against re-fetched main production files in a Node-compatible V8 shim: 20,122 assertions PASS, including all 8 physical station spawn, inventory write failure, NPC alert, 35 owners, 5 rarity grades, boss damage, vault and JSON merge. Not an actual Node CLI run.
- Pages workflow 43826161276 was **in_progress** at check. Earlier runs for implementation and test were cancelled by newer pushes; do not claim deployed until this workflow succeeds.
- NOT EXECUTED: real browser/Android, actual 2D/WebGL pixel comparison, real older SAVE_SCHEMA2 restore and FPS.

## Next P3 integrated gate
Perform a real DOM/Canvas-style end-to-end of random east start -> 8-region salvage -> hostile NPC fight -> claim wrong-species item -> den vault transfer to matching individual -> boss damage/HP -> title Continue -> JSON restore. Verify mountainous water/collision across time and 2D/WebGL coordinates. No P1/P2 microfixes, no images, no extra schedules. P1 live unverified; P2 0 completed/24 remaining; P3 active; P4–P8 deferred.
