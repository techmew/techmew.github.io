'use strict';
// Keep past released features when changing voice capture or battle audio.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
for(const id of [
 'recordBtn','voicePreviewBtn','birthReveal','birthCreatureCanvas','birthVoicePlay',
 'birthVoiceRetry','birthVoiceDone','evolveBtn','evoRecord','evoListen','evoRetry',
 'evoConfirm','fightBtn','survivalBtn','roarEnabled','voiceFxEnabled',
 'battleChallengerOptIn','shareVoice','receiveVoice','muteOpponentVoice',
 'rankingRegisterBtn','rankingRefreshBtn'
]){
 assert.equal(html.split('id="'+id+'"').length-1,1,'preserve UI feature: '+id);
}
for(const name of [
 'function startRecord(','function startBirthReveal(','function replaceBirthVoice(',
 'function previewFullVoice(','function openEvolutionDialog(',
 'function confirmEvolutionDraft(','function doCom(','function startSurvival(',
 'function maybeSpecialRush(','function attackVoice(','function reactionVoice(',
 'function playVictoryRoar(','function receiveLiveTurn(','function receiveLiveImpact(',
 'function sendVoiceConsent(','function offerRecordedVoice(','function registerRanking('
])assert.ok(js.includes(name),'preserve implementation: '+name);
const group=js.slice(js.indexOf('const VOICE_EFFECTS=['),js.indexOf('function setVoiceEffectStatus('));
const fx=vm.runInNewContext(group+';({VOICE_EFFECTS,VOICE_ATTACK_VARIANTS,VOICE_REACTION_VARIANTS,VOICE_SKILL_VARIANTS})');
assert.equal(fx.VOICE_EFFECTS.length,28,'retain 28 distinct voice effects');
assert.equal(new Set(Array.from(fx.VOICE_EFFECTS,v=>v[0])).size,28,'retain unique effect labels');
assert.ok(Object.keys(fx.VOICE_ATTACK_VARIANTS).length>=10,'retain attack voice categories');
assert.ok(Object.keys(fx.VOICE_REACTION_VARIANTS).length>=7,'retain defense voice categories');
assert.equal(fx.VOICE_SKILL_VARIANTS.length,10,'retain special attack sound profiles');
assert.match(html,/id="voiceFxEnabled" checked>/,'voice effects opt-out is available and enabled by default');
assert.match(js,/otodama\.voice\.fx\.enabled/,'voice effect preference persists');
assert.match(js,/source\.start\(start,0\)/,'recorded speech is never cut in combat');
assert.match(js,/variant\.start\(start,0\)/,'effect layer also uses complete recording');
assert.match(js,/const pcmPreRoll=new Float32Array\(Math.round\(11025\*1\.05\)\)/,'early syllable guard');
assert.match(js,/const CAPTURE_MS=2000,TAIL_MS=650/,'word ending guard');
assert.match(js,/function cacheDecodedVoice\(/,'instant replay cache stays');
assert.match(js,/voiceOnlyRequested/,'voice-only retake stays');
assert.match(js,/GROWTH\.previewEvolution\(/,'evolution voice bonuses stay');
assert.match(js,/startBirthReveal\(newborn,/,'birth ceremony remains after recording');
assert.match(js,/clip\.length>125000/,'increased voice capacity retained for evolution');
console.log('FEATURE CONTRACT V147 PASS | previous gacha/evolution/battle/28 FX/online/ranking/voice-retake features protected');
