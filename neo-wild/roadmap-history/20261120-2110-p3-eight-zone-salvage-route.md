# 2026-11-20 21:10 JST P3 — eight-site guarded salvage circuit and long-distance navigation

Base HEAD: c24f3afad34df62033448508ebe944bfd89f4912. Compared ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, 20261120-p3-siege-pack-zone-rewards.md, 20261120-p3-live-guardian-lock-fix.md and 20261120-1910-p3-aquatic-completion-route-recovery.md. Existing weapon owner/rarity/vault/guardian system reused, not rewritten.

## New playable behavior
- Visiting any of the eight eastern expedition posts with an eligible land animal now attempts a physical region-local unidentified scrap if no unclaimed cache is already there. Previously seven initial random drops could leave some of eight regions without a salvage encounter.
- Each site-local cache uses the exact existing terrain/collision/water/240-item limits, guarded siege state, live enemy fight, real Action pickup, species-specific item and durable vault transaction. The first east gate is placed at x>=8400.
- Once the site-specific cache is won, the durable vault item ID records that site's claim, so revisiting does not infinitely create new weapons. Pre-existing randomly generated caches and older SAVE_SCHEMA2 data remain valid. A failed terrain spawn is throttled for 15 world seconds.
- Eastern objective guidance now locates the nearest actual unclaimed cache even beyond the old 1150-world-unit radius. The existing physical waypoint/collision-tested groundGuide, living guardian, den equipment and boss stages are preserved. Carp stays on aquatic navigation and never receives a land cache.
- No changes to the title, UI placement, 3+3 slots, death/release ledger, food data, final boss, backup schema or other folders.

## Verification
- Actual V8 new Function parse for changed full game.js: PASS.
- New source-extracted V8 integration regression p3-eight-zone-salvage-regression.cjs: 46 checks PASS. Eight physical post arrivals, pending guarded caches, east-only coordinates, vault acquisition, no duplicate reward on revisit, far-away objective and vault reload. These use real production source functions with mocked DOM/world and localStorage.
- Existing other regression scripts not executed in this run. Real Node CLI, actual browser Canvas2D/WebGL pixels, Android touch, actual legacy SAVE_SCHEMA2 file restore, real NPC simulation and FPS NOT executed.
- Pages: check actual workflow result after pushing; never infer success from commit.

## P3 handoff
Implemented but not real-device verified: eight-site fallback guarded salvage, durable per-site claim, long-distance guidance, previous 35-species five-tier arsenal and 240 shared weapons, land 8/water 4 stations, siege rewards.
Verified only by V8 source mocks: this change's 46 checks.
Needs implementation/test: real browser/Android full route with actual NPC combat, multiple guardian saves, old JSON backup import, 2D/WebGL marker alignment, performance/FPS, terrain collision across 17 random starts. P3 NOT complete.
P1 held, P2 accepted 0/24 remaining; P4-P8 held. No new automation, no image generation.
