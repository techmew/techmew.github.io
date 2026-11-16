# 2026-11-17 02:15 JST — P3 contested eastern cache combat gate

Scope: main/neo-wild only. Read weapon arsenal handoff and eastern expedition handoff; inspected current game.js, wild-arsenal.js, east-expedition.js and latest commits. No generated assets, menu edits or automation changes.

## Gameplay change
Before this patch, a player could take an already awakened eastern cache while the alerted guardian was still alive. The existing NPC attack happened, but combat was not required. Now pickWeaponScrap checks live hostile NPC HP, alert/search and distance within 300 world units of the cache. If any alerted territorial predator survives, pickup is refused, enemies re-target the player and an explicit combat instruction is displayed. Once cleared, the existing verified vault write, cross-species equipment, boss damage and SAVE_SCHEMA2 preservation paths run unchanged. Non-contested caches remain collectible.

## Commits
- game.js combat gate: de23c375f578ed2b7697388648a47ddf3a95e3fc (blob fd6b7528f624829a90e2a76ee9d62550d0305e29)
- index.html game.js revision: 1c78f4fe97ce2f45c3bee74f1eabd5349951c636

## Verification
- GitHub contents API accepted both commits.
- Actual JS syntax parser, integrated DOM/Canvas test, browser WebGL frames, Android, old-save E2E, measured FPS and Pages workflow status: NOT EXECUTED in this run.
- This is a partial P3 gameplay improvement, not completion of the full exploration-to-boss-to-backup gate.
- The combat check applies to awake caches; pre-awakening pickup still follows the pre-existing one-time guardian path. A full combat reward/escape/balance gate remains.

## Next
Implement and run one integrated test with east random start, guardian spawn, combat, guarded pickup refusal, defeat, vault persistence, other-species equip, boss HP change, continue and JSON restore. Verify eight biome distribution and 2D/WebGL alignment. P3 IN PROGRESS; P2 accepted 0 batches / 24 remaining. Preserve 3+3, permanent IDs, food, SAVE_SCHEMA2 and year-100 boss.
