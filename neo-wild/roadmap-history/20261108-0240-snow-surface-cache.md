# 40分担当 2026-11-08 02:40 JST
PHASE=A_FEATURES。変更commit 8fc32c0938f5ec7a37d0fda08083b1bbac5533da。
変更: webgl3d.jsの雪面fan頂点についてworld座標キーのsurfaceCacheを追加し、同一頂点の地形高度・傾斜サンプルを共有。雪境界や既存地形/保存/UIの挙動は変更しない。更新後blob 9eff73fc46fae5674342406ffc90000b1a3da05f を再取得済み。
検証待ち: JS構文の実行検査、ブラウザ起動・WebGL描画・FPS比較・Android実機、雪境界/継ぎ目、JSONバックアップ読込・年表のAndroid実動作。未確認を完了扱いしない。
未完/担当40分: 雪の法線とZ-fighting、30種の固有3D造形・四脚歩行・攻撃時の顔座標安定、UFO/怪異/大型存在AI。次はwebgl3d.jsの雪面メッシュ・animal描画関数から実装。
未完/担当20分: WildMountain.height/snowCover と通行判定・水源/標高/バイオーム境界の一致。
未完/担当00分: save-backup.js/world-history.js/game.js のAndroid JSON実動作、旧4/5体と死亡/放流ID・SAVE_SCHEMA2保護回帰。
保護: 2026-11-07 commit 2a8b20e7419e1d93105018835fa81e9d50788e8b 以降の最新mainを常に起点とし、タイトルUI・3体所有・永久ID・年表・バックアップを維持。ROADMAP.md変更禁止。
