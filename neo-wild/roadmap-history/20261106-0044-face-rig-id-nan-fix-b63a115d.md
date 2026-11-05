# WILD RECLAIM｜2026-11-06 JST｜40分担当｜攻撃時の顔面崩壊・描画座標の根本修正

PHASE=A_FEATURES継続。既存UI/HTML/CSS/全ボタン/所有・野生放流仕様/ROADMAP.md変更なし。

## 不具合の原因と修復
1. 個体IDが文字列のとき、WebGL3DのMath.sin()に直接代入されNaNになる。旧コードのidleBreath/headAttention/専用マヌル描画で再現。visualIdSeed()を導入し文字列IDを安定した有限数値位相に変換、キャッシュ上限2048。古い数値ID、IDなしも維持。主因となる非有限3D頂点を排除。
2. WebGL汎用モデルの頭・目/耳と鼻/口で異なる前進座標、全身の過大な攻撃変位が発生。neckを親基準に鼻・顎を相対配置。脚と全身の攻撃挙動は残し、頭部座標・胴体揺れ・攻撃時の伸びを制限。
3. 専用3Dのマヌルネコは頬と顔を同じfaceDriveで移動、チベットスナギツネは耳と頭の位置を統一、ハシビロコウは冠羽・目・嘴に共通のheadY/headX移動を使い過伸長を解消。
4. 2Dの攻撃時に全身（顔まで）の縦横比を変えていた非等方スケーリングを廃止。ハシビロコウの首・頭・嘴全体を単一Canvas変換で動かし、嘴の異常伸長を抑制。
5. 専用3Dの未定義変数 breath/adult/alert も修復（アルマジロ、ハリネズミなどの描画例外対策）。

## GitHub main 更新コミット
- webgl3d.js：0e52f9ebdae41cea65c2c252bcd7fded226748bb（顔部品親座標統合）
- game.js：06c111f71f57ff9b57bc628cd3fcefe1367b2903（2Dの顔剛性/ハシビロコウ）
- webgl3d.js：f76de6ddd048354a607099f4c82ec703217bb0d2（breath/adult）
- webgl3d.js：b44fa6ae5ff6df8c238c581efce492bbe2abb75b（alert）
- webgl3d.js：b63a115de014882c31b5b606b874d3eb78747335（文字列ID NaN排除）
- 最終blob：game.js c88c231ac44162959ed0d3b5a8a233124086b75f / webgl3d.js 130e08d9fdda5a4b39cf699549c03a56cc77fbfa。

## 検証
- game.js / webgl3d.js / squad-core.js JS構文PASS。
- WebGLモデル30種×待機/攻撃/必殺技×文字列ID/数値ID/IDなし = 270ケースPASS、生成頂点8019点の座標・寸法すべて有限。
- 修正前の文字列IDで猫/狐/犬/狼がNaNとなる状態を再現、修正後0件。ID数値化は再現性・個体差あり。
- 2D専用顔描画3種×待機/攻撃/必殺 = 9ケースPASS、Canvas save/restore釣合いPASS。
- 旧所有5体、リーダー切替、放流/死亡したIDの古いSAVE再ロードによる復活防止をモックでPASS。
- Android実機、WebGL実レンダリングの画像/FPS、ゲーム全体のSAVE_SCHEMA2 E2E、Pages最新配信は未検証。

## 引継ぎ
- 40分: 実機で顔パーツの視認性と攻撃アニメを全操作種確認。固有モーションやエフェクトの過大化は骨格座標を優先し修正。
- 00分: SAVE_SCHEMA2旧ロード→選択キャラ攻撃、永久死亡・放流IDの実E2E。
- 20分: 実接触/攻撃モーション/動物AIの同期確認。
