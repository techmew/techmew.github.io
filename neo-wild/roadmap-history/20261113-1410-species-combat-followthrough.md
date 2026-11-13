# PHASE A — species-specific 3D attack recovery (2026-11-13 14:10 JST)
Baseline main: f47a99afd6dd97b6bcb0a3251b2f9a263ee9087f. Retrieved current HEAD, recent commits, roadmap-history directory, ROADMAP-RECOVERY.md, game.js and webgl3d.js blob SHA, index.html cache revision. Preserved prior 3D impact flare/recoil and previous animal animations.

Player-facing change: The actual 3D animal combat limb pose now follows through after an attack instead of snapping directly to neutral. Predators sweep paws farther back, hoofed animals perform shorter, lifted retracts, and heavy animals use smaller weighted follow-through. Affects existing combo step 1/2/4/5 animations and runs in the normal 3D animal render loop. No new UI, save format, collision or attack damage changes. No images generated.

Implementation: 2b1024296b6a5a3e6f5601612f383d2755a96cd6, webgl3d.js blob 43cb91dcd6856e11be8637b3af1bd8356f8dbc95. Cache publish: 88f02243d9e5c0fc04d69e01c07761022fd4effa, index.html blob f4b96e876f000b301bb7cebd8f271bfbeebe8bcf. Re-fetched both files after commits and confirmed new cache rev.

Tests: 36 JavaScript isolated regression assertions for six species, correct left/right/rear/double limb selection, attack extension and recovery, idle return, finite coordinates, and species contrast. Combat function parsed and executed using Function. Browser-level WebGL rendering, Android performance, full JavaScript file syntax, and end-to-end combat were NOT verified.

Outstanding: interactive visual evaluation and tuning of attack recovery against actual 3D motion; 24 not-yet-gacha-ready animals, boss completion, terrain exploration and crash-safe pantry persistence, real Android controls/FPS. Next: validate and improve hit-stop/attack responsiveness in actual combat without compromising game-loop movement and permanent death. User action: none.
