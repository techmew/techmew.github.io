# WILD RECLAIM 40分担当｜ジャンプ＋攻撃の飛びつき
日付: 2026-11-07 JST
PHASE: A_FEATURES
作業起点: main dd6af118d35b929f7cc12b6bca767586cd912f5a
実装: af21e7a563f13571bf00cd63da7084d0fc016e52 (neo-wild/game.js)
3D表現: 895201a36496dfef75f0241ca9a5109dea9d13dc (neo-wild/webgl3d.js)
引継ぎ作成前HEAD: 895201a36496dfef75f0241ca9a5109dea9d13dc

## 完了（コード構文と対象blob再取得済み）
- ジャンプ＋攻撃、ジャンプ中攻撃、攻撃→ジャンプの両順序で11種の飛びつき。対象はcat/manul/fox/tibetanFox/wolf/dog/wildDog/lion/tiger/cheetah/hyena。
- 既存touch/keyboard/gamepad操作と既存jump/dash/通常攻撃を再利用。新規UI・HTML/CSS変更なし。
- 連続移動・前方捕捉・終盤の空中接触検査・種別の威力/移動距離・一跳躍一撃制限、前脚を伸ばす3Dポーズ。
- 新規状態はWeakMapのみ。SAVE_SCHEMA2、roster、個体永久離脱、年表、backupに一切変更なし。JavaScript構文検査OK、GitHub最新blob再取得OK。

## 検証待ち（40分担当）
- Androidタッチのジャンプ／攻撃二指同時、逆順、空中タップで実動作と当たり判定を検証。特に接近／遠距離・壁／高低差・ボス・スマホ長押し。
- 2D/WebGLで11種の前脚モーション、着地処理、飛びつき中死亡・UFO捕獲/憑依の回帰。
- 既存ガチャとリーダー切替・放流/死亡個体ID永久離脱・旧4/5体セーブ互換の実行試験。画面、セーブ、世界時計に変化がないこと。
- Android JSONのダウンロード／読み込みと世界年表は別件のまま検証待ち（00分担当、save-backup.js/world-history.js/game.js）。

## 残件（優先順位を下げても破棄禁止）
- 40分担当：雪／地表チャンク接合のシームレス化、30種固有3D/モーション、UFO/怪異/大型存在のAI体感改善。
- 20分担当：地形標高・水源・林山岳境界APIとの連携、通行・生態適合。
- 00分担当：旧セーブ保護、JSON復元検証、年表実動作確認。

保護条件：常に最新main/blob SHAが起点。ROADMAP.md、UI/HTML/CSS、永久死亡/放流ID、旧生存4/5体は変更しない。旧バージョンへの巻戻しとforce pushは禁止。
