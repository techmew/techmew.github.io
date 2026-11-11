# PHASE A — Meat withdrawal autosave rollback (2026-11-12 JST)

Baseline HEAD 1ea21e04c4b4cd2d2ff215fc9599e876b938807d. Read recent commits, ROADMAP-RECOVERY.md, latest 20261112-0006 companion meat transaction handoff, game.js blob 8ac8e91a176257e4e9864543557a9dd61390bde0 and index.html blob 0cf48f863db7cf2e8597d178122dca7d45f7b514.

Fixed takeMeatFromDen: previously pantry subtraction and player carry were accepted even when saveAuto() failed. Now world autosave must succeed or the in-memory carry is cleared and the previous meat points/lots restored and re-saved to shared pantry. On rollback write failure, explicit JSON backup warning is shown. Does not change existing UI, ownership, save schema, irreversible IDs, or other game areas.

Game commit 4d6a390e5d9c2521b031624a29cbcdf340ca9c92; blob 8a3ec3c4334f0e79e0414329d77a929f4b4ca19f. HTML revision commit 6eb29e0c7b99e3cb0763f4f992924851b15235d5; index blob 87754cd2d3361caa3d4c56aa521e5fe6d854fb2f. Full game.js parsed by JS Function constructor. Four extracted-function mock cases passed: normal 60pt withdrawal, pantry failure, world autosave failure with rollback, rollback failure warning. Re-fetched game.js and index.html after commit, matched expected blob SHA and asset rev. Not browser or Android tested.

Limitations: If the pantry rollback write itself fails, durable pantry may already be reduced; backup warning remains. No atomic cross-key transaction is possible with current localStorage design. Next: harden eatFromDen when world autosave fails and reconcile shared pantry against restored world snapshot; consider durable transaction journal for interruption between writes.
