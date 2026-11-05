# 2026-11-05 19:04 JST | 40分担当
PHASE=A_FEATURES

実装: 霊の描画ディテール追加、接近時4.5〜6秒の操作乗っ取りとランダム徘徊、時間経過後の操作復帰。
対象: neo-wild/apparitions.js, neo-wild/game.js
コミット: 1a97299e394c99e9d2fc3328a045256d199e8bc9 / fe86e66a6cbf1a052066944d9cf2eb08efa05ea8
UI/HTML/CSS変更なし。旧セーブ・所有ID処理変更なし。
未検証: JS構文、Android実機、長時間プレイ、他のアクション入力の憑依中遮断。次回は操作完全遮断とE2Eを確認。
