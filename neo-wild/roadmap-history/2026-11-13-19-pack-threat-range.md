# 2026-11-13 19 JST — pack threat range

- Gameplay: pack encirclement now requires visible attackers within a body-size-aware threat distance (92–195 world units) instead of 195 for every animal. Prevents small flankers hitting from implausibly far away; larger animals retain reach.
- Implementation: 5a3459c66dff7af14527bbd0b8d45907aef0d0f0 (`pack-tactics.js`); cache publish: e1c6d1bb74f92d1463be645add7308100f5f9066 (`index.html`).
- Checks: pure threshold cases (small near/far, large reach, cap) and source structural assertions passed. JS parser execution, full mock game loop, browser/Android, and Pages propagation NOT verified.
- Preserved: HUD/menu, save schema, pack warning/counterattack cooldown.
- Pending: JS syntax and gameplay regression tests, Pages propagation; attack input-to-hit latency in 2D/3D; save/load and meat storage end-to-end.
- Next: instrument and reduce input-to-hit delay in actual game combat loop, with hit timing tests.
