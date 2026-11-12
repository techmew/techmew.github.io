# PHASE A / failed pantry write rollback (2026-11-12 17:10 JST)

Implementation: 4af0a778c69201d84bc4845845db5ea37c350cd4
Publication revision: ed427439b8368add536a60bd132c0123db49cf26

Change: If a pantry save throws after writing an unverified new value, restore the exact previous raw bytes (or remove a newly created key). If the authoritative value differs from both the old and attempted values, freeze subsequent world/pantry saves rather than overwrite a possible concurrent change. Failed rollback also freezes writes. Existing menus, ownership, and schema remain unchanged.

Checks: Full game.js parsed with JavaScript Function constructor; four rollback branch scenarios checked logically (not a live localStorage fault-injection test); new game.js blob SHA d9e247a66270aaa91734e5e155b25bab34c651a3 re-fetched; index script revision updated. Real browser/Android and crash simulation not tested.

Pending: true cross-key world/pantry transaction journal and injected storage quota/interruption tests. Next: implement tested journal recovery while preserving dead/released animal IDs.
