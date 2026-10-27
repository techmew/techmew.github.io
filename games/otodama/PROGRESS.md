# 声魂｜2026-10-27 17時｜バックアップ復元の整合性と保護キャラ保全

CURRENT_STATUS: GitHub mainのgames/otodama/のみ更新。公開済みCloudflare Workerは変更なし。既存のCPU連続オート戦・ON/OFF受付・NEW CHALLENGER・録音声送信停止を維持。
CHANGELOG: バックアップ読込時の同一seed重複を統合し保護版を優先。既存保護キャラは上書き不可。保護30体を超える場合は読込を拒否し既存データを維持。図鑑番号の不正値を厳密拒否し重複を整理。roster/progress/discovery/dailyの4保存キーを先に検証・書込し、途中失敗時は書込済みキーをロールバック、ゲーム状態は成功後のみ更新。読込完了時に既存保護キャラ維持件数を表示。未保存の現キャラを含む一覧展開数を正確に表示。
TEST_RESULTS: 最新埋込JS、Worker、moderation、変更テストのV8構文PASS。CSS括弧バランスPASS。Node fs/vm/assert模擬環境でtest-roster-lock（30体、保存失敗、重複、実importSave、途中書込失敗の復旧、不正図鑑、保護30体超過）、test-queue-resilience-v126、test-handoff-v125、test-ui-refined-v124の4スイートPASS。正式npm test:node全23スイートは未実行。今回のGitHub Actions/Pages公開反映は未確認。実ブラウザ/Android/外部2端末は未検証。公開Pages・WorkerのHTTP取得はアクセス不可。
BLOCKERS: GitHub Actions最新結果と公開配信を検証できる環境が必要。localStorageのデータ全消去・端末故障はロックで防げない。rollbackもブラウザの保存領域が完全故障した場合は保証できない。
NEXT_ACTIONS: Actionsの全23 Nodeテスト、Pages公開完了、/health→2WebSocket→live_startを確認。Android縦横で保存30体・鍵・バックアップの操作、CPU→PvP→CPUと切断復旧を実機検証。
CODE_COMMIT_SHA: fe3cad99b1e2cb42303c1c3284f1bf326864b75b

---

# 声魂｜キャラクター保護ロック修正（2026-10-27）

CURRENT_STATUS: games/otodama/の作成キャラ一覧・ローカル保存・バックアップに鍵を実装。CPU/PvP/録音/音声の既存仕様は変更していない。Workerは公開済み、今回Workerコードは変更なし。
CHANGELOG: (1) 5件表示中の鍵をカード内右上に配置。(2) 保存した全30体の展開・個別鍵操作。(3) 未保存の現キャラを鍵ワンタップで保存・保護。(4) 保存上限超過時は未保護キャラのみ整理。(5) 既に保護中のキャラを育成戦後の保存更新でも保護維持。(6) バックアップJSONで鍵状態を保存・復元、旧形式互換。(7) インポート時も既存のロック済みキャラを消さずにマージ。(8) 保存失敗時に鍵操作を巻き戻す。(9) スマホの鍵タップ領域・一覧列数調整。
TEST_RESULTS: メイン埋込JSとtest-roster-lock.cjsのV8構文検査PASS。Node fs/vm/assert模擬ハーネスによる保護30件、展開・UI、保存/失敗、容量上限、インポート、書き出し/旧バックアップ、ワンタップ保護の回帰PASS。npm test:nodeの正式CLI/Actions、Pages実配信、Chrome/Android実操作はこのセッションから未確認。Web経由で公開Pages/Workerへアクセス不可だったため公開検証は未実施。
BLOCKERS: ロックはブラウザのlocalStorage依存。ブラウザデータ削除・別端末・故障には対応しないためJSONエクスポートを案内（録音原音はバックアップ対象外）。Node CIとAndroid表示・操作の追検証が必要。
NEXT_ACTIONS: Actionsでnpm test:nodeとPages deployを確認。ブラウザ縦390px/横表示、30件展開、鍵ON/OFF、30件全鍵、バックアップ読込、録音→自動バトル→育成後鍵維持を実操作検証。
LATEST_CODE_COMMIT: 25ca8b3d9c81c9db61fb31faa82a51e9058e046c

---

# OTODAMA｜2026-10-27 15時｜対人割込・CPU復旧
CURRENT_STATUS: mainのgames/otodama/のみ改修。Cloudflare Worker公開済み。録音声のオンライン転送は停止を維持。
CHANGELOG: 接続失敗後はCPUの同じ敵・HP・攻撃ターンを再開。NEW CHALLENGER中のダメージ進行停止。背面化中の未確定対人割込を中断、復帰後にCPU再開。時計の二重加算防止。WebSocket生成/取消/サーバー拒否を安全処理。切断後12秒再試行制限。回帰テスト追加。
TEST_RESULTS: 埋込JSとテストJSの構文コンパイルPASS。正式Node/Actionsは新コミット後に確認。過去の赤#40458364219は旧テストReferenceError、後続mainの#40458773508は成功。外部HTTP直接取得不可、実ブラウザ/Android/独立2端末は未検証。
BLOCKERS: Androidマイク・BGM、外部二端末でCPU→PvP→CPU、端末スリープ・通信断の実通信テスト未完了。
NEXT_ACTIONS: 新コミットのCI/Pages確認、切断・OFF・背景復帰・勝敗後CPU連戦の実端末検証。
GITHUB_COMMIT: GitHubの本記録を含むコミット（SHAはDrive追記）。

---

# CURRENT_STATUS｜2026-10-27｜NEW CHALLENGER演出・復旧・毎時タスク修復

## 今回実装
- OTODAMA∞ 毎時開発タスク (6ade247b09e48191b4c6dd8ea15b39f1) が無効だったため再有効化。既存1時間ごとのスケジュールを維持し、最新アーケードPvP仕様・ユーザー体感・バグ修正・実テスト・毎回の引き継ぎを明記。
- アーケードPvP切替時にCPUバトルの進行と自動入力・BGMを停止し、NEW CHALLENGERの強い視覚演出と短い自作シンセ音を追加。
- 勝敗無関係のPvP→CPU復帰を維持。対人戦へ17秒以内に移行できない場合、通信切断/エラーを含めCPU戦へ自動復帰。再接続ループによる負荷を避けるため失敗後12秒のクールダウン。
- 対人戦中のマッチ再検索、CPU結果確定後の誤割込、背面での検索を抑止。
- メイン画面に加えてバトル画面ヘッダーに受付ON/OFFスイッチを設置し、両者の状態を同期、初期OFF、既存のゲーム画面・録音・バトルを保持。
- アーケード切替の実行動作を検証する test-handoff-v125.cjs を追加し、npm test:node と test:ui に登録。

## TEST_RESULTS
- JS埋込コードの構文検査PASS、GitHub Actions Test and Deploy OTODAMA Worker #118: test PASS（新規handoffを含むNode/V8回帰）。Cloudflare Worker本体は変更していないため、pushによるdeployは設計どおりskipped。
- GitHub Actions Verify OTODAMA live matchmaking #7: ライブWorker /health、2クライアントマッチ、room startとGitHub Pages公開接続先検証 PASS。
- 「コード上の画面遷移」と「Android実機・別端末2台での全行程の成功」は区別。Android実機での視認性、対人実戦の終了からCPU復帰までは未検証。

## NEXT_ACTIONS
1. 2端末でCPU→NEW CHALLENGER→PvP→CPU通し確認。通信断・端末スリープ・OFF切替レースも調べる。
2. optionalの旧ブラウザテストを最新のCPU自動戦/対人割込に合わせ、ブラウザの実UI検証をCIへ段階導入する。
3. CPUの戦術・演出とステージ変化・効果音をさらに改善し、モバイル処理性能と色/可読性を点検。
4. Cloudflare Workerはすでに公開済み。未公開と誤記しない。オンライン録音声の転送は安全審査実装まで停止継続。

---
# LATEST / 2026-10-27｜CPUアーケード・NEW CHALLENGER 自動割り込み（最優先仕様）

## CURRENT_STATUS
- 公開Worker: https://otodama-room.nekokichi005.workers.dev （無料枠、公開済み）
- GitHub Pages: https://techmew.github.io/games/otodama/ 。バックグラウンドにCloudflareランダムマッチ接続先を設定。
- ホームで「オートバトル開始」→ CPU自動連戦。CPU戦中に「オンライン挑戦者を受け付ける」ONならWebSocket対戦相手検索。見つかると NEW CHALLENGER → サーバー判定対人戦 → 勝敗に関係なくCPU戦へ復帰。対人戦中は新しい挑戦者検索禁止。
- オプトイン初期OFF（ローカルに保存）。単独のオンライン対戦ボタン/部屋対戦UIは非表示。ネット設定とランキングの詳細は維持。
- サバイバルは敗北で終了の独立モード。対人戦で割り込まれた場合は元のサバイバルラウンドを維持し、対人戦の勝敗をローカルサバイバルスコアに加えない。
- 接続再試行・前室切断・対戦中の復旧失敗ではCPUへ復帰する処理を追加。生録音音声の対人転送停止は継続。

## TEST_RESULTS
- GitHub Actions #111、#112、#113 の Node/V8総合回帰はPASS。追加 test-arcade-challenger.cjs はPvP敗北・勝利→CPU、サバイバル維持、二重マッチ検索防止などを検査。
- GitHub Actions公開実通信テスト #6 は成功（Worker /health、ランダム2 WebSocket同室コード、ルーム参加・live_start、Pagesに公開先が埋込済み）。
- 未確認：ユーザー端末2台での長時間実戦、Androidの全画面表示/通信切替/切断復帰、実マイク声品質。未検証を完成と表現しない。

## NEXT_ACTIONS
- 実ブラウザ2台で CPU→NEW CHALLENGER→PvP→CPU の表示と操作を検証。
- PvPマッチングON/OFF変更中のネット競合、通信断、画面非表示の自動復帰を点検。
- 旧「ランダムマッチ開始」単独ボタンを戻さない。CPUの連続自動バトルを維持。

---

# 声魂（こえだま） v0.10.14 追加開発 / 2026-10-26 19:00 JST — 安全なオンライン音声・キャンペーン報酬・回帰修復

## CURRENT_STATUS
- GitHub mainの `games/otodama/` のみ改修。既存の声生成、巨大な見た目の組合せ、名前、育成、録音停止/試聴（認識チェック済みのみ）、COM自動戦闘、勝利爆発・破片・WIN、勝利→次戦、敗北停止、Web Audio BGMを維持。
- 一礼なし・短い日本語セリフ1,000件を継続。COM/日替わり/サバイバルの勝利後は別の敵・ステージへ自動進行。
- Worker側の信頼できる音声内容審査が未実装のため、**オンラインでの録音声送受信を強制停止**。クライアントの検査フラグは信用しない。ローカルCOMのチェック済み録音声再生は維持。
- Cloudflare Workerは未公開。Android実機、外部二端末の動作確認は未実施。

