# Owned boss 3D mesh routing

Code commit: ade245e71505b7c355b24408673292d3e43b2e9e
HTML rev commit: 82414b851357cd90f5971f6de48553d9c07f3ab3

Fixed: webgl3d.js previously invoked drawStrongAnimal3D only for NPCs (!player), causing player-owned bosses to fall through to generic quadruped rendering. Both owned and wild strong actors now enter the same distinct mesh renderer. UI, saves, IDs unchanged. HTML webgl3d rev updated to 9f977a4a5144.

Checks: full JavaScript syntax parsed with new Function before commit, SHA-guarded file update, code re-fetched and new blob verified. Static branch routing regression inspected. No WebGL render screenshot or Android playtest. Pages remote curl did not confirm publication.

Outstanding: alpha 3D specialized fallback needs visual comparison; other strong boss mesh/IDs and attacks require live validation; crow aerial predation requires playtest; carp gate and legacy saves require validation.

Next: test owned boss selection and rendering against all boss IDs, repair any generic fallback without modifying title/roster UI.
