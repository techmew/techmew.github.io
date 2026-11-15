# 2026-11-15 14:10 JST — P2 specialist carcass competition, four species

Starting main HEAD 7f27cb98aa28863f7240c0cec383241501113a03. Read ROADMAP-RECOVERY.md, latest roadmap-history (11:10,12:10,13:10), commits, game.js, fauna.js, webgl3d.js and regression files. No rollback.

## Integrated playable encounter
Four wild specialist hunters (manul, tibetanFox, shoebill, penguin) already hunt prey and produce a reserved edible corpse. Previously the player could take that fresh meat without any predator response. The real game.js player pickup and on-site eating success paths now call contestSpecialistKill: the visible, nearby, living wild hunter abandons its claim and pursues the thief using existing alert/search, last-known-player location and attack animation state. Hide behind cover or leave the 235-unit range to avoid detection. Owned, released and boss identities cannot become hostile defenders. Failed autosave rolls back food before any contest side effects; amount is conserved, so no meat duplication or phantom rewards. Existing hunting, 2D/WebGL combat poses, den storage, gacha/bestiary and save schema retained.

Implementation 1e5f42201f739eeb37ab730d6775606a17fc8335, game.js blob e99df19aac6f50e36fb59e0b43f1b3896c1731ef.
Index activation 1371d240ee475cc1259dadbe55f1912f0ae698e1, game.js?rev=e99df19aac6f.
Regression script p2-specialist-carcass-contest-regression.js committed 4216f1a1c26cfbf28a464dbb18b9dfcd633bdaf5.

## Verification
- Full updated game.js V8 new Function syntax PASS.
- Executed actual source-extracted contest function and new regression in V8 using isolated Node-like fs/path/assert: 4 species x 6 conditions, 105 assertions PASS. Checks visible theft chase, hidden/LOS cover, owned/released safety, expired lease, exact meat conservation and release of claim.
- Previous full foodweb, bestiary, save compatibility, NEW GAME, 100-year boss, real browser 2D/WebGL, Android and FPS not rerun this turn; do not claim acceptance. The standalone Node CLI file was parsed and executed in a Node-compatible V8 harness, but not in a real Node CLI.
- No title/menu/layout or save schema change.

## Epic status
P1 source-integrated, real-browser unverified. P2 0 accepted batches, 24 species remaining; current four species have player combat, NPC prey hunt, corpse, feeding and contested theft but full browser acceptance and live 2D/WebGL remain unverified. P3-P8 pending.

Next one large deliverable: execute an end-to-end four-species player hunting -> prey death -> corpse pickup -> den stash -> bestiary/reload, plus wild NPC hunt and real Canvas/WebGL browser verification if possible. Avoid more isolated numeric tweaks. No user action required.
