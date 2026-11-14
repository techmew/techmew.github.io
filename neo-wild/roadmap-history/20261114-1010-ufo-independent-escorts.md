# UFO escort pursuit / 2026-11-14

- Game commit: 6e4fa7a1ed2b8b00add75d8c48c932601ba54050
- Cache commit: c52405d54960fda6b0d078d7b0cdd96015757283
- UFO escorts now maintain independent world x/y positions, pursue eligible wild prey within 720 world units, and return to mother-ship formation when no prey is nearby. Their existing cover-aware NPC beam checks, 2D rendering and cooperative tractorStrength use those physical positions. Existing saves with dx/dy only migrate lazily; no save schema change.
- Read-back verified ufo-events.js blob 0f0c8cf595cba0dcf083ff7066762174f56513f2 and index.html rev 0f0c8cf595cb. GitHub Pages deployment was in_progress when checked.
- Tests: source-level linkage checks passed (escort movement, scan, draw, cache). JS parser, gameplay mock, real browser, Android, and FPS were NOT verified; container DNS prevented fetching the committed JS for node --check. Do not claim these passed.
- Priority next: run actual JS syntax and deterministic UFO tests for multi-escort hunting, cover escape, old saves, death ID safety and FPS, then check Pages deployment. Complete climate-disaster frequency regression and rainy aquatic gameplay before moving to other animals.
