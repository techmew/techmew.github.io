# OTODAMA∞ 開発継続 / 2026-10-26 03:00 JST / v0.9.4

## CURRENT_STATUS
- GitHub main v0.9.3（コミット `88f3e5242bd9d7ec2a7645a92e90532acb7b43c4`）とDrive v0.9.3最終報告を読み、Git blob SHA一致のローカルv0.9.3から継続。
- ソロ戦：連続ステージ・日替わりボス・音声生成/録音/再生・育成・図鑑・勝敗演出を維持。
- オンライン：従来の事前計算再生から、Cloudflare Durable Objectのアラームとサーバー時刻によるガード/回避/必殺技/戦術/HP/勝敗裁定へ試作コードを更新。**本番未公開・外部二端末未確認。**

## CHANGELOG
1. Roomにサーバー裁定リアルタイム戦（900ms予兆、HP/共鳴/戦術/必殺技、40ターン上限）とDurable Objectsアラームを実装。
2. ブラウザでlive_start/live_turn/live_ack/live_impact/live_endを受信し、既存のバトルCanvas・音声・ガード/回避/必殺技UIを連携。
3. サーバー発行nonceへのpongでRTTを計測、最大90msのサーバー側ガード/回避判定猶予を追加。クライアント申告時刻は不採用。
4. 切断時の不戦勝、試合中のready連打による再起動防止、レート制限の同時刻バグ修正、オンライン終了から新しい対戦相手検索。
5. 6環境の地形効果（雷撃/水圧/溶岩/上昇気流/星屑/氷結）と6章の冒険テキスト。
6. ローカル進行JSONの書き出し/読み込みと数値/形式検証。録音音声はプライバシー保護のためバックアップ対象外。
7. Node/Chromiumテスト拡充、READMEとデプロイ説明更新。

## TEST_RESULTS
- `node --check worker.js`: PASS
- `node test-ui-source.cjs`: PASS
- `node test-matchmaker.cjs`: PASS
- `node test-room.cjs`: PASS（仮想2ソケット、サーバー裁定、ガード/回避、RTT補正、再戦乱入防止、切断、レート制限）
- `node test-moderation.mjs`: PASS（240件）
- `python test-gameplay-browser.py`: PASS（連戦/次戦強化/ボス/縦横/省電力）
- `python test-live-browser.py`: PASS（ローカルモックWebSocketで対人操作UI/HP/共鳴/結果）
- `python test-save-browser.py`: PASS（バックアップ出力/復元/異常ファイル拒否/章進行）
- Cloudflare本番、独立2端末WebSocket通信、Android実機、実録音・Web Audioの端末品質：未確認。

## BLOCKERS
- Cloudflare Worker本番公開には所有者側のCloudflareアカウント認証とActions Secrets `CLOUDFLARE_ACCOUNT_ID` / `CLOUDFLARE_API_TOKEN` が必要。トークンをコードやDriveに保存しない。
- 独立2端末でのリアルタイム戦・高遅延回線・切断再接続の品質は未検証。現実の回線遅延は最大90ms補正でも完全には解消しない。
- クライアント申告の声特徴量の真正性は証明できないためランク/賞金戦に利用不可。
- 録音した発話内容の禁止語自動審査は未実装。テキスト名のみ240件フィルタ。

## NEXT_ACTIONS
1. Cloudflare Workers/Durable Objects実公開、`/health`と2端末のルーム/ランダム対戦/切断テスト、公開URLをDEFAULT_SERVER_URLへ設定。
2. WebSocket切断時の再接続・途中復帰、RTT/遅延補正の実測調整、マッチング待機キャンセルを検証。
3. サーバー入力検証と観戦・招待・荒らし対策を強化。対戦リプレイや戦績保存はプライバシーを考慮して設計。
4. ボス固有AI/ステージギミックの難易度・戦術バランスを実機で調整。
5. Android実機マイク・録音音声・BGM/SE・縦横操作の確認、パフォーマンス改善。

## GITHUB_COMMITS
- v0.9.3最終既知head: `88f3e5242bd9d7ec2a7645a92e90532acb7b43c4`
- v0.9.4公開コミット: コミット成功後に追記。

GitHubがコードの正本。Driveが引き継ぎ・進捗の正本。未公開/未検証を成功と呼ばない。
