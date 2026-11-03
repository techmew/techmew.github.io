/* Ordinary wildlife distribution: safe to load before game.js. */
(()=>{"use strict";
const species={
 serow:{hp:136,r:23,speed:265,damage:11,prey:true,xp:5,food:57,color:"#756b5c",belly:"#c1b6a0"},
 mountainGoat:{hp:154,r:25,speed:231,damage:18,prey:true,xp:5,food:64,color:"#c9bba0",belly:"#f2e7d5"},
 chimpanzee:{hp:154,r:26,speed:187,damage:19,prey:false,xp:6,food:66,color:"#3c3733",belly:"#887568"},
 macaque:{hp:88,r:19,speed:210,damage:12,prey:false,xp:4,food:38,color:"#867361",belly:"#c5b39c"},
 strayCat:{hp:58,r:17,speed:250,damage:10,prey:false,xp:2,food:28,color:"#9d9989",belly:"#ded9cb"},
 snake:{hp:38,r:14,speed:104,damage:5,prey:true,xp:2,food:22,color:"#587b50",belly:"#abc68f"},
 venomSnake:{hp:52,r:15,speed:124,damage:8,prey:false,xp:3,food:26,color:"#4d5d28",belly:"#ead16c"},
 crow:{hp:25,r:14,speed:174,damage:2,prey:true,xp:1,food:20,color:"#313b44",belly:"#777a83"},
 raccoonDog:{hp:78,r:20,speed:160,damage:8,prey:false,xp:2,food:41,color:"#89755b",belly:"#c5ad89"},
 wildFox:{hp:67,r:19,speed:274,damage:12,prey:false,xp:3,food:40,color:"#bc7752",belly:"#e8d6b5"},
 weasel:{hp:34,r:12,speed:250,damage:6,prey:false,xp:2,food:21,color:"#ae906a",belly:"#ddc7a7"},
 frog:{hp:14,r:10,speed:125,damage:0,prey:true,xp:1,food:12,color:"#75a66a",belly:"#b6d6a0"},
 deer:{hp:142,r:27,speed:286,damage:6,prey:true,xp:4,food:69,color:"#aa8865",belly:"#e0cbaa"},
 cheetah:{hp:96,r:23,speed:414,damage:19,prey:false,xp:6,food:54,color:"#d4b174",belly:"#eedbb1"},
 giraffe:{hp:245,r:35,speed:263,damage:25,prey:false,xp:9,food:105,color:"#c99e65",belly:"#ead09f"},
 zebra:{hp:126,r:26,speed:295,damage:13,prey:true,xp:5,food:71,color:"#dfdbca",belly:"#404245"},
 lion:{hp:245,r:37,speed:340,damage:27,prey:false,xp:9,food:108,color:"#bc8e56",belly:"#e7c89b"},
 elephant:{hp:560,r:55,speed:173,damage:34,prey:false,xp:13,food:175,color:"#818c86",belly:"#b1bbb0"},
 manul:{hp:64,r:18,speed:158,damage:12,prey:false,xp:4,food:32,color:"#8b8981",belly:"#c9c5ba"},
 tibetanFox:{hp:73,r:19,speed:215,damage:12,prey:false,xp:4,food:38,color:"#b59a76",belly:"#e5d6bd"},
 shoebill:{hp:96,r:24,speed:105,damage:18,prey:false,xp:5,food:43,color:"#777f83",belly:"#b7bdc0"},
 hippo:{hp:425,r:46,speed:192,damage:30,prey:false,xp:12,food:140,color:"#807875",belly:"#b7a4a1"}
};
const types=["rat","rabbit","pigeon","dog","boar","strayCat","snake","crow","raccoonDog","wildFox","weasel","frog","deer","venomSnake","cheetah","giraffe","zebra","lion","elephant","hippo","macaque","chimpanzee","serow","mountainGoat","manul","tibetanFox","shoebill"];
const weights=[
 [24,8,20,9,0,18,2,12,3,0,3,1,0,1,0,0,0,0,0,0],
 [20,9,18,11,1,16,3,12,4,1,4,1,0,1,0,0,0,0,0,0],
 [13,19,6,5,7,6,9,7,7,5,6,9,1,3,2,2,4,1,1,0],
 [12,14,10,7,9,6,7,11,7,3,5,7,2,2,4,5,5,4,3,2],
 [12,10,18,4,3,4,12,17,5,2,5,8,0,4,0,0,1,0,0,4],
 [11,19,4,3,12,4,10,6,10,7,7,6,1,3,3,2,5,3,2,0],
 [23,8,14,13,7,13,3,9,5,0,4,1,0,1,0,0,0,0,0,0],
 [11,11,20,5,3,7,12,14,6,2,4,5,0,4,0,0,1,0,0,3]
];
function weight(type,region,day=1,weather="CLEAR"){
 const idx=types.indexOf(type);if(idx<0)return 0;
 let w=(weights[region]||weights[0])[idx]||0;
 const year=window.WildWorldClock?.fromDay?.(day)?.year+1 || 1+Math.floor(Math.max(0,day-1)*85/120);
  // Distribution shifts on the compressed event timeline; physical animal age does not.
  const eraYear=window.WildWorldClock?.eventYear?.(year)??year*3;
 if(eraYear>=3&&["raccoonDog","wildFox","weasel","boar"].includes(type))w*=1.25;
 if(eraYear>=10&&["wildFox","snake","deer","boar"].includes(type))w*=1.45;
 if(eraYear>=30&&["deer","wildFox","raccoonDog"].includes(type))w*=1.25;
 if(eraYear>=100&&["deer","boar","wildFox"].includes(type))w*=1.2;
 // Habitat-specific encounters: these rare specialists are not city-wide spawns.
 if(type==="manul")w=region===3||region===5?2.1:0;
 if(type==="tibetanFox")w=region===3||region===5?1.7:0;
 if(type==="shoebill")w=region===7||region===4?1.4:0;
 if(weather==="SNOW"&&["frog","snake","venomSnake"].includes(type))w*=.12;
 if(weather==="SNOW"&&["deer","boar","rabbit"].includes(type))w*=.72;
 if(weather==="HEAT"&&["frog","deer"].includes(type))w*=.65;
 if(weather==="RAIN"||weather==="THUNDER"){
  if(["cheetah","lion","giraffe","zebra"].includes(type))w*=.58;
  if(type==="hippo")w*=1.25;
  if(type==="frog")w*=1.7;
  if(["pigeon","crow"].includes(type))w*=.65;
  if(type==="deer")w*=.75;
 }
 return w;
}
function choose(region,day,weather,preyOnly=false,random=Math.random()){
 const pool=types.map(type=>({type,w:preyOnly&&!["rat","rabbit","pigeon","frog"].includes(type)?0:weight(type,region,day,weather)}));
 const sum=pool.reduce((v,e)=>v+e.w,0);let target=random*sum;
 for(const entry of pool){target-=entry.w;if(target<0&&entry.w>0)return entry.type;}
 return "rat";
}
// Pose selection is read-only; hunting AI and SAVE_SCHEMA remain unchanged.
function visualState(o){
 const feeding=(o.scavengePose||0)>0,bite=(o.swing||0)>0;
 const tracking=!feeding&&Number.isFinite(o.wildTargetX)&&Number.isFinite(o.wildTargetY)&&Number.isFinite(o.wildTargetAt)&&o.wildTargetAt>=0&&Math.hypot((o.x||0)-o.wildTargetX,(o.y||0)-o.wildTargetY)<310;
 return {feeding,bite,tracking,alert:!feeding&&((o.windup||0)>0||tracking),sprint:!feeding&&Math.hypot(o.vx||0,o.vy||0)>Math.max(85,(o.speed||170)*.65)};
}
// Dedicated 2D silhouettes for animals that are not merely reskinned cats or foxes.
// Called after the host renderer has translated and rotated to the animal's position.
function draw2D(ctx,o,r,fur,light,pace){
 const type=o.type==="venomSnake"?"snake":o.type;
 if(!["rat","chimpanzee","macaque","snake","frog","crow","deer","serow","mountainGoat","weasel","raccoonDog","wildFox","cheetah","giraffe","zebra","lion","elephant","hippo"].includes(type))return false;
 const ellipse=(x,y,rx,ry,color,rot=0)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,Math.max(.5,rx),Math.max(.5,ry),rot,0,Math.PI*2);ctx.fill();
 };
 const poly=(points,color)=>{
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(points[0],points[1]);
  for(let i=2;i<points.length;i+=2)ctx.lineTo(points[i],points[i+1]);
  ctx.closePath();ctx.fill();
 };
 const line=(x,y,xx,yy,width,color)=>{
  ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";
  ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(xx,yy);ctx.stroke();
 };
 if(type==="rat"){
  // Cave prey: tapered tail, whiskers and alert ears, not a generic canine.
  const startled=(o.flee||0)>0,resting=!!o.resting;
  const stretch=startled?1.18:resting?.86:1;
  for(let k=0;k<6;k++){
   const x=-r*(1.02+k*.30),y=Math.sin(k*.55+(o.step||0)*.4)*r*.12;
   ellipse(x,y,r*(.24-k*.024),r*.10,"#c39c96");
  }
  for(const side of [-1,1])for(const front of [-1,1])
   ellipse(front*r*.55,side*r*.42+pace*side*.18,r*.18,r*.13,fur);
  ellipse(-r*.14,0,r*1.02*stretch,r*.49,fur);
  ellipse(r*.72,0,r*.51,r*.42,fur);
  for(const side of [-1,1]){
   ellipse(r*.54,side*r*.39,r*.24,r*.24,"#b9908b");
   ellipse(r*.98,side*r*.25,r*.10,r*.09,"#171c1b");
   for(let k=-1;k<=1;k++)line(r*1.13,side*r*.15,r*1.60,side*(r*.21+k*r*.12),1,"#e1d3c0");
  }
  ellipse(r*1.18,0,r*.31,r*.19,light);
  ellipse(r*1.43,0,r*.10,r*.08,"#d3a4a0");
 }else if(type==="chimpanzee"){
  // Long-armed, broad-shouldered ape. Branch and stone are real combat states.
  const ready=(o.chimpTell||0)>0,club=ready&&o.chimpAttackKind==="branch";
  ellipse(-r*.20,0,r*1.02,r*.79,fur);
  ellipse(r*.62,0,r*.72,r*.63,fur);
  ellipse(r*1.04,0,r*.54,r*.48,"#706257");
  ellipse(r*1.31,0,r*.31,r*.26,"#a58c78");
  for(const side of [-1,1]){
   ellipse(r*.83,side*r*.48,r*.24,r*.21,fur);
   ellipse(r*1.20,side*r*.28,r*.09,r*.07,"#171b1a");
   line(r*.23,side*r*.55,r*.34,side*r*1.39+(side<0?pace:0),r*.29,fur);
   ellipse(r*.39,side*r*1.42,r*.24,r*.20,"#847267");
   line(-r*.71,side*r*.44,-r*.93,side*r*.98-pace*.28,r*.27,fur);
   ellipse(-r*.99,side*r*1.03,r*.27,r*.22,"#5b514b");
  }
  if(club){line(r*.42,-r*1.36,r*.96,-r*2.30,r*.18,"#91704a");ellipse(r*.97,-r*2.31,r*.22,r*.14,"#9c7951");}
  else if(ready)ellipse(r*.44,-r*1.43,r*.26,r*.23,"#b5a997");
 }else if(type==="macaque"){
  const climbing=Math.max(0,o.treeHeight||0),preparing=(o.macaqueTell||0)>0;
  for(const side of [-1,1]){
   line(-r*.54,side*r*.36,-r*.8,side*r*.91+pace*.35,r*.23,fur);
   line(r*.46,side*r*.43,r*.66,side*r*.92-pace*.3,r*.24,fur);
   ellipse(r*.70,side*r*.98,r*.21,r*.16,"#ac837b");
  }
  ellipse(-r*.24,0,r*.96,r*.68,fur);
  ellipse(r*.58,0,r*.69,r*.62,fur);
  ellipse(r*1.02,0,r*.46,r*.42,"#b47f7b");
  ellipse(r*1.23,0,r*.24,r*.20,"#c99b93");
  for(const side of [-1,1]){
   ellipse(r*.68,side*r*.51,r*.22,r*.22,fur);
   ellipse(r*1.12,side*r*.27,r*.08,r*.07,"#26292b");
  }
  line(-r*.99,0,-r*1.38,r*.22,r*.20,fur);
  if(preparing){ellipse(r*.55,-r*.99,r*.23,r*.22,"#91877a");line(r*.42,-r*.40,r*.55,-r*.98,r*.19,fur);}
  if(climbing>8)ellipse(-r*.15,r*.86,r*.50,r*.12,"#a2bda0");
 }else if(type==="snake"){
  // Distinct long, curved, legless body; a raised head signals an actual attack windup.
  const ready=(o.windup||0)>0,striking=(o.swing||0)>0;
  for(let k=7;k>=0;k--){
   const x=(3.6-k*.54)*r;
   const y=Math.sin(k*.93+(o.step||0)*.45)*r*.40;
   ellipse(x,y,r*(.42-k*.025),r*(.26-k*.016),k%2?fur:light,-k*.12);
  }
  if(ready||striking)ellipse(r*.98,-r*.08,r*.33,r*.34,light);
  ellipse(r*(ready?1.30:striking?1.66:1.42),ready?-r*.29:0,r*.48,r*(ready?.39:.30),fur);
  ellipse(r*(ready?1.60:1.71),ready?-r*.42:-r*.19,r*.075,r*.07,"#f5e5bd");
  line(r*(ready?1.72:1.89),ready?-r*.34:0,r*(ready?2.12:2.2),ready?-r*.49:-r*.1,1.3,"#dc8f8c");
  if(ready)line(r*.93,r*.29,r*1.62,r*.48,Math.max(1,r*.08),"#d9b67a");
  if(o.type==="venomSnake"){
   for(let j=0;j<6;j++)ellipse((2.2-j*.64)*r,Math.sin(j*.93)*r*.18,r*.12,r*.28,"#e6c64f",-.3);
   ellipse(r*1.75,-r*.22,r*.12,r*.10,"#1b1d12");
   line(r*1.88,r*.10,r*2.1,r*.28,1.6,"#fff2bf");
  }
 }else if(type==="frog"){
  for(const side of [-1,1]){
   ellipse(-r*.58,side*r*.77+pace*.3,r*.38,r*.29,fur,side*.3);
   line(-r*.69,side*r*.80,-r*1.07,side*r*1.21,2.2,light);
   ellipse(r*.65,side*r*.65,r*.22,r*.39,light,side*.45);
  }
  ellipse(-r*.07,0,r*1.00,r*.78,fur);
  ellipse(r*.59,0,r*.60,r*.55,fur);
  for(const side of [-1,1]){
   ellipse(r*.71,side*r*.43,r*.20,r*.22,light);
   ellipse(r*.75,side*r*.46,r*.10,r*.12,"#182527");
  }
  ellipse(r*.95,0,r*.13,r*.12,"#48764c");
 }else if(type==="crow"){
  ellipse(-r*.2,0,r*1.10,r*.55,fur);
  for(const side of [-1,1]){
   poly([-r*.18,0,-r*1.16,side*r*1.18,r*.48,side*r*.37],side<0?"#43505c":"#252e38");
   ellipse(r*.62,side*r*.23,r*.32,r*.22,fur);
  }
  poly([-r*.89,-r*.11,-r*1.74,-r*.43,-r*1.40,0,-r*1.72,r*.37,-r*.87,r*.10],"#202832");
  ellipse(r*.66,0,r*.42,r*.36,fur);
  poly([r*.93,-r*.15,r*1.53,0,r*.93,r*.17],"#747b7d");
  ellipse(r*.81,-r*.19,1.8,1.8,"#e5e4d4");
 }else if(type==="serow"||type==="mountainGoat"){
 const goat=type==="mountainGoat",lean=(o.headbuttTell||0)>0?r*.22:0,feeding=(o.foragePose||0)>0;
 for(const side of [-1,1])for(const front of [-1,1])
  line(front*r*.55,side*r*.4,front*r*.55+pace*.2,side*r*(goat?1.35:1.53),r*.17,"#5e584b");
 ellipse(-r*.15,0,r*(goat?1.06:1.16),r*(goat?.72:.56),fur);
 ellipse(r*.61,0,r*.60,r*.45,fur);
 ellipse(r*1.12+lean,feeding?r*.12:0,r*.46,r*.31,fur);
 ellipse(r*1.42+lean,feeding?r*.18:0,r*.28,r*.20,light);
 for(const side of [-1,1]){
  ellipse(r*.91+lean,side*r*.41,r*.20,r*.13,fur,side*.30);
  line(r*.94+lean,side*r*.17,goat?r*.65+lean:r*1.03+lean,side*r*(goat?.85:.66),r*.11,goat?"#776e5c":"#4d4941");
  line(goat?r*.65+lean:r*1.03+lean,side*r*(goat?.85:.66),goat?r*.43+lean:r*1.10+lean,side*r*(goat?1.03:.84),r*.075,goat?"#776e5c":"#4d4941");
  ellipse(r*1.24+lean,side*r*.16,r*.08,r*.07,"#242923");
 }
 if(goat)ellipse(r*1.30+lean,r*.16,r*.15,r*.29,"#c8bda8");
 ellipse(-r*1.10,0,r*.22,r*.18,light);
 }else if(type==="deer"){
  for(const side of [-1,1]){
   line(-r*.53,side*r*.50+pace*.16,-r*.80,side*r*1.50,r*.16,"#69543e");
   line(r*.50,side*r*.49-pace*.16,r*.67,side*r*1.53,r*.15,"#69543e");
  }
  ellipse(-r*.22,0,r*1.16,r*.62,fur);
  ellipse(r*.68,0,r*.65,r*.40,fur);
  ellipse(r*1.16,0,r*.43,r*.30,light);
  for(const side of [-1,1]){
   ellipse(r*.76,side*r*.44,r*.23,r*.15,fur,side*.35);
   line(r*1.02,side*r*.16,r*1.34,side*r*.85,r*.10,"#b7a184");
   line(r*1.34,side*r*.85,r*1.52,side*r*1.12,r*.08,"#b7a184");
   line(r*1.31,side*r*.79,r*1.08,side*r*1.07,r*.07,"#b7a184");
  }
  ellipse(-r*1.21,0,r*.31,r*.18,light);
  ellipse(r*1.26,-r*.10,1.9,1.9,"#262927");
 }else if(type==="weasel"){
  // Hunt, bite and feeding have separate silhouettes; no additional AI state.
  const bite=(o.swing||0)>0,feeding=(o.scavengePose||0)>0;
  const stalk=Number.isFinite(o.wildTargetX)&&Number.isFinite(o.wildTargetY)&&
   Math.hypot(o.x-o.wildTargetX,o.y-o.wildTargetY)<240&&!feeding;
  const headX=r*(bite?1.30:feeding?.99:1.13),tailWave=Math.sin((o.step||0)*.7)*r*.13;
  for(const side of [-1,1])for(const x of [-r*.77,r*.47]){
   ellipse(x+(bite&&x>0?r*.21:0),side*r*.48+pace*side,r*.18,r*.23,"#685441");
  }
  for(let k=0;k<5;k++)ellipse(-r*(1.1+k*.30),Math.sin(k*.45)*r*.13+tailWave,r*(.26-k*.037),r*.14,fur);
  ellipse(-r*.16,0,r*(stalk?1.43:1.35),r*(feeding?.40:.35),fur);
  ellipse(headX,feeding?r*.11:0,r*(bite?.47:.43),r*.31,fur);
  ellipse(headX+r*.20,feeding?r*.16:0,r*.24,r*.19,light);
  ellipse(headX+r*.22,bite?r*.20:r*.08,r*.20,r*(bite?.12:.055),bite?"#4b2925":light);
  for(const side of [-1,1]){
   ellipse(headX-r*.13,side*r*.29,r*.16,r*.19,fur);
   ellipse(headX+r*.24,side*r*.18,r*.09,r*.075,"#e8d9b7");
   ellipse(headX+r*.27,side*r*.18,r*.043,r*.048,"#252720");
  }
  ellipse(headX+r*.38,-r*.03,1.6,1.5,"#252720");

  }else if(type==="wildFox"){
  const s=visualState(o),head=r*(s.bite?1.40:s.feeding?.94:1.17),low=s.feeding?r*.17:s.tracking?r*.08:0;
  for(const side of [-1,1])for(const front of [-1,1])ellipse(front*r*.62+(s.bite&&front>0?r*.22:0),side*r*.47+pace*side*.65,r*.18,r*.24,"#644b39");
  ellipse(-r*.16,low,r*(s.sprint?1.27:1.15),r*(s.tracking?.48:.55),fur);
  ellipse(r*.41,low+r*.13,r*.63,r*.37,light);
  for(let k=0;k<5;k++)ellipse(-r*(1.10+k*.31),Math.sin((o.step||0)*.6+k*.48)*r*.11,r*(.35-k*.026),r*(.31-k*.032),k===4?"#e7dfcf":fur);
  ellipse(head,low,r*.48,r*.39,fur);
  for(const side of [-1,1]){
   poly([head-r*.20,side*r*.28,head-r*.12,side*r*.81,head+r*.15,side*r*.37],fur);
   ellipse(head+r*.21,side*r*.23,r*.11,r*.09,"#f3e5c7");
   ellipse(head+r*.24,side*r*.23,r*.045,r*.05,"#202822");
  }
  poly([head+r*.24,-r*.23,head+r*.88,0,head+r*.24,r*.23],light);
  ellipse(head+r*.88,0,r*.10,r*.08,"#292d29");
  if(s.bite)ellipse(head+r*.40,r*.24,r*.31,r*.09,"#4b2925");
  if(s.alert)ellipse(head-r*.13,-r*.42,r*.24,r*.065,"#d5a67b");
 }else if(type==="cheetah"){
  for(const side of [-1,1])for(const x of [-r*.67,r*.56])ellipse(x,side*r*.48+pace*side,r*.18,r*.34,fur);
  line(-r*.9,0,-r*2.1,-r*.42,r*.12,fur);
  ellipse(-r*.08,0,r*1.32,r*.42,fur);ellipse(r*.93,0,r*.41,r*.33,fur);
  for(let k=0;k<13;k++){const x=(-1.1+(k*7%13)*.18)*r,y=(((k*5)%9)-4)*r*.105;ellipse(x,y,r*.045,r*.07,"#463c30");}
  for(const side of [-1,1]){ellipse(r*.96,side*r*.29,r*.12,r*.07,"#201e20");line(r*1.07,side*r*.18,r*1.20,side*r*.30,r*.05,"#39352c");}
 }else if(type==="giraffe"){
  const headAttack=!!o.attackVariation?.neckStrike&&((o.windup||0)>0||(o.swing||0)>0);
  const headSway=headAttack?Math.sin(((o.windup||0)+(o.swing||0))*16)*r*.45:0;
  for(const side of [-1,1])for(const front of [-1,1]){
   const x=front*r*.57;line(x,side*r*.36,x+front*r*.16,side*r*1.38,r*.13,fur);
   ellipse(x+front*r*.18,side*r*1.39,r*.20,r*.11,"#5e4934");
  }
  ellipse(-r*.19,0,r*1.17,r*.45,fur);
  for(let k=0;k<9;k++){const x=(-1+(k*7%10)*.19)*r,y=(((k*3)%7)-3)*r*.10;ellipse(x,y,r*.15,r*.13,"#a9733f");}
  ellipse(r*.65,0,r*.50,r*.23,fur);ellipse(r*1.20,headSway*.45,r*.55,r*.24,fur);
  for(const side of [-1,1]){
   ellipse(r*1.35,headSway+side*r*.27,r*.13,r*.14,fur);
   line(r*1.12,headSway*.55+side*r*.17,r*1.19,headSway+side*r*.42,r*.09,"#8e6a42");
   ellipse(r*1.20,headSway+side*r*.46,r*.09,r*.08,"#6b513e");
  }
  ellipse(r*1.60,headSway,r*.25,r*.17,light);ellipse(r*1.42,headSway-r*.16,r*.07,r*.07,"#242b25");
  line(-r*1.25,0,-r*1.67,-r*.27,r*.08,"#725234");
 }else if(type==="zebra"){
  for(const side of [-1,1])for(const x of [-r*.66,r*.52])ellipse(x,side*r*.57+pace*side,r*.18,r*.30,"#42403e");
  ellipse(-r*.2,0,r*1.20,r*.65,light);ellipse(r*.78,0,r*.57,r*.42,light);
  for(let k=0;k<8;k++){const x=(-1.07+k*.25)*r;line(x,-r*.56,x+r*.15,r*.56,r*.095,"#35383a");}
  for(const side of [-1,1])ellipse(r*.69,side*r*.48,r*.15,r*.23,light);
  ellipse(r*1.18,0,r*.39,r*.21,"#4a4a46");ellipse(r*1.04,-r*.22,r*.06,r*.06,"#f3efe7");
  line(-r*1.37,0,-r*2.00,-r*.19,r*.09,"#3f4644");
 }else if(type==="lion"){
  for(const side of [-1,1])for(const x of [-r*.59,r*.5])ellipse(x,side*r*.63+pace*side,r*.26,r*.33,fur);
  ellipse(-r*.21,0,r*1.26,r*.66,fur);ellipse(r*.69,0,r*.77,r*.80,"#926a3d");
  ellipse(r*1.12,0,r*.52,r*.42,fur);ellipse(r*1.48,0,r*.30,r*.18,light);
  for(const side of [-1,1]){ellipse(r*1.2,side*r*.27,r*.12,r*.08,"#302923");ellipse(r*.80,side*r*.56,r*.20,r*.18,"#9c7549");}
  line(-r*1.18,0,-r*1.85,r*.28,r*.12,fur);ellipse(-r*1.84,r*.26,r*.16,r*.13,"#655037");
 }else if(type==="elephant"){
  for(const side of [-1,1])for(const x of [-r*.60,r*.59])ellipse(x,side*r*.70+pace*side,r*.35,r*.41,"#68736d");
  ellipse(-r*.17,0,r*1.42,r*1.04,fur);ellipse(r*.86,0,r*.99,r*.85,light);
  for(const side of [-1,1]){
   ellipse(r*.90,side*r*.87,r*.46,r*.59,"#78847d");
   ellipse(r*1.25,side*r*.27,r*.10,r*.10,"#303835");
   line(r*1.4,side*r*.34,r*2.0,side*r*.35,r*.13,"#e9dec6");
  }
  for(let k=0;k<5;k++)ellipse(r*(1.4+k*.19),Math.sin(k*.5)*r*.13,r*(.27-k*.025),r*(.27-k*.025),fur);
 }else if(type==="hippo"){
  for(const side of [-1,1])for(const x of [-r*.6,r*.56])ellipse(x,side*r*.72+pace*side,r*.32,r*.37,"#716867");
  ellipse(-r*.18,0,r*1.34,r*1.04,fur);ellipse(r*.86,0,r*.82,r*.69,fur);
  ellipse(r*1.39,0,r*.68,r*.49,light);
  for(const side of [-1,1]){
   ellipse(r*1.05,side*r*.65,r*.19,r*.22,fur);
   ellipse(r*1.37,side*r*.36,r*.15,r*.12,"#342e2e");
   ellipse(r*1.52,side*r*.17,r*.12,r*.10,"#554c4b");
  }
 }else if(type==="raccoonDog"){
  for(const side of [-1,1])for(const x of [-r*.5,r*.46]){
   ellipse(x,side*r*.63+pace*side,r*.25,r*.32,"#554a40");
  }
  ellipse(-r*.13,(o.scavengePose||0)>0?r*.17:0,r*(Math.hypot(o.vx||0,o.vy||0)>125?1.21:1.12),r*(visualState(o).tracking?.58:.68),fur);
  ellipse(-r*1.37,0,r*.59,r*.34,"#554b40");
  ellipse(r*.73+(visualState(o).bite?r*.25:visualState(o).feeding?-r*.15:visualState(o).tracking?r*.10:0),0,r*.62,r*.53,fur);
  for(const side of [-1,1]){
   ellipse(r*.78,side*r*.27,r*.27,r*.24,"#484843",side*.5);
   ellipse(r*.97,side*r*.24,r*.095,r*.075,"#e9d9b7");
   ellipse(r*.98,side*r*.24,r*.04,r*.05,"#1b201d");
  }
  ellipse(r*1.25,0,r*.24,r*.19,light);
  if(visualState(o).bite)ellipse(r*1.20,r*.24,r*.30,r*.10,"#512c25");
  if(visualState(o).alert)line(r*.75,-r*.51,r*1.06,-r*.57,Math.max(1,r*.08),"#d0b08e");
  ellipse(r*1.39,0,r*.09,r*.075,"#20221c");
 }
 return true;
}
window.WildFauna=Object.freeze({species,types,weights,weight,choose,visualState,draw2D});
})();