## CHANGELOG
1. Worker `voice_policy` を `canSend:false,canReceive:false` に変更。送信された録音音声は内容にかかわらず `voice_rejected` を返し、他端末へ転送しない。
2. クライアントのオンライン送受信チェックを無効化し、未審査の音声は共有できないことを明示。サーバー側へ音声許諾 `false` のみ送る。
3. 日本語SpeechRecognitionの確定結果が重複通知されても一度だけカウントするよう修正。外部認識は明示的な許諾を要求し、未判定は録音音声を破棄。
4. 5連勝 +2XP、HP20%以下で勝利 +1XP、総能力が30以上高い相手を撃破 +1XPのキャンペーン報酬を追加。結果画面に表示し、従来のボス・ミッション・評価報酬と併用。
5. 旧セリフ・一礼・音声転送の期待値を持つテストを改修。test:nodeにtest-voice-review-v114.cjsを追加し、test:voiceも登録。
6. README、Workerの/health版数、package.jsonのバージョンを0.10.14に更新。

## TEST_RESULTS
- GitHub現行index.html埋込JavaScript・worker.jsをV8構文検査：PASS。
- V8モック実行：dialogue（1,000件の重複なし、TTS、勝利自動次戦、敗北停止）PASS、voice-review（認識、許諾、禁止語、旧クリップ拒否）PASS、moderation（410語、分割表記/通常語）PASS、UI source PASS、quality-v105/v106/v108 PASS、COM400戦+オンライン自動100ターン PASS、Room模擬（15秒復帰・席順・音声拒否）PASS、Matchmaker模擬 PASS、Survival模擬 PASS。キャンペーン3報酬の実行モックPASS。
- この環境のV8モックはNode CLI/Chromium/Android/Cloudflare実環境とは異なる。正式Node CLI全テスト（特にnode:sqlite）、Chromium、Android録音/TTS、Cloudflare本番デプロイ、独立2端末は**未実施**。
- GitHubコミットとソース再取得は実施。GitHub Pagesの最新ビルド/実ブラウザ配信は別途確認が必要。

## BLOCKERS
- Cloudflare公開にCLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKENの正規認証が必要。公開URL未設定。
- ブラウザSpeechRecognitionは認識漏れ・誤認識があり完全検出は保証不可。未審査の録音声は再生不可。オンライン録音声の安全な再開にはサーバー側の真正な音声審査が必要。
- 端末内音声認識の対応状況、外部認識への許諾、Androidマイクと音声再生は実機未確認。

## NEXT_ACTIONS
1. `npm run test:node` をNode環境で全実行（node:sqlite含む）、Chromiumで320/390px・横向き/保存/勝利次戦/敗北停止/マイクを確認。
2. Android Chromeで「ちんこ」等の禁止語を発音して拒否されるか、通常の発声が誤判定されないか、録音声が攻撃時に再生されるかを確認。
3. Cloudflare認証後Workerを公開し、/health、招待/ランダム、15秒復帰、音声転送拒否、ランキングを独立2端末で検証。
4. COM連戦の5連勝/逆転/格上報酬バランス、BGMと録音声のミックス、ステージ変化を実プレイで調整。

## GITHUB_COMMITS
- Workerオンライン音声拒否: 042eab6dd0e9a943e786de0083be28733f6cf60c
- UI音声許諾・ASR重複・版数: 0fdd9173a0d4cdd805be8f65acc0a4da5fe48b39
- キャンペーン報酬: 510703f743cd9ab6b7f2d6b210395bfbc8a00cdf
- Room音声拒否テスト: 5f9b5e3514d9ea79e25f0db089564f11dae4ff6f
- Voiceテスト改修: 8fd8e7d2866916f88ec48a6a5ee6ae5d3f35137d
- 報酬テスト: 5f09151bf91958168d8023e8fe3bcc35a5302089
- package/test:node: 4ab1d24f8427142f4964388066268763e2279bd2
- README: 6d69d841b38114ae69d20aea55c4b369ee77d7ef

---

# 声魂（こえだま） v0.10.14 / 2026-10-26 — 一礼なし・短いセリフ・発言内容の禁止語チェック

## CURRENT_STATUS
- GitHub main の games/otodama/のみ改修。勝敗後の日本語TTS吹き出し、500勝利+500敗北=1,000セリフ、勝利自動次戦・敗北結果停止、声生成/育成/音量/BGM/爆発/WIN/保存を維持。Cloudflare Worker本番未公開。
- 対戦前のお辞儀UI/アニメーション/待機タイマーを削除。COM・日替わり・サバイバルは対戦開始後すぐに自動戦闘へ。
- 録音した言葉を音声認識可能なら文字列化して禁止語チェック。録音声の再生・保存には認識済み判定を必須とする。端末内音声認識を優先し、ブラウザ外部認識サービスは明示的チェックボックス同意時のみ利用。音声認識非対応/失敗/未判定では音響特徴に基づき素体を生成し、未判定の生録音音声を保存・再生しない。
- 外部の録音声は現在サーバー側の真正な音声内容確認ができないため、オンライン生音声の送受信を一時無効化（Worker側でも拒否）。認識による誤判定・聞き逃しを完全には防げない。

## CHANGELOG
1. 一礼用 bowBanner、bowStartTimer、introDuration、描画前のbow分岐、CSSを撤去。
2. 勝利/敗北各500セリフを平均24.5文字（18～32文字）の短い自然な日本語へ再構成。1,000パターンの一意性を検査。勝利後は最低約3.35秒表示、読み上げが続く場合は最大約9.5秒まで待って自動次戦。敗北は結果画面で待機。
3. moderation.jsへisForbiddenSpeechを追加。辞書を名前と音声認識結果で共有し、カタカナ/全角半角/記号/空白/伸ばし音/主要な言い換えを判定。
4. 録音時にSpeechRecognitionを利用可能なら起動。処理が端末内にあると確認できる場合はローカル優先、そうでなければユーザー許諾がなければ認識せず、録音音声も保存・再生しない。
5. 禁止語認識時は録音音声と生成を破棄。未判定は素体生成のみ。過去の未審査クリップもclipDataで再生拒否し、オンラインの未審査音声転送/再生も停止。
6. UIに外部音声認識の利用許可（初期OFF）と非対応時の案内。test-dialogue-v113 / test-voice-review-v114 / test-moderationを改訂、READMEとバージョンを更新。

## TEST_RESULTS
- GitHub main埋込JS V8構文: PASS。短い1,000セリフの一意性・平均長: PASS。禁止語「ちんこ」「ち・ん・こ」「ちーんこ」「セックス」「sex」「p.e.n.i.s」の検出と通常語の過検知抑制をV8で確認。
- V8模擬テスト: dialogue, survival, UI source, quality-v105, quality-v106, quality-v108 全件PASS。音声認識/許諾/未判定時fail-closed/旧クリップ拒否は模擬テストPASS。GitHub再取得で変更ソースを確認。
- 正式Node CLI全テスト、実ブラウザマイク/SpeechRecognition、Android端末、録音音声の実際の検出精度、オンラインWorker本番配信、外部2端末は未検証。GitHub Pagesの成功は別途確認する。

## BLOCKERS
- Web Speech API 音声認識は端末依存、認識できた内容に漏れ・誤認識あり。ブラウザによっては外部音声認識に録音が転送されるため明示的許諾を要する。禁止語の音響的完全検知は保証不可。未判定の生録音は再生不可。
- 以前の録音声は審査結果フラグがないため再録音が必要。
- オンラインの音声共有はサーバー側音声検査の導入まで無効。Cloudflare Workerの認証/本番デプロイは未実施。

## NEXT_ACTIONS
1. Android Chromeで端末内認識/許諾後のブラウザ認識、禁止語録音の破棄、正常な声の再生、マイク権限・競合を実測する。
2. Android/Chromiumで勝敗吹き出しの短さ・実音声TTS・勝利自動次戦・敗北停止・画面縦横を検証。
3. Workerを本番公開後、オンラインで音声送信が拒否されることを二端末検証。真の音声モデレーション基盤ができるまでは共有を有効化しない。

## GITHUB_COMMITS
- Remove bow and shorten lines: f99b5bb1f8b5f12e85f3d0fd01be784dc3e5f7e8
- Shared speech moderation: 0d66e708e6fc79b6c18e5b57787d291ea88de5a5
- Speech recognition + consent UI: 25769ff95e12cbfa74e718f4254b74481efce6ec
- Reject forbidden/unrecognized clips: 508d69ed98c951a614e3126bbf6572f67d4335ac
- Guard legacy/peer clips: bc05d3c544fa5578c3ce9b95a7218269894ab791
- New speech test: fac766ab8153c6cd6e8f7be5c85f03974337ad2b
- Dialogue test revised: 2d709830c2e6156401407c84bd9c1511e29a8dc3
- Online audio denied server-side: 042eab6dd0e9a943e786de0083be28733f6cf60c
- README refresh: ce658d279c96c459138b276a60e1a115ad9a18f9

# 声魂（こえだま） v0.10.13 / 2026-10-26 — 日本語セリフ1,000種類・音声読み上げ・自動次戦

## CURRENT_STATUS
- 対象はGitHub main の games/otodama/のみ。COM/日替わり/サバイバルの既存オートバトル、音声生成/録音停止/試聴/攻撃音声、育成、勝利時爆発・破片・WIN、保存、オンラインWorker構成を維持。
- 以前は勝敗セリフそのものが未実装だったため、セリフ表示と日本語ブラウザTTSを今回新規実装。勝利時はセリフ再生後にCOM次戦（サバイバルは次ラウンド）へ自動進行。敗北時は結果画面を保持。Worker本番は未公開。

## CHANGELOG
1. 自然な日本語3文構成のセリフを勝利500種類・敗北500種類、合計1,000種類へ。各陣営10×10×5の組み合わせが重複しないことを検査し、500回周期のシーケンスを端末内へ保存。
2. 勝敗後に勝者名・吹き出し・セリフを表示。ブラウザSpeechSynthesisUtterance(lang=ja-JP)で日本語読み上げ。日本語音声優先、音量・ミュート・セリフON/OFF、明示的な再生ボタン、API非対応・自動再生制限時のガイドを追加。
3. 試合開始時の双方お辞儀アニメーション約1.95秒と案内を追加。終了時の既存爆発・WINを表示後、約1.35秒から勝敗セリフを表示・読み上げ。
4. 勝者はセリフを見せて最低約5.1秒後、再生中なら最大約12.5秒まで読み上げを待ち、次のCOM戦/サバイバル/日替わり後の冒険へ自動進行。敗北後は自動タイマーを作らず止め、再挑戦は任意のクリックのみ。
5. バックグラウンド中は勝利による自動進行を止め、復帰後にセリフ再生と次戦待ち時間を再設定。開始前のお辞儀タイマーも非表示復帰でずれないよう調整。音声ボタン直接操作では既存ミュートを明示的に解除可能。
6. 新test-dialogue-v113.cjsを追加、test-survival-v109.cjs旧3秒タイマー期待値を更新、npm test:dialogue / npm test:nodeへ組み込み、READMEとバージョンv0.10.13を更新。

