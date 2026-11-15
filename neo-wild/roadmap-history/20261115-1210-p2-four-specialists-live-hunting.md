# 2026-11-15 12:10 JST — P2 four-specialist live wildlife hunting (PARTIAL)

Start HEAD `1626def93611e2d7cc4988cb5de791a62f8fd602`. ROADMAP-RECOVERY.md, latest roadmap-history, commit list and game/fauna/WebGL/bestiary/gacha sources read. No title/menu/layout, save schema, squad slots or existing assets altered.

## Live playable change
Previously the four specialist NPCs could approach prey but their existing windup damage path targeted only P; prey-to-prey encounters were nonlethal. The real game.js NPC loop now applies actual melee HP damage to unowned wild prey for manul, Tibetan fox, shoebill and penguin when in physical range and unobstructed. Each uses its existing water/habitat movement and 2D/WebGL strike pose state, species-specific cooldown, prey flee/alert response and corpse handoff. Explicitly excludes companions, owned/squad IDs, released animals, UFO victims and bosses. No player XP/trophies from wild kills. No save schema changes. Existing gacha/bestiary hooks preserved.

Implementation commit `befaa0846021b95bcbe2e508f367e7396a3a4ec3` (game.js blob `923020a959cdae84dacffab6e255206473101854`).
Cache activation `b1ca601da5abe292d1acc9937b3639b3f9f4372b`, index `game.js?rev=923020a959cd`.

## Verification
- JS full game.js parsed by V8 new Function: PASS.
- Executed isolated real-code strike excerpt with all four types, live prey HP decrease and cooldown preventing double hit: 4/4 PASS; companion protection PASS.
- Executed existing P2 source regression (V8 source-injected) without throw; gacha ownership and bestiary migration/reload mock PASS. Node CLI NOT RUN.
- Browser 2D/WebGL, Android, FPS, long-run stability and complete full game-loop integration NOT RUN. The NPC death-to-food path needs an actual browser session; do not claim complete batch.

## Status
P1 source-integrated, browser unverified. P2 0 completed batches / 24 unfinished species; current 4-species batch partially implemented. P3-P8 not accepted. Next run: four-specialist end-to-end combat, death/corpse, 2D/WebGL, gacha and bestiary through a browser or executable game-loop harness. Avoid returning to UFO microfixes. No user action required.
