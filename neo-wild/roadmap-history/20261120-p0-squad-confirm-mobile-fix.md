# 2026-11-20 — P0 mobile gacha confirmation bug

Scope: main/neo-wild only; preserve title layout, save schema2, 3 normal + 3 boss slots, permanent dead/released IDs, and P3 code. Target regression is photographed Android screen showing first slot Penguin C at confirmation stage with top gold "この個体で決定" and lower gold "この個体を1枠目に採用".

## Root cause (verified in source)
The confirmation handler called core.newSquad directly with no try/catch. The newly enforced three-initial-draw policy can reject an empty roster whose initialGachaUsed is already 3 and gachaTickets is 0 (or throw on save failure). The uncaught exception made both buttons visually respond but leave the modal unchanged. A stale modal could also proceed through the drawing phase without rechecking the same durable allowance.

## Fixed behavior
- Header confirms through the actual bottom adoption action and shows the reason on an invalid state. Its look and location remain unchanged.
- Final adoption is guarded by try/catch, with a verified saved individual before closing. Any failure is visible, never claimed successful.
- nextSlot checks authoritative core initialGachaUsed (3 initial slots) plus previously earned release credits before drawing.
- With no remaining credits, the chooser shows an explicit "new world with 3 animal draws" option; when a previously-staged candidate is rejected, the same explicit reset option appears. No silent reset or resurrection of old individuals.
- The existing reset confirmation catches storage failure and only closes after verifying reset success.
- No new ticket is granted for a death, hunting, XP or exploration; releasing one animal adds one ticket. Original 3-owner restriction continues.

## Executed checks
- Real JavaScript parser (V8 new Function) PASS for squad-gacha-ui.js.
- New source-backed squad-confirm-regression.cjs: 8 DOM mock checks PASS. Gold header and bottom both reach durable roster adoption; exhausted-three entitlement returns visible message and opens explicit reset confirmation; storage write failure is visible; nextSlot checks credits.
- Previous full P3 regression and save tests not rerun in this patch; Android/real browser touch/UI/render NOT executed. Manual in-device confirmation needed.
- Updated index cache rev for squad-gacha-ui.js only; commit history and source tracked together.

## Next
Actual Android tap first draw, pendingStart refill second and third, death no additional credit, release one and refill one; no regression of pre-existing surviving save or P3. This bug is P0 and P3 priority otherwise unchanged.
