# OTODAMA∞ 毎時開発 / 2026-10-26 06:00 JST / v0.9.7

## CURRENT_STATUS
- GitHub main v0.9.6 index.html / worker.js / wrangler.jsonc / README / PROGRESS / package / testsを実読。Drive v0.9.6最終報告を確認。ローカルv0.9.6 ZIPの主要コードblob SHAがGitHubと一致することを確認してから改修。
- 連続COMバトル、声生成/録音/試聴、育成、図鑑、6ステージ/ボス/BGM、勝利爆発/WINは維持。Cloudflareオンライン本番は未公開。

## CHANGELOG
1. ステージミッション3種類（JUST×2、回避×1、必殺×1）を循環。HUD進捗と勝利時XP +1。
2. PERFECT DODGEの次攻撃に+15%カウンターを付与。
3. STAGE 5以降、COM敵が防御傾向を読んでフェイント/共鳴吸収を選ぶ。
4. ガード成功可能時間の開始を小音量の短音で通知（ターンごと1回）。
5. オンライン録音音声が未参加ソケットへ漏れる経路を遮断。
6. オンライン戦術を攻撃ターン開始時に固定し、切り替えは次ターンから適用。再接続にも固定戦術を含める。
7. サーバーの音声隔離・戦術固定、Chromiumのミッション/回避カウンター/敵学習テストを追加。

## TEST_RESULTS
- Node: worker構文、UI構文、Room、Matchmaker、Moderation=PASS（ローカル）。
- Chromium: COM連戦・次戦強化・ボス・横画面/320px、戦術/ミッション/XP/回避カウンター、オンラインUI、復帰、保存/復元=5 suites PASS（ローカル）。
- Chromium 390pxで新しいミッションHUDをスクリーンショット確認。Android実機ではない。
- GitHubへの変更ファイルのコミットとblob再取得を検証すること。GitHub Pages実配信/Cloudflare本番/外部2端末は未検証。

## BLOCKERS
- Cloudflare Workers本番公開には所有者のCloudflare認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が必要。秘密値はコード/Driveへ記録しない。
- 録音した発話の禁止語自動審査は未実装。クライアント申告の声特徴量は改ざん可能でランク戦には利用しない。

## NEXT_ACTIONS
1. Cloudflare公開、/health、独立2端末のマッチング・復帰・不戦勝・実RTT測定。
2. COMのミッション達成率/難易度を実プレイで測定し、報酬バランス・敵学習・ボス演出を調整。
3. Android実機のマイク・音声・BGM・縦横UI・省電力検証。
4. サーバーで音声転送のサイズ/頻度制限を再点検し、オンライン荒らし対策と公平性を強化。

## GITHUB_COMMITS
- v0.9.6 baseline: 27ba78923abb7aedcdee9013849bd629841e1718
- v0.9.7 game/test source latest: 873a4ae12cf811567724fc6b015dc30245d6c141

GitHubがコード正本、Driveが引き継ぎ正本。ローカル検証と本番検証を混同しない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 05:00 JST / v0.9.6

## CURRENT_STATUS
- GitHub main v0.9.5 index.html/worker.js/wrangler.jsonc/README/PROGRESS/テストを実読し、Drive v0.9.5 RUN REPORTを確認。変更対象コードのGit blob SHAはv0.9.5 ZIPと一致。
- 連続COMバトル/声生成・録音/保存/図鑑/6ステージ/ボス/BGM/勝利爆発を維持。リアルタイムオンラインはCloudflare本番未公開。

## CHANGELOG
1. COM敵に重撃・共鳴吸収・フェイントを追加。ステージとターンで発生し、事前警告と対処法を表示。
2. 戦闘成績をS/A/B/Cで評価し、ジャスト/回避/必殺/与ダメ/被ダメを結果画面に表示。S/A勝利にXP加算。
3. 戦闘中にダメージ数値と防御成功を浮遊表示。
4. ONLINE LIVEで相手音声ミュートが効かない問題と、デコード待機中の旧対戦音声再生を修正。
5. オンライン復帰時の最大HP・回避クールダウン・必殺準備・戦術・ターン番号を再同期。
6. サーバーの終了済み一時戦闘データを削除し、保存負荷を低減。
7. Chromium新規戦術/成績テスト、サーバー終了時データ消去と復帰スナップショットの回帰テストを追加。

## TEST_RESULTS
- Node: worker構文、UI構文、Room、Matchmaker、Moderation = PASS（ローカル）。
- Chromium: COM連戦、保存/復元、オンライン模擬UI、再接続模擬、新規戦術/評価/XP = PASS（ローカル）。
- モバイル390pxの結果画面をChromiumでスクリーンショット確認。実機ではない。
- GitHubコミット・公開サイトの実配信・Cloudflare実戦・Android実機は別途検証。

## BLOCKERS
- Cloudflareアカウント認証とActions Secrets（CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN）が未設定または未確認。Worker本番公開・2端末実戦は未実施。
- 声特徴量の真正性は検証できないため、ランク戦/賞金戦は禁止。録音音声の禁止語審査は未実装。

