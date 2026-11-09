# WILD RECLAIM｜2026-11-09｜ガチャから未操作対応24種を除外
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_GACHA_READY_ONLY
PHASE=A_FEATURES 継続
対象: techmew/techmew.github.io/main/neo-wild のみ
開始HEAD: fced37c58f66999cf24f0b4c078bb1640f866036
引継ぎ前HEAD: affa29e051d6c7015e758b52ea05782b7ffcf083
既存保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b。必ず現在mainから差分更新。ROADMAP.mdと古い引継ぎ記録は変更禁止。

## 変更したコード
- dec9263d8d8b70b84cbb65f7d82203b392fa36af / squad-core.js: ガチャ生成時のみ使用する `gachaReady` を追加。現行UIの操作許可 `OPERABLE` 11種と完全一致させ、`rollSpecies` では `gachaReady` との積集合だけ抽選する。既存の `playable` 35種登録、旧所有4/5体、放流/死亡永久ID、leaderId、SAVE_SCHEMA2は変更なし。
- 5470cb4e59e4400d68446ca556acf61caf5ce2e2 / squad-gacha-ui.js: 以前の固定OPERABLE 11種リストを `window.WildSquad.gachaReady` 参照に変更。今後の操作対応追加時に候補・リーダー判断が食い違わないようにした。UIレイアウト/文言/CSSは不変更。
- d12f44549d950b744db43d7ea911e783bf6a868d / gacha-rates.html: ガチャ排出確率一覧にも同じ `gachaReady` のみを使用。現状伝説級は新規排出0件なので、率の説明を実態に合わせて修正。coreの版指定を更新。ページ構造とCSSは不変更。
- affa29e051d6c7015e758b52ea05782b7ffcf083 / index.html: 新規2スクリプトのrevクエリのみ更新。既存タイトル動物3枠→続きからプレイ→JSONバックアップボタン、localStorage消失注意書き、HTML/CSS/配置等は不変更。

## 新規抽選可能11種
猫(cat)、犬(dog)、狐(fox)、狼(wolf)、鹿(deer)、猪(boar)、マヌルネコ(manul)、チベットスナギツネ(tibetanFox)、ハシビロコウ(shoebill)、巨大アマガエル(giantTreeFrog)、ベルツノガエル(pacmanFrog)。
この11種は既存ガチャUIの操作許可リストに基づく。未対応24種（ハト・カラス・コイ・カワウソなど）は、操作対応の実機確認が完了するまで新規排出させない。旧セーブ・既存所有者は削除/改変しない。将来の動物追加はコード実装と実機動作確認後に `gachaReady` を増やす。単なる `playable` への登録で追加しない。

## 検査
- 最新main / squad-core.js と squad-gacha-ui.js の現行blob SHA条件付き更新のみ。古い版からの巻戻しなし。
- 0/7/17/34/100年それぞれで4,000回の `rollSpecies`。未操作対応は一度も排出なし（計20,000回）。抽選上限3引き直しPASS。
- 排出確率一覧の0/7/34年の正規化（合計100%）と対象一致PASS。伝説級0%を確認。
- 旧ハト所有+生存5体の保持、leaderId維持、死亡IDと放流IDの旧データ復活阻止PASS。
- 27本のJS参照rev一致、タイトルUI構造・JSONバックアップ操作の維持PASS。
- 画像生成なし。データ削除なし。

## 未完 / 担当・次の実装箇所
- 【00分・検証待ち】Android Chromeで実際のガチャ操作と引き直し、0/7/34年の排出、初期編成、所有3枠・旧4/5体、legacyのハト所有、リーダー切替、死亡/放流永久IDとJSONバックアップを試験。対象 squad-core.js/squad-gacha-ui.js/game.js/save-backup.js。
- 【40分・実装中】現在除外されている24種を段階的に操作・攻撃・種別アニメ・飛行/水中・UI操作で実機確認。対象 game.js/webgl3d.js/fauna.js。見た目の登録だけでガチャへ戻さない。
- 【20分・実装中】空中/水中の地形衝突・AI・種別生態適性を完成し、特にハト・カラス・コイ・カワウソの実操作問題を検証。対象 game.js/mountain.js/fauna.js。
- 【全担当・保護】継続セーブ、死亡/放流の永久ID、0年8時NEW GAME/旧世界の時刻、世界史とバックアップ、雪描画・動物攻撃・3Dの現行仕様、タイトルUI固定を維持。
- 【全担当・検証待ち】Android実機、長時間FPS、ガチャ全動作E2E。コードモック結果を実機完成と呼ばない。
