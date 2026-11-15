/* WILD RECLAIM: opt-in, hands-on first game session.
 * Actual move/jump/attack/interact/map actions advance a small unobtrusive
 * guide, without changing SAVE_SCHEMA2, ownership, or the permanent-death log.
 */
((global)=>{
 "use strict";
 const KEY="wild-reclaim-first-steps-practiced-v1";
 const STEPS=Object.freeze([
  Object.freeze({kind:"move",title:"移動する",tip:"左スティック／WASD・矢印キーで少し歩く"}),
  Object.freeze({kind:"jump",title:"ジャンプする",tip:"右のジャンプ／Lで跳ぶ（鳥は飛び立つ）"}),
  Object.freeze({kind:"attack",title:"攻撃する",tip:"攻撃ボタン／Jで攻撃を1回出す"}),
  Object.freeze({kind:"interact",title:"○で食べる・調べる",tip:"食料・ガラクタの近くで○／E。巣では食料庫を開く"}),
  Object.freeze({kind:"map",title:"地図を開く",tip:"地図ボタン／Mで探索ルートを表示する"})
 ]);
 let active=false,step=0,moved=0,last=null,finished=false;
 try{finished=global.localStorage.getItem(KEY)==="1"}catch(_){}
 const el=id=>global.document?.getElementById?.(id)||null;
 function display(){
  const card=el("first-steps"),title=el("first-steps-title"),detail=el("first-steps-detail"),
    fraction=el("first-steps-count"),progress=el("first-steps-progress");
  if(!card)return;
  card.classList.toggle("hidden",!active);
  if(!active)return;
  if(title)title.textContent=STEPS[step].title;
  if(detail)detail.textContent=STEPS[step].tip;
  if(fraction)fraction.textContent=(step+1)+" / "+STEPS.length;
  if(progress){progress.max=STEPS.length;progress.value=step;}
 }
 function done(){return finished}
 function begin(actor,force=false){
  if((finished&&!force)||active||!actor||actor.hp<=0)return false;
  step=0;moved=0;last={x:actor.x,y:actor.y};
  active=true;display();return true;
 }
 function complete(skipped=false){
  if(!active)return false;
  active=false;finished=true;last=null;display();
  try{global.localStorage.setItem(KEY,"1")}catch(_){}
  // Failed localStorage is not a gameplay failure; this onboarding is
  // explicitly separate from the world autosave and permanent animal IDs.
  if(!skipped&&typeof global.WildFirstStepsOnDone==="function")
   global.WildFirstStepsOnDone();
  return true;
 }
 function event(kind){
  if(!active||STEPS[step].kind!==kind)return false;
  if(step===STEPS.length-1){complete(false);return true;}
  step++;moved=0;last=null;display();return true;
 }
 function tick(actor,dt){
  if(!active)return;
  if(!actor||actor.hp<=0){reset();return;}
  if(!Number.isFinite(actor.x)||!Number.isFinite(actor.y))return;
  if(STEPS[step].kind!=="move"){last={x:actor.x,y:actor.y};return;}
  if(last&&Number.isFinite(dt)&&dt>0){
   const distance=Math.hypot(actor.x-last.x,actor.y-last.y);
   // Teleports/restore/squad switch cannot fulfill a movement tutorial.
   if(distance>.02&&distance<=Math.max(40,1200*dt))moved+=distance;
  }
  last={x:actor.x,y:actor.y};
  if(moved>=65)event("move");
 }
 function reset(){
  active=false;step=0;moved=0;last=null;display();
 }
 global.WildFirstSteps=Object.freeze({KEY,STEPS,done,begin,event,tick,skip:()=>complete(true),reset,
  status:()=>({active,step,finished,moved})});
})(window);
