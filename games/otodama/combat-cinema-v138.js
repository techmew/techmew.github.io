/* 声魂 v138: kinetic Canvas2D battle direction — presentation only, never affects damage or networking. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OtodamaCinema=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const TAU=Math.PI*2;
const cap=(v,a=0,b=1)=>Math.max(a,Math.min(b,Number.isFinite(Number(v))?Number(v):a));
const ease=x=>{const t=cap(x);return t*t*(3-2*t)};
const hash=(seed)=>{let x=Number(seed)>>>0;x=Math.imul(x^(x>>>16),0x7feb352d);x=Math.imul(x^(x>>>15),0x846ca68b);return(x^(x>>>16))>>>0};
function choreography(event,p,lowFx=false){
 if(!event)return {charge:0,dash:0,hit:0,combo:0,burst:0,zoom:1,shake:0,flash:0,afterimages:0};
 const ev=event,t=cap(p),wind=cap(Number(ev.windup)||.16,.08,.34),contact=.54;
 const charge=(t<wind?Math.sin(Math.PI*t/wind):0);
 const dash=(t>wind&&t<.55?Math.sin(Math.PI*cap((t-wind)/(.55-wind))):0);
 const successful=Number(ev.damage)>0&&!ev.dodge;
 const multihit=successful&&(Number(ev.hits)||1)>=3;
 const hits=cap(Math.floor(Number(ev.hits)||1),1,7);
 const sharp=x=>Math.pow(Math.max(0,1-Math.abs(x)*15),1.3);
 const primary=successful?sharp(t-.54):0;
 let secondary=0;
 if(multihit)for(let i=0;i<hits;i++){
  const center=.41+i*.29/Math.max(1,hits-1);
  secondary=Math.max(secondary,sharp(t-center)*(.44+.38*i/(hits-1)));
 }
 const hit=cap(Math.max(primary,secondary));
 const combo=multihit?secondary:0;
 const burst=ev.skill?Math.max(hit*.98,dash*.48):hit;
 const power=ev.skill?1.35:ev.crit?1.2:.93;
 const zoom=lowFx?1+burst*.012:1+.024*dash+.043*burst*power;
 const shake=lowFx?hit*1.1:hit*(ev.skill?13:ev.crit?10:6)+dash*1.1;
 const flash=(ev.dodge||ev.guard)?0:cap(hit*(ev.skill ? .26 : .1),0,.28);
 const afterimages=lowFx?1:ev.skill?5:ev.hits>1?4:3;
 return {charge,dash,hit,combo,burst,zoom,shake,flash,afterimages};
}
function scratch(c,x,y,r,color,alpha){c.save();c.globalAlpha*=cap(alpha);c.strokeStyle=color;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.restore();}
function slash(c,x,y,angle,length,color,alpha,thick=6){
 c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha=cap(alpha);
 c.lineCap='round';c.lineJoin='round';c.shadowBlur=20;c.shadowColor=color;
 c.strokeStyle='#f7fbff';c.lineWidth=thick+2;c.beginPath();c.moveTo(-length*.58,-length*.16);
 c.quadraticCurveTo(8,-length*.50,length*.6,length*.18);c.stroke();
 c.strokeStyle=color;c.lineWidth=thick*.67;c.beginPath();c.moveTo(-length*.58,-length*.16);
 c.quadraticCurveTo(8,-length*.50,length*.6,length*.18);c.stroke();
 c.restore();
}
function renderBehind(c,ev,pos,p,turn,color,lowFx=false){
 if(!ev||!Array.isArray(pos)||pos.length<2)return;
 const f=choreography(ev,p,lowFx),atk=Number(ev.atk)===1?1:0,pt=pos[atk];
 if(!pt||!Number.isFinite(pt.x)||!Number.isFinite(pt.y))return;
 c.save();c.globalCompositeOperation='screen';
 // Wind-up with an accelerating concentric halo; not a constant full-screen overlay.
 if(f.charge>.08){
  c.globalAlpha=f.charge*(lowFx ? .22 : .53);c.strokeStyle=color;
  c.lineWidth=lowFx?3:5;c.shadowColor=color;c.shadowBlur=lowFx?0:24;
  for(let j=0;j<(lowFx?1:3);j++){
   const a=(turn*.53+j)*2.5+p*10,rad=55+j*17+18*f.charge;
   c.beginPath();c.arc(pt.x,pt.y,rad,a,a+(1.6+j*.3));c.stroke();
  }
 }
 // Rapid direction-sensitive attack streaks, emitted only when the character is in motion.
 if(f.dash>.01){
  const n=lowFx?4:ev.skill?21:ev.hits>1?16:12;
  const face=atk===0?1:-1;
  c.lineCap='round';c.shadowColor=color;c.shadowBlur=lowFx?0:10;
  for(let j=0;j<n;j++){
   const v=(hash(turn*1087+j*1937)%1000)/1000;
   const layer=(hash(turn*3011+j*509)%1000)/1000;
   const y=pt.y+(v-.5)*(ev.skill?260:190);
   const offset=48+layer*205,depth=25+v*90;
   c.globalAlpha=f.dash*(.13+layer*.36);c.strokeStyle=j%4===0?'#ffffff':color;c.lineWidth=1+layer*3;
   c.beginPath();c.moveTo(pt.x-face*offset,y);c.lineTo(pt.x-face*(offset+depth+f.dash*58),y+(v-.5)*21);c.stroke();
  }
 }
 // Terrain contact: sparks across the floor as the fighter leaves the ground.
 if(f.dash>.2&&['rush','combo','warp','counter'].includes(ev.kind)){
  const n=lowFx?3:9;
  for(let j=0;j<n;j++){
   const v=(hash(turn*839+j*211) % 120)/120,ang=(j/n)*TAU;
   c.strokeStyle=j%2?'#ffffff':color;c.lineWidth=1+j%3;c.globalAlpha=f.dash*.4;
   c.beginPath();c.moveTo(pt.x+(j%2?1:-1)*26,354);
   c.lineTo(pt.x+(j%2?1:-1)*(40+v*95),354-v*37);c.stroke();
  }
 }
 c.restore();
}
function renderAhead(c,ev,pos,p,turn,color,lowFx=false){
 if(!ev||!Array.isArray(pos)||pos.length<2)return;
 const f=choreography(ev,p,lowFx),atk=Number(ev.atk)===1?1:0,def=1-atk;
 const a=pos[atk],d=pos[def];if(!a||!d)return;
 if(![a.x,a.y,d.x,d.y].every(Number.isFinite))return;
 c.save();c.globalCompositeOperation='screen';
 const guarded=!!ev.guard||!!ev.parry,evaded=!!ev.dodge;
 const cx=cap(d.x,52,668),cy=cap(d.y,54,382);
 // Sweeping weapon arcs: staggered combo sub-hits are visible even without additional UI buttons.
 if(f.dash>.05||f.combo>.05){
  const sweep=Math.max(f.dash,f.combo);
  slash(c,(a.x+d.x)/2,(a.y+d.y)/2,Math.atan2(d.y-a.y,d.x-a.x)+Math.PI*.27,
    (lowFx?95:135)*(ev.skill?1.16:1),color,sweep*(evaded ? .35 : .66),ev.skill?8:5);
  if(!lowFx&&(ev.hits>1||ev.kind==='spin')&&f.combo>.05)
   slash(c,(a.x+d.x)/2+14,(a.y+d.y)/2+8,-.9+p*TAU*.6,111,color,f.combo*.43,4);
 }
 // Clash-specific readable effects: guard -> shield, dodge -> air cut, otherwise impact.
 if(guarded&&f.hit>.03){
  c.strokeStyle='#9efff0';c.shadowColor='#c4fff3';c.shadowBlur=lowFx?3:17;
  c.globalAlpha=f.hit*.78;c.lineWidth=lowFx?5:10;
  c.beginPath();c.arc(cx,cy,38+70*(1-f.hit),-.58,Math.PI*1.63);c.stroke();
 }else if(evaded&&p>.3&&p<.8){
  const fly=1-Math.abs(p-.53)/.3;
  c.globalAlpha=cap(fly)*.48;c.strokeStyle='#a3fff1';c.lineWidth=4;
  for(let j=0;j<(lowFx?1:3);j++){
   c.beginPath();c.ellipse(cx,cy+18,45+j*18,85+j*9,(j-1)*.3,0,Math.PI*1.45);c.stroke();
  }
 }else if(f.hit>.01&&Number(ev.damage)>0){
  // Main collision ring and shards hit where the defender is actually standing.
  c.globalAlpha=f.hit*(lowFx ? .49 : .85);c.shadowColor=color;c.shadowBlur=lowFx?0:25;
  c.strokeStyle='#fffdf2';c.lineWidth=lowFx?5:12;
  c.beginPath();c.arc(cx,cy,23+(1-f.hit)*96,0,TAU);c.stroke();
  c.strokeStyle=color;c.lineWidth=lowFx?5:17;
  c.beginPath();c.arc(cx,cy,34+(1-f.hit)*130,0,TAU);c.stroke();
  const count=lowFx?8:ev.skill?36:ev.hits>1?23:16;
  for(let j=0;j<count;j++){
   const jitter=(hash(turn*131+j*613)%1000)/1000;
   const ang=j*TAU/count+(jitter-.5)*.23,range=(ev.skill?95:68)+(1-f.hit)*85+jitter*42;
   c.globalAlpha=f.hit*(.37+jitter*.56);c.strokeStyle=j%5===0?'#ffffff':color;
   c.lineWidth=(lowFx?2:2.2)+(j%4)*1.3;c.beginPath();
   c.moveTo(cx+Math.cos(ang)*21,cy+Math.sin(ang)*21);
   c.lineTo(cx+Math.cos(ang)*range,cy+Math.sin(ang)*range);c.stroke();
  }
  if(!lowFx&&ev.skill){
   c.globalAlpha=f.hit*.43;c.strokeStyle='#ffffff';c.lineWidth=19;
   c.beginPath();c.arc(cx,cy,60+(1-f.hit)*210,0,TAU);c.stroke();
  }
 }
 // Aerial launch, meteor landing and teleport make visibly different, grounded silhouettes.
 if(!lowFx&&['uppercut','aerial','meteor'].includes(ev.kind)&&p>.48&&p<.83&&!ev.dodge){
  c.globalAlpha=cap((.83-p)/.35)*.56;c.lineWidth=4;c.strokeStyle=color;
  for(let k=0;k<8;k++){
   const off=hash(turn*313+k*157)%120-60;
   c.beginPath();c.moveTo(cx+off,356);c.lineTo(cx+off*.4,330-(k%3)*24);c.stroke();
  }
 }
 if(ev.kind==='warp'&&p>.34&&p<.7&&!lowFx){
  const power=Math.sin(Math.PI*cap((p-.34)/.36));
  c.globalAlpha=power*.64;c.strokeStyle=color;c.lineWidth=5;
  c.strokeRect(a.x-60,a.y-71,120,142);
 }
 c.restore();
}
return Object.freeze({choreography,renderBehind,renderAhead,hash});
});
