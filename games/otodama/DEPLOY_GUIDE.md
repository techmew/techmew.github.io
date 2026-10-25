# Cloudflare無料オンライン対戦の公開手順

GitHub Pagesはフロントエンドの配信のみです。リアルタイム対戦には、Cloudflare Workers + SQLite-backed Durable Objectsを別途公開します。

- Workerのコード: `games/otodama/worker.js`
- 設定: `games/otodama/wrangler.jsonc`
- GitHub Actions: `.github/workflows/deploy-otodama-worker.yml`

必要な作業はCloudflareの無料アカウントを作り、Account IDと編集権限に限定したAPI TokenをGitHubリポジトリのActionsシークレットへ設定することです。**API Tokenをチャットやソースファイルに貼らないこと。**

保存するシークレット名は `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` です。設定後 Actions → `Deploy OTODAMA Worker` → `Run workflow` でデプロイしてください。デプロイ完了ログに発行される `workers.dev` URLで `/health` を開き、`randomMatch:true` を確認します。

公開WorkerのURLをゲームUIの対戦サーバーURL欄に設定すれば、ランダムマッチと招待ルームが利用可能です。URLをWebクライアントへ埋め込みたい場合は `index.html` の `DEFAULT_SERVER_URL` を設定してください。

v0.9.4から、ガード・回避・必殺技・戦術をサーバー裁定するリアルタイム試作コードを用意しました。ローカル模擬2ソケットテストは成功しましたが、Cloudflare実機接続と独立2端末での対戦は未確認です。遅延補正はサーバー測定RTTを最大90msだけ考慮します。個人の録音音声は部屋メンバーに転送されるため、同意確認を入れてから公開運用することを推奨します。

## v0.9.5 再接続と公開時の確認

対戦開始時にサーバーが一時復帰トークン（128bit）を発行します。通信断から15秒以内であれば元の席へ復帰し、HP・共鳴を同期して攻撃予兆をやり直します。復帰トークンはブラウザのメモリのみで保持し、ローカル保存しません。URLクエリで一時トークンを渡すため、運用時はクエリ付きURLをアクセスログに残さないでください。ブラウザ再読み込みでトークンは失われます。明示退出では自動復帰しません。

サーバー公開後は /health を確認し、独立した2台の端末で接続・切断・15秒以内の復帰・15秒経過時の不戦勝・第三者の復帰拒否を実回線でテストしてください。本番検証前にオンライン対戦完成と表示しないこと。
