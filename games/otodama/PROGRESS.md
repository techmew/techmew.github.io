# 声魂（こえだま） / v0.10.9 / 2026-10-26　放置サバイバル・アーケード乱入・オンラインランキング準備

## CURRENT_STATUS
- GitHub main の `games/otodama/` のみ編集。声魂（こえだま）と従来のCOMキャンペーン・声生成/録音停止/試聴/攻撃時声再生・外見/名前・育成・セーブ互換・敗者爆発とWINは維持。
- サバイバル（負けたら1回の挑戦終了）、AUTO/MANUAL切替、各戦の自動進行、端末内ポイント/自己ベスト/TOP5、任意ONのオンライン挑戦者受入とNEW CHALLENGER表示を実装。
- Cloudflare Rankings Durable Object（SQLite）の匿名登録/トークン検証/サーバー確定オンライン勝敗だけの月間ランキング、二重計上・同一相手の24時間3戦上限、招待・ランダム・途中切断のRoom結果記録を追加。
- **本番Workers未デプロイ。** Cloudflare認証情報未接続。従ってオンライン対戦/全ユーザー共通ランキングはまだ利用可能と確認できない。

## CHANGELOG
1. サバイバル開始時に自動操作ON、相手の予兆に合わせた自動ガード/回避/タイミング攻撃/特別な技を追加。人間がボタンやキーボード操作した時はAUTOをOFFへ切り替え、いつでもONに戻せる。無敵ではなく一部自動入力は失敗する。
2. サバイバル1勝ごとに異なるCOM敵へ連続進行、勝利時ポイント加算・敗北でゲームオーバー。自己ベストと完了ランの端末内TOP5をローカル保存。COM冒険のstage進捗とは分離し、既存モードの機能を保持。
3. 希望時のみマッチング検索（デフォルトOFF）。サバイバル中にマッチするとNEW CHALLENGERのアーケード風表示からオンラインのリアルタイム対戦へ。相手が見つからない場合は従来のCOM自動戦を継続。120秒待機切れ時は前面可視かつ許可中に再検索。
4. GitHub Pages画面にランキング用匿名登録/上位順位表示UIを追加。オンライン登録を選んだブラウザだけ秘密トークンをローカル保存し、招待/ランダムRoomへ安全なWebSocketで渡す。
5. WorkerにRankings Durable Object、wrangler.jsoncにSQLite class/bindingとv3 migration。勝敗/獲得ポイントはRoomだけが報告し、外部HTTPのスコア自己申告はルーティングしない。匿名IDはサーバー生成、秘密トークンはSHA-256で照合。別登録2名の試合のみ月間ポイント化。勝利100＋連勝10〜100、敗北0。同一試合のリプレイ拒否、同一対戦組合せ24時間3戦の加点上限。SQLite登録上限300件/時（全体）。
6. Roomの順位トークン検証は非同期のため、seat占有を検証後に再確認して二重着席の競合を防止。切断不戦勝のスコア反映と結果フラグ、HTTP JSON中継も補強。
7. test-survival-v109.cjs、test-rankings-v109.cjs(Node22 SQLite)、既存 test-room/test-matchmaker のexport互換修正、旧V8回帰テストのバージョン表記を更新。DEPLOY_GUIDE/READMEに公開手順と弱点を明記。UI/Worker/packageをv0.10.9に統一。

## TEST_RESULTS
- GitHub connectorで取得した現行mainのHTMLインラインJavaScriptおよびWorker JavaScriptをV8構文評価 PASS。各更新コミット後に再取得してcontent/blob SHA一致。
- V8で偽DOM/タイマーを使ったサバイバル開始・AUTO初期ON・敵の入れ替わり・勝利220pt・最高記録保存・敗北でゲームオーバー・再挑戦で0ptに戻る・MANUAL切替でタイマーキャンセル等を模擬確認PASS。
- RankingsクラスをSQLite API相当のメモリモック・偽HTTP/暗号APIで実行。匿名ID2名登録、トークン検証、勝者3戦で360pt、敗者3敗、同一試合IDを拒否、同一相手4戦目の加点拒否、順位出力PASS。
- **正式Node test-survival-v109.cjs / test-rankings-v109.cjs、Node全スイート、Chromium実プレイ、Android実機、Cloudflare Workerと実SQLiteの挙動、外部2端末/本番ランキングは今回未検証。** V8のモック成功をこれらと混同しない。
- GitHub Pages Actionsの実デプロイ成功は別途確認する。Cloudflareはまだ公開していない。

## BLOCKERS
- Cloudflare Worker作成・アカウント所有者認証とGitHub Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKENが必要。秘密をチャットやGitHubソースに貼らない。
- ブラウザが停止した場合の完全放置/バックグラウンド対戦は保証できず、WebSocketの切断が発生する場合がある。
- 複数匿名アカウントでの談合、録音声特徴量の不正、同じネットワークの繰り返し接続は完全には防止できない。賞金レベルの競技ランキングには適用しない。
- 音声そのものの自動文字起こしや有害発話検知は未実装。プライバシー同意OFFがデフォルト。

## NEXT_ACTIONS
1. Node.js 22で test-survival-v109.cjs/test-rankings-v109.cjsを含め全ゲーム/サーバー回帰テスト実行。Chromiumでサバイバル10+戦、手動介入、敗北、スマホ縦横・録音停止・音量を検証。
2. Cloudflare FreeのWorkerを所有者が作成し権限を絞ったAPI TokenとAccount IDをGitHub Actions Secretsへ登録。専用Deploy workflow実行、/healthとランキング匿名発行/読み取りを確認。
3. 別端末2台でランダム/招待/NEW CHALLENGER/自動・手動操作/切断復帰/録音同意/勝敗のHP同期/ランク加点と重複拒否を検証。
4. 放置中のゲーム速度・難度・ポイント増え方と、ランダム待機120秒切れ再検索のユーザー体験・無料枠消費を実測。セキュリティ対策（登録スパム、匿名多重ID）を段階的に強化。

## REFERENCE_COMMITS
- Survival UI: 8faa2ae7e0f89852daa86fe91d2d7322e0721587
- Survival gameplay: 3795df8628bf7009a43e0734f6d9d2455ebd6274
- TOP5 and manual override: 4bcafba717a9d9bdc4f3fedfffd49e38c63b73a1
- Ranked Durable Object: 6e32b1b368edae10aefb349b31175774b8b24033
- Wrangler binding: 076ea1e94314e196f8b345199d808658816e07a7
- Ranking UI: 846c56820436aca47841fd2ea026d9deb92e7b1d
- Seat capacity/race fix: dbe1596444ba2beda296f8bcb712f9d28a9b5d29
- User opt-in queue retry: de81b3f5be8ea6c6de895709ab7348f1b8bc4aa6
- Node SQLite regression source: 687a46a796cf18fdb4bdb96d735c38638f9a560b
- Survival V8 regression source: 8f7079e74cf48521c3e56698ab7510d59b191f56
- Worker HTTP/forfeit: ad8111c490624e74d1517bf097053da547cce246
- Versions: index 8c7493a11ebd19f3645418c725f3355ed327ade7, Worker f3c83917ee13ee1439f58d347f7c73556e1c4926, package e92402c08f87d2e41591c2732de0b000ed5cf6fa
- Deployment instructions: 21a2445a4b3c46058d2588e20dae89609e2022d3
- README: 86995909c520daae6647cc1e05a1031904b84406

---

# 声魂（こえだま） / v0.10.8 / 2026-10-26　連戦・戦術報酬・音楽・接続保護

## CURRENT_STATUS
- GitHub main の games/otodama/ のみ更新。旧OTODAMA_SAVE、声生成/録音停止・試聴/攻撃時再生、33,554,432種の内部名・外見組合せ、COM連戦、敗者爆発/破片/WIN、育成、オンライン試作を維持。
- Cloudflare Workerはソースのみで本番未公開。GitHub Pages公開URLの実動作、Android実機、外部二端末も未検証。

