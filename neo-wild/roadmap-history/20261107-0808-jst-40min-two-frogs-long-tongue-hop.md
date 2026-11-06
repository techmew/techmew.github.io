# WILD RECLAIM / 40分担当 / 巨大カエル2種
PHASE=A_FEATURES / 2026-11-07 JST
Base HEAD: d1ce6fe90e3eca8fe8b0b6c4ebe8684fd11df058
Files:
- neo-wild/squad-core.js: ce65a8385a98039291e8d04fa89ca8beef0383d8
- neo-wild/fauna.js: 60d1186ead3e78633d37ee24a550c2a49286b9c5
- neo-wild/squad-gacha-ui.js: 2ecafb78f50c68fa4eb40b479f5eb65aaa4bea49
- neo-wild/game.js: 6e89c0e4f0f694a8a2a1c8e5ab820349f82412a1
- neo-wild/webgl3d.js: ce5f5f8e4e125a4e076df32a218f35b17473a32c
- neo-wild/index.html: 012db340a1214363bdde10825dcd594b7802155d (cache keys only)

Implemented:
- 巨大アマガエル（基本）・ベルツノガエル（希少）をガチャ・直接操作・個体生成に追加。
- 精細な固有3D/2D：後肢筋、吸盤、喉袋、眼球・角、皮膚の模様、伸縮する舌。年齢/性別差もモデルに連動。
- 移動時の連続ホップ表示、高跳び/突進、舌の遠距離通常攻撃と実ヒット判定、跳躍着地攻撃。
- 必殺技：アマガエルは舌で最大3体攻撃して衝突なしの範囲で引き寄せる。ベルツノは実ジャンプの着地時に範囲プレスを実行する。
- UI配置/CSS/旧セーブの構造は不変更。既存のガチャ確定・キャンセルボタンを維持。ROADMAP.md編集なし。

Verification:
- 5 JS files V8 syntax PASS。squad-core mock: 3体の保存・ガチャ再抽選の非保存性・リーダー切替・死亡個体の除外・旧4体保護 PASS。
- 現行HEADと対象旧blobの一致を確認してから原子的に更新。
Unverified: 実機/Android WebGL表示・FPS、パッド操作、旧SAVE_SCHEMA2フルE2E、Pages配信。
Next: 00分担当は旧4/5体・放流死亡回帰、20分担当はカエルの湿地での野生出現・AI行動を検証。