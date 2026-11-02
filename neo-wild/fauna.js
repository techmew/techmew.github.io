/* Ordinary wildlife distribution: safe to load before game.js. */
(()=>{"use strict";
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
const weights=[
 [24,8,20,9,0,18,2,12,3,0,3,1,0],
 [20,9,18,11,1,16,3,12,4,1,4,1,0],
 [13,19,6,5,7,6,9,7,7,5,6,9,1],
 [12,14,10,7,9,6,7,11,7,3,5,7,2],
 [12,10,18,4,3,4,12,17,5,2,5,8,0],
 [11,19,4,3,12,4,10,6,10,7,7,6,1],
 [23,8,14,13,7,13,3,9,5,0,4,1,0],
 [11,11,20,5,3,7,12,14,6,2,4,5,0]
];
function weight(type,region,day=1,weather="CLEAR"){
 const idx=types.indexOf(type);if(idx<0)return 0;
 let w=(weights[region]||weights[0])[idx];
 const year=1+Math.floor(Math.max(0,day-1)/365);
 if(year>=3&&["raccoonDog","wildFox","weasel","boar"].includes(type))w*=1.25;
 if(year>=10&&["wildFox","snake","deer","boar"].includes(type))w*=1.45;
 if(year>=30&&["deer","wildFox","raccoonDog"].includes(type))w*=1.25;
 if(year>=100&&["deer","boar","wildFox"].includes(type))w*=1.2;
 if(weather==="RAIN"||weather==="THUNDER"){
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
// Dedicated 2D silhouettes for animals that are not merely reskinned cats or foxes.
// Called after the host renderer has translated and rotated to the animal's position.
function draw2D(ctx,o,r,fur,light,pace){
 const type=o.type;
 if(!["snake","frog","crow","deer","weasel","raccoonDog"].includes(type))return false;
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
 if(type==="snake"){
  // Distinct long, curved, legless body rather than the generic mammal shape.
  for(let k=7;k>=0;k--){
   const x=(3.6-k*.54)*r;
   const y=Math.sin(k*.93+(o.step||0)*.45)*r*.40;
   ellipse(x,y,r*(.42-k*.025),r*(.26-k*.016),k%2?fur:light,-k*.12);
  }
  ellipse(r*1.42,0,r*.48,r*.30,fur);
  ellipse(r*1.71,-r*.19,r*.075,r*.07,"#f5e5bd");
  line(r*1.89,0,r*2.2,-r*.1,1.3,"#dc8f8c");
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
  for(const side of [-1,1])for(const x of [-r*.77,r*.47]){
   ellipse(x,side*r*.48+pace*side,r*.18,r*.23,"#685441");
  }
  for(let k=0;k<5;k++)ellipse(-r*(1.1+k*.30),Math.sin(k*.45)*r*.13,r*(.26-k*.037),r*.14,fur);
  ellipse(-r*.16,0,r*1.35,r*.35,fur);
  ellipse(r*1.13,0,r*.43,r*.31,fur);
  ellipse(r*1.33,0,r*.24,r*.19,light);
  for(const side of [-1,1])ellipse(r*.98,side*r*.29,r*.16,r*.19,fur);
  ellipse(r*1.34,-r*.14,1.6,1.5,"#252720");
 }else if(type==="raccoonDog"){
  for(const side of [-1,1])for(const x of [-r*.5,r*.46]){
   ellipse(x,side*r*.63+pace*side,r*.25,r*.32,"#554a40");
  }
  ellipse(-r*.13,0,r*1.12,r*.68,fur);
  ellipse(-r*1.37,0,r*.59,r*.34,"#554b40");
  ellipse(r*.73,0,r*.62,r*.53,fur);
  for(const side of [-1,1]){
   ellipse(r*.78,side*r*.27,r*.27,r*.24,"#484843",side*.5);
   ellipse(r*.97,side*r*.24,r*.095,r*.075,"#e9d9b7");
   ellipse(r*.98,side*r*.24,r*.04,r*.05,"#1b201d");
  }
  ellipse(r*1.25,0,r*.24,r*.19,light);
  ellipse(r*1.39,0,r*.09,r*.075,"#20221c");
 }
 return true;
}
window.WildFauna=Object.freeze({species,types,weights,weight,choose,draw2D});
})();