# 2026-11-16 20:12 JST — P3 continuous route guidance, mountain bends and recovery

## Source of truth
Initial main HEAD a2d060263df9d978b04ca477fa221334414dd0a5. Inspected ROADMAP-RECOVERY.md, the 20261115-2230 weapon implementation handoff, 20261115 eastern expedition handoff, latest 20261116-1918 ownership handoff, fresh game.js/east-expedition.js and latest commits. No reimplementation of 8 stops, 18 waypoints, weapons, rewards, death ledger, SAVE_SCHEMA2 or title UI.

## Integrated player experience
- P3 eastern route now projects actual player XY onto the nearest **continuous trail segment**, rather than selecting the nearest isolated waypoint. This corrects erroneous backwards guidance at mountain switchbacks, river approaches and cliff bends.
- When the player strays more than 105 world units from the safe trail, the next objective guides to the nearest point on the existing 18-waypoint physical corridor. Once rejoined, guidance follows the next forward/backward trail vertex toward the nearest undiscovered supply stop.
- Original 4 habitat risk bands remain; real game tick now announces whether the player is off-route and how far to the rejoin point, while preserving carp-water warnings. The live ecology, weather drain, first-discovery rewards, 3-year supplies, score/gacha and existing world save calls are untouched and remain active.
- No new save keys, assets, menus, map layout, images, roster changes or automation changes.

## Actual commits
- East module 914cfd3b0938b640086cce98b1fe360ecd6c0a24, blob ab015d67fcb2c3e3b87fd3a8ff3bcd6f8f673b18.
- Live game HUD 9481ba56caf03a8d37c60a4101fdb6d43832d7d6, blob 8db8afec943f57cd23bd4f445a2756033750a118.
- Executable regression 1a54bbbbccc6e0a31bf91353af6d0b73765d0f22, blob b4bbabe8fe5e10f1cd5e1451e860c0ce3f777970.
- Index cache 16485138f732bf85cf0d97730606284f2f7b6b95.

## Validation
- V8 actual new Function syntax parsing PASS for edited east module, entire game.js and regression.
- Re-fetched committed regression executed in V8 with CommonJS-compatible shims: 263 assertions PASS (17 segments x 4 points, off-route recovery, 8 arrival and biome cases, live gameplay hooks).
- Earlier 20,131 weapon regression assertions not re-executed in this run; never add the counts as if both ran together.
- Pages status for latest index commit needs fresh check; intermediate deployments were cancelled when superseded.
- Actual Chrome/Android/WebGL frames, mobile FPS, real terrain and building collisions, old save E2E, and full combat→weapon→backup browser E2E: NOT EXECUTED.

## Priority gates
P1 integrated but device-unverified; P2 accepted batches 0/24 remaining; P3 actively in progress, not complete. P4–P8 deferred. Next substantial P3: implement and execute continuous DOM/Canvas simulated east-start→dangerous NPC→salvage→cross-species vault→boss HP→title/Continue→backup restore, with true mountain/building collision sampling. The new route projection uses existing mountain-verified walkway, but does not prove every straight-line approach from a remote random start is obstacle-free. No user action required.
