/* 声魂 v134: deterministic rarity and multi-voice evolution. Local-only; no audio sent to Worker. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.OtodamaGrowth = api;
})(typeof window !== 'undefined' ? window : null, function () {
  'use strict';
  const MAX_LEVEL = 40;
  const EVOLUTION_LEVELS = Object.freeze([10, 20, 30]);
  const FOCUSES = Object.freeze([
    {name:'リズム',indices:[9,10,35],hint:'拍をそろえ、間隔を意識する'},
    {name:'響き',indices:[22,23,29],hint:'声の響きと低音・高音のバランスを試す'},
    {name:'安定',indices:[4,11,33],hint:'息を長く保ち、音の安定を試す'},
    {name:'変化',indices:[1,2,7],hint:'高低や強弱の変化を使い分ける'}
  ]);
  const cap = (n,lo=0,hi=100) => Math.max(lo, Math.min(hi, Number.isFinite(Number(n)) ? Number(n) : lo));
  function phaseAt(instant=Date.now()) {
    const ms=Number(instant);
    const date=new Date((Number.isFinite(ms)?ms:Date.now())+9*3600000);
    const yyyy=date.getUTCFullYear(),mm=date.getUTCMonth(),dd=date.getUTCDate(),hour=date.getUTCHours();
    const serial=Math.floor(Date.UTC(yyyy,mm,dd)/86400000);
    const block=Math.floor(hour/4);
    const slot=((serial+block)%FOCUSES.length+FOCUSES.length)%FOCUSES.length;
    const nextJstHour=(block+1)*4;
    const nextUtc=Date.UTC(yyyy,mm,dd,nextJstHour-9,0,0);
    return {slot,name:FOCUSES[slot].name,hint:FOCUSES[slot].hint,windowId:serial*6+block,block,nextChangeAt:nextUtc};
  }
  function rarityForDNA(dna,instant=Date.now()) {
    const phase=phaseAt(instant);
    if(!dna || dna.version!==1 || !Array.isArray(dna.features) || dna.features.length!==36)
      return {grade:'B',score:0,phase,reason:'声の解析が完了していないためB'};
    const f=dna.features.map(x=>cap(x));
    const average=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const foundation=average([f[10],f[4],f[33],f[1],f[23],f[11],f[7]]);
    const focused=average(FOCUSES[phase.slot].indices.map(i=>f[i]));
    const potential=cap(dna.potential),quality=cap(dna.quality);
    // Repeatable at the same date/time block and acoustic signature. No random roll or raw volume advantage.
    const score=Math.round(foundation*.46+focused*.32+potential*.17+quality*.05);
    const grade=score>=84&&quality>=40?'S+':score>=70?'S':score>=54?'A':'B';
    return {grade,score,phase,reason:'声の組み立て '+Math.round(foundation)+' / 時間帯との相性 '+Math.round(focused)};
  }
  function legacyRarity(cr){
    if(['B','A','S','S+'].includes(cr?.rarity))return cr.rarity;
    if(cr?.audioDNA?.version===1){
      // Legacy characters have no recorded birth window; evaluate once at a fixed reference, not every visit.
      return rarityForDNA(cr.audioDNA,Date.UTC(2026,9,27)).grade;
    }
    return cr?.rank==='A'?'A':'B';
  }
  function slotsForLevel(level){return EVOLUTION_LEVELS.filter(n=>cap(level,1,MAX_LEVEL)>=n).length}
  function nextEvolutionLevel(level,used=0){return EVOLUTION_LEVELS[Math.max(0,Math.min(EVOLUTION_LEVELS.length-1,Math.floor(used)))]||null}
  function canEvolve(cr){
    const count=Array.isArray(cr?.evolutionVoices)?cr.evolutionVoices.length:0;
    return !!cr&&count<EVOLUTION_LEVELS.length&&slotsForLevel(cr.level||1)>count;
  }
  function applyEvolution(cr,voice,dna,clip,instant=Date.now()){
    if(!canEvolve(cr))throw new Error('必要なレベルに到達していないか、声の追加枠が満杯です');
    const validVoice=['vol','pitch','res','rhythm','stable','breath'].every(k=>Number.isFinite(voice?.[k])&&voice[k]>=0&&voice[k]<=100);
    if(!validVoice || !dna || dna.version!==1 || !Array.isArray(dna.features) || dna.features.length!==36)
      throw new Error('追加した声を解析できません。録音し直してください');
    const old=Array.isArray(cr.evolutionVoices)?cr.evolutionVoices:[];
    const acoustic=[2,11,1,33,22],boostIndex=acoustic.reduce((best,idx,i)=>Number(dna.features[idx])>Number(dna.features[acoustic[best]])?i:best,0);
    const gains=Array.from({length:5},(_,i)=>i===boostIndex?2:i===(boostIndex+2)%5?1:0);
    const item={voice:Object.fromEntries(['vol','pitch','res','rhythm','stable','breath'].map(k=>[k,Math.round(voice[k])])),
      signature:(dna.signature>>>0),focus:phaseAt(instant).name,addedAt:Number(instant),boost:gains,
      voiceClip:typeof clip==='string'&&clip.startsWith('data:audio/')&&clip.includes('base64,')&&clip.length<=90000?clip:''};
    const stats=(cr.stats||[]).slice(0,5).map((v,i)=>Math.round(cap(Number(v)+gains[i],25,99)));
    return {...cr,stats,evolutionVoices:[...old,item],evolutionStage:old.length+1};
  }
  return Object.freeze({MAX_LEVEL,EVOLUTION_LEVELS,FOCUSES,phaseAt,rarityForDNA,legacyRarity,
    slotsForLevel,nextEvolutionLevel,canEvolve,applyEvolution});
});
