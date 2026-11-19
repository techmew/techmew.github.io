# 2026-11-20 08:55 JST — P3 connected aquatic expedition, physical water network and rewards

Scope main/neo-wild only. Inspected latest main HEAD, ROADMAP-RECOVERY.md, mandatory 20261115-2230 arsenal and 20261115 eastern expedition, and recent water and salvage handoffs. No image generation, no title/menu repositioning, no old scheduler activation, no intentional changes to death/released IDs, 3+3 squad, existing pantry, final boss, or SAVE_SCHEMA2 version. P3 remains IN PROGRESS.

## Major play loop added (not a claim of finished P3)
- Existing river and canal random carp starts now share a connected water navigation network with a new north-south canal/river join, eastward forest inlet, upper headwater, and mountain creek. Under-road bridges can be traversed by fish while historic land bridge surfaces remain dry for land actors. The eastern watercourse is in actual waterDepth/swimWaterDepth collision, not merely map decoration.
- New World East aquatic graph (503 physical nodes) drives bounded source-validated route guidance; a passable fish route must reach a real submerged target, and cannot claim a merely nearby dry landmark. Reconstruct graph successors, reject inaccessible routes, and cache frequent HUD path requests briefly.
- Mountain aquatic actors can traverse the carved headwater/creek while keeping rocks, trees, huts, and steep-land blocking for non-swimmers. A source-backed V8 test exposed mountain collision falsely blocking actual water; this was fixed before publishing the claim.
- Four distinct fish-only underwater supply posts (river, canal, inlet, high headwater). Reaching wet posts actually grants physical submerged edible berries, HP/SP healing, score, first-time bit and two separate gacha milestones after 2/4 distinct posts. After three world-years, existing hold Action gives smaller replenishment without duplicate draws. Each transaction calls saveAuto before confirming a claim; failure rolls back food, health, stamina, score, journal, and mask.
- New optional eastWaterMask/eastWaterSupplyYears fields in existing version-2 snapshot. Old snapshots without these fields default to unvisited; existing 8 dry stations and four terrestrial gacha milestones stay separate.
- Water polygons are drawn from identical world XY in Canvas2D/full map and WebGL, while underwater posts use the existing perspective/camera projection pipeline in both renderers. Newly generated buildings avoid the channel corridor. Enemy NPC carp navigation and player random starts/resume read the new swim water depth. Non-carp terrestrial route and original arsenal are retained.

## Actual GitHub commit trail
- east graph and four water sites: 0cad4edd35d4f4626980999bafb51b7371fd24c7
- mountain fish collision support: cc3d338f24cd1b6202b5a5f14c10d899ac22c5e1
- game swim field, UI objectives, 2D and 3D marker feed: 26647a7c070be12686813b50c5abbf74ce3179de
- fish transaction, resupply, idempotent tickets, save/restore: ea384be4150cb080973a802697a0453f5e90a20d
- reserve new water passages in city generation: f944d7b90816fb248a909ee3c5e0a069954dd699
- WebGL physical stream polygons and supply beacons: 6c7b27e557cffb3e8f9785c0d2a75484d4d0c6fb
- fix mountain obstruction at new wet passage: bf2c3c909fbaad5c7597405b6361526a4bd78be5
- verified graph successor and HUD memo: 45d787a29bc0e8cd6cab8a85f24f028f11dfa995
- update 8-landmark regression expectation (not remove the assertion): 13fbf338755e2b4e8249df2659884f6662de412b
- new P3 physical/wet/save regression: b592bf6ff4c0c2eecef48d6fca0eff1e17046fff
- index cache revised all 4 changed source modules: ab70b467fea94e0bf43e90e8b5e9b4a8a1693d3c

## Tests actually run
- Full source V8 new Function syntax parse for game.js, mountain.js, east-expedition.js and webgl3d.js: PASS.
- Source-backed V8 execution: new committed p3-connected-aquatic-regression.cjs: 479 assertions PASS; mountain blocker + 5 multi-region routes, repeated physically wet waypoint traversal, 4 resource sites, wet food spawn, second-station ticket, claim idempotence, failed-save rollback, three-year resupply, old SAVE_SCHEMA2 defaults, post XY and 2D/WebGL source hooks.
- Existing east-expedition-regression.js: 76 assertions PASS (all eight terrestrial rewards, 4 land tickets, rollback, climate, AI and markers).
- Existing weapon-arsenal-regression.js: 20,172 assertions PASS, including vault safety, combat and JSON backup mocks.
- Existing p3-salvage-sortie-dom-regression.cjs: 44 assertions PASS for hostile NPC -> pickup -> species-correct per-ID den equip -> boss HP -> resumed inventory/JSON mocked merge.
- All are V8 source/extracted mock execution, NOT actual Node CLI, true browser Canvas/WebGL GPU pixel/Frame output, mobile/Android, measured FPS, or real old-save file import. None of those was executed.
- At cache HEAD ab70b467, GitHub Pages run 44641549376 was in_progress when checked; do not call it success unless a subsequent check confirms conclusion.

## P1–P8 and open gate
P1 partially implemented / physical play unverified. P2 zero accepted complete batches, 24 species remaining. P3 eastern 8 land and 4 aquatic sites implemented but NOT complete; physical browser/Android verification remains outstanding. P4–P8 unchanged and not newly claimed complete.

Next one major P3 gate: run actual browser/Android and older SAVE_SCHEMA2 full end-to-end on BOTH carp starts and terrestrial eastern random starts, including connected route collision with generated city props, 8-zone guardian combat -> salvage -> other-species den equip -> boss HP -> title Continue -> real JSON file restore; inspect both Canvas2D/WebGL pixels, coordinate consistency and FPS. If actual environment inaccessible, strengthen executable full-game DOM/Canvas mocks without reimplementing the existing arsenal or stop network.

No user action required to preserve prior saves; validation on a real Android device remains the next acceptance condition.
