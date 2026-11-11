# 2026-11-11 22:07 JST — gamepad gacha focus

- Baseline HEAD: 211f442e70bc54fef5de95dd36a449cc29bf78f5; ROADMAP-RECOVERY.md and latest English UI audit reviewed. Directory listing roadmap-history via fetch_file failed (JSONDecodeError); latest history recovered through commit diff.
- Fixed gamepad.js focus(mode): gacha candidate priority was overwritten by empty general menu priority, making initial controller selection jump to first (often close) button instead of a gacha action. Gacha now preserves first available actionable button; fallback to first button if none.
- Game code commit 4351473ef5835117c7e4fd57afa3878f5aaadd27; HTML cache rev commit d031d0a51784c395e6fae0f428beba7242948f53.
- Regression: 3/3 isolated focus selection cases (gacha priority, gacha fallback, menu fallback) passed. GitHub reread gamepad.js blob d586884101c53d2df5c43cc981fe2e0845a77a33 matches. Full JS parser, actual controller/browser/Android play and public Pages fetch not verified; do not claim verified.
- Remaining: real controller gacha interaction and save/restore regression; boss individual geometry and crow aerial predation; carp disabled until water stage.
- Next: implement and verify crow extended flight / aerial small-prey hunting, preserving existing saves and UI.
- User action: optional Android controller play video for validation; no blocking action.
