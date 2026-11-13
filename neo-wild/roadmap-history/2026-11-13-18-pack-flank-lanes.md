# 2026-11-13 18 JST — pack flank lanes

- Game change: pack flankers avoid approaching an occupied lane; select next standable offset instead of overlapping other flankers. Leader is excluded from lane crowding check.
- Implementation commit: 469d889661da40612ade4fab493ac7b6dc1f2e6a
- Publish cache revision commit: 9a4d102657f2ec02660c90da8d3470d3da396368
- Source blob: 783b3b05ba77ca3c0b04ed035a861bb8e6846b76
- Verification: source replacement and preserved combat callbacks checked. Browser/Android playtest and JavaScript parser/mocks not executed; deployment propagation not confirmed.
- Pending: verify AI behavior on device, combat input-to-hit latency, save compatibility, food transport and boss roster.
- Next: test and reduce input-to-hit latency in both 2D and 3D without changing hitboxes.
