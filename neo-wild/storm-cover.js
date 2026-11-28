// Static scenery is bucketed once. The storm only visits nearby trees when choosing a strike.
(() => {
 "use strict";
 const cells=new Map(),size=256;
 const key=(x,y)=>x+":"+y;
 function add(p,tree,radius){
  const k=key(Math.floor(p.x/size),Math.floor(p.y/size));
  if(!cells.has(k))cells.set(k,[]);
  cells.get(k).push({x:p.x,y:p.y,radius,tree});
 }
 function index(mountain,scenery){
  cells.clear();
  for(const group of [mountain?.trees,mountain?.pines,mountain?.alpinePines])
   for(const p of group||[])add(p,true,p.r);
  for(const group of [mountain?.rocks,mountain?.scree,mountain?.alpineRocks])
   for(const p of group||[])if(p.r>=22)add(p,false,p.r);
  for(const p of scenery)if(p.kind==="sapling")add(p,true,33);
 }
 function nearby(actor,range,visit){
  for(let x=Math.floor((actor.x-range)/size);x<=Math.floor((actor.x+range)/size);x++)
   for(let y=Math.floor((actor.y-range)/size);y<=Math.floor((actor.y+range)/size);y++){
    const bucket=cells.get(key(x,y));
    if(bucket)for(const item of bucket)if(visit(item))return true;
   }
  return false;
 }
 function cover(actor,giants){
  if(!actor||actor.flying||(actor.jumpHeight||0)>18||(actor.groundZ||0)>18)return false;
  const reach=16+(actor.r||16);
  const close=(p,r)=>Math.hypot(actor.x-p.x,actor.y-p.y)<=r+reach;
  return nearby(actor,100+reach,p=>close(p,p.radius))||giants.some(p=>close(p,46));
 }
 function target(actor,giants){
  let selected=null,count=0;
  const consider=p=>{
   if(Math.hypot(actor.x-p.x,actor.y-p.y)<440&&Math.random()<1/++count)selected=p;
  };
  nearby(actor,440,p=>{if(p.tree)consider(p);});
  for(const p of giants)consider(p);
  return selected;
 }
 const fires=[];
 function restore(saved){
  fires.length=0;
  if(Array.isArray(saved))for(const f of saved.slice(0,3)){
   if(Number.isFinite(f?.x)&&Number.isFinite(f.y)&&Number.isFinite(f.life)&&f.life>0)
    fires.push({x:f.x,y:f.y,life:Math.min(f.life,32)});
  }
 }
 function ignite(x,y){
  const old=fires.find(f=>f.x===x&&f.y===y);
  if(old){old.life=32;return;}
  if(fires.length<3)fires.push({x,y,life:32});
 }
 function tick(dt,weather,actor,mobs,onBurn){
  for(let i=fires.length-1;i>=0;i--){
   const f=fires[i];
   f.life-=dt*(weather==="RAIN"?8:weather==="THUNDER"?3:1);
   if(f.life<=0){fires.splice(i,1);continue;}
   const burn=a=>{
    if(!a||a.hp<=0||a.flying||(a.jumpHeight||0)>45)return;
    const reach=45+(a.r||12);
    if((a.x-f.x)**2+(a.y-f.y)**2<reach*reach)onBurn(a,f,dt);
   };
   burn(actor);for(const m of mobs)burn(m);
  }
 }
 function draw(ctx,project,zoom,clock,w,h){
  for(const f of fires){
   const p=project(f.x,f.y);
   if(p.x< -80||p.y< -30||p.x>w+80||p.y>h+160)continue;
   ctx.save();ctx.translate(p.x,p.y);ctx.scale(zoom,zoom);
   ctx.globalAlpha=Math.min(1,f.life/3);
   for(let layer=0;layer<2;layer++){
    ctx.fillStyle=layer?"#ffe691":"#f56824";ctx.beginPath();
    for(let j=-2;j<=2;j++){
     const x=j*8,base=layer?6:10,height=(layer?23:44)+10*Math.cos(clock*9+j);
     ctx.moveTo(x-base,1);ctx.quadraticCurveTo(x-base-4,-13,x+5*Math.sin(clock*8+j),-height);
     ctx.quadraticCurveTo(x+base+5,-12,x+base,1);ctx.closePath();
    }
    ctx.fill();
   }
   ctx.restore();
  }
 }
 function soundAt(actor){
  let trees=0,fire=0;
  nearby(actor,180,p=>{
   if(p.tree)trees=Math.max(trees,1-Math.hypot(actor.x-p.x,actor.y-p.y)/180);
  });
  for(const f of fires)fire=Math.max(fire,(1-Math.hypot(actor.x-f.x,actor.y-f.y)/220)*Math.min(1,f.life/3));
  return {trees,fire};
 }
 window.WildStormCover={soundAt,index,cover,target,ignite,tick,draw,restore,snapshot:()=>fires.map(f=>({...f}))};
})();
