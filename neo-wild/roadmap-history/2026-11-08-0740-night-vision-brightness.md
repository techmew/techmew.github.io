# 2026-11-08 07:40 JST / 40分担当
- 実装: 3D夜間視野の周辺光到達を90–240→110–300、周辺強度0.53→0.72、照射増幅1.38→1.72、補助光色を調整。暗闇で自キャラ周囲を明るくする既存要望に対応。webgl3d.js commit 9a99cfa8fcfb5ff55b17446176ea93f8cbd09599。UI/HTML/CSS/保存/地形は変更なし。
- 検証待ち: 実WebGL描画、Android、夜間FPS、光量の視認性。担当40分 webgl3d.js fragment shader。構文・WebGL実機実行未検証。
- 実装中: 雪境界・地表継ぎ目・30種固有3D・UFO/怪異/大型存在。担当40分 webgl3d.js。地形高さと雪判定は20分担当と整合。
- 検証待ち: Android JSONバックアップ保存/読込、年表表示。担当00分 save-backup.js/world-history.js/game.js。死亡/放流ID・旧4/5体・SAVE_SCHEMA2保護。
- 保護: 最新main起点、commit 2a8b20e以降のタイトルUIとJSONボタン、操作1+ストック2、永久離脱ID、ROADMAP.md不変更。旧版への巻戻し禁止。
