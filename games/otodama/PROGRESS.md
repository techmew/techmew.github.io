# OTODAMA∞ 開発継続 / 2026-10-26 v0.9.1

## CURRENT_STATUS
- GitHub main v0.8を確認後、v0.9.1をローカルで実装・テスト。GitHub反映状況は下記コミット欄を確認すること。
- 連続ステージ進行：1戦後「次のバトルへ」で新しい敵。ステージ番号・勝利数をローカル保存、5戦・10戦のボス。負けても次の相手。
- Web Audioによる自作BGM、戦闘音量・BGM個別スライダー、残HPによる緊張変化。モバイル実機音質未検証。
- 240件の禁止表現、全角半角・カタカナ/ひらがな・記号分割・伏字正規化。英単語の部分一致誤判定（grape/therapist）を軽減。URL/連絡先検出。音声の発話内容検査は未実装。
- ジャストガード成功連鎖、次の攻撃へのカウンターボーナス、キーボード操作、敵攻撃予告UI。
- オンラインの録音共有は明示的なチェックを入れた場合のみ、相手の声ミュート可能。サーバーの公開名/属性/ランク検証、WebSocket連続送信制限。
- v0.8の録音・試聴・攻撃音声・種族・図鑑・育成・日替わりボス・爆散/WIN演出を維持。

## DESIGN_DIRECTION
- 1戦を短くし、毎回違う敵と戦う。入力の正確さと技の使いどころが勝敗を左右する。
- 音声とSEを邪魔しないオリジナルBGM、敵の行動予告と反撃、ステージごとの演出変化を重視。
- オンラインではプライバシー初期保護、入力検証、無料枠内の運用を優先。

## TEST_RESULTS
- Node: `node --check worker.js`, `node test-ui-source.cjs`, `node test-room.cjs`, `node test-matchmaker.cjs`, `node test-moderation.mjs` PASS。
- Chromium mobile emulation: 初戦終了、STAGE 02、新敵、BGMスライダー、コンソールエラーなしを確認。
- Android実機、実マイク、Cloudflare本番、2端末の実オンライン対戦は未検証。

## BLOCKERS
1. Cloudflare Workerは未公開。GitHub Actions Secretsの `CLOUDFLARE_ACCOUNT_ID` と `CLOUDFLARE_API_TOKEN` を所有者が設定する必要あり。
2. オンライン対戦はサーバー事前計算の同期再生。対人リアルタイム操作判定は未実装。
3. 録音音声の自動禁止語検査は未実装。端末間で共有された録音は送信先が複製できる。
4. Android実機のBGM音質・描画性能・タッチ操作を未検証。

## NEXT_ACTIONS
1. Workerを公開して `/health` と独立2ブラウザのランダム対戦・ルームを実証。Worker URLをゲームに設定。
2. サーバー裁定のリアルタイムガード/回避/必殺技と遅延補正を実装。オンラインで入力が勝敗に反映されるようにする。
3. ステージ別の背景・障害物・敵AI/モーション・報酬の差別化、長期育成の選択肢。
4. 誹謗中傷の報告/ブロック、音声送信を取り消せない旨の表示、文字列フィルタの精度改善。
5. Android実機でBGM音量、連続戦、画面回転、低スペック描画を確認。

## GITHUB_COMMIT
- 本ファイルを含むコミットSHA: 更新時にGitHub履歴から確認すること。
- GitHubコードが正本。Driveは進捗と引き継ぎ資料の正本。

## 2026-10-26 v0.9.1 公開管理
- GitHub main コミット: 5653cdbd0f4a2da383ebedd30539403fa8db4a3e (ゲーム本体・Worker・モデレーション・テスト・ワークフローの11ファイルを一括更新)。
- 再取得確認: index.html に v0.9.1 / stageEnemy / musicTick / shareVoice、worker.js に sanitizePublicName、moderation.js、デプロイワークフローが存在。
- ローカル実行: node --check worker.js, test-ui-source.cjs, test-matchmaker.cjs, test-room.cjs, test-moderation.mjs すべて PASS（禁止語240件）。
- ブラウザシミュレーション: STAGE 01→02、別の敵、勝利表示、エラーなしを確認。Android実機音声・本番配信・外部二端末オンライン戦は未検証。
- Driveの開発資料: /OTODAMA∞_WORK開発引き継ぎ/v09/OTODAMA_v091_complete.zip にスナップショット保存。
- Cloudflare Worker: 設定とコードはGitHubにあるが、本番公開・無料枠サーバーへの実接続は未完了。Cloudflare API認証が必要。
- NEXT_ACTIONS: (1) GitHub Pages配信内容とAndroidで録音/BGM/声の再生を確認 (2) Cloudflare認証してWorkerデプロイし2端末テスト (3) 敵AI/音楽/連続バトル/禁止ワード誤判定を継続改良。
