// v0.10.8 source/V8 regression. NOT a browser, Android or Cloudflare deployment test.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'inline game script');new Function(script);
const part=(start,end)=>{const a=script.indexOf(start),b=script.indexOf(end,a+start.length);assert.ok(a>=0&&b>a,'missing '+start);return script.slice(a,b)};
const missions=new Function(part('const MISSIONS=','const BUFFS=')+'return {MISSIONS,stageMission,missionProgress,missionCompleted};')();
assert.equal(missions.MISSIONS.length,20);
for(let n=1;n<=20;n++)assert.equal(missions.stageMission(n),missions.MISSIONS[n-1]);
assert.equal(missions.stageMission(21),missions.MISSIONS[0]);
for(const [stage,kind] of [[17,'guardBest'],[18,'dodges'],[19,'skillsUsed'],[20,'counterHits']])assert.equal(missions.stageMission(stage).kind,kind);
const music=new Function(part('function musicBridge(','function musicTick(')+'return {musicBridge,musicPhraseOffset};')();
assert.equal(new Set(Array.from({length:8},(_,i)=>music.musicPhraseOffset(i*4,1,false))).size,8);
assert.equal(music.musicPhraseOffset(8,2,true)-music.musicPhraseOffset(8,2,false),7);
assert.equal(music.musicBridge(9,false,false),true);
assert.equal(music.musicBridge(9,true,false),false);
const rewardCode=part('function updateCharacterProgress(m){','function col(');
const setup=[
"let streak=0,recordStreak=0,careerWins=0,adventureStage=17,stageWins=0,stageAttempts=0,dailyCleared='';",
"let roster=[],cur={seed:42};const notice={textContent:''};",
"const $=()=>notice,levelOf=c=>c.level||1,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),hash=n=>n>>>0;",
"const saveProgress=()=>{},saveStore=()=>{},setCurrent=()=>{},renderRoster=()=>{},showCampaign=()=>{},showStage=()=>{},showDaily=()=>{};",
"const dailyKey=()=>'',missionCompleted=()=>false;"
].join('\n');
const harness=()=>new Function(setup+'\n'+rewardCode+'return {run:updateCharacterProgress,notice};')();
const player=()=>({seed:42,level:1,xp:0,stats:[50,50,50,50,50]});
const fight=(p,damageTaken,parries,dodges,winner=0)=>({a:p,mode:'COM MATCH',outcome:{winner},grade:'C',damageTaken,parries,dodges,boss:false,rival:false});
let t=harness(),p=player(),m=fight(p,4,2,0);t.run(m);
assert.equal(m.cleanDefenseAwarded,true);assert.equal(p.level,2);assert.ok(t.notice.textContent.includes('完璧防御 +1XP'));
t=harness();p=player();m=fight(p,5,2,0);t.run(m);assert.equal(m.cleanDefenseAwarded,false);assert.equal(p.level,1);assert.equal(p.xp,2);
t=harness();p=player();m=fight(p,0,0,2);t.run(m);assert.equal(m.cleanDefenseAwarded,true);
t=harness();p=player();m=fight(p,0,2,0,1);t.run(m);assert.equal(m.cleanDefenseAwarded,false);
const source=worker.slice(worker.indexOf('function pruneIdleSockets('),worker.indexOf('export default'));
const prune=new Function(source+'return pruneIdleSockets;')();
const socket=a=>({readyState:1,closed:false,deserializeAttachment(){return a},close(){this.closed=true;this.readyState=3}});
const sockets=[socket({openedAt:1000,creature:null}),socket({status:'connected',time:1000}),socket({status:'waiting',time:1000}),socket({openedAt:1000,creature:{name:'joined'}}),socket({openedAt:31000,creature:null})];
assert.equal(prune(sockets,32000),2);
assert.deepEqual(sockets.map(s=>s.closed),[true,true,false,false,false]);
assert.ok(worker.includes('pruneIdleSockets(this.ctx.getWebSockets(),Date.now())'));
assert.ok(worker.includes("version:'0.10.10'"));
assert.ok(worker.includes("cache-control':'no-store'"));
for(const token of ['OTODAMA_SAVE','drawVictorySequence','voicePreviewBtn','stopRecordBtn','nextStagePreview','WIN❗️','musicVolume','shareVoice','receiveVoice'])assert.ok(html.includes(token),'regression '+token);
assert.ok(html.includes('id="nextStagePreview" aria-live="polite"'));
assert.ok(html.includes('id="battlePrize" aria-live="polite"'));
assert.ok(script.includes("$('mutedCheck').onchange="));
console.log('PASS v0.10.8: missions, XP, BGM, idle sockets, mute, accessibility and legacy features (V8 only)');
