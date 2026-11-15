# 2026-11-15 — P3 eastward expedition: playable world path, exploration supplies, renderer alignment

Source state before work: main 1848fd18fa87057c3628a9861078ee20ca44ac2b. Existing P1/P2 handoffs, ROADMAP-RECOVERY.md, fresh game.js/mountain.js/webgl3d.js and last commits inspected. User explicitly reprioritized P3. Scope neo-wild/ only; no generated image, title/menu placement, schedule changes or ownership resets.

## P3 substantial integrated player experience
- Fixed physical 8-stage progression in existing connected world: abandoned east city gate (8360,1680) -> rewilded suburb (8700,1764) -> primeval northern forest (9320,1877) -> mountain pass (10740,2590) -> ravine crossing (11350,3550) -> headwater (12350,3250) -> snow ridge (12720,3818) -> high cave (13220,3797). Old sites retained, original regions and mountain collision unchanged.
- An 18-waypoint navigable corridor replaces misleading straight map links. Verified all 7 successive segments with existing mountain blocked() at 21 radius, dense 10-unit sampling of 643 positions. Navigation/mini/full map shares exact route XY.
- At all 8 stops: physical world markers in Canvas2D AND WebGL with matching terrain height, 2D/3D screen callouts, current map/guide arrows and detailed danger/route descriptions. Player can discover stops from either direction, essential because NEW GAME now randomly starts in all regions.
- One-time per-stop recoverable food (berries or meat, amount 34..70), scored exploration (90..500), survival HP/SP recovery, saved chronicle and progress; every 2 distinct stops gives one idempotent gacha ticket (4 milestones). Revisit a previously cleared stop after 3 real world years (120 seconds/year) and hold existing action button to collect smaller supplies, without extra gacha rewards.
- Post rewards react through live NPC AI: prey scatter and visible nearby predators investigate the player in forest, ravine and cave. During rainy ravine crossing or heavy alpine snow, real player stamina declines; correct risk/status text provided.
- Rewards and progression committed together using original SAVE_SCHEMA=2 autosave; on rejected save, HP/SP, score, corpses, world journal and stage bits rollback. Continue/restored SAVE_SCHEMA2 with missing optional eastTrailMask / eastTrailSupplyYears defaults to unvisited without modifying existing roster or world time.
- Transition geometry for city -> abandoned suburbs -> deep forest now visibly graded in both 2D mountain.js and 3D WebGL terrain, with decorative ruins off the physical trail. Collision code unchanged.
- Screen coordinate project() now uses actual world scene camera including quake and hit shake, matching WebGL uniform or Canvas world transform. Combat FX projection includes mountain elevation. Other FX systems still require real browser visual confirmation; no claim that every old overlay bug is solved.
- Exploration map now reports correct landscape names, explains hazards, stage rewards, 3-year resupply button, and correct discovery ability denominator.

## Implemented commits (verify on main)
- P3 core module eight stops: 150f4609aa8a977462f49fdc070a00cf00a6b745.
- game.js reward, NPC, weather, controls, maps, camera/FX: 66445b142b5fc4a24cf996da79e635ea0326a27f.
- WebGL eight distinctive ground-height stage meshes: f9bb8ef42dc7c962a65aac028dd5d38f7d60dcd5.
- initial index P3 load: e9a8d7b4f4e638336bbfd7a0bc760ef86fe94cf8.
- end-to-end V8 shim regression source: 79f9bfb5a603dc952136eb93e99ff01098ad0734 (east-expedition-regression.js).
- mountain-collision-approved 18-point corridor: ff0ba0854c91b1d74b6fb854e46578c1166af430.
- refreshed east module cache: 06df87da4537c34dcbde0eef4ed7d0d93d9eceb2.
- 2D suburban transition: 8b8fc90bfd7743b83e960a5300d70852ddbda208.
- 3D suburban transition: 549ecdc0c106e651018700c70c992393bd137e83.
- world label and route explanation: eb59e6a9c6cfcfe27b244bf5c9dac65f06519546.
- final index JS revs: d96643be865c131effc6b02405f017326e523b64.

## Tests executed vs not executed
- Actual V8 new Function full parser on game.js, webgl3d.js, mountain.js, east-expedition.js, regression, squad-core.js, boss-roster.js and world-end.js: PASS.
- Extracted real production P3 reward+save+AI+hazard regression in V8 CommonJS shim: 76 assertions PASS; includes eight first-time visits, four ticket milestone calls, replay prevention, re-supply, failure rollback, weather drain, old-save field presence, 2D/WebGL game hook assertions.
- Path sampled with true WildMountain.blocked collision: 643 samples PASS over 18 path waypoints; note city building geometry and other disaster obstacles not included in this mountain-only path check.
- Screen camera transformation numeric check: 12 cases PASS, including earthquake/hit-shake offsets.
- Actual Node CLI, real browser 2D/WebGL pixels, mobile controls, measured FPS and old SAVE_SCHEMA2/localStorage migration: NOT EXECUTED. Do not upgrade acceptance from mock to live without testing.

## P1–P8 gates and next
P1 source integrated / real browser UNVERIFIED. P2 four focus species implemented partially but unverified; accepted complete batches 0, remaining 24. P3 east route gameplay + 2D/3D implemented / REAL BROWSER UNVERIFIED, not complete. P4/P5/P6 partly pre-existing. P7/P8 remaining.
P3 next major task: verify real traversal and environment reward loop in actual browser; improve terrain/ecosystem transitions and encounter stakes (distinct headwater/snow/cave gameplay), address remaining true actor-marker/FX misalignment including moving WebGL actors and all disaster/UFO overlays. Include save+resume and boss/old schema acceptance; do not revert existing commits, do not spend hours on 1px tweaks. The existing hourly task has been explicitly updated to prioritize P3 (P0 fatal save/boot issues excepted), original minute-10 schedule preserved; no other automation created.
No user action required for this repository change.
