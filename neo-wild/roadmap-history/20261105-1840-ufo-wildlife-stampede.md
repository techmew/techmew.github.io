# 2026-11-05 18:40 JST — UFO gravity stampede

PHASE=A_FEATURES. Game feature commit: 3e2a35dab499af9128b2d7443a35d52a322161c0. Source blob c29296eca0e1e034542e6c2a894e6b1397845c87. Only neo-wild/ufo-events.js changed; ROADMAP.md, HTML, CSS and UI unchanged.

During UFO scan, every 2.4 seconds the saucer emits a gameplay gravity sweep over 440 world units. Wild animals with clear sight gain flee and alert timers, face away from the UFO, and receive an outward escape velocity unless already moving away. Emits ufo-wildlife-stampede event with number of animals affected. Respects existing cover/obstacle line-of-sight and excludes player-owned, released and boss animals from panic sweep. Existing aggressive player pursuit, continuous NPC abduction, time-limited departure, saved traces and UFO persistence remain.

QA: JS syntax PASS. Isolated 41.5-second simulation: 2 stampede waves, 7 animals actively fleeing with nonzero velocity, 10 NPC abductions and 10 saved mutilation traces; UFO departed, player deaths 0. Not a browser/E2E test. Android WebGL, long session, old SAVE_SCHEMA2 end-to-end remain unverified.

Handoff: 20-minute fauna team verify flee timers and movement AI do not overwrite outward impulse immediately; 00-minute save team verify new UFO transient panicPulse persists via event serialization. 40-minute team verify real frame-time performance and visual UFO details. Existing 3-character ownership and released permanent IDs untouched.
