# 2026-11-16 00:45 JST — First-run objective briefing + live controls practice

User explicitly accepted a compact start explanation and an actual hands-on tutorial. Existing latest main a5a79ce already contained a single one-time goal briefing which pauses gameplay, names the final 100-year boss and allows immediate free survival without the old forced four popup mission stages. Do not reimplement it.

## Newly delivered
- First-run briefing text shortened to: animal survival in humanity-free world; grow by food/hunting/exploration; collect eastern scrap weapons at the den; final goal is to defeat the gigantic boss appearing after 100 world years. One primary button says 「冒険を始める」.
- Added first-steps.js: a small nonblocking training overlay on the real world (not a mock video or frozen popup). Five actual input milestones: move 65+ world units (teleport never counts), successful jump, attack animation actually committed, successful meal/scrap pickup OR open den pantry, then open the real world map. The last opens the map and marks completion.
- Each step auto-advances when its action succeeds. Incorrect/out-of-sequence actions don't advance. A skip button is always clickable; completion/skip is recorded in a separate wild-reclaim-* localStorage key, not SAVE_SCHEMA2 world/squad/death data. Any character can use the same guide; birds fly on jump and carp jump in water.
- Starting a NEW WORLD triggers this once after the paused briefing closes; if the earlier briefing was already seen on another playthrough, a subsequent new world may show practice without re-displaying the briefing. Continue/old checkpoints do NOT force popups or practice.
- Returning players can open the existing 「ガイドを見る」 panel and choose 「操作を練習」 to replay the practical lesson. Skip or death cleanly hides the panel. A successful full run triggers a short completion toast. Existing title/menu, animal roster, bottom buttons, saved gameplay, gacha, den pantry, weapon vault, boss combat and random starting locations remain intact.
- Responsive overlay positioned above touch controls; pointer events pass through the panel except the Skip button. The existing hidden class display:none!important is preserved. English translations were added to i18n-phrases.js for introduction and guide UI.

## Implementation commits
- f96279803718688d77cf2e6aad82f27f3380c267 first-steps.js
- 71555ecbfa6eff982d2a17e291f47caa52dff780 game.js live action hooks, one-time intro text
- 8b1ccf42e9cfa22cee370d522a4d3e671a449a92 HTML guide and script order
- 6df1f1f5ba8bf39b0e7d566da70c7efd33f1ad42 responsive CSS
- caee252a8c47663a60bba83b5c1948eca562193f and 505e3bbf881bb680fea00214ba6729ad7aaffbfa English translations
- bc9d402d57d5f19378eac9bd04fdd12ac370918e first-steps replay/death handling
- ac4a219f81c881f983fd1770b3d07fa96074ff51 game.js den action and manual replay
- f778009f3fd7cd29482ad9da98fae9b5e70acd88 regression
- 5c01935b0ef2c85f8bee92219c9f765c3472a8d8 completion notification
- 04d257f6d25674465d965eb5a4b07bce96f1e756 final game/CSS/module/i18n revision loader in index.html

## Verified
- V8 new Function parsing the actual game.js, first-steps.js and i18n phrase bundle: PASS.
- Committed first-steps-regression.js was executed against the current production sources using an isolated CommonJS V8 shim: 48 assertions PASS including teleport rejection, actual move distance, step sequence, production world-map opening, modal render, one-time introductory language, manual replay, skip, storage separation and real-game action hooks.
- The HTML references the exact present JS/CSS content blob revisions; script dependency first-steps.js before game.js.
- GitHub Pages workflow for cache activation 04d257f completed SUCCESS (run 43733302677).
- Actual browser/Android touch testing, visual screenshot/FPS and true local Node CLI execution: NOT RUN. The local container cannot resolve raw.githubusercontent.com; never claim UI visually accepted from V8 source/mocks alone.

## Next
P3 priority remains, no other automation created/altered. Preserve the one-time briefing and optional hands-on tutorial during ongoing right-side wildlife/weapon/map development. Verify live mobile screen overlay, safe world respawn, role of active touch/keyboard/gamepad and first-time status in real browsers. Do not re-enable forced legacy tutorial milestone popups or reset SAVE_SCHEMA2.
