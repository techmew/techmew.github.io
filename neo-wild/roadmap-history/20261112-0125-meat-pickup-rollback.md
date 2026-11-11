# PHASE A — Prey pickup persistence and rollback (2026-11-12 JST)

Baseline: main 509f143047864557b27110d5f6f91297e111bdb8; game.js blob 68d1502195c4c141c2526339a527b0ebbb9ff664. Read recent 7 commits, ROADMAP-RECOVERY.md and 20261112-0110-meat-deposit-rollback.md. Existing deposit/withdrawal/meal guards preserved.

Gameplay change: Picking up a carcass portion or loose food now immediately attempts world autosave. If autosave fails, restore the original prey amount and carcass index, carried food, and stamina spent lifting the meat; report pickup cancellation. Previously pickup mutated the live carcass and player without immediate durable save, risking loss/duplication on reload. No UI layout, save schema, permanent-death IDs, or images changed.

Game commit 86ab0db34c985975a8e6831ed8b6b3670917b5ed; game blob 436ab547f9bf8891f4552cccb2dc302f9c254b82.
HTML rev commit 994eb8dd22a4d2a0e3bfa48e5c4ec0c0d8c1b06c; index rev game.js?rev=436ab547f9bf.
Validation: full game.js JavaScript Function parse passed; 16 branch-level mocked assertions across carcass/loose food and successful/failed autosave; game.js and index.html read back and SHA/rev checked. No browser or Android device validation.

Remaining: cross-key durable transaction journal and Continue recovery for pantry operations, interrupted write between pantry and world autosave, full real-game regression of meat pickup and dog theft. Next priority: durable transaction journal and safe interrupted-write recovery. No user action required.