## TEST_RESULTS
- GitHub mainの埋込JavaScriptとWorkerをV8構文検査PASS。新テストのV8モック検証で1,000種類一意性・TTS ja-JP・リプレイ・自動次戦・敗北停止・ミュート・お辞儀のソースをPASS。改訂サバイバルテストのV8モック検証PASS。
- 更新後のGitHubソースとテストは再取得済み。正式Node CLI全テスト、Chromium実操作、Android実機のTTS/録音/縦横、外部2端末とCloudflare本番Workerは未実施。SpeechSynthesisの端末音声は利用環境に依存し、V8モックだけでは実機発声成功を保証できない。

## BLOCKERS
- Android端末での実際の日本語TTSの音声再生と読み上げ品質、ブラウザ自動再生制限の確認が未実施。日本語TTS音声がない端末では読み上げ不可だが吹き出しは表示する。
- Cloudflare Worker本番公開には本人認証とGitHub Secretsが必要。オンライン外部2端末動作未確認。
- 一部過去の任意ブラウザテストは手動操作・次戦バフが有効だった旧仕様を前提とするため、観戦型の新シナリオへの移行が必要。

## NEXT_ACTIONS
1. Android Chromeで日本語TTS設定・自動読み上げ/再生ボタン・勝利後次戦・敗北停止・縦横/320px・録音声競合を実確認。音声が出ない端末では日本語TTS音声の設定を案内。
2. Chromiumで開始前のお辞儀、爆発/WIN、セリフ表示約1.35秒、音声終了後の自動次戦、連戦・画面非表示復帰を自動検証。旧任意ブラウザテストの手動操作前提を変更。
3. Cloudflare公開後、オンライン勝利後の自動マッチングと二端末の読み上げ同意/音声を検証。

## GITHUB_COMMITS
- Dialogue implementation: 0ded33906d63de0fbe0531c421a3c413254a1ea2
- Bow/visibility/TTS preparation: 2b02e7d34dbe9e603f024aa16b0f26e4dadcd6b0
- Dialogue regression test: 42f7f5071b7c9ba36c87be255f3922adb34f0371
- Updated survival regression: f52df04e714ceadd742b7310b26bc992a0a4a460
- npm test scripts: 77093d4d9ef587e9354fc2f29b2c1a4c97aac882
- v0.10.13 index/package/quality marker commits: 509e805984f9bc447a081d1440b6302a8d3d49d4 / bdd8e3d51e8e801f5ed3ec7f843729e073c6bd04 / afb33527430a19b60206dab8c77f90df6fd7ebc6 / c755545e73da7337dd374f22245fb328940770cc
- Background dialogue resume/replay unmute fix: 3f51f7f6617b678bec09bd60c175529c628b0246
- README: fca16e6b154fe63284c4216d0ae5643f29845ecb

# 声魂（こえだま） v0.10.12 / 2026-10-26 18時台 JST

## CURRENT_STATUS
- games/otodama/のみ更新。COM・日替わり・サバイバルは素体能力によるオート戦闘。オンラインは新クライアントからautoOnly要求が届くとWorkerが手動入力を拒否し、能力ベースの自動攻防をサーバー裁定する構成。Cloudflare Worker本番未公開。
- 声生成/録音停止・試聴・攻撃音声/外見組合せ/育成/連戦/敗者爆発・破片/WIN/セーブ互換は維持。

## CHANGELOG
1. COMの入力タイミング円、操作説明、次戦バフを非表示・無効化。防御・反撃・反射ダメージ集計とミッション17～20の整合性を修正。
2. 6戦型・性格、能力/属性に基づく自動攻防、必殺技、瀕死覚醒、レベル進化、希少変異、負傷ひび、覚醒オーラ、戦況実況を実装。
3. Worker側autoOnly：片方が要求すれば両者をサーバー自動戦闘に統一。登録済み双方のランキング戦も自動判定。防御/回避/必殺/覚醒をサーバーで決定し、手動アクションを拒否。旧クライアント同士の非ランキング戦は従来互換。
4. オンラインの相手攻撃音声再生、覚醒通知・再接続時の覚醒状態復元、2席向きの通知変換。
5. test-creature-auto.cjs新設、旧テスト修正、npm run test:auto / npm run test:node追加、README・バージョン更新。
6. 地形5ターンごとの持続効果（回避率・与ダメージ・技ゲージ・連続攻撃）をCOM戦闘ロジックへ導入。400戦のV8模擬で地形継続とHPを確認。

## TEST_RESULTS
- GitHub connector内のV8: index埋込JS・Worker構文PASS。COM 1000戦、オンライン自動120ターンPASS。新回帰テスト400戦＋100ターンをNode APIモックでPASS。旧UI/品質4件、サバイバル1件のV8模擬PASS。
- GitHub Pagesビルド: commit 5ce5224f62ab44eb9d97cfed1e0385131054b499 でsuccess。ライブURLのブラウザ操作確認とは異なる。
- Node CLI全テスト/Chromium/Android実機/Cloudflare本番/外部2端末は未実施。

## BLOCKERS
- Cloudflare所有者認証とActions Secrets（CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN）未確認。Worker本番未公開。
- 声特徴量の真正性と録音発話の禁止語自動文字起こしは未保証。オンラインランキングは競技用途の公正性を保証しない。

## NEXT_ACTIONS
1. npm run test:node全実行、Chromium縦横・録音/音量・保存/次戦・観戦UI確認、Android実機検証。
2. WorkerをCloudflare Freeへ公開後、/health・ランダム/招待・2端末・切断復帰・ランキングの実回線検証。
3. 旧UIの文言整理、長時間バランス、BGM・SEの変化と負荷を調整。

## GITHUB_COMMITS
- index: 345e8919874cfd919a4cd0c00c8914f69ef59517
- worker: 4e69642bfed27feb77adc8b1d30b286d8c810a40
- tests: 8e5e291c56c0ccc05830da76935f419c99876234
- README: 5ce5224f62ab44eb9d97cfed1e0385131054b499

---

# 声魂（こえだま） v0.10.11 / 2026-10-26 17時台 JST

## CURRENT_STATUS
- games/otodama/のみ変更。声生成・録音/試聴/攻撃声・外見/名前・育成・COM連戦/サバイバル・爆発/WIN・旧セーブ互換を保持。Cloudflare Workerは未公開。

## CHANGELOG
1. サバイバル操作報酬：無被弾80、ガード2回50、回避2回50、必殺1回40ポイント。複数達成可能、結果に内訳表示。オンラインはローカル統計加点なし。
2. 次戦約3秒表示と画面復帰待ち案内。
3. Room未参加WebSocketの30秒alarm自動清掃。
4. Matchmaker未検索30秒/検索中120秒のalarm自動清掃と既存期限保護。
5. Matchmaker10秒20件超の連投を切断。
6. ランキング禁止語名をサーバー422拒否。テスト・README・バージョン更新。

## TEST_RESULTS
- V8構文検査：HTML埋込JS/Worker/Nodeテスト。V8模擬：操作報酬、キュー期限・連投拒否、禁止語422。
- GitHubコミット・再取得結果とSHAはDrive最新ログを参照。正式Node全テスト、Chromium/Android/Cloudflare本番/外部2端末/ライブ実操作は未実施。

## BLOCKERS
- Cloudflare認証とSecrets CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN、Worker URL未確認。音声文字起こし禁止語審査なし。

## NEXT_ACTIONS
- Node全回帰/Chromium・Androidで録音・攻撃声・BGM・保存・縦横・次戦・報酬、Worker公開後に2端末ランダム/招待/再接続/順位を確認。

# 声魂（こえだま） / v0.10.10 / 2026-10-26 16時台 JST — サバイバル連戦・BGM・ランキング入力保護

## CURRENT_STATUS
- GitHub main の games/otodama/ のみ変更。声生成、録音停止/試聴/攻撃時再生、外見・名前生成、COMキャンペーン、サバイバル、WIN/敗者爆発、育成、旧セーブ形式は維持。
- Cloudflare Worker/Durable Objectsはソースのみで本番未公開。ランキングの全ユーザー共有と外部2端末対戦は利用確認できない。
- GitHub Pages Actionsは head da707611fa88d7e403fe8aa2b049beee391dc5c5 で成功。ただしライブページ直接操作・Android実機は未検証。

## CHANGELOG
1. サバイバルに5勝ごとの節目報酬（5勝目+300pt、10勝目+350pt、以後+50pt）と次のボーナスまでの勝数表示。
2. 勝利後、非表示タブで次の戦闘を自動開始しないよう保留し、表示復帰時に次戦へ進む。従来の手動次戦ボタンも維持。
3. サバイバル敗北・退出で自動操作を停止し、他モードへの誤った自動操作継続を防止。
4. サバイバル中のオンライン挑戦者勝利後にもスタートボタンで次戦に進める。端末内TOP5履歴を読み込み時に得点順へ整列。
5. 自作Web Audio BGMの開始フレーズをステージに応じ8段階で切替え、毎戦同じイントロになる単調さを軽減。音量・ミュート・録音音声は変更なし。
6. 匿名ランキング再登録時に既存ID・記録が引き継がれないことを確認するダイアログを追加。
7. Worker /identityをJSON Content-Type必須、512バイト上限（chunkedでもストリームで制限）とし、不正/巨大入力を早期拒否。
8. Roomの同時ready処理に対戦開始ロックを追加し、二重開始競合を抑止。登録レート制限の48時間超過bucketを掃除。
9. Node回帰テストに登録入力の容量・MIME拒否、サバイバル5勝報酬・敗北自動停止・非表示タブ延期を追加。ゲーム/Worker/package/README/DEPLOY_GUIDEをv0.10.10に更新。

