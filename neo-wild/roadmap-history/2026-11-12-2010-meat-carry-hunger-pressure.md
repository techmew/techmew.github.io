# PHASE A / Meat carrying survival pressure

Base HEAD before implementation: 6e678f0642e3e88b0ac598ae2861c46375a22d4d
Implementation: 19813e99e274319b3ebcfb7a22e570f9f2cbf51c
Publication revision: b08e74dd4f937cd3ebf22b67826c7a616720f165
Verified game.js blob: 9bb1e22446290fb95a03ec832b85c840683778d0
HEAD after publication: b08e74dd4f937cd3ebf22b67826c7a616720f165

Change: While the player carries a meat carcass, hunger drains 18% faster. A one-time threshold-crossing notification at hunger 20 warns to deposit meat or eat. Berry carrying and non-carrying survival drain remain unchanged. No UI layout, save schema, roster, boss or permanent-death changes.

Tests: full JavaScript Function constructor parse passed; three mock factor checks passed; current game.js blob and HTML script revision read back. Real gameplay, Android, browser crash and Pages delivery are NOT verified.

Pending: cross-key world/pantry interrupted-write journal and crash tests; Android touch/English localization; actual in-game balancing of carry pressure.
Next: implement and test safe interrupted-write recovery without restoring dead or released animals.