## NEXT_ACTIONS
1. Cloudflare本番公開、/health、独立2端末のマッチング・復帰・不戦勝・通信遅延の実測。
2. ボスAIの攻撃予兆、フェイントの難易度調整、実際の継続プレイによるバランス検証。
3. Android実機のマイク/音声/BGM/縦横表示を検証。
4. リアルタイム対戦の再接続・戦術UIを実回線で検証し、負荷と安全性を調整。

## GITHUB_COMMITS
- v0.9.5 GitHub main baseline: `45e2e6c0539e7d80abc0fa56c9e92b9f5f6bdfce`。
- v0.9.6 UI: `dc37fbea850240f869a4d2fd5a5d5e7845c686d7`。
- v0.9.6 Worker: `6bf03b1d819a9c904ece2df48df9be9eb5a99ef3`。
- v0.9.6 テスト追加・改修後の最終コード: `3c8196e5f3f7c732364081fd30ec065f914cbb24`。
- GitHub Pagesの実配信/Cloudflare本番は未確認。

GitHubがコード正本、Driveが引き継ぎ正本。ローカル検証と本番検証を混同しない。


---

# OTODAMA∞ 毎時開発 / 2026-10-26 04:00 JST / v0.9.5

## CURRENT_STATUS
- GitHub main v0.9.4 の index.html、worker.js、wrangler.jsonc、README、PROGRESS、テストを実読。Drive v0.9.4報告も確認。主要ファイルのGit blob SHAとDrive最終ソースZIPが一致した状態から改修。
- COM：声生成・録音・試聴、連続ステージ、図鑑、育成、6環境、ボス、ジャストガード/回避/必殺技/戦術、爆発/WIN演出を維持。
- Online：サーバー裁定の対戦は未デプロイ。15秒再接続猶予・128bit復帰トークン・HP/共鳴の再同期を追加。Cloudflare本番/独立2端末未検証。

## CHANGELOG
1. 対戦中切断で即不戦勝を廃止し、15秒復帰猶予。元の席・HP・共鳴を復元し、新しい攻撃予兆で同期再開。第三者の無効復帰トークンを拒否。
2. クライアントは切断後最大4回自動再接続。復帰時にHP・共鳴・戦闘UIを再同期。相手の接続待ちを通知。
3. サーバー900ms予兆とガード/回避UIを一致。命中演出をサーバー判定到着時に同期。古いターン応答を無視。
4. キャンペーンは勝利でのみ次ステージへ。敗北後は同ステージで新しい敵に挑戦。試行回数を保存/バックアップへ追加。
5. HP35%未満でジャストガード成功時、COM戦1回限りの逆転共鳴+25。
6. 6ステージ別BGMモチーフとフレーズ変化、BGM音量の端末保存。
7. サーバー/クライアントの再接続、敗北後新敵、保存、縦横画面の自動テストを拡張。
8. 対戦前の入退室でWebSocket接続順とプレイヤー席順がずれる問題を修正。常にseat順でサーバー対戦開始し、入れ替え回帰テストを追加。

## TEST_RESULTS
- node --check worker.js、node test-ui-source.cjs、node test-matchmaker.cjs、node test-room.cjs、node test-moderation.mjs：ローカル PASS。
- python test-gameplay-browser.py：ローカル Chromium PASS（勝利進行/敗北後の別敵/次戦強化/ボス/音量保存/縦横/320px）。
- python test-live-browser.py：ローカル Chromium PASS（モックWebSocketのオンライン操作UI）。
- python test-save-browser.py：ローカル Chromium PASS（試行回数のバックアップ復元/異常JSON拒否）。
- python test-reconnect-browser.py：ローカル Chromium PASS（モックWebSocketの復帰/HP・共鳴同期）。
- Cloudflare本番デプロイ、外部2端末接続、Android実機のマイク・録音声・BGM・操作：未確認。

## BLOCKERS
- Cloudflare Workers + Durable Objects公開には所有者側のCloudflare認証とGitHub Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が必要。秘密値をコード/Driveに保存しない。
- 復帰トークンはWebSocket URLクエリで送信。公開時にクエリ付きURLをログに記録しない。ブラウザ再読み込みではトークン消失。
- クライアント申告の声特徴量の真正性は証明できない。ランク戦利用不可。録音音声の禁止語自動審査は未実装。

## NEXT_ACTIONS
1. Cloudflare認証後Worker公開、/health、ランダム/招待、独立2端末、15秒以内復帰、猶予超過不戦勝、第三者復帰拒否を実回線で検証。
2. 通信品質・再接続レース・RTT補正・命中演出を実端末で調整。認証と荒らし対策を強化。
3. COMのボス固有AI/戦術/難易度を実測調整。BGMミックス・SE・描画を最適化。
4. Android縦横/実録音/声再生/ミュート・省電力を実機確認。

## GITHUB_COMMITS
- v0.9.4既知主要コミット：21271daefcf4b438edc3d25b66d7dcf9ff87c2c0
- v0.9.5 worker: 11560e90ff987cbd4ec827addcbce5e0877f2bef
- v0.9.5 HTML: 10151f9d8101fcc95f53a782991521c29448ea69
- v0.9.5 seat-order fix: a904f1b8c7f4b7556f3346f5a8dfb2065fe36f67
- v0.9.5 seat-order regression test: 70b148f308e465d71eb71fd926bbd10b8d728160

GitHubがコードの正本。Driveが引き継ぎ・進捗の正本。ローカル検証と本番公開を混同しない。
