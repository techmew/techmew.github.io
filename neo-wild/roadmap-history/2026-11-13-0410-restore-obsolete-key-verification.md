# PHASE A — JSON restore obsolete-key verification (2026-11-13 04:10 JST)

Implementation: `9c4d6b1c21ef20e18d92def1e08088bc29680e64`
Publication HTML: `6bf553e1fbebbcf06e10f2cbaf84d23f8f02acf4`

Change: after JSON restore writes and deletes, verify the complete game-key snapshot matches the intended merged save, including absence of obsolete keys. If an old roster/key survives deletion or a new unexpected key appears, report failure and attempt verified rollback. No menu/layout/schema changes. Existing permanent death/release safeguards retained.

Checks: full save-backup.js syntax parsed with Function; five isolated mock cases (normal, stale old key, missing, wrong value, extra key) passed; latest blob SHA re-fetched. Real browser, Android, forced browser crash and storage quota failure not tested.

Pending: true crash-safe cross-key world/pantry journal and fault-injection tests. Next priority: world/pantry coordinated recovery without resurrecting dead/released IDs.
