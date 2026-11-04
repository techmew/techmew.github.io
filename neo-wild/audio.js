/* WILD RECLAIM -- original adaptive soundtrack and wildlife/urban sound design.
 * No remote samples, royalty-restricted music, or repeating single-note beeps.
 * Runs locally with Web Audio and works offline after the script is cached.
 */
(()=>{"use strict";
const names={explore:"ECHOES OF THE LOST CITY",forest:"RECLAIMED GREEN",danger:"THE HUNT",rain:"RAIN OVER TOKYO"};
const TRACKS=[
 {id:"default",name:"デフォルト｜環境連動"},
 {id:"rush",name:"廃都疾走｜疾走ビート"},
 {id:"wild",name:"野生の鼓動｜冒険"},
 {id:"night",name:"夜の追跡｜緊迫"},
 {id:"dawn",name:"再生の大地｜壮大"}
];
const TRACK_STORAGE_KEY="wild-reclaim-bgm-choice-v1";
function loadMusicChoice(){
 try{
  const id=localStorage.getItem(TRACK_STORAGE_KEY)||"default";
  return TRACKS.some(track=>track.id===id)?id:"default";
 }catch(_){return "default"}
}
let musicChoice=loadMusicChoice();
let context=null,master=null,musicBus=null,atmosBus=null,sfxBus=null,loopSources={},loopGains={},effectBuffers={};
let enabled=true,started=false,scene={weather:"CLEAR",area:0,danger:false},lastAmbient=-1,deathFade=false;
let rngState=1289431;
function rand(){rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;return rngState/4294967296;}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function ensure(){
 if(context)return context;
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 try{
  context=new C({latencyHint:"interactive"});
  master=context.createGain();master.gain.value=enabled?.82:0;master.connect(context.destination);
  musicBus=context.createGain();musicBus.gain.value=.73;musicBus.connect(master);
  atmosBus=context.createGain();atmosBus.gain.value=.50;atmosBus.connect(master);
  sfxBus=context.createGain();sfxBus.gain.value=.32;sfxBus.connect(master);
  return context;
 }catch(_){context=null;return null}
}
function loopBuffer(seconds,fn){
 const sr=22050,count=Math.round(seconds*sr),buff=context.createBuffer(2,count,sr);
 for(let channel=0;channel<2;channel++){
  const data=buff.getChannelData(channel),offset=channel*.008;
  let noiseLow=0,noiseHigh=0;
  for(let i=0;i<count;i++){
   const t=i/sr,edge=Math.min(1,Math.min(t,seconds-t)/.24);
   const noise=rand()*2-1;
   noiseLow=noiseLow*.986+noise*.014;
   noiseHigh=noiseHigh*.48+noise*.52;
   data[i]=clamp(fn(t,channel,noiseLow,noiseHigh,offset)*edge,-.95,.95);
  }
 }
 return buff;
}
function note(f,t){return Math.sin(Math.PI*2*f*t)}
function pad(t,notes){
 const unit=t%4,attack=Math.min(1,unit/.8),release=Math.min(1,(4-unit)/.75),env=Math.max(0,attack*release);
 return notes.reduce((v,f)=>v+(.65*note(f,t)+.19*note(f*1.005,t)+.12*note(f*2,t)),0)*env/notes.length;
}
function woodBeat(t,interval){const x=((t+.002)%interval);return Math.exp(-x*24)*Math.sin(2*Math.PI*(92-35*x)*x)}
function noiseTick(t,interval,high){const x=(t+.001)%interval;return Math.exp(-x*high)}
function buildMusic(which){
 const seconds=16,minor=[[73.42,110,146.83],[65.41,98,130.81],[55,82.41,110],[61.74,92.50,123.47]];
 const lead=[293.66,261.63,220,196,246.94,220,174.61,164.81],forest=[196,220,246.94,293.66,261.63,246.94,220,196];
 const dangerous=which==="danger",green=which==="forest";
 return loopBuffer(seconds,(t,ch,low,hi,offset)=>{
  const chord=minor[Math.floor(t/4)%4];
  const tone=pad(t+offset,chord);
  const beat=woodBeat(t,dangerous?.5:2),kick=woodBeat(t,green?4:dangerous?1:2);
  const noteTime=t%2,melody=(green?forest:lead)[Math.floor(t/2)%8];
  const melodyEnvelope=Math.exp(-noteTime*(green?3:1.5))*.75;
  const melodic=(note(melody,t+offset)+.22*note(melody*2,t+offset))*melodyEnvelope;
  const tremolo=.5+.5*Math.sin(2*Math.PI*(dangerous?3.5:.22)*t);
  const grit=hi*noiseTick(t,dangerous?.5:1,38);
  return (dangerous?.26:green?.14:.19)*tone+
         (dangerous?.14:.055)*melodic+
         (dangerous?.19:green?.11:.12)*beat+
         (dangerous?.19:green?.09:.13)*kick+
         (dangerous?.075:.028)*grit+
         .035*low*tremolo;
 });
}
// Four independent original songs, looped exactly on an integer number of beats.
// Keep the previous explore/forest/danger adaptive score unchanged for "default".
const COMPOSITIONS={
 rush:{bpm:120,roots:[45,41,48,43],scale:[0,2,3,5,7,8,10,12],pattern:[0,-1,2,-1,4,2,3,-1,4,-1,5,4,2,-1,0,-1],bass:.22,lead:.29,drums:.29,pad:.15},
 wild:{bpm:105,roots:[48,43,45,41],scale:[0,2,4,5,7,9,11,12],pattern:[0,2,4,-1,3,2,1,-1,4,-1,5,-1,4,2,1,-1],bass:.24,lead:.23,drums:.24,pad:.23},
 night:{bpm:135,roots:[40,43,47,38],scale:[0,2,3,5,7,8,10,12],pattern:[0,-1,0,2,3,-1,2,-1,5,4,3,-1,2,-1,1,-1],bass:.27,lead:.24,drums:.34,pad:.12},
 dawn:{bpm:90,roots:[43,47,40,45],scale:[0,2,4,5,7,9,11,12],pattern:[0,-1,-1,2,4,-1,3,-1,5,-1,4,3,2,-1,0,-1],bass:.23,lead:.27,drums:.18,pad:.30}
};
function pitch(midi){return 440*Math.pow(2,(midi-69)/12)}
function buildExtraMusic(id){
 const p=COMPOSITIONS[id];if(!p)throw Error("Unknown original BGM: "+id);
 const beatSeconds=60/p.bpm,halfBeat=beatSeconds/2;
 return loopBuffer(16,(t,ch,low,hi,offset)=>{
  const beats=t/beatSeconds,bar=Math.floor(beats/4),beatInBar=beats%4;
  const beatIndex=Math.floor(beatInBar),step=Math.floor(beatInBar*4)%16;
  const root=p.roots[bar%p.roots.length],degree=p.pattern[step];
  const stepTime=(t%(beatSeconds/4)),noteEnvelope=Math.exp(-stepTime*(id==="dawn"?9:15));
  let lead=0;
  if(degree>=0){
   const freq=pitch(root+24+p.scale[degree]);
   lead=(note(freq,t+offset)+.26*note(freq*2,t+offset))*.73*noteEnvelope;
  }
  // Bass notes on the downbeat and offbeats; continuous phase avoids clicks.
  const beatTime=t%beatSeconds,bassEnvelope=Math.exp(-beatTime*5);
  const bassFreq=pitch(root-12);
  const bass=(note(bassFreq,t+offset)+.20*note(bassFreq*2,t+offset))*bassEnvelope;
  const chordFreq=pitch(root+12),swell=.55+.45*Math.sin(t*.55);
  const chord=(note(chordFreq,t+offset)+.5*note(chordFreq*1.1892,t+offset)+.43*note(chordFreq*1.4983,t+offset))*swell*.31;
  const kick=(beatIndex===0||beatIndex===2||id==="night")?
   Math.exp(-beatTime*25)*Math.sin(Math.PI*2*(100-42*beatTime)*beatTime):0;
  const snare=(beatIndex===1||beatIndex===3)?hi*Math.exp(-beatTime*24):0;
  const hatTime=t%halfBeat,hat=hi*Math.exp(-hatTime*(id==="dawn"?48:85));
  const energy=id==="night"?1.14:id==="rush"?1.07:1;
  return (lead*p.lead+bass*p.bass+chord*p.pad+
    (kick*.65+snare*.55+hat*.28)*p.drums+low*.024)*energy;
 });
}
function buildAtmos(name){
 const seconds=8;
 return loopBuffer(seconds,(t,ch,low,hi)=>{
  if(name==="wind")return low*(.85+.15*Math.sin(t*.8+ch))*.45+hi*.013;
  if(name==="rain")return hi*.15+low*.24+Math.max(0,Math.sin(t*67))*hi*.06;
  // Flowing river/canal ambience: layered low-frequency current and soft ripples.
  if(name==="water")return low*(.48+.18*Math.sin(t*1.3+ch*.27))+
    hi*(.12+.03*Math.sin(t*13+ch))+.085*Math.sin(2*Math.PI*(86+3*Math.sin(t*.8))*t)*Math.max(0,Math.sin(t*5))*.38;
  if(name==="forest")return low*.25+hi*.032+Math.sin(2*Math.PI*1650*t+Math.sin(t*4)*9)*.005*Math.pow(Math.max(0,Math.sin(t*2.3)),9);
  return 0;
 });
}
function sample(name){
 const sr=22050;
 const lengths={step:.11,stepHard:.14,bite:.27,wing:.33,jump:.27,attack:.24,impact:.38,howl:1.35,thunder:2.6,collect:.18,menu:.13,damage:.38,snarl:.65,rustle:.36,land:.24,death:1.4,level:.70};
 const duration=lengths[name]||.22,len=Math.ceil(sr*duration),buf=context.createBuffer(1,len,sr),a=buf.getChannelData(0);
 let low=0,mid=0;
 for(let i=0;i<len;i++){
  const t=i/sr,u=i/len,n=rand()*2-1;
  low=.968*low+.032*n;mid=.62*mid+.38*n;
  const env=Math.pow(Math.max(0,1-u),name==="thunder"?.9:2.5);
  let v=0;
  switch(name){
   case "step":v=mid*.36+low*.38+Math.sin(2*Math.PI*(93-40*u)*t)*.13;break;
   case "stepHard":v=mid*.55+low*.16+Math.sin(2*Math.PI*(130-70*u)*t)*.13;break;
   case "bite":v=mid*.57+low*.19+Math.sin(2*Math.PI*(280-180*u)*t)*.18;break;
   case "wing":v=mid*.26*Math.sin(u*Math.PI*4)**2+low*.3;break;
   case "jump":v=low*.32+mid*.12+Math.sin(2*Math.PI*(122-64*u)*t)*.055;break;
   case "attack":v=mid*.62+low*.23+Math.sin(2*Math.PI*(170-90*u)*t)*.1;break;
   case "impact":v=low*.62+mid*.23+Math.sin(2*Math.PI*(110-75*u)*t)*.31;break;
   case "howl":v=(Math.sin(2*Math.PI*(165+90*Math.sin(u*Math.PI))*t)+.33*Math.sin(2*Math.PI*(330+180*Math.sin(u*Math.PI))*t)+mid*.07)*Math.sin(u*Math.PI)*.65;break;
   case "snarl":v=mid*.28+low*.30+Math.sin(2*Math.PI*(85+40*Math.sin(t*16))*t)*.3;break;
   case "thunder":v=low*.82+mid*.25*Math.exp(-u*18)+Math.sin(2*Math.PI*(36+40*Math.exp(-u*7))*t)*.36;break;
   case "collect":case "menu":v=Math.sin(2*Math.PI*(340+190*u)*t)*.19+mid*.09;break;
   case "damage":v=low*.47+mid*.33+Math.sin(2*Math.PI*(130-75*u)*t)*.19;break;
   case "land":v=mid*.45+low*.4;break;
   case "rustle":v=mid*.25+low*.40;break;
   case "level":v=Math.sin(2*Math.PI*(220+220*u)*t)*.18+Math.sin(2*Math.PI*(330+110*u)*t)*.09;break;
   case "death":v=low*.28+Math.sin(2*Math.PI*(130-82*u)*t)*.22;break;
   default:v=mid*.30+low*.20;
  }
  a[i]=clamp(v*env,-1,1);
 }
 return buf;
}
function attachLoop(id,buffer,bus,volume){
 const source=context.createBufferSource(),gain=context.createGain();
 source.buffer=buffer;source.loop=true;gain.gain.value=volume;
 source.connect(gain);gain.connect(bus);source.start();
 loopSources[id]=source;loopGains[id]=gain;
}
function unlock(){
 const ac=ensure();if(!ac||!enabled)return false;
 if(ac.state==="suspended")ac.resume().catch(()=>{});
 if(started)return true;
 try{
  attachLoop("explore",buildMusic("explore"),musicBus,.30);
  attachLoop("forest",buildMusic("forest"),musicBus,0);
  attachLoop("danger",buildMusic("danger"),musicBus,0);
  attachLoop("wind",buildAtmos("wind"),atmosBus,.22);
  attachLoop("forestWind",buildAtmos("forest"),atmosBus,0);
  attachLoop("rain",buildAtmos("rain"),atmosBus,0);
   attachLoop("water",buildAtmos("water"),atmosBus,0);
  started=true;
  if(musicChoice!=="default")ensureExtraTrack(musicChoice);
  return true;
 }catch(e){console.warn("WILD RECLAIM audio init:",e);return false}
}
function ensureExtraTrack(id){
 if(!COMPOSITIONS[id]||!context||!musicBus||!started)return false;
 const key="track-"+id;
 if(!loopSources[key])attachLoop(key,buildExtraMusic(id),musicBus,0);
 return !!loopSources[key];
}
function getMusicChoice(){return musicChoice}
function setMusicChoice(id){
 if(!TRACKS.some(track=>track.id===id))return false;
 musicChoice=id;
 try{localStorage.setItem(TRACK_STORAGE_KEY,id)}catch(_){}
 if(enabled)unlock();
 if(started&&id!=="default")ensureExtraTrack(id);
 if(started&&enabled)update(scene);
 return true;
}
function update(conditions){
 scene=conditions||scene;
 if(!started||!context||!enabled)return;
 const area=Number(scene.area||0),danger=!!scene.danger,storm=scene.weather==="THUNDER",rain=scene.weather==="RAIN"||storm;
 const forest=area===5||area===2||area===4,clock=context.currentTime;
 const paused=scene.mode&&scene.mode!=="play",mix=scene.mode==="guide"?0:paused?.12:1;
 const defaultMix=musicChoice==="default"?1:0;
 const alternativeMix=scene.mode==="guide"?0:scene.mode==="pause"?.40:paused?.12:1;
 const targets={
  explore:(danger?.06:forest?.14:.60)*mix*defaultMix,
  forest:(danger?.06:forest?.65:.04)*mix*defaultMix,
  danger:(danger?.64:storm?.17:.012)*mix*defaultMix,
  wind:(scene.weather==="WIND"?.61:scene.weather==="FOG"?.28:.21)*mix,
  forestWind:(forest?.37:.04)*mix,
  rain:(storm?.72:rain?.51:0)*mix,
   water:clamp(Number(scene.waterNear)||0,0,1)*.77*mix
 };
 for(const id of Object.keys(COMPOSITIONS)){
  const gain=loopGains["track-"+id];
  if(gain)gain.gain.setTargetAtTime(musicChoice===id?.73*alternativeMix:0,clock,.22);
 }
 if(loopSources.water?.playbackRate)loopSources.water.playbackRate.setTargetAtTime(scene.waterKind==="canal"?.88:1,clock,.9);
  for(const [name,value] of Object.entries(targets)){
  const gain=loopGains[name];
  if(gain)gain.gain.setTargetAtTime(value,clock,.9);
 }
 // Sparse, irregular background fauna: no alarms or distracting electronic effects.
 if(!paused&&clock-lastAmbient>9+rand()*4){
  lastAmbient=clock;
  if(forest&&!storm)play("wing",{volume:.20,rate:.66+rand()*.3});
  else if(area===6)play("impact",{volume:.11,rate:.45});
 }
}
function play(name,options={}){
 if(!enabled||!unlock())return;
 try{
  const buf=effectBuffers[name]||(effectBuffers[name]=sample(name));
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buf;source.playbackRate.value=options.rate||(.95+rand()*.10);
  // Preserve music and weather beds. Foreground effects are subdued; jump in
  // particular is a quiet low thump. Never let call-site volume override caps.
  const step=name==="step"||name==="stepHard";
  const quietCap={
   jump:.07,land:.08,attack:.13,bite:.12,impact:.12,
   howl:.13,snarl:.11,damage:.11,thunder:.17,death:.12
  }[name]??.17;
  const asked=options.volume===undefined?.14:options.volume;
  gain.gain.value=step?Math.min(asked,.055):Math.min(asked,quietCap);
  source.connect(gain);gain.connect(sfxBus);source.start();
  source.onended=()=>{try{source.disconnect();gain.disconnect()}catch(_){}};
 }catch(_){}
}
function fadeForDeath(){
 if(deathFade)return;
 deathFade=true;
 if(!context||!started)return;
 const t=context.currentTime;
 // Leave the final breath audible, then let the city and wildlife fall silent.
 musicBus?.gain.cancelScheduledValues(t);
 atmosBus?.gain.cancelScheduledValues(t);
 sfxBus?.gain.cancelScheduledValues(t);
 musicBus?.gain.setTargetAtTime(.018,t+.48,.28);
 atmosBus?.gain.setTargetAtTime(.012,t+.58,.34);
 sfxBus?.gain.setTargetAtTime(.09,t+.82,.24);
 // After the fall, silence even residual effects before the result.
 // resetDeathFade cancels both ramps when the player retries.
 sfxBus?.gain.setTargetAtTime(.015,t+1.65,.18);
}
function resetDeathFade(){
 if(!deathFade)return;
 deathFade=false;
 if(!context||!started)return;
 const t=context.currentTime;
 // Cancel future death ramps as well: an immediate retry must not become mute.
 musicBus?.gain.cancelScheduledValues(t);
 atmosBus?.gain.cancelScheduledValues(t);
 sfxBus?.gain.cancelScheduledValues(t);
 musicBus?.gain.setTargetAtTime(.73,t,.14);
 atmosBus?.gain.setTargetAtTime(.50,t,.14);
 sfxBus?.gain.setTargetAtTime(.32,t,.14);
}
function setEnabled(on){
 enabled=!!on;
 if(!enabled&&context&&master)master.gain.setTargetAtTime(0,context.currentTime,.1);
 if(enabled){unlock();if(context&&master)master.gain.setTargetAtTime(.82,context.currentTime,.18)}
 return enabled;
}
window.WildAudio={unlock,update,play,setEnabled,setMusicChoice,getMusicChoice,
 tracks:TRACKS.map(t=>({...t})),fadeForDeath,resetDeathFade,get active(){return started},get enabled(){return enabled},
 get soundtrack(){return musicChoice==="default"?names[scene.danger?"danger":Number(scene.area)===5?"forest":"explore"]:TRACKS.find(t=>t.id===musicChoice)?.name||names.explore}};
})();