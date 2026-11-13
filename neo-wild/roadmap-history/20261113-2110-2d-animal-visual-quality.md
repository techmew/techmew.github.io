# PHASE A 2026-11-13 21:10 JST — 2D/3D species parity

Starting main HEAD 0d4833553d62f91ae81139cb5de1ad0f6769bf8f. Retrieved latest main, neo-wild/fauna.js blob 9b49b732e656cee129c8ce58d3f2ccd92b99b531, index.html, recent commits, previous 2040 handoff and ROADMAP-RECOVERY.md. Original ROADMAP preserved.

Actual player-facing work: added three dedicated 2D wildlife models for otter, penguin and badger. Otter has a narrow swimming profile, paddling feet, flexible tail and attack mouth; penguin has flippers, belly, beak, sliding pose and attack extension; badger has squat shoulders, face stripes, digging claws and a forward combat lunge. The existing live WildFauna.draw2D renderer dispatches these branches using real swimVisual/bellySlide/swing/attackAction/flipperStrike/step/pace fields. Badger removed from generic tiger/dog drawing branch; other animals unchanged. This complements 3D species introduced in commit 9a1f9f0. No menu/UI/save schema/permadeath changes and no images generated.

Gameplay commit 1be727331e5ebb9c4739ca0f32a495c37cd21d2d, fauna.js blob 048145a403d78c98ece518140c0913d295b33e11. HTML cache rev 048145a403d7 published in commit aa0c0647ec602ece16ccf26ebf5fea0f6aeeb3e3; index.html re-fetched and rev confirmed.

Tests: full fauna.js JS syntax compiled; 16 executed 2D mock assertions including species dispatch, finite geometry, at least 8 anatomical shapes each, visible idle-vs-active pose difference, and unknown-species fallback. First draft failed strict penguin anatomy threshold and was not committed; corrected model passed. No real browser, WebGL, Android or performance testing. GitHub Pages deployment should be checked separately.

Important incomplete work: only 3 species' 2D/3D models improved, not full 35-species quality; many species need independent attacks/behavior, biome continuity and exploration rewards, boss and pantry gameplay, and real-device QA. Next priority: substantive biome exploration reward and habitat variety tied to world loop (not another micro-fix). Do not overwrite ROADMAP or reset saves.
