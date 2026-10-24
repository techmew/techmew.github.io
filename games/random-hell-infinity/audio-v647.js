/* RANDOM HELL ∞ V6.51 / Audio direction: subdued combat clicks and rare impact cues.
   All upstream assets CC0; sources and licenses recorded in AUDIO_LICENSES.md.
   BGM is streamed (no user music player); internal transitions are seamless crossfades. */
(()=>{
'use strict';
const O='https://opengameart.org/sites/default/files/';
const K='https://raw.githubusercontent.com/blancmathis/Super_Bash_Folds/main/public/assets/audio/open/';
const C='https://raw.githubusercontent.com/Mcamento8/open-game-sfx-index/main/audio/';
const A='https://raw.githubusercontent.com/tegnike/aozora-islands/main/src/assets/audio/';
const legacy=A+'battle_music_final_loop.mp3';
const tracks={
 menu:[O+'dark_things_loop_0.mp3',O+'claimed_by_the_void_mix_0.ogg',K+'music/menu-loop.ogg',legacy],
 gameover:[O+'dark_things_loop_0.mp3',K+'music/menu-loop.ogg',legacy],
 world0:[O+'virtual_rush_loop_0.mp3',A+'battle_music_01-loop.ogg',legacy],
 world1:[O+'claimed_by_the_void_mix_0.ogg',O+'virtual_rush_loop_0.mp3',legacy],
 world2:[O+'electric_stream_180bpm.ogg',O+'virtual_rush_loop_0.mp3',legacy],
 world3:[O+'new_factory_129bpm_0.ogg',O+'claimed_by_the_void_mix_0.ogg',legacy],
 world4:[O+'Experiment%20G.ogg',O+'virtual_rush_loop_0.mp3',legacy],
 world5:[O+'system_overload_154bpm.ogg',O+'electric_stream_180bpm.ogg',legacy],
 world6:[O+'ai_fight_120bpm.ogg',O+'virtual_rush_loop_0.mp3',legacy],
 world7:[O+'virtual_rush_loop_0.mp3',A+'battle_music_final_loop.mp3'],
 boss:[O+'silver_bullet.ogg',O+'jrpg_battle_loop.mp3',legacy],
 finalboss:[O+'jrpg_battle_loop.mp3',O+'silver_bullet.ogg',legacy]
};
const bank={
 menu:K+'sfx/menu-move.ogg',confirm:K+'sfx/menu-confirm.ogg',back:K+'sfx/menu-back.ogg',
 stage:K+'sfx/ready.ogg',clear:K+'sfx/game-set.ogg',gameover:K+'sfx/ko.ogg',
 jump:K+'sfx/dodge.ogg',doublejump:K+'sfx/respawn.ogg',land:K+'sfx/land.ogg',
 dash:K+'sfx/dodge.ogg',footstep:C+'rpg-audio/footstep00.ogg',
 sword:C+'sci-fi-sounds/impactMetal_002.ogg',dagger:K+'sfx/throw.ogg',
 heavy:C+'sci-fi-sounds/impactMetal_002.ogg',magic:C+'sci-fi-sounds/forceField_000.ogg',
 laser:C+'sci-fi-sounds/laserRetro_002.ogg',
 cannon:C+'sci-fi-sounds/explosionCrunch_002.ogg',projectile:K+'sfx/projectile.ogg',
 hit:K+'sfx/hit-light.ogg',heavyhit:K+'sfx/hit-heavy.ogg',enemydeath:K+'sfx/hit-medium.ogg',
 bosshit:C+'sci-fi-sounds/impactMetal_001.ogg',bossphase:C+'sci-fi-sounds/forceField_002.ogg',
 bossenter:C+'sci-fi-sounds/lowFrequency_explosion_000.ogg',
 bossswing:C+'sci-fi-sounds/laserLarge_000.ogg',
 bossdefeat:K+'sfx/game-set.ogg',hurt:K+'sfx/hit-heavy.ogg',
 death:K+'sfx/ko.ogg',shield:K+'sfx/shield.ogg',
 shieldbreak:K+'sfx/shield-break.ogg',stomp:K+'sfx/hit-medium.ogg',
 spring:K+'sfx/dodge.ogg',coin:K+'sfx/item-pickup.ogg',
 weaponpickup:K+'sfx/item-spawn.ogg',relic:K+'sfx/item-pickup.ogg',
 heal:K+'sfx/shield.ogg',levelup:K+'sfx/ready.ogg',
 checkpoint:K+'sfx/ready.ogg',combo:K+'sfx/hit-heavy.ogg',
 impactbass:C+'sci-fi-sounds/lowFrequency_explosion_001.ogg',
 bladeedge:C+'rpg-audio/knifeSlice2.ogg',
 metalimpact:C+'sci-fi-sounds/impactMetal_003.ogg'
};
const volumes={menu:.16,confirm:.28,back:.20,stage:.29,clear:.45,gameover:.40,
 jump:.19,doublejump:.27,land:.13,dash:.22,footstep:.065,
 sword:.34,dagger:.30,heavy:.41,magic:.22,laser:.25,cannon:.50,projectile:.19,
 hit:.24,heavyhit:.38,enemydeath:.25,bosshit:.42,bossphase:.42,bossenter:.47,
 bossswing:.29,bossdefeat:.53,hurt:.48,death:.54,shield:.30,shieldbreak:.41,
 stomp:.32,spring:.25,coin:.19,weaponpickup:.29,relic:.27,heal:.29,
 levelup:.36,checkpoint:.28,combo:.32,impactbass:.23,bladeedge:.13,metalimpact:.24};
const cooldown={menu:120,confirm:130,footstep:280,jump:150,doublejump:180,
 sword:60,dagger:55,laser:85,projectile:100,hit:50,heavyhit:70,
 bosshit:90,cannon:120,combo:260,impactbass:130,bladeedge:120,
 land:130,bossenter:800,bossphase:700,death:500,levelup:400};
const duckEvents=new Set(['bossenter','bossphase','bossdefeat','death','clear']);
const voices=new Map(),lastAt=new Map(),failed=new Set(),musicFallbacks=new Set();
const SFX_MASTER=.17,ATTACK_SOUNDS=new Set(['sword','dagger','heavy','magic','laser','cannon','projectile']),HIT_SOUNDS=new Set(['hit','heavyhit','bosshit','enemydeath']);
let lastAttackSample=-Infinity,lastHitSample=-Infinity;
let unlocked=false,muted=false,hidden=document.hidden,kind='',active=null,outgoing=[];
let duckUntil=0,duckStrength=1,activeTick=0;
const now=()=>typeof performance!=='undefined'&&performance.now?performance.now():Date.now();
function volumeFor(name){return name==='menu'?.15:name==='gameover'?.115:name==='boss'||name==='finalboss'?.195:.175}
function stop(node){if(!node)return;try{node.pause();node.removeAttribute('src');node.load()}catch(_){}}
function play(record){
 if(!record||record!==active||!unlocked||muted||hidden||record.pending||!record.node)return;
 const n=record.node;record.pending=true;
 try{
  const result=n.play();
  if(result&&result.then)result.then(()=>{record.pending=false}).catch(err=>{
   record.pending=false;
   if(err?.name==='NotSupportedError'||err?.name==='NotFoundError')fallback(record);
  });
  else record.pending=false;
 }catch(err){
  record.pending=false;
  if(err?.name==='NotSupportedError')fallback(record);
 }
}
function fallback(record){
 if(record!==active)return;
 musicFallbacks.add(record.name+':'+record.index);
 stop(record.node);record.node=null;record.pending=false;
 selectMusicSource(record,record.index+1);
}
function selectMusicSource(record,index){
 if(record!==active)return;
 if(index>=record.sources.length){record.node=null;return}
 record.index=index;record.startedAt=now();record.pending=false;
 const src=record.sources[index];
 const n=new Audio();record.node=n;n.loop=true;n.preload='auto';n.volume=0;
 n.addEventListener('error',()=>{if(active===record&&record.node===n)fallback(record)},{once:true});
 n.addEventListener('canplay',()=>{if(active===record&&record.node===n)play(record)},{once:true});
 n.src=src;
 play(record);
 // A slow/unreachable CDN must not leave a silent stage indefinitely.
 setTimeout(()=>{if(active===record&&record.node===n&&n.readyState<2)fallback(record)},8000);
}
function loadMusic(name){
 if(name===kind)return;
 const stamp=now();
 kind=name;
 if(active?.node){
  outgoing.push({node:active.node,from:active.node.volume,start:stamp});
  if(outgoing.length>2){stop(outgoing.shift().node)}
 }
 const sources=tracks[name]||tracks.menu;
 active={name,sources,index:-1,startedAt:stamp,pending:false,node:null};
 selectMusicSource(active,0);
}
function tick(){
 const t=now(),factor=t<duckUntil?duckStrength:1;
 if(active?.node){
  if(unlocked&&!muted&&!hidden&&active.node.paused&&!active.pending&&active.node.readyState>=2)play(active);
  const rise=Math.max(0,Math.min(1,(t-active.startedAt)/1150));
  const vol=muted||hidden?0:volumeFor(kind)*rise*factor;
  active.node.volume=Math.max(0,Math.min(1,vol));
 }
 const keep=[];
 for(const item of outgoing){
  const fade=Math.max(0,1-(t-item.start)/950);
  if(fade<=0){stop(item.node);continue}
  item.node.volume=muted||hidden?0:Math.max(0,Math.min(1,item.from*fade*factor));
  keep.push(item);
 }
 outgoing=keep;
}
function sync(mode,world,boss){
 let next='menu';
 if(mode==='survivorDraft'){tick();return}
 if(mode==='gameover')next='gameover';
 else if(mode==='playing'||mode==='dying')next=boss?(world===7?'finalboss':'boss'):'world'+Math.min(7,Math.max(0,Number(world)||0));
 loadMusic(next);tick();
}
function resume(){
 if(muted||hidden)return;
 if(active)play(active);
 for(const v of outgoing)if(v.node?.paused){try{const r=v.node.play();r?.catch?.(()=>{})}catch(_){}}
 tick();
}
function unlock(){
 if(!unlocked){unlocked=true;for(const key of ['sword','hit','jump','laser','heavyhit','confirm','cannon','bladeedge'])warm(key)}
 resume();
}
function setMuted(v){
 muted=!!v;
 if(muted){active?.node?.pause();for(const item of outgoing)item.node.pause();for(const pool of voices.values())for(const node of pool.items)node.pause()}
 else resume();
 tick();
}
function warm(name){
 if(voices.has(name)||!bank[name])return;
 const items=[];
 const count=['hit','sword','dagger','laser','heavyhit','bosshit'].includes(name)?4:2;
 for(let i=0;i<count;i++){
  const n=new Audio();n.src=bank[name];n.preload=i===0?'auto':'none';
  n.addEventListener('error',()=>failed.add(name),{once:true});
  items.push(n);
 }
 voices.set(name,{items,index:0});
}
function playSample(name,intensity){
 if(!bank[name]||failed.has(name))return false;
 const t=now();
 if(ATTACK_SOUNDS.has(name)){if(t-lastAttackSample<245)return true;lastAttackSample=t}
 if(HIT_SOUNDS.has(name)){if(t-lastHitSample<195)return true;lastHitSample=t}
 if(t-(lastAt.get(name)??-Infinity)<(cooldown[name]??65))return true;
 lastAt.set(name,t);warm(name);
 const pool=voices.get(name);
 let n=pool.items.find(item=>item.paused||item.ended);
 if(!n){n=pool.items[pool.index];pool.index=(pool.index+1)%pool.items.length;n.pause()}
 try{
  n.currentTime=0;n.volume=Math.max(0,Math.min(1,(volumes[name]??.26)*intensity*SFX_MASTER));
  const r=n.play();
  r?.catch?.(e=>{if(e?.name==='NotSupportedError'||e?.name==='NotFoundError')failed.add(name)});
  return true;
 }catch(e){if(e?.name==='NotSupportedError')failed.add(name);return false}
}
function cue(name,intensity=1){
 if(!unlocked||muted||hidden||!bank[name])return false;
 if(name==='combo')return true;
 const ok=playSample(name,intensity);
 if(duckEvents.has(name)){duckUntil=now()+(name==='bossenter'?750:360);duckStrength=name==='bossenter'?.40:.67}
 // No layered swooshes or sub-bass transients on ordinary hits.
 tick();return ok;
}
document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
document.addEventListener('keydown',unlock,{capture:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('button:not(#punch):not(#jump):not(#soundTiny)'))cue('confirm')},{capture:true});
document.addEventListener('visibilitychange',()=>{
 hidden=document.hidden;
 if(hidden){active?.node?.pause();for(const item of outgoing)item.node.pause()}
 else resume();
});
window.addEventListener('pagehide',()=>{active?.node?.pause();for(const item of outgoing)item.node.pause()});
window.addEventListener('pageshow',()=>resume());
window.RH_AUDIO={sync,unlock,setMuted,cue,sources:{tracks,bank},getState:()=>({
 unlocked,muted,kind,track:active?.node?.src||'',sourceIndex:active?.index??-1,failed:[...failed],
 fallbacks:[...musicFallbacks],fadeCount:outgoing.length,ducking:now()<duckUntil
})};
})();
