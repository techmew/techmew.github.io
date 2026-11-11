# 2026-11-11 20:14 JST — boss offer durability

- HEAD at start: 5bad1df8ee360dd15f1e90e06ed0b60faa4286f4.
- Fixed `boss-roster.js`: defeated-boss recruitment modal is not opened if its pending offer cannot be durably written to localStorage. Avoids misleading irreversible player decisions when storage is unavailable.
- Game commit: 644a8a91c930136c9ba01c17380ee87aa7d4a930; HTML cache publication: ab1b3de1e4de5ba6ce2a659dd1b4f8d2b8c51f64.
- Verified: latest blob re-fetched, JS parsed via Function constructor; isolated mock covered write success/failure branch. Not browser/Android tested. Live Pages propagation not confirmed.
- Next: make `showOffer` return a surfaced, retryable storage error instead of silently returning false; exercise combat-to-recruit flow in browser. Preserve existing title/menu layout and irreversible IDs.
