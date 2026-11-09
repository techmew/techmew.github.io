# WILD RECLAIM｜2026-11-09｜隕石落下・永久クレーター・生態・年表
ACTIVE_SPRINT_ID: WR_PHASEA_20261109_METEOR_CRATER
PHASE=A_FEATURES（Bへの移行不可）
対象: techmew/techmew.github.io main /neo-wild/ のみ
作業起点: 315fc3b19689d46044158180e2342f951d2f1e2e（実施時の最新main）
記録作成直前HEAD: 061337973c3ceb69fa678983438aee8142ae5d3c
保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b（作業起点として旧版を使わない）

## 今回の実装コミット
- eff4d57343c06ad0bcb0e8418843297cd667f866 disaster-world.js: 世界17年以降の低頻度隕石。9秒の落下予兆→野生動物逃走→着弾ダメージ→永久クレーター・衝突・局所食料不足。全世界同時災害上限を維持。任意の保存stateの不足キーは旧形式として受け入れ、新規データは既存wild_reclaim_disasters_v1に任意フィールド追記。画面UI/セーブschemaに変更なし。最大96個まで永久クレーターを保持。
- 117d7322b6ef46b0380c00b6830ad6e158829fa7 disaster-world.js: 着弾時に生存動物がクレーター内部へ閉じ込められないよう既存地形衝突で安全な外周へ押し出す。攻撃ダメージや死亡処理は維持。
- 69cee4e358eb3245d983db23a4ca58f1e7bbfd58 world-history.js: 実発生の隕石落下のみ「隕石落下・クレーター形成」として年表へ表示。年代到達と混同しない。
- 1c3c840a70b37b1991f197f6bcc97d6ec6c4cdcd index.html: 関連2本のrevのみ更新。
- dbbb188b422cb5b0721b0e451a1a44f64ad6c678 disaster-world.js: 隕石着弾候補を川/海/水路の水面から除外、既存陸地の物理衝突で判断。
- 061337973c3ceb69fa678983438aee8142ae5d3c index.html: 最終版の災害JSのrevのみ更新。HTMLタグ/文言/レイアウトは不変更。

## 検査と状態
- 【コード確認済み】全既存JavaScript27本の構文PASS（14+13ファイル）。関連scriptのSHA条件書込、差分は災害機能/年表/JS cache revのみ。
- 【関数モックPASS】隕石予兆→9秒経過→着弾、プレイヤーと野生NPCダメージ、死骸用onAnimalDeath、本人/生存NPCのクレーター外周移動、クレーター中心通行不能・外周迂回可能、既存食料圧力低下、storage復元、過去YEARへの未来災害漏洩防止、NEW GAME時だけ隕石記録消去。
- 【関数モックPASS】旧5体編成・既存leaderId・死亡と放流IDの永久除外、120秒=世界1年・eventYear3倍、257トロフィーの一意ID、JSONバックアップの既存災害キーとchecksum、現実に起きた隕石のみ年表表示。
- 【検証待ち】AndroidでのGPU/Canvas表示、実際の世界17年以降での発生率、障害物回避・移動、着弾時の端末FPS、長時間保存・復旧、各種類の動物挙動。本実装の完了宣言はブラウザ実機の検証まで保留。

## 次の未完課題と担当境界
- 【20分担当／実装中】右側山岳・渓流・林・下流と今回クレーターの自然な接続を現地で確認。永久地形への高さ変更・NPC移動AIを最小パッチで拡張。対象 mountain.js/disaster-world.js/fauna.js。
- 【40分担当／検証待ち】Android ChromeとWebGL/Canvas2D双方で隕石警告・地表クレーター・雪の白さ・地震の揺れ、frame timeとFPS、強敵35種の固有3D/攻撃を実測。対象 webgl3d.js/game.js/disaster-world.js。古い雪青化/描画負荷を完了扱いにしない。
- 【00分担当／検証待ち】JSON保存/読込（現行wild_reclaim_disasters_v1を含む）、旧SAVE_SCHEMA2、旧4/5体生存者、leaderId、死亡/放流永久ID、容量不足、複数タブ競合、年表、NEW GAME 0年8時／Continue世界時刻をAndroid実機検証。対象 save-backup.js/squad-core.js/world-history.js/game.js。
- 【全担当／未完】津波・土砂崩れ・感染症、巨獣/UFO/異星基地の恒久効果、257トロフィーの実イベント全件E2E、洞窟ボスの実プレイループ、長時間FPS、サーバー共有世界。3枠の自動スケジュール再開は本記録では指示しない。
- 【永続保護】タイトル画面「3枠→続きからプレイ→最下部JSONバックアップ」、HTML/CSS/操作UI、所有3体（操作1+非同行2）・旧4/5体生存、放流4性格と死亡/放流ID永久除外、リーダー、旧SAVE_SCHEMA2、世界0年08時新規・継続保存時刻、100年イベント圧縮、年表。ROADMAP.mdと既存roadmap-historyは変更しない。
