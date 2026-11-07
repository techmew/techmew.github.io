# 2026-11-07 20:40 JST / 40分担当
PHASE=A_FEATURES。変更コミット b44dccee63ddb21d79898415b4d2641ccd19e1d0。
online-coop.js: サーバー権威の協力イベントeventIdをセッション単位で重複排除。最大256件・5分TTL、接続終了/セッション開始でクリア。既存セーブ・UI・3Dファイルは未変更。
検証待ち: 実WSSサーバー接続、4人同時プレイ、復活/支援/目標イベントの再送試験。バックエンド未構築なら未実装。
40分未完: 雪/地表メッシュのシームレス化、キャラ固有3D品質・顔座標、UFO/怪異/巨大存在のプレイ統合。対象webgl3d.js、game.js、ufo-events.js、apparitions.js。20分担当の地形APIを参照。
00分未完: Android JSON保存/読込、旧SAVE_SCHEMA2・死亡放流ID永久保護のE2E。対象save-backup.js、game.js。
20分未完: 河川上流・標高・林/山境界の実地形接続。対象mountain.jsと地形ロジック。
回帰保護: 2026-11-07基準2a8b20e7、最新main起点、タイトルUI・JSONバックアップ・年表・3体所有/旧4/5体・永久ID、ROADMAP.md編集禁止。
