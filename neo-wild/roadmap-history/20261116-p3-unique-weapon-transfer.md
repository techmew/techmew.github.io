# 2026-11-16 P3 — Unique weapon transfer

Read the 22:30 weapon arsenal and 23:10 distribution handoffs, ROADMAP-RECOVERY.md, and the latest first-run notes.

## Changes
- Equipping an already-bound physical weapon to another matching-species individual now atomically clears its previous binding, without deleting or duplicating the vault item.
- New regression cases: transfer, previous owner unequipped, unique inventory count, reverse transfer.
- Implementation 3bf296f14b720896a25d3370b13f496f7c83edc6; regression 644253f84935ffa85086c6fa20618990c159fb0c; cache 9092d323d910f22972727e4f6c8d07b9e2a3b5a2.

## Remaining P3
Full east random start -> hostile NPC -> pickup -> alternate-species vault -> per-ID equip -> boss damage -> title/continue/JSON restore integration, eight-region distribution, 2D/WebGL alignment, terrain collisions. Real browser, Android, old SAVE_SCHEMA2 E2E, FPS and full DOM/Canvas integration unverified. P3 incomplete. P1/P2 on hold; P2 0 accepted batches, 24 species remain. No automation schedule changes.
