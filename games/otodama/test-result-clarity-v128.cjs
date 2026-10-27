'use strict';
// Static result-layout / voice priority regression (not an Android listening test).
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const css=fs.readFileSync(__dirname+'/ui-refresh-v124.css','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'embedded game script');
new vm.Script(script,{filename:'otodama-v128.js'});
const root=html.slice(0,html.indexOf('<script>')).replace(/<style>[\s\S]*?<\/style>/i,'');
const tags=root.match(/<\/?[a-z][^>]*>/gi)||[],stack=[];
const voids=new Set(['meta','link','input','br','img','hr','source','area','embed','wbr','param','track','col','base']);
let speechParent='',speechCount=0;
for(const tag of tags){
 const parts=tag.match(/^<(\/?)([a-z0-9-]+)/i);if(!parts)continue;
 const closing=parts[1],name=parts[2].toLowerCase();
 if(voids.has(name))continue;
 if(closing){const last=stack.pop();assert.equal(last?.tag,name,'HTML nesting balanced');continue}
 const id=tag.match(/\bid="([^"]+)"/)?.[1]||'';
 const cls=tag.match(/\bclass="([^"]+)"/)?.[1]||'';
 if(id==='battleSpeech'){speechCount++;speechParent=stack.at(-1)?.cls}
 if(!tag.endsWith('/>'))stack.push({tag:name,cls});
}
assert.equal(speechCount,1,'one CPU dialogue label');
assert.equal(speechParent,'modalbox','dialogue is outside the arena and cannot hide fighters');
assert.match(css,/#battleModal \.modalbox>\.battle-speech\{[^}]*position:static/,'result dialogue flows below canvas');
assert.match(css,/#battleModal\.victory #matchupBadge\{display:none\}/,'result hides repeated matchup jargon');
assert.match(css,/#battleModal\.victory #nextStagePreview/,'next stage remains available');
assert.match(script,/function queueCpuTaunt\(m,immediate=false\)/,'CPU reads own victory line');
assert.match(script,/m\.tauntText=nextTaunt\('lose'\);/,'CPU reads complete taunting dialogue');
assert.match(script,/line\.lang='ja-JP'/,'use Japanese speech synthesizer');
assert.match(script,/generation!==battleSpeechGeneration/,'stale TTS is canceled between fights');
assert.match(script,/const rush=ev\?\.rush===true/,'only explicit rush repeats voice');
assert.match(script,/const echoes=0/,'no extra recorded echoes');
assert.match(script,/playDecodedVoice\.busyUntil/,'recorded voices are serialized');
assert.match(script,/playDecodedVoice\.generation/,'late audio decode is invalidated');
assert.match(script,/if\(!maybeSpecialRush\(currentMatch,ev\)\)attackVoice\(attacker,ev\.atk,ev\)/,'rush replaces ordinary attack voice');
assert.ok(!script.includes('attackVoice(defender,1-ev.atk,{kind:\'counter\''),'counter cannot add overlapping recorded attack');
assert.match(script,/hint\.textContent='次：STAGE '/,'next-stage preview concise');
console.log('RESULT CLARITY PASS | fighter unobstructed, Japanese CPU TTS, compact HUD, clean serialized attacks');
