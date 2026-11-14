# 2026-11-15 03:10 JST — P2 four-species combat integration (INCOMPLETE batch)

Starting HEAD 9c54eb301c1251f315ef8198ac69bd22274f1bd6. P1 flood-rescue delivery remains intact. ROADMAP-RECOVERY.md checked; original ROADMAP is protected. Title, menu, save schema, party 3+3, death/release ledgers and world clock unchanged.

Implementation commit 1327d489b7bc289f4b41992495858d06996794fc: combat-levels.js gains distinct combat profiles for manul (low claw combo), tibetanFox (lateral leap bite), shoebill (long beak lunge) and penguin (sliding flipper strike). Existing game.js calls WildCombatLevels.nextAttack in NPC combat, so profiles reach the real windup/reach/power/cooldown pipeline without changing game.js. Existing fauna.js has distinct shoebill and penguin 2D silhouettes; do NOT claim a completed four-animal batch, since 2D/WebGL attack-body animation, player action path, terrain AI and complete bestiary verification remain untested or unimplemented.

Cache commit 6cdc351db10eb38acf6fd69a91d9f22025db2241: index.html combat-levels.js rev updated to 0d86a1c903d7.

Validation: JavaScript new Function parse PASS for combat-levels.js. V8 mock nextAttack for four types PASS: first default/null then species-specific second variant, reach/cooldown positive. Browser, WebGL, old save, Android, FPS NOT RUN. Do not count P2 batch complete. P2 0 completed batches, 24 species remain under acceptance criteria.

Next run: finish these SAME four species as a single quality batch, including 2D and WebGL body-part animation on real player/NPC attack paths, collision, habitat AI and gacha/bestiary verification. Avoid another combat-number-only increment.
