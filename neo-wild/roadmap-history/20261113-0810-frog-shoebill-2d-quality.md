# PHASE A — 2026-11-13 08:10 JST — playable amphibian and shoebill 2D silhouette quality

Initial GitHub main HEAD: 0aa24ac9321998cd3c8ddae0a7355d1b87dd1559. Retrieved current fauna.js and index.html blob SHA, ROADMAP-RECOVERY.md, recent roadmap-history and commits before edits. Previous 3 final-boss tentacle patterns retained, not reimplemented.

Player-facing implementation: three previously generic 2D fallback animals now have species-specific silhouettes and attack motion. Giant tree frog: long spring hindlegs, toe pads, spots, jump pose and extended tongue. Pacman frog: broad heavy body, horns, short legs, camouflage markings and shorter tongue attack. Shoebill: long wading legs, large wings, broad heavy beak, windup and thrust animation. Uses existing o.swing/o.windup and jump poses; no new save data. No image generation or UI arrangement changes.

Code commit bf511bf37ea81c7703e590872664fc76f6926c7b (fauna.js blob 9b49b732e656cee129c8ce58d3f2ccd92b99b531). Publish HTML cache revision commit 0277eeb456eeebb6f07c4e645f034c1cdae22dff (index.html blob 5f0a5e5458c4d5a15c791a93904041751d6d3a6f). Re-read both files after writing.

Tests: JavaScript new Function parse succeeded, 41 mock assertions passed for 3 species across idle/windup/attack/jump, finite geometry, attack state changes, retained otter and exactly 35 playable roster entries. Actual browser rendering, Android and WebGL 3D not tested.

Still incomplete: 3D species-specific anatomy and motions for these animals, quality verification for remaining 24 gacha-locked species, field combat animation timing, biomes, gameplay balance, save/food crash recovery, Android and multiplayer.

Next priority: improve and regression-test 3D silhouettes and strike animation for these three animals, or another unverified playable species. Preserve all preexisting title, roster UI, IDs, old saves and world clock. User action: none.
