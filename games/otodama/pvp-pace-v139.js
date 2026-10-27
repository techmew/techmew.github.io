/* 声魂 v139: voluntary PvP interruption pacing. Pure logic; no network, no recording. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OtodamaPvpPace=api;})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const MIN_GAP=10*60*1000,MIN_CPU=5,WINDOW=60*60*1000,MAX_PER_HOUR=3;
 const safeInt=x=>Number.isSafeInteger(x)&&x>=0&&x<8640000000000000?x:0;
 function create(input=null,now=Date.now()){
  const t=safeInt(now),s=input&&typeof input==='object'&&!Array.isArray(input)?input:{};
  let state={enabled:!!s.enabled,since:safeInt(s.since),last:safeInt(s.last),
   cpu:Math.min(9999,safeInt(s.cpu)),encounters:Array.isArray(s.encounters)?s.encounters.filter(x=>safeInt(x)>0&&x<=t&&t-x<WINDOW).slice(-3):[]};
  if(!state.since)state.since=t;
  function prune(time){const at=safeInt(time);state.encounters=state.encounters.filter(x=>x<=at&&at-x<WINDOW)}
  function enable(time){const at=safeInt(time);if(!state.enabled){state.enabled=true;state.since=at;state.cpu=0}prune(at);return snapshot()}
  function disable(time){state.enabled=false;state.cpu=0;prune(time);return snapshot()}
  function completedCpu(time){if(!state.enabled)return snapshot();state.cpu=Math.min(9999,state.cpu+1);prune(time);return snapshot()}
  function encounter(time){const at=safeInt(time);const status=eligibility(at);if(!status.ready)return false;
    state.last=at;state.cpu=0;state.encounters.push(at);prune(at);return true}
  function eligibility(time){const at=safeInt(time);prune(at);
    const anchor=Math.max(state.since,state.last);
    const waitMs=Math.max(0,anchor+MIN_GAP-at);
    const hourlyMs=state.encounters.length>=MAX_PER_HOUR?Math.max(0,state.encounters[0]+WINDOW-at):0;
    const cpuRemaining=Math.max(0,MIN_CPU-state.cpu);
    return {ready:state.enabled&&cpuRemaining===0&&waitMs===0&&hourlyMs===0,enabled:state.enabled,
     cpuCompleted:state.cpu,cpuRemaining,waitMs,hourlyMs,hourlyCount:state.encounters.length,
     hourRemaining:Math.max(0,MAX_PER_HOUR-state.encounters.length),lastEncounterAt:state.last};
  }
  function snapshot(){return {enabled:state.enabled,since:state.since,last:state.last,cpu:state.cpu,encounters:state.encounters.slice()}}
  prune(t);return Object.freeze({enable,disable,completedCpu,encounter,eligibility,snapshot,
   limits:Object.freeze({gapMs:MIN_GAP,cpu:MIN_CPU,windowMs:WINDOW,hourly:MAX_PER_HOUR})});
 }
 return Object.freeze({create,MIN_GAP,MIN_CPU,WINDOW,MAX_PER_HOUR});
});
