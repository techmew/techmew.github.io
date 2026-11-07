# 2026-11-07 13:40 JST | 40min
Phase: A_FEATURES
Implementation: wraith-haunted ordinary wild animal now receives a directional escape velocity, preserving existing navigation AI, wall line-of-sight check, and exclusions for owned/released/boss animals.
Commit: 7ab17883d02a899b88729eb344ead7ac56576716
File: neo-wild/apparitions.js; blob 712d99247685d4adbbd66555dea7688e016831ae
Status: implementation integrated; browser behavior verification pending. JS syntax and Android not tested. No UI/save/terrain files changed.
Outstanding (carry forward):
- 40min: snow boundary mesh and chunk seams; real GPU test pending. Next: neo-wild/webgl3d.js, coordinate terrain API with 20min.
- 40min: 30 species unique 3D anatomy, attack and face stability; real rendering pending. Next: neo-wild/webgl3d.js.
- 40min: UFO, ghosts, large creatures behavior integration; browser E2E pending. Next: neo-wild/apparitions.js and ufo-events.js.
- 00min: Android JSON export/import, old save and permanent death/release ID preservation, timeline E2E pending. Next: save-backup.js, world-history.js, game.js.
- 20min: right-side river source, altitude, forest/mountain biome seam and collision QA pending.
Protection: latest main only; no rollback, no ROADMAP.md edit; fixed title UI and gacha upper buttons, SAVE_SCHEMA2 and old 4/5 survivor records protected.
