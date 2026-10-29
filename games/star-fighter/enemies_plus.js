/* STAR FIGHTER: original silhouettes, stage-gated enemy behaviors.
   Enemy classes replace existing squads rather than increasing density. */
(()=>{'use strict';
const TAU=Math.PI*2;
const roster=[
 {type:'bulk',unlock:1,hp:28,score:420,speed:94,radius:70,clearance:191,ship:49,shot:62,name:'BULK HULK'},
 {type:'armature',unlock:2,hp:82,score:560,speed:115,radius:66,clearance:188,ship:32,shot:52,name:'LONG ARM'},
 {type:'howitzer',unlock:3,hp:94,score:650,speed:81,radius:51,clearance:175,ship:38,shot:44,name:'SIEGE CANNON'},
 {type:'lancer',unlock:4,hp:34,score:430,speed:118,radius:31,clearance:159,ship:21,shot:29,name:'SPEAR LANCER'},
 {type:'manta',unlock:5,hp:52,score:500,speed:172,radius:44,clearance:172,ship:29,shot:37,name:'RIFT MANTA'},
 {type:'orbiter',unlock:6,hp:65,score:570,speed:127,radius:37,clearance:165,ship:25,shot:32,name:'ORBIT WATCHER'},
 {type:'wraith',unlock:7,hp:43,score:650,speed:198,radius:30,clearance:169,ship:21,shot:27,name:'VOID WRAITH'}
];
const stats=Object.fromEntries(roster.map(v=>[v.type,v]));
function contains(type){return !!stats[type]}
function pick(stage,base,roll,randomInt){
 const unlocked=roster.filter(v=>v.unlock<=stage);
 if(!unlocked.length||roll()>=Math.min(.42,.17+stage*.036))return base;
 return 18+unlocked[randomInt(0,unlocked.length-1)].unlock;
}
function wave(kind,queue,W,random,risk){
 if(kind===19){queue('bulk',W+110,random(205,480));if(risk)queue('scout',W+270,random(170,490))}
 else if(kind===20){queue('armature',W+135,random(220,455));if(risk)queue('dart',W+310,random(170,510))}
 else if(kind===21){queue('howitzer',W+130,random(190,475));if(risk)queue('scout',W+315,random(175,500))}
 else if(kind===22){queue('lancer',W+165,random(210,445),{lockY:null});if(risk)queue('lancer',W+350,random(170,505),{lockY:null})}
 else if(kind===23){queue('manta',W+150,random(200,475));if(risk)queue('dart',W+315,random(170,495))}
 else if(kind===24){queue('orbiter',W+115,random(210,460));if(risk)queue('scout',W+285,random(170,505))}
 else if(kind===25){queue('wraith',W+150,random(205,455));if(risk)queue('manta',W+365,random(155,525))}
}
function motion(e,home,phase){
 switch(e.type){
 case 'bulk':return {target:home+Math.sin(e.t*.75+phase)*12,follow:2.4};
 case 'armature':return {target:home+Math.sin(e.t*1.3+phase)*23,follow:2.4};
 case 'howitzer':return {target:home+Math.sin(e.t*.7+phase)*9,follow:2};
 case 'lancer':return {target:home,follow:1.9};
 case 'manta':return {target:home+Math.sin(e.t*2.6+phase)*72,follow:2.7};
 case 'orbiter':return {target:home+Math.sin(e.t*3.2+phase)*30,follow:3.1};
 case 'wraith':return {target:home+Math.sin(e.t*1.9+phase)*88,follow:2.3};
 default:return null;
 }
}
function advance(e,dt,p,fireEnemy,vx,W,H){
 if(e.type==='lancer'){
  if(e.lockY===null&&e.x<1050){e.lockY=Math.max(118,Math.min(H-85,p.y));e.t=0}
  if(e.lockY!==null){if(e.t<1){
    e.x+=vx*dt-58*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*1.2);
   }else e.x-=330*dt;}
 }
 if(e.windup>0){e.windup-=dt;
  if(e.windup<=0&&e.hp>0&&e.x<W-35&&e.x>120)fireEnemy(e,{x:e.aimX,y:e.aimY});
 }
}
function trigger(e,p){
 if(e.type!=='armature'&&e.type!=='howitzer')return false;
 e.windup=e.type==='howitzer'?1:.72;
 e.aimX=p.x;e.aimY=p.y;return true;
}
function fire(e,target,p,bullet,stage){
 if(!contains(e.type))return false;
 if(e.type==='bulk'||e.type==='lancer'||e.type==='wraith')return true;
 const arm=e.type==='armature',cannon=e.type==='howitzer';
 const bx=e.x-(arm?104:cannon?83:28),by=e.y+(arm?Math.sin(e.t*1.8+e.phase)*36:0);
 const aim=target?target:p;
 const angle=Math.atan2(aim.y-by,aim.x-bx);
 bullet(bx,by,angle,cannon?222+stage*5:arm?245+stage*8:e.type==='orbiter'?210+stage*8:245+stage*7,cannon?11:arm?6:e.type==='orbiter'?6:5,
  cannon?'#ffb868':arm?'#ffc58a':e.type==='orbiter'?'#baf1e9':'#c7aeff');
 return true;
}
function draw(e,c,{poly,ellipse,line,glowCircle}){
 const {type,t}=e;if(!contains(type))return false;
 if(type==='bulk'){
  ellipse(0,0,71,53,'#3e4855','#b9a5a0',3);
  poly([-70,-29,-101,-16,-103,16,-70,29],'#526474','#9dc8d4',2);
  poly([12,-43,48,-61,79,-29,79,29,48,61,12,43],'#73515b','#d9ad95',3);
  ellipse(-16,0,35,35,'#723e45','#ffd2a6',2);glowCircle(-16,0,13,'#ffdf92',8);
 }else if(type==='armature'){
  poly([-38,-30,28,-39,46,0,27,39,-38,30],'#365268','#a8d4df',3);
  const swing=Math.sin(t*1.8+e.phase)*36;
  line(-25,-16,-61,swing*.6,'#9ec8ce',13);line(-61,swing*.6,-104,swing,'#86a7bd',10);
  ellipse(-61,swing*.6,13,13,'#344b5b','#d9edf4',3);
  poly([-108,swing-12,-135,swing-7,-135,swing+7,-108,swing+12],'#947151','#ffcb79',2);
  glowCircle(-110,swing,e.windup>0?10:5,e.windup>0?'#ffdf88':'#85c9e9',7);
 }else if(type==='howitzer'){
  poly([-56,-34,-14,-47,41,-31,51,0,41,31,-14,47,-56,34],'#4c536d','#ddb884',3);
  ellipse(-5,0,30,25,'#596174','#ffe5b2',2);
  poly([-20,-12,-82,-12,-101,-7,-101,7,-82,12,-20,12],'#677388','#c6d7e3',3);
  glowCircle(-86,0,e.windup>0?12:5,e.windup>0?'#ffeaaa':'#f4a46b',10);
 }else if(type==='lancer'){
  poly([-29,-24,16,-18,71,0,16,18,-29,24,-42,0],'#354859','#a3f1f7',2.5);
  poly([-12,-9,67,0,-12,9],'#b6eaff','#ffffff',1);
  line(-28,-17,-48,-14,'#f0b77b',4);line(-28,17,-48,14,'#f0b77b',4);
  if(e.lockY!==null&&t<1)glowCircle(50,0,8+5*(1-t),'#fff0a4',10);
 }else if(type==='manta'){
  c.rotate(Math.sin(t*1.7+e.phase)*.12);
  poly([-46,0,-12,-15,20,-52,61,-34,35,0,61,34,20,52,-12,15],'#384a6e','#d8b9ff',3);
  poly([-37,-7,25,-13,48,0,25,13,-37,7],'#65558f','#f2d9ff',2);glowCircle(-17,0,8,'#e6baff',9);
 }else if(type==='orbiter'){
  c.rotate(t*.7);
  for(let j=0;j<3;j++){c.save();c.rotate(j*TAU/3);
   poly([-13,-21,12,-18,34,0,12,18,-13,21],'#34696a','#b7fff1',2);c.restore()}
  ellipse(0,0,17,17,'#41636b','#cefff8',2);glowCircle(0,0,9,'#b3fff7',12);
 }else if(type==='wraith'){
  c.rotate(Math.sin(t*3+e.phase)*.09);
  poly([-39,-9,-10,-36,42,-21,11,0,42,21,-10,36],'#3d3365','#bb9bff',2);
  poly([-27,-8,22,-13,48,0,22,13,-27,8],'#7866a1','#dfceff',2);glowCircle(-12,0,7,'#da9bff',11);
 }
 return true;
}
window.StarFighterEnemyExtras={roster,stats,contains,pick,wave,motion,advance,trigger,fire,draw};
})();