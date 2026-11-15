# 2026-11-15 22:30 JST — P3 east-only unidentified scrap, 35-species arsenal, durable weapon vault

User instruction: introduce weapons ONLY in eastern/right-hand map; stronger eastern foes; randomized unidentified junk; rare powerful equipment; items for ALL 35 character species, not necessarily current animal; shared vault; boss combat benefit. Previous three P3 handoffs and ROADMAP-RECOVERY.md consulted. P3 remains top priority except critical P0. No generated images or title/menu changes.

## Implemented, connected live gameplay
- Seven initial randomized unidentified scraps on east map (X>=8400), then attempts every 18 seconds (cap 18). Terrain, collision, water and spacing checks prevent impossible loot. Standard existing short Action picks it.
- Hidden pickup reveal: deterministic seed rolled at spawn, unknown owner and rarity until pickup. Identified loot goes straight into persistent all-den weapon vault (separate from meat). Each of 35 real playable gacha species has species-specific anatomical equipment name.
- Weighted rarity exactly: worn 62%, improved 27%, rare 9%, epic 1.8%, legendary 0.2%. Five levels affect regular attacks and stronger boss-only damage (+9%, +22%, +39%, +60%, +85% respectively).
- All actual den pantry screens now offer scrollable 240-capacity shared weapon storage, current-animal equip and unequip. Individual squad/boss ID binds loadout; mismatched animals cannot equip. Ownership and death/release ID registries stay unchanged, and unequipped gear remains safe in the vault.
- Live combat hooks in normal rush, special attacks and boar charge apply weapon multipliers, feeding existing boss poise break. On-the-right newly spawned hostile animals have HP/damage/speed progression by x-zone, up to +94% HP / +49% damage at the cave; prey and western city remain unchanged.
- The same X/Y/highland Z coordinates drive Canvas2D junk sprites, WebGL low-poly junk and wearable meshes, question-mark labels, minimap and short Action pickup. Neither model indicates weapon rarity before pickup.
- Loot claim writes and verifies one authoritative localStorage weapon vault record BEFORE removing the scrap. If this fails, scrap stays on ground. If later world autosave fails, already claimed items remain in the vault and old world snapshots filter those IDs on Continue (no reroll or duplicate). The existing SAVE_SCHEMA2 world snapshot receives optional weaponScraps/serial only, with defaults for prior saves.
- JSON backup exporter already includes all wild-reclaim-* keys. Importer now validates and merges existing/incoming weapon vaults to preserve newer local finds when importing an old file. It stops safely if merged capacity exceeds 240 rather than dropping user gear.

## Actual GitHub commits
- module wild-arsenal.js 326707163ae313e4ac5524ca3b1328a6ccd34937
- game.js integrated pickup/attack/enemy 3d8b537467b12970fadcaef393c0e9710e751d93
- WebGL 9a78f628201efaed46d767b9d69b9afbebd77019
- den vault HTML 846db2fc39c3331031c204170ad7a502fe1e653c
- responsive pantry style 1946c814b9c88d9425e7b7d91d30b1a89777a86f
- non-destructive JSON backup merge 1ffdf0067989a668efefebc1788f3f86c89cbf11
- final 2D markers, inventory unequip and map c65beb06ff22dc2bc51405a3ee24e6f93a8334c0
- Node-compatible regression 432d55e4662492de13cd3540d8d8b7779f2adb73
- latest JS/CSS cache index 2f311ca2c1954fcee89ba5e72fd53de8848f2297

## Verified / not verified
- Actual V8 new Function parsing of changed game, world, graphics, backup and arsenal files: PASS.
- V8 source-extracted loot/combat/restore/backup mock: 40,087 assertions PASS over 40,000 deterministic seeds.
- Committed standalone Node-compatible regression executed with a CommonJS V8 shim: 20,075 assertions PASS, including 20,000 quality/animal rolls and real production Action and vault failed-write cases.
- GitHub Pages for index 2f311ca2: completed SUCCESS, workflow 43719351404.
- Actual Node CLI, real browser/2D+WebGL pixels, Android FPS, complete old SAVE_SCHEMA2/backup restore and real-device playthrough: NOT EXECUTED. P3 weapons are IMPLEMENTED, LIVE UNVERIFIED, not a completed end-to-end P3 epic.

## Next P3 major gate
Keep P3 first. Complete an actual east-map exploration-to-weapon-to-den-to-boss-fight save+restore run with 2D/WebGL and 2 different player species, check real spawn pressure and gamepad/Android UI, plus terrain/marker/FX alignments. If real browser is unavailable, add deeper integrated executable DOM/Canvas mocks and proceed to remaining P3 environments without repeating small rarity/text adjustments. Protect SAVE_SCHEMA2, death and release, gacha roster 3 normal + 3 boss and 100-year final boss. P1 unverified; P2 0 accepted batches / 24 remain; P3 IN PROGRESS; P4-P8 otherwise unchanged.
