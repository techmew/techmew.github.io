# WILD RECLAIM｜2026-11-08｜35種操作・257トロフィー・全残件継続
ACTIVE_SPRINT_ID: WR_PHASEA_20261108_FULL_PLAYABLE_ROSTER
PHASE=A_FEATURES（Bへ切替不可）
基準: 古い2a8b20e7419e1d93105018835fa81e9d50788e8bの保護機能を保持し、最新mainを逐次取得。全コミット一覧2,010件をページ取得済み。全コミットの個別差分・実機の全E2Eを検証済みとするものではない。
本実行開始HEAD: 8ec5c5ab146c0712448fc3f4d91cd4c71ff0b2de
実装変更:
- game.js 428e8a388563c748881ddc1bbc70190b6b6431f6 / squad-core.js e3880bc1ce737f435e6fce671d376417ebaf23a0 / webgl3d.js 30beb350baccce3ed5a0fd2a051623b6ffd37697: トラ/チーター/ハイエナのステータス・ガチャ・既存固有攻撃・3Dを接続。操作候補18→21。
- trophy-records.js ce165f917e6ebdf53b11ec0f233489ab0064b3da: 65→229件。真正の遭遇、狩り、強敵20種、種族操作、固有技、地区訪問、実探索地点、UFO/亡霊事件。旧獲得IDを保持。イベント別索引によってフレーム毎の判定コストを削減。
- game.js 1b628992eb6b3e0bf3fdeb2ee66251e848b7d888 / squad-core.js ed2e5c525c4c13252e92ba895b1345b497bd5a2f / webgl3d.js 315f90165f8f2552b129069cd6c1ee04dc51db10 / trophy-records.js a7011db507f92593c0a3968fe4357680693945fe: タヌキ/アナグマ/ツキノワグマ/ニホンカモシカ/キリン/シマウマ/リカオン/アルマジロ/ハリネズミ追加。操作21→30、固有技・専用3D、トロフィー247。
- game.js 788c064b515fd13b21abac499651577086730e0c / squad-core.js 5bd5c14aacbd913663fe1d031f07c0fc6570b590 / webgl3d.js 36c8fc9d1bc46e5bcd14f66118c51e3bb39e608b / trophy-records.js 9e9a6d1752489085d60f65699c0b445a95f87b45: カワウソ/コイ/カバの移動（陸水両用/水中専用）と水面専用3D。操作33、トロフィー253。
- game.js ab9a13b50c5d0ec07b091babfe8b45538db7abb7 / squad-core.js 8622d5c4b2a1c3805af14a86337066df20098624 / webgl3d.js 6d1570fb3ffddd3913ffb705547f0a4428aff53f / trophy-records.js 305ef582b7b86e6884c59b6ba2659ac884bb811a: カラス/ハトがジャンプボタンで離陸→飛行→着陸。高度・持久力・建物上空衝突、専用WebGLモデル。ガチャ候補全35種にゲーム内ステータス/固有技/操作登録を実装。トロフィー257件。
この枠以前の実装:
- era-ecology.js b389ae6a31730486ae96a373bb6558cc2d8f5be2 / game.js ed70efc12a9423260707357fb41a685b45a305f9 / ufo-events.js 609082d2381a651cb7dfff2722c7708a0d9b1856 / world-history.js f87c378665eea67e3b571f507f6ab3e84bd6724f: 24時間を上限とする不在生態進行、実NPC生態連動、偵察機被害/死骸、年表実記録。
検証済み（静的・実行モック）:
- JS parse: 変更したgame.js/squad-core.js/webgl3d.js/trophy-records.js全件。
- 35種全員のガチャ操作許可、プレイヤー基礎能力と固有技のコード登録。後期12,000回の抽選で基本65.22%・希少29.80%・伝説4.98%、世界0年300回は基本のみ。
- 旧5体セーブ、leaderId交代、死亡IDと放流IDの永久除外。
- 257種のトロフィーID重複なし、旧獲得ID保存、実イベント条件、秘密マスク、再ロード後の永続性。
- JSを実行した飛行ジャンプ操作モック: カラス・ハト離陸、着陸モード、持久力消費・不足拒否。衝突モック: 建物地上/低空ブロック・高空通行。水中モック: コイは水中のみ、カワウソ/カバは陸水可。
- 各更新でmain HEAD/対象SHAを確認し、内容APIで条件付き書込。更新blob SHA再取得一致確認。
未完/検証待ち（完了扱い厳禁）:
- [00分担当・検証待ち] Android Chromeの実バックアップJSON保存/読込、旧SAVE_SCHEMA2全セッション、5体セーブの実起動・切替・セーブ、複数タブ競合・quota、年表表示。対象 save-backup.js / world-history.js / game.js。
- [20分担当・実装中] 右上林→山岳→河川勾配/水位/雪シーム/水源・冬季・移動衝突の実環境整合、地形固定変化。対象 mountain.js / fauna.js / era-ecology.js。今回 mountain.js 非変更。
- [40分担当・検証待ち] 全35種（特にコイ水中、カワウソ/カバ陸水、鳥の離着陸）のWebGL・Canvas/スマホ実機・ゲームPad、移動障害物/浅瀬/橋/屋根への着地、攻撃/顔座標・NaN・FPS試験。対象 game.js / webgl3d.js。現段階の35種はコード対応・E2E未確認。
- [40分担当・未完] UFO・亡霊・異星人・超大型存在の更なる専用AIと生態/地形/世界史への永続影響。対象 ufo-events.js / apparitions.js / disaster-world.js。
- [全担当・未完] 200以上のトロフィー数・固有獲得条件の実装は257件に達したが、個別条件の現地実行E2Eと所要時間/希少性バランスは未検証。秘境・地下施設・巨獣などの全ゲームプレイループ、継続共有サーバー、長時間FPSの完成には至っていない。
- [40分・検証待ち] 今回のゲーム/3D.jsの実画面反映、GitHub Pages CDNキャッシュ期限、Android E2E。HTML/CSSは変更禁止のためスクリプトクエリ文字列は変更せず。配信確認未完。
守ること:
- 既存タイトル/ガチャ/所有画面・2ボタン・最下部JSONボタン・年表・CSS/HTML・ROADMAP.mdを改変しない。
- 操作1+非同行ストック2、旧4/5生存者を消さない、leaderId、死亡/放流ID永久除外、0年8時新世界と既存世界時計、旧SAVE_SCHEMA2の保護を徹底。
- 次回も最新main HEAD/対象blobのSHAを取得し、新規コード変更をテスト→条件付きcommit→小型新規履歴に引継ぎ。全体「完了」やPHASE=B_POLISHへの昇格は不可。
