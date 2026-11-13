# PHASE A — 2026-11-13 15:10 JST — 3D combo responsiveness

Starting HEAD bf8c16d872c83f2050f94b27e20d3ba53eb4e606. Inspected recent commits, roadmap-history, ROADMAP-RECOVERY.md, game.js and webgl3d.js blobs and HTML. Previous 14:10 work already added species follow-through; this change modifies timing without repeating it.

Player-visible change: 3D melee attacks now snap forward in the first third of the existing 0.45-second attack animation and recover over a longer window. Heavy animal recovery is smaller, hoofed species intermediate, light clawed species sharper. It uses the existing combatLimbPose in the live WebGL animal drawing loop. No collision, attack interval, save schema, menu, 2D UI or player slot changes. No images generated.

Implementation commit 31525bb9c09f12f4fab2d49bd50df00dd0d7a914, webgl3d.js blob 6c17a480167e84daf49361fb623a6339e0226060. Publish HTML cache commit a95ca31762083f56e451a7b0008cb23cbf91ae75, HTML blob 790dc00422a97483e10aea72bccc0b80ce4d1f90. Both blobs re-fetched and new cache revision verified.

12 mocked timing/phase/invariant assertions passed in isolated JS; source not executed in real browser or Android. Browser visual timing, animation fluidity and FPS remain unverified. No syntax parser executed on full webgl3d.js in this run; must verify before declaring full validation. GitHub Pages deployment status must be checked separately.

Next priority: 2D/3D actual input-to-hit response testing and strike feedback tuning without increasing unfair enemy damage. Preserve all existing ownership, save, boss, and world rules.