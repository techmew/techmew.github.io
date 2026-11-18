# 2026-11-19 00:10 JST — fatal scene visibility in death-share card

P3 remains priority. Read ROADMAP-RECOVERY, 20261115-2230 weapon history, eastern expedition history, and 20261118-2210 UFO/fissure partial handoff. Existing P3 exploration/arsenal not reimplemented.

## Delivered
- game.js dying-frame rendering now includes the actual UFO formation and beam, apparition, disaster, flood rescue and lightning overlays before capturing the fatal frame. Previously all were skipped by mode !== dying.
- death-share.js scales the full source frame to fit inside the card rather than center-cropping the upper UFO / edge hazards. This preserves complete fatal imagery at the cost of possible letterboxing.
- index.html updates the game.js and death-share.js revision hashes. Title, UI layout, 3+3 roster, SAVE_SCHEMA2, permanent death/release IDs, meat data and year-100 boss unchanged.
- Commits: game 8da52cac88a5253e6543607d7bf86b41f29a6aa6; death card 8151c93d8c4c3238233302d6aeaa74319ea2c5ec; cache 28a7b4a99c2e7c808e9bd65a0d746ed9016257d9.

## Validation
- Actual V8 new Function syntax parsing on complete modified game.js and death-share.js: PASS.
- Integrated DOM/Canvas, real browser, WebGL GPU pixels, Android, old save reload, FPS: NOT EXECUTED. UFO event lifetime at death and specific frame composition remain live-unverified.
- Pages status must be checked independently; never infer success from commit.

## Next
- Large P3 east sortie + backup E2E, actual browser capture and 2D/WebGL coordinate validation.
- Flood count and fissure collision integration are still outstanding; UFO beam balance needs real gameplay validation.
- P2 accepted 0 batches / 24 species remaining; P3 incomplete; P1/P4-P8 unchanged.
