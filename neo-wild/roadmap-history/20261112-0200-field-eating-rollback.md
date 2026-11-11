# PHASE A — Field eating autosave rollback (2026-11-12 JST)

Baseline main fcaac490c5c3dfd17444b14838cecc58f33b7baf; game.js blob 436ab547f9bf8891f4552cccb2dc302f9c254b82. Reviewed recent commits, latest pickup/deposit handoffs and ROADMAP-RECOVERY.md.

Gameplay: field eating from carried meat, loose food, or carcasses now commits the food deduction, HP, hunger, wounds and meal counter in the same world autosave. If save fails, restores the original carried item/food quantity, vitals and meal count; suppresses success effects and mission progression. Depleted carcasses are converted/removed only after successful save. No change to UI layout, save schema, roster IDs, or images.

Game commit 5c592bacf35cea34fee912b581051bbaa23131cf; game blob 43dd4d552c57f441caded8d8e4b9a7a80a000963. HTML rev commit b4cc29976dada40c3672a03af40573e03359798c; index.html rev game.js?rev=43dd4d552c57. JS syntax parsed, 80 isolated mock assertions across carried/ground, carcass/non-carcass, save success/failure passed. Files re-fetched after writes.

Unverified: full browser/Android real play and interrupted writes. Next: durable cross-key pantry/world transaction journal with Continue recovery, ensuring old saves and death IDs remain intact. No user action needed.