## CHANGELOG
1. ステージミッション16→20種類。STAGE17〜20にガード3連続/回避3回/必殺3回/反撃3回を追加。勝利時は次ステージ・次の相手へ進む。
2. COM勝利時、ガード/回避合計2回以上・被ダメージ4以下の「完璧防御」+1XP。報酬欄と戦績に表示。
3. 自作Web Audio BGMの4小節フレーズを8段階で変化。32小節の展開を追加。ミュートON時に既存再生を停止/AudioContextを一時停止、OFFで再開を試行。
4. 部屋未参加WebSocket・検索未開始WebSocketの30秒期限。次の接続時に古い接続を回収し、期限後のjoin/searchを拒否。対戦中/検索待機中のソケットは対象外。
5. /healthとエラーJSONにCache-Control: no-store。次ステージ予告・報酬欄にaria-liveを追加。
6. test-quality-v108.cjs追加。test-ui-source.cjsのtrainingWindow依存漏れ、test-matchmaker.cjsの古い時刻fixture、test-quality-v106.cjsのバージョン期待値を修正。package/Worker/フッターをv0.10.8へ更新。

## TEST_RESULTS
- GitHub mainの更新index.html埋込JS・worker.jsをV8 new Functionで構文評価PASS。
- V8の模擬Node環境で test-ui-source / test-quality-v106 / test-naming-v107 / test-quality-v108 / test-room / test-matchmaker / test-moderation の7スイートPASS。Room 98 assertions、Matchmaker 18 assertions、UI 115 assertions、Moderation 46 assertions。名前の大量assertionは実操作件数ではない。
- 新しい20ミッション循環、完璧防御の成立/不成立4条件、32小節BGM変化、WebSocket期限切れで未参加/検索前のみ切断する動作をV8で確認。
- 変更した各GitHubファイルはコミット後に再取得し、書き込み結果との内容一致を確認。これはNode/Chromium本実行の代替ではない。
- 正式Node全スイート、Chromium操作、公開URLのHTML直接取得・画面操作、Android実機、Cloudflare本番、外部二端末は今回未実施。公開反映も未確認。

## BLOCKERS
- Cloudflare公開には所有者認証とGitHub Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN、Worker URL設定が必要。
- 録音発話の文字起こし・禁止語検査は未実装。ユーザー入力文字列の禁止語検査と混同しない。
- Android/外部二端末と本番ブラウザ実操作の検証環境がない。

## NEXT_ACTIONS
1. Node/Chromium正式全スイートとAndroid縦横/マイク録音/停止・試聴/保存/次戦/BGM・ミュートを実操作検証。
2. Cloudflare認証後Worker公開、/health・ランダム/招待/再接続/音声二重同意・2端末同期を確認。
3. STAGE17〜20ミッションと完璧防御報酬の難度/達成率、32小節BGMの長時間体感、端末FPSを実測。
4. 30秒未参加ソケット期限の本番Durable Objects hibernation挙動と通信混雑・切断競合を検証。

## GITHUB_COMMITS
- index.html: 90b21893256639adb39d5286b39c6747106f59c7
- worker.js: 0174ec7a70fd10f9c45a3a3d520c2a60c553bf99
- test-quality-v108.cjs: 2a668977222cf95eb75872bb8be24b679098d114
- test-quality-v106.cjs: 096802ea7c9ae0dd368c0ec53845a35925706887
- test-ui-source.cjs: b9704d800429f77f57555159e78346de8b3e2c72
- test-matchmaker.cjs: e5d6327438a2764d4392613114b4f640bf7522f1
- package.json: ff686701bcc1cdf521793ee0b555bfaf0031ee09
- README.md: c80eb82ef31211a0c1c224e12a607cf83a4a515a

---

# 声魂（こえだま） / v0.10.7 / 2026-10-26　自然な名前・表示への全面改訂

## CURRENT_STATUS
- main games/otodama/ のみ更新。ゲーム名は「声魂（こえだま）」を維持。
- 実装済みの声によるキャラ生成、録音停止/試聴/攻撃時の音声再生、外見組合せ、育成、連続バトル、ステージ進行、敗者爆発・破片・WIN、旧セーブ形式は維持。
- Cloudflare Worker/Durable Objectsはコードのみ。本番サーバーの公開・二端末対戦・Android実機確認は未完了。

## CHANGELOG
1. 自動生成名を「もも」「こむぎ」「すず」等128種類の普通の短い名前へ変更。内部名には6桁の個体番号を付け、128×262144＝33,554,432パターンを維持。画面上では6桁番号を省略し、キャラID欄を残す。
2. 保存済みローカルキャラについて、以前の生成関数と一致する旧自動名のみ新形式へ移行。レベル/XP/能力/voiceClip/seedは変更しない。意図的な手動名は維持し、保存エラーでキャラ一覧を失わないようにした。
3. 声タイプ6種と技名を直感的な「スピード型」「守備型」「連続攻撃」「強い一撃」「反撃」等に変更。内部の魂タイプ判定/戦闘倍率は変更しない。
4. ステージ6種を「空の広場」「街の屋上」「海の底」「火山の道」「夜の公園」「雪の山道」に変更。背景アニメーションの条件も同時に置換。
5. 敵7戦型・ボス名・敵技名・ミッション16種の表示・次戦強化6種の表示・章紹介を平易な日本語に改訂。内部ID/AI条件は保持。
6. SKY BRAWL等の大げさな英語表現を減らし、画面のガード・回避・タイミング攻撃と対戦案内・勝敗表示を普通の言葉へ変更。敵技/攻撃時の録音声/敗者爆散とWIN演出は維持。
7. 旧名前を期待していたテストを更新し、新規 test-naming-v107.cjs を追加。packageとWorker /healthのソース版を0.10.7に合わせた。

## TEST_RESULTS
- GitHub main埋込JavaScriptのV8構文評価 PASS。
- 名前50,000件の一意性、画面用短縮名、旧生成名の正確な判定と変換、保存音声/能力値維持、カスタム名保持、6背景名、6声タイプ、敵AI条件、音声/保存/連戦/爆発/WIN保持の合計100,033アサーション PASS（V8）。
- Canvas/Web Audioスタブによる6背景通常/省電力、ガード/攻撃表示、入力消去、命中飛散、5種のSE分岐等26アサーション PASS（V8）。
- index/README/テスト/worker/package等の各GitHub書き込みをコミット後に再取得、blob SHA一致。
- test-naming-v107.cjsや旧正式NodeテストをローカルNodeで実行した結果ではない。Chromium実ブラウザ・Android・外部二端末・公開URL直接操作・Cloudflare本番対戦も今回未実施。

## BLOCKERS
- 実ゲームの見え方、音量、Androidタッチ操作/縦横での目視確認は未実施。
- Cloudflareの所有者認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN、Workerの公開URL設定が必要。
- 録音発話の自動文字起こし・有害内容判定は未実装。名前の文字列検査とは別。

## NEXT_ACTIONS
1. 正式Node/Chromium全回帰。新規名前/旧セーブ移行、縦横表示、連続バトル、録音/停止/試聴、バトル終端、BGM、オンライン入力を実際に操作して検証。
2. 実機で生成キャラ名/技名/対戦UIの可読性、誤字、切り詰め、スクロールを確認。
3. Cloudflare Worker本番デプロイ後に外部2端末でランダム/招待/再接続/音声同意を検証。
4. 残っている過剰に演出的な説明文を実機の画面ごとに整理。

