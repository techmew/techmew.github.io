'use strict';
// Local Voice FX regression; no real microphone, audio hardware, or online audio transfer.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(js);new vm.Script(js);
const start=js.indexOf('const VOICE_EFFECTS=['),end=js.indexOf('function previewRecordedVoice()',start);
assert.ok(start>0&&end>start,'FX bank and player are present');
const selection=js.slice(start,end);
const clips=[],filters=[],voices=[],labels=[],banner=[];
const flags={mutedCheck:{checked:false},muteOpponentVoice:{checked:false},
 voiceFxEnabled:{checked:true},voiceFxLabel:{textContent:'',hidden:true},
 arenaEffect:{textContent:''}};
const $=name=>flags[name]||{checked:false};
const param=()=>({value:1,setValueAtTime(value,time){this.value=value;this.start=value;this.startAt=time},
 exponentialRampToValueAtTime(value,time){this.end=value;this.endAt=time},
 linearRampToValueAtTime(value,time){this.end=value;this.endAt=time}});
const ac={currentTime:10,
 createBufferSource(){const s={playbackRate:param(),connect(node){this.next=node},
 start(time,offset,duration){clips.push({time,offset,duration,source:this,rate:this.playbackRate.start??this.playbackRate.value})},
 stop(){}};return s},
 createGain(){return {gain:param(),connect(){}}},
 createBiquadFilter(){const f={frequency:{value:0},Q:{value:0},type:'',connect(){}};filters.push(f);return f}};
const voiceClip='data:audio/wav;base64,ZGVtbw==',cr={seed:54,voiceClip,voice:{pitch:78,rhythm:61}};
const key=cr.seed+'_'+voiceClip.length+'_'+voiceClip.slice(-32);
let now=1000;
const context={Math,Map,Uint8Array,Float32Array,atob:()=> 'demo',
 voiceCache:new Map([[key,{buffer:{},offset:.07,duration:.65,gain:1.4}]]),pendingVoice:new Map(),
 $ ,VOLUME:()=>.15,unlockBattleAudio:()=>ac,voiceOutput:()=>({}),
 trackAttackSource:()=>{},synthVoice:(...args)=>voices.push(args),
 hash:n=>{n=n>>>0;n=Math.imul(n^(n>>>16),0x7feb352d);return (n^(n>>>15))>>>0},
 clamp:(n,a,b)=>Math.max(a,Math.min(b,n)),performance:{now:()=>now},
 bgmDuckUntil:0,lastSoundStatus:'',showRushBanner:x=>banner.push(x),
 match:{done:false,mode:'COM MATCH',turn:1,live:false,a:cr,b:cr}
};
const api=vm.runInNewContext(selection+';({VOICE_EFFECTS,VOICE_ATTACK_VARIANTS,VOICE_REACTION_VARIANTS,voiceEffectProfile,playDecodedVoice,attackVoice,reactionVoice})',context);
assert.equal(api.VOICE_EFFECTS.length,28,'28 transformations');
assert.equal(new Set(Array.from(api.VOICE_EFFECTS,x=>x[0])).size,28,'unique names');
assert.ok(Object.keys(api.VOICE_ATTACK_VARIANTS).length>=10,'different attack styles');
assert.ok(Object.keys(api.VOICE_REACTION_VARIANTS).length>=7,'defense reactions');
const variants=new Set();
for(let i=0;i<70;i++)for(const kind of Object.keys(api.VOICE_ATTACK_VARIANTS)){
 context.match.turn=i;
 variants.add(api.voiceEffectProfile({...cr,seed:54+i},0,{kind,seq:i},'attack').label);
}
assert.ok(variants.size>=22,'wide style coverage from different voice and moves');
context.match.turn=5;
const same1=api.voiceEffectProfile(cr,0,{kind:'combo'},'attack');
const same2=api.voiceEffectProfile(cr,0,{kind:'combo'},'attack');
assert.equal(same1.label,same2.label,'same voice and turn => same choice');
api.attackVoice(cr,0,{kind:'aerial'});
assert.equal(clips.length,1,'one recorded attack');
assert.ok(clips[0].rate>.4&&clips[0].rate<=2.1,'pitch/rate modified');
assert.equal(flags.voiceFxLabel.hidden,false,'FX name visible');
assert.ok(flags.voiceFxLabel.textContent.includes('攻撃'),'attack label visible');
api.attackVoice(cr,0,{kind:'combo',hits:5});
assert.equal(clips.length,1,'busy attack is not layered with a second recording');
now+=850;
api.attackVoice(cr,0,{kind:'combo',hits:5});
assert.equal(clips.length,2,'ordinary multi-hit animation uses just one voice');
now+=850;
api.attackVoice(cr,0,{kind:'meteor',skill:true,rush:true,hits:7});
assert.equal(clips.length,9,'only explicitly marked rush has seven samples');
assert.ok(clips[8].time>clips[2].time,'rush voices are sequential');
const beforeReactions=clips.length;
api.reactionVoice(cr,1,{kind:'rush',damage:18});
api.reactionVoice(cr,1,{kind:'rush',damage:25,guard:true});
assert.equal(clips.length,beforeReactions,'reactions cannot overlap recorded rush');
now+=1500;
api.reactionVoice(cr,1,{kind:'rush',damage:18});
assert.equal(clips.length,beforeReactions,'ordinary hit reactions use SE rather than voice');
api.reactionVoice(cr,1,{kind:'rush',damage:25,guard:true});
assert.equal(clips.length,beforeReactions+1,'guard can speak after attack finishes');
now+=850;
api.reactionVoice(cr,1,{kind:'rush',damage:0,dodge:true});
assert.equal(clips.length,beforeReactions+2,'dodge has a separated response');
assert.ok(flags.voiceFxLabel.textContent.includes('被弾'),'reaction label shown');
const beforeMute=clips.length;flags.muteOpponentVoice.checked=true;
context.match.mode='ONLINE LIVE';
api.attackVoice(cr,1,{kind:'rush'});
api.reactionVoice(cr,1,{damage:12});
assert.equal(clips.length,beforeMute,'muted online opponent voice');
flags.muteOpponentVoice.checked=false;
context.match.mode='COM MATCH';
flags.voiceFxEnabled.checked=false;
const plain=api.voiceEffectProfile(cr,0,{kind:'meteor'},'attack');
assert.equal(plain.enabled,false,'FX opt-out');
assert.equal(plain.from,1);
now+=850;
api.attackVoice(cr,0,{kind:'meteor'});
assert.equal(flags.voiceFxLabel.hidden,true,'FX label disabled');
const previewBefore=clips.length;
flags.voiceFxEnabled.checked=true;
api.playDecodedVoice(cr,0,true,{event:{kind:'meteor'}});
assert.equal(clips.length,previewBefore+1,'unaltered recording preview');
assert.equal(clips.at(-1).rate,1,'preview must use original recording pitch');
context.match.done=true;
const stopped=clips.length;
api.attackVoice(cr,0,{kind:'combo',hits:5});
assert.equal(clips.length,stopped,'no recording after battle');
assert.equal(voices.length,0,'recorded sample did not require synthetic fallback');
assert.ok(html.includes('id="voiceFxLabel"')&&html.includes('id="voiceFxEnabled"'));
assert.ok(js.includes('reactionVoice(def===0?m.a:m.b,def,ev)'),'CPU spectator reaction connected');
assert.ok(js.includes('reactionVoice(data.atk===0?m.b:m.a,1-data.atk'),'online impact reaction connected');
console.log('VOICE FX PASS | 28 profiles, single isolated attacks, explicit rush only, guarded reactions, mute, clean preview');
