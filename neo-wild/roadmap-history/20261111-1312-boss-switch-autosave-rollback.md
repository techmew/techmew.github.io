# PHASE A | Boss/ordinary live switch: autosave failure rollback
Baseline: main HEAD 40695ab76bfa6beda7b291cbc554a815b86dd60a. Fetched latest commits, latest roadmap-history including 20261111-1210-live-boss-switch-rollback.md, ROADMAP-RECOVERY.md and current game.js/boss-roster.js/index.html blob SHAs.

Problem: a successful habitat switch persisted a new boss roster selection, but when saveAuto() rejected a stale-tab, invalid or quota-limited world snapshot, the game kept controlling the newly selected animal while the old world save still referenced the previous actor.

Implementation: wild-boss-selected event now snapshots previous actor and choice, switches without saving, checks saveAuto()===true, and restores actor, choice and durable boss activeId if either habitat placement or autosave fails. Re-entrant selection rollback remains guarded. No death/release ledger, ownership slots, UI layout, save schema, world time or assets changed.

game.js commit 7644ddca75b1615190016b94d04574cea090bf22; blob be1bc9188a8a6b5d1a83d55403c65818a93690cf.
index.html cache commit ac3d67d12a769a4b29e61a30b3324d0b458ea42e; game.js?rev=be1bc9188a8a.
Validation: whole game.js new Function syntax passed; event path static regression verified; 4 simplified switch success/failure scenarios checked. Re-fetched game.js and HTML blobs/rev. Actual browser/Android and storage-quota E2E not tested. Other keys (squad vitals and world chronicle) can still be written independently; full multi-key atomicity is not claimed.
Next: implement robust normal squad selection rollback when saveAuto fails (including durable leaderId), with storage-failure and stale-tab mocks; then verify in real browser.
User action: none required for code changes; Android test video remains optional.