## GITHUB_COMMITS
- 名前生成/移行: dd822444d6b83291b966c0a3260140cca88295ed
- 6タイプ/6ステージ: c83856e4a14c0a8c23416b489116ad03229eefc8
- 敵/バトル技/ミッション: ae2cd6ab44b956c31b3bd31e165b4128bf36804a
- UI用語: 7635f4014152eacf6f8e7f0deacaa9c029ad9546
- 短い表示名/ローカル保存保護: 1feb6aff6b29574eda136365b74e88191a24692c
- ボス表示/対戦モード: 6f361144647169f9093094ba893f4c89335e8fa4 / 7a1e21a08217790c72162074c0e681ffd8111190
- テスト新規: b02c6a080590466c4e4ca2c9f1b87c6ab063e626
- テスト更新: 88bb7f0346aab81470fb8186d56cb44dca3b036e / fbb4dce7acae46cb29d10531173070560c1b5cf4 / bc1071bb6ff328663b4d6f26f4373655cbb8ba8b / 9dbbb660926ce687b6fc0c1954b5a28e1a5f5d68 / 2ed6847240789f8bd4132bc4a9f5d94db261b6dc / 138a5af0b49a3ffff7fa7349ddae986fdf0458d4 / a32f5a951434755550d429e1e0c45c5042f0262f / d33f5b1518e89277e68d3a75f000d7efddcfda30 / d7c4449643e1075aec7bf3c40ce5819864933ed5
- package/worker: 030d68dab72894289d9c82ad06bef6949d3b541d / 63888c191d65a61c1a88d93660663c7e75c22d24
- README: 0132a2944271a91224e43adebbde72166df2beaf

---

# 声魂（こえだま） 毎時開発 / v0.10.6 / 2026-10-26

## CURRENT_STATUS
- GitHub main の games/otodama/ のみ変更。既存の声生成・録音停止/試聴・外見組合せ・名前生成・連続COM戦・育成・敗者爆発/破片/WIN・セーブ互換を維持。
- 前回の未完了：Node/Chromium正式回帰、Android実機、オンライン本番/二端末、連戦難易度とFPS実測。今回も実機/本番公開は未実施。オンラインサーバーはデプロイ可能なコードのみ。

## CHANGELOG
1. STAGE 1〜2のガード・回避・精密打撃の成功窓を広げ、STAGE 3〜5で段階的に狭め、6以降は従来通り。DAILY/オンラインの成功窓は変更なし。
2. 同一ステージで2敗以上した場合、次の敵を別キャラに変更する既存仕様を維持しながら、敵能力を最大8だけ緩和。ボスは最大4。勝利でリセット。補正をキャンペーン表示/対戦画面/次戦プレビューへ反映。
3. 7敵戦型/ボス別の短い攻略ヒントを対戦画面と次戦プレビューに表示。次戦の敵・ステージ・ミッション・戦型は従来通り変更。
4. 高解像度画面のバトルCanvasを最大2xの内部解像度に変更。論理座標720x450は不変。低メモリ/省電力時は1x、設定切替時に再初期化。
5. 自作Web Audioの16小節構成に4小節のハーフタイム・ブリッジを追加。緊迫時とボス戦は通常の密度を維持。録音声の再生・BGMダッキング/音量/ミュートは維持。
6. スマホボタンのタップ操作を明示し、キーボードのフォーカス可視化を追加。
7. moderation.jsの公開名/タイプ名からUnicode不可視文字・双方向制御文字を除去し、空白を整理。絵文字を途中で切断しない。既存410語の禁止語辞書とサーバー検証を維持。
8. test-quality-v106.cjs と test-moderation.mjs に回帰を追加。README/Worker health/packageをv0.10.6へ更新。

## TEST_RESULTS
- GitHub mainの現行ファイルを取得してクライアントJS/Worker/ModerationのV8構文検査PASS。
- 新規 test-quality-v106.cjs をV8で模擬ファイル読込により実行：39アサーションPASS。敵補正/異なる敵/ボス上限、序盤判定とオンライン不変、Canvas DPRと省電力切替、音楽構成、録音・連戦・WIN・セーブのコード保持を確認。
- test-moderation.mjs をV8で現行moderation.jsと連結して実行：46アサーションPASS（禁止語・誤検知・不可視文字・絵文字）。
- Worker Durable ObjectsをV8でスタブ化し21項目PASS：不正キャラ拒否、禁止名のサーバー変換、精密打撃・ガード・回避のサーバー裁定、同一ターン重複入力拒否、HP/共鳴/クールダウン、必殺技消費、次ターン戦術。
- Web AudioをV8でスタブ化し8項目PASS：ブリッジ/通常/緊迫/ボス/ミュート/AudioContext停止/終了/録音声ダッキング。低メモリ時のCanvas1xを別途検証。
- GitHub更新ファイルのコミット後再取得blob SHA照合PASS。正式Nodeのテスト実行、Chromiumブラウザ操作、Android実機、Cloudflare Workers本番、外部二端末、公開URL直接操作は未実施。模擬V8検証と区別。

## BLOCKERS
- Cloudflare本番には所有者側のActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN、公開Worker URL設定が必要。秘密情報はコード/ログに保存しない。
- Android実機と外部二端末を操作できないため、実機マイク・縦横UI・音声再生・ネットワーク復帰の実測は未完了。
- 録音音声の自動文字起こし・発話内容審査は未実装。名前の文字列フィルタリングとは別問題。
- 実FPS/メモリ/長時間バランスデータなし。正式Node/Chromium回帰は次回以降。

## NEXT_ACTIONS
1. 正式Nodeで全 .cjs/.mjs テストを実行し、ChromiumでCOM連戦・録音・保存・音量/ミュート・モバイル縦横/高DPIを検証。
2. 10〜20戦の難易度曲線/敗北補正の発動率・実FPS・BGM疲労を測定し、演出と数値を再調整。
3. Cloudflare認証後にWorker本番公開、/health、ランダム対戦、再接続、同意音声、独立2端末の同期を検証。
4. 公開名の多言語誤判定と録音発話審査の現実的な選択肢を検討。

## GITHUB_COMMITS
- Game/UI: 58c13d70bc506296607ac1a88ab5536dc2bf55d7
- New V8/Node regression source: c5257d3fe3a5f987ef9e6523b58b6c52578fb5db
- Moderation Unicode sanitizer: 92aa8841177216fb4b19155d66958b8a1c305147
- Moderation regression: dedebd3b797cfeb652e64f639db9c59bde81f1a4
- Worker health version: 63e5b31334bfe3d125ab83614336e778d917aae2
- package version: 9c1e9d71bb47e0c5e06c0eca8d06f314a7ac3be7
- README: b68845f2d5a8858b75bd4a1862fe782af770d896

---

# 声魂（こえだま） 毎時開発 / v0.10.5 / 2026-10-26

## CURRENT_STATUS
- main games/otodama/ のみ変更。旧コードの声生成、録音停止・試聴、外見の多様性、名前生成、セーブ互換、連続COM戦、育成、敗者爆発・破片・WINを維持。
- 実装主眼は体感品質（操作タイミング、命中の迫力、音、背景、低負荷化）。オンラインは開発ソースのみでCloudflare本番未公開。

## CHANGELOG
1. 攻撃/防御判定窓と一致するCanvasタイミングリング（ガード/回避/精密打撃）、スマホ向けDOMの大きい案内を追加。
2. 命中瞬間72msの映像ヒットストップ、短いカメラパンチ、衝撃波と最大22破片（省電力8破片）を追加。実時計・サーバー判定・次ターン進行は変更なし。
3. 通常攻撃/精密打撃/ガード成功/回避/必殺技のWeb Audio効果音を区別。録音声の攻撃・試聴やミュート設定を保護。
4. 蒼天・雷霆都市・深海・紅蓮・星屑・氷晶の6環境に独立の流動的な環境レイヤーを追加。背景素材はCanvas自作。
5. 速度の低い場面のキャラ全身残像描画を省略、戦闘モーダル/非表示タブではホームキャラCanvasの重複描画を停止。省電力ではエフェクト削減。
6. 案内をバトル開始/決着/退出で初期化。v0.10.5のUI/Worker health/packageを揃え、回帰テスト test-quality-v105.cjs を追加。

