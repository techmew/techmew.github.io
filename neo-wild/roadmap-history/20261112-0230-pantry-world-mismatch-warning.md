# PHASE A — Interrupted pantry/world save mismatch warning (2026-11-12 JST)

Baseline: main 1b11ba0f4ce879a156f8d7124b567520b40e1ab5; game.js blob 43dd4d552c57f441caded8d8e4b9a7a80a000963. Read ROADMAP-RECOVERY.md, recent commits, and latest field eating / deposit rollback handoffs. No old fixes reimplemented.

Gameplay: On Continue, restoreSharedDen now compares validated world-autosave food totals against the independently stored shared pantry. If a crash interrupted a two-key write, it preserves the shared pantry and displays an explicit JSON-backup warning instead of silently hiding the disagreement. It never overwrites either key during detection. Older snapshots lacking denStores are still supported. No menu/roster layout, permanent IDs, time, schema or image changes.

Code commit cf854c268bf49bf969fb4928cae1023a11851a53; game blob 17abd66230e2eff6010496e613f673448af3985a.
HTML rev commit f8507425332cf18be2c3fb214bb0021164d71b3b; game.js?rev=17abd66230e2.
JavaScript full syntax parse passed. 12 isolated mock assertions: matching pantry, meat mismatch, berry mismatch, legacy snapshot without stores. GitHub game.js and HTML read back at expected blobs. Real Android/browser not tested.

Important limitation: this is mismatch detection and data preservation, NOT automatic cross-key recovery. A durable transaction journal with safe commit/replay remains necessary. The warning may also occur if world autosave is intentionally older than the pantry. Next: transaction journal with verified rollback/recovery and interrupted-write tests. No user action required for this patch.
