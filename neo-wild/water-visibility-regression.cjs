"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const read=file=>fs.readFileSync(path.join(__dirname,file),"utf8");
const game=read("game.js"),part=(a,b)=>game.slice(game.indexOf(a),game.indexOf(b,game.indexOf(a)));
const event={kind:"flood",x:1000,y:1000,radius:130,year:10,duration:2,paceVersion:3};
const env={window:{},elapsed:1320,localStorage:{getItem:()=>JSON.stringify({paceVersion:3,events:[event]})}};
vm.createContext(env);
vm.runInContext(read("disaster-world.js"),env);
vm.runInContext(game.match(/^const roadsX=.*$/m)[0]+"\n"+part("const riverAxis=","let scenicProps=")+
 part("function waterDepth(","function shallowWater(")+part("function nearbyWaterLabel(","function syncHUD(")+
 ";Object.assign(this,{cityBridges,cityWater,riverAxis,canalAxis})",env);
const D=env.window.WildDisaster;
assert.equal(env.cityBridges.length,6);
for(const seg of env.cityWater){
 const [a,b,c]=seg.pts;
 assert((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])>0,"upward-facing water surface");
}
for(const b of env.cityBridges){
 const r=b.kind==="river";
 for(const shift of [-85,-79,0,79,85]){
  const x=r?env.riverAxis(b.y+shift):b.x+shift,y=r?b.y+shift:env.canalAxis(b.x+shift);
  assert.equal(env.waterDepth(x,y)>0,Math.abs(shift)>=80);
  const painted=env.cityWater.some(s=>s.kind===b.kind&&s.pts.some(p=>p[r?1:0]<(r?y:x))&&s.pts.some(p=>p[r?1:0]>(r?y:x)));
  assert.equal(painted,Math.abs(shift)>=80);
 }
 assert.equal(env.nearbyWaterLabel({...b,type:"cat"}),"橋の上");
 assert.equal(env.nearbyWaterLabel({...b,type:"carp"}),"橋の下");
}
assert.equal(env.waterDepth(9000,env.canalAxis(9000)),0);
assert.equal(env.nearbyWaterLabel({x:850,y:1000,dir:0}),"前方に冠水");
assert.equal(env.nearbyWaterLabel({x:850,y:1000,dir:Math.PI}),"");
assert.equal(env.nearbyWaterLabel({x:1000,y:1000}),"冠水・深水");
assert.equal(env.nearbyWaterLabel({x:1115,y:1000}),"冠水・浅水");
function observe(year,offset=0){
 let points=[],fills=[],labels=[];
 const ctx=new Proxy({beginPath(){points=[]},moveTo(x,y){points.push([x,y])},lineTo(x,y){points.push([x,y])},
  fill(){fills.push(points.slice())},fillText(t){labels.push(t)}},{get:(o,k)=>o[k]??(()=>{})});
 const ground=(x,y)=>({x:x-800+offset,y:y-800});
 D.draw(ctx,ground,year,true,ground,400,400);
 return {fills,labels};
}
for(const year of [10,11,11.99]){
 const {fills,labels}=observe(year);assert.deepEqual(labels,["冠水"]);
 for(const [i,ring] of fills.entries()){
  assert.equal(ring.length,40);
  const x=ring[0][0]+800;
  assert(Math.abs(D.floodDepth(x,event.y,year)-[.0001,.24,.55][i])<1e-9);
 }
}
assert.equal(observe(11,5000).fills.length,0);
for(const year of [9,12])assert.equal(observe(year).labels.length,0);
console.log("Six bridges, canal endpoint, forward warnings and projected flood depth contours passed.");
