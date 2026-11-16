# 2026-11-16 14:40 JST — UFO player abduction fixed (urgent P0-adjacent gameplay regression)

## Report and root cause
User reported that the controlled animal is never physically lifted by UFOs. The previous update introduced early chase and nonlethal gravity hits but mistakenly retained a `presentEra>=100` guard on `beginLift(..., player=true)`. Worse, the early harassment hit reset `e.beam=0` at 1.3 seconds, making the 2.2-second capture condition unreachable in early years. This was an actual code-path defect, not an encounter-frequency issue.

## Live changes, not duplicate mechanics
- Updated `ufo-events.js`: early UFOs still primarily hunt wild animals, but after a short scan a visible, uncovered player may be pursued and locked. Warning pulse at 1.15 seconds damages/stuns minimally **without resetting the beam**. At 2.85 seconds of continuous early-era line-of-sight lock, the original `beginLift` player path activates; advanced eras still use 2.2 seconds. `beginLift` freezes player controls, serializes one lift, existing draw path rises/shrinks actor, logs capture, and existing `beginDeath` kills and permanently removes individual. Cover / hidden / interrupting exposure still cancels lock.
- Existing canvas + WebGL shared overlay now displays the beam only during an actual target lock or lifting (instead of permanent decorative scanning). Existing player shrink/dock path reused; stage transitions unchanged.
- `anomaly-hunt-regression.js`: 60fps actual UFO tick simulations assert full early and late chain, emitted capture/lift-start/abduction/death events, `P.deathReason="ufo"`, HP=0, visible decreasing character scale, and protection for hiding, wall, hide-mid-lock. Ghost test preserved.
- `index.html`: cache revision updated to the actual UFO blob SHA; UI layout untouched.

## Commits
- Live UFO implementation: `c21a3c0d2dd0aedae3dbe89a9f7b5c94b67f5c0b`.
- 60fps repeatable regression: `5d80390043d8e327d1d579d1c6e1216cffa183d2`.
- HTML cache revision: `d1f2219440c0f2c47d8d1d9370e64de834395925`.

## Validation boundaries
- PASS: production module V8 parsing, 60fps simulated tick state changes and full capture→2.4s lift→UFO takeoff→death callback; simulated overlay scale shrinks from ~1 to ~0.046; 8 behavior groups pass.
- PASS: committed regression re-fetched and executed in a V8 Node-compatible VM/files/assert shim (not the local Node CLI).
- NOT EXECUTED: Chrome / Android actual video playback, WebGL pixels, real SAVE_SCHEMA2 load, real FPS. Local Node v22 available but source download via raw.githubusercontent.com failed DNS; no Node CLI run claimed.
- The game’s `game.js` explicitly supplies `onPlayerAbductionStart` to reset attacks/controls, and `beginDeath()` persists squad/boss death + permanent ID ledger; these were inspected and not modified.
- Pages status must be inspected for the actual cache/index commit; do not claim success before workflow completion.

## Continuation
Verify live Android capture and 2D/WebGL overlay. If successful, retain P3 eastern exploration / weapon integration as the sole hourly priority; don't re-enable stopped 00/20/40 jobs. No generated images, no UI rearrangement, no save schema changes. P1/P2 remain deferred except critical P0.
