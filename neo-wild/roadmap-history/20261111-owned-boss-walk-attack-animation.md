# Owned boss 3D movement repair

Code commit: ea8331b8889827e2ccb471954a5b7d0e24843b61
HTML commit: 9ede8d44d7563597d18397838bfe96b880e82e0a

Owned bosses use `steps` rather than wild boss `step` for gait; this repair lets the strong-animal 3D leg mesh respond to player movement. Added attack-action-driven leg pose for owned bosses, preserving wild stride fallback. No title/menu/roster layout or save schema changes.

Checks: full webgl3d.js JS parse passed; static regression assertions for player stride, wild fallback, attack pose and HTML cache SHA passed. Code and HTML re-fetched after writes. No browser/Android visual playtest or confirmed Pages propagation.

Next: audit remaining boss ID to 3D mesh mapping and inspect each distinct silhouette; confirm movement and attack visuals on actual Android device. Keep carp disabled until aquatic stage completion; preserve historical saves. Crow aerial prey already implemented; avoid duplicate implementation.