## TEST_RESULTS
- GitHub接続から読み込んだmainのHTML埋込JavaScriptをV8で構文チェックPASS。修正前・各編集後に読み戻しblob SHA一致。
- V8モックによるタイミング案内/ガード/精密打撃/操作済み・終了済みの状態/飛散22・8個/時間消去/5効果音分岐など23アサーションPASS。
- V8のCanvasモックで6背景すべてに通常モード・省電力モードの分岐を実行。効果描画の呼び出し量が省電力側で増えないことを確認。
- Nodeで test-quality-v105.cjs を直接起動するテスト、旧Node全回帰、Chromium実ブラウザ、Android実機、外部2端末、Cloudflare Workers本番WebSocket、ライブサイト直接表示/操作は今回未実施。V8モックとGitHub Pages Actionsをこれらの代用として報告しない。

## BLOCKERS
- Cloudflareは未デプロイ。所有者のActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKENとWorker URL設定が必要。API秘密は保存しない。
- 録音声の自動文字起こしと内容審査は未実装（公開名の禁止語チェックとは別）。
- 外部端末/ブラウザ実操作/長時間プレイのデータは未取得。効果の主観的完成度や実FPS改善値は計測していない。

## NEXT_ACTIONS
1. Node正式全スイートと新test-quality-v105.cjs、Chromium縦横/録音・試聴・音量・保存・次戦・勝敗を実行し、動作退行がないか確認。
2. モバイル実機でリング/DOM案内の見やすさ、連打、入力遅延、BGM/録音重なり、30fps省電力、連戦難易度を実測。
3. Cloudflare本番公開後のランダム/招待/再接続/署名・レート制限/音声同意/外部二端末検証。
4. 長時間プレイの敵AIの偏り、勝率、ミッション成功率、複数戦の音/アニメの飽きを計測して調整。

## GITHUB_COMMITS
- 動的攻撃リング・命中・SFX/最適化: 4b8f09a9ec92b418c5f5f2150946cd4eb89c639c
- 6環境・スマホ案内: b64d27f86602b0540f262e0d3b87ce6d0689a767
- 新規テスト: 7a568b5260aa88eaebe7a5a4249861c34f7aa293
- package: a5093ae1e70f712999d22d3b13e7812b2f05d3ea
- Worker health source: 59879eca4f100149887e899fa835701510b6a8df
- README: 8669f16446216e54a1b92d309a97eda945bb9b08

---

# 声魂（こえだま） 毎時開発 / v0.10.4 / 2026-10-26

## CURRENT_STATUS
- 対象 games/otodama/ のみ更新。ゲーム名「声魂（こえだま）」、声生成・録音停止/試聴・外見組合せ・次戦進行・爆発/WIN・育成・既存セーブ形式を維持。
- Cloudflare Worker/Durable Objects はコードのみ更新。本番デプロイと外部2端末の確認は未実施。

## CHANGELOG
1. 次戦用の新規強化「逆転障壁」：HP40%以下で被弾時、一戦に一度だけ20軽減。ガード・回避成功では消費しない。
2. 次戦用の新規強化「連鎖共鳴」：精密打撃で共鳴+8、2連鎖以降の与ダメージを最大20%増加。既存4種を含め6種類。
3. 敵AIに「破甲の一撃」を追加。ステージ9以降の粉砕型とステージ12以降の防御偏重に反応。ガード貫通・回避有効の予兆を表示。
4. オンライン精密打撃HUDの時間窓をサーバーの270〜660msに整合。
5. オンライン必殺技の共鳴不足をサーバーが明示的に拒否し、UIが理由を表示。
6. 自作BGMの16小節フレーズ変化を追加。狭い画面の次戦強化選択を2列に変更。
7. 画面初期タイトル・フッターの旧バージョン表記を0.10.4に統一。Matchmakerテストの旧fixtureを厳密なキャラ検証仕様に修正。

## TEST_RESULTS
- 最新GitHub mainのソースを読み込み、V8でクライアント/WorkerのJavaScript構文検証PASS。
- V8互換実行：test-ui-source 115 assertions PASS、test-room 98 assertions PASS、test-matchmaker 18 assertions PASS、test-moderation 38 assertions PASS、合計269 assertions PASS。
- ライフライン一度限り/敵AI貫通/ライブ精密打撃の純関数チェックPASS。
- 各GitHub変更ファイルはコミット後に再取得しGit blob SHA一致を確認。
- 正式なNodeスイート、Chromium実操作、Android実機、GitHub Pagesの公開URLでの直接操作、Cloudflare本番WebSocket/外部2端末は未実施。V8互換テストはこれらの代替ではない。

## BLOCKERS
- Cloudflareアカウント認証、Actions Secrets CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN、Worker URL設定が必要。
- 録音音声そのものの自動文字起こし・禁止語判定は未実装。名前などの文字列検査とは別。
- Android実機と外部二端末が使えず本番実プレイ確認未実施。

## NEXT_ACTIONS
1. 正式Node + Chromium全回帰、スマホ縦横/音声録音/保存/勝敗/連戦のブラウザ操作確認。
2. 逆転障壁/連鎖共鳴/破甲の一撃の勝率・難易度・タイミングを実戦で計測して調整。
3. Cloudflare Worker公開後、/health、ランダム/招待、再接続、音声同意、外部2端末の通信品質を検証。
4. BGM長時間再生と音量、Android実機のマイク・録音・音声・省電力を確認。

## GITHUB_COMMITS
- UI/戦闘/BGM: 48631ac08692d7a1fc21118e3e8b705232c6c1fe
- Worker拒否応答: c56287b9329cf293ba1c7ec3c35207534d2277c6
- 障壁消費条件修正: 0ae5dfc948eb9691fc616d6b76b5260f7a5a14d1
- Room/UIテスト: 404ae5f2dc0f054ccaae7c3f5521300b427394de / c4a04c500fadd242616ad50823cc1fb44a51d9d7
- Matchmaker fixture: 5fad3eba659748f7bb01edb716f1fa080e047ba7
- UI版表示/モバイル: 11fb548c888a4cdd3005fc7c0e8bd33dec1d287e
- Worker/Package版: edd490cb874b3e06e63dfc945489a3ff697243bd / 611700e54607e1f8af30443bcd8accf527bf1f05
- README: 8c11961020c83adc797b1b19aca6c740334d41ea

---

# 声魂（こえだま） 毎時開発 / 2026-10-26 / v0.10.3

## CURRENT_STATUS
- GitHub mainのindex.html、worker.js、wrangler.jsonc、README、moderation.js、テスト群、PROGRESSと指定Driveのv0.10.2ログを実読。
- 既存の声生成、録音停止/試聴、外見・名前生成、COM連戦、WIN/爆発、育成、オンライン試作を維持。
- Worker本番は未公開。Android・外部二端末・公開ページ実操作は未検証。

## CHANGELOG
1. 敵の戦型を5→7種（幻惑/追撃）に追加。既存の予兆付き攻撃を敵の戦型・プレイヤーの戦術・共鳴/ガード傾向に応じて選ぶAIに変更。
2. 次戦用の「集中強化」を追加。精密打撃の入力猶予を拡張し、成功時の共鳴+2。
3. ガード・回避・精密打撃の受付範囲をHUDと実判定で共通化。アイアンハート型のガード判定表示ズレを修正。
4. 自作BGMの旋律とリズムを敵戦型に応じて変化。省電力モードを約30fpsに抑え背景線・残像を削減。
5. Workerのseed/部位/声特徴量に厳密な数値型・範囲検査を追加。禁止名の代替表示を「声魂」に変更。
6. UI/Room/Moderationの回帰テストを拡張。バージョンを0.10.3に更新。

