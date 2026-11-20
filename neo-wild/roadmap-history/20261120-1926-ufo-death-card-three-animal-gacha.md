# 2026-11-20 19:26 JST — UFO death card + immutable three-animal gacha

Scope: techmew/techmew.github.io main/neo-wild only. Read latest HEAD, preserved legacy SAVE_SCHEMA2, P3 weapon specs 20261115-2230 and eastern expedition 20261115 and today's P3 handoffs. Never touched scheduler, images/assets, permanent death/release ledgers or base title layout.

## Reported faults and connected changes
1. Phone portrait screenshot occupied only a tiny strip in the middle of the 1200×675 share card because death-share.js cover() used Math.min (contain). It now fills the available 1200×402 photo region with clip + center crop, retaining a 16:9 card. The result share panel has 100% available width rather than a fixed 430px maximum. Existing download and X image sharing buttons stay in place.
2. The UFO departed for 2.7 seconds, then cleared its event before the first dying-frame capture. A new ephemeral lastPlayerCapture keeps the real number of saucers at the instant of capture. death-share.js overlays a reenactment using the game UFO's own renderSaucer art (leader + actual escorts and beam) in the fatal frame. If the event was a 3-saucer formation, all 3 show on the share card. The physical flying-away departure animation remains unchanged. No fake formation is added to a one-saucer event.
3. Abducted player is marked _ufoAbducted and corpse=false after docking and omitted from both Canvas2D entities and WebGL player rendering; old NPC abduction already suppressed corpses. This does not affect normal deaths. Death reason remains ufo.
4. Gacha ownership still max 3. Added per-roster initialGachaUsed (optional, backwards compatible) tracking exactly three initial free animal draws. The remaining free rights work before or after starting. Once exhausted, XP/hunt/exploration/tutorial milestones do not grant further tickets, and a death grants none. A verified permanent release adds precisely one saved ticket; spending it for a compatible replacement costs exactly one. If the final owner is released, the released credits survive an empty roster; re-creating a squad doesn't reset the initial three. Legacy 4/5 owners are not dropped or resurrected by migration. Explicit NEW WORLD reset still starts new three-draw allocation. No credits silently removed from old saves.
5. Squad gacha UI explains remaining initial slots and earned release tickets. Removed obsolete instructions to hunt/earn XP for tickets.

## Executed checks, NOT real device
- V8 full JS parser: game.js, webgl3d.js, ufo-events.js, death-share.js, squad-core.js, squad-gacha-ui.js: PASS.
- New standalone ufo-death-squad-regression.cjs: 36 source-backed V8 checks PASS; starts with one animal, uses remaining 2 after play, deaths vs releases, no extra XP or milestone gacha, empty-roster release credits and no free re-draw, 3 actual UFO art calls in the screenshot, portrait crop filling width, both renderers hide abducted body.
- Existing weapon arsenal: 20,181 assertions PASS; salvage DOM/Canvas 72; P3 route priority 47; siege recovery 15; aquatic expedition 479.
- Actual browser screenshot, real GPU/Canvas visual validation, Android and FPS: NOT RUN. Real users must verify visual quality, actual saucer composition and share button on device.
- SAVE_SCHEMA2 world version remains 2; no death/release ID clearing, no 3+3 or 100-year boss alteration.

## Outstanding
P3 east live browser/Android real start (land 15, carp 2) through encounter, weapon storage, boss HP, save/JSON restore and UFO death screenshot. P1 unverified, P2 0 accepted/24 missing, P3 IN PROGRESS, P4-P8 unchanged. No additional automation or image generation.