## TEST_RESULTS
- GitHub main更新後のHTML埋込JavaScript/WorkerのV8構文チェック PASS。対象変更ファイルをGitHubから再取得し、返却blob SHAと一致。
- V8の模擬DOM/タイマーでサバイバル5連勝1600pt（節目+300）、非表示タブ次戦延期、表示後の次戦呼出、敗北で自動OFF、端末内履歴保存を確認 PASS。
- V8の模擬HTTP/ストリームでWorker /identityの通常登録、512バイト超拒否、MIME拒否、Origin拒否、/healthを確認 PASS。
- V8の模擬Room同時readyで開始1回のみを確認 PASS。
- test-survival-v109.cjs / test-rankings-v109.cjsを拡張したが**正式Nodeでの実行は未実施**。Chromium/Android/外部2端末/Cloudflare本番Worker/WebSocket/SQLite本番実行は未実施。V8模擬テストは実機確認ではない。
- GitHub Pages Actions成功： https://github.com/techmew/techmew.github.io/actions/runs/40284130397 （対象head da707611fa88d7e403fe8aa2b049beee391dc5c5）。公開ページへの直接アクセス・実操作は未検証。

## BLOCKERS
- Cloudflare認証とActions Secrets CLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKEN、公開Worker URLが未設定。秘密はGitHubソースやログに記載しない。
- Android実機・独立二端末と本番Cloudflareの接続・録音・同期テストは実施不可。
- 録音発話そのものの自動文字起こし・禁止語検知は未実装。匿名多重登録や談合を完全には防げない。

## NEXT_ACTIONS
1. 正式Node22の全ゲーム/Room/Matchmaker/Rankings/Moderation回帰を実行し、失敗があれば修正。Chromiumの縦横・録音停止/試聴・攻撃音声・ミュート・次戦・サバイバル長時間動作を確認。
2. Cloudflare Freeへデプロイ後、/health・/identity・/leaderboard・ランダム/招待・切断復帰・外部2端末の同期/音声同意/ランキング加点を実測。
3. 5連勝報酬とBGM開始フレーズ、AUTO戦闘の勝率・端末負荷・音量を長時間実測して調整。
4. 登録スパム、同一端末/ネットワークの連続登録、Room ready競合の本番負荷を検証。

## GITHUB_COMMITS
- Survival fixes: b967b3832ff9d3bd48ff0cdadb0b200931dcd18d
- BGM variation: 30e465a9b833d3f44d8be940cfcd603444648d30
- Worker hardening: b4de9b10a2c23ed68e48f9e796be1f29270a8c80
- Regression tests: e2a480816a622f75749ecd27ccd63244f053ab7b / 71730d8cf798ee5a769a37d7f173afc00a678a0e
- Legacy quality test version markers: 32ce724c8c91cbc8716cc3c40ac943b652836d56 / 0ca5e9d2054e4ed600e37dfcd7fde9e7ef632e52
- Versions/docs: 2c72a57b005554d19fb6c521f8ec98489c76c0be / 19dc0af659c525b431ec332bc8c2c2f3d39bfe60 / 04c79a9686c219886d93502b3618380d93aa524a / e3a9dd77b2ec47ef1730cc29f484e6cb3b2c9b7b / c47842b65c5dc3e565dbd377d6db510c1f11e9bc / da707611fa88d7e403fe8aa2b049beee391dc5c5

---

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

---

## 2026-10-26 / Match introduction display fix

### CURRENT_STATUS
- GitHub main games/otodama/index.html に試合開始前の中央オーバーレイ「第〇試合目！」を追加。
- COMは現行ステージ番号、SURVIVALはラウンド番号、その他は1を表示。
- 前回のテキストだけの変更は即座に初回攻撃に上書きされる問題があったため、開始処理を1500ms遅延させて修正。
- オンラインLIVEはサーバーの最初のターン受信時に表示を解除し、対戦同期を遅延しない。

### CHANGELOG
- 試合開始前に画面中央へ大きく表示する matchIntro オーバーレイを追加（スマホ幅・アニメーション軽減設定に対応）。
- 新規対戦・画面クローズ・バトル終了・オンライン初ターンで表示とタイマーをクリアし、前の試合からの残留を防止。

### TEST_RESULTS
- GitHub main 保存後の index.html 再取得と JavaScript 構文パース: PASS。
- オーバーレイ要素、1500ms導入処理、オンライン初ターン解除、終了・クローズ解除のソース検査: PASS。
- GitHub Pages実配信は外部取得制限により未確認。Android実機画面・実プレイの挙動は未検証。

### BLOCKERS
- 本番サイトの実際の表示・Androidブラウザでの動作を本ツール環境から直接確認できていない。

### NEXT_ACTIONS
- Pages最新配信反映後にCOM第1〜3試合と敗北後をブラウザ実機で確認。
- オンライン公開後にLIVE開始時の導入表示が通信を阻害しないことを二端末で確認。

### GITHUB_COMMITS
- index.html: `d01bf85341f41655d0c6f8ba74653fdb37a76862`

---

# 声魂（こえだま）/ 2026-10-26 夜 / 戦闘音声復旧・連打ラッシュ

## CURRENT_STATUS
- GitHub main games/otodama/ に録音声音量補正・連続攻撃の多重声再生・時折発動する「必殺技 連打ラッシュ！」を追加。
- 声生成、録音・手動停止・試聴、既存の通常攻撃、勝利後次戦、敗北画面停止、巨大外見、育成、爆発・破片・WINは置き換えず維持。
- 前回実装の中央「第〇試合目！」オーバーレイと1.5秒後のCOM戦開始を維持。
- 既存Cloudflareオンライン音声共有停止/相手ミュート/サーバー裁定は維持。本番Worker未公開。

## CHANGELOG
1. 録音波形の明瞭な0.7秒区間から実効RMSとピークを測定し、弱いマイク入力に最大8倍の音量補正。無音素材は明示的な代替音へ。
2. Web AudioのGainNode/BufferSourceを攻撃ごと独立し、通常攻撃は1声、連続攻撃では最大5声を108msずらして重ねて再生。
3. 必殺技発動時の確率1/3の「連打ラッシュ」は7回の短い録音声を重ね、中央に短時間専用演出。既存の実ダメージ/オンラインサーバー計算は変更しない。
4. Dynam​​icsCompressorの音圧制限、同時音源最大14個、対戦終了/次戦の停止、録音声デコードの前読み・別試合移行時の遅延再生抑制を追加。
5. 生音声がないキャラには発声合成による複数ヒット音で代替。録音声がある場合は同じ録音データを連続再生。
6. 戦闘UIに「🔊 声を再開」ボタン。端末の自動再生制限やミュート/音量ゼロ状態から明示操作で回復可能。
7. Nodeの音声回帰テスト test-voice-rush.cjs、UI静的チェック追加。package.jsonの test:node / test:voice に登録。

## TEST_RESULTS
- GitHub main index.html取得→V8のJavaScript構文パース PASS。
- WebAudioモックで静かな録音の正規化(8倍)、通常1回・コンボ5回・必殺ラッシュ7回の独立した音源起動、発声代替、オンライン相手ミュート、終了後再生拒否、二重必殺阻止を検証 PASS。
- test-voice-rush.cjs/test-ui-source.cjs の構文パース PASS。全更新ファイルをGitHub mainから再取得しblob SHAの存在を確認 PASS。
- Node正式test:nodeの実行、Chromium実プレイ/音声出力、Android実機での録音・スピーカー・音量、実公開URLの音声検証は今回未実施。音が実機で回復したかはまだ未確認。

## BLOCKERS
- Android等実スピーカーの音声はこの環境から再生して確認できない。
- Cloudflareの実公開にはアカウント認証とActions Secretsの設定が必要。外部二端末対戦未検証。

## NEXT_ACTIONS
1. Androidで録音 → 試聴 → 戦闘第1〜3試合の発声量、連打/必殺、勝利時セリフ、ミュート/再開を耳で確認。
2. ブラウザChromiumで音声許可/禁止、タブ復帰、試合切替、録音/録音なし、ソロ/オンライン音声隔離を検証。
3. Node正式 test:node/test:voice とCloudflare本番公開・独立二端末対戦を実施（Cloudflare認証が必要）。

## GITHUB_COMMITS
- UI声・ラッシュ: bd0436a9840b72b892596c15c5f99a9273fdab0c
- 録音声正規化: d6550d48b3753851c43370ac8a9d842c74aa09a6
- 新回帰テスト: f44ce42f9057a1d56a36cdc01c26d3dd74f36080
- package: 550911d5e5c5aa010be394905b91a33057c674a4
- UI静的チェック: a8c920c2bcda4a80b7a77d7bbc6fb4f8bef5b581

---

# 声魂（こえだま）/ v0.10.16 / 2026-10-26 20時台 JST / 毎時品質改善

## CURRENT_STATUS
- GitHub mainのgames/otodama/現行 index.html / worker.js / wrangler.jsonc / README / package / test群と、Driveの最新OTODAMA_v101_RUN_REPORT_20261026（末尾v0.10.14の引き継ぎ）を実読してから更新。
- 声生成・外見の組合せ・多数の名前・録音停止/試聴・育成・COM/サバイバル連戦・敗者爆発/破片/WIN・自作Web Audio BGM・短い日本語勝敗セリフを保持。勝利後は次の相手へ自動進行、敗北時は結果画面で停止。
- オンラインWorker/Durable Objectsソースとテストは維持。本番Cloudflare Workerは未公開、Android/外部二端末は未検証。

## CHANGELOG
1. 録音時MediaRecorder形式を同端末のAudioContextでデコード確認。保存不能/非対応時はScriptProcessorで集めたPCMを11,025Hz/16bit/モノラルWAVとして保存する代替経路。無音の録音は保存しない。マイク許可中の二重起動を防止。
2. Web Audioが自動再生制限でsuspendedに戻った場合、画面タップ/キー入力でresume。音声再開ボタンの表示をAudioContextのrunning/停止/ミュートに連動。
3. 連打ラッシュに1〜7 HITの進行表示と終了タイマーの確実な後始末を追加。録音声の通常1回/連打5回/必殺7回の音源多重再生は維持。
4. COMに第〇試合目・章・ボスまでの残り試合数・5試合進捗を表示。勝利後の次戦/敗北停止・セリフを変更しない。
5. オンライン同一live_turnの重複受信で録音声を再生し直さないよう修正。live_impactの二重反映・不正HP/ダメージを拒否。再接続resumedは再同期可能。
6. Workerで8192文字超のWebSocketパケットをJSON解析前に1009で切断。録音音声のオンライン送受信は引き続き停止。
7. test-hourly-v116.cjs追加（PCM WAV・章/ボス進捗・7 HIT・重複オンライン通知・Workerサイズ制限・勝利次戦）。package test:node/test:voiceに登録。旧品質テストのバージョン固定判定を将来互換に修正。
8. 専用GitHub Actions .github/workflows/deploy-otodama-worker.yml にmainのgames/otodama変更時Node 22 test:node自動テストを追加。Cloudflare公開は手動workflow_dispatchかつテスト成功時のみ。Secretsがなければ公開しない。
9. 表示/Worker health/packageをv0.10.16に整合。README/DEPLOY_GUIDEを現行の「録音音声自動審査なし・オンライン音声転送停止・オート対戦」へ訂正。旧節は履歴と明示。