## TEST_RESULTS
- V8クライアント埋込JS構文: PASS。
- V8 UIソーステストと禁止語・許可語、Worker検証: 計167アサーション PASS。
- V8敵AI/入力猶予の純関数: 12ケース PASS。
- V8 20ステージの敵戦型変化・敗北後の新しい敵seed: PASS。
- V8自作BGM発音イベント・ミュート時の発音抑制: PASS。
- WorkerのCloudflare importをスタブ化したV8構文とcleanCreature入力検証: PASS。
- GitHub main各更新ファイルの再取得blob SHA一致: PASS。
- Node正式スイート/Chromium/Android実機/Cloudflare実配信/独立二端末: 今回未実施。V8スタブ検証を本番検証と混同しない。

## BLOCKERS
- Cloudflare Workers本番公開には所有者の認証、Actions Secrets CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN、Worker URL設定が必要。
- 録音音声の文字起こし/禁止語判定は未実装。オンライン声特徴量の真正性は保証できない。
- Android端末と独立二端末での操作・接続確認は未実施。

## NEXT_ACTIONS
1. Node全スイート・Chromiumの縦横/録音/保存/COM連戦/オンライン再接続回帰を実行。
2. Android実機でタップ猶予・30fps省電力・自作BGM・録音を評価。
3. Cloudflare認証後にWorkerをデプロイし、/health/ランダム/招待/復帰/二端末同期/音声同意を検証。
4. 7戦型の対戦バランスと集中強化の勝率・ミッション達成率を長時間プレイで測定。

## GITHUB_COMMITS
- client: 2fc507af84c0de3d539a723e78bef40a6dd2dc6e
- worker: 46ed2fb1b4128ece2b35a2d7697bf57915b04a76
- moderation fallback: 3586598580bb5862cf8abbee0bb013139e076e94
- tests: 15df3fecea568a6dbc16a2876046c865910c2372 / 29e8b6a46a81b267b120790c4a3e57d5f9bb85a9 / 870fca13fb46b7c878c15e997fad7cb68ec13c59
- README: aadf45aed5d5fcaad2e55ecf2f305bb5c18b7dbd
- package version: dc9f1aca8f321fe65932c36143666fd7dbc55063

---

# OTODAMA∞ 毎時開発 / 2026-10-26 / v0.10.2

## CURRENT_STATUS
- GitHub main index.html, worker.js, wrangler.jsonc, moderation.js, README, package.json, tests, PROGRESSと、指定Driveのv0.10.1ログを実読してから改修。
- 声生成・録音/停止/試聴・外見組合せ・名前生成・COM連戦・WIN/爆発・育成を維持。
- Cloudflare Workerは未公開。Android実機・独立二端末・本番WebSocket対戦は未検証。

## CHANGELOG
1. 禁止語辞書を410語に拡張し、局部表現、Unicodeの記号分割、不可視文字、一部混同文字への耐性を追加。
2. 禁止29例と許可21例を評価し、誤検出抑制（1文字の膣は完全一致）を維持。回帰テストを追加。
3. キャンペーンのステージミッションを12→16種類に追加。
4. 敵の戦型を3→5種類に増やし、吸音/粉砕を追加。
5. 自作BGMのステージ別裏拍・ボス戦フィルを追加。
6. オンラインキャラ入力の型/サイズ/数値検証を強化し、不正なネストを拒否。サーバーテストを拡張。
7. UI回帰テストを拡張、ゲーム/Worker/packageをv0.10.2へ更新。

## TEST_RESULTS
- GitHub main再取得と変更後blob SHAの一致：確認済み。
- V8 JavaScript構文評価：index埋込スクリプト / worker / moderation PASS。
- 禁止29件/許可21件の文字列判定：PASS。追加したUI要素・Worker検証条件の静的チェック：PASS。
- Nodeの正式テストスイート、Chromiumの操作スイート、GitHub Pagesの公開反映、Android実機、外部2端末、Cloudflare本番：今回未検証。

## BLOCKERS
- Cloudflare公開には所有者の認証、Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN、Worker URL設定が必要。認証情報は保存しない。
- 録音発話の文字起こし/禁止語検査は未実装。クライアント送信の声特徴量は真正性を証明できない。

## NEXT_ACTIONS
1. Node/Chromium全スイート実行とモバイルUI/録音/保存の回帰。
2. Cloudflare認証後にWorkerデプロイ、/health・ランダム/招待・独立2端末の復帰・音声同意・同期テスト。
3. ミッション16種類と敵戦型5種類のバランス・実プレイ長時間BGM評価。
4. 録音音声のモデレーション方式（端末内処理/プライバシー/明示同意）を検討。

## GITHUB_COMMITS
- moderation: d15887965684a3fcbfc3f942d4bc2b13153795c0
- moderation test: 5d8a534fc6153d7fc068a8ddc1507bd6461518b2
- game: 2cc269fd69313057eba93c22a8b9423ca1648af1
- worker validation: 8ac08da513d68ff1818421e9f6a1dcc7842b54f5
- worker test: 3ee0d95ed2c7483a2f13977e5ecf30324a4bce7d
- UI test: 2447b4ea472105e4f644b4f0618e2ac80a2a4f6d
- version: 5758eac0518aa3a35993d54f3aa39b29aa422ccc / 6d718fe75da278b6eedb67fb5ce58aaa6f5ac6c6 / de27fb479734c4ae4b265ef7a991271f84cdde51
- README: 257b669d5021d97dc0c0fd8c4680c12420ac8265

GitHubがコード正本、Driveが引き継ぎ正本。未実施のテストを確認済みとしない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 / v0.10.1

## CURRENT_STATUS
- GitHub mainのindex.html / worker.js / wrangler.jsonc / README / PROGRESS / moderation.js / package.json /テスト群と、指定Driveフォルダ内のv0.10.0最新実行ログを実読してから改修。
- 対象はgames/otodama/のみ。既存の声生成・録音/試聴・外見生成・COM連戦・育成・WIN/爆発・6背景・自作BGMを維持。
- Cloudflare Workerはデプロイ可能なソースのみ。実際のオンラインサーバー公開は未実施。

## CHANGELOG
1. moderation.jsの前回更新で混入した文字列「\\n」による構文エラーを修復。辞書は401語、全角/半角・記号分割等の正規化を維持。
2. 「たまたま」「クリスタル」「裸足」「つまらない」など日常語の誤検知を減らすため、過剰な短い部分一致語8語を削除。
3. オンライン再接続時に攻撃種別・ダメージ・経過時間・防御入力・戦術を再抽選せず、同一ターンのまま復旧。休止フェーズの残り時間も保持。
4. 再接続クライアントの経過時間と入力済み操作を同期。復帰による録音音声/予兆音の重複再生を抑制。
5. キャンペーンのミッションを8→12種類に拡張（高難度JUST/回避/必殺/与ダメージ）。勝利/敗北後に次の敵・ステージ・ミッションをプレビュー。
6. ボス攻撃3→5種類。虚空転移・螺旋連撃を追加し、攻撃倍率・環境演出を個別化。
7. 自作Web Audio BGMに8小節ごとの休符展開を追加。録音音声ダッキング・初期小音量・ミュート設定を維持。
8. 新規ChromiumテストとRoom/Moderation/UIの回帰テストを追加。表示バージョン・Worker health・packageを0.10.1に更新。

