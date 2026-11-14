# 2026-11-14 — P1 flood-rescue survival loop (quality epic)

Start HEAD: 391dee7d400f0a2c068c544379ae2630451cb2e8. Read ROADMAP-RECOVERY.md, recent 17:10/18:10/19:10 handoffs, disaster-world.js, ufo-events.js, game.js and index. Preserved existing disaster frequency escalation, rain buffs, independent UFO escorts, top-menu UI, game saves, old members and boss ownership. No image generation.

Playable feature, not a numeric tweak: in a real flood, frog/giantTreeFrog/pacmanFrog/otter players may approach a stranded non-owned prey animal and press the existing context/action button to start a physical escort. The rescued animal is moved each frame with the game's collision-checked move() AFTER the wild NPC AI loop. The player must lead the animal, not just themselves, to a dry bank without breaking contact. Land wildlife near active floods becomes briefly exhausted but is never arbitrarily killed by the new system. Successful rescue grants +8 DNA and +12 stamina, appends a world chronicle rescue event and commits the existing autosave. A failed autosave restores XP, stamina, journal and the temporary rescued flag, allowing a safe retry; rescued/owned/boss/dead individuals are excluded from normal eligibility. Shared Canvas overlay marks the rescue in both 2D and WebGL modes, without repositioning existing UI controls. New transient module does not add new save keys or change SAVE_SCHEMA.

Commits:
- 1dd52881ea9f14970f4ad5cc5739b3288e952398 flood-rescue.js playable rescue module.
- 422f1aea0f425403db350862fe1ff79635096923 game.js action, post-AI movement, rewards, overlay integration.
- bcea34d3aaa07e5c25531a1f981cc49830e93fba game.js exact journal rollback on save failure.
- 20a1e558fa57fbee8eeca13db80e3f306c250df1 index.html script load and new cache revisions.

Latest blobs when checked: flood-rescue.js 2d01afce71619967c9f0942eb61a702e4c1b8d1c; game.js 658e39a671c7f51349e619e37e9b5466e005b10e; index.html c065f914e28638f6f2a9c5795375ad8cda19ea6a.

Validation actually performed: new Function syntax parse of full game.js and flood-rescue.js PASS. V8 mocked rescued NPC near flooding bank, blocking cover, terrestrial player, dead NPC, owned NPC, rejected save rollback, successful retry once, and index JS rev/integration invariants: 8 checks PASS. Full browser gameplay, 2D/WebGL frame rendering, Android and measured FPS NOT tested. GitHub Pages state must be inspected from workflow; successful deployment is not proof of gameplay.

P1 remaining: real browser scenario with late-year disaster frequency, amphibious controls, UFO beam/cover, and rescue bank geometry; if browser unavailable, preserve clear "untested" state and move to substantial P2 animal batches rather than repeated P1 micro-tuning. P2 next batch should cover at least three species with distinctive 2D+WebGL anatomy, attack bodily movement, hitboxes, wild AI and gacha/collection linkage. No changes to top UI, SAVE_SCHEMA2, member slots, death/release ledgers, clock, or 100-year final-boss contract.
