'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(script,'game JavaScript exists');
new vm.Script(script);
assert.equal(html.split('id="survivalChallengerOptIn"').length-1,1,'exactly one opt-in');
assert.match(html,/<button[^>]*id="fightBtn">▶ オートバトル開始<\/button>/,'CPU battle is primary');
assert.match(html,/id="searchBtn"[^>]*>/,'legacy search control preserved for JS compatibility');
assert.match(html,/<div class="field" style="display:none"><button class="btn primary" id="searchBtn"/,'manual matchmaking button hidden');
assert.match(script,/function doCom\(\)\{[^\n]*maybeQueuePvP\(\)/,'regular CPU starts queue');
assert.match(script,/function nextSurvivalBattle\(\)\{[\s\S]*?maybeQueuePvP\(\);/,'survival also searches');
assert.match(script,/match\.resumeSurvival=interruptedSurvival;announceChallenger\(\)/,'PvP intro');
assert.match(script,/if\(won\|\|m\.live\|\|m\.mode==='COM MATCH'\)scheduleNextAfterQuote\(m\)/,'auto follow-up after PvP and CPU loss');
const selection=script.slice(script.indexOf('function advanceAfterWin(m){'),script.indexOf('function scheduleNextAfterQuote(m){'));
assert.ok(selection.startsWith('function advanceAfterWin('));
const ctx={match:null,survivalActive:false,document:{hidden:false},queueWs:null,ws:null,challengerHandoff:false,serverBase:()=> 'https://example.workers.dev',
 leaveRoom:()=>ctx.calls.push('leave'),nextSurvivalBattle:()=>ctx.calls.push('survival'),doCom:()=>ctx.calls.push('com'),stopBattleSpeech:()=>{},
 $:id=>id==='battleModal'?{classList:{contains:x=>x==='open'}}:id==='survivalChallengerOptIn'?{checked:true}:{},
 calls:[]};
vm.runInNewContext(selection+'\n'+script.slice(script.indexOf('function canSearchPvP(){'),script.indexOf('function maybeQueuePvP(){')),ctx);
function advance(mode,winner,resumeSurvival,active){ctx.calls=[];ctx.survivalActive=active;ctx.match={done:true,mode,live:mode==='ONLINE LIVE',resumeSurvival,outcome:{winner}};ctx.advanceAfterWin(ctx.match);return ctx.calls.join(',')}
assert.equal(advance('ONLINE LIVE',1,false,false),'leave,com','PvP loss returns to CPU');
assert.equal(advance('ONLINE LIVE',0,false,false),'leave,com','PvP win returns to CPU');
assert.equal(advance('ONLINE LIVE',1,true,true),'leave,survival','PvP preserves survival run on loss');
assert.equal(advance('COM MATCH',1,false,false),'com','CPU loss advances to new battle');
assert.equal(advance('SURVIVAL',1,false,true),'','survival loss still ends run');
ctx.match={done:false,live:false};ctx.queueWs=null;ctx.ws=null;
ctx.document.hidden=false;assert.equal(ctx.canSearchPvP(),true,'search only during active CPU fight');
ctx.match.live=true;assert.equal(ctx.canSearchPvP(),false,'no NEW CHALLENGER during PvP');
ctx.match.live=false;ctx.match.done=true;assert.equal(ctx.canSearchPvP(),false,'no new room during result');
ctx.match.done=false;ctx.document.hidden=true;assert.equal(ctx.canSearchPvP(),false,'no queue in background');
ctx.document.hidden=false;ctx.queueWs={};assert.equal(ctx.canSearchPvP(),false,'never double-search');
assert.equal(html.split('id="battleChallengerOptIn"').length-1,1,'visible battle switch exists');
assert.match(script,/function startChallengerHandoff\(\)/,'freeze CPU before PvP');
assert.match(script,/function restoreCpuAfterHandoff\(\)/,'recovery if matchmaking fails');
assert.match(script,/if\(challengerHandoff&&!match\?\.live\)\{restoreCpuAfterHandoff\(\)\}/,'room failure resumes CPU');
assert.match(script,/const delay=12000-\(Date\.now\(\)-lastHandoffFailure\)/,'failed handoff cooled down');
console.log('ARCADE PVP FLOW PASS: opt-in, CPU continuity, new challenger, no queue during PvP, PvP resumes CPU');
