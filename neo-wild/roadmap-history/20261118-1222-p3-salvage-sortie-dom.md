# 2026-11-18 JST — P3 eastern salvage sortie: hostile target -> claim -> den equipment -> boss

## Source and scope
Initial main HEAD: 3989c683f91b5a1530fe432ed3a64ac1a8adc2e1. Read ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, 20261115-p3-eastern-expedition.md and latest four P3 handoffs including 20261117-p3-guardian-defeat-persistence.md. Inspected actual game.js, east-expedition.js, wild-arsenal.js, index.html, WebGL and existing regressions. Main branch neo-wild/ only. No changes to titles, menu placements, old 00/20/40 schedules, existing minute-10 task, generated images, roster ownership or food pantry.

## Larger integrated feature shipped
- A fresh player on the east side receives an actionable sortie objective. For nearby world caches, the goal changes through pending guard -> moving living guardian -> actual defeated-guardian pickup -> matching species' den inventory -> real living boss, instead of labeling an actively guarded cache as freely pickable. It reads existing guardState, salvageCacheId, independent durable weapon vault and per-individual equipment, with no duplicate mission ledger.
- The actual HUD/navigation calls eastSalvageObjective in getObjective. Same world XY is fed through existing route/A* guidance. The current Action button label tells players to summon or defeat the guard before pickup. Long-press and other existing controls remain unchanged.
- Carp no longer follows the generic dry-land scrap objective through the main HUD. The non-weapon route uses the already-existing aquatic-aware eastern navigation. This is NOT a verified continuous swimming route.
- The existing Canvas2D overlay draws a live assigned guardian label at its actual NPC coordinates, not at an arbitrary enemy or a screen-fixed fake position. WebGL renders a ground-height ring on exactly the associated living NPC hitbox with the source game's mountain elevation; cached scrap 2D/WebGL warning rings remain consistent.
- Individual species cannot equip other-species weapons. When matching unequipped equipment is in the all-den vault, the sortie guides the player to the closest existing den; when equipped, an existing nearby strongBoss becomes the combat target. The gear/damage/loot persistence mechanism is reused, not reimplemented.

## Exact GitHub commits in this run
- game.js 67e3024bbcbef2165aeca6ac1832005d6b8905ce; blob 535fe79d9cb71e6dc4782c0667006317e03621ab
- webgl3d.js 731eed07b23ff4e69cf7d401b2bc28ad4a99c067; blob ef1f2d65cfc7f411994cc2e0cea049dae5e972a9
- integration DOM/Canvas test 131347bdfcfe6a7ecaf75b52ba0048d178207e6f
- fix obsolete objective assertion in original weapon regression 435b2fb3bc7259aaf34e6990f8abbd93344890f4
- cache-revised index.html 8bf43334d10725a572846f7c74461b1bbf688d87; blob b3d6895c181304572c21d65f022a8ca26eab02bf

## Validation performed (state the boundary exactly)
- V8 new Function full JavaScript parser: game.js and webgl3d.js PASS.
- Source-loaded V8 CommonJS shims run against current fetched main contents: random-start 8,411; east-corridor 263; east-expedition 76; weapon arsenal 20,172; existing P3 integration 289; new DOM/Canvas sortie integration 44 => 29,255 assertions PASS. The new script uses production-extracted tick, action, guardian kill credit, vault, den DOM button listener, boss HP damage, title-style module reload and JSON weapon merge, with simulated DOM/Canvas and save storage. These are not six separate physical browser runs.
- No actual full-page browser JS execution, actual WebGL GPU frames, Android gamepad/touch, measured FPS or full old SAVE_SCHEMA2/JSON file picker restore. Do not describe the source-backed harness as complete game end-to-end.
- Pages latest workflow status is to be re-queried after this handoff, including the precise HEAD run.

## Remaining and next large P3 gate
- TO IMPLEMENT/TEST: actual browser/Android play loop random east start -> navigation -> fight -> cache -> alternate character -> individual equip -> boss HP -> title Continue -> file-based backup import, including old save profiles. Inspect render projection and frame times in actual Canvas2D/WebGL. Confirm true water-connected carp route and balance of eight terrain zones.
- IMPLEMENTED BUT DEVICE-UNVERIFIED: combined guided sortie, keeper NPC state, Canvas/WebGL guardian markers, shared 240-vault, SAVE_SCHEMA2 optional guarded loot and JSON merge.
- VERIFIED BY V8 SHIMS ONLY: 29,255 source-backed assertions described above.
- P1 retained/real-device unverified; P2 accepted full species batches 0, 24 outstanding; P3 priority in progress; P4-P8 no new claims. P0 fatal save/boot only interruption. Do not touch previous WILD RECLAIM data, 3+3 roster, death/release unique IDs, year-100 final boss or meat records.
