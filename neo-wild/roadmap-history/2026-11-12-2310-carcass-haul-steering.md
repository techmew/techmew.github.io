# PHASE A / carcass hauling steering

Implementation: f9197600146bc198f435741574a84429224ed5f1
Publication revision: a3cdb5b07b47330336591d69f920fc20be4af812

Changed: player steering speed scales with carried meat points (3% per point, capped at 24%); other cargo, AI companions and permanent speed stats are unaffected. Snow steering uses the same reduced target speed. Existing UI, roster, death IDs and save schema untouched.

Checks: game.js parsed with JavaScript Function constructor; seven load-factor mock cases passed; new game.js blob SHA and index.html script rev fetched and verified. Browser/Android actual play not tested.

Pending: world/pantry interrupted-write transaction recovery and crash simulation; actual movement/balance tests; Pages delivery check.
Next: interrupted-write journal and recovery without resurrecting dead or released animals.
