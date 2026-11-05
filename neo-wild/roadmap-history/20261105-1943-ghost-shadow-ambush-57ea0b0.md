# 2026-11-05 19:43 JST 40分担当
PHASE=A_FEATURES

新規実プレイ機能: 追跡霊(stalker)がプレイヤーの背後へ影移動して奇襲。隠れ状態・遮蔽物を判定し、壁抜け/直接重なりを防止。幻影残像と通知、7.8秒の再発間隔を付与。強霊(wraith)は接近中に持久力を毎秒4.5奪うが、遮蔽物/隠れで回避でき、HPは減らさない。既存の憑依4.8-6秒・強制徘徊・操作復帰を維持。

対象: neo-wild/apparitions.js
コミット: 57ea0b0b94877ba2ede20c25c6b1c5b4f895be5d
テスト: JS構文PASS。stalker影移動→幻影→憑依、wraithスタミナ消耗→憑依、mimic分身→憑依の各モジュール実行PASS。既存localStorageキーで保存PASS。UI/HTML/CSS/所有/放流ID/ROADMAP変更なし。
未検証: Android/Pad実機、ブラウザE2E、旧セーブの全動線。次回はNPC怪異AI・3Dの固有表現と端末試験。
