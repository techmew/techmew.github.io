# 2026-11-06 16:15 JST / 40-minute gacha cancellation repair
PHASE=A_FEATURES. ACTIVE_SPRINT_ID: WILD-20261106-GACHA-ADOPTION-GUARD.
- Main HEAD before: f9a1108438de88433656e5d1dd49c85ea0d61901.
- Code commit: 3af5d7e39aec1892bebea8e5f78111facf1e2aeb.
- File: neo-wild/squad-core.js, blob 00d50622233e1b88bfab1b725519660bed3f1e83 -> a040119664216038a8b5f3d2a47844b50647d47b.
- Fixed: drawSlot.choose() now marks selection only in memory. Previously it persisted wild-reclaim-gacha-poor-streak-v1 before adoption, allowing cancel to mutate save state.
- Persist gachaPoorStreak inside wild-reclaim-squad-v1 together with ownership and ticket changes, only for verified newSquad/addInitialSlot/fillVacancy adoptions. Ordinary autosaves cannot roll this field back; legacy pity key remains read-only fallback.
- Unchanged: squad-gacha-ui.js, top "この個体で決定" / "ガチャ結果をキャンセル", UI/HTML/CSS, other games, terrains, 3D, ROADMAP.md, death/release ID guards, original 4/5 living members, roster.leaderId.
- Local JS parse and isolated localStorage tests: PASS (selection/cancel no storage writes; new roster, free slot, paid vacancy, pity update, stale-save prevention, legacy five-survivor preservation).
- After commit, main HEAD and core blob re-fetched exactly; commit remained main HEAD.
- NOT VERIFIED: real browser gacha clicks, Android UI, actual SAVE_SCHEMA2 E2E, GitHub Pages cache/propagation.
- Other owners: 00-minute leader guard dc8c33b, 20-minute mountain snow field 598b4ef; preserve their changes. Continue snow seam/3D priorities after live gacha QA. No reset/revert/force push.
