# 2026-11-20 — P0 Android animal confirmation touch repair

Source HEAD: `582842f90a3198d0a5823c0c0cd915870089f4c5`. Screenshot shows Penguin C final confirmation, two gold adoption buttons not responding on Android. Root cause not yet proven on real phone; source depended only on a click event for commit, with top action using another element's click. A missing/blocked synthesized click leaves both controls inert even though the stage is ready.

## Changes
- Direct, guarded final confirmation shared by both gold buttons. The top action calls it directly instead of searching and dispatching a synthetic click.
- Android pointerup fallback after a short genuine touch on either gold button, with pointercancel and >18px scroll rejection. Subsequent native click ignored to avoid double adoption. Standard mouse/keyboard click preserved.
- Adoption is now a single guarded transaction: explicit progress text, authoritative core adoption (new squad or first/extra slot), verified storage read, then close; visible storage/ticket failure without silent reset.
- Bestiary or HUD rendering exceptions after a verified save cannot trap the finished confirmation modal.
- Existing title/UX layout, three normal + three boss slots, permanent death/release ledgers, SAVE_SCHEMA2, world backup, P3 weapons and food untouched.

## Tests
- V8 new Function full updated squad-gacha-ui.js, squad-core.js and regression parse: pass.
- Source-backed pointerup with missing synthesized click, native click suppression, explicit programmatic click and persistence path checks: regression test added. Real Android touch, device storage, canvas/GPU, FPS not run.
- Requires real device acceptance for original reported failure; not claimed as proven fixed on phone.

## Next
Verify both gold buttons on Android with exactly 1 saved Penguin, second/third free slot, top header, persistent leader and Continue. P3 prior work unchanged.
