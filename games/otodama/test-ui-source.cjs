// Static build checks: syntax and required controls. This is NOT a browser/Android test.
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(match,'embedded game script missing');
assert.ok(html.includes('次のバトルへ →'),'continue button missing');
assert.ok(!html.includes('>もう一戦</button>'),'obsolete rematch button');
new vm.Script(match[1],{filename:'otodama-client.js'});
for(const id of ['recordBtn','stopRecordBtn','voicePreviewBtn','fightBtn','dailyBtn','codexGrid','battlePanel','guardBtn','skillBtn','battleVolume','searchBtn','serverUrl','arenaCanvas','musicVolume','adventureStage','rematchBtn','shareVoice','muteOpponentVoice','comboBadge','incomingBadge','dodgeBtn'])
 assert.ok(html.includes('id="'+id+'"'),'required UI control missing: '+id);
for(const fn of ['drawVictorySequence','drawCreature','resolveCombatImpact','startRandomMatch','showDaily','elementalEdge','stageEnemy','startBgm','musicTick'])assert.ok(match[1].includes(fn),'missing '+fn);
assert.ok(match[1].includes("if($('shareVoice').checked)"),'online voice must be opt-in');
assert.ok(match[1].includes("$('muteOpponentVoice').checked"),'opponent mute required');
assert.ok(match[1].includes("guardChain"),'guard counter chain required');
assert.ok(match[1].includes("function dodgePress()"),'dodge action required');
for(const id of ['nextBuffPanel','bossPanel','bossBreakFill','bossWarning','lowFx'])assert.ok(html.includes('id="'+id+'"'),'missing v0.9.3 UI: '+id);
for(const id of ['exportSaveBtn','importSaveFile','saveNotice'])assert.ok(html.includes('id="'+id+'"'),'missing save UI '+id);
for(const fn of ['beginLiveBattle','receiveLiveTurn','receiveLiveImpact','endLiveBattle','sendLiveAction','stageHazard','exportSave','importSave','CHAPTERS'])assert.ok(match[1].includes(fn),'missing v0.9.4 '+fn);
for(const fn of ['stageBiome','drawBiome','chooseBuff','addBreak','bossStunned'])assert.ok(match[1].includes(fn),'missing v0.9.3 logic: '+fn);
console.log('UI SOURCE TEST PASS | game syntax, mic, COM, daily, codex, online controls, victory sequence');
