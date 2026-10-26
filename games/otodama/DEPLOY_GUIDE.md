# 声魂（こえだま） v0.10.17：無料オンライン対戦・月間ランキングの公開手順

**現状：ゲーム側とCloudflare Worker/Durable Objects側の実装ソースはGitHubへ保存済みですが、本番Workerは未公開です。** 本番公開・独立2端末・Android実機の動作確認はまだできていません。

## 料金
Cloudflare Workers Free と SQLite-backed Durable Objects で少人数の試作を無料公開できます。無料枠を超えると利用が制限され、無制限・無停止を保証するものではありません。継続監視して無料枠内に収めてください。

## 初回に所有者が行うこと
1. Cloudflare Dashboardで無料アカウントを作成し、Workers & Pages から **otodama-room** というWorkerを作成するか、Wrangler初回デプロイで作成します。既存WorkerへのデプロイならWorker単位のEditor権限、新規Worker作成ならWorkers製品全体のAdmin権限が必要です。広い権限を使って初期作成した場合、完了後は権限を縮小・トークンを交換してください。
2. CloudflareのAccount IDとWorkers公開に必要なAPI Tokenを取得。API Tokenはチャット・ソースコード・READMEに絶対に貼らない。
3. GitHub `techmew/techmew.github.io` → Settings → Secrets and variables → Actions に `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` をRepository secretsとして設定。
4. GitHub Actions → **Deploy OTODAMA Worker** → Run workflow。コードは `games/otodama/worker.js`、設定は同フォルダの `wrangler.jsonc`。新規SQLite Durable ObjectsとしてRoom/Matchmaker/Rankingsを登録します。
5. デプロイされた `https://<your-worker>.<your-account>.workers.dev/health` にアクセスし、`ok:true`、`version:0.10.17`、`randomMatch:true`、`seasonalRanking:true` を確認。
6. ゲーム `https://techmew.github.io/games/otodama/` のオンライン対戦欄にWorkerのHTTPS URLを設定・保存。ユーザーはランキング表示名を入力して匿名登録すると、そのブラウザのオンライン戦でランキングポイントを得られます。登録せずにゲストとして対戦することも可能ですが、ランキング対象外です。
7. サバイバル欄の「おまかせでスタート」で自動戦闘。オンライン挑戦者を受けたい時だけチェックをONにすると、対戦相手を検索し、マッチング後に **NEW CHALLENGER** を表示して実プレイヤーとのオンライン戦に移ります。現行は素体能力だけの自動戦闘で、手動操作は利用しません。

## ランキングの仕様と制限
- 「この端末の記録TOP 5」＝CPUサバイバルを含む**ローカル記録**。ブラウザから編集可能なので公的な順位に送らない。
- 「オンライン月間ランキング」＝**2人とも匿名登録済み**で、Roomのサーバーが最終HP・勝敗を確定した結果のみ。勝利は100pt＋連勝補正（最大100pt）、敗北は0ptで連勝リセット。同一2名の組合せは直近24時間で3戦まで加点。同じ試合IDを二重計上しない。
- 匿名IDはサーバー発行、ブラウザには秘密トークンを保存。アカウント連携・端末移行はまだ実装していない。ブラウザデータを消すと匿名IDに復帰できなくなる場合がある。トークンを他人に教えない。
- 別アカウントを大量に作る談合・虚偽の音声特徴量は完全に防止できない。これは賞金・競技大会レベルの本人確認／不正対策を備えたランキングではない。
- スマホのバックグラウンド再生を保証できない。端末のブラウザが停止・通信断になるとオンライン対戦は切断扱いになり得る。自動戦闘は画面を開いているときの機能。
- 録音音声の相手送信は現在停止中。サーバー側で録音発話を独立審査できるまで送受信を再開しない。ランキングには録音データを保存しない。

## 公開前の確認コマンド（Node.js 22以上）
```sh
cd games/otodama
node --check worker.js
node test-room.cjs
node test-matchmaker.cjs
node test-moderation.mjs
node test-ui-source.cjs
node test-survival-v109.cjs
node test-rankings-v109.cjs
node test-voice-rush.cjs
node test-hourly-v116.cjs
node test-hourly-v117.cjs
```