## TEST_RESULTS
- GitHub mainから全更新ファイルを再取得。index.html埋込JavaScript/worker.js（import/exportを構文検証用に置換）/更新CJSのV8構文パースPASS。
- V8上のNode API模擬で新test-hourly-v116.cjsを38アサーションPASS（WAV RIFFヘッダ/11025Hz/16bit/無音拒否/5戦ボス進捗/7 HIT/重複ターン・命中防止/自動次戦ソース）。
- Web Audioモックで通常録音声1音源、連打5音源、必殺7音源＝計13音源PASS。勝利500＋敗北500の日本語セリフ一意性PASS。
- GitHub Actions workflowは保存したが、Actions上での実行結果を取得できていない。正式Node CLI test:node/test:voice、Chromium実プレイ、GitHub Pages配信反映、Android実機音声、Cloudflare Worker本番、外部二端末は今回未確認。

## BLOCKERS
- 本番Cloudflare公開は所有者のCLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKENをGitHub Actions Secretsに設定する必要あり。値はソースやログへ書かない。
- Android実機の録音・PCMフォールバック・スピーカー再生・日本語TTSと、独立二端末のWebSocket対戦は未検証。
- 現行は録音発話の自動文字起こし・禁止語判定なし。録音注意文を表示。オンライン録音音声はWorkerが拒否。

## NEXT_ACTIONS
1. ActionsのTest and Deploy OTODAMA Worker（push実行）結果を確認し、失敗時はテスト/ゲームを修正。Node test:node/test:voiceを実CLIで検証。
2. Android/Chromiumでマイク許可・録音/試聴・録音WAV代替・通常/5連打/7連打・音声ON/OFF・BGM/読み上げ競合・縦横表示を確認。
3. COM第1〜5戦の進捗・ボス・勝利自動次戦/敗北停止・旧セーブを実ブラウザで確認。
4. Cloudflare認証後にWorkerを手動公開、/health v0.10.16、ランダム/招待/15秒復帰/重複ターン/8192文字超拒否/ランキング/音声非転送を独立2端末で検証。

## GITHUB_COMMITS
- PCM WAV代替/録音二重起動防止: da25f582b4a49e5eae39a830127140d0d4e3bfb1
- 章進捗/7 HIT/オンライン重複防止: 0a80b8a009c1f6e86cf2038f538358123c93a32b
- 音声ジェスチャー再開: e4d9497cc4f625a124575952868b3e1a64486709
- Workerサイズ制限: 8bd53a25facca1ea367c9d73b6bcb0d8fe4db6a7
- 新回帰テスト: 9b1a66f12e201683de4453e59dd075c59582161c / 5351f11c2a07fd58c56f581f1cbd4e1a8fe9922d
- バージョン/テスト更新: 69fe4eb1bdd297c5d010400f24473264752e4d40 / 2215b01058b9a5df4bb64de7f48491d98cef082e / b81430471d0e3bd45ec375d03ec44c9ea5af9590 / 396b1cf6356ea189ee282833b8d7eb489d7677bb / 8f1984e749db363ca1313cf50bb257fcf629235c / 45e56580eefa7d8118e0cf8e1b0cf3250bdebdd3
- README/DEPLOY_GUIDE: a3cf7e6693e7d98134135a5b3af0feb0f1210dee / c52d43627f1020ba88037bae0274901775d9dc29
- GitHub Actions: 1eda0a7e515cb8a304652aee50ed798138ee6843

GitHubがゲームソースの正本、Driveが引き継ぎの正本。GitHubコミット・模擬テスト・Actions実行・Pages配信・Android/外部二端末実機検証を混同しない。

---

# 声魂（こえだま）v0.10.17 / 2026-10-26 21時台 JST / 毎時品質改善

## CURRENT_STATUS
- GitHub mainの games/otodama/index.html、worker.js、wrangler.jsonc、README、DEPLOY_GUIDE、package、関連テスト群、Drive最新「OTODAMA_v101_RUN_REPORT_20261026」の末尾v0.10.16ログを先に実読。
- 声生成、巨大外見・数千万の名前、録音/停止/試聴、1〜7連打、勝敗セリフ、COM/サバイバル勝利自動次戦・敗北停止、BGM、育成、セーブ、爆発/破片/WINを維持。
- Worker/Matchmaker/RankingsのコードはGitHubに保存済み。Cloudflare本番Workerは未公開。

## CHANGELOG
1. 録音音声・合成声とも、2 HIT攻撃で2音源を時間差再生。従来の通常1声/5連打/必殺7連打も維持。
2. 戦闘音量0%時に「声の音量 0%」と表示し、AudioContext稼働中でも無音であることを明示。音量スライダー操作と状態表示を同期。
3. オンライン再接続で解決済みターンの予兆を受信しても、ダメージ確定状態を巻き戻さない。
4. オンライン命中通知の攻撃者が現在の予兆と異なる場合は破棄。異常なゲージ値は反映せず、命中処理と重複防止は維持。
5. Room WebSocketは文字数だけでなくUTF-8バイト数で8192Bを制限。JSON解析前に送信回数を計上し、壊れたJSON連投でレート制限を回避できる問題を修正。
6. MatchmakerはUTF-8 256B超を1009で切断、バイナリパケットを1003で切断。既存の20回/10秒制限を維持。
7. 新回帰テスト test-hourly-v117.cjs を追加し、packageの test:node/test:voice に登録。既存 test-room.cjs / test-matchmaker.cjs のVM環境へTextEncoderを注入して新しいWorker検証に対応。
8. index/Worker health/package/README/DEPLOY_GUIDEをv0.10.17に整合。

## TEST_RESULTS
- GitHub main再取得した埋込JavaScript/Worker（Cloudflare importをテスト用に置換）/更新CJSのV8構文検証 PASS。
- 実際の新test-hourly-v117.cjsソースをV8のNode API互換モックで実行 PASS。録音声1/2/5/7回、音量0%/稼働/停止、解決済み再接続、攻撃側不一致、異常ゲージ、二重命中、Room 31件/10秒制限、UTF-8サイズ、バイナリ拒否、Matchmaker 21件/10秒制限を検証。
- GitHub mainの変更ファイル再取得とblob確認を実施。
- **正式なNode CLI npm run test:node/test:voice、GitHub Actions成功、Chromium実ブラウザ、GitHub Pages実配信、Android実機、Cloudflare本番、独立二端末は未確認**。V8モック成功はこれらを代替しない。
- ライブURLとGitHub Actionsページはこの実行環境から直接取得できず、配信結果は未確認。

## BLOCKERS
- Cloudflare公開には所有者のCLOUDFLARE_ACCOUNT_ID/CLOUDFLARE_API_TOKENをGitHub Actions Secretsに設定する必要あり。Worker URL未設定、本番オンライン未公開。
- 録音発話の文字起こし・禁止語自動審査は現行未実装。オンライン録音声の転送は引き続き停止。
- Androidの実マイク/スピーカー、日本語TTS、外部二端末の通信を本実行環境から確認できない。

## NEXT_ACTIONS
1. GitHub Actionsの「Deploy OTODAMA Worker」pushテストと Node22 test:node/test:voice の実結果を確認し、失敗があれば修正。
2. Android/Chromiumで録音/停止/試聴、1/2/5/7音声、ミュート/0%/復帰、縦横画面、旧セーブを実操作。
3. COM第1〜5戦のボス進捗、勝利自動次戦、敗北停止、BGM、勝利演出を実ブラウザ検証。
4. Cloudflare認証後にWorkerを手動公開し、/health v0.10.17、二端末ランダム/招待/15秒復帰/ランキング/不正パケット拒否/録音音声非転送を確認。

## GITHUB_COMMITS
- index音声/オンライン防御: f84c57b15c5da07891bf5b45074d31147632506b
- worker UTF-8/レート: 3669c563f3fb16ed6c70793b5e06da212020ab06
- v117テスト: 1980cd1dfbad2ef28d34903ded279444ec1c6903 / f5377867e87da77f146050529c5bdcadb8f6be4a
- package: eb7901f12b92b759a3d0d5721f021c7b62ba3a19
- index version: a0e3dd1eca23aa459d0a297ced299179f1ae9a4d
- worker version: 78bf427028515f5be7c77a434f8e84dac1cb154b
- README: 3209d0c9c5ae37b205b14c414ce94b86be4d0d38
- DEPLOY_GUIDE: 2ef2751ea5ce57fca77e47b025dd7de1bed6ce53
- test-room VM: 28a0b4bb3c445bc77758e4ce6195a756ae45931d
- test-matchmaker VM: d2b3b86e4acc102fbd2d50f4579f2d90bf7b6b12

GitHubがコード正本、Driveが引き継ぎ正本。コミット/模擬テスト/正式Node/Actions/Pages/Android/本番Workerを区別する。

---

# 声魂 v0.10.18 / 2026-10-26 21時台 JST / 勝者の雄叫び・CPU戦だけ文字セリフ

## CURRENT_STATUS
- GitHub main games/otodama/ のみ改修。録音生成/停止/試聴、1/2/5/7連打、オート対戦・勝利自動次戦/敗北停止、育成、セーブ、爆発・破片・WIN、BGM、オンライン音声共有停止を維持。
- 勝敗の勝者が雄叫びを上げる。自分の録音済み・利用可能な声は短い断片を音程を下げて2層再生し、録音がないCPU・オンライン対戦相手はWeb Audio合成雄叫びで代替。
- COM/日替わり/ローカルサバイバルだけ文字セリフ（500勝・500敗の計1000種類）を表示し、セリフ音声読み上げ(TTS)は無効化。オンラインは文字セリフを生成・表示しない。生録音のオンライン共有は引き続き禁止。
- Cloudflare Workers/Durable Objectsは本番未公開。Android実機/独立2端末は未検証。

