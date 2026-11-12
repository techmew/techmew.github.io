# PHASE A / meat hauling load survival
Implementation: 4d9d887dce320960ea721dc999bbc52a1bbffeb9
Publication revision: 56a1759f12c3fab9262a5b12348b6a0eb1c24a5a

Player experience: hauling larger meat portions now drains hunger faster than carrying small portions. Normal movement without meat retains its original hunger rate. No menu, roster, save schema or asset changes.

Validation: entire game.js passed JavaScript Function syntax compilation; six targeted mocked load-factor cases passed (no meat, small, large, excessive, negative, malformed amounts). GitHub updated game.js blob verified before HTML publish. Actual browser gameplay/Android device not tested.

Outstanding: world/pantry interrupted-write transaction recovery and crash simulation; gamepad and touch balance validation; full animal roster and final boss QA.
Next: implement and test safe interrupted-write recovery across world and pantry keys, preserving permanently dead/released IDs.
