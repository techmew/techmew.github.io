# 2026-11-19 10:10 JST P3 aquatic multi-goal routing handoff
Scope neo-wild/ only. Read weapon arsenal 20261115-2230 and eastern expedition 20261115 histories and ROADMAP-RECOVERY. No duplicate arsenal work.
Implemented: aquaticStep now searches all passable wet approach points within 115 of landmark rather than only the nearest point, which could be on the other side of a dry bank. Preserves existing movement collision predicate and fallback when no path.
Implementation commit 14ffff1ecf7eb411d0e80dce7ee44fd426a79fbd. index cache commit 1400855900e99850d81e8e33c41ae9a0ae01c30f.
Verified: actual V8 new Function syntax PASS, module evaluated with stub WildMountain, one synthetic aquatic routing case returned reachable. This does NOT validate production mountain/water connectivity, DOM/Canvas, WebGL, old saves, Android, FPS or Pages workflow.
P3 IN PROGRESS, not a completed major gate. P2 accepted 0 batches, 24 remain.
Next: integrated live random east start -> NPC -> scrap -> vault equip different species -> boss HP -> save/title/restart/JSON restore, plus connected western water-to-headwater aquatic route. Protect 3+3 IDs, SAVE_SCHEMA2, food, final boss and title UI.
