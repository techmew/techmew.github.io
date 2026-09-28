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


## 校正v7

- 校正モデル: `@cf/zai-org/glm-4.7-flash`
- 3案生成モデル: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- 高確度のIME・音声入力誤変換をAI前に補正
- 補正済み語句がAIで壊れた場合は不採用
- 差分率、文字量、改行・段落、追加日付の品質ゲートを併用
- X Post Studio側の「フィードバック用にコピー」で再現条件をまとめて共有可能
