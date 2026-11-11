# PHASE A — Den eating autosave rollback (2026-11-12 JST)

Baseline main bb10077007278f377635953bad6f1170d4324410. Read latest commits, ROADMAP-RECOVERY.md, 20261112-0018-meat-withdrawal-rollback.md, 20261112-0006-companion-meat-save.md. Initial game.js blob 8a3ec3c4334f0e79e0414329d77a929f4b4ca19f; index.html blob 87754cd2d3361caa3d4c56aa521e5fe6d854fb2f.

Fixed eatFromDen for meat, berries and legacy food: after shared pantry write, award satiety, HP, wound relief and meal count only if world autosave succeeds. On autosave failure restore player vitals, meal count, food points and meat lots, then persist restored pantry; notify explicitly if rollback persistence fails. Defer checkMission until after successful world autosave to avoid granting tutorial progression for a rejected meal. No schema, UI layout, ownership, irreversible IDs or other files changed.

Game commit 827aa521218640d058f9a2ec253c1deff63b033f, blob aaab322a66b1aa672a4a25a11f7dce3dae3a720a.
HTML cache revision commit c56fc7361f140b4b160c19de10224a7e923e0fb5; index.html references game.js?rev=aaab322a66b1.
Full game.js parsed. Extracted live eatFromDen function: 39 mock assertions across 3 foods x 4 paths (success, pantry failure, autosave failure, rollback failure), including healing, no phantom meal credit, no failed mission progression and JSON backup warning. Fetched both updated blobs and verified revision. No real browser or Android test.

Limitations: cross-key localStorage transactions cannot be made truly atomic; if rollback itself cannot persist, warn and require JSON backup. checkMission after committed autosave may require next periodic autosave to persist progression. Next: durable pantry transaction journal / interrupted-write recovery and actual Android den consumption tests.
