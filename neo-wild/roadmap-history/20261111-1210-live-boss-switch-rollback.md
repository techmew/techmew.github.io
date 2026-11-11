# PHASE A — Live boss selection and habitat-safe rollback
Baseline main HEAD e484f29a47dec96f1dbcb90174c34680b5d71cf1; inspected latest commits, ROADMAP-RECOVERY.md, roadmap-history and game/boss-roster source blobs.

Issue: boss-roster.select(id) persists the choice and emits wild-boss-selected, but game.js only listened for this event while in menu. A player selecting a boss during play/pause/inventory did not change the controllable actor. Failed habitat placement could leave roster.activeId mismatched with the live actor.

Fix: in-game boss selection now invokes applyBossLeader(false) and saveAuto(), while selecting normal animals invokes applySquadLeader(false). Failed habitat switches revert durable boss selection to the prior active ID with a re-entrancy guard. Existing title UI, ordinary 3 slots, boss 3 slots, legacy save formats, death/retirement ledgers untouched.

Code commit f81743a7f72eaa2ff2058b703a2d74a5ce60a961; game blob ec48f6b84938253a9cea216ce26b5121ccec59cb.
HTML commit 04a7707c3f605333d2bda7fe2128d0b14c7f31d8; game.js?rev=ec48f6b84938.
Validation: entire game.js parses; four isolated event-handler mock scenarios passed: boss switch success, boss habitat failure rollback, boss->ordinary success, boss->ordinary habitat failure rollback. GitHub file blobs and cache rev fetched after update. Browser/Android/legacy-save E2E not performed. Note: world autosave failure after a successful switch reports an error; atomic cross-key persistence remains future work.
Next: transaction-safe save failure rollback for live boss/ordinary switches and full Android E2E.
