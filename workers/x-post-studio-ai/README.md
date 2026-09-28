# X Post Studio AI Worker

X Post Studioの文章校正・構成3案・コンプラチェック・絵文字調整・関連ハッシュタグ生成をCloudflare Workers AIで処理するWorkerです。

## このリポジトリでCloudflareへ接続する場合

Cloudflare Workers Buildsの設定を次のようにします。

- Production branch: `main`
- Build command: 空欄
- Deploy command: `npx wrangler deploy`
- Root directory: `/workers/x-post-studio-ai/`

Cloudflare Dashboard上のWorker名は現在 `techmew-github-io` なので、`wrangler.jsonc` の `name` も同じ値にしています。

別のCloudflare Workerへコピーして使う場合は、`wrangler.jsonc` の `name` をCloudflare Dashboard上のWorker名と一致させてください。

## Workers AI

`wrangler.jsonc` に以下のAI Bindingを設定済みです。

```json
"ai": {
  "binding": "AI"
}
```

Dashboardで手動追加する必要はありません。Cloudflareがこの設定を読み取り、Worker内では `env.AI` として使用します。

## モデル

`@cf/zai-org/glm-4.7-flash`

日本語を含む多言語の文章処理向けに利用しています。

## API

### GET

Workerの稼働確認。

### POST

```json
{"action":"ping"}
```

または

```json
{
  "action": "compose",
  "text": "投稿したい元文章",
  "emojiLevel": "medium",
  "plan": "free"
}
```

- `emojiLevel`: `high` / `medium` / `none`
- `plan`: `free` / `long`

## X Post Studio側

デプロイ後に表示される `https://xxxxx.workers.dev` をX Post Studioの「AI接続」に保存し、「接続テスト」を押します。
