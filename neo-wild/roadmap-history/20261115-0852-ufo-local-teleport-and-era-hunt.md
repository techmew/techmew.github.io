# 2026-11-15 08:52 JST — User-directed UFO visibility / cinematic arrival

## Cause
Previously the live UFO event spawned at a random world coordinate (8400x6000) but displayed a global notification. It could be completely outside the player's current camera. The 1.45s approach stage did not teleport it into view. This prevented the requested observable UFO encounters despite the event ticking normally.

## Delivered (existing main branch; no title/UI/save schema change)
- ufo-events.js `3f29b9f5b2e0cf962029ab5d4ec25758544cdfa0`, blob `ed9142c97f45008dcd1087d636c5ee596acec00a`.
- Incoming UFO now spawns in local view (~115 world units), enters warp-out animation (center luminosity, X compression and Y elongation) and then reappears near the player through reverse warp-in. Formation escorts share the same effect and retain independent body/beam logic. Remote prepatch active scans with no victim are relocated locally rather than lost. Live saved stages recognize warp-in/warp-out.
- Early effective eras 50-99 focus on live non-owned wildlife; from 100 player targeting begins; from 180 player pursuit takes precedence. Cover, hiding, line-of-sight, live ownership/death restrictions and existing captures preserved. Local roaming instead of whole-map roaming.
- index.html activation/cache commit `7d5262aee4e671b2daa6200c94f6fc4399bec1d3`; `ufo-events.js?rev=ed9142c97f45`; other scripts/title UI unchanged.

## Tests run
- JavaScript parse via `new Function` PASS.
- V8 simulated local spawn -> warp-out -> warp-in -> scan, two era branches (early wildlife-first, later player detection), Canvas mocked vertical luminous outbound and inbound transformations, remote-origin local arrival PASS.
- Additional V8 NPC scenario: at 20 world years, saucer abducted a deer and did not abduct/kill the player; late concealed player behind obstruction did not accumulate capture beam PASS.
- No actual Android, browser WebGL visual, or measured FPS tests. Pages workflow runs separately checked after cache commit.

## Ongoing epic
User instruction to prioritize this UFO visibility/teleport bug supersedes interim P2 work for this turn only. P2 batch of manul/Tibetan fox/shoebill/penguin still lacks total acceptance. Do not repeat this UFO patch. Next hourly work should resume P2 species integration/behavior and executable game-flow tests. Preserve ordinary 3 + boss 3 slots, legacy 4/5 save records, irreversible death/release, schema 2, and title UI.
