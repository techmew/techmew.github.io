# PHASE A / world autosave rollback guard

Implementation: a974641ea2e4b075bd344adfa238fa5cb6dc1a33
Publication: fa5f77b024acb4afc4006e06e0f4c2f4365ac975
game.js blob: 6d0bbd8caf5a88e3b1307299dbe5c999e5c799c3

Changed: Save the previous world autosave's exact bytes before writing. Require readback confirmation. If a write is unverified, roll back only when the current key still equals this attempt's encoded payload. If another tab changed the key or rollback fails, freeze further world/pantry writes rather than overwrite another session. Do not alter roster, SAVE_SCHEMA, title/menu layout or legacy save migration.

Verification: Full game.js compiled using Function constructor. Five focused localStorage mock cases (success, quota failure, readback failure, concurrent overwrite, rollback-failure fixture) exercised. The last fixture did not actually trigger a rollback; real interrupted-write and Android/browser testing remain outstanding. HTML cache revision updated.

Pending: interrupted-write transaction journal for world and shared pantry together, crash simulation, quota eviction, cross-tab race, Android gameplay, and Pages delivery. Next: add cross-key transaction journal and validated recovery without resurrecting dead or released IDs.
