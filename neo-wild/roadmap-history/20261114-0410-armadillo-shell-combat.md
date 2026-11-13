# 2026-11-14 04:10 JST — Armadillo defensive shell / physical counter (PHASE A)

Baseline main HEAD a8fab01a00befbcd4004ddf67e7861a26008de01. Checked ROADMAP-RECOVERY.md, roadmap-history latest 0310 frog ripples, game.js/fauna.js/index.html blob SHAs, recent commits, webgl3d.js. Did not rewrite original ROADMAP.

Player experience: a wild armadillo hit by the player curls for ~2.1 seconds, taking 36% normal melee damage while curled; aerial dive/stealth ambush can bypass shell. While curled it can inflict one close-range physical counter hit (line-of-sight, invulnerability, height and collision checks). Shell guard blocks routine stagger; roll can be dodged by backing away. 2D top-down and 3D wild armadillo rendering now show the rounded retracted shell and animated counter pose. No save schema, permanent death IDs, existing squad/UI, or event-year behavior changed.

Commits: game.js 6e6849e6706d47453a2134ae8b1b87bd9cbacc7a; fauna.js 901e400ce0c0941e6c037fb41f27d78084906ae2 then draw contract correction b5b301cc5fb85156a985a72d3a630d1b0a2d3a35; webgl3d.js b62dc0068bb23ee7fe7f3bb6605f3396e040e7b3; HTML rev publish c1b160d0e18cf2c72a9fa18e14161b9df6c54700.

Verification: JavaScript syntax parse for all three edited modules passed. 17 code-path/integration assertions and blob lease checks passed; these are NOT a live browser or Android gameplay test. Need runtime collision, attack/draw checks in browser and WebGL performance measurement. Pages deployment status to be checked after this record.

Important unfinished: verify actual armadillo counter timing, no unwanted counter during enemy-only combat, ensure 3D player armadillo appearance if player unlock is later enabled; 24 non-gacha species still require individual behavior, plus geography, meat pantry, bosses, trophies, long-run FPS and 4-player co-op.

Next concrete feature: give hedgehog an actual quill-guard/retaliation phase with visible 2D+3D spines, and test it in live gameplay. Avoid repetitive wetland micro-adjustments.
