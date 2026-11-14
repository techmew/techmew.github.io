# 2026-11-14 19:10 JST — wetland counterstrike and pursuit

Started from main 67921fe536479f328785d337f696de69aacc7374, game blob d67dafce832df9127dded570fbf9d610246252a3; read ROADMAP-RECOVERY and previous 18:10 handoff. Existing frog collision and wetland healing were already present, not reimplemented.

Implemented in live wild predator hunting path: when a living wild frog (frog/giantTreeFrog/pacmanFrog) is bitten while in water depth >.04, it may kick back with species-based damage, stun and real collision displacement, cooldown, and visible ripple. Rain-water otters pursue prey faster in actual AI velocity, while dry-land otters retain previous speed. All these are in existing game loop; no new save schema, no UI modifications.

Game commit 7ab1c6b5f13cf38fe860e3790f5094f47d8242ff; blob c7cf4ca3676a0df902bd34ebdcb642e2443dd28c. HTML cache commit 28bad48f4c2d78dcf30c3ea81f8e798b3ee7dd41; blob 150bed20660c77bcdd9f6a0b8778f133a689ae69. Static checks: unique edit anchors, 7 source assertions, game script rev points to new blob, top UI stylesheet preserved. Brace counts 2858/2858; parenthesis counts 14189/14189. These character counts are not a JavaScript syntax check. No runtime mock, browser, Android, or FPS verification performed. Pages: [{"sha":"28bad48f","status":"queued","conclusion":null},{"sha":"7ab1c6b5","status":"completed","conclusion":"cancelled"}].

Next: test actual player frog underwater attacks and NPC retaliation in browser; implement playable underwater dodge with input/cooldown and 2D/WebGL animation, without changing title UI or saves.
