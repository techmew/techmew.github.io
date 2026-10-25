# OTODAMA∞ — v0.8 (2026-10-26)

**Play:** https://techmew.github.io/games/otodama/

声の音量・音程・響き・リズム・安定度・息成分から、キャラの外見・能力・声の必殺技が生成されるブラウザゲーム。著作権上、文字ブレード等の既存ゲームの資産は利用していない。

## v0.8で追加・統合

- v0.7開発版のジャストガード、声の必殺技（共鳴60消費）、攻め・守り・バランス切替、レベル・XP・連勝記録を公開版へ統合。
- 日替わりボス：日付で敵と強さを決定し、初回勝利で追加3XP。ブラウザ単位のローカル保存。
- 12種族の発見図鑑、発見履歴をブラウザに保存。
- 10属性の相性（有利:攻撃+12%、不利:-10%）を操作型COM戦に導入。
- マイク録音と停止、攻撃時の録音再生、小さめの戦闘音量設定、敗者の爆散と勝者WIN演出を維持。
- Cloudflareの対戦サーバーを更新：クライアント申告の戦闘能力値は無視し、範囲内の声特徴量からサーバー側で基礎値を再計算。待機タイムアウト、音声一回送信制限。
- GitHub ActionsによるCloudflareデプロイ手順・運用上の注意を準備。

## 対戦モードの現在の制約

- **COM / 日替わりボス:** 操作型の戦闘。ジャストガードや必殺技で結果が変わる。
- **オンライン:** ランダムマッチングと招待ルームのサーバー実装はあるが、Cloudflare Workers上の公開は未完了。現在はサーバー側で事前に計算した戦闘結果を両者で再生する「同期観戦方式」。ジャストガード等のリアルタイム対人戦は未完成。
- 音声はゲーム参加時に相手へ一時転送。サーバーでは永続保存しない。ただし送信後の相手端末での取扱いまでは制御できない。
- 声の入力情報そのものが真実かどうかはまだ確認できない。競技ランクマッチや賞金戦には使わないこと。

## 無料オンラインのデプロイ準備

1. Cloudflareアカウントの無料Workersプランを用意する。
2. CloudflareのAccount API token（Edit Cloudflare Workers権限・該当アカウントのみ）とAccount IDを取得する。
3. GitHubリポジトリ `techmew/techmew.github.io` の Settings > Secrets and variables > Actions に `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を**シークレットとして登録**する。どのソースファイルにも貼らない。
4. GitHub Actionsの `Deploy OTODAMA Worker` を手動実行。`games/otodama/wrangler.jsonc` を用いてWorkerをデプロイする。
5. 出力された https://...workers.dev のURLを、ゲームの「対戦サーバーURL」に設定する。同じURLを用いれば2ブラウザでランダムマッチと招待ルームを試せる。
6. 公開URLが確定したら `index.html` の `DEFAULT_SERVER_URL` に設定してGitHubへコミットすれば、一般プレイヤーはURL入力不要。

⚠️ **認証設定が未完了のため現在はサーバー未公開。** このREADMEやワークフローの存在だけでオンライン対戦成功とはみなさない。Cloudflare無料枠は無制限ではなく、超過すると処理が失敗することがある。

## ローカルテスト

```sh
node --check worker.js
node test-matchmaker.cjs
node test-room.cjs
# ブラウザ上ではマイク許可のためHTTPS/localhostで開くこと
```

## 主なファイル

- `index.html`: ゲーム本体
- `worker.js`: Cloudflare Workers + SQLite-backed Durable Objects（Room, Matchmaker）
- `wrangler.jsonc`: Worker設定・2つのSQLite DOマイグレーション
- `package.json`: Wrangler開発・デプロイ
- `test-matchmaker.cjs`, `test-room.cjs`: Nodeで動作する小規模プロトコルテスト

## 次の開発優先順位

1. Cloudflare接続認証→デプロイ→独立した2ブラウザ/2端末でオンライン戦の実接続検証。
2. 結果再生方式から、サーバー裁定のリアルタイム入力同期（ガード・必殺技・回避）へ置き換える。
3. キャラ外見と動作のさらなる差別化、演出のフレームレート最適化、音声保存の耐久性を改善。
4. レート制限、音声真正性対策、通信切断・復帰、戦績認証の実装後にランクマッチ。

誤報防止: ソース保存、構文テスト、模擬通信、ローカルブラウザ確認、公開サイト反映、Android実機確認、2端末オンライン実戦を別々に報告する。