## CHANGELOG
1. showBattleQuoteをCPU文字セリフと共通の勝者雄叫びに改修。結果再生開始は勝敗確定から520ms。
2. 録音声の0.7秒区間をピッチ0.88/0.78倍、320ms差の2層で1秒超の雄叫びとして再生。録音なし・利用不可ならキャラ声特徴による1.04秒の合成雄叫び。
3. 試合中の攻撃ボイス・試聴と勝利後の雄叫びを分離。再生結果は別試合移行・画面非表示・停止・相手ミュート・録音デコード遅延により不正に混ざらない。声の出力は既存リミッター使用。
4. 結果画面の独立した「雄叫びをもう一度鳴らす」ボタンと雄叫びON/OFF設定を追加。再試聴はミュート/音量0%を補正し、AudioContext suspended復旧に対応。
5. オンライン音声プライバシー文言を現行の転送禁止・端末内再生に修正。モバイル320pxでは結果ボタンを折り返して配置。
6. 勝者の雄叫び終了を考慮した自動次戦タイマーに変更。敗北側は画面停止を維持。戻ってきた際の結果文字セリフの再抽選を防止。
7. test-dialogue-v113.cjsを新仕様へ修正し、V8でCPU文字1000件一意性・自己勝利の録音2層・CPU敗北の合成雄叫び・オンライン文字無し・相手声ミュート・終了後の次戦/停止・音声再生・タブ復帰・デコード遅延・AudioContext復帰を検証。
8. READMEとpackage/client表示バージョンをv0.10.18に更新（Workerコードは非変更、Worker healthはv0.10.17）。

## TEST_RESULTS
- GitHub mainから index.html / test-dialogue-v113.cjs / package.json 再取得、HTML埋込JavaScriptおよび改修テストのV8構文検証：PASS。
- test-dialogue-v113.cjsのシナリオをFSとWeb Audioを模擬したV8上で実行：PASS。CPUだけ文字、オンライン文字なし、録音2層・録音なし合成音、読み上げなし、ミュート、再試聴、自動次戦、敗北停止、タブ復帰、デコード後の旧試合音声拒否、suspended復帰を検証。
- npm run test:node / test:voiceをNode CLIで直接実行した結果、Chromiumでの実表示・音声、公開Pagesの最新配信、Android実機の音声、Cloudflare本番、外部二端末は今回未検証。V8モックを実機検証と混同しない。

## BLOCKERS
- 公開オンラインサーバーの音声転送は禁止されているため、対戦相手の実際の録音生声は受信できない。相手側の雄叫びは合成音で代替。
- Androidで録音声が自然な雄叫びに聞こえるか/音量が適切かの実聴テストは未実施。
- Cloudflare認証とActions SecretsがないとWorker本番公開はできない。

## NEXT_ACTIONS
1. AndroidとChromiumで勝利/敗北のWIN画面と録音声2層雄叫び、ミュート・リプレイ・画面復帰・連戦、スピーカー/イヤホンの音量を確認。
2. GitHub Actionsで test:node / test:voice を正式実行し、必要なら既存テストを新仕様に合わせて更新。
3. Cloudflare認証後Worker本番公開/health/ランダム・招待・15秒再接続/ランキングを独立2端末で確認。生録音共有は審査実装まで停止を維持。

## GITHUB_COMMITS
- game result logic: a3f130506b17f056f7ad7324fd6ba4f9f444032e
- mobile/UI/privacy: 52f665ce110382592b8f971e8d27311ea49476ef
- AudioContext recovery: 5fe9087d4794d77ae306093c70f7d570333d05c5
- dialogue regression: 226355b43c66b997fbeea114b9152bccad8a0793 / 7dce80eff384d9ae1133ae70d60f29b02855dc9f
- package: 22eaf050571c233441f2993cd76a7a084e8a2795
- README: d6d2b6e0fef73261709c31df67dc34a793c41ba9

GitHubはソース正本。Driveに同内容を保存する。ブラウザ/本番未検証を確認済みと表記しない。


---

# 声魂 v0.10.19 / 2026-10-26 22時台 JST / 発話審査・禁止語・公開名対策

## CURRENT_STATUS
- GitHub main の games/otodama/ index.html, worker.js, moderation.js, wrangler.jsonc, README, package.json, test群, PROGRESS と Drive最新「OTODAMA_v101_RUN_REPORT_20261026」末尾v0.10.18を実読してから改修。
- 既存の声による素体生成、巨大外見・名前、録音停止/試聴、1/2/5/7 HIT声、COM/サバイバル勝利後の次戦、敗北停止、育成、爆発/破片/WIN、自作BGM、保存を維持。
- 録音発話の日本語音声認識と禁止語照合を復旧。端末内認識優先、外部認識は初期OFFの明示同意。審査失敗/非対応は素体生成のみ、録音声は保存/再生しない。オンライン生録音転送は引き続き禁止。Cloudflare本番未公開。

## CHANGELOG
1. 禁止語を辞書559エントリに拡充。局部/人間の局部/性器・陰部表現、性的・脅迫・侮辱表現、英語・ローマ字・表記揺れに対応。
2. NFKC/全半角、キリル・ギリシャ系の類似文字、長音・記号・空白区切り、全角URL/メール等を正規化して判定。単独「局部」は拒否し「局部的な雨」など一般語の誤判定を抑制。
3. ブラウザSpeechRecognitionの日本語確定結果を辞書と照合。端末内モデル利用可なら優先、外部認識はチェックボックスの明示許諾のみ。
4. 禁止語検出時は録音と新キャラ生成を中止。未認識・認識API非対応・辞書取得失敗時は素体のみ生成し、録音データは保存しない。
5. 録音声の試聴・攻撃・雄叫びは voiceReview='passed' の録音だけ許可。以前の審査情報がない録音は再生不可。オンライン生録音の転送停止を維持。
6. 録音の注意文・外部音声認識同意・失敗時の案内を現行動作に更新。音声認識APIの事前確認を1.5秒でタイムアウトし、録音終了時の認識リソースを解放。
7. moderation/Room/voice-review/voice-rush/hourlyの回帰テストを更新。README、Worker health、package/clientをv0.10.19に整合。

## TEST_RESULTS
- GitHub main再取得のmoderation.js全回帰テスト（559辞書エントリ、禁止語/正常語）PASS。
- test-voice-review-v114.cjsの端末内認識/外部同意/非対応/未審査音声拒否をV8モックで実行PASS。HTML埋込JavaScriptとWorkerのV8構文PASS。
- Worker Room.cleanCreatureの禁止語名/型を7種類でサニタイズし、正常語を保持するV8モックPASS。更新CJS構文PASS。GitHubコミット後の変更ソース再取得PASS。
- 正式Node CLI npm run test:node / test:voice、GitHub Actions成功、Chromium実ブラウザ、GitHub Pages最新配信、Android実機、Cloudflare本番、外部二端末は未検証。GitHub Actionsのcommit連動検索はpush runを返さず、成功確認不可。

## BLOCKERS
- Cloudflare本番公開は所有者のCLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKENのGitHub Actions Secretsが必要。Worker URL未設定。
- Web Speech APIは端末依存で誤認識・聞き逃しがあり、発話の完全審査を保証しない。端末内認識がない場合は明示同意による外部認識か録音声なし。
- Android/Chromiumのマイク・認識・スピーカーの実聴、Cloudflare外部二端末対戦、Pages配信の反映は未検証。

## NEXT_ACTIONS
1. GitHub ActionsのNode22 test:node結果をWeb UIで確認し、失敗テストを修正。実ブラウザで録音開始/停止・禁止語/正常語・未認識・外部同意を検証。
2. Android縦横画面、音量/ミュート、録音1/2/5/7声・勝者雄叫び・BGM、COM勝利自動次戦/敗北停止、セーブを実機確認。
3. Cloudflare認証後Workerを手動公開し、/health v0.10.19、招待/ランダム/切断15秒復帰/不正名前拒否/音声非転送を独立二端末で検証。
4. 認識APIが同時マイク利用時に失敗する端末を計測し、必要なら録音・認識フローを端末別に調整。

## GITHUB_COMMITS
- moderation: 5cfc59481639df03ff5880145d2faf6e9d8d6034
- moderation tests: 8338b52315659f46d36dd20d5a810e63cbd22bf5
- ASR/voice gate: 6566086a7153dc335fd7232db09181f81044d247
- voice-rush/hourly fixtures: 24fcd869ebf92827dc6f1803c5f11af15d643168 / 80e31f20a40eded0d4280079d223f3e042d0d4c1
- UI/cleanup/version: c5c04a507c27d6ae543008c7a8b4f247ecc541d1
- Worker health: 6401f7bb06b38d10fef2fb4600c29d27d99816b7
- package: 3d959423c79578016fe4982bf7721f0517045114
- README: c1e34d19bdbf3b9fdf2fb26afec93f9b36c2d565
- voice review tests: b61f0ba4070d080537e92e948e8552d6e6bcf048
- Room test: 7eff88890dc7bb252ab9436459b2cb955c02f93e

GitHubがソース正本、Driveが引き継ぎ正本。V8モック、Node実行、Pages配信、実機、本番Workerを混同しない。

---

# 声魂 v0.10.20 / 2026-10-26 / 録音不能の緊急修正（音声認識依存を完全撤去）

## CURRENT_STATUS
- GitHub main games/otodama/ のみ修正。v0.10.19で再導入された音声認識の許可失敗/無認識/辞書失敗で録音声を破棄する条件を撤去。
- マイク取得→3秒収録/手動停止→MediaRecorder音声またはPCM WAV代替→キャラ生成・音声保存・試聴が認識APIなしで進む。
- 旧保存ボイスの voiceReview='passed' チェックも撤去し、有効な保存データを再生可能に戻す。音声そのものを以前破棄された場合は復元不可。
- 攻撃ボイスの1/2/5/7連打、CPU文字セリフ、勝者雄叫び、キャンペーン、保存、WIN/爆発、BGMを変更せず維持。
- 音声の文字起こし・録音発話の禁止語自動判定は実施しない。「禁止ワードは発しないでください」という注意を表示。公開名・オンライン文字列の既存検査は保持。オンライン生音声転送は停止。

## CHANGELOG
1. beginSpokenWordReview/evaluateSpokenWordReviewの呼び出し・処理と外部認識同意UIを削除。録音開始時の不要な待機・マイク競合を解消。
2. 録音後のreview.allowed/review.bannedによる音声保存破棄、キャラ生成中止を撤去。PCM/MediaRecorderの音声保存はそのまま。
3. clipDataのvoiceReviewゲートを撤去し、古い有効な録音データが試聴・攻撃・雄叫びで再使用できるように変更。
4. 端末内録音の成功/失敗と注意文を現在の仕様へ修正。ユーザーの「禁止ワードは発するなとの注意のみ」の要望を明記。
5. test-voice-review-v114.cjsを実際の録音経路の回帰テストに再構成。MediaRecorderとPCM WAV代替、手動停止、ダブルタップ抑止、試聴ボタン、トラック停止、旧録音再生を検証。
6. README、UIバージョンとpackageをv0.10.20へ更新。Worker/moderation.jsは変更なし。

