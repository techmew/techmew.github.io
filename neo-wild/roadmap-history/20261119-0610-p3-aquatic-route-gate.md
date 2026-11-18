# P3 aquatic navigation continuation — 2026-11-19 06:10 JST

Read ROADMAP-RECOVERY and 20261115 eastern/arsenal histories before change. Main prior head 3451654879b658c717529509caf01aaf7f3ece95. Do not recreate existing east/arsenal features.

## Delivered
- Updated east-expedition.js aquatic A* to require reaching the actual water landmark before reporting waterReachable. Partial search no longer falsely presents a dry destination as navigable. Added 40-unit sampling and mid-edge collision checks to avoid crossing narrow dry banks; 3200 expansion cap.
- At a water landmark, immediate arrival counts as reachable (avoids selecting another distant destination).
- If no complete route, guidance stays at player instead of directing carp onto dry terrain. Candidate stops tested independently.
- index.html eastern module cache updated.
- Production JS V8 new Function parse PASS. Source-executed six assertions PASS: blocked, no false arrow, open water, already at ravine, isolated water, no movement across isolation.
- Commits: 3c54c9cc503e4650094cadf8aa4f1c3242d7591f, 6c346ea3b27d2e42ef4ef13823309ee2199706fd; cache 9517a2c9b663e0381a065e7e54a95b09514cbd69.

## Limitations / next gate
The two mountain water landmarks may be disconnected from western carp starts. The guidance now fails closed rather than falsely claiming accessibility. Need actual connected water network exploration, reachable local supplies for western aquatic starts, and integrated east weapon/boss/save tests. No full browser, WebGL pixels, Android, FPS, old save E2E performed this run. Existing title, UI, SAVE_SCHEMA2, permanent IDs, roster 3+3, meat pantry, final boss unchanged. P3 incomplete. P2 accepted 0/24. Do not resume P1/P2 polish or stopped automation slots.
