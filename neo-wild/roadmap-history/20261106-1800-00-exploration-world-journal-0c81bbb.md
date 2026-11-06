# 2026-11-06 18:00 JST / 00分担当・探索記録と再開の保存統合
PHASE=A_FEATURES / ACTIVE_SPRINT_ID=WILD-20261106-PERSIST-EXPLORATION.
- main HEAD before: 8e4f48920c1459c0b5a2cb556638113af7bcecbe.
- Code commit: 0c81bbbfae049074c8d4cb9c3dc2685ce6522a65.
- Changed neo-wild/game.js blob: c88c231ac44162959ed0d3b5a8a233124086b75f -> 623039bba9a1e546d8f2bf7b65e31c5bf862c9de.
- Functionality: additive discoveredSites/earnedDiscoveries in existing world chronicle v1; preserves discoveries when full autosave fails; roster-only Continue restores found sites and perks; older SAVE_SCHEMA2 checkpoint merges newer world discoveries; leader changes reapply applicable perks without accumulating bonuses; explicit NEW GAME resets these world-journal fields.
- Preserve: old chronicle version 1 and SAVE_SCHEMA2 shape, saved region coordinates, 120s/YEAR and 85s/day, mountain/river/snow rendering files, 30-species action definitions, death/release tombstones, roster.leaderId, protected legacy 4/5 survivors, no AI accompaniment.
- Tests passed: full game.js JS parse; isolated localStorage world-journal write/read and monotonic merge; old v1 chronicle read and additive migration; static regression sentinels. Postcommit re-fetch confirms code blob SHA and commit is main HEAD. Only game.js changed in code commit.
- NOT VERIFIED: Android browser/WebGL runtime, 30 species movement and face regression, actual browser SAVE_SCHEMA2 fixture restore, old 5-member save E2E, real GitHub Pages cache.
- Handoff to 20/40-minute owners: terrain and snow remain code-owned by those slots; do not change HTML/CSS/UI or ROADMAP.md. Test river/snow continuity on resumed saves; no reset/revert/force-push. Next 00-minute slot should test browser-derived old snapshots and landscape changes; ensure per-district exploration cannot regress.
