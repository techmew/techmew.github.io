# PHASE A — Failed squad leader switch rollback (2026-11-11 JST)

Baseline main HEAD: 5a22775f9c1c0eaa5d34ba41a985d87991cdda97. Reviewed ROADMAP-RECOVERY.md, latest roadmap-history, boss-roster.js, game.js and index.html. Previously completed boss-to-normal actor restoration remains intact.

Problem: switchSquadLeader and wild-squad-selected could durably select a different squad member before applySquadLeader checked terrain/habitat. On failed placement, the actor returned to its previous species but the stored leaderId pointed at the failed candidate. Next resume could silently select the wrong animal.

Fix: Capture prior durable leader ID; if habitat placement fails, restore the prior selection in both manual switch and selection-event paths. Preserve previous actor rollback and death-successor path. A failed rollback reports an explicit reload warning; no new save schema or UI changes.

Code commit: 987eb96e1e3083252f583e0b271e21055eb235e5
Code blob: e94a7f4855c8aba0e16b7ccef69e1626f7ca6f29
HTML cache commit: 81cf3acf11cf81b2f06d198581b88d778ddf963d
HTML revision: game.js?rev=e94a7f4855c8

Tests: entire game.js parses with new Function. Static regression checks verify old leader capture, both rollback call sites, old actor restoration and unchanged death branch. Post-write game.js blob and HTML revision re-read and checked. Actual browser/Android switch E2E not tested. Next: exercise boss-to-normal and normal-to-boss failed habitat switches in browser with durable activeId/leaderId assertions, then fix any failure; confirm shared den meat and death safety.
