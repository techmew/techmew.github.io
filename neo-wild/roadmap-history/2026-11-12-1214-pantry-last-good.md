# PHASE A — Pantry last-good copy (2026-11-12 JST)

Baseline main b01ab9aa8606014299ea18cb1baf270533642ffc; game.js blob 463aee67f0f1e2d51ecd700717444da8839544dd. Reviewed ROADMAP-RECOVERY.md and prior damaged pantry handoff.

Change: before overwriting an existing valid shared pantry, validate the current durable value, write its exact bytes to an independent last-good key and read them back. On backup failure abort the pantry write, preserving the old primary. No auto-restore from the backup yet; corrupt primary remains blocked and should not be overwritten.

Game commit a31dfd95129d9f2d5e9eac381d3b1fa4d3f867ab; HTML rev commit cf41342a58d0f264d8b0195b1ecc505e6e834cef. Game blob c73dcca1f35c79c6f7dcebe73c6272aa7b8cf55f; HTML game rev unknown.

Static checks: backup key inserted, backup write ordered before primary write, validation guard present. No JavaScript parser, browser, simulated storage-failure test or Android verification performed. GitHub Pages deployment not confirmed.

Remaining: validate and recover interrupted two-key world/pantry transactions with failpoint tests. Next: add a verified read-only recovery preview from last-good pantry and failpoint tests without replacing corrupt primary automatically.
