# PHASE A — 2026-11-14 08:10 JST: badger ground-rake finisher
Baseline latest main d649e6b7995a3fa48bacd67db1487872315906f7. Read ROADMAP-RECOVERY.md, latest roadmap-history directory, latest commits and target blob SHAs.
Actual game improvement: playable badger fifth rush combo gains a grounded claw-rake finisher (1.58x base species factor), actual hitbox-validated non-boss stagger (0.43s predator / 0.68s prey), terrain line-of-sight protection, feedback particles, and separate 2D claw extension and WebGL soil streaks. No new images, UI changes, persistent save fields, or changes to dead/released ID handling.
Game commit 117bcc20fbb9b1fa4003d1cb38a84a0fe6ffc3af (blob 69bc945ec195ec6a58bcdc60e6f3b426050e552f)
Fauna 2D commit f2373f2325526b3bb095ce1577d823779e1d2b93 (blob 7a6263f089338d9b41205170b2aebdcff601d422)
WebGL commit feff328a86a61f1eb8f0f41b139de6ce65664874 (blob a684bdd7a68899a9fe0fac92ad60c3f38494651a)
HTML rev commit c576749d9c91c126c254385d89083d3d3922de31; HTML re-read confirmed revisions.
Verification: new Function parsed full three JS files; 11 structural assertions including hitbox, terrain cover, no save schema changes, and pre-write concurrent blob checks. Browser and Android live gameplay, FPS and true end-to-end combo timing NOT tested.
Remaining: 35 species quality (24 unreleased under verification), meat/pantry gameplay, 100-year boss, map and trophy progression, Android/gamepad and 4-player co-op. Next large item: complete one unfinished species' distinct predator/prey AI and player move rather than more claw-number adjustments. User action: none.