## TEST_RESULTS
- ローカルNode: worker構文、UIソース、Room、Matchmaker = PASS。再接続の予兆中・休止中の時刻維持もテストPASS。moderation.jsはGitHub取得ソースをJavaScriptとして構文検証し、禁止9件/安全10件の判定をPASS。
- ローカルChromium: gameplay/live/reconnect/save/tactics/v098/v099/v100/v101 の9スイートPASS。縦390px・横画面・320pxの既存回帰もPASS。
- GitHub main: index / worker / package / test-room / test-ui / test-v101 の取得blob SHAとローカルファイルSHAが一致。moderationもGitHub再取得で一致。
- GitHub Pagesの配信反映・公開URLでの直接操作、Cloudflare本番、外部二端末、Android実機は未検証。

## BLOCKERS
- Cloudflare本番公開には所有者の認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN、Worker URL設定が必要。秘密情報は記録しない。
- 録音発話の自動文字起こし・禁止語検査は未実装。文字列の禁止語検査と録音内容の審査を混同しない。

## NEXT_ACTIONS
1. Cloudflare認証後、Worker /health・ランダム対戦・部屋・二端末同期・15秒再接続・音声同意を本番検証。
2. Android実機で縦横・マイク・BGM・バックグラウンド復帰・操作遅延を確認。
3. 12ミッションの達成率、ボス5技の難度、長時間BGM、敵AIを実測し調整。
4. 再接続のpauseフェーズ、通信混雑・切断競合を追加テスト。

## GITHUB_COMMITS
- moderation fix: c9eddac990f92f30d0a8b25bc22f337583a28b00
- worker reconnect: c9bda6840f5ac09dcf5ff4b36edd0e2b2b51f8c4
- game improvements: 4fd265961f87e0a075ee8ef4a3fa78ca91311dd0
- tests: ced68a2c3cce9c877232f654c571170ad6e9f301 / dd519deafbff18b88e404727717115648023be66 / a684badce5cd184c465f3777da9306152ca1f92f / 0cd0f5133b0cbf252243e0a09d7620767118bdda
- version: 23458aac94ecd7cd1e3d72c3cc8702385e23ee0e / 293e4db229be14ef1855158320409fd6d363ca48 / 77f4b8874e425e5411d085dab607f17a1e64385f
- README: 9843743ef2c47b7b5a8660dc173ff682256f37c1
- pause-phase reconnect regression: ca35f38db154c0ea4f953b6eec64d92d0b8da294

GitHubがコード正本、Driveが引き継ぎ正本。ローカル成功は本番確認を意味しない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 09:00 JST / v0.10.0

## CURRENT_STATUS
- GitHub main v0.9.9 の index.html、worker.js、wrangler.jsonc、README、PROGRESS、テスト群を実読。Drive v0.9.9最新報告も確認。v0.9.9 ZIP内 index/worker のGit blob SHAはmainと一致した状態から改修。
- 声生成・録音/試聴・連続COM戦・育成・図鑑・6背景・自作BGM・勝利爆発/破片/WINを維持。

## CHANGELOG
1. 非表示タブでCOM戦を一時停止し、復帰時に攻撃経過時間を補正。未解決の攻撃が次のターンに飛ぶ問題も防止。オンラインは停止しない。
2. 敵の戦型3種類（猛攻/堅守/疾風）をステージと再挑戦回数で切替。ステータスを調整し、対戦画面に戦型と特徴を表示。
3. STAGE12以降に速攻技「閃光突進」。通常より早いガード・回避窓を追加、HUD予兆も一致。
4. ミッション6→8種類。カウンター命中・精密打撃2連鎖を追加し、戦績に反撃回数を表示。
5. コンボ/ボス瀕死/HP危機でBGMの副旋律・フィルを追加。勝敗別の短いジングル。音量・ミュート・声ダッキング維持。
6. Worker: 15秒超過の復帰トークンを拒否（alarm競合対策）。MatchmakerのWebSocket接続を64に制限。
7. 新Chromium v0.10.0回帰テスト、Room/Matchmakerの期限切れ・飽和テストを追加。公開版のフッターとpackageをv0.10.0へ更新。

## TEST_RESULTS
- ローカルNode: worker/moderation構文、UI/Room/Matchmaker/Moderation = PASS。
- ローカルChromium: gameplay/live/reconnect/save/tactics/v098/v099/v100 = 8 suites PASS。v100で閃光突進のガード/回避、3戦型、2ミッション、バックグラウンド復帰を確認。
- GitHub main: index.html blob SHA 3db815ed5d0d36531660408845898338fd7cc59c、worker.js 27caf110a1d360d8e11ebb541e625ffeb1a90be0。更新時のGitHub返却SHAとローカル一致。
- GitHub Pagesビルド結果は別途確認。Cloudflare本番、外部2端末、Android実機、公開サイト直接操作は未検証。

## BLOCKERS
- Cloudflare本番公開には所有者の認証、Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN とWorker URL設定が必要。秘密値をソース・Driveに記録しない。
- 録音した発話内容の禁止語自動検査は未実装。クライアント申告の声特徴量の真正性は検証不可。ランク戦/賞金戦は未対応。

## NEXT_ACTIONS
1. Cloudflare認証後、/health・ランダム/招待・ガード/回避/精密打撃/必殺・二重同意・15秒再接続を外部2端末で検証。
2. Android縦横・マイク録音・音声BGM・背景停止/復帰・ボタン反応を実機で検証。
3. 3戦型と閃光突進の難易度、8ミッション達成率、XPとコンボバランスを長時間プレイで計測・調整。
4. オンライン接続の悪用対策・マッチング待機/復帰競合・音声送信同意を継続検証。

## GITHUB_COMMITS
- v0.9.9 baseline c170e8e4a6c2db525af67f629fcd95e9235960ed
- v0.10.0 index d3e9539f21aa9944ef939f4ced1371e1828d9461 / footer 720ef715f58b7741b6e491db9ddd08037fd619d9
- v0.10.0 worker b2b584f2224837e2c0346c6961632d41e1e2aa88
- v0.10.0 tests 95bd73c5e31eb329b2b7aebae608d62e6bc7f1ed / 450f1e06c9a0a6f671f31013469cbc4e2aa4ec73 / 1648ea77320441ad2b4149c36b2b876794f33e82
- package 0d61c556e758cb788bac8c8e99e010bc170159c7

GitHubがコード正本、Driveが引き継ぎ正本。ローカルテストと実配信・実機を区別する。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 08:00 JST / v0.9.9

## CURRENT_STATUS
- GitHub main v0.9.8 index.html / worker.js / wrangler.jsonc / README / PROGRESS / テストとDrive v0.9.8最終報告を実読。ZIP内HTML blob SHA cc33aaf7f5d328013953d7347f1f1292261a8288 はGitHub mainと一致。
- 声生成・録音/試聴・連続COMバトル・6背景/BGM・育成・図鑑・爆発/WINを維持。

## CHANGELOG
1. 攻撃時の精密打撃（スマホボタン/PC Lキー）。タイミング成功で攻撃倍率+18%〜+32%、共鳴+6、連鎖・命中リング・短い音キュー。
2. 6番目のミッション「精密打撃2回」、戦闘評価/XP報酬に反映。
3. オンライン精密打撃をDurable Objectの時計で判定し、結果を両端末に同期。連続入力禁止と最大90ms RTT補正。
4. オンライン録音音声を送信側と受信側の二重同意制に変更。初期オフ、受信撤回を反映。受信済みデータの回収は不可。
5. ランダム対戦待機120秒のアラーム期限切れ・キャンセル対応、切断理由の表示改善。
6. ルームへの余分な接続をWebSocket割当前に拒否。4操作ボタンを2×2配置。

## TEST_RESULTS
- ローカルNode: worker構文、moderation構文、UI、Room、Matchmaker、Moderation=PASS。
- ローカルChromium 7 suite: 連戦/ボス/宿敵/音声/戦術/保存/オンライン模擬/再接続/精密打撃と二重同意=PASS。
- GitHubコミット・ソース再取得は別途検証。Cloudflare本番/独立2端末/Android実機/公開サイトの直接操作は未検証。

