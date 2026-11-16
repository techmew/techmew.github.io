# 2026-11-16 — UFO and apparition player-aggression fix

User-reported live issue: UFOs and spirits scarcely attack the player. Explicit one-off bugfix; hourly P3 eastern exploration / weapon priority remains unchanged. No separate automation, no image generation, no modifications outside neo-wild/.

## Implemented in active gameplay
- **apparitions.js**: replaces the very late era 45 + low-probability encounter gate with a nearby visible encounter after about 70 seconds of eligible active play, or up to 115 seconds while a saved nextYear cooldown is pending. Ghosts chase the player with a longer visible manifestation (34 seconds) and can rematerialize in a clear lane when blocked, while possession and stamina drain remain cover/LOS-gated. Existing timed repulsion, wild animal fear and owned/dead ID protections remain.
- **ufo-events.js**: replaces the era 50 + sparse chance gate with a local UFO encounter after approximately 75 active-play seconds (more frequent later). Fractional elapsed years are used for event-era thresholds; before era 100 the saucer intermittently hunts an exposed player and emits real gravity-beam hit events with small HP/SP drain and brief stun. Early beam damage cannot by itself take HP below 1. From era 100 on, the existing actual serialized player abduction/permadeath path is maintained; hiding and physical LOS still interrupt targeting. Wildlife remains the early UFO's principal pursuit target.
- Existing independent 2D canvas/WebGL drawing code, UFO warp phases, saved owned/dead/released individual IDs, 3+3 roster, SAVE_SCHEMA2, food inventory and 100-year end boss are not edited.
- index.html rev pins updated to the exact new ghost/UFO blobs. No title, main menu or squad layout changes.

## Commits
- Ghost chasing: 3d85a0a53a4b36e7eb8f643ccb7015a2d679bfb7
- UFO player aggression: df0a120a4f00b0dd2157668b49eec3f3018f33ac
- Dedicated regression: dcf3fd624b6cec8378c4d9f37d3b62c340ff6f68
- JS cache revisions: 40602e8348c7b6b6a42ed37dc1d9597051c2e5a3

## Evidence / validation status
- VERIFIED (V8 logic): both exact committed production JS files parse with new Function. Simulated real module tick calls trigger ghost possession, early UFO beam damage (4 hits; mock HP 100→84, SP 100→48), and later-era player abduction. Hiding and solid-wall cases prevented these attacks. Newly committed anomaly-hunt-regression.js executed successfully with V8's CommonJS/VM compatibility shim (not Node CLI).
- NOT VERIFIED: real browser controls, actual 2D canvas/WebGL frames, Android device, FPS, real saved-game E2E, Node CLI standalone regression, long-session threat balance.
- GitHub Pages workflow after cache commit was in_progress when checked; do not equate that with deployment success. Requery for latest run.

## Follow-up gates
1. Confirm Pages latest successful deploy and Android/browser manifestation, approach and real incoming attacks. Adjust only if observed failures.
2. Keep next hourly P3 deliverable: right-map random spawn → hostile NPC → identified salvage → species/individual equip → boss damage → title/Continue/JSON backup restore, with terrain/2D/WebGL positional coherence. Do not repeat existing weapon or anomaly features.
3. Record unfinished P1/P2 as pending; do not switch the fixed P3 priority unless a critical P0 data-loss defect appears.
