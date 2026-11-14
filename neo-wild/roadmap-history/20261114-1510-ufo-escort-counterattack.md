# 2026-11-14 15:10 JST — UFO escort attack counterplay
Starting HEAD 3f45777e7e441a65871a529b2e546ea7d5c6cf37. Reviewed ROADMAP-RECOVERY.md and latest 14:10 wetland recovery handoff. Kept previously restored title UI and all save handling intact.

Gameplay: During UFO scan, a living player can strike a nearby escort when facing it and line-of-sight is clear. Normal attack disables that escort for 3.2s; ultimate for 6s. Each escort has a hit cooldown to prevent continuous stun-lock. Disable immediately clears the player's and wildlife's tractor-beam progress, stops wildlife acquisition, and removes the escort's contribution to mother UFO's combined tractor strength. Existing concealment and obstacles still protect the player. An event is emitted for the counterattack. Disabled state is held on existing wingman state and is compatible with missing fields on older saves.

Gameplay commit 51bc9613191c54f9ed253ba3312577834f0b08fd, UFO JS blob 6cb73f2dd41611f4796f15ae00153731edc70dc8. HTML cache rev commit fa75c2a3a68aac92317fc065803277c50035b050, index blob a804cd21c9736d4557e9614b76df8cd62de6dbea. HTML diff only changes UFO script revision.

Validation: new Function(ufo-events.js) syntax PASS; isolated execution of actual moveEscorts source with mock player, obstacles and events PASS 5/5 (attack disrupts, obstacle blocks, facing blocks, dead player cannot strike, ultimate extends disruption). Browser/Android/FPS not tested. Pages publish pending verification.

Next: Verify browser/Android attack animation timing, 2D and WebGL disabled-craft appearance, and high-NPC performance. Remaining major features: 35 species, richer terrain, boss/endgame, trophies, four-player co-op.
