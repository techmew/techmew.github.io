# 2026-11-17 12:10 JST P3 aquatic start navigation

HEAD at run start: 7c7715c125a7bd17b3d1ad2446f6163e511a22d7. Consulted weapon arsenal handoff, east expedition handoff, ROADMAP-RECOVERY, east-expedition.js and index.html. Scope neo-wild only.

Implemented: fieldStatus now routes carp water-only random starts toward an unvisited ravine or headwater supply post, falling back to the nearer water stop after both are visited. Previously it selected any nearest undiscovered stop, including unreachable dry mountain or cave destinations. The displayed distance now matches the selected aquatic target. Existing land animal navigation and 8-stage expedition rewards are unchanged.

Commits: east-expedition.js b70c80ea9a0a2ec20ccf5496930433eb035923e3; index cache d95d56139ac828c04b82a80b7c4ab1a78d1524c7. No changes to title, roster 3+3, permanent death/release IDs, food, SAVE_SCHEMA2 or weapon vault.

Verification: source precondition checks and successful SHA-guarded GitHub writes only. Actual JS parser, DOM/Canvas regression, browser/WebGL, Android, old-save load, FPS not executed. Container curl DNS failure prevented local Node syntax test. This is a partial P3 improvement, not the required integrated weapon-to-boss-to-restore gate. P2 0 accepted batches / 24 remaining; P3 in progress. Next: complete integrated east NPC encounter -> guarded scrap -> species equipment -> boss damage -> save/restore test, plus aquatic water-corridor reachability. No image generation.