## TEST_RESULTS
- GitHub main更新後、index.html埋込JavaScriptのV8構文確認PASS。
- WebAudio・MediaRecorder・ScriptProcessor/PCMを模擬した実際のstartRecord/stopRecord関数のV8実行PASS：両方式でvoiceClip保存、VOICE OK、試聴ボタン有効、マイク停止、二重録音抑止。
- 改修した test-voice-review-v114.cjs をV8でNode APIモック化して実行PASS。旧声データの審査メタデータなし/未審査でもclipDataで再生可能。オンライン転送拒否のコード存在チェックPASS。
- 公開URLのHTMLはWeb取得失敗。GitHub Pagesの配信/画面操作・Androidマイク/スピーカーの実動作は未確認。正式Node CLI npm run test:node、GitHub Actions、Cloudflare外部二端末は今回未検証。

## BLOCKERS
- 本番Android端末ではマイクの権限、MediaRecorderコーデック、AudioContext、OSの音声設定など依存環境があるため、録音が実際に直ったことは未確認。
- 旧版がvoiceClipを破棄して保存した音声は復元できない。ローカルに音声データが残る保存済みキャラのみ再利用可能。
- Cloudflare実オンラインサーバー未公開。アカウントSecretsが必要。

## NEXT_ACTIONS
1. 配信反映後、Android Chromeでマイク許可→録音開始→手動停止→VOICE OK→試聴→攻撃声→勝者雄叫びを確認。
2. 本番Pagesの最新ソース反映、Node CLI test:node/test:voice、GitHub Actions自動テストを検証しエラーがあれば修正。
3. 無音・マイク拒否・WAV代替・ブラウザ再開・ローカル保存領域の残量・古い声の再生を実ブラウザで確認。
4. Cloudflare公開は所有者認証後に行い、録音生声の転送停止を維持。

## GITHUB_COMMITS
- index recovery: 0ec5d650ee69869e7e88a5c27e72cfe612aab5f4
- microphone regression test: 8559ca5ae4b40c59a81284f2ffaf2a13b8b779a7
- README: 2ae9d1b59ee8fb5c1fa5aff48cffefeadaaebda8
- package: bdfea883922ac597ec466e03efc6e46bc993485a

GitHubがソースの正本。録音音声の自動認識審査を勝手に戻さない。実機未検証を検証済みと呼ばない。

---

# 声魂 v0.10.21 / 2026-10-26 23時台 / 36特徴量音声DNAと戦闘連動

## CURRENT_STATUS
- GitHub main の games/otodama/index.html に録音約4.8秒、時間波形・FFT・周波数帯・音程変化等36特徴量から決定論的な音声DNAを作る処理を配線。音声の特徴から初期5能力、属性、種、成長傾向、潜在特性8種を生成。旧キャラは旧仕様のまま動作。
- 8種の音声特性をレベル1/5/10/15/20で段階解放し、COMオート戦・ローカル操作戦の攻撃、会心、連撃、防御、回避、反撃、必殺に反映。声由来の成長傾向・希少変異・潜在力も反映。
- セーブJSONに検証済みaudioDNAを含め、旧セーブは引き続き復元。録音声ファイルそのものはJSONバックアップに含めない。録音試聴/PCM WAVフォールバック/勝利爆発・WIN/連戦/既存BGM/オンライン入力制限は維持。
- UIは主要8音響特徴と全36特徴の展開、特性の解放条件、成長適性、有効音声率を表示。未録音/旧キャラは旧式表示。
- Worker・wrangler・他ゲーム・ブログは変更なし。オンライン生音声転送は停止。Cloudflare本番未公開。

## CHANGELOG
1. 36項目音響DNAを録音フローに接続し、4.8秒の解析フレームから能力を生成。
2. 解析署名を量子化し、同一解析フレームで同一結果を生成。微小録音差による完全一致は保証しない。
3. 8複合能力の段階解放をローカルオート/手動戦闘に適用。
4. 成長先の決定・高成長適性・潜在値・希少変異を声由来へ変更。
5. audioDNAの厳格な入力検証とバックアップ/復元、旧セーブ互換を実装。
6. 36項目全表示を折りたたみUIに追加し、録音有効率の表記を改善。
7. test-audio-dna.cjs追加、test-voice-review-v114.cjsの録音モック調整、package.jsonにtest:dna/test:node/test:voiceを追加、README更新。

## TEST_RESULTS
- GitHub main index.html埋込JavaScriptのV8構文検査 PASS。
- V8合成音響フレームの36特徴量、同一入力の同一DNA、異なる音程/音色の異なるDNA、無音拒否、無効データ拒否、5能力生成、レベル解放、セーブ復元/旧セーブ、COMオート戦闘終端・有限ダメージ：PASS（関数実行）。
- GitHubソースに回帰テストファイルをコミット。正式Node CLI npm run test:node / test:voice、GitHub Actionsの実行結果は今回未確認。Web Audio実マイク・実ブラウザ・Android・GitHub Pages公開配信・Cloudflare本番・外部二端末も未検証。

## BLOCKERS
- Android実機のマイク/音量/音声再生・低性能端末でのFFT負荷は外部実機検証が必要。
- Pages配信URLはWeb取得ツールからアクセス不能で反映確認不可。
- Cloudflare Workers/Durable Objectsの本番公開には所有者のCloudflare認証・設定が必要。現時点では未公開。

## NEXT_ACTIONS
1. GitHub Actions/Node22で npm run test:node、npm run test:voice を正式実行し失敗箇所を修正。
2. Android Chromeで4.8秒録音、手動停止、36項目、旧キャラ保存、WAV代替、試聴、攻撃声/雄叫び、オート戦/手動戦、BGM、縦横レイアウトを実確認。
3. 低音/高音/息声/連続発声の実測で音声DNA分布・潜在特性の出現率を検証し、強さの偏りを調整。
4. Worker公開後、/health・ランダムマッチ・切断復旧・2端末リアルタイム対戦を検証。録音声送信停止は維持。

## GITHUB_COMMITS
- 音響DNA基礎・録音UI（先行更新）: index v0.10.21
- 保存/成長/変異: 4695e39549cd7302536ec0123bc6b74fb7cc0bfe
- ローカル戦闘パッシブ: ca00337e3c5a504adca250de44379b6588d0cae2
- マイク回帰モック: 576f42433be33f8dca646ffa15f57757c6907c13
- DNA回帰テスト: b2e121638ef37a62ed75fcdcf42f18ad486b4fba / ccabe156e7ed80c12088119dc425fceb2984e1f8
- package: fd0339a5f1383752715fbb93ce52a76a2eec89a9
- 36項目UI: 93be756d4b7985c122dcaaeb8166f5c1e707c8ef
- README: 08363b1679d7b787a4b05ee95ea5e1f74a3f0b1d
- 最新index blob SHA: 94b4aceda13acdd46ace2c6c6071ebdb73194598

GitHubコード正本・Drive引き継ぎ正本。実機/配信/本番を検証済みと記載しない。

## v0.10.21 追加バランス検証（同日）
- 合成音声120パターンで基礎5能力の分布をV8実測し、旧式DNA案で防御94が55/120・速度41前後へ集中する偏りを検出。重みと複合条件を調整し、防御上限張り付き0/120、平均能力 [60,70,53,68,49]、各能力の分布幅を拡大。8特性の出現が合成条件で全種確認できる構成に修正（実音声の分布は未検証）。
- 最上位『潜在の追撃』は4つ以上の複合条件と倍音条件を必要とする希少解放に変更。GitHub commits ee7de831ab5706538a7f9e9edba64f8859812d09 / b305fc8c6c57a4a7bb49fa522b65d01f01b61a51。
- 最終 index.html V8構文 PASS、test-audio-dna.cjs相当をV8内でNode fs/vm/assertエミュレーション実行PASS。正式Node CLI・GitHub Actions・実ブラウザ・Android・Pages配信は未検証。最新index blob ad8f6819acfc3bf89099fc49f97eafd1d7884d15。


## v0.10.21 回帰テスト補強（2026-10-26）
- test-audio-dna-v121.cjs を追加し、36波形・周波数特徴量の算出、FFT擬似スペクトル、同じ声なら同一能力・署名、異なる声の能力差、無音時は音響DNA未生成、壊れたDNAの拒否、レベル別潜在特性、成長先の再現性、録音と表示の接続を検査。
- npm run test:dna / test:node / test:voice に追加テストを登録。GitHub mainから再取得した実際の test-audio-dna.cjs、test-audio-dna-v121.cjs、test-creature-auto.cjs の3本をV8のNode互換スタブで実行PASS。マイクのMediaRecorder/PCM WAVも同スタブ実行PASS。
- 既存COM戦闘テストが旧キャラを使用するとき、音響DNA関数を呼び出さない互換処理を追加。音響DNA付きキャラのパッシブはCOM/ローカル戦で有効。サーバー側の音響DNA権威検証は未実装・オンラインは従来サーバー能力裁定。
- 録音用SpeechRecognitionの再導入なし、録音内容の自動検査なし、注意書きのみ。新モジュールはブラウザ内実装で無料。GitHub/Node正式CLI/Android/Pages配信・外部2端末は未検証。
- 追加commit: test-audio-dna-v121.cjs fcb863dc64fb8733cf9e34a965afce8409898cec、test修正 5cbd95c7853ebe4b126efe53e585f79a3230f2e3、package 447436aac47ab6103d7cd1039cd796de6d97169b、index互換 e900c542473998e4ec93f0fac87394e33e2766ae。
- NEXT_ACTIONS: Android Chromeで低音/高音/リズム声を各3回録音→キャラの能力と隠し特性のばらつき・保存・戦闘声を検証し、レベル成長のバランス/オンラインの能力不正防止を追加確認。

---

# 声魂 v0.10.23 / 2026-10-27 JST / 実際の攻撃・被弾音声に28パターンを接続

## CURRENT_STATUS
- GitHub main「games/otodama/index.html」の実再生処理に28種類の音程・速度・音色・重ね声・反響を直接組み込み。単なるUIや未適用ZIPではなく、Web Audio のBufferSourceNode / GainNode / BiquadFilterNodeを使って声が変化する。
- 技別の11カテゴリ（突進/空中/ワープ/ビーム/連撃/回転/打ち上げ/衝撃波/急降下/反撃/通常）および必殺技、被弾/大ダメージ/ガード/ジャストガード/回避/反撃/会心/ブロックの8カテゴリに分岐する。合計28種類は全て発現候補となる。
- 音響DNA署名・技種別・ターン・キャラの音程/リズムに基づく決定論的なFX選択。同じ録音声でも高音/低音/早口/スロー/音程上昇・下降/反響/多重声等を使い分ける。
- 録音声を加工せず保存。原音試聴では加工なし。通常1声・連撃2〜5声・必殺ラッシュ7声、CPU/ユーザーの被弾時の声、CPU録音声なしの代替音にも効果を適用。音量・ミュート・オンライン相手ミュート尊重、ソース数最大14の制限を維持。
- バトル画面に声FXパターン名を表示し、ON/OFFをlocalStorageに保持。試合終了/次戦/戻るで表示解除。既存の2秒録音、36項目音響DNA、育成、保存、勝者雄叫び、爆発破片WIN、自作BGMは維持。
- CloudflareサーバーWorker/他ゲーム/ブログは変更なし。オンライン対戦相手の録音声送信は以前から停止したまま。オンライン公開・独立2端末確認は未完了。

