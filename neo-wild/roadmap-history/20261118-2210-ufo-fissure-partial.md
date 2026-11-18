# 2026-11-18 22:10 JST — UFO exposure and lethal fissure (partial P3/P0 gameplay fix)

Implemented on main: UFO main beam now uses uninterrupted exposure, 1 craft 3s / 3 craft 2s / 5 craft 1s; escort beam accumulation no longer multiplied by tractorStrength. Fissure contact now sets hp=0, deathReason=fissure and calls beginDeath, with layered dark fissure rendering and lethal warning. Existing roster, SAVE_SCHEMA2, UI layout and weapon system untouched.

Commits: UFO 620ecd73a02f9aa9544d9413edcc666bb5bcc576; fissure df4b60c86e1a22c2bd131a14337c802089a52c74; cache 86f887d6725dc81ee8d128d4659d94e815d56d4b.

V8 new Function syntax checks PASS for two edited JS modules. No integrated DOM/Canvas tests, browser/WebGL pixels, Android, FPS or old save load performed. Pages run 44310656293 was queued when checked. IMPORTANT remaining: death-share cause framing must show actual UFO/other lethal objects, flood rendering and number-of-craft consistency need verification; current fissure blocked() collision may stop approach before fatal contact and requires integration regression. UFO escort capture thresholds need live gameplay validation. P3 east exploration+arsenal end-to-end still unfinished. Do not call this P3 complete.
