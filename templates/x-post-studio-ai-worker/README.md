# X Post Studio AI Worker Template

X Post StudioのAI処理を自分のCloudflare Workers AIで動かすためのテンプレートです。

## ファイル

- package.json
- wrangler.jsonc
- src/index.js
- .gitignore

## 推奨セットアップ

1. 自分のGitHubに新しいリポジトリを作成します。
2. このテンプレート内のファイルを、そのリポジトリのルートへコピーします。
3. Cloudflare Dashboardで Workers & Pages → アプリケーションを作成する → Connect GitHub と進みます。
4. 作成したGitHubリポジトリを選びます。
5. Worker名は `x-post-studio-ai` にします。
6. Build commandは空欄、Deploy commandは `npx wrangler deploy`、Root directoryは `/` にします。
7. デプロイ後の `workers.dev` URLをX Post Studioへ登録します。

## Workers AI Binding

`wrangler.jsonc` にAI Bindingを設定済みです。

```json
"ai": {
  "binding": "AI"
}
```

Worker内では `env.AI` として利用します。
