# PHASE A — late combo input buffering (2026-11-13 17:10 JST)

Gameplay: game.js commit 92a2518ddf4131b4c6312e0f3e2e595c18d76620. When an attack button is pressed in the last 180 ms of recovery and windup, queue the next valid combo strike; earlier button mashing is not stored. On release of cooldown, consume the buffer before calling attack() so exhaustion/interruption cannot cause repeated automatic attacks. Five-hit finisher, stamina costs, existing attack timing, title, menu, roster and save formats unchanged.

Publish: index.html commit 775b53d9b0d6a2b0e3fa6506036dc8a8ba6212ef, game.js rev=134c3f7a2f74.

Checks: JavaScript full-file parse PASS; 6 buffer threshold mock assertions PASS; 6 structural regression anchors PASS; current game.js blob 134c3f7a2f74f5cca5c398403e0c0f8cc8a51ca0 verified after write. Real browser, touch, gamepad, Android and long-session play NOT tested.

Unfinished: confirm actual button-to-hit latency and combo flow on touch and gamepad; full 35-species combat/animation QA; food/den loop and final boss end-to-end; old save compatibility; co-op.

Next: verify and improve tap-to-hit responsiveness in 2D/3D using the real attack timeline, preserving cooldown and stamina balance.
