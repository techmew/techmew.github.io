# PHASE A — rejected ordinary switch outgoing vitals rollback (2026-11-11 15 JST)
Baseline main HEAD 8aa69d6de7644fd74dcd9a5145c67f3da0a5a821; inspected current game.js, boss-roster.js, squad-core.js, index.html blobs, latest commits, roadmap-history/20261111-1410-squad-autosave-rollback.md and ROADMAP-RECOVERY.md.
Problem: ordinary leader switch calls persistSquadVitals() before world autosave; when world save rejects, the old outgoing HP ratio, level and XP may have been overwritten in the durable squad roster even if the actor and leader selection roll back.
Change: snapshot squad roster vitals at event entry, restore only outgoing member hpRatio, level and xp on failed switch, retaining current leader and permanent death/release ledger. Warn if rollback write fails. No UI, slots, schema or time changes.
Game commit bbf420a88617822ffb2544095398c4bd4732b941; blob 120f8486ac623531417d1491419e339a0e3321e5.
HTML commit 19d6ab82ddb3a6e97e4609587fe1a90b78a193fd; game.js?rev=120f8486ac62.
Validation: full JavaScript parse passed; isolated mocks passed restoration of HP/level/XP, preservation of leader/tombstones, rejected storage write, dead member protection, boss actor bypass. GitHub blobs and index rev re-fetched. Browser/Android E2E not performed; cross-key transactionality remains a risk.
Next: audit boss-to-squad switch for durable outgoing vitals rollback and storage partial-write cases, then validate Android actual switch and reload.
