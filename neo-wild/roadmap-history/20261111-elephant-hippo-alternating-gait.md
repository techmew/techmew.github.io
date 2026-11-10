# Giant elephant and hippo walking gait

Main baseline: aa89df603a043c54e79debb5623bbe7d77c3791c
Code commit: ba127727d4b4ad9891fcf26824ef1cb13a30ed04
HTML cache commit: 975276b89f9fbf332d29975617e98bdcf9a6e291

Changed WebGL giantElephant and giantHippo leg poses to alternate diagonal pairs instead of bobbing all four legs in unison. Applies to wild and player-owned bosses through existing shared mesh. No saves, UI, IDs, or balancing changed.

Checks: complete webgl3d.js parsed using JavaScript Function constructor; static assertions for both poses and HTML rev; fetched committed files and confirmed blob SHAs 517d94d2a4a58e078f93e4079110f1e54a4ca566 and e46aad0478142a969c8fdefdde12db0ab1d2184b. No browser animation regression or Android playtest. GitHub Pages publication unverified.

Next: audit every boss ID across roster, game spawn and WebGL mesh; address any remaining fallback and add focused regression coverage. Prior crow aerial predation and carp gate are already present; do not redo. Preserve historical saves and ROADMAP recovery.
