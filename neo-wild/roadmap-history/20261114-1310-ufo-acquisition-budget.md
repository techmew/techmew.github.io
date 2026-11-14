# 2026-11-14 13:10 JST — UFO pursuit frame budget
Starting HEAD abf86351ade5b0f1f609816ab209be66db4dd90a. Read ROADMAP-RECOVERY, recent commits and 1210/1110 UFO handoffs. UFO blob before ce18712eb7f035426b01c96f26e52b44200c7f28; index blob 3dd40f7f426906a7e01992172891b323e4411f4f.

Implemented in live moveEscorts: every escort revalidates its existing wildlife pursuit every frame (dead/missing/out-of-range/cover), but wide-area line-of-sight acquisition is throttled to 0.18–0.236 s, staggered by formation offset. This reduces repeated candidate LOS checks with 3 saucers and preserves immediate cover escape. Existing player pursuit, tractor beam, capture, save identity and title UI untouched.

Code commit 1b80362cdc47cdb19bc75cf87d83c59d9a7d26e0; UFO blob 34dffa2f20320d0e7b7a22078585f72e5bbb3ae6. HTML rev commit d5438be80567df5e63fc606ce4606f51c0951566; HTML blob 08c4d6321eae3b1260737482455dc15a34a21363; only ufo-events.js rev changed.

Validation: JavaScript new Function parse PASS. Isolated 800-NPC, 3-escort 60-frame mock executed moveEscorts and observed 18 wide LOS acquisition scans vs 180 unthrottled baseline. Blocking an actively tracked NPC immediately released its target; event state remained JSON serializable. These are mocked counts, not measured FPS. Android, 2D/WebGL real-browser and long-session tests not run. No changes to save schema or menu. 
Next: browser benchmark of actual UFO 2D/WebGL rendering and gameplay frame time with crowded NPCs; review whether escort player acquisition needs a similar budget, without weakening cover or death protection.
