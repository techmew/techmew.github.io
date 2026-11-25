/* WILD RECLAIM: opt-in, hands-on first game session.
 * Actual move/jump/attack/interact/map actions advance a small unobtrusive
 * guide, without changing SAVE_SCHEMA2, ownership, or the permanent-death log.
 */
((global)=>{
 "use strict";
 const KEY="wild-reclaim-first-steps-practiced-v1";
 const STEPS=Object.freeze([
  Object.freeze({kind:"move",title:"移動する",tip:"左スティック／WASD・矢印キーで少し歩く"}),
  Object.freeze({kind:"hunt",title:"獲物を狩る",tip:"小動物に近づき△／Jで攻撃。近くの食料を○／Eで食べても進める"}),
  Object.freeze({kind:"meal",title:"最初の食事",tip:"地図の目印へ。食料のそばで○／Eを短く押す（鳥は着地）"}),
  Object.freeze({kind:"jump",title:"危険をかわす",tip:"横に移動しながら ×／L で跳ぶ"}),
  Object.freeze({kind:"map",title:"地図を開く",tip:"ミニマップを長押し／Mで周囲の道を確認"})
 ]);
 const controls={move:"joystick",hunt:"attack-touch",meal:"action-touch",jump:"jump-touch",map:"mini-map-control"};
 let lessons=STEPS,forager=false,foodTarget=false;
 let active=false,step=0,moved=0,last=null,finished=false;
 try{finished=global.localStorage.getItem(KEY)==="1"}catch(_){}
 const el=id=>global.document?.getElementById?.(id)||null;
 function display(){
  const card=el("first-steps"),title=el("first-steps-title"),detail=el("first-steps-detail"),
    fraction=el("first-steps-count"),progress=el("first-steps-progress");
  const lesson=lessons[step],foodInstead=lesson?.kind==="hunt"&&foodTarget;
  for(const [kind,id] of Object.entries(controls))el(id)?.classList.toggle("practice-control",active&&kind===(foodInstead?"meal":lesson?.kind));
  if(!card)return;
  card.classList.toggle("hidden",!active);
  if(!active)return;
  if(title)title.textContent=foodInstead?"最初の食事":lesson.title;
  if(detail)detail.textContent=foodInstead?"矢印の食料へ。○／Eで食べる":lesson.tip;
  if(fraction)fraction.textContent=(step+1)+" / "+lessons.length;
  if(progress){progress.max=lessons.length;progress.value=step;}
 }
 function done(){return finished}
 function begin(actor,force=false){
  if((finished&&!force)||active||!actor||actor.hp<=0)return false;
  forager=["carp","deer","rabbit","pigeon","gorilla","giraffe","elephant","zebra","hippo","serow","rhino","kangaroo","mountainGoat"].includes(actor.type);
  lessons=forager?STEPS.filter(s=>s.kind!=="hunt"):STEPS;
  if(["crow","pigeon"].includes(actor.type))lessons=lessons.map(s=>s.kind==="jump"?{...s,title:"飛んで離れる",tip:"×／L で飛び立つ。もう一度で着地"}:s);
  foodTarget=false;
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
  if(!active)return false;
  if(kind==="meal"&&lessons[step].kind==="hunt")step++;
  if(lessons[step].kind!==kind)return false;
  if(step===lessons.length-1){complete(false);return true;}
  step++;moved=0;last=null;display();return true;
 }
 function tick(actor,dt){
  if(!active)return;
  if(!actor||actor.hp<=0){reset();return;}
  if(!Number.isFinite(actor.x)||!Number.isFinite(actor.y))return;
  if(lessons[step].kind!=="move")return;
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
  pointToFood(value){
   if(active&&lessons[step].kind==="hunt"&&foodTarget!==value){foodTarget=value;display();}
  },
  status:()=>({active,step,kind:lessons[step]?.kind,forager,finished,moved})});
})(window);
