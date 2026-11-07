# 2026-11-07 20:57 JST | DEBUG QA isolated launch
PHASE=A_FEATURES。通常セーブとデバッグセーブの混在を禁止するユーザー最優先依頼。
実装：debug-storage.js 新設（head内で最初に読み込む）。URL ?wr_debug_sandbox=1 のときのみ、通常localStorageを1回読み取り複製し、全ゲーム読み書きをこのタブのsessionStorage上の隔離ストレージへ転送。隔離失敗時は実行不可（fail closed）。通常の保存領域を書き換えない。
実装：debug-mode.js に設定ごとの「開始時に適用」ON/OFF（緑の選択表示・一覧）、専用「デバッグモードでプレイ」ボタン、選択設定の起動時適用、デバッグ中表示、通常モードでの直接QA操作禁止、解除で通常URLに戻る処理を追加。
実装：game.js に隔離環境限定 startDebugPlay()。旧正常セーブや現行rosterを隔離コピー上で使用、保存がないときも独立テストゲームを開始。デバッグ時のみ時刻逆行による自動保存拒否を緩和。index.html はhead先行読込＋キャッシュ更新。
コミット：a511d96（隔離モジュール）→0ce9f154（エンジン起動）→08875d48（デバッグUI）→cc8d5559（script有効化）。
検証済：JS構文（game/debug/storage）、隔離ストレージの標準読込・書込・削除・クリア・再読込・通常保存無変更（モック）、GitHub最新blob再取得、UI/セーブ以外の既存ファイル変更なし。Chrome/Android実機、ブラウザ画面のON表示・ゲーム起動・設定適用・非混入のE2Eは未検証（検証待ち）。
次40分：Androidで設定ON→デバッグ専用プレイ→HP/天気/レベル/世界年→終了→通常再開、双方セーブ独立をE2E検証し不具合を実修正。対象debug-mode.js、debug-storage.js、game.js、index.html。ブラウザ起動不能なら即修正。
00分検証待ち：Android JSONバックアップ/読み込み、年表と旧SAVE_SCHEMA2・死亡/放流永久ID・旧4/5体・roster.leaderId。対象save-backup.js/world-history.js/game.js。
20分未完：右側川の上流/山林境界と実地形/AI。対象mountain.js・地形API。
40分未完：雪/地表シームレス、全30種固有3D・顔座標・UFO/怪異、4人協力プレイ実接続（サーバー未設置）、現行仕様の一括完成。
回帰必須：最新main起点、2a8b20e7は機能保護基準。タイトルの動物3枠・直下の続きから、見出し非表示、JSONバックアップ/リスク説明、編成ガチャ上部2ボタン、3体所有＋旧4/5体生存者、死亡/放流永久ID、年表、世界0年08時、現行UI配置を保持。ROADMAP.md編集禁止。
