# 2026-11-20 P3 東部8区域・番人群れ掃討と戦利品補給

対象: techmew/techmew.github.io main/neo-wild のみ。起点 HEAD 009bc9bc9b49b434140c7c9d16af3976bb118a0e。参照: ROADMAP-RECOVERY.md、20261115-2230-p3-weapon-scrap-arsenal.md、20261115-p3-eastern-expedition.md、20261120-p3-live-guardian-lock-fix.md、20261120-1114-p3-sortie-priority-corridor.md、20261120-0855-p3-connected-aquatic-expedition.md。既存35種、5段階抽選、東部8拠点、コイ4地点、共有240本、3+3個体ID、肉・死亡/放流台帳、100年最終ボス、既存タイトル・UI・SAVE_SCHEMA2・JSONバックアップを維持。

## 一体化した実プレイ更新
- 東門・郊外・林は単独番人。渓谷・水源では2体、雪山・洞窟では実レベルに応じ2〜3体までの、既存生態/衝突/野生NPCキャップに従う実体の群れ。条件を満たせず単独になっても実際の参加数で管理。各地域の候補種も変化。
- 生きている割当番人全員を実際の戦闘で撃破しない限り未鑑定ガラクタを鑑定・回収できない。個体が遠くへ離れても状態は保護。部分討伐は既存ワールドセーブで確定、セーブ失敗時のスコア進行はロールバック。全員の撃破で解放。
- 取得成功で地域難度と倒した数に応じた得点、HP/SP回復、現地食料の物理ドロップ、年表イベントを追加。元の武器保管庫書込みを先に確定。ワールド保存失敗では追加得点/食料/回復のみ取り消す。武器はすでに安全な共有保管庫へ入ったものとして保持、重複禁止。
- 線形に番号だけ増やすのでなく実戦闘AI、移動・衝突、2D/WebGLの番人残数マーカー、目的地のガイドに接続。ガラクタ外観/レア度は取得前に非公開。
- 旧SAVE_SCHEMA2の武器データは追加の siegeTotal/siegeDefeated がなければ0として復元。既存の討伐済み状態や食料・装備データに干渉しない。

## 今回の実行検査（V8、本物のブラウザではない）
- 変更 game.js と webgl3d.js 等の V8 new Function 構文検査 PASS。
- weapon-arsenal-regression.js: **20,181 assertions PASS**（既存の武器・保存、旧式や5段階、番人バイパス防止）。
- p3-salvage-sortie-dom-regression.cjs: **63 assertions PASS**（DOM/Canvas模擬、レベル12の雪山・洞窟番人群れの2体以上、部分撃破のロック、全員撃破と回収、食料/得点、種類別武器保管/個体装備/ボスHP/Continue/JSON）。
- p3-sortie-priority-route-regression.cjs: **38 assertions PASS**（東部経路・目的誘導）。
- 未実施: 真の Node CLI、実ブラウザの2D/WebGL描画フレーム、Android、FPS、旧SAVE_SCHEMA2の実ファイル復元。これらを合格とはしない。

## P3 残り
要実装/検査: 実ブラウザで8区域のランダム開始と実際のNPC AI・地形接触・複数番人戦、実JSONバックアップ復元、2D/WebGL投影ズレ・Android操作/FPSの計測と対処。実装済み未実機検証: 本件と既存P3東部8+水中4、武器240枠と33?ではなく35種。ソース回帰のみ検証済み。
P1保留、P2受入0バッチ/残24種。P3優先継続。停止した自動化の再開・新設なし、画像生成なし、タスク時刻変更なし。
