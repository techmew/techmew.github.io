# OTODAMA∞ — v0.9.1 (2026-10-26)

**Game:** https://techmew.github.io/games/otodama/

声の特徴（音量・音程・響き・リズム・安定・息）からキャラクターを生成するブラウザゲーム。マイクがなくても試用キャラで遊べる。声の録音は本人が許可した場合のみ行う。

## 現在遊べる内容（COM）

- **連続ステージ:** 結果画面から「次のバトルへ →」。敵の名前・外見・属性・能力がステージごとに変化。5戦ごとに強敵、10戦ごとに伝説の敵。敗北後も新しい敵に進む。進捗はブラウザ保存。
- **プレイヤーの判断:** 敵の攻撃タイミングに合わせたジャストガード、成功すると次の自分の攻撃にカウンター補正、連続成功で補正が上昇。声に応じた固有必殺技、攻め・バランス・守りの切り替え。キーボード Space/K/1/2/3 対応。
- **演出と音:** Web Audio合成の自作BGM、ステージ・HP危機でテンポ/旋律変化。BGMとSE音量を個別設定。録音済みの声を戦闘中に再生。敗者の爆散、勝者の名前と WIN❗️表示。
- **長期要素:** 経験値・レベル・連勝、種族図鑑、日替わりボス、属性相性。保存はローカルストレージ（ブラウザ削除で消える）。
- **キャラ生成:** 12種族・多部位の外見組み合わせ、名前3,355万通り以上。組み合わせ数は種類の乗算であり、必ず異なる見た目が出る保証ではない。

## オンラインの現状とプライバシー

- Cloudflare Workers + SQLite-backed Durable Objects の招待ルーム・ランダムマッチ用コードと模擬テストは用意済み。**Cloudflare公開・実際の2端末接続は未完了。**
- オンラインは**事前にサーバーが計算した戦闘結果を双方で再生する試作版**。COM戦のジャストガード・必殺技はオンライン勝敗に影響しない。リアルタイム対戦は次期開発課題。
- 自分の録音音声を対戦相手に送るかは**初期OFFのチェックボックスで明示的に選択**。相手音声のミュートも可能。サーバーは音声を永続保存しないが、送信先の端末での複製を防止できない。
- 240件の禁止表現とURL・連絡先の簡易検知、表記正規化をオンライン名・タイプに適用。サーバーで能力値を再計算し、未知の属性を置換、連続送信を制限。**録音音声の発話内容は自動審査されない**。フィルタの誤検出・検出漏れは残る。
- 声の特徴量自体はクライアント申告で検証できないため、競技ランクや賞金戦には利用しない。

## テスト

```sh
cd games/otodama
node --check worker.js
node test-ui-source.cjs
node test-matchmaker.cjs
node test-room.cjs
node test-moderation.mjs
```

上記は構文・静的・模擬通信テスト。別途、Chromiumのモバイルエミュレーションで連続バトルとUIを確認。Android実機マイク/BGM、Cloudflare本番、2端末オンラインの動作は未確認。

## デプロイ

`.github/workflows/deploy-otodama-worker.yml` はGitHub Actionsに配置する。GitHubリポジトリに `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` をActions Secretsとして登録して手動実行。`DEPLOY_GUIDE.md` を参照。認証情報はコードに記録しない。デプロイ後のWorker URLを `DEFAULT_SERVER_URL` に設定すると一般ユーザーがURL入力不要になる。

## ファイル

- `index.html`：ゲームUI・描画・戦闘・Web Audio・ローカル保存
- `worker.js`：Cloudflare Worker + Durable Objects（Room/Matchmaker）
- `moderation.js`：オンライン公開テキストの禁止語・個人情報判定
- `wrangler.jsonc`：Worker設定
- `test-*.cjs`, `test-moderation.mjs`：模擬テスト
- `PROGRESS.md`：毎時開発ログ・次回引き継ぎ

開発範囲は `games/otodama/` と専用の `.github/workflows/deploy-otodama-worker.yml` のみ。既存の他ゲームやブログを変更しない。
