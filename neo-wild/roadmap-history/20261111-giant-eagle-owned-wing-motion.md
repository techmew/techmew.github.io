# Giant eagle owned wing animation

Code: 3422e188de2695ac988108aca5dc472260cd1ee0
HTML cache rev: 75060cd8c0d76b5d71fc928ab349f3e21532ffb6

Fixed giantEagle wing flap reading only NPC `step`: owned player bosses use `steps`. Shared stride and attack action now animate wings for both. No save schema or UI changes.

Checks: JS parsed with new Function; four static assertions passed; HTML rev re-fetched and verified. No actual browser/Android test and no Pages propagation confirmation.

Next: audit remaining boss species mappings and model silhouettes, including IDs for every boss. Carp disabled until aquatic stage; historical saves protected. Crow aerial predation already implemented.
