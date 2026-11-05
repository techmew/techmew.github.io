# 40分枠 UFO吸引・離脱飛行
PHASE=A_FEATURES
実装: ufo-events.js で被吸引個体の光線内旋回・縮小とUFO離脱加速を追加。既存の捕獲・死亡・NPC除去・デバッグ即時発火ロジックを保持。HTML/CSS/UI/ROADMAP.mdは変更なし。
実装コミット: 289abb0a2e1ccaf5e0cc9ecb3d02034f4e1cc588
検査: 最新main再取得、JS構文検査。実機・描画・旧セーブE2Eは未検証。
引継ぎ: 00分担当はUFO捕獲後の死亡永続化、20分担当はNPC吸引時の野生個体削除と復帰禁止を回帰検証。
