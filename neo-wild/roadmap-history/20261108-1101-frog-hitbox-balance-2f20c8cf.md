# 2026-11-08 11:01 JST / Combat balance handoff
ACTIVE_SPRINT_ID: FROG_CONTACT_BALANCE_20261108_1101
Base HEAD before change: dfd6986194c7c6da731d0b8f0d2806341b385092
Implementation: game.js 63f90474ae9db2f2f15d1b95a1c1e86ca570bbdd; fauna.js 2f20c8cfc727388aac0125376365a7b21882dc2b
Scope: frog normal attack/tongue/slam/landing body contact, lunge swept path and obstruction, frog HP/ATK/cadence, existing SAVE_SCHEMA2 frog stat one-time migration, ordinary mob and boss incoming scaling.
Tests passed: game.js and fauna.js JS parse (V8); actual specialTargets frog far/near, pacman far/near, lunge far/near/blocked, save migration and no double frog landing tokens.
Preserved: title/gacha/CSS/HTML, save-backup.js, world-history.js, death/released ID, roster leader, other games.
STATUS:
- 実装中 (40分): 動物固有攻撃全30種の距離・射程可視表現とWebGL実画面確認 / game.js resolveSpeciesSpecial, resolveAttack, webgl3d.js
- 検証待ち (40分): Android実機でカエル通常技・舌・跳躍着地・突撃の接触と当たり判定/FPS; 高低差/遮蔽物; Lv1/5/15/30敵・強敵の死亡までの攻防回数。
- 検証待ち (00分): frogBalanceV1 migration on saved old 4/5 roster, JSON export/import Android, old SAVE_SCHEMA2 and death/release exclusions; game.js restoreSnapshot, save-backup.js
- 実装中 (20分): マップ雪境界・地形継ぎ目と通行判定を最新mainから確認 / mountain.js, fauna.js
- 未着手 (40分): UFO/怪異/巨大ボスの常時世界変化と相互作用の拡充 / ufo-events.js, apparitions.js
- 未着手: 永続的世界進化・共有世界サーバーの実装案。未承認のUI改造やバックグラウンド自動処理は行わない。
