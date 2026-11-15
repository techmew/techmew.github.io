# 2026-11-16 — Remove intrusive tutorial sequence; concise one-time purpose on actual gameplay start

User feedback: tutorial stages are not valuable, and the player needs a short explanation of WILD RECLAIM's overall goal.

## Behavior changed
- On the first genuine NEW GAME after this change (or other new-world launch), the world spawns and squad/boss actor settles normally; on the first active rendered gameplay frame, the **existing compact tutorial dialog** gives a 2-paragraph overview: animal survival/hunting/raising and YEAR100 end boss; dangerous eastern map with unidentified scrap/weapon vault; food storage and short Action/long Action; permanent character death.
- The CTA is **「ゲームを始める」**. The world is temporarily paused while reading and resumes on close. New browser key wild-reclaim-purpose-briefing-v1 saves the one-time completion only when the player closes it; reload before close can show it again. The existing HUD guide button can always reopen the briefing.
- NEW GAME begins in free survival (mission=7) with all world systems active; the 4 forced lesson popup chain no longer blocks eating/hiding/hunting/den gameplay, and the player is not forced into a checklist. Preserve the original old-lesson debugger behavior for explicitly initiated developer test sessions.
- Existing SAVE_SCHEMA2 checkpoint/Continue uses original restoreSnapshot mission state, and its old automatic tutorial stage popups are suppressed in non-debug sessions. No old save, score, gacha, food, weapon, 3+3 ownership, title/menu layout or world map was erased or changed.
- Optional existing field missions remain in the game for free-play objectives. No new artwork.

## Commits
Implementation game.js 9571a7dfd86e1bde3ce2692c22deea3cf06d6856, blob 812f02798582255609edec32004e4e73352fbec8.
Regression game-intro-regression.js created 79fd7dcd4cafc52ccc0fea1bef3f54e518bc5078, test mock fix 25f98b46a67a60d3a60d73f2a8d3a101e253729e.
Cache index.html a333992dc2d0192b51ba46d7e604b132d6aa29ec; revision game.js?rev=812f02798582.

## Verification
Actual V8 new Function syntax PASS on 657,774-character game.js.
Real game guide function source extracted and run with stateful DOM/localStorage/audio/save mocks: 23 assertions PASS: forced popups blocked, correct 100-year goal, weapon/right region, permanent death warning, dismiss and manual reopening, persisted once flag, free survival for fresh worlds and preserved debugger stage. Node-compatible script committed and executed in V8 CommonJS shim, NOT actual node CLI.
No actual browser screenshot, Android real device, full save migration, FPS or 2D/WebGL end-to-end was executed. Not marked fully browser-verified.

## Follow-on P3
P3 remains first priority, and eastern terrain exploration/weapons/encounters remain in progress. Do not restart automatic 4-stage tutorial. For continuing old SAVE_SCHEMA2, preserve saved world progress and avoid any forced lesson interruption. If app UI misbehaves in mobile landscape, test actual rendered dialog rather than inventing a cache-only patch. No change to hourly minute-10 schedule or other stopped tasks.
