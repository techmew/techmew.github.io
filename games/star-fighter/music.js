/* STAR FIGHTER — original cyber techno BGM; generated with Web Audio, no third-party music. */
(()=>{'use strict';
const ROOT=[[40,35,37,33],[30,27,30,28],[31,27,29,26],[33,36,29,31],[29,32,25,27],[33,28,30,26],[29,24,31,27],[28,31,26,24]],
ARP=[[0,4,7,11,12,16,19,23],[0,3,6,10,12,15,18,22],[0,3,7,10,12,15,19,22],[0,5,7,10,12,17,19,22],[0,3,7,12,15,19,22,24],[0,3,7,10,15,19,22,27],[0,1,6,10,13,18,19,25],[0,7,12,17,19,24,29,31]],
LEAD=[[0,4,7,12,11,7,4,7,12,16,14,11,7,4,7,11],
[0,3,6,0,10,6,3,0,12,10,6,3,15,10,6,3],
[0,0,12,10,7,0,6,3,0,7,10,6,3,0,3,0],[0,7,12,19,17,12,7,5,0,10,17,22,19,17,12,7],[0,7,12,7,3,0,7,12,15,12,7,3,0,3,7,12],[0,3,7,10,7,3,0,5,12,10,7,3,15,12,10,7],[0,6,1,10,13,6,0,18,12,1,10,6,19,13,6,0],[0,7,12,19,24,19,12,7,0,5,12,17,24,19,12,7]],
BOSS_LEAD=[[12,16,19,23,24,19,16,12,19,23,26,24,23,19,16,12],
[12,15,18,22,24,18,15,12,18,22,25,24,22,18,15,12],
[12,15,19,22,24,22,19,15,12,19,22,24,27,24,19,15],[12,19,24,26,24,19,17,12,19,24,29,26,24,22,19,17],[12,19,24,31,27,24,19,15,12,22,27,31,29,24,19,17],[12,15,19,22,24,19,15,12,22,26,24,19,27,24,19,15],[12,18,19,25,27,19,18,12,25,31,27,19,30,25,19,18],[12,19,24,31,36,31,24,19,12,17,24,29,36,31,24,19]];
const hz=m=>440*Math.pow(2,(m-69)/12);
class CyberBGM{
constructor(a){this.a=a;this.stage=0;this.boss=false;this.step=0;this.next=0;this.running=false;this.enabled=true;this.master=a.createGain();this.master.gain.value=.21;const comp=a.createDynamicsCompressor();comp.threshold.value=-22;comp.ratio.value=4;comp.attack.value=.008;comp.release.value=.18;this.master.connect(comp);comp.connect(a.destination);const delay=a.createDelay(1),fb=a.createGain(),wet=a.createGain();delay.delayTime.value=.245;fb.gain.value=.23;wet.gain.value=.15;delay.connect(fb);fb.connect(delay);delay.connect(wet);wet.connect(this.master);this.delay=delay;this.noise=a.createBuffer(1,Math.floor(a.sampleRate*.9),a.sampleRate);const d=this.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}
setEnabled(on){this.enabled=on;const t=this.a.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(on?.21:0,t,.045);if(!on)this.running=false}
start(){this.running=true;this.step=0;this.next=this.a.currentTime+.03}
stop(){this.running=false;const t=this.a.currentTime;this.master.gain.cancelScheduledValues(t);this.master.gain.setTargetAtTime(0,t,.04)}
note(m,t,d,type='lead',vel=1){const a=this.a,st=this.stage,opts={lead:[['sawtooth','square','triangle','sawtooth','triangle','square','sine','sawtooth'][st],[3100,1850,1400,2450,2900,1850,2050,1750][st],[.065,.075,.066,.062,.058,.058,.063,.062][st]],arp:[['triangle','square','sine','triangle','sine','triangle','sine','triangle'][st],[4300,2750,2000,3500,4800,2850,3600,3900][st],[.032,.024,.030,.029,.031,.028,.027,.028][st]],bass:[['sawtooth','square','triangle','sawtooth','triangle','square','triangle','sawtooth'][st],[750,450,390,670,570,460,340,420][st],[.125,.165,.16,.14,.12,.12,.13,.14][st]],pad:[['triangle','sawtooth','sine','triangle','sine','sine','sine','triangle'][st],[1650,850,700,1190,1950,1150,920,1380][st],[.042,.028,.052,.044,.056,.047,.065,.058][st]]},[wave,cut,vol]=opts[type]||opts.lead;const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type=wave;o.frequency.setValueAtTime(hz(m),t);f.type='lowpass';f.Q.value=type==='bass'?4:1;f.frequency.setValueAtTime(cut*.65,t);if(type!=='pad')f.frequency.exponentialRampToValueAtTime(Math.max(120,cut*.28),t+d*.85);const att=type==='pad'?.085:.008,end=t+d+(type==='pad'?.27:.12),v=vol*vel;g.gain.setValueAtTime(.00001,t);g.gain.exponentialRampToValueAtTime(Math.max(.00001,v),t+att);g.gain.setValueAtTime(Math.max(.00001,v*.6),t+d*.7);g.gain.exponentialRampToValueAtTime(.00001,end);o.connect(f);f.connect(g);g.connect(this.master);if(type==='lead'||type==='arp')g.connect(this.delay);o.start(t);o.stop(end+.03);o.onended=()=>{o.disconnect();f.disconnect();g.disconnect()}}
noiseHit(t,d,cut,v,type='highpass'){const a=this.a,s=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();s.buffer=this.noise;f.type=type;f.frequency.value=cut;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.00001,t+d);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+d+.001);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect()}}
kick(t,v=1){const a=this.a,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(165,t);o.frequency.exponentialRampToValueAtTime(48,t+.14);g.gain.setValueAtTime(.75*v,t);g.gain.exponentialRampToValueAtTime(.00001,t+.24);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+.25);o.onended=()=>{o.disconnect();g.disconnect()}}
sequence(t,i){
 const s=i%16,bar=Math.floor(i/16)%8,st=this.stage,boss=this.boss;
 const root=ROOT[st][Math.floor(bar/2)%4],arp=ARP[st],theme=boss?BOSS_LEAD[st]:LEAD[st];
 // 01: heroic nebula synthwave / 02: darker metallic industry / 03: ominous deep-space ambience.
 const kick=st===0?s%4===0:st===1?[0,3,8,11].includes(s):st===2?[0,8].includes(s):[0,4,7,8,12,15].includes(s);
 if(kick||boss&&s%4===0)this.kick(t,boss?1.24:st===2?.8:1.05);
 if(st===0){
  if(s===4||s===12)this.noiseHit(t,.11,1600,.24);
  if(s%2===0)this.noiseHit(t,.045,6800,.064);
  if([0,4,8,12].includes(s))this.note(root-12+(s===12?7:0),t,.23,'bass',1);
  if(s===0||s===8)for(const n of [root+12,root+16,root+19])this.note(n,t,1.25,'pad',.75);
  if(s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.105,'arp',1);
  if(s%2===0||boss)this.note(root+12+theme[s],t,.17,'lead',.9);
 }else if(st===1){
  if([4,10,12].includes(s)){this.noiseHit(t,.18,960,.34);this.noiseHit(t,.065,280,.12,'bandpass')}
  if(s%2===1||boss)this.noiseHit(t,.055,4900,.055);
  if([0,3,6,8,11,14].includes(s))this.note(root-12+(s===14?6:0),t,.135,'bass',1.15);
  if(s===0||s===8)for(const n of [root+12,root+15,root+18])this.note(n,t,.75,'pad',.55);
  if([2,5,7,10,13,15].includes(s)||boss&&s%2===0)this.note(root+12+arp[(s+bar)%arp.length],t,.075,'arp',1.05);
  if([1,3,6,9,11,14].includes(s)||boss&&s%2===0)this.note(root+12+theme[s],t,.12,'lead',.95);
 }else if(st===2){
  if(s===4||s===12)this.noiseHit(t,.26,750,.20);
  if(s%4===0)this.noiseHit(t,.10,3700,.07);
  if([0,7,8,14].includes(s))this.note(root-12+(s===14?7:0),t,.38,'bass',.85);
  if(s===0||s===8)for(const n of [root+12,root+15,root+19])this.note(n,t,1.8,'pad',.9);
  if(s%4===2||boss&&s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.20,'arp',.72);
  if([2,4,6,10,12,14].includes(s)||boss&&s%2===1){
   const note=theme[s];if(note)this.note(root+12+note,t,.26,'lead',.88);
  }
 }else if(st===3){
  // Original stage 4 volcanic breakbeat: fast bass, bright analog synth.
  if([4,12].includes(s))this.noiseHit(t,.17,1420,.28);
  if(s%2===0)this.noiseHit(t,.046,6200,.066);
  if([0,3,8,11].includes(s))this.note(root-12,t,.16,'bass',1.05);
  if(s===0||s===8)for(const n of [root+12,root+17,root+19])this.note(n,t,.75,'pad',.75);
  if(s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.11,'arp',.95);
  if([0,3,4,7,8,11,12,15].includes(s)||boss&&s%2===0)this.note(root+12+theme[s],t,.13,'lead',.94);
 }else if(st===4){
  // Stage 5 frozen grave: glacial bells, sub-bass and granular wind.
  if([2,6,10,14].includes(s))this.noiseHit(t,.19,2900,.095);
  if([0,8].includes(s))this.noiseHit(t,.25,780,.20);
  if([0,6,8,14].includes(s))this.note(root-12,t,.29,'bass',.85);
  if(s===0||s===8)for(const n of [root+12,root+19,root+24])this.note(n,t,1.5,'pad',.68);
  if(s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.16,'arp',.85);
  if([0,3,6,8,11,14].includes(s)||boss&&s%2===1)this.note(root+12+theme[s],t,.21,'lead',.80);
 }else if(st===5){
  // Stage 6: ancient resonant machinery, pentatonic bells, ritual low drums.
  if([0,7,8,15].includes(s))this.noiseHit(t,.18,980,.18,'bandpass');
  if(s%4===2)this.noiseHit(t,.09,4300,.065);
  if([0,4,8,12].includes(s))this.note(root-12+(s===12?5:0),t,.31,'bass',.93);
  if(s===0||s===8)for(const n of [root+12,root+19,root+22])this.note(n,t,1.55,'pad',.77);
  if(s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.18,'arp',.82);
  if([0,3,5,8,11,13].includes(s)||boss&&s%2===1)this.note(root+12+theme[s],t,.19,'lead',.85);
 }else if(st===7){
  // Original final movement: bright half-time chords, insistent pulse and rising arpeggios.
  if([0,8,12].includes(s))this.noiseHit(t,.22,780,.24,'bandpass');
  if(s%2===0)this.noiseHit(t,.055,4900,.047);
  if([0,4,8,12].includes(s))this.note(root-12+(s===12?7:0),t,.29,'bass',1.08);
  if(s===0||s===8)for(const n of [root+12,root+19,root+24])this.note(n,t,1.4,'pad',.83);
  if(s%2===0)this.note(root+12+arp[(s/2+bar)%arp.length],t,.15,'arp',.91);
  if([0,3,6,8,11,14].includes(s)||boss&&s%2===1)this.note(root+12+theme[s],t,.18,'lead',.9);
 }else{
  // Stage 7: unstable boundary, glass chimes and asymmetric pulse.
  if([1,5,9,13].includes(s))this.noiseHit(t,.19,1700,.14,'bandpass');
  if([0,7,8,15].includes(s))this.noiseHit(t,.16,340,.11);
  if([0,5,8,13].includes(s))this.note(root-12+(s===13?6:0),t,.34,'bass',.82);
  if(s===0||s===8)for(const n of [root+12,root+18,root+25])this.note(n,t,1.85,'pad',.86);
  if([1,4,7,10,13].includes(s))this.note(root+12+arp[(s+bar)%arp.length],t,.19,'arp',.85);
  if([0,3,6,9,12,15].includes(s)||boss&&s%2===0)this.note(root+12+theme[s],t,.23,'lead',.83);
 }
 if(boss){
  // Boss pursuit pushes all three stage identities into a faster battle arrangement.
  if(s===4||s===12)this.noiseHit(t,.15,2100,.29);
  if(s%2===1)this.note(root+24+arp[(s+bar)%arp.length],t,.074,'arp',.77);
  if(s===0||s===8)this.note(root-12,t,.29,'bass',1.25);
 }
}

update(stage,boss){if(!this.enabled||!this.running||this.a.state!=='running')return;const now=this.a.currentTime;if(stage!==this.stage||boss!==this.boss){this.stage=stage;this.boss=boss;this.step=0;this.next=now+.03;this.delay.delayTime.setTargetAtTime([.19,.255,.32,.21,.29,.34,.37,.23][stage],now,.06)}if(this.next<now-.25)this.next=now+.02;const beat=60/([142,136,112,148,124,118,106,152][stage]+(boss?27:0))/4;let safety=0;while(this.next<now+.11&&safety++<5){this.sequence(this.next,this.step++);this.next+=beat}}
}
window.CyberBGM=CyberBGM;
})();