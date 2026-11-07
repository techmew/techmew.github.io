# 2026-11-07 20:00 JST | 00分担当
PHASE=A_FEATURES / ACTIVE_SPRINT_ID=20261107-save-restore-integrity
実装: save-backup.js のJSON読込時、旧キー削除前と削除後に全対象キーのlocalStorage再読取を行い、途中変更・容量問題・書込異常を検出したら既存のロールバックへ移す。UI変更なし。実装commit: 17ef6ac5df9768def1615ef5c2fab35309d1d055。
保護: main HEAD 17ef6ac5df9768def1615ef5c2fab35309d1d055; blob 86430d976119cc556ec028e1ebea0590be97d984。過去基準2a8b20e、死亡/放流永久ID、旧4/5体、leaderId、SAVE_SCHEMA2、世界0年08時と既存時計、タイトルUI/年表、他担当の地形・3Dを変更しない。
検証待ち: Android JSON書出/読込、容量不足/旧タブ競合の実機再現、年表表示、旧セーブ5体・放流/死亡ID復活禁止のE2E。担当00分、対象save-backup.js/game.js/world-history.js。
未着手・継続: 地形/積雪のセーブ横断統合、200以上のユニークトロフィー、全滅後世界継続の長時間試験。20分地形、40分描画の最新変更を取り込んでから着手。
検証状況: GitHub書込と再読取のみ確認。JS構文実行/Android実機/ブラウザ起動は未検証。既存ROADMAP.mdは未変更。
