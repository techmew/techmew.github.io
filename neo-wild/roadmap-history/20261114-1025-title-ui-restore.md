# 2026-11-14 10:25 JST — Restore original title layout without game rollback

User reported broken Android title layout and explicitly ordered: restore previous UI while retaining added gameplay and ownership features.

Root cause in existing visual.css: #menu #squad-home #save-menu-actions had order:20!important although boss-roster.js inserts #boss-owned-slots immediately after the resume element in DOM. This CSS order moved the boss roster above Resume, leaving the main continue button below large cards. Other overlapping CSS enlarges the three animal cards; flags were seen off their intended top-right position in the provided screenshot.

Resolution: Add title-scoped neo-wild/title-ui-restore.css, restoring compact three-card geometry and order animal roster -> continue -> boss roster, while retaining two other empty slots, boss ownership three slots, existing illustration and collection controls. Anchor language flags to title upper right. Do not modify menu HTML nodes or behavior, the save/gacha logic, gameplay JS, permanent-death IDs, backup keys, or UFO/disaster functionality.

CSS commit: c1fed7fca424b4fdb840f9efc60959fdb210f6d5 (CSS blob 66147d13b3a4f9c20f3218d5d8e7b5ae135db7f8).
HTML revision/activation commit: 302d39ed229e16389d57643be5387d8a0d3145a2 (index blob 444fca8d9e285ceddd1c7b7e1efb2e9c6089d3cb).
Checks: CSS brace balance 30/30; exact HTML unchanged apart from one stylesheet link; all JS src URLs unchanged, roster, resume and backup DOM nodes retained; fresh main reads confirmed CSS link and current content blob. No gameplay, gacha, saved animals or save schema changed.
Pages run: https://github.com/techmew/techmew.github.io/actions/runs/43540481209 (queued at verification); publish must be rechecked.
Limitations: real browser viewport screenshot/visual regression and Android touch tests not performed in this run. Do not call them verified.
Next: verify Pages deployment and Android title behavior (resume immediately below slots, boss below, flags top-right, long species names not broken), then return to UFO escort regression/performance checks without undoing the title fix.
