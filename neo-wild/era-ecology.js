/* WILD RECLAIM V1.0: deterministic five-year regional ecological succession.
 * Era thresholds remain deterministic; bounded offline ecology uses the existing save.
 * Existing terrain/collision and SAVE_SCHEMA2 remain authoritative. */
(()=>{"use strict";
 // Regional succession uses the same 3x event timeline as hazards, not the lifetime clock.
 const PERIOD=window.WildWorldClock?.eventIntervalYears?.(5)??5/3,REGIONS=8;
 const progressionYear=y=>window.WildWorldClock?.eventYear?.(y)??y*3;
 const names=["平穏","緑化","食料豊富","乾燥","捕食圧","疫病後の回復","群れの大移動"];
 const hash=(a,b,c)=>{let n=Math.imul(a+13,1103515245)^Math.imul(b+7,12345)^Math.imul(c+3,2654435761);n^=n>>>16;n=Math.imul(n,2246822519);return((n^(n>>>13))>>>0)/4294967296};
 function state(region,year){
  const r=Math.max(0,Math.min(REGIONS-1,Math.floor(Number(region)||0)));
  const y=Math.max(0,Number(year)||0);
  const era=Math.floor((y+1e-9)/PERIOD),stage=progressionYear(y);
  // Seasonal forage shifts encounter pressure without spawning extra animals.
  const season=Math.min(3,Math.floor(((y%1)+1)%1*4));
  const foodSeason=[1.10,1.24,.91,.62][season],animalSeason=[1.02,1.08,.97,.82][season];
  const seasonal=(kind,food,animals)=>({region:r,era,kind,name:names[{stable:0,greening:1,abundance:2,drought:3,predators:4,recovery:5,migration:6}[kind]],food:Math.round(food*foodSeason*1000)/1000,animals:Math.round(animals*animalSeason*1000)/1000,year:Math.round(era*PERIOD*10)/10});
  if(stage<20)return seasonal("stable",1,1);
  // An unlock never forces an event. Every region draws independently per five-year epoch.
  const chance=stage<50?.20:stage<100?.27:stage<200?.34:.39;
  const roll=hash(r,era,0);
  if(roll>=chance)return seasonal("stable",1,1);
  const selector=hash(r,era,1);
  const kind=selector<.28?"greening":selector<.50?"abundance":selector<.68?"drought":selector<.82?"predators":selector<.92?"recovery":"migration";
  const values={greening:[1.18,1.10],abundance:[1.35,1.16],drought:[.62,.78],predators:[.83,1.08],recovery:[.76,.68],migration:[.88,1.22]}[kind];
  return seasonal(kind,values[0],values[1]);
 }
 // Region-to-region migration follows a deterministic seasonal corridor.
 // No extra mobs are spawned; only existing encounter draws are redistributed.
 const CORRIDORS=Object.freeze([[0,1],[0,2],[1,6],[2,5],[5,3],[3,7],[7,4],[4,2],[6,7]]);
 function migration(region,year){
  const r=Math.max(0,Math.min(REGIONS-1,Math.floor(Number(region)||0)));
  const y=Math.max(0,Number(year)||0),epoch=Math.floor((y+1e-9)/PERIOD);
  const active=CORRIDORS.filter(([a,b])=>{const left=state(a,y),right=state(b,y);return left.kind==="migration"||right.kind==="migration"||(left.kind==="drought"&&right.food>left.food)||(right.kind==="drought"&&left.food>right.food);});
  // Choose the strongest active corridor, not the first array entry.
  // In a drought animals leave the poorer habitat; winter reduces intake.
  // Winter amplifies scarcity in drought and predator-heavy regions, steering herds toward shelter.
  const winter=Math.min(3,Math.floor(((y%1)+1)%1*4))===3;
  const habitat=s=>s.food/(s.kind==="predators"?(winter?1.85:1.5):1)/(winter&&s.kind==="drought"?1.3:1);
  const candidates=active.filter(([a,b])=>a===r||b===r).map(pair=>{
   const a=state(pair[0],y),b=state(pair[1],y);
   const delta=habitat(a)-habitat(b);
   const direction=Math.abs(delta)>.08?(delta>0?[pair[1],pair[0]]:pair):
    (hash(pair[0],epoch,9)<.5?pair:[pair[1],pair[0]]);
   return {source:direction[0],destination:direction[1],strength:Math.abs(delta)+(a.kind==="migration"||b.kind==="migration"?.12:0),pair};
  });
  if(!candidates.length)return {active:false,source:r,destination:r,grazer:1,hunter:1};
  candidates.sort((a,b)=>b.strength-a.strength||a.pair[0]-b.pair[0]);
  const {source,destination}=candidates[0];
  const season=Math.min(3,Math.floor(((y%1)+1)%1*4));
  // Winter reduces forage at the destination, while drought increases departures.
  // Population is redistributed within the existing spawn budget, never duplicated.
  const departure=state(source,y),arrival=state(destination,y);
  const scarcity=departure.kind==="drought"?Math.min(1.35,1/Math.max(.4,departure.food)):1;
  const shelter=arrival.kind==="abundance"||arrival.kind==="greening"?1.08:1;
  const grazer=r===destination?Math.min(1.48,(winter?1.16:1.29)*scarcity*shelter):Math.max(.54,.77/scarcity);
  const hunter=r===destination?Math.min(1.20,1+(grazer-1)*.42):Math.max(.72,.88/scarcity);
  return {active:true,source,destination,grazer,hunter,season};
 }
 function history(year){
  const y=Math.max(0,Number(year)||0),last=Math.floor((y+1e-9)/PERIOD),events=[];
  for(let e=Math.max(4,last-59);e<=last;e++)for(let r=0;r<REGIONS;r++){
   const s=state(r,e*PERIOD);
   if(s.kind!=="stable")events.push({region:r,year:s.year,kind:s.kind,name:s.name});
  }
  return events.slice(-64);
 }

 // Simulate bounded regional ecology while the browser is closed, without moving the
 // player, killing owned animals, advancing YEAR, spawning NPCs or modifying old saves.
 // Two real hours correspond to one coarse ecological change, capped at 24h.
 function offlineAdvance(areas,savedAt,now,year){
  if(!Array.isArray(areas)||areas.length!==REGIONS)return {steps:0,regions:areas,events:[]};
  const regions=areas.map(e=>({...e}));
  const ms=Number(now)-Number(savedAt);
  if(!Number.isFinite(ms)||!Number.isFinite(Number(savedAt))||Number(savedAt)<=0||ms<7200000)
   return {steps:0,regions,events:[]};
  const steps=Math.min(12,Math.floor(ms/7200000));
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const origin=regions.map(r=>({...r}));
  const safe=(r,key,fallback)=>Number.isFinite(Number(r[key]))?Number(r[key]):fallback;
  const seasonStates=regions.map((_,i)=>state(i,Math.max(0,Number(year)||0)));
  for(let step=0;step<steps;step++){
   for(let i=0;i<REGIONS;i++){
    const r=regions[i],s=seasonStates[i];
    const prey=clamp(Math.floor(safe(r,"prey",30)),4,86);
    const hunters=clamp(Math.floor(safe(r,"predators",12)),3,31);
    const food=clamp(Math.floor(safe(r,"food",55)),10,94);
    const growth=(s.food<.83?-2:s.food>1.15?2:1)-Math.floor(prey/38)-(hunters>21?1:0);
    r.food=clamp(food+growth,10,94);
    const births=r.food>40?2:r.food>24?1:0;
    const hunted=Math.min(2,Math.floor(hunters/15)+(safe(r,"pressure",0)>3?1:0));
    r.prey=clamp(prey+births-hunted,4,86);
    const hunger=r.prey<hunters*1.65;
    r.predators=clamp(hunters+(hunger?-1:step%3===0&&r.prey>hunters*2.3?1:0),3,31);
    r.pressure=clamp(Math.floor(safe(r,"pressure",0))+(r.prey<prey?1:-1),0,5);
    if(r.pressure>=5&&hash(i,Math.floor(Number(savedAt)/7200000)+step,11)<.36){
     r.dominance=(Math.floor(safe(r,"dominance",0))+1)%3;
     r.events=Math.max(0,Math.floor(safe(r,"events",0)))+1;r.pressure=0;
    }
   }
   // Food scarcity pushes a few animals through established neighbouring corridors.
   // This transfers existing population; it never duplicates prey or creates actors.
   if(step%2===1)for(const [a,b] of CORRIDORS){
    const low=regions[a].food<=regions[b].food?a:b,high=low===a?b:a;
    if(regions[low].food>=33||regions[high].food-regions[low].food<14||regions[low].prey<=9)continue;
    const leaving=Math.min(2,regions[low].prey-7,86-regions[high].prey);
    if(leaving>0){regions[low].prey-=leaving;regions[high].prey+=leaving;}
   }
  }
  const events=[];
  for(let i=0;i<REGIONS;i++){
   const old=origin[i],r=regions[i],preyDelta=r.prey-safe(old,"prey",r.prey),foodDelta=r.food-safe(old,"food",r.food);
   const powerChange=r.dominance!==old.dominance;
   if(powerChange||Math.abs(preyDelta)>=3||Math.abs(foodDelta)>=4){
    const message=powerChange?"群れの勢力交代":Math.abs(preyDelta)>=3?(preyDelta>0?"野生動物の増加":"野生動物の減少"):(foodDelta>0?"食料の回復":"食料の減少");
    events.push({region:i,kind:"offline-ecology",label:message});
   }
  }
  return {steps,regions,events:events.slice(0,REGIONS)};
 }
 window.WildEraEcology=Object.freeze({state,history,migration,offlineAdvance,periodYears:PERIOD,regionCount:REGIONS});
})();