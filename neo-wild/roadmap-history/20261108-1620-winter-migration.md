# 2026-11-08 16:20 JST / 20分担当
PHASE=A_FEATURES
実装: 冬季の干ばつ・捕食圧地域の生息適性を下げ、既存の移動回廊で群れがより安全な地域へ移動する判定に反映。新規個体生成なし。変更 era-ecology.js / migration()。機能コミット b67c24dd9365ae5ff3731b85282b725aa5eb95b9。確認済みblob dc189adb503783d6574dc99ca54391d14cddfb88、HEAD b67c24dd9365ae5ff3731b85282b725aa5eb95b9。
未完・20分: mountain.js の右上林/山/渓流の実地形接合と雪の境界試験、動物AIの移動経路連動、実ブラウザ動作。次は mountain.js height/headwater/snowCover と fauna.js を確認して最小差分実装。
検証待ち・00分: Android JSONバックアップ保存/読込、旧SAVE_SCHEMA2/死亡放流ID保護、年表実機表示。save-backup.js/world-history.js/game.js。
検証待ち・40分: 雪の白色/継ぎ目・描画FPS、3D固有攻撃、既存UI維持。webgl3d.js。
回帰保護: UI変更なし、セーブファイル変更なし、操作1体+非同行2体、旧4/5体生存者保護、放流/死亡ID永久保護、0年8時、既存世界時計。構文/ブラウザE2Eは未検証。
