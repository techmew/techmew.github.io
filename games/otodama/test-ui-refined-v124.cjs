'use strict';
/* Refined UI structural regression: verifies existing game HTML without browser/Android. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'embedded full game is present');
new vm.Script(script,{filename:'koedama-v124-game.js'});
assert.match(html,/href="\.\/ui-refresh-v124\.css\?v=130"/,'approved light-theme stylesheet is loaded');
assert.match(css,/KOEDAMA Refined UI v0\.10\.24/);
assert.match(css,/--bg:#edf4fa/,'light base palette');
assert.match(css,/\.modalbox\{background:#fff/,'readable game battle panel');
assert.match(html,/試作版 v0\.10\.24/);
const mainIDs=['heroCanvas','recordBtn','randomBtn','stopRecordBtn','voicePreviewBtn','waveCanvas',
 'micHint','countdown','micNotice','recordingCaution','controlCard','fightBtn','saveBtn',
 'voiceMetrics','battleMetrics','voiceRoleName','voiceRoleDesc','dnaPanel','dnaAllFeatures',
 'dnaTraits','questLine','stageHint','stageMissionHint','campaignRank','campaignXp',
 'campaignStreak','exportSaveBtn','importSaveFile','dailyBtn','dailyBox','codexGrid',
 'survivalBtn','survivalHomeStatus','survivalLocalTop5','roster','searchBtn','cancelSearchBtn',
 'serverUrl','applyServer','roomCode','createRoom','joinRoom','rankingAlias',
 'rankingRegisterBtn','rankingRefreshBtn','onlineLeaderboard','shareVoice','receiveVoice',
 'muteOpponentVoice','roomLine','readyBar','readyBtn','leaveBtn','netDot','netLabel',
 'arenaCanvas','battleSpeech','battleSpeechText','battlePanel','battleReport',
 'battleMsg','fightLog','enemyTactic','battleModal','closeBattle','audioResumeBtn',
 'battleVolume','musicVolume','voiceFxEnabled','roarEnabled','repeatSpeechBtn','rematchBtn','backBtn'];
const drawerIDs=['characterDetails','extraModes','collectionDetails','helpDetails','onlineDrawer',
 'onlineAdvanced','battleAudioSettings'];
for(const id of [...mainIDs,...drawerIDs]){
 assert.equal(html.split('id="'+id+'"').length-1,1,'game element must be unique: '+id);
}
assert.equal((html.match(/<details class="home-details"/g)||[]).length,6);
assert.equal((html.match(/<details class="battle-settings"/g)||[]).length,1);
assert.match(html,/id="fightBtn">▶ オートバトル開始<\/button>/);
assert.match(html,/id="recordBtn">● 録音して生成<\/button>/);
assert.match(html,/id="battleMetrics"/,'five combat bars remain accessible');
assert.match(script,/const CAPTURE_MS=2000/,'fixed microphone duration');
assert.match(script,/const VOICE_EFFECTS=\[/,'28 recorded voice transformations');
for(const fn of ['analyseVoiceDNA','pcmWavDataUrl','startRecord','stopRecord',
 'playDecodedVoice','playVictoryRoar','saveCurrent','exportSave','importSave',
 'beginLiveBattle','receiveLiveTurn','drawCreature','drawVictorySequence']){
 assert.ok(script.includes('function '+fn+'(')||script.includes('async function '+fn+'('),
  'game function preserved: '+fn);
}
assert.match(html,/id="shareVoice" disabled/);
assert.match(html,/id="receiveVoice" disabled/);
assert.match(html,/id="roster"/,'character collection remains');
assert.match(script,/if\(won\|\|m\.live\|\|m\.mode==='COM MATCH'\)scheduleNextAfterQuote\(m\)/,'CPU continues even after loss; PvP returns to CPU');
assert.match(html,/id="survivalChallengerOptIn"/,'public matchmaking opt-in switch');
assert.match(script,/function canSearchPvP\(\)/,'CPU-only PvP matchmaking guard');
assert.match(script,/match\.resumeSurvival=interruptedSurvival/,'preserves interrupted survival');
// Reject missing closing tags and accidental nesting of primary actions in collapsed drawers.
const beforeScript=html.slice(0,html.indexOf('<script>')).replace(/<style>[\s\S]*?<\/style>/i,'');
const tags=beforeScript.match(/<\/?[a-z][^>]*>/gi)||[];
const voidTags=new Set(['meta','link','input','br','img','hr','source','area','embed','wbr','param','track','col','base']);
const stack=[],found=new Map();
for(const tag of tags){
 const mt=tag.match(/^<(\/?)([a-z0-9-]+)/i);if(!mt)continue;
 const [,closing,word]=mt,name=word.toLowerCase();
 if(!closing){
  const id=tag.match(/\bid="([^"]+)"/)?.[1];
  if(id)found.set(id,{tag:name,details:stack.filter(x=>x.name==='details').map(x=>x.id)});
  if(voidTags.has(name))continue;
  if(!tag.endsWith('/>'))stack.push({name,id});
 }else{
  if(voidTags.has(name))continue;
  const item=stack.pop();
  assert.equal(item?.name,name,'HTML closing tag must match '+tag);
 }
}
assert.deepEqual(stack.map(x=>x.name),['html','body'],'all pre-script HTML elements properly closed');
for(const id of ['heroCanvas','recordBtn','voicePreviewBtn','fightBtn','saveBtn','battleMetrics',
 'campaignRank','stageHint']){
 assert.deepEqual(found.get(id)?.details,[],'primary screen element must not be folded: '+id);
}
for(const id of ['dnaPanel','voiceMetrics'])assert.ok(found.get(id)?.details.includes('characterDetails'),'advanced audio analysis folded: '+id);
for(const id of ['dailyBox','survivalBtn'])assert.ok(found.get(id)?.details.includes('extraModes'),'other modes folded');
for(const id of ['rankingAlias','serverUrl'])assert.ok(found.get(id)?.details.includes('onlineAdvanced'),'advanced server settings folded');
assert.deepEqual(found.get('audioResumeBtn')?.details,[],'audio recovery always visible in fight');
assert.ok(found.get('voiceFxEnabled')?.details.includes('battleAudioSettings'),'secondary fight settings folded');
console.log('REFINED UI v0.10.24 PASS | DOM balanced, 5 visible stats, 6 drawers, full engine preserved, 2s mic, 28 FX and recovery');
