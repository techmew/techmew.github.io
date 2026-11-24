// Run from repo root: node neo-wild/first-steps-regression.js
// Uses the REAL tutorial controller and actual gameplay integration snippets.
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const read=n=>fs.readFileSync(path.join(__dirname,n),"utf8");
const game=read("game.js"),tutorial=read("first-steps.js"),html=read("index.html"),css=read("visual.css"),phrases=read("i18n-phrases.js");
let tests=0;function ok(value,name){assert(value,name);tests++}function eq(a,b,name){assert.strictEqual(a,b,name);tests++}
for(const src of [game,tutorial,phrases])new Function(src);
function part(start,end){const i=game.indexOf(start),j=game.indexOf(end,i+start.length);ok(i>=0&&j>i,"segment "+start);return game.slice(i,j);}
function make(){
 const data=new Map(),els=new Map(),names=["first-steps","first-steps-title","first-steps-detail","first-steps-count","first-steps-progress","first-steps-skip","app","tutorial-dialog","objective-banner","tutorial-stage","tutorial-title","tutorial-what","tutorial-how","tutorial-permadeath","tutorial-close","tutorial-progress-label","tutorial-counter","tutorial-prev","tutorial-next","world-map"];
 for(const name of names){const classes=new Set(["hidden"]);els.set(name,{textContent:"",disabled:false,value:0,max:0,classList:{
  add:c=>classes.add(c),remove:c=>classes.delete(c),contains:c=>classes.has(c),
  toggle:(c,v)=>{if(v===undefined)v=!classes.has(c);if(v)classes.add(c);else classes.delete(c);return v;}
 }})}
 const localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const w={document:{getElementById:id=>els.get(id)||null},localStorage};
 new Function("window",tutorial)(w);
 return {data,els,localStorage,w,$:id=>els.get(id),guide:w.WildFirstSteps};
}
{
 const q=make(),guide=q.guide;eq(guide.STEPS.length,4,"four survival actions");
 const player={x:100,y:100,hp:100};ok(guide.begin(player),"begin");
 eq(q.$("first-steps-title").textContent,"移動する","live UI title");
 ok(!guide.event("attack"),"out of order rejected");
 guide.tick({x:5000,y:100,hp:100},.035);eq(guide.status().step,0,"teleport not walking");
 for(const x of [5024,5049,5076])guide.tick({x,y:100,hp:100},.035);
 eq(guide.status().step,1,"world-space 76 units accepted");
 ok(!guide.event("attack")&&!guide.event("interact"),"empty swings and item pickups do not teach a hunt or meal");
 for(const kind of ["hunt","meal"]){ok(guide.event(kind),"step "+kind);}
 eq(guide.status().step,3,"now open map");
 const env={mode:"play",window:q.w,$:q.$,resetControls:()=>{},drawWorldMap:()=>{}};
 const toggle=new Function("env","with(env){"+part("function toggleWorldMap(){","const MINI_SPANS=")+"return toggleWorldMap;}")(env);
 toggle();eq(env.mode,"map","real map opened");ok(guide.done(),"after actual map open completed");
 eq(q.data.get(guide.KEY),"1","only onboarding record saved");
 ok(!guide.begin(player),"no repeat when done");
 ok(guide.begin(player,true),"replay manually");
 ok(guide.skip(),"skip replay");ok(guide.done(),"skipped practice persisted");
}
{
 const q=make(),introEnv={mode:"guide",window:q.w,$:q.$,P:{x:1000,y:1600,hp:100},firstStepsPending:true,
 guideNeedsFrame:true,objectiveBannerTime:0,debugTutorialSession:null,gameIntroSeen:false,
 GAME_INTRO_SEEN_KEY:"briefing-shown",weather:"CLEAR",regionAt:()=>0,resetControls:()=>{},
 syncHUD:()=>{},saveAuto:()=>true,localStorage:q.localStorage};
 const render=new Function("env","with(env){"+part("function renderTutorial(){","function openTutorial(")+"return renderTutorial;}")(introEnv);
 render();
 eq(q.$("tutorial-close").textContent,"冒険を始める","clear CTA");
 ok(q.$("tutorial-what").textContent.includes("100年後"),"win condition");
 ok(q.$("tutorial-what").textContent.includes("人間が消えた世界"),"world setting");
 ok(q.$("tutorial-next").disabled,"initial popup has no redundant replay");
 const close=new Function("env","with(env){"+part("function closeTutorial(){","function tutorialMove(")+"return closeTutorial;}")(introEnv);
 close();
 eq(introEnv.mode,"play","world resumes");
 ok(q.guide.status().active,"hands-on starts after closing purpose");
 ok(!introEnv.firstStepsPending,"one start only");
 eq(q.localStorage.getItem("briefing-shown"),"1","purpose one-time key");
 q.guide.skip();introEnv.mode="guide";introEnv.firstStepsPending=false;
 render();ok(!q.$("tutorial-next").disabled,"returning manual guide can replay");
}
for(const type of ["deer","carp","pigeon","cat"]){
 const q=make(),g=q.guide;
 g.begin({type,hp:100,x:0,y:0});g.event("move");
 eq(g.status().kind,type==="cat"?"hunt":"meal",type+" lesson");
 ok(!g.event("interact"),"unrelated interaction does not feed the animal");
 ok(g.event("meal"),"a successful meal teaches survival");eq(g.status().kind,"map","now explore");
}
for(const needle of [
 "firstStepsPending=!!newWorld&&!debugTutorialSession",
 "window.WildFirstSteps?.tick?.(P,dt)",
 "if(code===\"jump\"&&jump())window.WildFirstSteps?.event?.(\"jump\")",
 "if(species[m.type]?.prey)window.WildFirstSteps?.event?.(\"hunt\")",
 "if(P.hunger>before.hunger)window.WildFirstSteps?.event?.(\"meal\")",
 "window.WildFirstSteps?.event?.(\"map\")",
 "$(\"tutorial-next\")?.addEventListener(\"click\"",
 "$(\"first-steps-skip\")?.addEventListener(\"click\""
])ok(game.includes(needle),"game integration "+needle);
ok(game.includes("mission=debugTutorialSession?0:7;missionComplete=!debugTutorialSession;"),"no forced legacy missions");
ok(game.includes("if(!debugTutorialSession&&!gameIntroSeen)"),"purpose shown once");
ok(html.indexOf("first-steps.js?rev=")<html.indexOf("game.js?rev="),"dependency order");
for(const id of ["first-steps","first-steps-title","first-steps-detail","first-steps-count","first-steps-progress","first-steps-skip"])ok(html.includes('id="'+id+'"'),"UI id "+id);
ok(css.includes("#first-steps")&&css.includes("pointer-events:none"),"nonblocking CSS");
ok(phrases.includes('"冒険を始める"')&&phrases.includes('"操作を練習"'),"translations");
console.log("PASS first-steps "+tests+" assertions; real movement, actual map, action hooks, one-time intro, manual replay, save independence");
