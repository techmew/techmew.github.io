/* Short-lived player contacts shared by the Canvas and WebGL ground passes. */
(()=>{
 "use strict";
 const hooves=new Set(["deer","serow","boar","giraffe","zebra","mountainGoat"]);
 const pads=new Set(["cat","manul","fox","tibetanFox","wolf","dog","wildDog","lion","tanuki","blackBear","badger"]);
 const marks=[];
 let owner=null,side=1;
 function record(actor,surface,speed,time,angle,height,landing=false){
  if(owner!==actor){marks.length=0;owner=actor;side=1;}
  if(actor.flying||actor.jumpTime>0||actor.pounceTime>0||actor.fallTime>0||actor.frogHopLift>2)return;
  const wet=surface==="water";
  if(!wet&&(surface==="hard"||actor.groundZ>2))return;
  side=-side;
  const r=actor.r,c=Math.cos(angle),s=Math.sin(angle);
  const x=landing?actor.x:actor.x-r*.55*c-(wet?0:side*r*.34*s);
  const y=landing?actor.y:actor.y-r*.55*s+(wet?0:side*r*.34*c);
  const kind=wet?"wake":hooves.has(actor.type)?"hoof":pads.has(actor.type)?"paw":"step";
  if(marks.length>=10)marks.shift();
  marks.push({x,y,z:height(x,y)+(wet?4.2:2.8),r:Math.max(4,Math.min(15,r*.37)),c,s,
   size:Math.min(1.6,.7+speed/420),kind,time,landing,life:landing?.45:wet?.78:1.45});
 }
 function each(actor,now,draw){
  if(actor!==owner)return;
  for(const m of marks){
   const age=(now-m.time)/m.life;
   if(age<0||age>=1)continue;
   const wet=m.kind==="wake",r=m.r*(wet?m.size*(.75+age):1-age*.55);
   const tint=wet?(age<.45?"#cef6e9":"#89c3bb"):"#534e41";
   const stamp=(f,l,rx,ry,a=0)=>draw(m.x+(f*m.c-l*m.s)*r,m.y+(f*m.s+l*m.c)*r,m.z,
    rx*r,ry*r,m.c*Math.cos(a)-m.s*Math.sin(a),m.s*Math.cos(a)+m.c*Math.sin(a),tint);
   if(m.landing){
    const reach=(1+age*4)*m.r,thickness=Math.max(.4,1.5*(1-age));
    for(let i=0;i<6;i++){
     const a=i*Math.PI/3,c=Math.cos(a),s=Math.sin(a);
     draw(m.x+c*reach,m.y+s*reach,m.z,reach*.40,thickness,-s,c,wet?"#b5e4de":"#b9a47c");
    }
   }else if(wet){stamp(-.5,-1.05,1.48,.19,.46);stamp(-.5,1.05,1.48,.19,-.46);}
   else if(m.kind==="hoof"){stamp(0,-.36,.95,.28,-.1);stamp(0,.36,.95,.28,.1);}
   else{
    stamp(0,0,.73,.55);
    if(m.kind==="paw"){stamp(.76,-.37,.34,.23);stamp(.86,.22,.34,.24);}
   }
  }
 }
 window.WildMovementTrail=Object.freeze({record,each});
})();
