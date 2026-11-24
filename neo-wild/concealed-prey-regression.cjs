const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const src = fs.readFileSync(__dirname + "/game.js", "utf8");
const functions = ["combatAim", "pounceCost", "pounceTravel", "concealedPrey", "isDownwindStalk"];
const code = functions.map(name => {
 const start = src.indexOf("function " + name + "(");
 assert.ok(start >= 0);
 return src.slice(start, src.indexOf("\n}", start) + 2);
});
const player = {x:0,y:0,dir:0,type:"cat",level:1,sp:100,r:12,hidden:true};
const prey = {x:80,y:15,r:10,type:"rabbit",hp:10};
const scope = {
 P:player, mobs:[prey], huntTarget:null, windDirection:Math.PI,
 species:{rabbit:{prey:true}}, lineBlocked:()=>false, routeClear:()=>true,
 unawareOfPlayer:m=>!m.alert, traitEffect:()=>1,
 clamp:(v,a,b)=>Math.min(b,Math.max(a,v)),dist:(a,b)=>Math.hypot(a.x-b.x,a.y-b.y)
};
vm.createContext(scope);
vm.runInContext(code.join("\n"),scope);
const preview=()=>vm.runInContext("concealedPrey()",scope);
assert.equal(preview(),prey);
assert.equal(player.dir,0);
assert.equal(vm.runInContext("isDownwindStalk(mobs[0])",scope),true);
for(const [object,key,value] of [[player,"sp",10],[player,"hidden",false],[prey,"groundZ",24],[prey,"alert",1],[prey,"x",290],[prey,"companion",true]]){
 const before=object[key];object[key]=value;assert.equal(preview(),null);object[key]=before;
}
scope.routeClear=()=>false;
assert.equal(preview(),null);
console.log("PASS concealed prey range, facing, eligibility, wind and obstruction");
