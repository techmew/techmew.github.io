# P3 aquatic route handoff — 2026-11-19 09 JST

HEAD inspected before change: 762a117164c5bf2e26027a9f68d19bcfb25d8ada. Read weapon and eastern expedition histories, ROADMAP-RECOVERY, game.js and east-expedition.js. Existing weapon vault and 8 stops not reimplemented.

Implemented: water-only navigation now requires a wet start and a physical wet approach within 115 world units of the chosen ravine/headwater stop; dry destinations return unreachable instead of a false route. A* heuristic and arrival use the validated wet goal, preserving actual landmark coordinates, rewards, save and UI. Module commit a8a612a0b3bf5c6b060464b085f1470997556ed5; index rev commit 06231cd89548eed7f44f1fd096e28a1b67f250b7.

Executed: V8 new Function parse PASS, wet goal success, dry goal rejection, unreachable navigation rejection. No real browser, Android, WebGL pixel, FPS, complete west-east water connectivity or old SAVE_SCHEMA2 load test. This is a partial fix, NOT the integrated P3 gate. Need check reachable aquatic supply and exact water-bank collision, then integrate east NPC/loot/den/boss/backup full DOM Canvas path. P2 0 accepted batches, 24 species remain. P3 ongoing. No image generation; no changes outside neo-wild/.
