# 2026-11-13 20 JST — restore pack encirclement runtime

- Gameplay: repaired a literal escaped newline in pack-tactics.js that commented out `membersNear`, causing `surrounded()` to throw and disabling pack combat; normal pack warning, hit, counterattack escape restored.
- Implementation: 8fe68ad5f0b819ff3d7a8602fd533460b40eccda; HTML cache: fc439e1ef58cdb4f2b6c32ea55fbbb94a2c69071.
- Checks: JS parsed via Function constructor; six mocked runtime assertions passed (opposite sides, single enemy, line of sight, warning, hit, stunned flanker escape). Re-fetched both files and checked new revision.
- Not verified: full game browser/Android play, Pages propagation, full save compatibility regression.
- Next: run real combat input-to-hit latency instrumentation and full gameplay regression; protect save slots and old save data.
