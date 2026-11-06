# 2026-11-06 13:00 JST / 00分担当
PHASE=A_FEATURES. main HEAD before dc8c33: 7937970cd8df9c8b17198ca63cab758d39ea9fbe.
Implemented equal-timestamp stale autosave leader protection in squad-core.js: only explicit selectActive() overrides persisted leader; save timestamp increases monotonically. Commit dc8c33b3939b351c03344689bb1cd3d09d202bdb. Blob b9d05b1476808d9c0a6112bf351de0aa05f9fb2b -> 00d50622233e1b88bfab1b725519660bed3f1e83.
Preserved UI, HTML/CSS, 3-slot roster, legacy survivors, death/release tombstones, mountain snow and WebGL files. Main refetch and content guard: PASS. Browser runtime, old SAVE_SCHEMA2, 30-species attacks and mobile E2E: NOT VERIFIED. Next: isolated JS tests and terrain-save integration, do not overwrite other agents' mountain/webgl changes. ROADMAP.md untouched.
