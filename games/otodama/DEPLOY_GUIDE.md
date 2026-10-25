# OTODAMA∞：無料オンライン対戦サーバー公開

GitHub Pagesはフロントエンドのみ。サーバーはCloudflare Workers + SQLite-backed Durable Objectsを使用します。

## 一度だけ行う認証設定
1. Cloudflare無料アカウントを作成しWorkersを利用可能にする。
2. CloudflareダッシュボードでAccount IDを確認し、Account API Tokenを「Edit Cloudflare Workers」かつ対象アカウント限定で発行。
3. GitHubのtechmew/techmew.github.io → Settings → Secrets and variables → Actionsに以下の2つを登録する。
  - CLOUDFLARE_ACCOUNT_ID
  - CLOUDFLARE_API_TOKEN
4. GitHub Actionsの「Deploy OTODAMA Worker」→ Run workflowを実行する。
5. デプロイログに出た https://...workers.dev のURLで /health を開き、ok:trueかつrandomMatch:trueを確認する。
6. ゲーム https://techmew.github.io/games/otodama/ の「対戦サーバーURL」にそのworkers.dev URLを設定する。双方が同じURLを用いればランダムマッチ/招待ルームが動作する。
7. URLが確定したらindex.htmlのDEFAULT_SERVER_URLに設定してGitHubへ再公開すれば、プレイヤーの手入力は不要になる。

秘密のAPI Tokenをソースコード・Chat・READMEに貼らないこと。

オンラインの現仕様はサーバー裁定のバトル結果を双方で同期再生する方式。COM戦のジャストガード・必殺技は**対人戦に未対応**。Cloudflare上での実戦は、別の2端末でのテストが必要。無料枠を超えると処理が失敗する可能性あり。
