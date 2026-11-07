# 2026-11-08 00:10 JST / 40分担当 / ジャンプ＋飛びつき、ペンギン滑走頭突き＋高速嘴連撃
PHASE=A_FEATURES。作業基点は実行直前の最新main（開始時HEAD 98489ae6）。旧コミット・退避ブランチからの上書き・force pushは禁止。ROADMAP.md変更禁止。

## 本枠実装・実コードSHA
- game.js: a5d4f278（現行ファイルへ最小差分）: 既存11種の空中飛びつきプロファイルを活用し、ジャンプ＋飛びつきの両順入力で空中判定に接続。ペンギンの□飛びつきを衝突判定付き滑走頭突きに変更。通常攻撃で4連追加嘴打、滑走接触後に6連追加嘴打。連撃は49ms刻み・敵距離/遮蔽物/高さ/所有個体一致を毎打確認、滑走終了後も正当に届く範囲だけ継続。
- game.js: 4d2aad2b: L＋Shiftの同時押しを両順序で受理（最初のShiftを105ms遅延してジャンプ入力を優先）。スマホ×＋□は両順入力で即時発動、離した際に地上ダッシュを誤発動させない。resetControlsでトークンをリセット。
- game.js: 6aba1015: ペンギン2D頭・目・嘴の同一剛体移動と滑走姿勢を同期。
- webgl3d.js: 0fa1b893: ペンギンの滑走姿勢と頭部・目・嘴を一体移動。49ms連撃の視覚信号はbeakVisualを使用。
- gamepad.js: 4a81ff01: ×/A＋□/Xの両順ボタン入力を飛びつきに接続。□/Xを離した時の重複発動を抑止。
- index.html: 7f75ac71: PC/スマホ操作説明・2つのボタンaria-labelを具体化し、3つの更新JSキャッシュrevを更新。他のレイアウト/配色/セーブに変更なし。

## 動作・回帰試験
- JS構文: game.js, webgl3d.js, gamepad.js, squad-core.js, save-backup.js, world-history.js合格。変更されたblob再取得は一致。
- 11種の空中急襲プロフィールは、cat/manul/fox/tibetanFox/wolf/dog/wildDog/lion/tiger/cheetah/hyena。リーチ/跳躍/威力が有限正数で、ペンギンは空中急襲に含めない。
- ペンギン連撃の隔離ロジック：6回ヒット（重複7回目なし）、距離外で0回、リーダー交代/owner不一致で中止、合格。
- WebGLペンギンの姿勢・嘴動き5条件で15個の3D要素すべて有限座標。WebGL実機描画・FPSは未検証。
- game.jsではsaveAuto/SAVE_SCHEMA/旧5体保護/死亡・放流ID/年表・バックアップ・ガチャ処理を修正していない。全端末E2Eは未検証。
- 検証待ち：Android実機で×→□/□→×、A→X/X→A、Shift→L/L→Shift、ペンギン□・△連撃、地形衝突、長時間連打、WebGLとCanvas描画/FPS、通常/QAセーブ隔離。

## 次枠へ継続する未完項目（消してはならない）
40分担当：雪・地表チャンクの接合/描画密度/全30種専用3Dと顔座標/大型存在UFO・怪異AI。対象webgl3d.js、game.js、ufo-events.js、apparitions.js。4人協力プレイは通信基盤だけでサーバー/マッチング/同時表示/救助統合が未完。対象online-coop系＋game.js。今回の入力連携のAndroid E2Eは検証待ち。
20分担当：林と山岳境界、右側川の上下流、段差・水判定・動物移動。対象mountain.js・地形AI。
00分担当：Android JSONバックアップ入出力、年表、SAVE_SCHEMA2、旧4/5体・leaderId、死亡放流永久IDのE2E、デバッグセーブ隔離検証待ち。対象save-backup.js/world-history.js/game.js。
恒久保持：タイトル3枠直下の続きから、バックアップ/リスク説明、ガチャ上部2ボタン、所有3体（旧4/5生存者を保持）、年表、明示新世界0年8時、通常プレイとQAセーブ分離。ROADMAP.md編集禁止。
