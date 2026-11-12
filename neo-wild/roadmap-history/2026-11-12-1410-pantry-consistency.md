# PHASE A / pantry consistency guard

Implementation: 9a8847e30b32f04fa75816ab56afecb0685505ff
Publication revision: 9bf29f88f482d2c81edfdeee60df25fff795c53a

Changed: Refuse shared pantry overwrite when in-memory meat lots disagree with meat totals, contain invalid quantities or species, or other food stores are negative. Existing food and saves are not overwritten by these invalid states. No menu or roster layout changes.

Checks: full game.js parsed using JavaScript Function constructor; six focused validation cases passed; updated blob SHA verified. Android/browser gameplay and crash simulation not performed.

Pending: world/pantry interrupted-write transaction journal and crash tests; Pages delivery check. Next: test and implement cross-key interrupted-write recovery without resurrecting dead animals.