## CHANGELOG
1. 28種のVOICE_EFFECTS定義を追加し、技別VOICE_ATTACK_VARIANTS・被弾別VOICE_REACTION_VARIANTS・必殺VOICE_SKILL_VARIANTSに割当て。
2. voiceEffectProfile: 音声DNA/声の高さ/戦闘ターンから決定論的に加工を選択。
3. playDecodedVoice: Web Audioの再生速度を時間変化させ、必要に応じフィルタ・エコー・2〜7連打、音量包絡を合成。
4. attackVoiceに戦闘イベント（kind/hits/skill/seq）を通し、必殺技の7連撃・反撃の声を技専用プロファイルへ接続。
5. reactionVoiceをCPU自動戦闘・ローカル操作戦・オンライン受信impactの着弾時へ追加。被弾/防御/回避ごとに声を変える。
6. synthVoice（録音のないCPU）も加工プロファイルで音程・フィルタ/速度を変更。
7. 設定画面に声の変化ON/OFFと戦闘中の表示、設定保存、戦闘終了時の自動表示解除。
8. tests: 新test-voice-effects-v123.cjs・録音2秒・DNA・勝利吹き出し・既存WebAudio/オンラインmockの回帰を修正。package scriptsのtest:node/test:voice/test:effectsを更新、v0.10.23に変更。

## TEST_RESULTS
- GitHub mainから実再生コードを再取得し、HTML埋込JavaScript V8構文検査 PASS。
- test-voice-effects-v123.cjsをV8 Node API模擬環境で実行PASS：28種、技別変化の到達、決定性、通常1声/連撃5声/必殺7声、被弾/防御/回避、FX OFF、原音試聴、オンライン相手ミュート、戦闘終了時停止。
- test-voice-rush.cjs、test-hourly-v116.cjs、test-hourly-v117.cjs、test-dialogue-v113.cjs、test-voice-review-v114.cjsもモック実行でPASS。録音2秒・WAVバックアップ・声試聴、オンライン通信の重複排除などを含む。
- 28種全部が技/反応の割り当て候補であることをプログラム検査で確認。GitHubファイル再取得と SHA の照合を実施。
- Node CLI（npm run test:node）の正式実行、実Chrome/Androidの録音・スピーカー再生、GitHub Pagesのライブ配信の最新版反映、Cloudflare公開・二端末は未検証。GitHubのコミットステータスとPRワークフロー照会は空、成功を保証するものではない。外部WebからPagesページ取得不可。

## BLOCKERS
- GitHub Pages公開配信の実HTML/音声を外部から確認できない。GitHubへのコード保存と実サイトの音声再生検証は区別する。
- Android実機の音声品質、録音機能、端末負荷と自動再生制限は実機検証が必要。
- オンライン相手の生録音声転送はWorkerで禁止されたまま。

## NEXT_ACTIONS
1. Android Chromeでゲームを完全に再読み込みし、バトル音量を確認、声の変化ONで通常/コンボ/必殺/被弾/ガード/回避の音色を実聴。
2. 録音2秒→試聴（原音）→バトル（加工声）を確認。音割れがあればレート・Gain/コンプレッサを調整。
3. Node22 npm run test:node・test:effectsとGitHub Actions・Pages配信を実行/確認し、失敗があれば修正。
4. Cloudflare本番認証後、独立2端末でオンライン戦闘を確認。音声転送は追加審査/同意が整うまで停止。

## VERIFIED COMMITS
- FX UI 初回: d7c482592d9319228b48d5ddeebab95ef86c5fde
- 速度変化: 501d03b97a50d2fef403c80130f20f60d8f673a6
- 28効果定義 index blob: 2a8c103dd5aab3ce96ef11290ea3bdd0ee57d1a7
- プロファイル選択: 4af39c64cb1488bef810c6e1e64728e9011a662e
- パターン表示・保存: f21f30bd2994802851c5c517e73a2e6c7315c8bb
- 実録音声FX: 94267ab6c37285152762fa4554a1a2137a32c740
- 技種別・被弾routing: b2cd4e275d66252c0eb01f8f1573c1d988b3ce71 / 66d99dac65cda740f5463352243511898b63f693
- CPU代替FX: e7d3e176f1b1925976dbd018d5fe456879afacc4
- 終了表示解除: 6591258d7a8c117d9f934a0b8b06dc3762a4c2c7
- 新test: fdd4538759597dd3dabb900f9c8d1b80d3245c18
- package: ad03b1a8f51e777eab8170584f8d1c86c4d61a9e
- index表示バージョン: b6b19023ae8de345a8c2cef1d9da78410b650c26
- README: 1093ad1547e5049c51bf7e9a62c1df37010e478c
- 最終index blob: e880fc2491f9fa158af49b3aa6aff0ba02386151

変更はgames/otodama/のみ。録音・原音試聴・戦闘・勝者音声の既存動作を維持。未検証を確認済みと呼ばない。

---

# 声魂 v0.10.24 / 2026-10-27 / 承認済みUIのゲーム本体実装

## CURRENT_STATUS
- 対象ゲーム本体: techmew/techmew.github.io / games/otodama/index.html。デザイン見本 koedama_ui_refined_v01024.html に基づき、中学生〜大人向けの明るいブルー・ホワイト・ミント・コーラルのUIを実装。GitHub mainへコミット・再取得済み。
- キャラの外見・生成エンジン・録音音声・音響DNA・戦闘・勝利演出・育成・データ保存・Cloudflare Workerは変更しない。既存キャラや声のセーブデータ形式は維持。
- メイン画面常時表示：キャラプレビュー、2秒録音、原音試聴、攻撃/防御/速度/集中/必殺の5ステータス、ステージ/Lvとバトル/キャラ保存。
- 詳細情報は必要な時だけ開く6ドロワー：詳しいステータス（声36項目含む）、別のゲームモード（日替わり/サバイバル）、キャラ図鑑、ヘルプ・データ管理、オンライン対戦、オンラインの接続・ランキング詳細。
- バトル音声設定は折りたたみ、音声再開・次戦・戻るは初期表示に保持。プレイヤー勝利時の吹き出し非表示と録音雄叫び、28種類声変化を維持。
- ヒーローキャンバスの補助的なランク/タイプ番号は削除しキャラを主役に。明色画面で視認できる波形線色へ更新。

## CHANGELOG
1. ui-refresh-v124.css（約11KB）新規作成。既存styleは消さず外部リンクで段階適用。
2. index.htmlのキャラ画面・録音タイトル・ヘッダー文言整理とホームの情報再編。
3. 必須ゲームIDを保持したまま詳細項目をdetails/summary化（キーボード操作/アクセシビリティ）。
4. オンラインランキングと接続先設定は二段階の詳細表示へ移動、機能は残す。
5. バトル画面のBGM/効果音/省電力/声変化/雄叫び設定を折りたたみ、音声再開を常時表示。
6. 動的録音/試聴ボタン文言を一致させ、ゲームFooterの版数をv0.10.24へ。
7. test-ui-refined-v124.cjsを作成し、package.jsonのtest:nodeとtest:uiに追加。
8. 以前のtest-quality-v108.cjsが追加済みdnaGrowthIndexをモックせずGitHub Actionsで失敗していたため、旧キャラ用テストハーネスを補正。実ゲームの成長計算自体は変更なし。

## TEST_RESULTS
- GitHub mainからHTML/CSSを再取得。index.htmlのscript構文、全重要IDのユニーク性、HTMLタグ閉じ、常時表示操作/5ステータス、6ドロワー、2秒録音/音響DNA/録音声28種類のコード存在検証 PASS。
- V8模擬実行で test-ui-source.cjs、test-ui-refined-v124.cjs、test-voice-effects-v123.cjs、test-audio-dna-v121.cjs、test-creature-auto.cjs PASS。
- GitHub Actions「Test and Deploy OTODAMA Worker」最新run 40430332371：test job / 完全オフラインNode回帰ステップ成功（2026-10-27）。deploy jobはskipped。これはWorkerの本番公開完了を意味しない。
- GitHub Pages workflow（後続コミット分）は要確認。公開URLのHTTP最新版、スマホ/Android録音・実スピーカー/プレイヤー操作は現環境で未検証。

## BLOCKERS
- 実Android縦横表示・CSS/UIの視覚確認は未実施。静的タグ検査とNode CLI回帰に留まる。
- GitHub PagesはActionsのデプロイ実績とブラウザからの実ページ取得を区別し、後者の確認がまだできていない。
- Cloudflare Workerのオンライン本番は今回変更していない。オンライン相手の生録音声転送は以前から停止中。

## NEXT_ACTIONS
1. https://techmew.github.io/games/otodama/?v=01024 をAndroid/PCのブラウザで更新し、明るい配色・キャラ表示・録音/試聴・主要5ステータス・バトルと各ドロワーを目視確認。
2. 録音2秒→生成→原音試聴→COM戦→勝利雄叫び→次戦→保存を実操作で検証。
3. GitHub Pages 最新workflowのsuccess確認。CSSロードエラー/フォント・ボタン高・320px横はみ出しを実画面で追跡。
4. 長い説明をさらに削る場合は見やすさを損ねず、必須操作や注意を隠しすぎない。

## COMMITS
- UI stylesheet ec3351115d6f95076509b602a07dd2cbb4322728
- Link/header 7f2a88f4aa6693b45f4557acf59f4b21d4242ffb
- Home drawers 27e6be2df4a2649871b756c92d7c3d8dc1089d29
- Online details 51f6536ba72584ead1d1f3d26a2b5e34e33c74be / 6d8c4714bc78fab593d8075657a050116e614e32
- Battle controls e7c13e67d0ca6469afb55b3b31c31047f8ffc49a
- Readable waveform and canvas 1202f554cfba78f077b04bbb09a961874f674f41
- UI regression 0d129378dea75b9e304036028c56bf2e6e5c8a15 / 63721aa957cf15fe60f02427b241d28bf8d1d5d8 / 5a6b5ee7f4b5fc2bd7b97bc03d73582fdcc5eb98
- Package 7e7f8725054144eb24e75624b51ae0d472b4aba7
- README 417cc8a167fa041da514727463749990b2a3aea8
- CI harness fix 633a88407bdc2d5fd193535793b61597cbab21ba
