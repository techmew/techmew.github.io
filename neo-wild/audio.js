/* WILD RECLAIM -- original adaptive soundtrack and wildlife/urban sound design.
 * No remote samples, royalty-restricted music, or repeating single-note beeps.
 * Runs locally with Web Audio and works offline after the script is cached.
 */
(()=>{"use strict";
const names={explore:"ECHOES OF THE LOST CITY",forest:"RECLAIMED GREEN",danger:"THE HUNT",rain:"RAIN OVER TOKYO"};
let context=null,master=null,musicBus=null,atmosBus=null,sfxBus=null,loopSources={},loopGains={},effectBuffers={};
let enabled=true,started=false,scene={weather:"CLEAR",area:0,danger:false},lastAmbient=-1;
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
  sfxBus=context.createGain();sfxBus.gain.value=.45;sfxBus.connect(master);
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
function buildAtmos(name){
 const seconds=8;
 return loopBuffer(seconds,(t,ch,low,hi)=>{
  if(name==="wind")return low*(.85+.15*Math.sin(t*.8+ch))*.45+hi*.013;
  if(name==="rain")return hi*.15+low*.24+Math.max(0,Math.sin(t*67))*hi*.06;
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
   case "jump":v=mid*.3+Math.sin(2*Math.PI*(125+210*u)*t)*.13;break;
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
  started=true;return true;
 }catch(e){console.warn("WILD RECLAIM audio init:",e);return false}
}
function update(conditions){
 if(!started||!context||!enabled)return;
 scene=conditions||scene;
 const area=Number(scene.area||0),danger=!!scene.danger,storm=scene.weather==="THUNDER",rain=scene.weather==="RAIN"||storm;
 const forest=area===5||area===2||area===4,clock=context.currentTime;
 const paused=scene.mode&&scene.mode!=="play",mix=paused?.12:1;
 const targets={
  explore:(danger?.06:forest?.14:.60)*mix,
  forest:(danger?.06:forest?.65:.04)*mix,
  danger:(danger?.64:storm?.17:.012)*mix,
  wind:(scene.weather==="WIND"?.61:scene.weather==="FOG"?.28:.21)*mix,
  forestWind:(forest?.37:.04)*mix,
  rain:(storm?.72:rain?.51:0)*mix
 };
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
  // Steps are background foley, not foreground SFX. Keep them quiet even if callers use a larger gain.
  const step=name==="step"||name==="stepHard";
  gain.gain.value=step?Math.min(options.volume===undefined?.055:options.volume,.06):(options.volume===undefined?.33:options.volume);
  source.connect(gain);gain.connect(sfxBus);source.start();
  source.onended=()=>{try{source.disconnect();gain.disconnect()}catch(_){}};
 }catch(_){}
}
function setEnabled(on){
 enabled=!!on;
 if(!enabled&&context&&master)master.gain.setTargetAtTime(0,context.currentTime,.1);
 if(enabled){unlock();if(context&&master)master.gain.setTargetAtTime(.82,context.currentTime,.18)}
 return enabled;
}
window.WildAudio={unlock,update,play,setEnabled,get active(){return started},get enabled(){return enabled},
 get soundtrack(){return names[scene.danger?"danger":Number(scene.area)===5?"forest":"explore"]}};
})();