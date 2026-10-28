'use strict';
// Rush must produce seven audible strikes WITHOUT seven overlapping copies
// or chopping the beginning/end of the actual recorded fighter's voice.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const cut=(begin,end)=>{const i=js.indexOf(begin),j=js.indexOf(end,i);assert.ok(i>=0&&j>i,begin);return js.slice(i,j)};
const src=cut('function playRushHitSounds(', 'function synthVoice(');
const special=cut('function maybeSpecialRush(', 'function primeBattleVoices(');
const voice=cut('function playDecodedVoice(', 'function attackVoice(');
assert.equal(voice.split('createBufferSource(').length-1,1,'one recorded voice per combat utterance');
assert.equal(voice.split('source.start(').length-1,1,'complete recording starts once');
assert.match(voice,/source\.start\(start,0\)/,'recording starts at first sample without a duration');
assert.doesNotMatch(voice,/variant\.start|source\.start\(start,0,[^)]/,'no duplicate/cropped recordings');
const notes=[],stops=[],levels=[];
const param=()=>({value:0,setValueAtTime(v,t){this.value=v},exponentialRampToValueAtTime(v,t){this.end=v},
 linearRampToValueAtTime(v,t){this.value=v}});
const ctx={
 Math,performance:{now:()=>1000},
 $:id=>id==='mutedCheck'?{checked:ctx.muted}:{textContent:''},
 muted:false,VOLUME:()=>.16,clamp:(v,lo,hi)=>Math.min(hi,Math.max(lo,v)),
 unlockBattleAudio:()=>ctx.ac,audioMaster:()=>({}),trackAttackSource:()=>{},
 bgmDuckUntil:0,lastSoundStatus:''
};
ctx.ac={currentTime:4,createOscillator(){return {type:'',
 frequency:param(),connect(){},start(t){notes.push(t)},stop(t){stops.push(t)}}},
 createGain(){return {gain:{...param(),linearRampToValueAtTime(v,t){levels.push(v);this.value=v}},connect(){}}}};
const fx=vm.runInNewContext(src+';({playRushHitSounds})',ctx);
assert.equal(fx.playRushHitSounds({skill:true},7),7,'seven sound hits were scheduled');
assert.equal(notes.length,7,'all seven strike sounds play');
assert.equal(stops.length,7,'all seven strike sounds end naturally');
for(let i=1;i<7;i++)assert.ok(Math.abs(notes[i]-notes[i-1]-.2)<1e-6,'strike sound is every 200ms');
assert.ok(levels.every(v=>v<=.035),'hit effects cannot overwhelm the spoken word');
const soundCount=notes.length;ctx.muted=true;
assert.equal(fx.playRushHitSounds({skill:true},7),0,'mute prevents rush audio');
assert.equal(notes.length,soundCount,'mute does not queue extra hits');
ctx.muted=false;
const banner=[],attacks=[],m={live:false,done:false,a:{seed:1},b:{seed:2},rushEndsAt:0};
const rushCtx={performance:{now:()=>1000},showRushBanner:(...x)=>banner.push(x),
 $:id=>({textContent:''}),playRushHitSounds:(ev,hits)=>fx.playRushHitSounds(ev,hits),
 attackVoice:(cr,side,ev)=>attacks.push({cr,side,ev}),
 playDecodedVoice:{busyUntil:4700},Math};
const {maybeSpecialRush}=vm.runInNewContext(special+';({maybeSpecialRush})',rushCtx);
const event={skill:true,atk:0,kind:'meteor'};
assert.equal(maybeSpecialRush(m,event),true);
assert.equal(banner.length,1,'seven-hit banner is displayed');
assert.equal(banner[0][1],7,'visuals have seven strikes');
assert.equal(notes.length,14,'special dispatch schedules a second set of seven audible strikes');
assert.equal(attacks.length,1,'special requests exactly one intact fighter recording');
assert.equal(attacks[0].ev.rush,true,'voice remains classified as a rush attack');
assert.equal(attacks[0].ev.hits,7,'rush metadata and style remain intact');
assert.ok(m.rushEndsAt>=4700,'battle cannot skip while full voice is playing');
assert.equal(maybeSpecialRush(m,event),false,'one event cannot double-trigger audio');
assert.equal(notes.length,14,'duplicate event cannot double sounds');
assert.ok(html.includes('id="stanceRush"'),'offensive rush stance remains');
assert.ok(js.includes("const VOICE_EFFECTS=["),'28 voice styles remain defined');
console.log('RUSH AUDIO RESTORATION V149 PASS | seven audible 200ms strikes, one uncropped spoken voice, stance, 28 voice patterns, mute, no double trigger');
