# 2026-11-05 21:40 JST — 40分担当
PHASE=A_FEATURES / commit 780b2d02850fcdf656589d9cae2c5328ad2ac1cc
実装: webgl3d.js drawDistinctWildlife3D に armadillo（甲羅帯と尾）、hedgehog（針毛）、hyena（肩高と斑点）の専用3D形状と移動連動の脚を追加。animal() から呼出。UI/HTML/CSS/ROADMAP/セーブ/所有・放流ロジック変更なし。
検証: 最新main blob SHA 275843e41f955a617d7cdc1317ee6fd6a7158c1f を確認、更新直前再取得一致。JS new Function 構文PASS。実ブラウザWebGL/スマホ/旧セーブE2Eは未検証。既存セーブ形式を変更していないが実機回帰は未完。
次担当: WebGL実機で三種の描画と歩行確認。種族typeが各描画関数へ渡ることをE2Eで検証。旧4/5体保護と放流IDは別担当のロジックを維持。
