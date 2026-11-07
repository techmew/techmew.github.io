# WILD RECLAIM 2026-11-07｜ユーザー指定：セーブ保護・画面下ボタン・年表修復
Phase A / latest origin HEAD: 9441ddd5dd1b1ab1e6978579c150becd5864dc85
Changed:
- neo-wild/index.html: play action moved inside #squad-home AFTER 3-card roster; added export/import and warning at actual bottom; scripts cache bumped
- neo-wild/visual.css: hide redundant ownership heading/counter hint; compact backup buttons and warning
- neo-wild/game.js: beforeunload on menu must not persist stale squad; validate snapshots before autosave, refuse stale tab world clock rollback and malformed overwrite, verify storage writes; refuse silent fresh launch when an unreadable auto save still exists; simplify continue help
- neo-wild/world-history.js: functional YEAR 0 origin/current marker, reached-era milestones (explicitly NOT guaranteed events), persisted disaster/ecology/lightning/UFO records and autosave fallback
- neo-wild/save-backup.js (new): user-triggered JSON export and restore of only wild-reclaim-* localStorage keys, checksum, input limits, explicit confirmation, rollback on storage write failure, permanent deceased/released ID union and archive retention

Tests completed:
- JavaScript syntax in game/history/backup passed.
- Backup JSON roundtrip with checksum and tamper rejection, no other games keys, import and restoration mock with living roster, death and released ID union, and reload PASS.
- YEAR18 chronicle mock: displayed correct year/era, actual ecology and disaster events, origin.
- HTML order/element id/script references checked; exact old blob/HEAD matched before commit.
Unverified: Android Chrome physical interaction, large historic SAVE_SCHEMA2 full session, WebGL in live game, GitHub Pages propagation.
Known storage limit: browser localStorage is origin/browser-bound; clearing site data or changing device/browser can erase local data, thus only separately downloaded JSON ensures portable backup. Game update alone normally retains localStorage.
All other UI/species/terrain/source files untouched; backup archive/history and ROADMAP.md untouched.
Next: check Android backup download to Downloads, restore old 5 survivor roster, game continue and world-history modal; check stale Chrome tabs and quota scenarios.