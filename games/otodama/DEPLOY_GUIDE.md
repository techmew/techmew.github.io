# Cloudflare無料オンライン対戦の公開手順

GitHub Pagesはフロントエンドの配信のみです。リアルタイム対戦には、Cloudflare Workers + SQLite-backed Durable Objectsを別途公開します。

- Workerのコード: `games/otodama/worker.js`
- 設定: `games/otodama/wrangler.jsonc`
- GitHub Actions: `.github/workflows/deploy-otodama-worker.yml`

必要な作業はCloudflareの無料アカウントを作り、Account IDと編集権限に限定したAPI TokenをGitHubリポジトリのActionsシークレットへ設定することです。**API Tokenをチャットやソースファイルに貼らないこと。**

保存するシークレット名は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` です。設定後 Actions → `Deploy OTODAMA Worker` → `Run workflow` でデプロイしてください。デプロイ完了ログに発行される `workers.dev` URLで `/health` を開き、`randomMatch:true` を確認します。

公開WorkerのURLをゲームUIの対戦サーバーURL欄に設定すれば、ランダムマッチと招待ルームが利用可能です。URLをWebクライアントへ埋め込みたい場合は `index.html` の `DEFAULT_SERVER_URL` を設定してください。

v0.9.4から、ガード・回避・必殺技・戦術をサーバー裁定するリアルタイム試作コードを用意しました。ローカル模擬2ソケットテストは成功しましたが、Cloudflare実機接続と独立2端末での対戦は未確認です。遅延補正はサーバー測定RTTを最大90msだけ考慮します。個人の録音音声は部屋メンバーに転送されるため、同意確認を入れてから公開運用することを推奨します。
