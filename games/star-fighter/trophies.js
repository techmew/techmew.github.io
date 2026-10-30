/* STAR FIGHTER / 300 trophy catalog — original names and measurable conditions.
 * 30 independent disciplines x 10 thresholds, cosmetic only; never changes power.
 * No external assets. 4 legacy medals remain separate, compatible and untouched. */
(function(window,document,localStorage){
 'use strict';
 const TIERS=["初灯","流星","烈風","星辰","蒼翼","銀河","閃光","超新星","深宇宙","永遠の星"];
 const GROUPS=[{"key":"sorties","name":"銀翼の旅立ち","activity":"出撃","unit":"回","goals":[1,3,5,10,20,35,55,85,130,200],"i":0},{"key":"flight","name":"星間航続記録","activity":"累計飛行","unit":"秒","goals":[60,180,360,720,1440,2400,4000,7200,12000,21600],"i":1},{"key":"kills","name":"機影を貫く者","activity":"累計通常敵撃破","unit":"機","goals":[10,35,80,160,330,650,1100,1800,3200,5500],"i":2},{"key":"elites","name":"精鋭狩りの刃","activity":"累計精鋭敵撃破","unit":"機","goals":[1,3,7,14,25,42,68,110,170,260],"i":3},{"key":"bosses","name":"巨影討滅録","activity":"累計ボス撃破","unit":"体","goals":[1,3,6,12,22,38,65,110,170,260],"i":4},{"key":"sectors","name":"宙域の踏破者","activity":"累計ステージ突破","unit":"面","goals":[1,3,8,16,32,64,110,180,280,420],"i":5},{"key":"wins","name":"八宙域の覇者","activity":"全8面の完走","unit":"回","goals":[1,2,3,5,8,13,21,34,55,89],"i":6},{"key":"totalScore","name":"星貨の大河","activity":"累計獲得スコア","unit":"点","goals":[1000,5000,20000,60000,150000,350000,800000,1800000,4000000,10000000],"i":7},{"key":"bestScore","name":"最高点の彗星","activity":"1周最高スコア","unit":"点","goals":[2000,10000,25000,50000,100000,180000,300000,450000,650000,900000],"i":8},{"key":"grazes","name":"弾幕を撫でる翼","activity":"累計GRAZE","unit":"回","goals":[1,10,30,70,140,280,500,850,1400,2400],"i":9},{"key":"grazeBest","name":"紙一重の舞踏","activity":"1周最大GRAZE","unit":"回","goals":[1,5,10,20,35,55,80,110,150,200],"i":10},{"key":"comboBest","name":"連撃の螺旋","activity":"1周最大コンボ","unit":"連","goals":[3,5,8,12,18,25,36,50,75,110],"i":11},{"key":"safeRoutes","name":"静穏航路の先導者","activity":"補給航路の選択","unit":"回","goals":[1,3,7,14,24,40,65,105,165,260],"i":12},{"key":"riskRoutes","name":"嵐の航路の開拓者","activity":"高危険航路の選択","unit":"回","goals":[1,3,7,14,24,40,65,105,165,260],"i":13},{"key":"capsules","name":"パワーカプセル収集家","activity":"カプセル回収","unit":"個","goals":[1,4,10,20,40,70,125,210,350,600],"i":14},{"key":"novas","name":"ノヴァの轟雷","activity":"NOVA発動","unit":"回","goals":[1,3,7,15,28,50,85,135,210,330],"i":15},{"key":"overdrives","name":"限界超越の鼓動","activity":"OVERDRIVE発動","unit":"回","goals":[1,2,5,10,18,30,50,80,125,200],"i":16},{"key":"rewards","name":"戦利品の鑑定士","activity":"ボス報酬獲得","unit":"回","goals":[1,3,8,16,30,50,85,135,220,360],"i":17},{"key":"events","name":"遭遇譚の航海士","activity":"航路イベント発生","unit":"回","goals":[1,3,7,14,24,42,70,115,180,280],"i":18},{"key":"cleanSectors","name":"無傷の境界線","activity":"被弾ゼロでステージ突破","unit":"面","goals":[1,2,4,8,15,25,40,65,100,160],"i":19},{"key":"perfectRuns","name":"不触の八面踏破","activity":"一度も被弾せず全8面完走","unit":"回","goals":[1,2,3,5,8,12,18,28,42,65],"i":20},{"key":"manualUpgrades","name":"鋼翼の改装師","activity":"手動強化","unit":"回","goals":[1,3,8,16,30,52,85,135,220,360],"i":21},{"key":"shieldSaves","name":"守護障壁の伝承","activity":"バリアで被弾を防御","unit":"回","goals":[1,3,7,14,25,42,68,108,170,270],"i":22},{"key":"carrierKills","name":"輸送艦の追跡者","activity":"輸送艦撃破","unit":"機","goals":[1,3,7,15,30,50,85,140,230,370],"i":23},{"key":"weapon0","name":"BOOSTの騎手","activity":"BOOSTの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":24},{"key":"weapon1","name":"SPREADの扇","activity":"SPREADの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":25},{"key":"weapon2","name":"LASERの一閃","activity":"LASERの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":26},{"key":"weapon3","name":"MISSILEの射手","activity":"MISSILEの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":27},{"key":"weapon4","name":"OPTIONの編隊長","activity":"OPTIONの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":28},{"key":"weapon5","name":"SHIELDの守護者","activity":"SHIELDの手動強化","unit":"回","goals":[1,2,4,7,12,20,33,52,78,115],"i":29}];
 const KEY='star_fighter_trophies_v1';
 const CATALOG=Object.freeze(GROUPS.flatMap(group=>group.goals.map((goal,rank)=>Object.freeze({
  id:group.key+'-'+String(rank+1).padStart(2,'0'),
  group:group.key,category:group.name,rank:rank+1,
  name:group.name+'・'+TIERS[rank],
  description:group.activity+'を'+goal.toLocaleString('ja-JP')+group.unit+'達成',
  goal,unit:group.unit,kind:group.activity
 }))));
 const BY_GROUP=new Map(GROUPS.map(g=>[g.key,CATALOG.filter(t=>t.group===g.key)]));
 if(CATALOG.length!==300||new Set(CATALOG.map(t=>t.name)).size!==300)throw Error('trophy catalog must have 300 unique titles');
 const metrics=Object.create(null);
 for(const g of GROUPS)metrics[g.key]=0;
 const VALID_IDS=new Set(CATALOG.map(t=>t.id));
 const gallery=document.getElementById('trophyGallery');
 const grid=document.getElementById('trophyGrid');
 const button=document.getElementById('trophyBtn');
 const counter=document.getElementById('trophyCount');
 const progress=document.getElementById('trophyProgress');
 const category=document.getElementById('trophyCategory');
 const status=document.getElementById('trophyStatus');
 const search=document.getElementById('trophySearch');
 const close=document.getElementById('trophyClose');
 function validNumber(x){return typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e12}
 function read(){
  try{
   const d=JSON.parse(localStorage.getItem(KEY)||'null');
   if(!d||d.v!==1||!d.stats||typeof d.stats!=='object'||!Array.isArray(d.unlocked))throw Error('no stored trophies');
   if(d.unlocked.length>300||new Set(d.unlocked).size!==d.unlocked.length||
      !d.unlocked.every(id=>VALID_IDS.has(id))||
      !GROUPS.every(g=>validNumber(d.stats[g.key])))throw Error('invalid trophy record');
   return {v:1,stats:Object.fromEntries(GROUPS.map(g=>[g.key,d.stats[g.key]])),unlocked:d.unlocked.slice()};
  }catch(_){return {v:1,stats:Object.fromEntries(GROUPS.map(g=>[g.key,0])),unlocked:[]}}
 }
 const state=read(),earned=new Set(state.unlocked);
 let active=false,debug=false,elapsed=0,dirty=false,lastSave=0,lastScore=0,lastGraze=0,hitsStage=0,hitsRun=0;
 const displayNum=n=>Math.floor(n).toLocaleString('ja-JP');
 const progressFor=t=>Math.min(100,Math.floor(100*state.stats[t.group]/t.goal));
 function refreshCounter(){
  button.textContent='トロフィー '+earned.size+'/300 · 一覧を見る';
  counter.textContent=earned.size+' / 300 解放 · '+(300-earned.size)+' 未解放';
  progress.style.width=(earned.size/3)+'%';
 }
 function write(){
  if(!dirty)return;
  try{localStorage.setItem(KEY,JSON.stringify(state));dirty=false;lastSave=elapsed}catch(_){}
 }
 function evaluate(metric){
  const items=BY_GROUP.get(metric);if(!items)return;
  for(const trophy of items)if(!earned.has(trophy.id)&&state.stats[metric]>=trophy.goal){
   earned.add(trophy.id);state.unlocked.push(trophy.id);dirty=true;
  }
  refreshCounter();
 }
 function add(metric,amount=1){
  if(!active||debug||!Object.prototype.hasOwnProperty.call(state.stats,metric)||
    !validNumber(amount)||amount===0)return;
  state.stats[metric]=Math.min(1e12,state.stats[metric]+amount);
  dirty=true;const before=earned.size;
  evaluate(metric);
  if(earned.size!==before)write();
 }
 function peak(metric,value){
  if(!active||debug||!validNumber(value)||value<=state.stats[metric])return;
  state.stats[metric]=value;dirty=true;
  const before=earned.size;evaluate(metric);if(earned.size!==before)write();
 }
 function begin(isDebug=false,resume=false){
  active=true;debug=!!isDebug;hitsStage=0;hitsRun=0;lastScore=0;lastGraze=0;
  if(!debug&&!resume)add('sorties',1);
 }
 function setDebug(value){if(value)write();debug=!!value}
 function baseline(snapshot){
  lastScore=Math.max(0,Number(snapshot?.score)||0);
  lastGraze=Math.max(0,Number(snapshot?.grazes)||0);
 }
 function observe(dt,snapshot={}){
  if(!active||debug)return;
  if(validNumber(dt)&&dt>0)add('flight',Math.min(dt,.1));
  const score=Math.max(0,Number(snapshot.score)||0),graze=Math.max(0,Number(snapshot.grazes)||0);
  if(score>lastScore)add('totalScore',score-lastScore);
  if(graze>lastGraze)add('grazes',graze-lastGraze);
  lastScore=score;lastGraze=graze;
  peak('bestScore',score);peak('grazeBest',graze);
  peak('comboBest',Math.max(0,Number(snapshot.maxCombo)||0));
  elapsed+=dt||0;if(elapsed-lastSave>=4)write();
 }
 function hit(blocked=false){
  if(!active||debug)return;
  hitsStage++;hitsRun++;if(blocked)add('shieldSaves',1);
 }
 function sectorClear(){
  if(!active||debug)return;
  add('sectors',1);add('bosses',1);
  if(hitsStage===0)add('cleanSectors',1);
  hitsStage=0;
 }
 function finish(won,snapshot){
  if(!active)return;
  if(!debug){
   observe(0,snapshot);
   if(won){add('wins',1);if(hitsRun===0)add('perfectRuns',1)}
  }
  active=false;write();
 }
 function resetAfterResume(snapshot){baseline(snapshot);hitsStage=0;hitsRun=0}
 function formatCard(t){
  const unlocked=earned.has(t.id);
  const got=state.stats[t.group],pct=progressFor(t);
  return '<article class="trophy-tile '+(unlocked?'earned':'locked')+'" aria-label="'+t.name+' '+(unlocked?'獲得済み':'未達成')+'">'+
   '<div class="trophy-tile-title"><b>'+(unlocked?'◆':'◇')+' '+t.name+'</b><small>'+String(t.rank).padStart(2,'0')+'/10</small></div>'+
   '<p>'+t.description+'</p><div class="trophy-tile-progress"><i style="width:'+pct+'%"></i></div>'+
   '<small>'+(unlocked?'獲得済み · ':'進捗 ') +displayNum(Math.min(got,t.goal))+' / '+displayNum(t.goal)+t.unit+'</small></article>';
 }
 function draw(){
  const cat=category.value||'all',st=status.value||'all',term=(search.value||'').trim().toLowerCase();
  const list=CATALOG.filter(t=>(cat==='all'||t.group===cat)&&
   (st==='all'||(st==='earned')===earned.has(t.id))&&
   (!term||(t.name+' '+t.description+' '+t.category).toLowerCase().includes(term)));
  grid.innerHTML=list.map(formatCard).join('');
  document.getElementById('trophyShown').textContent=list.length+'件を表示';
  refreshCounter();
 }
 function open(){
  gallery.hidden=false;category.value='all';status.value='all';search.value='';
  draw();gallery.scrollTop=0;grid.scrollTop=0;
 }
 function hide(){gallery.hidden=true}
 for(const g of GROUPS){
  const option=document.createElement?document.createElement('option'):null;
  if(option){option.value=g.key;option.textContent=g.name;category.appendChild(option)}
 }
 button.addEventListener('click',open);
 close.addEventListener('click',hide);
 category.addEventListener('change',draw);status.addEventListener('change',draw);
 search.addEventListener('input',draw);
 gallery.addEventListener('click',e=>{if(e.target===gallery)hide()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!gallery.hidden){hide();e.preventDefault()}});
 window.addEventListener('pagehide',write);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)write()});
 gallery.hidden=true;refreshCounter();
 window.STAR_TROPHIES=Object.freeze({
  catalog:CATALOG,groups:GROUPS,state,read,
  begin,setDebug,baseline,observe,event:add,peak,hit,sectorClear,finish,resetAfterResume,
  show:open,hide,refresh:draw,flush:write,metric:key=>state.stats[key]||0,
  earned:id=>earned.has(id),count:()=>earned.size,
  isDebug:()=>debug,isActive:()=>active
 });
})(window,document,localStorage);
