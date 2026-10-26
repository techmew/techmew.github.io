// Static build checks: syntax and required controls. This is NOT a browser/Android test.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(match,'embedded game script missing');
assert.ok(html.includes('次のバトルへ →'),'continue button missing');
assert.ok(!html.includes('>もう一戦</button>'),'obsolete rematch button');
new vm.Script(match[1],{filename:'otodama-client.js'});
for(const id of ['recordBtn','stopRecordBtn','voicePreviewBtn','fightBtn','dailyBtn','codexGrid','battlePanel','guardBtn','skillBtn','battleVolume','searchBtn','serverUrl','arenaCanvas','musicVolume','adventureStage','rematchBtn','shareVoice','muteOpponentVoice','comboBadge','incomingBadge','dodgeBtn','strikeBtn','receiveVoice'])
 assert.ok(html.includes('id="'+id+'"'),'required UI control missing: '+id);
for(const fn of ['drawVictorySequence','drawCreature','resolveCombatImpact','startRandomMatch','showDaily','elementalEdge','stageEnemy','startBgm','musicTick'])assert.ok(match[1].includes(fn),'missing '+fn);
assert.ok(match[1].includes("$('shareVoice').checked")&&match[1].includes("$('receiveVoice').checked")&&match[1].includes('sendVoiceConsent'),'online voice must require dual opt-in');
assert.ok(match[1].includes("$('muteOpponentVoice').checked"),'opponent mute required');
assert.ok(match[1].includes("guardChain"),'guard counter chain required');
assert.ok(match[1].includes("function dodgePress()"),'dodge action required');
assert.ok(match[1].includes("function strikePress()"),'timed strike action required');
for(const id of ['nextBuffPanel','bossPanel','bossBreakFill','bossWarning','lowFx'])assert.ok(html.includes('id="'+id+'"'),'missing v0.9.3 UI: '+id);
for(const id of ['exportSaveBtn','importSaveFile','saveNotice'])assert.ok(html.includes('id="'+id+'"'),'missing save UI '+id);
for(const fn of ['beginLiveBattle','receiveLiveTurn','receiveLiveImpact','endLiveBattle','sendLiveAction','stageHazard','exportSave','importSave','CHAPTERS'])assert.ok(match[1].includes(fn),'missing v0.9.4 '+fn);
for(const fn of ['stageBiome','drawBiome','chooseBuff','addBreak','bossStunned'])assert.ok(match[1].includes(fn),'missing v0.9.3 logic: '+fn);
for(const fn of ['resumeToken','live_resumed','stageAttempts','MUSIC_MOTIFS','clutchUsed'])assert.ok(match[1].includes(fn),'missing v0.9.5 '+fn);
for(const id of ['stageMissionHint','missionBadge','battleReport','enemyTactic'])assert.ok(html.includes('id="'+id+'"'),'v0.9.6 feedback missing: '+id);
for(const fn of ['stageMission','missionCompleted','evadeCounterReady','COM_TACTICS','enemyTactic','damageDealt','parries','skillsUsed'])assert.ok(match[1].includes(fn),'v0.9.6 combat feature missing: '+fn);
assert.ok(match[1].includes("match?.mode?.startsWith('ONLINE')"),'live opponent voice mute missing');
assert.ok(html.includes('id="nextStagePreview"'),'next-stage preview missing');
for(const marker of ['restBar','虚空転移','螺旋連撃','actionStatus','data.elapsed'])assert.ok(html.includes(marker),'new gameplay or resume feature missing '+marker);
for(const feature of ['精密打撃を3回成功','カウンター攻撃を2回命中','精密打撃を3連鎖','合計240ダメージを与える','共鳴重視・守備寄り','重い一撃・防御は脆い','pre-climax pickup'])assert.ok(html.includes(feature),'v0.10.2 content missing: '+feature);
// v0.10.3: actual pure-function checks for tactical AI and shared timing windows.
const tacticSource=match[1].slice(match[1].indexOf('function enemyTactic('),match[1].indexOf('const MISSIONS='));
const enemyTactic=vm.runInNewContext(tacticSource+';enemyTactic');
for(const [role,stage,turn,extra,expected] of [
 ['疾風',8,5,{},'flash'],['追撃',8,5,{},'flash'],
 ['幻惑',8,5,{},'feint'],['粉砕',8,5,{},'heavy'],
 ['吸音',8,1,{charge:60},'drain'],['堅守',8,1,{parries:2},'feint']
])assert.equal(enemyTactic(stage,turn,{b:{archetype:role},...extra}),expected,'archetype AI '+role);
const timingSource=match[1].slice(match[1].indexOf('function guardTiming('),match[1].indexOf('function addBreak('));
const timing=vm.runInNewContext('const SOULS=[0,1,2,3,4,5];const soulFor=c=>c.soul;'+timingSource+';({guardTiming,dodgeTiming,strikeTiming})');
assert.equal(timing.guardTiming({live:false,a:{soul:4}},{} )[0],.19,'iron-heart guard HUD should match input');
assert.equal(timing.guardTiming({live:false,a:{soul:0}},{tactic:'flash'})[0],.12,'flash guard');
assert.equal(timing.dodgeTiming({live:false},{tactic:'flash'})[1],.26,'flash dodge');
assert.equal(timing.strikeTiming({nextBuff:'focus'})[0],.22,'focus buff should widen strike start');
assert.equal(timing.strikeTiming({nextBuff:'focus'})[1],.74,'focus buff should widen strike end');
assert.equal(timing.strikeTiming({nextBuff:null})[0],.30,'normal strike timing preserved');
assert.ok(html.includes('data-buff="focus"'),'focus reward button missing');
assert.ok(html.includes('lastBattleFrame'),'low FX frame limiter missing');
// v0.10.4: additional tactical choices, one-use shield, piercing AI and live strike timing.
for(const buff of ['lifeline','rhythm'])assert.ok(html.includes('data-buff="'+buff+'"'),'missing tactical buff '+buff);
assert.ok(html.includes('破甲の一撃'),'armor-piercing telegraph missing');
const newTiming=vm.runInNewContext('const SOULS=[0,1,2,3,4,5];const soulFor=()=>SOULS[0];'+timingSource+';({strikeTiming,lifelineMitigation})');
assert.equal(newTiming.strikeTiming({live:true,nextBuff:null})[1],.73,'live strike HUD must match 660ms server window');
const lastStand={nextBuff:'lifeline',lifelineUsed:false,hp:[30],max:[100]};
assert.equal(newTiming.lifelineMitigation(lastStand,29),9,'lifeline should absorb 20 damage');
assert.equal(newTiming.lifelineMitigation(lastStand,29),29,'lifeline should activate only once');
assert.equal(enemyTactic(9,5,{b:{archetype:'粉砕'},parries:2}),'pierce','powder AI should punish repeated parries');
assert.ok(html.includes('if(!m.parried&&!m.dodgeSuccess)damage=lifelineMitigation'),'successful parry must preserve lifeline');
console.log('UI SOURCE TEST PASS | game syntax, mic, COM, daily, codex, online controls, victory sequence');
