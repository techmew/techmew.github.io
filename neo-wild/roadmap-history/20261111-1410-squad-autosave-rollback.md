# PHASE A — ordinary squad leader switch world-autosave rollback (2026-11-11 JST)
Baseline main HEAD: 4e748ecbc2614f4aca0b70b93274520dcd8c3a83. Read latest neo-wild commits, roadmap-history, ROADMAP-RECOVERY.md, game.js, squad-core.js, boss-roster.js and index.html blob SHA. Previous boss switch autosave rollback was already implemented; not repeated.
Problem: wild-squad-selected called applySquadLeader() which saves world without checking its return. If saveAuto failed, live control changed while previous world autosave remained active. Prior durable leader was only restored on habitat failure.
Change: use applySquadLeader(false), require saveAuto()===true, and restore previous live actor, choice, durable squad leader (or boss selection) on failed habitat placement, rejected snapshot, storage exception. No UI layout, 3+3 slots, tombstones, save schema or world time modified.
Code commit 8e690b3bbc7ed404e6463b3f0a19c723454e74f1; game blob 59d67b8854512f107385a81dcf9ce7563f6f4b9d.
Cache commit 877a6b32e443ad92b3711d3771a450015e2addea; index.html game.js?rev=59d67b885451.
Tests: full game.js JS parser PASS; isolated event regression mocks success, saveAuto false/quota, habitat failure, thrown exception PASS. Re-fetched game.js and index.html to verify blobs and cache rev. No real browser or Android test; cross-key storage atomicity remains unverified.
Next: validate and harden the persistence of outgoing squad vitals when a normal-to-normal switch fails; ensure rejected saves cannot silently mutate roster HP/level. Then Android browser E2E and published Pages verification.
User action: none required for code work.
