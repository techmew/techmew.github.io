/* NORMAL-FAUNA-DISTRICTS-V1. All eight districts have their own population weights. */
(function(){
"use strict";
const species={
 strayCat:{hp:58,r:17,speed:198,damage:9,prey:true,xp:2,food:28,color:"#9d9989",belly:"#ded9cb"},
 snake:{hp:38,r:14,speed:122,damage:5,prey:true,xp:2,food:22,color:"#587b50",belly:"#abc68f"},
 crow:{hp:25,r:14,speed:174,damage:2,prey:true,xp:1,food:20,color:"#313b44",belly:"#777a83"},
 raccoonDog:{hp:78,r:20,speed:148,damage:5,prey:true,xp:2,food:41,color:"#89755b",belly:"#c5ad89"},
 wildFox:{hp:67,r:19,speed:206,damage:10,prey:true,xp:3,food:40,color:"#bc7752",belly:"#e8d6b5"},
 weasel:{hp:34,r:12,speed:220,damage:5,prey:true,xp:2,food:21,color:"#ae906a",belly:"#ddc7a7"},
 frog:{hp:14,r:10,speed:125,damage:0,prey:true,xp:1,food:12,color:"#75a66a",belly:"#b6d6a0"},
 deer:{hp:142,r:27,speed:220,damage:6,prey:true,xp:4,food:69,color:"#aa8865",belly:"#e0cbaa"}
};
const types=["rat","rabbit","pigeon","dog","boar","strayCat","snake","crow","raccoonDog","wildFox","weasel","frog","deer"];
const districts=[
 [24,8,20,9,0,18,2,12,3,0,3,1,0],
 [20,9,18,11,1,16,3,12,4,1,4,1,0],
 [13,19,6,5,7,6,9,7,7,5,6,9,1],
 [12,14,10,7,9,6,7,11,7,3,5,7,2],
 [12,10,18,4,3,4,12,17,5,2,5,8,0],
 [11,19,4,3,12,4,10,6,10,7,7,6,1],
 [23,8,14,13,7,13,3,9,5,0,4,1,0],
 [11,11,20,5,3,7,12,14,6,2,4,5,0]
];
const safePrey=new Set(["rat","rabbit","pigeon","frog"]);
const smallPredators=new Set(["strayCat","wildFox","weasel","snake","crow"]);
function weight(type,region,day,weather){
 const i=types.indexOf(type);if(i<0)return 0;
 const row=districts[region]||districts[0];let n=row[i];
 const year=Math.max(1,1+Math.floor((Math.max(1,day)-1)/365));
 if(year>=3&&["raccoonDog","wildFox","weasel","boar"].includes(type))n*=1.25;
 if(year>=10&&["wildFox","snake","deer","boar"].includes(type))n*=1.45;
 if(year>=30&&["deer","wildFox","raccoonDog"].includes(type))n*=1.25;
 if(year>=100&&["deer","boar","wildFox"].includes(type))n*=1.2;
 if(weather==="RAIN"||weather==="THUNDER"){
  if(type==="frog")n*=1.7;
  if(type==="pigeon"||type==="crow")n*=.65;
  if(type==="deer")n*=.75;
 }
 return n;
}
function pick(region,day,weather,preyOnly=false,random=Math.random){
 const weighted=types.map(type=>({type,weight:preyOnly&&!safePrey.has(type)?0:weight(type,region,day,weather)}));
 const total=weighted.reduce((sum,x)=>sum+x.weight,0);
 let roll=random()*total;
 for(const entry of weighted){roll-=entry.weight;if(roll<0&&entry.weight>0)return entry.type;}
 return "rat";
}
window.WildFauna=Object.freeze({species,types,districts,smallPredators,safePrey,weight,pick});
})();