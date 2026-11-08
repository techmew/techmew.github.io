/* WILD RECLAIM V1.0: deterministic five-year regional ecological succession.
 * No offline simulation; same world year and region always produce the same state.
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
 window.WildEraEcology=Object.freeze({state,history,migration,periodYears:PERIOD,regionCount:REGIONS});
})();