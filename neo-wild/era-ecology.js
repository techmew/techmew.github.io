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
  if(stage<20)return {region:r,era,kind:"stable",name:names[0],food:1,animals:1,year:Math.round(era*PERIOD*10)/10};
  // An unlock never forces an event. Every region draws independently per five-year epoch.
  const chance=stage<50?.20:stage<100?.27:stage<200?.34:.39;
  const roll=hash(r,era,0);
  if(roll>=chance)return {region:r,era,kind:"stable",name:names[0],food:1,animals:1,year:Math.round(era*PERIOD*10)/10};
  const selector=hash(r,era,1);
  const kind=selector<.28?"greening":selector<.50?"abundance":selector<.68?"drought":selector<.82?"predators":selector<.92?"recovery":"migration";
  const values={greening:[1.18,1.10],abundance:[1.35,1.16],drought:[.62,.78],predators:[.83,1.08],recovery:[.76,.68],migration:[.88,1.22]}[kind];
  return {region:r,era,kind,name:names[{greening:1,abundance:2,drought:3,predators:4,recovery:5,migration:6}[kind]],food:values[0],animals:values[1],year:Math.round(era*PERIOD*10)/10};
 }
 function history(year){
  const y=Math.max(0,Number(year)||0),last=Math.floor((y+1e-9)/PERIOD),events=[];
  for(let e=Math.max(4,last-59);e<=last;e++)for(let r=0;r<REGIONS;r++){
   const s=state(r,e*PERIOD);
   if(s.kind!=="stable")events.push({region:r,year:s.year,kind:s.kind,name:s.name});
  }
  return events.slice(-64);
 }
 window.WildEraEcology=Object.freeze({state,history,periodYears:PERIOD,regionCount:REGIONS});
})();