# 20分枠 生態系移動更新 2026-11-05 22:24 JST
PHASE=A_FEATURES
実装コミット dcc4e18d6062f3d6a4f798bbc295dcccee358877
対象 era-ecology.js / migration(): 餌資源と捕食圧で移動方向を決め、冬季の群れ密度を抑制。既存の地域間移動倍率APIと8地域を維持。UI/HTML/CSS/ROADMAP.md不変更。
構文・64ケースの移動倍率検証 PASS。実ゲーム動線、旧SAVE_SCHEMA2、Android実機は未検証。
次担当: game.js の既存WildEraEcology.migration呼び出しによる遭遇密度への反映を実プレイで確認。00分はセーブ回帰、40分は移動中群れの描画を確認。
