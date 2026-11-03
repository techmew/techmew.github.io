/* Recommended encounter levels and species-specific alternate attacks.
   Display levels are guidance, not a hard lock: perfect evasion can still win. */
(()=>{"use strict";
const levels=Object.freeze({
 rat:1,rabbit:1,pigeon:1,frog:1,crow:2,snake:3,strayCat:3,weasel:4,raccoonDog:5,dog:5,
 wildFox:6,deer:6,boar:8,zebra:8,venomSnake:9,macaque:8,serow:9,mountainGoat:9,
 chimpanzee:12,cheetah:14,giraffe:17,lion:18,elephant:24,hippo:22,
 alpha:16,giantSnake:18,oldBear:24,giantBoar:22,blackPanther:22,oneEyedWolf:23,
 whiteTiger:28,giantHyena:22,giantLion:32,giantMoose:26,giantBuffalo:29,
 giantCrocodile:32,giantHippo:35,giantAnaconda:30,giantLizard:25,rhino:36,
 giantGorilla:37,giantElephant:40,albinoWolf:30,giantEagle:31
});
const variants=Object.freeze({
 dog:{name:"噛みつき二連撃",windup:.83,reach:1.12,power:.94,cooldown:1.14,stamina:7},
 boar:{name:"牙の横薙ぎ",windup:1.13,reach:1.20,power:1.18,cooldown:1.15,knock:24,arc:1.35},
 strayCat:{name:"すばやい二連爪",windup:.71,reach:1.12,power:.88,cooldown:1.12,stamina:5},
 wildFox:{name:"側面からの噛みつき",windup:.80,reach:1.16,power:.96,cooldown:1.16,stamina:6},
 weasel:{name:"脚への噛みつき",windup:.75,reach:1.20,power:.82,cooldown:1.08,slow:.75},
 raccoonDog:{name:"頭突きで押し返す",windup:1.06,reach:1.17,power:1.15,cooldown:1.12,knock:16},
 venomSnake:{name:"二段毒牙",windup:.84,reach:1.22,power:.93,cooldown:1.28,slow:.60},
 cheetah:{name:"高速飛びかかり",windup:.68,reach:1.33,power:1.12,cooldown:1.25,stamina:12},
 lion:{name:"前脚の薙ぎ払い",windup:.90,reach:1.26,power:1.22,cooldown:1.20,stamina:15,knock:25,arc:1.38},
 giraffe:{name:"強烈な連続蹴り",windup:1.14,reach:1.18,power:1.22,cooldown:1.10,stamina:16},
 elephant:{name:"長い鼻の横薙ぎ",windup:.98,reach:1.22,power:1.24,cooldown:1.15,stamina:19,knock:42,arc:1.33},
 hippo:{name:"大口の噛みつき",windup:1.12,reach:1.17,power:1.27,cooldown:1.17,stamina:14,slow:.85},
 zebra:{name:"後ろ蹴り",windup:.90,reach:1.15,power:1.10,cooldown:1.12,stamina:8},
 serow:{name:"急斜面の頭突き",windup:.93,reach:1.12,power:1.08,cooldown:1.12,knock:13},
 mountainGoat:{name:"連続頭突き",windup:.88,reach:1.14,power:1.14,cooldown:1.14,knock:19}
});
function level(type){return levels[type]||1;}
function gap(type,playerLevel){return Math.max(0,level(type)-Math.max(1,Math.floor(Number(playerLevel)||1)));}
function outgoing(type,playerLevel){return Math.max(.24,1/(1+gap(type,playerLevel)*.11));}
function incoming(type,playerLevel){return 1+Math.min(1.03,gap(type,playerLevel)*.065);}
function nextAttack(m){
 if(!m||!variants[m.type])return null;
 m.styleCount=(Math.max(0,Math.floor(Number(m.styleCount)||0))+1)%2;
 return m.styleCount===0?{...variants[m.type]}:null;
}
window.WildCombatLevels=Object.freeze({levels,variants,level,gap,outgoing,incoming,nextAttack});
})();