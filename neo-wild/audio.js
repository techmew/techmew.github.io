/* WILD RECLAIM -- original adaptive soundtrack and wildlife/urban sound design.
 * No remote samples, royalty-restricted music, or repeating single-note beeps.
 * Runs locally with Web Audio and works offline after the script is cached.
 */
(()=>{"use strict";

// Individual animal vocals for existing and future gacha species.
// SFXMint files are AI-generated CC0 sound effects (NOT zoological field recordings),
// immutable, browser hotlinkable, CORS-enabled, and usable in commercial games.
// Unavailable species use unique locally synthesized cues rather than a wrong animal's call.
const ANIMAL_VOCALS=Object.freeze({
 cat:["animal-cat-meow-34",1.0],dog:["animal-dog-bark-25",1],fox:["fox-01",1],
 wolf:["wolf-growl-01",1],deer:["deer-call-01",1],boar:["boar-grunt-02",1],
 crow:["crow-caw-01",1],pigeon:["pigeon-coo-01",1],
 macaque:["monkey-chatter-01",1],blackBear:["bear-growl-01",.97],
 serow:["goat-bleat-01",.92],manul:["animal-cat-meow-34",.78],
 tibetanFox:["fox-01",1.17],
 lion:["lion-roar-02",1],tiger:["short-tiger-roar-01",1],
 cheetah:["animal-cat-meow-34",1.25],elephant:["elephant-trumpet-01",1],
 hippo:["hippo-04",1],gorilla:["monkey-chatter-01",.72],
 zebra:["zebra-02",1],hyena:["hyena-laugh-10",1],
 wildDog:["animal-dog-bark-25",1.22],hedgehog:["hedgehog-07",1],
 armadillo:["hedgehog-07",.77]
});
const SYNTH_VOICE_SHAPES=Object.freeze({
 otter:[580,.25,"squeak"],carp:[210,.18,"bubble"],tanuki:[290,.35,"yip"],
 badger:[155,.28,"grumble"],shoebill:[740,.32,"clatter"],
 giraffe:[84,.56,"hum"]
});
const VOCAL_SOURCE="https://sfxmint.com/dl/";
const voiceBuffers=Object.create(null),voiceLoads=Object.create(null),voiceFailures=new Set();
const voicePlayedAt=Object.create(null);
function preloadAnimal(type){
 if(!enabled||!ANIMAL_VOCALS[type]||voiceBuffers[type]||voiceLoads[type]||voiceFailures.has(type))return false;
 const ac=ensure();if(!ac)return false;
 const [file]=ANIMAL_VOCALS[type],url=VOCAL_SOURCE+file+".mp3";
 // No remote fetch before the first user gesture; never block gameplay for audio.
 if(!started)return false;
 voiceLoads[type]=fetch(url,{mode:"cors",credentials:"omit"})
  .then(response=>{if(!response.ok)throw Error("animal vocal HTTP "+response.status);return response.arrayBuffer()})
  .then(bytes=>ac.decodeAudioData(bytes))
  .then(buffer=>{voiceBuffers[type]=buffer;return buffer})
  .catch(()=>{voiceFailures.add(type);return null})
  .finally(()=>{delete voiceLoads[type]});
 return true;
}
function synthAnimalVoice(type,intensity){
 if(!context||!sfxBus)return;
 const [base,length,style]=SYNTH_VOICE_SHAPES[type]||[165+(type.length*31)%260,.31,"grumble"];
 const start=context.currentTime,osc=context.createOscillator(),gain=context.createGain();
 const filter=context.createBiquadFilter();filter.type="lowpass";filter.frequency.value=style==="clatter"?1800:960;
 osc.type=style==="hum"?"sine":style==="bubble"?"sine":style==="clatter"?"square":"sawtooth";
 osc.frequency.setValueAtTime(base,start);
 for(let i=1;i<=5;i++){
  const t=start+length*i/5;
  const mult=style==="clatter"?(i%2?.76:1.75):style==="bubble"?(1+i*.09):style==="squeak"?(1.15-.09*i):1+Math.sin(i*2.4)*.16;
  osc.frequency.setValueAtTime(base*mult,t);
 }
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.linearRampToValueAtTime(.12*Math.min(1.4,intensity),start+.025);
 gain.gain.exponentialRampToValueAtTime(.0001,start+length);
 osc.connect(filter);filter.connect(gain);gain.connect(sfxBus);
 osc.start(start);osc.stop(start+length+.015);
 osc.onended=()=>{try{osc.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};
}
function playAnimal(type,options={}){
 if(!enabled||!type||!unlock()||!context||!sfxBus)return false;
 const current=context.currentTime,isUltimate=!!options.ultimate;
 if(current-(voicePlayedAt[type]??-100)<(isUltimate?.4:.9))return false;
 voicePlayedAt[type]=current;
 const buffer=voiceBuffers[type];
 if(!buffer){preloadAnimal(type);synthAnimalVoice(type,isUltimate?1.0:.55);return false;}
 try{
  const src=context.createBufferSource(),gain=context.createGain();
  src.buffer=buffer;
  const rate=(ANIMAL_VOCALS[type]?.[1]||1)*(isUltimate?.97:1.03);
  src.playbackRate.value=rate;
  gain.gain.value=isUltimate?.32:.18;
  src.connect(gain);gain.connect(sfxBus);
  src.start(0,0,Math.min(buffer.duration,isUltimate?2.0:1.10));
  src.onended=()=>{try{src.disconnect();gain.disconnect()}catch(_){}};
  return true;
 }catch(_){synthAnimalVoice(type,isUltimate?1:.55);return false;}
}

const names={explore:"ECHOES OF THE LOST CITY",forest:"RECLAIMED GREEN",danger:"THE HUNT",rain:"RAIN OVER TOKYO"};
const TRACKS=[
 {id:"default",name:"デフォルト｜環境連動"},
 {id:"rush",name:"廃都の残響｜静かなピアノ"},
 {id:"wild",name:"深緑の息吹｜自然と弦"},
 {id:"night",name:"獣の足音｜緊迫の低音"},
 {id:"dawn",name:"夜明けの地平｜広がる旋律"}
];
const TRACK_STORAGE_KEY="wild-reclaim-bgm-choice-v1";
function loadMusicChoice(){
 try{
  const id=localStorage.getItem(TRACK_STORAGE_KEY)||"default";
  return TRACKS.some(track=>track.id===id)?id:"default";
 }catch(_){return "default"}
}
let musicChoice=loadMusicChoice();
const MUSIC_LEVEL_KEY="wild-reclaim-bgm-volume-v1";
function loadMusicVolume(){try{const saved=localStorage.getItem(MUSIC_LEVEL_KEY);if(saved===null)return .55;const n=Number(saved);return Number.isFinite(n)&&n>=0&&n<=100?n/100:.55}catch(_){return .55}}
let musicVolume=loadMusicVolume();
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
  musicBus=context.createGain();musicBus.gain.value=.73*musicVolume;musicBus.connect(master);
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
// Generative original score: no repeated 16-second buffers. Each theme has an
// evolving 48-bar form (intro, two themes, rest, climax, reprise), plus varied
// motifs and optional notes on subsequent cycles. Quiet passages are deliberate.
const COMPOSITIONS={
 rush:{
  bpm:82,roots:[48,43,46,41,48,44,43,46],minor:true,
  scale:[0,2,3,5,7,8,10,12],
  motifs:[
   [0,-1,-1,2,3,-1,2,-1,4,-1,3,-1,2,-1,-1,-1],
   [-1,4,-1,3,2,-1,0,-1,-1,2,3,-1,4,-1,-1,-1],
   [0,-1,2,-1,4,-1,5,-1,3,-1,-1,2,0,-1,-1,-1]
  ],lead:"keys",bass:.14,leadLevel:.17,pad:.12,drum:.015
 },
 wild:{
  bpm:92,roots:[53,48,50,46,53,55,50,48],minor:false,
  scale:[0,2,4,5,7,9,11,12],
  motifs:[
   [0,-1,2,-1,4,-1,-1,3,2,-1,-1,-1,4,-1,2,-1],
   [4,-1,3,-1,2,-1,0,-1,-1,-1,1,2,-1,3,-1,-1],
   [-1,-1,4,-1,5,-1,3,-1,2,-1,-1,0,-1,-1,-1,-1]
  ],lead:"wood",bass:.12,leadLevel:.16,pad:.13,drum:0
 },
 night:{
  bpm:103,roots:[45,43,41,40,45,48,43,40],minor:true,
  scale:[0,2,3,5,7,8,10,12],
  motifs:[
   [0,-1,-1,-1,2,-1,3,-1,-1,-1,2,-1,0,-1,-1,-1],
   [-1,-1,4,-1,3,-1,-1,2,-1,-1,1,-1,2,-1,-1,-1],
   [0,-1,2,-1,-1,-1,3,-1,4,-1,-1,2,-1,-1,-1,-1]
  ],lead:"strings",bass:.17,leadLevel:.11,pad:.10,drum:.035
 },
 dawn:{
  bpm:76,roots:[48,53,45,43,48,50,53,55],minor:false,
  scale:[0,2,4,5,7,9,11,12],
  motifs:[
   [0,-1,-1,-1,2,-1,4,-1,-1,-1,3,-1,2,-1,-1,-1],
   [-1,-1,4,-1,5,-1,-1,-1,3,-1,2,-1,-1,0,-1,-1],
   [2,-1,-1,4,-1,-1,5,-1,-1,4,-1,3,2,-1,-1,-1]
  ],lead:"keys",bass:.11,leadLevel:.15,pad:.18,drum:0
 }
};
function pitch(midi){return 440*Math.pow(2,(midi-69)/12)}
let composer=null;
function composerVoice(bus,midi,when,duration,kind,volume){
 if(!context||!bus||volume<=0)return;
 const osc=context.createOscillator(),gain=context.createGain(),filter=context.createBiquadFilter();
 const freq=pitch(midi),start=Math.max(when,context.currentTime),end=start+Math.max(.16,duration);
 osc.type=kind==="strings"?"sawtooth":kind==="wood"?"triangle":kind==="bass"?"sine":"triangle";
 osc.frequency.setValueAtTime(freq,start);
 filter.type="lowpass";
 filter.frequency.value=kind==="strings"?680:kind==="bass"?520:kind==="wood"?1650:1250;
 filter.Q.value=.7;
 const attack=kind==="strings"?.24:kind==="pad"?.40:kind==="bass"?.035:.022;
 gain.gain.setValueAtTime(.00001,start);
 gain.gain.linearRampToValueAtTime(Math.max(.0001,volume),start+Math.min(attack,duration*.35));
 gain.gain.exponentialRampToValueAtTime(.0001,end);
 osc.connect(filter);filter.connect(gain);gain.connect(bus);
 osc.start(start);osc.stop(end+.03);
 osc.onended=()=>{try{osc.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};
}
function composerPercussion(bus,when,kind,amount){
 if(!context||!bus||amount<=0)return;
 const osc=context.createOscillator(),gain=context.createGain(),start=Math.max(when,context.currentTime);
 osc.type="sine";
 osc.frequency.setValueAtTime(kind==="low"?90:185,start);
 osc.frequency.exponentialRampToValueAtTime(kind==="low"?43:90,start+.15);
 gain.gain.setValueAtTime(Math.max(.0001,amount),start);
 gain.gain.exponentialRampToValueAtTime(.0001,start+.18);
 osc.connect(gain);gain.connect(bus);osc.start(start);osc.stop(start+.20);
 osc.onended=()=>{try{osc.disconnect();gain.disconnect()}catch(_){}};
}
function composerStep(c,when){
 const p=COMPOSITIONS[c.id],step=c.step++,bar=Math.floor(step/8),
  beat=step%8,section=Math.floor(bar/8)%6,phrase=Math.floor(bar/2);
 const root=p.roots[bar%p.roots.length];
 const main=section===1||section===2||section===4;
 const subdued=section===0?.47:section===3?.30:section===5?.52:section===4?1.0:.76;
 const variation=Math.floor(bar/48)%4;
 const chord=[0,p.minor?3:4,7];
 const beatSecs=60/p.bpm;
 if(beat===0){
  // Harmonic space between notes prevents the exhausting constant 8th-note loop.
  if(bar%2===0||section===4){
   const padVolume=p.pad*subdued*(section===4?1.1:.85);
   chord.forEach((interval,index)=>{
    composerVoice(c.bus,root+12+interval+((section===4&&index===2)?12:0),
      when,beatSecs*(section===3?5.6:6.7),"strings",padVolume*(index===1?.75:1));
   });
  }
  if(section!==3||bar%2===0)composerVoice(c.bus,root-12,when,beatSecs*2.25,"bass",p.bass*subdued);
 }
 if(beat===4&&section!==0&&section!==3){
  composerVoice(c.bus,root-5,when,beatSecs*1.3,"bass",p.bass*.47*subdued);
 }
 const motif=p.motifs[(phrase+Math.floor(bar/8)+variation)%p.motifs.length];
 const degree=motif[step%16];
 if(degree>=0&&section!==3&&(!(!main&&Math.random()<.40))&&
    !(bar%16===15&&beat>=4)){
  // Variations stay in the song's scale, avoiding harsh chromatic surprises.
  let noteIndex=Math.max(0,Math.min(7,degree));
  if(Math.random()<.10&&main)noteIndex=clamp(noteIndex+(Math.random()<.5?1:-1),0,7);
  const melody=root+24+p.scale[noteIndex]+(section===4?12:0);
  const accent=(beat===0||beat===4)?1:.75;
  composerVoice(c.bus,melody,when,beatSecs*(p.lead==="strings"?1.8:1.25),
    p.lead,p.leadLevel*subdued*accent*(.80+Math.random()*.33));
 }
 // Sparse restrained heartbeat on the hunting cue, not relentless dance drums.
 if(p.drum&&section!==3&&section!==0&&(beat===0||beat===4)){
  composerPercussion(c.bus,when,"low",p.drum*subdued);
 }
}
function composerTick(c){
 if(!context||composer!==c)return;
 const now=context.currentTime;
 if(c.nextAt<now-.45)c.nextAt=now+.04; // Browser background throttling.
 const eighth=30/COMPOSITIONS[c.id].bpm;
 let scheduled=0;
 while(c.nextAt<=now+.34&&scheduled++<5){
  composerStep(c,c.nextAt);
  c.nextAt+=eighth;
 }
}
function stopComposer(){
 if(!composer)return;
 const old=composer;composer=null;
 clearInterval(old.timer);
 if(context){
  const t=context.currentTime;
  old.bus.gain.cancelScheduledValues(t);
  old.bus.gain.setTargetAtTime(0,t,.11);
  // Let the end of scheduled notes ring out before disconnecting the old bus.
  setTimeout(()=>{try{old.bus.disconnect()}catch(_){}},1800);
 }else try{old.bus.disconnect()}catch(_){}
}
function ensureExtraTrack(id){
 if(!COMPOSITIONS[id]||!started||!context||!musicBus)return false;
 if(composer?.id===id)return true;
 stopComposer();
 const bus=context.createGain();bus.gain.value=0;bus.connect(musicBus);
 const c={id,bus,step:0,nextAt:context.currentTime+.08,timer:null};
 composer=c;
 c.timer=setInterval(()=>composerTick(c),95);
 composerTick(c);
 return true;
}
function composerMix(mode){
 if(!composer||!context)return;
 const target=musicChoice===composer.id?
   (mode==="guide"||mode==="dying"?0:mode==="pause"?.36:mode!=="play"?.12:.82):0;
 composer.bus.gain.setTargetAtTime(target,context.currentTime,.19);
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
function getMusicChoice(){return musicChoice}
function setMusicChoice(id){
 if(!TRACKS.some(track=>track.id===id))return false;
 musicChoice=id;
 try{localStorage.setItem(TRACK_STORAGE_KEY,id)}catch(_){}
 if(id==="default")stopComposer();
 if(enabled)unlock();
 if(started&&id!=="default")ensureExtraTrack(id);
 if(started&&enabled)update(scene);
 return true;
}
function setMusicVolume(value){
 const n=Number(value);if(!Number.isFinite(n))return getMusicVolume();
 musicVolume=clamp(n,0,100)/100;
 try{localStorage.setItem(MUSIC_LEVEL_KEY,String(Math.round(musicVolume*100)))}catch(_){}
 if(context&&musicBus&&!deathFade)musicBus.gain.setTargetAtTime(.73*musicVolume,context.currentTime,.12);
 return getMusicVolume();
}
function getMusicVolume(){return Math.round(musicVolume*100)}
function update(conditions){
 scene=conditions||scene;
 if(!started||!context||!enabled)return;
 const area=Number(scene.area||0),danger=!!scene.danger,storm=scene.weather==="THUNDER",rain=scene.weather==="RAIN"||storm;
 const forest=area===5||area===2||area===4,clock=context.currentTime;
 const paused=scene.mode&&scene.mode!=="play",mix=scene.mode==="guide"?0:paused?.12:1;
 const defaultMix=musicChoice==="default"?1:0;
 const targets={
  explore:(danger?.06:forest?.14:.60)*mix*defaultMix,
  forest:(danger?.06:forest?.65:.04)*mix*defaultMix,
  danger:(danger?.64:storm?.17:.012)*mix*defaultMix,
  wind:(scene.weather==="WIND"?.61:scene.weather==="FOG"?.28:.21)*mix,
  forestWind:(forest?.37:.04)*mix,
  rain:(storm?.72:rain?.51:0)*mix,
   water:clamp(Number(scene.waterNear)||0,0,1)*.77*mix
 };
 if(musicChoice!=="default"&&!composer)ensureExtraTrack(musicChoice);
 composerMix(scene.mode||"play");
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
 musicBus?.gain.setTargetAtTime(.73*musicVolume,t,.14);
 atmosBus?.gain.setTargetAtTime(.50,t,.14);
 sfxBus?.gain.setTargetAtTime(.32,t,.14);
}
function setEnabled(on){
 enabled=!!on;
 if(!enabled&&context&&master)master.gain.setTargetAtTime(0,context.currentTime,.1);
 if(enabled){unlock();if(context&&master)master.gain.setTargetAtTime(.82,context.currentTime,.18);update(scene)}
 return enabled;
}
window.WildAudio={unlock,update,play,playAnimal,preloadAnimal,setEnabled,setMusicChoice,getMusicChoice,setMusicVolume,getMusicVolume,
 tracks:TRACKS.map(t=>({...t})),fadeForDeath,resetDeathFade,get active(){return started},get enabled(){return enabled},
 get soundtrack(){return musicChoice==="default"?names[scene.danger?"danger":Number(scene.area)===5?"forest":"explore"]:TRACKS.find(t=>t.id===musicChoice)?.name||names.explore}};
})();