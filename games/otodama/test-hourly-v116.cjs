// Offline regression for voice fallback, battle presentation, and live-event idempotence.
// Requires Node only; no microphone, speaker, Cloudflare or browser is exercised.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const worker=fs.readFileSync(__dirname+'/worker.js','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/i)?.[1];
assert.ok(script,'embedded game script');
new vm.Script(script,{filename:'otodama-client.js'});
const slice=(a,b)=>{
 const start=script.indexOf(a),end=script.indexOf(b,start+a.length);
 assert.ok(start>=0&&end>start,'missing source section '+a);
 return script.slice(start,end);
};
const wavSource=slice('function pcmWavDataUrl(','function changeCaptureButtons(');
const pcmWavDataUrl=vm.runInNewContext('const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));'+wavSource+';pcmWavDataUrl',{
 btoa:s=>Buffer.from(s,'binary').toString('base64')
});
const samples=Array.from({length:11025},(_,i)=>.12*Math.sin(i*2*Math.PI*240/11025));
const wav=pcmWavDataUrl(samples,11025);
assert.ok(wav.startsWith('data:audio/wav;base64,'),'WAV MIME data URL');
const bytes=Buffer.from(wav.split(',')[1],'base64');
assert.equal(bytes.toString('ascii',0,4),'RIFF');
assert.equal(bytes.toString('ascii',8,12),'WAVE');
assert.equal(bytes.readUInt16LE(22),1,'mono');
assert.equal(bytes.readUInt32LE(24),11025,'sample rate');
assert.equal(bytes.readUInt16LE(34),16,'16-bit PCM');
assert.equal(bytes.readUInt32LE(40),samples.length*2,'data chunk size');
assert.equal(pcmWavDataUrl(Array(4000).fill(0),11025),'','silence should not be stored');
assert.equal(pcmWavDataUrl(Array(20).fill(.12),11025),'','short clip rejected');
assert.ok(script.includes('await aud.decodeAudioData(await blob.arrayBuffer())'),'recording codec validated before save');
assert.ok(script.includes('if(!voiceClip)voiceClip=pcmWavDataUrl(pcmSamples,pcmRate)'),'WAV capture fallback');
assert.ok(script.includes('recording||recordingRequestPending'),'double tap microphone guard');

const bar={hidden:true,textContent:'',style:{setProperty(k,v){this[k]=v}}};
const campaignCtx={
 CHAPTERS:['空の広場。練習','街の屋上。対戦'],
 stageBiome:()=>({name:'空の広場'}),$:()=>bar
};
const campaign=vm.runInNewContext('let adventureStage=1;'+slice('function updateCampaignTrack(mode){','function showBattle(')+';({updateCampaignTrack,setStage:n=>adventureStage=n})',campaignCtx);
const updateCampaignTrack=campaign.updateCampaignTrack;
updateCampaignTrack('COM MATCH');
assert.ok(bar.textContent.includes('STAGE 1')&&bar.textContent.includes('ボスまで4戦'),'compact campaign label');
campaign.setStage(5);updateCampaignTrack('COM MATCH');
assert.ok(bar.textContent.includes('ボス戦！'));
assert.equal(bar.style['--chapter-progress'],'100%');
updateCampaignTrack('SURVIVAL');assert.equal(bar.hidden,true);

const banner={hidden:true,textContent:''},timeouts=new Map(),intervals=new Map();let timerId=0;
const rushCtx={
 $:()=>banner,
 setTimeout(fn){const id=++timerId;timeouts.set(id,fn);return id},
 clearTimeout(id){timeouts.delete(id)},
 setInterval(fn){const id=++timerId;intervals.set(id,fn);return id},
 clearInterval(id){intervals.delete(id)}
};
const rush=vm.runInNewContext(slice('let rushBannerTimer=null,rushCounterTimer=null;','let matchIntroTimer=')+';({showRushBanner,hideRushBanner})',rushCtx);
rush.showRushBanner('連打ラッシュ！');
for(let i=0;i<6;i++)for(const fn of [...intervals.values()])fn();
assert.ok(banner.textContent.includes('7 HIT'),'animated 7-hit counter');
assert.equal(intervals.size,0,'rush counter stops after 7 hits');
rush.hideRushBanner();assert.equal(banner.hidden,true);assert.equal(timeouts.size,0);

const nodes={},attackCalls=[];
const match={live:true,done:false,turn:0,current:null,dodgeCooldown:0,parries:0,dodges:0,skillsUsed:0,strikes:0,awakened:[false,false],max:[100,100],hp:[100,100],prevPos:[{x:1,y:2},{x:3,y:4}],a:{name:'A'},b:{name:'B'}};
const liveCtx={
 match,$:id=>nodes[id]||(nodes[id]={textContent:'',style:{}}),
 hideMatchIntro:()=>{},clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
 performance:{now:()=>100},attackVoice:(...args)=>attackCalls.push(args),
 updateActionHud:()=>{},impactSfx:()=>{liveCtx.impactCount++},reactionVoice:()=>{liveCtx.reactionCount++},impactCount:0,reactionCount:0,
 BATTLE_LABEL:{rush:'突進'},displayName:c=>c.name
};
const turn=vm.runInNewContext(slice('function receiveLiveTurn(data){','function receiveLiveAck(data){')+';receiveLiveTurn',liveCtx);
turn({seq:1,atk:0,kind:'rush',duration:900});
turn({seq:1,atk:0,kind:'rush',duration:900});
assert.equal(attackCalls.length,1,'duplicate live turn should not replay voice');
turn({seq:1,atk:0,kind:'rush',duration:900,resumed:true});
assert.equal(attackCalls.length,1,'reconnection should not replay voice');
turn({seq:2,atk:1,kind:'rush',duration:900});
assert.equal(attackCalls.length,2,'new live turn still speaks');
const impact=vm.runInNewContext(slice('function receiveLiveImpact(data){','function endLiveBattle(data){')+';receiveLiveImpact',liveCtx);
const valid={seq:2,atk:1,damage:12,hp:[88,100],charge:[0,0],parry:false,dodge:false,skill:false,strike:false};
impact({...valid,hp:[-2,100]});assert.equal(liveCtx.impactCount,0,'negative HP rejected');
impact(valid);assert.equal(liveCtx.impactCount,1,'valid impact processed');
impact(valid);assert.equal(liveCtx.impactCount,1,'duplicate impact rejected');

assert.ok(worker.includes('raw.length>8192')&&worker.includes("ws.close(1009,'Message too large')"),'server packet bound');
assert.ok(script.includes('function resumeAudioFromGesture()'),'audio gesture resume');
assert.ok(script.includes("document.addEventListener('pointerdown',resumeAudioFromGesture"),'touch audio resume');
assert.ok(script.includes("if(!won){$('rematchBtn').textContent="),'survival defeat remains on result screen');
assert.ok(script.includes("if(won||m.live||m.mode==='COM MATCH')scheduleNextAfterQuote(m)"),'victory auto-continues');
assert.ok(html.includes('id="campaignTrack"')&&html.includes('id="matchIntro"'),'battle UI preserved');
console.log('HOURLY V116 TEST PASS | PCM fallback, campaign, rush, live dedupe, packet limit, auto-next');
