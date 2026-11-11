# PHASE A | Crow one-tap glide-to-prey swoop (2026-11-11 JST)
Baseline: main HEAD 16d12b47f8052cca19fbd7e5d76c655d0dce76da. Read roadmap-history, ROADMAP-RECOVERY.md, ROADMAP.md, latest commits and game.js. No old 00/20/40 tasks were restarted.

Problem: crow attack at flight altitude >48 previously only enabled descent, forcing another attack tap near ground. The bird could land before the windup ended, so the aerial prey-vitals reward was unreliable.

Changes: session-only WeakMap tracks chosen nearby rat/rabbit and 3.3-second swoop window. Attack at altitude >48 selects closest visible prey and descends; ground proximity triggers a single automatic low-altitude beak strike. During pending windup the crow hovers at flightAltitude>=47; on resolution it returns to flight rather than forced ground landing. Out-of-range, dead prey, expiration and explicit jump cancel the swoop. Existing kill(m), carcass, XP, trophies, satiety/HP and save calls remain intact.

Code commit: 2398fb819ddedc3334c9e171ba69355d1c1ee5f1
Game blob: 926796987ecc1418c2948edb9488dc4e5f892304
HTML cache commit: 6ffcd9679715e236da0a8eeccd6551bfabc6d747
HTML revision: game.js?rev=926796987ecc

Validation: full game.js JavaScript parses. Isolated target/contact helper mocks: closest small prey selected; contact invalid when high; valid at 47 altitude; dead target rejected; boss rejected; blocked line of sight rejected. Static integration check for pending attack and return to flight. Fetched current game.js and index.html SHA/rev after commit. Actual browser, Android and live combat remain unverified; no save migration or UI layout change.

Next: confirm live published build, perform Android crow dive E2E, then debug boss roster death/recruit/switch save consistency and den meat portability. Consider allowing crow to carry only small carcasses while airborne, preserving shared den ledger and no duplication. User action currently optional: short Android recording of crow attack at altitude would surface alignment bugs.
