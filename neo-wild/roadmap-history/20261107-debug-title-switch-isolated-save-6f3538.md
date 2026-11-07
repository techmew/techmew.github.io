# 2026-11-07 | 40分担当 | デバッグ ON/OFF と通常開始ボタン統合
PHASE=A_FEATURES。ユーザー新規要件：専用「デバッグモードでプレイ」ボタン廃止、タイトルの通常開始ボタンをデバッグON中のみ「デバッグモードで開始」に変更、画面と各設定ON/OFFを明確化、OFFで通常セーブへ復帰。

## 今回の実装
- debug-mode.js: 7回タップで直接 ?wr_debug_sandbox=1 に移動し隔離保存を有効化。デバッグ専用開始ボタン撤去。デバッグ画面に緑のON表示、上部のOFF切替、各設定の role=switch/aria-checked と明確な緑ON・灰OFF、変更時の設定保存。起動時自動プレイ廃止。onGameLaunchフック後、実プレイ状態に入った際だけ ON 設定を適用。OFFで通常URLに戻る。
- game.js: タイトル「続きからプレイ」→デバッグON中「デバッグモードで開始」、新規開始もデバッグ表記。旧セーブがない場合のデバッグ用ガチャ導線を維持。launchGame成功時にデバッグ設定適用を予約（既存リーダー設定後に処理できる遅延実行）。
- squad-gacha-ui.js: ガチャ画面の2つの実開始ボタンもデバッグON中だけ「デバッグモードで開始」に変更。抽選・採用処理・リーダーと死亡放流IDロジックは変更しない。
- index.html: 変更した各JSの rev を更新、先行script debug-storage.jsを維持。他UI/CSS/レイアウト/保存構造は変更しない。
- 主要コミット: 6f3538b4（debug UI/オンオフ）、1c953098（通常開始連携）、8146db67（ON表示）、fabce32c（キャッシュ）、78fbdce6（ガチャ開始文言）、53a5053a（ガチャキャッシュ）。
- 回帰保護: 2026-11-07 2a8b20e7 は最低基準、毎回最新 main を起点、ROADMAP.md編集禁止。動物3枠と下の続きから位置・JSONバックアップ・年表・ガチャ2ボタン・所有最大3/旧4・5体・死亡放流永久ID・YEAR0 8時保全。debug-storage.jsのセッション隔離方式は今回変更なし。

## 検証状況
- 構文テスト：debug-mode.js, game.js, debug-storage.js, squad-gacha-ui.js合格。
- モック試験：通常セーブ3キー複製→デバッグ側変更・削除・新規登録→QA再読込→OFFで通常セーブ復帰。通常保存の非変更を確認。
- 差分レビュー：デバッグ・ゲーム起動最小差分、ガチャ開始文言、index.htmlキャッシュのみ。既存save-backup.js, world-history.js, webgl3d.js, mountain.jsは未編集。
- 検証待ち（40分）：Android実機でタイトル7回→デバッグON→選択ON/OFF→設定を閉じる→「デバッグモードで開始」→設定が反映→デバッグOFF→通常セーブが元通り。チュートリアル表示中の保留設定とガチャ経由開始もE2E。対象debug-mode.js/game.js/debug-storage.js/squad-gacha-ui.js。
- 検証待ち（00分）：Android JSON保存/読み込み、年表、SAVE_SCHEMA2、旧4/5体・roster.leaderId、死亡/放流永久IDのE2E。対象save-backup.js/world-history.js/game.js。
- 未完（20分）：山・右上林・右側川の水系/地形/通行同期。対象mountain.js・terrain API。
- 未完（40分）：雪/地表シームレス、30種3D固有造形・顔座標安定、UFO/怪異/巨大存在のゲーム統合、4人協力マッチングの実サーバ接続。対象webgl3d.js/ufo-events.js/apparitions.js/online-coop.js。
- 完了判定：コミット済みだがAndroid実機・Pages公開反映未確認なので今回のUI変更は「検証待ち」。確認して不具合があれば実コードで直す。
