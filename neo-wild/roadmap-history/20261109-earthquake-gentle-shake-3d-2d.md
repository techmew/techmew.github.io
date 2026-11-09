# WILD RECLAIM｜2026-11-09｜地震時に3D/2Dが少し揺れる
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_QUAKE_GENTLE_SHAKE
PHASE=A_FEATURES
作業起点main: 7cfe2d0c0926535b2ac99718c0c835074a137094
記録直前main: 4ee30163f51c979f74f2876e7c33ad25509da597
保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b（ロールバック禁止）

## 今回の実更新
- 65997d8fcdb9f56ca8a7a3879003508eb5606dc0 webgl3d.js: 地震カメラ移動量をWebGLの中心uniformへ適用。カメラ位置や積雪/地形キャッシュのキーを変更せず、描画負荷を増やさない構成。quakeOffset未指定は0。
- b8ecc98b7ecdfafabf4b3abc83ae9e87cda32251 game.js: 地震の表示揺れを水平最大3.2px／垂直最大2.5pxにし、3Dと2Dへ共通適用。操作UI/ミニマップを包むapp要素のtransformなし。ゲームモード以外は揺れなし。世界時間・衝突・保存には触れない。
- 4ee30163f51c979f74f2876e7c33ad25509da597 index.html: 最新JSのrevクエリ2件のみ更新。HTML文言・構造・CSS不変更。

## テスト
- game.js / webgl3d.js / disaster-world.js / squad-core.jsのJS構文 PASS。
- 3D shader中心uniform受渡し、雪と地形の静的キー不変、2Dオフセット、揺れの上限、非プレイ時0、タイトルUI順とバックアップボタンの存在: 静的検査 PASS。
- 合計15項目検査 PASS。Android実機での揺れ/FPS、WebGLフォールバックを含む画面E2Eは未検証。

## 繰越し（未完・検証待ち）
- 【40分・検証待ち】Android Chrome実機で地震発生時のWebGL/Canvas2D揺れを確認。揺れが強すぎないか、画面端が欠けないか、地形/雪メッシュの再計算増加がないか測定。対象 game.js、webgl3d.js。
- 【00分・検証待ち】Android JSONバックアップ保存/読込・旧4/5生存個体・leaderId・死亡/放流ID永久保護・旧SAVE_SCHEMA2・0年新規と旧世界時刻・容量不足/旧タブ競合・年表の実表示。対象 save-backup.js、world-history.js、game.js。
- 【20分・実装中】地割れ・山岳・源流の接続と地形の永続変化、災害が群れ移動へ反映されるか確認。対象 disaster-world.js、fauna.js、mountain.js。
- 【全担当・未完】隕石/津波/疾病等の大型事件、異星基地・怪獣、動物35種の実機E2E、257トロフィー条件、長時間FPS、共有サーバー。
- 【全担当・保護】新UIの動物3枠→続きからプレイ→JSONバックアップ、既存操作UIを凍結。所有3体（操作1体＋非同行2）/旧5体生存、roster.leaderId、野生放流4性格と死亡/放流永久ID、SAVE_SCHEMA2、世界0年8時新ゲーム・継続時刻、100年圧縮、既存年表を保持。ROADMAP.md/既存履歴は変更禁止。最新main/blob SHAからのみ差分を重ねる。
