# 2026-11-07 20:05 JST | ユーザー依頼：ガチャ排出確率一覧への導線
PHASE=A_FEATURES / UI明示変更は今回のリンクのみ。
実装：neo-wild/gacha-rates.html（main commit 98ba1027dd44025632570c56808739d70bb2852d）、squad-gacha-ui.jsのタイトル所有3枠下リンク（c198cb79eaab15072062f056c28909a37f40f64a）、index.htmlのキャッシュ識別子更新（b473488e78db47274b70ed1820d0de9640f8aaae）。
現行確率：抽選対象18種=基本8/希少7/伝説3。YEAR 0/7/34の各条件を、squad-core.jsから参照し表を動的作成。希少7年、伝説34年。探索数は現行UIから0で渡すため年解放が実動作。
GitHub再読取と静的整合チェック：PASS。UIリンク、対象HTML、キャッシュ識別子、抽選対象種別数、既存セーブバックアップ読み込みタグを確認。ゲーム本体、保存キー、既存画面構成は変更なし。
検証待ち：GitHub Pages公開後の実際の遷移/Androidタップと表示/JavaScript実行・通信キャッシュ。Pagesの直接URL取得は外部ツールのアクセスエラー。担当：00分。
引継ぎ継続：Android JSONバックアップ書出/読込・年表・旧SAVE_SCHEMA2/5体/死亡放流IDをE2E検証（00分）。20分地形、40分接地/造形、4人協力関連の未完項目は消さない。ROADMAP.mdと既存roadmap-historyを変更しない。
保護基準: 2a8b20e7419e1d93105018835fa81e9d50788e8b。次の作業起点は常に最新main。