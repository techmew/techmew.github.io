/* RANDOM HELL infinity V6.47 - licensed real BGM and SFX (CC0), no user music player. */
(()=>{
'use strict';
const K='https://raw.githubusercontent.com/blancmathis/Super_Bash_Folds/main/public/assets/audio/open/';
const C='https://raw.githubusercontent.com/Mcamento8/open-game-sfx-index/main/audio/';
const D='https://raw.githubusercontent.com/jarlah/dungeon-haskell/master/assets/';
const A='https://raw.githubusercontent.com/tegnike/aozora-islands/main/src/assets/audio/';
const tracks={
 menu:[K+'music/menu-loop.ogg',A+'menu_music_loop.ogg'],
 gameover:[D+'music/theme.ogg',K+'music/menu-loop.ogg'],
 world0:[K+'music/battle-loop.ogg',D+'music/theme.ogg'],
 world1:[D+'music/theme.ogg',K+'music/battle-loop.ogg'],
 world2:[A+'battle_music_01-loop.ogg',K+'music/battle-loop.ogg'],
 world3:[K+'music/battle-loop.ogg',A+'battle_music_01-loop.ogg'],
 world4:[A+'battle_music_01-loop.ogg',D+'music/theme.ogg'],
 world5:[D+'music/theme.ogg',A+'battle_music_01-loop.ogg'],
 world6:[K+'music/battle-loop.ogg',D+'music/theme.ogg'],
 world7:[A+'battle_music_final_loop.mp3',A+'battle_music_01-loop.ogg'],
 boss:[D+'music/boss.ogg',A+'battle_music_final_loop.mp3'],
 finalboss:[A+'battle_music_final_loop.mp3',D+'music/boss.ogg']
};
const bank={
 menu:K+'sfx/menu-move.ogg',confirm:K+'sfx/menu-confirm.ogg',back:K+'sfx/menu-back.ogg',
 stage:K+'sfx/ready.ogg',clear:K+'sfx/game-set.ogg',gameover:K+'sfx/ko.ogg',
 jump:K+'sfx/ledge.ogg',doublejump:K+'sfx/dodge.ogg',land:K+'sfx/land.ogg',
 dash:K+'sfx/dodge.ogg',footstep:C+'rpg-audio/footstep00.ogg',
 sword:C+'rpg-audio/knifeSlice.ogg',dagger:C+'rpg-audio/knifeSlice2.ogg',
 heavy:C+'rpg-audio/chop.ogg',magic:C+'sci-fi-sounds/forceField_000.ogg',
 laser:C+'sci-fi-sounds/laserSmall_000.ogg',
 cannon:C+'sci-fi-sounds/explosionCrunch_000.ogg',projectile:K+'sfx/projectile.ogg',
 hit:K+'sfx/hit-light.ogg',heavyhit:K+'sfx/hit-heavy.ogg',enemydeath:K+'sfx/hit-medium.ogg',
 bosshit:C+'sci-fi-sounds/impactMetal_000.ogg',bossphase:C+'sci-fi-sounds/forceField_001.ogg',
 bossenter:C+'sci-fi-sounds/lowFrequency_explosion_000.ogg',
 bossswing:C+'sci-fi-sounds/laserLarge_000.ogg',
 bossdefeat:K+'sfx/game-set.ogg',hurt:K+'sfx/hit-heavy.ogg',
 death:C+'music-jingles/jingles_HIT15.ogg',shield:K+'sfx/shield.ogg',
 shieldbreak:K+'sfx/shield-break.ogg',stomp:K+'sfx/hit-medium.ogg',
 spring:K+'sfx/dodge.ogg',coin:K+'sfx/item-pickup.ogg',
 weaponpickup:K+'sfx/item-spawn.ogg',relic:K+'sfx/item-pickup.ogg',
 heal:K+'sfx/shield.ogg',levelup:C+'music-jingles/jingles_NES09.ogg',
 checkpoint:K+'sfx/ready.ogg',combo:C+'music-jingles/jingles_HIT08.ogg'
};
const gains={footstep:.12,hit:.27,sword:.38,dagger:.30,laser:.24,projectile:.20,
 cannon:.38,heavyhit:.31,enemydeath:.26,land:.21,menu:.24,confirm:.42,
 jump:.26,doublejump:.30,bosshit:.28,gameover:.55,levelup:.46};
const intervals={hit:50,heavyhit:85,footstep:260,sword:85,dagger:65,laser:90,
 projectile:100,bosshit:100,enemydeath:100,menu:110,combo:240,
 cannon:150,land:120,shield:170,coin:75,bossswing:220};
const voices=new Map(),lastAt=new Map(),failed=new Set();
let unlocked=false,muted=false,kind='',bgm=null,bgmSources=[],bgmAttempt=0,hidden=document.hidden;
const now=()=>typeof performance!=='undefined'?performance.now():Date.now();
function startMusic(){
 if(!unlocked||muted||hidden||!bgm)return;
 const play=bgm.play();
 if(play&&typeof play.catch==='function')play.catch(()=>{});
}
function loadMusic(name){
 if(name===kind)return;
 if(bgm){bgm.pause();bgm.removeAttribute('src');bgm.load();bgm=null}
 kind=name;bgmSources=tracks[name]||tracks.menu;bgmAttempt=0;
 function next(){
  if(bgmAttempt>=bgmSources.length){bgm=null;return}
  const index=bgmAttempt++;
  const node=new Audio();
  bgm=node;node.loop=true;node.preload='auto';node.volume=.23;
  node.addEventListener('error',()=>{
   if(node!==bgm)return;
   node.pause();node.removeAttribute('src');node.load();next();
  },{once:true});
  node.src=bgmSources[index];
  startMusic();
 }
 next();
}
function sync(mode,world,boss){
 let next='menu';
 if(mode==='survivorDraft')return;
 if(mode==='gameover')next='gameover';
 else if(mode==='playing'||mode==='dying'){
  next=boss?(world===7?'finalboss':'boss'):'world'+Math.min(7,Math.max(0,Number(world)||0));
 }
 else if(mode==='clear')next='menu';
 loadMusic(next);
}
function unlock(){
 if(unlocked){startMusic();return}
 unlocked=true;
 for(const key of ['sword','hit','jump','coin','laser','confirm'])warm(key);
 startMusic();
}
function setMuted(value){
 muted=!!value;
 if(muted){if(bgm)bgm.pause();for(const pool of voices.values())for(const node of pool)node.pause()}
 else startMusic();
}
function warm(name){
 if(voices.has(name)||!bank[name])return;
 const arr=[];
 for(let i=0;i<3;i++){
  const node=new Audio();
  node.preload=i===0?'auto':'none';
  node.src=bank[name];node.volume=0;
  node.addEventListener('error',()=>failed.add(name),{once:true});
  arr.push(node);
 }
 arr.index=0;voices.set(name,arr);
}
function cue(name,gain=1){
 if(!unlocked||muted||hidden||!bank[name]||failed.has(name))return false;
 const tick=now();
 if(tick-(lastAt.get(name)||-Infinity)<(intervals[name]||55))return true;
 lastAt.set(name,tick);warm(name);
 const pool=voices.get(name);
 let clip=pool.find(a=>a.paused||a.ended);
 if(!clip){clip=pool[pool.index];pool.index=(pool.index+1)%pool.length;clip.pause()}
 try{
  clip.currentTime=0;clip.volume=Math.max(0,Math.min(1,(gains[name]||.35)*gain));
  const playing=clip.play();
  if(playing&&typeof playing.catch==='function')playing.catch(()=>{});
  return true;
 }catch(_){failed.add(name);return false}
}
document.addEventListener('pointerdown',unlock,{capture:true,passive:true});
document.addEventListener('keydown',unlock,{capture:true});
document.addEventListener('click',e=>{
 if(e.target?.closest?.('button:not(#punch):not(#jump):not(#soundTiny)'))cue('confirm');
},{capture:true});
document.addEventListener('visibilitychange',()=>{
 hidden=document.hidden;
 if(hidden){if(bgm)bgm.pause()}
 else startMusic();
});
window.addEventListener('pagehide',()=>{if(bgm)bgm.pause()});
window.addEventListener('pageshow',()=>startMusic());
window.RH_AUDIO={sync,unlock,setMuted,cue,
 sources:{tracks,bank},getState:()=>({unlocked,muted,kind,track:bgm?.src||'',failed:[...failed]})};
})();
