# 2026-11-05 17:00 JST / 00分担当
PHASE=A_FEATURES
実装: ガチャ空き枠補充時、死亡・放流済みIDが所有一覧に混在した場合の採用処理を拒否。旧4/5体生存者保護と最大3体制を維持。
実装 commit: a4e7da1ebb07fd14e9d8e28d8978b03024c0fdc3
対象: squad-core.js blob c602bbbe96000a27c14956006411fcce7f9011ec
検証: GitHub mainへの反映と対象条件の再取得 PASS。JS構文・実ブラウザ・旧SAVE E2Eは未検証。
UI/HTML/CSS: 変更なし。ROADMAP.md: 変更なし。
次担当: 古いチェックポイントから放流ID混入状態を作り、ガチャ券が消費されず採用拒否されることを実機確認。