## BLOCKERS
- Cloudflare本番公開には所有者の認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が必要。Worker URL未設定。
- 録音発話の禁止語自動審査は未実装。クライアント申告の声特徴量の真正性は検証不可。ランク戦/賞金戦不可。

## NEXT_ACTIONS
1. Cloudflare本番公開後、/health・招待/ランダム・精密打撃/ガード/回避/必殺技・二重同意・15秒復帰を独立2端末で検証。
2. Android縦横/録音/BGM/音量/4ボタンの実機検証。
3. 精密打撃と6ミッションの成功率、XP/難度/敵AIバランスを実プレイで調整。

## GITHUB_COMMITS
- baseline v0.9.8: 46c46f84741d45886b166d8d48a204294b146c0b
- v0.9.9 HTML: 0f12e600afd981edd3f2b5f56a54bd347b424668
- v0.9.9 Worker: a5406b1d365e023f93d77fc72058d0a8cf361256
- v0.9.9 tests: 217b32eb20a50025d93930e5b23eddb24209a9e8 / 4ca7a838afd6aa43d838140d1245cd962553c8fa / b49264e6c90bfaac9d6fddc3e7c5e81ae7b5fb22 / 47f709979ced15de96f6d794a5da6b7f49200dbc

GitHubがコード正本、Driveが引き継ぎ正本。実配信/実機/本番接続をローカル検証と混同しない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 07:00 JST / v0.9.8

## CURRENT_STATUS
- GitHub main v0.9.7 index.html/worker.js/wrangler.jsonc/README/PROGRESS/test-room/test-tacticsを実読。Drive v0.9.7 RUN_REPORT_20261026_0600.mdを実読。index.html と worker.js のローカルZIP blob SHAがGitHub mainと一致してから改修。
- COM連続ステージ/声生成・録音・試聴/図鑑/育成/6環境/ボス/自作BGM/敗者爆発/WIN維持。Cloudflareオンライン本番は未公開。

## CHANGELOG
1. STAGE 7,14,21…（5の倍数を除く）に宿命のライバルを追加。敵レベル/能力上昇、専用名、勝利時+2XP。
2. ステージミッションを3→5種に増やし、2連続JUST・累積100ダメージを追加。
3. 録音音声を聞きやすくするため攻撃音声再生中にBGMを約480msダッキング。
4. 非表示タブではBGM/再生音声を停止し、復帰時にBGM再開。
5. Cloudflare WorkerにOrigin allowlist（techmew.github.io + localhost）を追加。Originはブラウザ由来のアクセス制御であり、非ブラウザ攻撃を完全には防がない。
6. 未参加WebSocketが残っていても正しい復帰トークンを持つ対戦者が再接続できるようRoomを修正。
7. 音声データのbase64整合性と復号後72KiB上限を検証し、サイズ偽装を拒否。
8. Room回帰テスト、宿敵・ミッション・BGMダッキングのChromiumテストを追加。

## TEST_RESULTS
- node --check worker.js / node test-ui-source.cjs / node test-room.cjs / node test-matchmaker.cjs / node test-moderation.mjs：ローカルPASS。
- Chromium: test-gameplay-browser.py / test-tactics-browser.py / test-live-browser.py / test-reconnect-browser.py / test-save-browser.py / test-v098-browser.py：ローカルPASS。
- GitHubコミット/変更ファイル再取得は別途結果を追記。公開サイトの直接実操作、Android実機、Cloudflare本番、外部2端末は未検証。

## BLOCKERS
- Cloudflare Worker本番公開は所有者のCloudflare認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKENが必要。Worker URLは未設定。
- クライアント申告の声特徴量は検証できずランク戦には利用しない。録音発話の自動禁止語検査は未実装。

## NEXT_ACTIONS
1. Cloudflare認証とWorkerデプロイ。/health、実ランダムマッチ、招待、2端末ガード・回避・必殺技・再接続・不戦勝の確認。
2. モバイル実機の録音/音声/BGM/縦横・低性能端末での音切れ検証。
3. 宿敵・5ミッションの達成率、難易度とXPバランスを実プレイで計測。
4. 音声共有の受信側設定、接続荒らし対策、同意UIを再点検。

## GITHUB_COMMITS
- v0.9.7 baseline: 70bf2be9b4ecc08a17d2cf22bf1b5666df811884
- v0.9.8 game/source commit: 46c46f84741d45886b166d8d48a204294b146c0b
- 変更7ファイルのGit blobを再取得して一致確認。GitHub Pages workflow 40239063592 = completed/success。
- Drive v0.9.8バックアップ: https://drive.google.com/drive/folders/1JxNLH4saci4LDi-l4MqpOAW1j5nE_QFJ
- Cloudflare Worker本番公開、外部2端末、Android実機、公開サイト直接操作は未検証。

GitHubはコード正本、Driveは引き継ぎ正本。ローカル検証と本番公開を混同しない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 06:00 JST / v0.9.7

## CURRENT_STATUS
- GitHub main v0.9.6 index.html / worker.js / wrangler.jsonc / README / PROGRESS / package / testsを実読。Drive v0.9.6最終報告を確認。ローカルv0.9.6 ZIPの主要コードblob SHAがGitHubと一致することを確認してから改修。
- 連続COMバトル、声生成/録音/試聴、育成、図鑑、6ステージ/ボス/BGM、勝利爆発/WINは維持。Cloudflareオンライン本番は未公開。

## CHANGELOG
1. ステージミッション3種類（JUST×2、回避×1、必殺×1）を循環。HUD進捗と勝利時XP +1。
2. PERFECT DODGEの次攻撃に+15%カウンターを付与。
3. STAGE 5以降、COM敵が防御傾向を読んでフェイント/共鳴吸収を選ぶ。
4. ガード成功可能時間の開始を小音量の短音で通知（ターンごと1回）。
5. オンライン録音音声が未参加ソケットへ漏れる経路を遮断。
6. オンライン戦術を攻撃ターン開始時に固定し、切り替えは次ターンから適用。再接続にも固定戦術を含める。
7. サーバーの音声隔離・戦術固定、Chromiumのミッション/回避カウンター/敵学習テストを追加。

## TEST_RESULTS
- Node: worker構文、UI構文、Room、Matchmaker、Moderation=PASS（ローカル）。
- Chromium: COM連戦・次戦強化・ボス・横画面/320px、戦術/ミッション/XP/回避カウンター、オンラインUI、復帰、保存/復元=5 suites PASS（ローカル）。
- Chromium 390pxで新しいミッションHUDをスクリーンショット確認。Android実機ではない。
- GitHubへの変更ファイルのコミットとblob再取得を検証すること。GitHub Pages実配信/Cloudflare本番/外部2端末は未検証。

## BLOCKERS
- Cloudflare Workers本番公開には所有者のCloudflare認証とActions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が必要。秘密値はコード/Driveへ記録しない。
- 録音した発話の禁止語自動審査は未実装。クライアント申告の声特徴量は改ざん可能でランク戦には利用しない。

## NEXT_ACTIONS
1. Cloudflare公開、/health、独立2端末のマッチング・復帰・不戦勝・実RTT測定。
2. COMのミッション達成率/難易度を実プレイで測定し、報酬バランス・敵学習・ボス演出を調整。
3. Android実機のマイク・音声・BGM・縦横UI・省電力検証。
4. サーバーで音声転送のサイズ/頻度制限を再点検し、オンライン荒らし対策と公平性を強化。

## GITHUB_COMMITS
- v0.9.6 baseline: 27ba78923abb7aedcdee9013849bd629841e1718
- v0.9.7 game/test source latest: 873a4ae12cf811567724fc6b015dc30245d6c141

