# 2026-11-07 18:40 JST / 40分担当
Base main: 13ee0857d469aba324de36df5325a00fd62639e1
Implemented: isolated neo-wild/online-coop.js, commit ed5cb4dcf6f444181c09a47ad9979b66ab7e0ea0.
4-player session cap, ±5 level checks, WSS-only connection, server-authoritative cooperative event notifications, stale peer removal, position interpolation. No existing UI, save or death behavior modified.
STATUS: 実装中（通信クライアントのみ）。本番サーバー、実際の自動マッチング、3D描画・協力行動、統合E2Eは未実装。サーバーなしで接続不可。
NEXT 40分: 最新mainを読み、webgl3d.jsの既存描画APIとgame.jsを調べて別プレイヤーの3D表示・同期を最小差分で統合。現行UI変更禁止。攻撃/救助のサーバー検証を前提にする。
NEXT 00分: サーバー認証・マッチング・永続ID/死亡・放流ID非干渉とセーブ互換を設計実装。協力プレイ中の死亡は既存ソロ永久死亡へ誤反映させない。
NEXT 20分: 各プレイヤーの世界時刻・災害・地形が異なるため、ホストの世界を共有セッションとして一時描画する方式と、地形衝突・NPC同期を設計実装。各自の既存世界は上書きしない。
PENDING: 雪境界と3D接地・顔座標品質、30種固有モーション、UFO・怪異、Android JSON保存/読み込み、年表実機検証。完了扱い禁止。
REGRESSION: 2a8b20e7419e1d93105018835fa81e9d50788e8bのタイトルUI/バックアップ/年表/永久死亡放流ID/旧4・5体保護を維持。ROADMAP.mdは変更禁止。
TEST: JS静的構文・ブラウザ実行・Android・WebSocketサーバーE2Eは未検証。
