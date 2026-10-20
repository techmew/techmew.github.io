# X/Buffer 送信キュー — サウンドノベル専用

## Initial release candidate
- status: READY_NOT_SUBMITTED
- run: 2026-10-20 JST
- code_commit: 2468178c2f804827af6bb83de89753b804810cc9
- target_url: https://techmew.github.io/games/eleventh-witness/
- buffer_id: 未取得
- x_post_url: 未取得
- post_key: NOVEL_2468178c2f804827af6bb83de89753b804810cc9
- reason: GitHubへの保存は確認。GitHub Pagesの実配信および既存のBuffer認証経路・キュー空き枠の確認が未完了。実登録成功を偽らない。
- draft:
【新作ゲーム・試作公開】
推理サウンドノベル『存在しない11人目』第0章を実装！証拠調査・音の聞き比べ・証言への反論を遊べます。
https://techmew.github.io/games/eleventh-witness/
プレイした感想、遊びにくい点、追加してほしい演出を返信で教えてください。次回の開発で確認します。
#ブラウザゲーム #インディーゲーム

## 運用ルール
既存ブログ・炎上用Buffer予約を削除・上書きしない。無料プランの同時予約10件制限を厳守。
同一コミットを重複送信しない。Buffer IDは予約完了、実X投稿URLは公開完了として区別。未送信を次回RUNで安全に照合・再試行。
毎回の更新でゲームURL・具体的変更・コメント募集を含む独立投稿を作成する。ただしXに更新差分のない同文投稿はしない。
## 送信経路の検査（2026-10-20）
Driveの現行Buffer_GAS.txt（V10）では、READY行の判定時にPOST_TYPE=BLOG_POST・SOURCE_URLが `https://himanekoblog.hatenablog.com/entry/` で始まること・TEXTに記事URLが含まれることを必須にしている。ゲームリンクを既存キューへそのまま投入するとHOLD_INVALID_BLOG_POSTとなる。現時点ではBuffer IDは未取得。既存GASの送信処理とブログ用キューを破壊せず、ゲーム専用の正規送信分岐を検証するまでREADYにはしない。
