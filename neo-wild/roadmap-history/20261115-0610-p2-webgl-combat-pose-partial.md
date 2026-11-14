# 2026-11-15 06:10 JST — P2 specialist WebGL combat pose (PARTIAL)

Starting HEAD 4c34f75ee80bf6fc85c037e3d2e9ace1acd3075c. ROADMAP-RECOVERY.md and latest P2 history checked. Preserve title/menu/party/save and existing P1 implementation.

Implementation ed2dedee72711aa6d931ffc3ceb10212867f7b01: webgl3d.js specialist combatLimbPose now consumes NPC windup/swing as well as player attackAction for manul and Tibetan fox, with species-sensitive forward strike extension. Penguin playable WebGL flippers also react to wild swing/windup and player attackAction. Shoebill already uses independent swing/special head-and-bill pose, unchanged. This is geometry only: collision and damage remain governed by existing combat pipeline. Cache commit 2185a7cd15f0be7cbbcf28119597651004523542 updates WebGL rev to 7765179bf574.

Validation: V8 new Function parse of modified full webgl3d.js PASS before write. Runtime WebGL, NPC/player collision simulation, browser, old saves, Android and FPS NOT RUN. P2 four-animal batch remains INCOMPLETE: 0 accepted, 24 outstanding. Current batch manul/tibetanFox/shoebill/penguin: 2D present; WebGL geometry and partial attack motion present, end-to-end player/NPC verification missing. Do not report full completion.

Next: complete the SAME four-animal batch with terrain-aware NPC AI and real player combat/gacha/bestiary regression paths, then test and accept only if all criteria pass. P1 source present, browser unverified; P3-P8 not accepted.
