# 2026-11-20 18:10 JST — P3 水中東部遠征・陸上NPC隔離・源流危険の一体化

起点 main HEAD 0a24325b69192f39ecb54695e0a6082c712ebc35。ROADMAP-RECOVERY.md、20261115-2230-p3-weapon-scrap-arsenal.md、20261115-p3-eastern-expedition.md、直近20261120-1510/1610/1710の引継ぎ確認。対象neo-wildのみ。

## 今回の大型P3成果
既存4水中補給地点・水路グラフ・東部8陸地・武器35種を再実装せず、東部の水中探索の危険・AI・体力資源・進行を同一ゲームループで統合。魚の探索状態判定を陸8地点マスクから水中4地点マスクへ修正。魚は陸地の肉食動物AIの追跡対象から除外し、水域内に実在する肉食NPCだけを対象とした独立 aquaticEncounter を東部モジュールに実装。雨・雷雨では実在NPCの警戒/追跡状態を更新し、合流・高地源流ではスタミナを消耗。東部水路の危険・水中補給をプレイ中に案内。既存の泳ぎ深度・衝突判定・水中補給の報酬保存・2D/WebGL標識の座標を維持。SAVE_SCHEMA2や死亡/放流ID、食料庫、編成3+3、100年ボス、タイトルUIには変更なし。

## 実行した検証
V8 new Function: game.js、east-expedition.js、更新回帰の構文 PASS。
V8 production source + DOM/Canvas mock: p3-salvage-sortie-dom-regression 72 assertions PASS（追加5件は水中接続のソース経路）。
east-expedition-regression: 76 assertions PASS（8陸地・4ガチャ・保存失敗時ロールバック・気候・AI）。
weapon-arsenal-regression: 20,181 assertions PASS（35種、5レア、武器保管庫、セーブ、JSON）。
未実行: 実ブラウザ/実GPUフレーム/Android/FPS/実旧SAVE_SCHEMA2ファイル。水中AIの物理追跡とスタミナ変化は実機未検証。

## 次回P3
要実装/実検証: ランダム陸15・コイ2開始で8陸地+4水中を連続走行、地形衝突/敵AI/武器戦闘/保存・旧データ復元、2D/WebGL座標/FPSの実測。実装済み未実機検証: 今回の魚AI/水中増水と既存P3武器。V8検証済み: 72+76+20,181。P2認定0/24種、P3最優先継続。画像生成なし、停止タスク再開なし。
