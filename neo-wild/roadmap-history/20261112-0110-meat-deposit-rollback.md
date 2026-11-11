# PHASE A — Meat deposit autosave rollback (2026-11-12 JST)

Baseline main c70ea190c5b8f8cfd698c989d3e0598ad9b16515; reviewed last 7 commits, ROADMAP-RECOVERY.md and latest 0045 shared-pantry corruption, 0030 meal rollback histories. game.js initial blob 0b25ee93efb278afe936f91faa2243bb905132dc.

Fix: carryFood() at den previously committed meat to shared pantry and cleared/reduced carried food even when saveAuto() returned false, leaving pantry and world autosave inconsistent. Now if world autosave fails, restore pre-deposit denStores, denMeatLots and carried food; persist rollback pantry, warn if rollback also fails, and suppress mission progress/success notification. Both complete and partial deposits use same branch. Existing menu, roster, save schema and permanent death IDs unchanged.

Game commit 952478ffc4f40c38651efdc3c7022978802d6753; game blob 68d1502195c4c141c2526339a527b0ebbb9ff664.
HTML cache commit b01c5d96ba233990ff55b5705aefdca058808732; index.html blob c161faf9392923182a44eb4c68e38ad94193db83; game.js rev=68d1502195c4.
Syntax: entire game.js parsed. 16 isolated branch mock assertions for successful autosave and autosave failure with successful/failed pantry rollback. Both updated files re-fetched. No full-browser or Android playtest; no image generation.

Remaining: cross-key interrupted-write journal and Continue recovery still unimplemented; interrupted deposits between pantry write and world save remain a risk. Next priority durable journal with safe recovery on Continue, including real full-flow tests. No user action required.
