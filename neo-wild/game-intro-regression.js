// node neo-wild/game-intro-regression.js
// Real source-extracted game briefing and new-world state, no browser dependency.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const game=fs.readFileSync(path.join(__dirname,"game.js"),"utf8");
new Function(game);
let count=0;const check=(v,m)=>{assert(v,m);count++;};
const equal=(a,b,m)=>{assert.strictEqual(a,b,m);count++;};
const part=(begin,end)=>{const a=game.indexOf(begin),b=game.indexOf(end,a+begin.length);check(a>=0&&b>a,"missing "+begin);return game.slice(a,b);};
const nodes={};for(const id of ["tutorial-stage","tutorial-title","tutorial-what","tutorial-how","tutorial-permadeath",
"tutorial-close","tutorial-progress-label","tutorial-counter","tutorial-prev","tutorial-next",
"app","tutorial-dialog","objective-banner"]){
 const names=new Set(["hidden"]);
 nodes[id]={textContent:"",disabled:false,classList:{add:x=>names.add(x),remove:x=>names.delete(x),
 contains:x=>names.has(x),toggle:(x,v)=>v?names.add(x):names.delete(x)},focus(){}};
}
const record=new Map(),env={
 $:id=>nodes[id],mission:0,mode:"play",debugTutorialSession:null,P:{x:200,y:300,hp:100},
 weather:"CLEAR",regionAt:()=>1,window:{WildAudio:{update:()=>{}}},
 TUTORIAL_STAGES:[0,1,2,4],tutorialLessonsSeenEver:new Set(),rememberTutorialStage:()=>{throw Error("forced lesson")},
 clamp:(n,a,b)=>Math.min(b,Math.max(a,n)),resetControls:()=>{},syncHUD:()=>{},saveAuto:()=>true,
 objectiveBannerTime:0,GAME_INTRO_SEEN_KEY:"wild-reclaim-purpose-briefing-v1",
 gameIntroSeen:false,gameIntroPending:false,
 localStorage:{getItem:k=>record.get(k)||null,setItem:(k,v)=>record.set(k,String(v))}
};
const goal=part("const GUIDE_GOALS=[","function announceObjective(){");
const ui=new Function("env","with(env){"+goal+"return {openTutorial,closeTutorial,renderTutorial};}")(env);
equal(ui.openTutorial(0,true),false,"legacy forced popup suppressed");
equal(env.mode,"play","auto tutorial doesn't pause");
equal(ui.openTutorial(0,false),true,"manual or first-game explanation");
equal(env.mode,"guide","briefing pauses play");
check(nodes["tutorial-what"].textContent.includes("この世の終わり"),"endgame objective shown");
check(nodes["tutorial-how"].textContent.includes("右側")&&nodes["tutorial-how"].textContent.includes("保管庫"),"weapon loop explained");
check(nodes["tutorial-permadeath"].textContent.includes("永久")&&nodes["tutorial-permadeath"].textContent.includes("○"),"permadeath and controls explained");
equal(nodes["tutorial-close"].textContent,"ゲームを始める","clear start button");
check(!record.has(env.GAME_INTRO_SEEN_KEY),"not prematurely marked seen");
ui.closeTutorial();equal(env.mode,"play","play resumes after briefing");
equal(record.get(env.GAME_INTRO_SEEN_KEY),"1","once-only persisted on close");
equal(ui.openTutorial(0,false),true,"manual purpose help always accessible");
ui.closeTutorial();
const worldStart=part("mission=debugTutorialSession?0:7;missionComplete=!debugTutorialSession;",
 "scoreTimer=0;").replace(/\/\/[^\n]*/g,"");
new Function("env","with(env){"+worldStart+"}")(Object.assign(env,{newWorld:true}));
equal(env.mission,7,"new world starts in free exploration");
equal(env.missionComplete,true,"no forced tutorial progression");
equal(env.gameIntroPending,false,"already seen briefing does not repeat");
env.gameIntroSeen=false;
new Function("env","with(env){"+worldStart+"}")(env);
equal(env.gameIntroPending,true,"first fresh world requests briefing");
env.debugTutorialSession={};
new Function("env","with(env){"+worldStart+"}")(env);
equal(env.mission,0,"debug tutorial still possible");
equal(env.gameIntroPending,false,"debug sessions remain untouched");
check(game.includes('if(gameIntroPending&&mode==="play"&&P?.hp>0)'),"first active game frame hook");
check(game.includes("if(automatic&&!debugTutorialSession)return false"),"no future repeated automatic lessons");
check(game.includes("if(snapshot){\n   if(restoreSnapshot(snapshot))"),"Continue stays on restore path");
console.log("PASS "+count+" checks; first-game purpose, free exploration, legacy-safe continue, debug lessons, dismiss/manual reopening");
