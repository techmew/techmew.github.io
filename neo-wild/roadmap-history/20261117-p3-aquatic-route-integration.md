# 2026-11-17 P3 east aquatic navigation and integrated regression

Scope: main/neo-wild only. Previous 20261115-2230 arsenal and eastern expedition histories read; existing 35-species arsenal, 240-cap vault, eastern 8 stops, SAVE_SCHEMA2 left unchanged.

## Player-visible improvement
- Carp water-only random starts now route toward the same unvisited ravine/headwater supply sites as the field HUD. The old navigation arrow could still target dry snow/cave posts even after the HUD was corrected.
- Aquatic navigation no longer directs carp through dry mountain walkway vertices. Land animals retain the original 18-waypoint corridor and existing guidance.
- No changes to title/menu, 3+3 roster, permanent individual IDs, food/meat, 100-year boss or save format.

## Commits
- aquatic navigation: 375d7c2bfd033502e2ae3133975578eb1ff0b6f8
- integration regression script: 4cea9fb318203b6735e6c60c5e92898a3b20b44b
- index module cache: 3fe00d0f6802f35a768755225d58c0370e93ebb2

## Executed checks
- V8 new Function parser for east-expedition.js PASS.
- V8 real module mock for eastern stops, aquatic guidance, 240 pickups, capacity, individual equip, boss multiplier and localStorage reload: 273 assertions PASS.
- Committed Node regression script added but Node CLI execution NOT DONE.
- Browser 2D/WebGL frames, Android, old full SAVE_SCHEMA2, FPS NOT TESTED.
- Pages run status must be checked separately; do not claim success from source commit.

## Remaining P3 major gate
Full right-map random spawn -> guarded NPC battle -> scrap pickup -> other-species vault -> individual equipment -> actual boss HP -> title Continue and JSON restore in one game loop. Include 8-region loot pressure, 2D/WebGL visual alignment, land/water terrain collision. P3 still incomplete. P2 accepted 0 batches / 24 species remaining; P1 and P4-P8 unchanged.
