# 2026-11-14 09:10 JST — Tanuki false-scent decoy

Baseline main b97c0a9c334397046424c09d19a10fc4bd773f8c. Read latest commits, roadmap-history 08:10 and ROADMAP-RECOVERY.md; protected original ROADMAP.

Changed player tanuki feint special to leave a false scent at the pre-dash position, redirect hostile nearby wildlife pursuit for 3.2 seconds. Hostile NPC chase uses decoy coordinates and suppresses player spotting while outside close-contact range, unless LOS to decoy blocked; bosses and prey unaffected. Existing combat particle FX and label at lure point. Player can escape; close contact breaks deception. No save fields, existing menus, dead/released IDs or UI changed. No image generation.

Game commit 81b53ae089e0017c1ba8713a48e962eb8159f663; blob 5b71b67c492322613518ea3c177f474beb02f0a2. HTML rev commit 9f1c62102e87ee92ec9b44ed5a249fc4604e0465; HTML readback matched.

Validation: new Function parsed complete game.js; 10 structural regression checks. Browser/WebGL visual, real mobile gameplay, and FPS not tested. Next: integrated simulated AI pursuit and gamepad/touch control verification, then complete distinct species 3D animation. Important unfinished: 24 unverified species, meat transport/pantry, 100-year boss, exploration, long-session stability, multiplayer.
