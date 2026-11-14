# 2026-11-15 08:10 JST — P2 specialist wildlife

Status: P2 four-species batch INCOMPLETE. Completed batches: 0/6; unfinished species: 24.

Implemented: live NPC update path now includes prey approach for manul, tibetanFox, shoebill and penguin with distinct stalking/flanking speeds, actual water-depth checks, collision and route clearance. Existing specialist habitat patrol, strikes, Canvas and WebGL animation are preserved, not rewritten. No title/menu/squad/save changes.

Commits: game 961b93b5250289cf7cbbfd35383f9b7299be79b0; cache d36dd2e514ada84f62fb75757d30af892f157e97.

Checks: game.js parsed by V8 Function constructor (pass). Browser, WebGL execution, FPS, save migration and combat simulation NOT TESTED. New prey approach is integrated into the existing NPC tick but hunting/hit/reward end-to-end remains UNVERIFIED. No claims of full completion.

Next P2: four-species integrated player attack / NPC hunting / 2D+WebGL pose / terrain / gacha / bestiary regression with actual runtime, plus save compatibility. Only mark batch complete after tests.
