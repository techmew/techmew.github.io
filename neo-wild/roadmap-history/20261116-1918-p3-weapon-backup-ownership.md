# 2026-11-16 19:18 JST — P3 weapon ownership/backup integration gate

## Source state and no duplicate implementation
Before changes: HEAD de5c83d61d150cd62e61f0acb4503eebb627ae55. Read ROADMAP-RECOVERY.md, 20261115-2230-p3-weapon-scrap-arsenal.md, 20261116-1645-p3-eight-station-salvage.md, 20261116-1510-p3-salvage-contested-route.md and 20261116-p3-unique-weapon-transfer.md. Verified original eight-region caches, 35-species weapon grades, eastern enemy buffs, 240-item all-den vault, salvage pursuit, weapon attack multipliers and backup merge; these were not reimplemented.

## Discovered actual P3 ownership bug
The JSON restore merged two valid equipment maps with `{...incoming.equipped,...current.equipped}`, allowing the same physical weapon ID to be bound to two different individuals after importing an older save. The vault validator accepted duplicate bindings. This breaks the existing unique-item transfer promise and can give two active animals the same weapon after Continue.

## Actual changes
- `wild-arsenal.js`: validator now rejects multiple equipped references to one physical item, and rejects species-level bindings to weapons of another species.
- `save-backup.js`: import merge resolves binding conflicts in order: current device first, then imported save; each item can be bound only once, and incompatible species-level references are ignored. The original inventory union (never silently discard items), 240 limit, and all death/release/boss safeguards remain unchanged.
- `weapon-arsenal-regression.js`: new executable tests cover conflicting same-item bindings, current owner precedence, duplicate binding rejection, cross-species rejection, durable vault reload (title/Continue-style), JSON restore merge, and real boss damage multiplier on restored character. Existing source-extracted pickup, NPC alert, 8-stop terrain-safe placement, 20k rarity seeds, write failure, species transfer and WebGL/Canvas hooks remain in test.
- `index.html`: refresh only the actual updated arsenal/backup module SHA revisions, no title/menu or UI layout changes.

## Commits and test
- Arsenal `358f09d64f0abd3498e3d999d3bbdc32636f6413`, blob `a26bdae0a37b26bcab6cbf9a29f8268832dfdd6a`.
- Backup `1922c599bef34d89a53b6448be6926b403b65a2c`, blob `51e57500c1ceed463eb26cd820fd2615c990808d`.
- Regression `f9a0305916321551743cb7d86d8c393a29d10097`, blob `99ee5a74d41d4635ac849fd0c20b24792f902804`.
- Index `0bc74683f1a9f9a5a11303bf03893c4b0f447218`.
- V8 `new Function` parse: PASS on edited files.
- Re-fetched main source regression: PASS **20,131 assertions** in V8 CommonJS shim. This is not Node CLI, real DOM/Canvas pixels, Android, WebGL GPU or full actual old SAVE_SCHEMA2 load. Do not claim those as tested.
- Pages workflow check after index update is required. Earlier index commit may be queued or waiting; never claim published until successful deployment.

## Remaining work (priority P3)
IMPLEMENTED BUT NOT DEVICE-VERIFIED: east random spawn -> dangerous NPC -> salvage -> another-species vault -> individual equip -> boss damage -> title/Continue -> actual JSON backup restoration. This run hardened the critical cross-save gear-ownership step and added focused executable regression, but does not claim full browser E2E.
TO IMPLEMENT: realistic DOM/Canvas continuous gameplay harness, 8-stop weapon distribution under real NPC/terrain conditions, cave-route combat balance and real Save/Continue replay. Note existing saves created by the old buggy importer may already contain duplicate bindings; repair/migration for those should preserve inventory and never discard equipment.
VERIFIED VIA V8: duplicate import conflict resolution, vault uniqueness, backup item retention, 8-stop placement checks, combat multiplier.
P1 live unverified, P2 0 accepted batches/24 remain, P3 in progress, P4–P8 deferred. No 00/20/40 schedule or image generation. Preserve 3+3, permanent ID ledgers, food inventory, SAVE_SCHEMA2 and year-100 boss.
