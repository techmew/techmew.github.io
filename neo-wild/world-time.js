/* WILD RECLAIM V1.0 — deterministic long-term world clock.
 * One simulated year equals 120 seconds of active play.
 * The existing 85-second daylight cycle is independent.
 * No saves or DOM are mutated here; older snapshots derive the same timeline
 * from their existing elapsed value. */
(() => {
 "use strict";
 const YEAR_SECONDS=120,DAY_SECONDS=85,MONTH_SECONDS=10;
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
  if(weatherRoll<wetChance){
   const thunderChance=world.month>=6&&world.month<=9?.16:.03;
   return hash(world.year,blockInYear,2)<thunderChance?"THUNDER":"RAIN";
  }
  const fair=hash(world.year,blockInYear,3);
  return fair<.63?"CLEAR":fair<.89?"CLOUDY":fair<.96?"WIND":"FOG";
 }
 window.WildWorldClock=Object.freeze({
  YEAR_SECONDS,DAY_SECONDS,MONTH_SECONDS,at,
  fromDay(day){return at((Math.max(1,Number(day)||1)-1)*DAY_SECONDS);},
  weatherAt
 });
})();
