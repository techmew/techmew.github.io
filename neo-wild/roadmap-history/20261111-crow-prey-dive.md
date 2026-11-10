# Crow prey dive / PHASE A

Code commit 919ca8e2a15cdd6365a028c036f33ebffdc1db5a; game.js blob 267ba0fefc6d8b05881cd5d5dc94f0be55ada2f1. HTML rev updated.

Crow at low altitude (<=48) can strike rabbit/rat while flying. Successful kill triggers the existing carcass/XP/trophy path plus immediate hunger/HP restoration; high-altitude attack near small prey initiates descent instead of hitting remotely. Other species unchanged; save schema/UI unchanged. Existing carp debug gate remains; no saved individuals removed.

Checks: full game.js parsed with new Function; SHA verified after commit. No browser/Android runtime test, Pages propagation not confirmed. Follow-up: gameplay regression for descent timing and prey proximity, distinct boss ID/render mapping including WebGL; inspect backup/continue safety.
