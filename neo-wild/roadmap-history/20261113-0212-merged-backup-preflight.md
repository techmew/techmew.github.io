# PHASE A — merged backup import preflight (2026-11-13 JST)

Baseline main: 09e3f2fdd7e0b6b9438120ebd65cb55b97665752. Read ROADMAP-RECOVERY.md, roadmap-history README and recent damaged pantry guard. Original save-backup.js blob 9bcf078ae55244956181fc27868531f942058fd0.

Player-facing fix: after merging imported backup with current irreversible death/release journals, boss roster and world-end state, validate the resulting complete backup *before* any localStorage write. An invalid combined state now aborts safely instead of partially replacing current game progress. Existing save format and UI unchanged.

Implementation commit cad10daac446e77e211416cce2aa62ab04cc7503, updated save-backup.js blob e40eac897a4496ccade0a0dcb85a286026141d61. Cache rev published in index.html commit e596ef20a675541ae0776b838c87258373b5f764.

Checks: verified preflight order before writes, after merges, permanent-ID handling and rollback preserved; 5 source assertions passed. Re-fetched source and HTML. JavaScript runtime syntax test and real browser/Android interrupted-write tests NOT completed; shell network DNS prevented downloading the live JS for node --check. GitHub Pages deployment pending verification.

Next: implement crash-safe two-key world save/pantry journal with failure injection and actual runtime regression tests. Do not repeat backup preflight work.
