# English gameplay video review / HUD hotfix — 2026-11-11 JST

## Baseline and evidence
- Target only techmew/techmew.github.io main / neo-wild/.
- Starting main HEAD c20f067c49251a9dbe368686447dd48501420b99. Checked recent commits and existing 2026-11-11-2155 English audit and ROADMAP-RECOVERY.md; preserved existing roadmap and save formats.
- User-provided Android gameplay video ~23s, 1080x2400. English mode visibly interleaves Japanese HUD text and mixed-language weather alerts. The English text is too long for the portrait HUD, while wide, nowrap 18px toast overlays the left status block.
- Code root cause: the MutationObserver in i18n.js delayed retranslation with setTimeout(flush,55) while game.js syncHUD rewrites multiple textContent fields about every 140ms. Weather strings such as 曇り were absent from dictionary.

## Changes
- i18n-phrases.js adds weather names, seasons and short HUD labels (978 phrases total), no save schema changes.
- i18n.js removes the 55ms mutation translation delay: observer-local flush now translates all changed nodes synchronously in the microtask before browser paint, with original ja/en cache protection still in place.
- Adds whole-string weather and season formats and compact source-aware English HUD labels for HP/age/bleed, den, pantry and shoebill aim.
- i18n.css adds English-only portrait toast wrapping, smaller font and position below crowded top HUD, and safer HUD text wrapping. Does not change title, menu or character roster layout.
- index.html + gacha-rates.html cache revs updated to current i18n, phrase pack and CSS blob SHAs.

## Commits and tests
- b6901b9fb47a6680394d947c1b08f1b09756ef90 : phrase pack
- 2d0f073869de28ddf2fe3e873195ba22f50787f6 : synchronous i18n and concise HUD
- 0405dcdcec8a7f455ede9348d5f6653f930efc14 : CSS toast
- b1de451efe72486a4027a9648a19d9b8a195e4bd : final HTML cache rev commit
- JavaScript syntax: i18n.js and game.js parsed.
- Mocked MutationObserver: 15 exact English HUD/weather/season output checks, 150 consecutive HUD textContent updates without residual Japanese, ja/en switches and five cache revision checks; all passed. These are mock tests, not an Android browser rendering confirmation.
- GitHub Actions 'pages build and deployment' for b1de451efe72486a4027a9648a19d9b8a195e4bd completed successfully.
- No data deletion, game mechanics changes or image generation.

## Still unverified / next
- On actual Android in English: check the corrected HUD and toast dimensions, notifications, FPS, and retained Japanese during sustained play. The provided video shows the *pre-fix* app, not the corrected build.
- Review any remaining dynamic messages under real gameplay; shorten only relevant player-facing messages.
- No user settings or permissions required; user could supply a short new English gameplay video to verify this specific mobile UI.
