# 2026-11-08 08:00 JST / 00分担当
PHASE=A_FEATURES。最新main起点 5a78ea242a6f0903f111af21009456f346541e01。
実装: 明示NEW GAME直後、初回オートセーブ前でも年表の開始行が空にならないよう world-history.js の launched 判定へ explicitNew を追加。既存の災害・UFO・生態記録分類、タイトルUI、保存形式は変更なし。
コードcommit 16e6bee62ab36ee12f81c79d5633a2f9f04208f2 / blob 244e2a31d608a002b13af04bd384630024864734。差分1行、更新blob再取得済み。ブラウザ起動・Android実機E2E未検証につき検証待ち。
検証待ち: 00分担当=Android JSON保存/読込、旧4/5体・SAVE_SCHEMA2・死亡放流永久ID・旧タブ競合・容量不足、年表の初回0年と実災害/UFO/生態履歴。20分=山→渓流→林→下流地形と移動回廊。40分=積雪境界・3D接地。いずれも未完を破棄しない。
回帰保護: 最新mainのみ、旧版復活禁止、UI固定、操作1+ストック2、旧生存5体、永久ID、ROADMAP.md不変更。
