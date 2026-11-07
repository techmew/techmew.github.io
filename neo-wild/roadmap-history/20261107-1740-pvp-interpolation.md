# 2026-11-07 / 40分担当 / PHASE=A_FEATURES

実装: online-pvp.js にリモート個体の座標・向きの受信時刻補間と5秒無通信個体の退出処理を追加。コミット 0e82e2b2b7ca29648fbc056d76816a94e909cf11 / 修正 3cf92517feb2fa0ec96018af255dcf11f7f8d2cc。

- 実装中: 40分担当 — PvPクライアントの受信補間、無通信退出。コード再取得確認済み。実サーバー/ブラウザ動作は検証待ち。
- 未着手: 40分担当 — 認証付きWSSマッチングサーバー、サーバー側レベル±5、双方向可視化と攻撃・ダメージ権威判定、再接続、ゲーム本体統合。次: online-pvp.js、webgl3d.js、game.js。サーバー未設置で自動接続禁止。
- 未着手: 40分担当 — 雪境界・地形シーム、30種3D固有モーション、怪異/UFO/大型存在のAI拡張。次: webgl3d.js / apparitions.js / ufo-events.js。20分担当地形を保護。
- 検証待ち: 00分担当 — Android JSONバックアップ/読込・年表、旧4/5体・SAVE_SCHEMA2・死亡放流ID永久保護。次: save-backup.js / world-history.js / game.js。
- 回帰保護: 最新main起点、UI固定（3枠直下続きから・JSONボタン・リスク表示・ガチャ決定/キャンセル）、操作1+非同行2、旧生存者、リーダー優先、NEW GAME 0年08:00、ROADMAP.md不変更。
