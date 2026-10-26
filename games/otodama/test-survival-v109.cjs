// node test-survival-v109.cjs: V8 fake DOM and timers, not Android/Chromium.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert.ok(script,'game script');new vm.Script(script,{filename:'index.html#script'});
const begin=script.indexOf('// Survival is a *local*'),end=script.indexOf('function finishCombat(){',begin);
assert.ok(begin>=0&&end>begin,'survival controller');
const harness=[
 "let clock=1000,match=null,cur={seed:42},calls=[],timers=[],saved={};",
 "const dom=new Map();",
 "const $=id=>{if(!dom.has(id))dom.set(id,{textContent:'',hidden:false,checked:false,setAttribute(k,v){this[k]=v},append(c){(this.children||(this.children=[])).push(c)},classList:{contains(){return true}}});return dom.get(id)};",
 "const performance={now:()=>clock},document={hidden:false,createElement:tag=>({textContent:'',tag})};",
 "const localStorage={getItem:k=>saved[k]??null,setItem:(k,v)=>saved[k]=v};",
 "const setTimeout=(fn,delay)=>{const v={fn,delay,cancelled:false};timers.push(v);return v};",
 "const clearTimeout=t=>{if(t)t.cancelled=true};",
 "const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),hash=x=>Math.imul(x ^ (x>>>16),0x7feb352d)>>>0;",
 "const EVENT_MS=820,RESONANCE_COST=60;",
 "const guardTiming=()=>[.23,.57],dodgeTiming=()=>[.08,.37],strikeTiming=()=>[.30,.66];",
 "const guardPress=()=>calls.push('guard'),dodgePress=()=>calls.push('dodge'),strikePress=()=>calls.push('strike'),skillPress=()=>calls.push('skill');",
 "const stageEnemy=(n,p)=>({seed:n*313,level:n}),randCombat=()=>({max:[170,170],events:[]});",
 "const showBattle=(p,e,o,mode)=>{match={a:p,b:e,mode,done:false,interactive:true,live:false,current:null}};",
 "const leaveRoom=()=>calls.push('leaveRoom'),serverBase=()=>null,startRandomMatch=()=>calls.push('queue'),cancelRandomSearch=()=>calls.push('cancel');",
 script.slice(begin,end),
 "globalThis.test={startSurvival,nextSurvivalBattle,finishSurvivalRound,setAutoBattle,scheduleAutoAction,get data(){return{survivalActive,survivalRound,survivalPoints,survivalWins,survivalBest,autoBattleEnabled,match}},get dom(){return dom},timers,calls,saved,set clock(v){clock=v}};"
].join('\n');
const ctx={Date,Math,Number,JSON,Map,String,Array,RegExp,Uint8Array,console};
vm.runInNewContext(harness,ctx);const t=ctx.test;
t.startSurvival();assert.equal(t.data.survivalActive,true);
assert.equal(t.data.autoBattleEnabled,true);assert.equal(t.data.match.mode,'SURVIVAL');assert.equal(t.data.match.b.seed,313);
const first=t.data.match;first.done=true;first.hp=[170,0];first.max=[170,170];first.outcome={winner:0};
t.finishSurvivalRound(first);assert.equal(t.data.survivalRound,2);
assert.equal(t.data.survivalPoints,220);assert.equal(t.saved['otodama.survival.best'],'220');
const next=t.timers.find(q=>!q.cancelled&&q.delay===2900);assert.ok(next,'next battle timer');
next.fn();assert.equal(t.data.match.b.seed,626);
const second=t.data.match;second.done=true;second.hp=[0,120];second.max=[170,170];second.outcome={winner:1};
t.finishSurvivalRound(second);assert.equal(t.data.survivalActive,false,'loss ends run');
assert.equal(t.saved['otodama.survival.history'].includes('"points":220'),true);
assert.ok(t.dom.get('battlePrize').textContent.includes('ゲームオーバー'));
t.startSurvival();assert.equal(t.data.survivalPoints,0,'new run resets');
const active=t.data.match;active.current={atk:1,resolved:false};active.pop=1000;active.turn=3;active.a.seed=42;active.dodgeCooldown=1;
t.clock=1000;t.scheduleAutoAction(active);
const move=t.timers.filter(q=>!q.cancelled).at(-1);assert.ok(move);
t.setAutoBattle(false);assert.equal(move.cancelled,true,'manual switch cancels queued input');
for(const id of ['survivalBtn','autoBattleBtn','survivalHomeStatus','survivalLocalTop5','survivalChallengerOptIn','challengerBanner','rankingRegisterBtn','onlineLeaderboard'])assert.ok(html.includes('id="'+id+'"'),id+' not connected');
console.log('SURVIVAL PASS: auto/manual, consecutive rounds, points/best/history, loss ends run, timer cancellation');
