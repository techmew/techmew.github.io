/* WILD RECLAIM V1.0 — deterministic long-term world clock.
 * One simulated year equals 120 seconds of active play.
 * The existing 85-second daylight cycle is independent.
 * No saves or DOM are mutated here; older snapshots derive the same timeline
 * from their existing elapsed value. */
(() => {
 "use strict";
 const YEAR_SECONDS=120,DAY_SECONDS=85,MONTH_SECONDS=10;
 // Three hundred years of encounter progression fit in one hundred calendar years.
 // This multiplier NEVER changes the 120s/year clock, seasons, aging or saves.
 const EVENT_ERA_SCALE=3;
 const eventYear=worldYear=>Math.max(0,Number(worldYear)||0)*EVENT_ERA_SCALE;
 const eventIntervalYears=originalYears=>Math.max(0,Number(originalYears)||0)/EVENT_ERA_SCALE;
 const seasonNames=["冬","春","夏","秋"];
 const rainNormals=[4.5,5.2,9.2,9.5,10.1,11.6,10.5,7.9,11,10.5,7.4,5.2];
 const monthLengths=[31,28,31,30,31,30,31,31,30,31,30,31];
 const finiteSeconds=seconds=>Number.isFinite(Number(seconds))?Math.max(0,Number(seconds)):0;
 function at(seconds=0){
  const s=finiteSeconds(seconds),completedYears=Math.floor(s/YEAR_SECONDS);
  const intoYear=s-completedYears*YEAR_SECONDS;
  const month=Math.min(12,1+Math.floor(intoYear/MONTH_SECONDS));
  const seasonIndex=month===12||month<=2?0:month<=5?1:month<=8?2:3;
  return {elapsed:s,year:completedYears,completedYears,yearFraction:intoYear/YEAR_SECONDS,
   month,seasonIndex,index:seasonIndex,name:seasonNames[seasonIndex],
   season:seasonNames[seasonIndex],nextYearInSeconds:YEAR_SECONDS-intoYear};
 }
 function hash(a,b,c){
  let x=Math.imul((a+1)|0,73856093)^Math.imul((b+11)|0,19349663)^Math.imul((c+19)|0,83492791);
  x=Math.imul(x^(x>>>15),2246822507);x=Math.imul(x^(x>>>13),3266489909);
  return ((x^(x>>>16))>>>0)/4294967296;
 }
 function weatherAt(seconds=0){
  const s=finiteSeconds(seconds),world=at(s),block=Math.floor(s/5);
  const blockInYear=block%24;
  const wetChance=rainNormals[world.month-1]/monthLengths[world.month-1]*.31;
  const weatherRoll=hash(world.year,blockInYear,1);
  // Snow can occur in winter; contiguous 5-second weather blocks allow real buildup.
  if(world.seasonIndex===0&&weatherRoll<.29){
   return hash(world.year,blockInYear,16)<.72?"SNOW":"CLOUDY";
  }
  if(weatherRoll<wetChance){
   const thunderChance=world.month>=6&&world.month<=9?.16:.03;
   return hash(world.year,blockInYear,2)<thunderChance?"THUNDER":"RAIN";
  }
  const fair=hash(world.year,blockInYear,3);
  return fair<.63?"CLEAR":fair<.89?"CLOUDY":fair<.96?"WIND":"FOG";
 }
 function snowpackAt(seconds=0){
  const now=finiteSeconds(seconds),world=at(now);
  // World history is time-derived, never a resettable run counter. Ten recent
  // five-second blocks retain fallen snow; spring rapidly melts accumulated snow.
  if(world.seasonIndex!==0&&world.seasonIndex!==1)return 0;
  let cover=0;
  const block=Math.floor(now/5);
  for(let k=9;k>=0;k--){
   const sample=Math.max(0,(block-k)*5+.1);
   const state=at(sample);
   if(state.seasonIndex!==0)cover=Math.max(0,cover-.19);
   else if(weatherAt(sample)==="SNOW")cover=Math.min(1,cover+.24);
   else cover=Math.max(0,cover-.032);
  }
  return Math.round(cover*100)/100;
 }
 window.WildWorldClock=Object.freeze({
  YEAR_SECONDS,DAY_SECONDS,MONTH_SECONDS,EVENT_ERA_SCALE,eventYear,eventIntervalYears,at,snowpackAt,
  fromDay(day){return at((Math.max(1,Number(day)||1)-1)*DAY_SECONDS);},
  weatherAt
 });
})();