GitHubがコード正本、Driveが引き継ぎ正本。ローカル検証と本番検証を混同しない。

---

# OTODAMA∞ 毎時開発 / 2026-10-26 05:00 JST / v0.9.6

## CURRENT_STATUS
- GitHub main v0.9.5 index.html/worker.js/wrangler.jsonc/README/PROGRESS/テストを実読し、Drive v0.9.5 RUN REPORTを確認。変更対象コードのGit blob SHAはv0.9.5 ZIPと一致。
- 連続COMバトル/声生成・録音/保存/図鑑/6ステージ/ボス/BGM/勝利爆発を維持。リアルタイムオンラインはCloudflare本番未公開。

## CHANGELOG
1. COM敵に重撃・共鳴吸収・フェイントを追加。ステージとターンで発生し、事前警告と対処法を表示。
2. 戦闘成績をS/A/B/Cで評価し、ジャスト/回避/必殺/与ダメ/被ダメを結果画面に表示。S/A勝利にXP加算。
3. 戦闘中にダメージ数値と防御成功を浮遊表示。
4. ONLINE LIVEで相手音声ミュートが効かない問題と、デコード待機中の旧対戦音声再生を修正。
5. オンライン復帰時の最大HP・回避クールダウン・必殺準備・戦術・ターン番号を再同期。
6. サーバーの終了済み一時戦闘データを削除し、保存負荷を低減。
7. Chromium新規戦術/成績テスト、サーバー終了時データ消去と復帰スナップショットの回帰テストを追加。

## TEST_RESULTS
- Node: worker構文、UI構文、Room、Matchmaker、Moderation = PASS（ローカル）。
- Chromium: COM連戦、保存/復元、オンライン模擬UI、再接続模擬、新規戦術/評価/XP = PASS（ローカル）。
- モバイル390pxの結果画面をChromiumでスクリーンショット確認。実機ではない。
- GitHubコミット・公開サイトの実配信・Cloudflare実戦・Android実機は別途検証。

## BLOCKERS
- Cloudflareアカウント認証とActions Secrets（CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN）が未設定または未確認。Worker本番公開・2端末実戦は未実施。
- 声特徴量の真正性は検証できないため、ランク戦/賞金戦は禁止。録音音声の禁止語審査は未実装。

## NEXT_ACTIONS
1. Cloudflare本番公開、/health、独立2端末のマッチング・復帰・不戦勝・通信遅延の実測。
2. ボスAIの攻撃予兆、フェイントの難易度調整、実際の継続プレイによるバランス検証。
3. Android実機のマイク/音声/BGM/縦横表示を検証。
4. リアルタイム対戦の再接続・戦術UIを実回線で検証し、負荷と安全性を調整。

## GITHUB_COMMITS
- v0.9.5 GitHub main baseline: `45e2e6c0539e7d80abc0fa56c9e92b9f5f6bdfce`。
- v0.9.6 UI: `dc37fbea850240f869a4d2fd5a5d5e7845c686d7`。
- v0.9.6 Worker: `6bf03b1d819a9c904ece2df48df9be9eb5a99ef3`。
- v0.9.6 テスト追加・改修後の最終コード: `3c8196e5f3f7c732364081fd30ec065f914cbb24`。
- GitHub Pagesの実配信/Cloudflare本番は未確認。

GitHubがコード正本、Driveが引き継ぎ正本。ローカル検証と本番検証を混同しない。


---

# OTODAMA∞ 毎時開発 / 2026-10-26 04:00 JST / v0.9.5

## CURRENT_STATUS
- GitHub main v0.9.4 の index.html、worker.js、wrangler.jsonc、README、PROGRESS、テストを実読。Drive v0.9.4報告も確認。主要ファイルのGit blob SHAとDrive最終ソースZIPが一致した状態から改修。
- COM：声生成・録音・試聴、連続ステージ、図鑑、育成、6環境、ボス、ジャストガード/回避/必殺技/戦術、爆発/WIN演出を維持。
- Online：サーバー裁定の対戦は未デプロイ。15秒再接続猶予・128bit復帰トークン・HP/共鳴の再同期を追加。Cloudflare本番/独立2端末未検証。

## CHANGELOG
1. 対戦中切断で即不戦勝を廃止し、15秒復帰猶予。元の席・HP・共鳴を復元し、新しい攻撃予兆で同期再開。第三者の無効復帰トークンを拒否。
2. クライアントは切断後最大4回自動再接続。復帰時にHP・共鳴・戦闘UIを再同期。相手の接続待ちを通知。
3. サーバー900ms予兆とガード/回避UIを一致。命中演出をサーバー判定到着時に同期。古いターン応答を無視。
4. キャンペーンは勝利でのみ次ステージへ。敗北後は同ステージで新しい敵に挑戦。試行回数を保存/バックアップへ追加。
5. HP35%未満でジャストガード成功時、COM戦1回限りの逆転共鳴+25。
6. 6ステージ別BGMモチーフとフレーズ変化、BGM音量の端末保存。
7. サーバー/クライアントの再接続、敗北後新敵、保存、縦横画面の自動テストを拡張。
8. 対戦前の入退室でWebSocket接続順とプレイヤー席順がずれる問題を修正。常にseat順でサーバー対戦開始し、入れ替え回帰テストを追加。

## TEST_RESULTS
- node --check worker.js、node test-ui-source.cjs、node test-matchmaker.cjs、node test-room.cjs、node test-moderation.mjs：ローカル PASS。
- python test-gameplay-browser.py：ローカル Chromium PASS（勝利進行/敗北後の別敵/次戦強化/ボス/音量保存/縦横/320px）。
- python test-live-browser.py：ローカル Chromium PASS（モックWebSocketのオンライン操作UI）。
- python test-save-browser.py：ローカル Chromium PASS（試行回数のバックアップ復元/異常JSON拒否）。
- python test-reconnect-browser.py：ローカル Chromium PASS（モックWebSocketの復帰/HP・共鳴同期）。
- Cloudflare本番デプロイ、外部2端末接続、Android実機のマイク・録音声・BGM・操作：未確認。

## BLOCKERS
- Cloudflare Workers + Durable Objects公開には所有者側のCloudflare認証とGitHub Actions Secrets CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN が必要。秘密値をコード/Driveに保存しない。
- 復帰トークンはWebSocket URLクエリで送信。公開時にクエリ付きURLをログに記録しない。ブラウザ再読み込みではトークン消失。
- クライアント申告の声特徴量の真正性は証明できない。ランク戦利用不可。録音音声の禁止語自動審査は未実装。

## NEXT_ACTIONS
1. Cloudflare認証後Worker公開、/health、ランダム/招待、独立2端末、15秒以内復帰、猶予超過不戦勝、第三者復帰拒否を実回線で検証。
2. 通信品質・再接続レース・RTT補正・命中演出を実端末で調整。認証と荒らし対策を強化。
3. COMのボス固有AI/戦術/難易度を実測調整。BGMミックス・SE・描画を最適化。
4. Android縦横/実録音/声再生/ミュート・省電力を実機確認。

## GITHUB_COMMITS
- v0.9.4既知主要コミット：21271daefcf4b438edc3d25b66d7dcf9ff87c2c0
- v0.9.5 worker: 11560e90ff987cbd4ec827addcbce5e0877f2bef
- v0.9.5 HTML: 10151f9d8101fcc95f53a782991521c29448ea69
- v0.9.5 seat-order fix: a904f1b8c7f4b7556f3346f5a8dfb2065fe36f67
- v0.9.5 seat-order regression test: 70b148f308e465d71eb71fd926bbd10b8d728160

GitHubがコードの正本。Driveが引き継ぎ・進捗の正本。ローカル検証と本番公開を混同しない。
