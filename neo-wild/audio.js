/* WILD RECLAIM -- original adaptive soundtrack, local ambience and optional animal samples.
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
 giraffe:[84,.56,"hum"],crocodile:[105,.40,"grumble"],penguin:[560,.24,"squeak"],rhino:[115,.56,"grumble"]
});
const voiceAlias={strayCat:"cat",wildFox:"fox",alpha:"wolf",oneEyedWolf:"wolf",albinoWolf:"wolf",whiteTiger:"tiger",oldBear:"blackBear",giantBoar:"boar",giantLion:"lion",giantHyena:"hyena",giantElephant:"elephant",giantHippo:"hippo",giantGorilla:"gorilla",giantCrocodile:"crocodile",giantSnake:"snake",giantAnaconda:"snake",venomSnake:"snake",giantLizard:"crocodile",raccoonDog:"tanuki",mountainGoat:"serow",chimpanzee:"macaque",blackPanther:"tiger",giantMoose:"deer"};
const localCalls={
 cat:[510,.40,"yowl"],manul:[265,.28,"grumble"],dog:[194,.23,"bark"],wildDog:[320,.18,"bark"],wolf:[190,.78,"yowl"],
 fox:[610,.27,"yip"],tibetanFox:[450,.28,"yip"],crow:[340,.33,"bark"],pigeon:[310,.52,"hum"],
 elephant:[295,.65,"yowl"],zebra:[270,.36,"yip"],hyena:[405,.38,"chatter"],macaque:[620,.32,"chatter"],
 frog:[185,.26,"croak"],giantTreeFrog:[145,.36,"croak"],pacmanFrog:[93,.33,"croak"],snake:[820,.37,"hiss"],
 lion:[88,.70,"grumble"],tiger:[108,.60,"grumble"],gorilla:[92,.48,"grumble"],blackBear:[98,.51,"grumble"],
 deer:[455,.49,"yowl"],serow:[290,.39,"chatter"],boar:[105,.30,"croak"],hippo:[76,.54,"croak"],
 armadillo:[190,.22,"grumble"],hedgehog:[370,.15,"hiss"],cheetah:[700,.18,"squeak"],giantEagle:[810,.48,"yowl"],
 giantBuffalo:[103,.58,"hum"],rat:[960,.12,"squeak"],rabbit:[690,.14,"squeak"],weasel:[760,.21,"chatter"],worldEnd:[58,.78,"grumble"]
};
const VOCAL_SOURCE="https://sfxmint.com/dl/";
const voiceBuffers=Object.create(null),voiceLoads=Object.create(null),voiceFailures=new Set();
const voicePlayedAt=Object.create(null);
function preloadAnimal(type){
 type=voiceAlias[type]||type;
 const file=ANIMAL_VOCALS[type]?.[0];
 if(!enabled||!file||voiceBuffers[file]||voiceLoads[file]||voiceFailures.has(file)||Object.keys(voiceLoads).length>=2)return false;
 const ac=ensure();if(!ac)return false;
 const url=VOCAL_SOURCE+file+".mp3";
 // No remote fetch before the first user gesture; never block gameplay for audio.
 if(!started)return false;
 voiceLoads[file]=fetch(url,{mode:"cors",credentials:"omit"})
  .then(response=>{if(!response.ok)throw Error("animal vocal HTTP "+response.status);return response.arrayBuffer()})
  .then(bytes=>ac.decodeAudioData(bytes))
  .then(buffer=>{voiceBuffers[file]=buffer;return buffer})
  .catch(()=>{voiceFailures.add(file);return null})
  .finally(()=>{delete voiceLoads[file]});
 return true;
}
function synthAnimalVoice(type,intensity){
 if(!context||!sfxBus)return;
 const [base,length,style]=SYNTH_VOICE_SHAPES[type]||localCalls[type]||[165+(type.length*31)%260,.31,"grumble"];
 const start=context.currentTime,osc=context.createOscillator(),gain=context.createGain();
 const filter=context.createBiquadFilter();filter.type=style==="hiss"?"highpass":"lowpass";
 filter.frequency.value=style==="hiss"?1800:style==="clatter"?2400:style==="yowl"?1500:960;
 osc.type=style==="hum"?"sine":style==="bubble"?"sine":style==="clatter"?"square":"sawtooth";
 osc.frequency.setValueAtTime(base,start);
 for(let i=1;i<=5;i++){
  const t=start+length*i/5;
  const mult=style==="yowl"?1+.48*Math.sin(i*Math.PI/5):style==="bark"?1.55-i*.21:style==="clatter"?(i%2?.76:1.75):style==="bubble"?(1+i*.09):style==="squeak"?(1.15-.09*i):1+Math.sin(i*2.4)*.16;
  osc.frequency.exponentialRampToValueAtTime(base*mult,t);
 }
 gain.gain.setValueAtTime(.0001,start);
 gain.gain.linearRampToValueAtTime(.12*Math.min(1.4,intensity),start+.025);
 if(["clatter","croak","chatter"].includes(style)){
  for(let k=1;k<5;k++){
   const t=start+length*k/5;
   gain.gain.linearRampToValueAtTime(.002,t);
   gain.gain.linearRampToValueAtTime(.115*intensity,t+.009);
  }
 }
 gain.gain.exponentialRampToValueAtTime(.0001,start+length);
 let source=osc;
 if(style==="hiss"){
  source=context.createBufferSource();source.buffer=loopSources.wind.buffer;
  source.playbackRate.value=.8+rand()*.4;
 }
 source.connect(filter);filter.connect(gain);gain.connect(sfxBus);
 source.start(start);source.stop(start+length+.015);
 source.onended=()=>{try{source.disconnect();filter.disconnect();gain.disconnect()}catch(_){}};

}
function playAnimal(type,options={}){
 if(!enabled||!type||!unlock()||!context||!sfxBus)return false;
 type=voiceAlias[type]||type;
 const current=context.currentTime,isUltimate=!!options.ultimate;
 if(current-lastCallAt<(isUltimate?.18:.38))return false;
 const level=clamp(options.level??1,.05,1);
 if(current-(voicePlayedAt[type]??-100)<(isUltimate?.4:.9))return false;
 voicePlayedAt[type]=current;lastCallAt=current;
 const buffer=voiceBuffers[ANIMAL_VOCALS[type]?.[0]];
 if(!buffer){preloadAnimal(type);synthAnimalVoice(type,(isUltimate?1.0:.70)*level);return true;}
 try{
  const src=context.createBufferSource(),gain=context.createGain();
  src.buffer=buffer;
  const rate=(ANIMAL_VOCALS[type]?.[1]||1)*(isUltimate?.97:1.03);
  src.playbackRate.value=rate;
  const duration=Math.min(buffer.duration,isUltimate?2:1.1)/rate;
  const peak=(isUltimate?.36:.24)*level;
  gain.gain.setValueAtTime(.0001,current);
  gain.gain.linearRampToValueAtTime(peak,current+Math.min(.012,duration*.2));
  gain.gain.setValueAtTime(peak,current+duration*.78);
  gain.gain.linearRampToValueAtTime(.0001,current+duration);
  src.connect(gain);gain.connect(sfxBus);
  src.start(0,0,Math.min(buffer.duration,isUltimate?2.0:1.10));
  src.onended=()=>{try{src.disconnect();gain.disconnect()}catch(_){}};
  return true;
 }catch(_){synthAnimalVoice(type,isUltimate?1:.55);return false;}
}


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
let enabled=true,started=false,scene={weather:"CLEAR",area:0,danger:false,mode:"menu"},lastAmbient=-1,deathFade=false;
let lastCallAt=-100,lastThemeChange=-100,musicFocus=null;
let rngState=1289431;
function rand(){rngState=(Math.imul(rngState,1664525)+1013904223)>>>0;return rngState/4294967296;}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function ensure(){
 if(context)return context;
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;
 try{
  context=new C({latencyHint:"interactive"});
  master=context.createGain();master.gain.value=enabled?.82:0;master.connect(context.destination);
  musicBus=context.createGain();musicBus.gain.value=.73*musicVolume;musicFocus=context.createGain();musicBus.connect(musicFocus);musicFocus.connect(master);
  atmosBus=context.createGain();atmosBus.gain.value=.23;atmosBus.connect(musicFocus);
  sfxBus=context.createGain();sfxBus.gain.value=.48;sfxBus.connect(master);
  return context;
 }catch(_){context=null;return null}
}
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
 if(kind==="keys"||kind==="wood"){
  filter.frequency.setValueAtTime(kind==="keys"?2500:1850,start);
  filter.frequency.exponentialRampToValueAtTime(kind==="keys"?590:780,start+duration*.65);
 }
 if(kind==="strings"){
  osc.detune.setValueAtTime(-6,start);
  osc.detune.linearRampToValueAtTime(2,start+duration*.42);
 }
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
 if(!context||composer!==c||!enabled||deathFade||context.state==="suspended"||scene.mode==="guide")return;
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
 const c={id,bus,step:musicChoice==="default"&&id==="night"?64:0,nextAt:context.currentTime+.08,timer:null};
 composer=c;
 c.timer=setInterval(()=>composerTick(c),95);
 composerTick(c);
 return true;
}
function composerMix(mode){
 if(!composer||!context)return;
 const target=(musicChoice==="default"||musicChoice===composer.id)?
   (mode==="guide"||mode==="dying"?0:mode==="pause"?.36:mode!=="play"?.12:.82):0;
 composer.bus.gain.setTargetAtTime(target,context.currentTime,.19);
}
function startAtmos(){
 const sr=16000,noise=context.createBuffer(1,sr*2,sr),data=noise.getChannelData(0);
 for(let i=0;i<data.length;i++)data[i]=rand()*2-1;
 for(const [name,kind,hz,pulse,depth] of [
  ["wind","lowpass",510,.13,.38],["leaves","bandpass",2750,.27,.63],
  ["rain","highpass",1350,.41,.12],["water","bandpass",880,.63,.29],
  ["fire","highpass",2400,3.1,.64]
 ]){
  const src=context.createBufferSource(),filter=context.createBiquadFilter();
  const gain=context.createGain(),swirl=context.createGain(),rate=context.createOscillator(),mod=context.createGain();
  src.buffer=noise;src.loop=true;src.playbackRate.value=name==="leaves"?1.21:name==="water"?.84:1;
  filter.type=kind;filter.frequency.value=hz;filter.Q.value=.64;
  rate.frequency.value=pulse;mod.gain.value=depth;swirl.gain.value=1-depth*.45;
  rate.connect(mod);mod.connect(swirl.gain);src.connect(filter);filter.connect(swirl);
  swirl.connect(gain);gain.connect(atmosBus);gain.gain.value=0;
  rate.start();src.start(0,rand()*1.9);loopGains[name]=gain;loopSources[name]=src;
 }
 const motor=context.createOscillator(),wobble=context.createOscillator(),depth=context.createGain(),gain=context.createGain();
 motor.type="triangle";motor.frequency.value=102;wobble.frequency.value=3.3;depth.gain.value=5;
 wobble.connect(depth);depth.connect(motor.frequency);motor.connect(gain);gain.connect(atmosBus);
 gain.gain.value=0;motor.start();wobble.start();loopGains.ufo=gain;loopSources.ufo=motor;
}
function sample(name){
 const sr=22050;
 const lengths={warning:.21,warp:.56,beam:.37,evade:.19,perfect:.40,firePop:.12,quake:1.1,ghost:.8,stepSnow:.18,step:.11,stepHard:.14,stepWater:.19,bite:.27,rake:.18,tapStrike:.13,wing:.33,jump:.27,attack:.24,impact:.38,howl:1.35,thunder:2.6,collect:.18,menu:.13,damage:.38,snarl:.65,rustle:.36,land:.24,death:1.4,level:.70};
 const duration=lengths[name]||.22,len=Math.ceil(sr*duration),buf=context.createBuffer(1,len,sr),a=buf.getChannelData(0);
 let low=0,mid=0;
 for(let i=0;i<len;i++){
  const t=i/sr,u=i/len,n=rand()*2-1;
  low=.968*low+.032*n;mid=.62*mid+.38*n;
  const env=Math.pow(Math.max(0,1-u),name==="thunder"?.9:2.5);
  let v=0;
  switch(name){
   case "warp":v=(Math.sin(6.283*(520-400*u)*t)+.31*Math.sin(6.283*(820-560*u)*t))*.27*Math.sin(Math.PI*u)+mid*.12;break;
   case "beam":v=(Math.sin(6.283*(280+170*u)*t)+.24*Math.sin(6.283*840*t))*(.15+.14*Math.sin(t*39)**2);break;
   case "warning":v=.29*Math.sin(6.283*(232+82*u)*t)+.24*mid*Math.exp(-t*22);break;
   case "evade":v=(n-mid)*.44*Math.sin(Math.PI*u)**2+low*.35;break;
   case "perfect":v=.30*Math.sin(6.283*780*t)+.19*Math.sin(6.283*1170*t)*Math.min(1,t*25)+(n-mid)*.18*Math.exp(-t*45);break;
   case "firePop":v=(n-mid)*.8*Math.exp(-u*28)+mid*.18;break;
   case "ghost":v=.19*(Math.sin(6.283*(241-58*u)*t)+Math.sin(6.283*(252-65*u)*t))*Math.sin(Math.PI*u);break;
   case "quake":v=low*2.7+mid*.15*Math.cos(t*21)**8+Math.sin(6.283*72*t)*.16;break;
   case "stepSnow":v=(mid*.66+(n-mid)*.19)*(.28+.72*Math.sin(15*u)**2);break;
   case "step":v=mid*.36+low*.38+Math.sin(2*Math.PI*(93-40*u)*t)*.13;break;
   case "stepWater":v=(n-mid)*.37*Math.exp(-u*12)+mid*.4+Math.sin(2*Math.PI*(185+220*u)*t)*.12;break;
   case "stepHard":v=mid*.55+low*.16+Math.sin(2*Math.PI*(130-70*u)*t)*.13;break;
   case "bite":v=mid*.57+low*.19+Math.sin(2*Math.PI*(280-180*u)*t)*.18;break;
   case "rake":v=(n-mid)*.35*(.38+.62*Math.cos(u*9)**2)+low*.12;break;
   case "tapStrike":v=mid*.42*Math.exp(-u*8)+Math.sin(2*Math.PI*(650-300*u)*t)*.26;break;
   case "wing":v=mid*.26*Math.sin(u*Math.PI*4)**2+low*.3;break;
   case "jump":v=low*.32+mid*.12+Math.sin(2*Math.PI*(122-64*u)*t)*.055;break;
   case "attack":v=mid*.62+low*.23+Math.sin(2*Math.PI*(170-90*u)*t)*.1;break;
   case "impact":v=low*.62+mid*.23+Math.sin(2*Math.PI*(110-75*u)*t)*.31;break;
   case "howl":v=(Math.sin(2*Math.PI*(165+90*Math.sin(u*Math.PI))*t)+.33*Math.sin(2*Math.PI*(330+180*Math.sin(u*Math.PI))*t)+mid*.07)*Math.sin(u*Math.PI)*.65;break;
   case "snarl":v=mid*.28+low*.30+Math.sin(2*Math.PI*(85+40*Math.sin(t*16))*t)*.3;break;
   case "thunder":{
    const roll=Math.exp(-2.1*Math.abs(t-.43))+.64*Math.exp(-3*Math.abs(t-1.22));
    v=(n-mid)*.83*Math.exp(-t*48)+mid*.38*Math.exp(-t*9)+roll*(low*2.6+.19*Math.sin(6.283*(76-9*t)*t));break;
   }
   case "menu":v=Math.sin(2*Math.PI*480*t)*.17*Math.exp(-t*22)+mid*.09;break;
   case "collect":v=(Math.sin(2*Math.PI*610*t)+.7*Math.sin(2*Math.PI*915*t)*Math.min(1,t*26))*.18;break;
   case "damage":v=low*.47+mid*.33+Math.sin(2*Math.PI*(130-75*u)*t)*.19;break;
   case "land":v=mid*.45+low*.4;break;
   case "rustle":v=mid*.25+low*.40;break;
   case "level":v=Math.sin(2*Math.PI*(220+220*u)*t)*.18+Math.sin(2*Math.PI*(330+110*u)*t)*.09;break;
   case "death":v=low*.28+Math.sin(2*Math.PI*(130-82*u)*t)*.22;break;
   default:v=mid*.30+low*.20;
  }
  a[i]=clamp(v*env*Math.min(1,i/32),-1,1);
 }
 return buf;
}
function unlock(){
 const ac=ensure();if(!ac||!enabled)return false;
 if(ac.state==="suspended")ac.resume().catch(()=>{});
 if(started)return true;
 try{
  startAtmos();started=true;update(scene);
  return true;
 }catch(e){console.warn("WILD RECLAIM audio init:",e);return false}
}
function getMusicChoice(){return musicChoice}
function setMusicChoice(id){
 if(!TRACKS.some(track=>track.id===id))return false;
 musicChoice=id;
 try{localStorage.setItem(TRACK_STORAGE_KEY,id)}catch(_){}
 lastThemeChange=-100;
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
 const previous=scene;scene=conditions||scene;
 if(!started||!context||!enabled)return;
 const area=Number(scene.area||0),danger=!!scene.danger,storm=scene.weather==="THUNDER",rain=scene.weather==="RAIN"||storm;
 const forest=area===5||area===2||area===4,clock=context.currentTime;
 const paused=scene.mode&&scene.mode!=="play";
 if(!paused){
  if(scene.ufoNear>.05&&scene.ufoStage!==previous.ufoStage&&["warp-in","depart"].includes(scene.ufoStage))play("warp",{volume:.28*scene.ufoNear});
  if(scene.ufoLock&&!previous.ufoLock)play("beam",{volume:.28});
  if(scene.quake&&!previous.quake)play("quake",{volume:.3});
 }
 const outdoors=scene.indoors?.24:1;
 const canopy=scene.trees??(forest?.7:.06);
 const gust=scene.weather==="WIND"||storm;
 const targets={
  wind:(gust?.42:scene.weather==="SNOW"?.22:.095)*outdoors,
  leaves:canopy*(gust?.31:.15)*outdoors,
  rain:(storm?.27:rain?.19:0)*outdoors,
  water:clamp(Number(scene.waterNear)||0,0,1)*.34,
  fire:(scene.fire||0)*.17,ufo:(scene.ufoNear||0)*.14
 };
 const theme=musicChoice!=="default"?musicChoice:danger||scene.ufoLock?"night":forest||canopy>.6?"wild":rain?"rush":"dawn";
 if(!composer||theme!==composer.id&&(musicChoice!=="default"||clock-lastThemeChange>5||theme==="night")){
  ensureExtraTrack(theme);lastThemeChange=clock;
 }
 composerMix(scene.mode||"play");
 loopSources.ufo.frequency.setTargetAtTime(scene.ufoLock?169:94,clock,.18);
 for(const [name,value] of Object.entries(targets))loopGains[name].gain.setTargetAtTime(paused?0:value,clock,name==="ufo"?.17:.6);
 if(!paused&&clock-lastAmbient>6){
  lastAmbient=clock+rand()*4;
  if(scene.fire>.15)play("firePop",{volume:.14*scene.fire});
  else if(scene.wildlife&&!danger&&!storm)playAnimal(scene.wildlife.type,{level:scene.wildlife.level});
 }
}
const activeEffects=new Set(),effectTime=Object.create(null);
const important=new Set(["thunder","beam","warp","perfect","warning","damage","death","quake"]);
function play(name,options={}){
 if(!enabled||!unlock())return;
 try{
  const now=context.currentTime,priority=important.has(name);
  if(now-(effectTime[name]??-100)<(priority?.09:.055)||activeEffects.size>=(priority?12:8))return;
  effectTime[name]=now;
  const buf=effectBuffers[name]||(effectBuffers[name]=sample(name));
  const source=context.createBufferSource(),gain=context.createGain();
  source.buffer=buf;source.playbackRate.value=options.rate||(.95+rand()*.10);
  // Preserve music and weather beds. Foreground effects are subdued; jump in
  // particular is a quiet low thump. Never let call-site volume override caps.
  const step=name==="step"||name==="stepHard"||name==="stepWater"||name==="stepSnow";
  const quietCap={
   jump:.07,land:.08,attack:.13,bite:.12,rake:.12,tapStrike:.12,impact:.12,
   howl:.18,snarl:.16,damage:.24,thunder:.62,death:.24,perfect:.34,beam:.32,warp:.30,quake:.32
  }[name]??.17;
  const asked=options.volume===undefined?.14:options.volume;
  gain.gain.value=step?Math.min(asked,.055):Math.min(asked,quietCap);
  if(priority&&!deathFade){
   musicFocus.gain.cancelScheduledValues(now);
   musicFocus.gain.setTargetAtTime(.55,now,.025);
   musicFocus.gain.setTargetAtTime(1,now+.20,.22);
  }
  source.connect(gain);gain.connect(sfxBus);source.start();activeEffects.add(source);
  source.onended=()=>{activeEffects.delete(source);try{source.disconnect();gain.disconnect()}catch(_){}};
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
 musicBus?.gain.setTargetAtTime(0,t+.48,.28);
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
 atmosBus?.gain.setTargetAtTime(.23,t,.14);
 sfxBus?.gain.setTargetAtTime(.48,t,.14);
}
function setEnabled(on){
 enabled=!!on;
 if(!enabled&&context&&master)master.gain.setTargetAtTime(0,context.currentTime,.1);
 if(enabled){unlock();if(context&&master)master.gain.setTargetAtTime(.82,context.currentTime,.18);update(scene)}
 return enabled;
}
window.WildAudio={unlock,update,play,playAnimal,preloadAnimal,setEnabled,setMusicChoice,getMusicChoice,setMusicVolume,getMusicVolume,
 tracks:TRACKS.map(t=>({...t})),fadeForDeath,resetDeathFade,get active(){return started},get enabled(){return enabled},
 get soundtrack(){return TRACKS.find(t=>t.id===(musicChoice==="default"?composer?.id:musicChoice))?.name||TRACKS[0].name}};
})();