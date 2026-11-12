# PHASE A — Damaged pantry Continue guard (2026-11-12 JST)

Baseline main 43e798b03b00be192269b6a9261ec8aa12315613; game.js blob 17abd66230e2eff6010496e613f673448af3985a. Checked ROADMAP-RECOVERY.md and recent pack encirclement handoff.

Fixed restoreSharedDen: when a durable shared pantry key exists but cannot be parsed/validated, do not silently treat it as absent and rebuild meat lots from the world snapshot. Notify player to preserve raw data and inspect JSON backup. Storage read failures also show a warning. Existing save format, UI layout and permanent IDs unchanged.

Game commit 8efa80bae6c43a2d303ef2e4bdaa00ce4b1c4a1b; HTML rev commit 419ef65555178aef3d211234b3793d52c1f020c5. Re-read game blob 466045fcc927d740c1ab1328b7e0f12464165dcc and index game rev 466045fcc927.

JS syntax parsed; three isolated guard mock cases passed (corrupt JSON, valid pantry, absent pantry). Not tested in actual browser or Android. Pages live deployment not confirmed.

Remaining: full two-key pantry/world interrupted-write journal and verified crash recovery. Next: implement journal for withdrawal/deposit with failpoint tests, preserving old saves.
