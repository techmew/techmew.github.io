# PHASE A — Alpha boss silhouette

Latest baseline before work: 8417bcac95f8fcc92dc69a3f6e76710c942bca83.

Code commit fb20048bf6710b58aef4729e47fc93c4c4702653; HTML cache revision commit f3085862a904e7c41779fb74610e0e76300d185b.

Changed: Alpha boss now renders a distinct oversized wolf shape in the Canvas2D strong-boss drawing path: dark torso, spiked hackles, four paws, tail, ears, amber eyes and muzzle. Previously alpha fell through to a generic creature. No saved individual IDs, UI placement or roster keys changed.

Checks: complete game.js passed JavaScript parsing with new Function before commit. Existing file SHA checked before write. Browser/Android and Pages runtime not verified; WebGL boss silhouettes and other bosses remain QA pending.

Next priority: check remaining boss render ID mapping in Canvas and WebGL; fix generic fallback, then implement crow dive prey feeding. Carp remains gated in debug with old saves preserved.
