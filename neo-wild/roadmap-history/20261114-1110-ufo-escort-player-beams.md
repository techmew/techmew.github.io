# 2026-11-14 11:10 JST — UFO escorts actively hunt and capture exposed players

Starting HEAD: 44f7fceab3d41e8685483864fee46f7f96f75319; original UFO blob 0f0c8cf595cba0dcf083ff7066762174f56513f2; title UI restoration retained (CSS and index).
Gameplay: Each UFO escort independently pursues an exposed, alive player if nearer than wildlife, with its own beam timer, world-position LOS/cover checks, visible tractor cone, and actual abduction originating from that escort's position. Hiding and hard cover break acquisition and drain the beam. Existing mother UFO, wildlife abductions, old wingmen save migration, cooldown, actor ID protection, and permanent-death processing preserved. An existing dead-player mother scan defect was found by a runtime mock and fixed.
Game commits: 7dd8e846af20849ad3b531b13e772f5e9efd865c and 8719e04599866635109f75e4a887786c376e5f1b. Final UFO blob 591f1ba1757524cc023e18ee249140823078144c.
HTML cache commit: e0f178e4c82948270fb494b1bf2370cdcc950bac. HTML blob 5344e0d574ae68b85634822441398f7b689e2468. Only UFO rev changed; title UI CSS remains.
Validation: new Function JavaScript parse passed; isolated runtime mocks confirmed exposed player capture, hidden protection, LOS wall protection, already-dead protection, individual ID unchanged. No real browser or Android testing performed.
Pending: assess long-session frame-time under high wildlife count and simultaneous escort beams; verify 2D/WebGL visible lift positioning and old saves in real browser; do not alter title menu UI.
Next specific item: frame-budgeted NPC escort acquisition with stable lock selection under high animal counts, and browser performance regression.