`test-rankings-v109.cjs` はNode 22の実験的内蔵SQLiteを使う**ローカル統合テスト**です。GitHubへの追加時点ではNodeでの本実行はまだ未検証。GitHub Actionsの既存自動テストは、このランキングの新規テストをまだ含みません。手動確認した上でWorkerを公開してください。

## v0.10.17 追加検証
- Roomに壊れたJSONを31回/10秒送信した場合の1008切断、8KB超UTF-8の1009切断、バイナリの1003切断を確認。
- Matchmakerに壊れたJSONを21回/10秒送信した場合の1008切断、256B超UTF-8の1009切断を確認。
- 再接続で解決済みターンが巻き戻らないこと、異なる攻撃側の命中通知を受け入れないことを確認。
- 実際のAndroid音声・Cloudflare接続は未確認。デプロイ後に別途確認が必要。

## 二端末テスト
- 異なるブラウザまたは別端末2台でランキング匿名登録（異なるID）、ランダムマッチでNEW CHALLENGERの表示、1分程度のサーバー判定対戦ができるか
- 自動ガード／回避／必殺技／覚醒、HP・残りゲージの両端一致
- 勝敗確定後に月間ランキングに勝者のみポイント反映、同じ試合が二重加算されないこと
- 15秒以内の切断復帰と15秒超過時の不戦勝、対戦相手が退出した際のスコア加算
- Androidの縦横表示・連戦・次の対戦・ミュート・ソロ録音/試聴を確認し、オンライン録音音声が送受信されないことを検証すること

---

# Cloudflare無料オンライン対戦の公開手順

GitHub Pagesはフロントエンドの配信のみです。リアルタイム対戦には、Cloudflare Workers + SQLite-backed Durable Objectsを別途公開します。

- Workerのコード: `games/otodama/worker.js`
- 設定: `games/otodama/wrangler.jsonc`
- GitHub Actions: `.github/workflows/deploy-otodama-worker.yml`

必要な作業はCloudflareの無料アカウントを作り、Account IDと編集権限に限定したAPI TokenをGitHubリポジトリのActionsシークレットへ設定することです。**API Tokenをチャットやソースファイルに貼らないこと。**

保存するシークレット名は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` です。設定後 Actions → `Deploy OTODAMA Worker` → `Run workflow` でデプロイしてください。デプロイ完了ログに発行される `workers.dev` URLで `/health` を開き、`randomMatch:true` を確認します。

公開WorkerのURLをゲームUIの対戦サーバーURL欄に設定すれば、ランダムマッチと招待ルームが利用可能です。URLをWebクライアントへ埋め込みたい場合は `index.html` の `DEFAULT_SERVER_URL` を設定してください。

v0.9.4から、ガード・回避・必殺技・戦術をサーバー裁定するリアルタイム試作コードを用意しました。ローカル模擬2ソケットテストは成功しましたが、Cloudflare実機接続と独立2端末での対戦は未確認です。遅延補正はサーバー測定RTTを最大90msだけ考慮します。v0.9.9当時は双方の許可を前提に音声転送を試作しましたが、**現行v0.10.17ではオンライン録音音声を一切転送しません**。録音音声の文字起こし・禁止語自動審査も現行クライアントでは行っていません。

## v0.9.5 再接続と公開時の確認

対戦開始時にサーバーが一時復帰トークン（128bit）を発行します。通信断から15秒以内であれば元の席へ復帰し、HP・共鳴を同期して攻撃予兆をやり直します。復帰トークンはブラウザのメモリのみで保持し、ローカル保存しません。URLクエリで一時トークンを渡すため、運用時はクエリ付きURLをアクセスログに残さないでください。ブラウザ再読み込みでトークンは失われます。明示退出では自動復帰しません。

サーバー公開後は /health を確認し、独立した2台の端末で接続・切断・15秒以内の復帰・15秒経過時の不戦勝・第三者の復帰拒否を実回線でテストしてください。本番検証前にオンライン対戦完成と表示しないこと。

## v0.9.9 実機確認の追加項目

- ランダム待機120秒の自動終了、キャンセル後の残留マッチングなし。
- 録音音声は送信許可・受信許可の値に関係なくWorkerが拒否し、相手に転送されないこと。
- オンラインの自動攻撃・防御・回避・必殺技・覚醒がサーバーで裁定され、両端末のHPとゲージが一致すること。
- Androidの縦横両画面でオートバトル・次戦・敗北停止・音量設定が正常に動くこと。
