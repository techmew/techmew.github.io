# PHASE A — Shared pantry corruption guard (2026-11-12 JST)

Baseline main 0881ce58a8b89b594dd16ab566b961afd9085240; reviewed recent commits, ROADMAP-RECOVERY.md, 20261112-0030-den-meal-autosave-rollback.md, 20261112-0018-meat-withdrawal-rollback.md. Initial game.js blob aaab322a66b1aa672a4a25a11f7dce3dae3a720a; index blob 682478dd9ca099e171c43d6edce89b13772652dd.

Gameplay fix: saveSharedDen now refuses to overwrite existing authoritative pantry when its JSON is malformed, its version or required stores/lots are missing, or food amounts are invalid. A damaged pantry remains available for manual JSON backup/recovery rather than being silently replaced with empty food on eat/withdraw/deposit. Existing warning remains. No layout, save schema, death/retired IDs or roster changes.

Game commit 1be2d23a99507cde956ad8f3fb4c3cf7a9046ad3; game blob 0b25ee93efb278afe936f91faa2243bb905132dc. HTML revision commit e1c9703bab42fb2d89f0927012cca5826584a672; index references game.js?rev=0b25ee93efb2. Both files read back with expected blobs.

Validation: full game.js syntax parse passed; 7 isolated shared pantry write cases passed (initial, valid prior, malformed JSON, wrong version, negative meat, missing lots, quota denial), including unchanged prior storage on failure. No real browser/Android verification.

Remaining: localStorage cross-key writes are still not atomic; interrupted meal/withdrawal between shared pantry and world autosave can cause inconsistency. Next priority: durable transaction journal for interrupted pantry operations with recovery on Continue; then Android gameplay test. No user action required.
