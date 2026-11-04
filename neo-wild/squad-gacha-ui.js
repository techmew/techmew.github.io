/* Gacha-first title and readable, model-backed single-character collection. */
(()=>{
"use strict";
const OPERABLE=new Set(["cat","dog","fox","wolf","deer","boar","manul","tibetanFox","shoebill"]);
const RARITY={basic:"基本",rare:"希少",legendary:"伝説級"};
const METRICS=[["hp","HP"],["attack","攻撃"],["speed","速度"],["stamina","持久力"]];
const COLORS={cat:"#96a6a1",dog:"#ad8063",fox:"#cd7843",wolf:"#72848a",deer:"#ad8c6a",boar:"#8b786a",crow:"#313d4a",pigeon:"#a3a9a8",otter:"#6c5747",carp:"#ba8e63",tanuki:"#797364",badger:"#868079",macaque:"#9a795b",blackBear:"#353b36",serow:"#807b6b",manul:"#9b9c99",tibetanFox:"#b8a17f",shoebill:"#86989f",lion:"#c69c58",tiger:"#c98946",cheetah:"#c9a765",elephant:"#83878b",hippo:"#78767b",gorilla:"#4d4c4c",giraffe:"#c9a56a",zebra:"#bcbab1",hyena:"#a99a71",wildDog:"#9f846a",armadillo:"#7a7e70",hedgehog:"#877b6b"};
const RADII={shoebill:25,elephant:35,hippo:33,carp:24,hedgehog:13,armadillo:15,manul:17,tibetanFox:17,gorilla:29,giraffe:29,lion:28,tiger:28};
const $=id=>document.getElementById(id);
const el=(tag,cl,text)=>{const node=document.createElement(tag);if(cl)node.className=cl;if(text!==undefined)node.textContent=text;return node};
const makeBtn=(label,fn,cl)=>{const node=el("button",cl,label);node.type="button";node.addEventListener("click",fn);return node};
const ready=()=>{
 const core=window.WildSquad,menu=$("menu");if(!core||!menu||window.WildSquadGachaUI)return;
  const MAX_OWNED=core.MAX_OWNED||3; // 1 operated + 2 stored; prior four/five owned remain saved.
 // Leave the old choice buttons in the DOM solely for SAVE_SCHEMA2 game code.
 // They cannot be seen, focused or used to bypass the new squad flow.
 const oldPicker=menu.querySelector(".animals");
 const legacyTitle=oldPicker?.previousElementSibling;
 if(oldPicker){oldPicker.id="legacy-animal-picker";oldPicker.hidden=true;oldPicker.setAttribute("aria-hidden","true");oldPicker.querySelectorAll("button").forEach(b=>b.tabIndex=-1);}
 if(legacyTitle&&legacyTitle.classList.contains("pick-head")){legacyTitle.hidden=true;legacyTitle.setAttribute("aria-hidden","true");}
 const oldLabel=$("new-game-animal-label");if(oldLabel){oldLabel.hidden=true;oldLabel.setAttribute("aria-hidden","true");}
 const existingHome=$("squad-home");const home=existingHome||el("section","squad-home");home.id="squad-home";home.setAttribute("aria-label","所有動物と操作キャラの選択");
 const gacha=$("squad-open")||makeBtn("ガチャを引く・編成する",()=>{}, "squad-home-gacha");
 // Handler is assigned below after begin exists.
 gacha.id="squad-open";
 const title=home.querySelector(".squad-home-title")||el("h2","squad-home-title");
  title.textContent="所有動物（操作1体＋ストック2体）";
 const roster=$("squad-roster")||el("div","squad-home-roster");roster.id="squad-roster";
 const hint=home.querySelector(".squad-home-hint")||el("p","squad-home-hint","操作する動物は1体。ほかは所有一覧から選択できます。");
 if(!existingHome)home.append(gacha,title,roster,hint);
 const lead=menu.querySelector(".lead")||menu.querySelector(".hero-title");
 if(!existingHome){if(lead)lead.insertAdjacentElement("afterend",home);else menu.querySelector(".menu-shell")?.prepend(home);}
 // Keep all settings visible, with three equal collection tiles.
 const extras=$("squad-menu-extras")||el("section","squad-menu-extras");extras.id="squad-menu-extras";
 const collections=extras.querySelector(".squad-collection-tiles")||el("div","squad-collection-tiles");
 const moveIds=["bestiary-open","world-history-open","trophies-open","new-game-options"];
 for(const id of moveIds){const item=$(id);if(!item)continue;if(id==="new-game-options"){extras.append(item);continue;}item.textContent=({"bestiary-open":"図鑑","world-history-open":"年表","trophies-open":"トロフィー"})[id];collections.append(item);}
 if(!collections.isConnected)extras.prepend(collections);
 if(!extras.isConnected)home.insertAdjacentElement("afterend",extras);
 const root=el("section","squad-gacha");root.id="squad-gacha";root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","編成ガチャ");
 const wrap=el("div","squad-gacha-wrap"),head=el("header","squad-gacha-head");
 const close=makeBtn("× 閉じる",()=>{root.hidden=true;updateHome()},"squad-close");
 head.append(el("h2",null,"編成ガチャ"),close);
 const info=el("p","squad-gacha-info","編成数を選択");info.id="squad-info";
 const body=el("div","squad-gacha-body");body.id="squad-body";
 wrap.append(head,info,body);root.append(wrap);document.body.append(root);
 let size=0,slot=0,slotTarget=0,draw=null,chosen=[],selected=null,streak=0,leader=null,refill=false;
 const denPanel=$("den-inventory");
 const canRefill=()=>{const r=core.load();return !!r?.members?.length&&r.members.length<MAX_OWNED&&(r.gachaTickets||0)>0;};
 const openRefill=(fromTitle=false)=>{
  const r=core.load();
  if(!r?.members?.length||r.members.length>=MAX_OWNED){info.textContent="補充できる空き枠がありません。";return;}
  if((r.gachaTickets||0)<1){info.textContent="ガチャ権がありません。探索や狩りで獲得してください。";return;}
  if(!fromTitle&&!window.__wildSquadAtDen){info.textContent="巣の近くで補充してください。";return;}
  refill=true;size=1;slotTarget=Array.from({length:MAX_OWNED},(_,i)=>i).find(i=>!r.members.some(m=>m.slotIndex===i))??0;chosen=[];streak=0;leader=null;root.hidden=false;nextSlot();
 };
 const refillButton=makeBtn("空き枠に仲間を迎える",()=>{
  openRefill(false);
 },"squad-refill-button");
 if(denPanel){
  refillButton.id="squad-refill-den";
  refillButton.hidden=true;
  denPanel.append(refillButton);
  const refreshDen=()=>{
   const r=core.load(),n=r?.members?.length||0;
   refillButton.hidden=!window.__wildSquadAtDen||n===0||n>=MAX_OWNED;
   refillButton.disabled=!(r?.gachaTickets>0);
   refillButton.textContent="空き枠ガチャ（残り"+(r?.gachaTickets||0)+"権）";
  };
  if(typeof MutationObserver==="function")new MutationObserver(refreshDen).observe(denPanel,{attributes:true,attributeFilter:["class"]});
  refillButton.addEventListener("focus",refreshDen);
 }
 function plot(canvas,type){
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  // Transparent collection preview; the animal itself is the focus, not a black panel.
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle="#567c7760";ctx.beginPath();ctx.ellipse(w*.5,h*.84,w*.3,h*.042,0,0,7);ctx.fill();
  const c=COLORS[type]||"#8a9b95",dark="#273735",light="#e4ddc4",s=Math.min(w/250,h/180);
  ctx.save();ctx.translate(w*.47,h*.72);const ageScale=canvas.dataset.ageStage==="young"?.78:1;ctx.scale(s*ageScale,s*ageScale);
  const oval=(x,y,rx,ry,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()};
  const line=(a,b,x,y,color,width)=>{ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(x,y);ctx.stroke()};
  const ear=(x,y,k)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x-10,y);ctx.lineTo(x,y-23*k);ctx.lineTo(x+10,y);ctx.fill()};
  const bird=["crow","pigeon","shoebill"].includes(type);
  const fish=type==="carp";
  const big=["elephant","hippo","gorilla"].includes(type);
  if(fish){oval(0,-37,80,39,c);ctx.fillStyle="#bfbd9f";ctx.beginPath();ctx.moveTo(-70,-37);ctx.lineTo(-112,-70);ctx.lineTo(-112,-4);ctx.closePath();ctx.fill();ear(0,-70,1);oval(58,-49,5,5,dark);line(15,-31,64,-31,"#5e4437",3);}
  else if(bird){
   for(const dx of [-13,16]){line(dx,-36,dx+2,-2,dark,6);line(dx+2,-2,dx+15,0,dark,3)}
   oval(0,-75,type==="shoebill"?38:32,type==="shoebill"?65:47,c);
   oval(-19,-76,20,33,"#a6adac");oval(7,-127,20,26,c);
   if(type==="shoebill"){oval(38,-121,29,17,"#c1ba91");oval(62,-113,9,13,"#77745c");}
   else{ctx.fillStyle="#cbb875";ctx.beginPath();ctx.moveTo(22,-123);ctx.lineTo(42,-116);ctx.lineTo(22,-113);ctx.fill()}
   oval(15,-137,4,4,"#f8e5ad");oval(16,-137,2,2,dark);
  }else{
   const tall=type==="giraffe",neck=tall?57:0,round=type==="manul"||type==="blackBear"||type==="hippo",wide=type==="elephant"||type==="hippo",small=type==="hedgehog"||type==="armadillo";
   for(const x of [-46,49])for(const z of [-1,1]){const leg=wide?62:tall?76:small?23:41;line(x,z*15-58,x+4,z*15-58+leg,c,wide?20:small?10:13);}
   oval(0,-80,wide?85:small?58:76,wide?51:small?31:36,c);
   if(type==="zebra"){for(const x of [-42,-10,23,45])line(x,-109,x+13,-64,dark,8)}
   if(type==="tiger"||type==="cheetah"){for(const x of [-43,-8,29])oval(x,-95,9,15,dark)}
   if(type==="armadillo"){for(let i=-2;i<=2;i++)line(i*24,-106,i*24+10,-62,"#5f564b",6)}
   if(type==="hedgehog"){for(let i=0;i<13;i++)ear(-55+i*9,-100,1)}
   if(type==="giraffe"){line(59,-91,67,-158,c,26);oval(63,-167,27,21,c);}
   else if(type==="elephant"){oval(74,-99,36,35,c);oval(62,-95,20,27,"#bab7a9");line(95,-92,104,-39,c,21);}
   else{oval(64,-104,round?40:small?24:33,round?34:small?24:29,c);}
   if(!["giraffe","elephant"].includes(type)){
    const y=-133,x=type==="tibetanFox"?60:67;
    if(type==="manul"){oval(45,-135,14,12,c);oval(84,-135,14,12,c);}
    else if(["dog","fox","wolf","cat","lion","tiger","cheetah","tibetanFox","hyena","wildDog"].includes(type)){ear(x-19,y,type==="tibetanFox"?.65:1);ear(x+19,y,type==="tibetanFox"?.65:1);}
    oval(83,-112,22,type==="tibetanFox"?12:14,light);
    oval(84,-114,4,4,dark);oval(75,-126,type==="tibetanFox"?7:5,3,dark);
   }
   if(type==="lion"&&canvas.dataset.sex!=="female")for(let i=0;i<12;i++){const a=i*Math.PI/6;oval(57+Math.cos(a)*29,-111+Math.sin(a)*32,14,15,"#8d633e")}
   if(type==="gorilla")for(const x of [-25,49]){line(x,-85,x+1,-20,dark,23)}
   if(type==="tibetanFox"){line(40,-139,83,-139,dark,2);}
   if((type==="deer"||type==="serow")&&canvas.dataset.sex!=="female"){for(const side of [-1,1]){line(57+side*9,-146,57+side*22,-181,"#c4a477",5);line(57+side*22,-181,57+side*32,-193,"#c4a477",4);}}
   if(type==="fox"||type==="tibetanFox"||type==="wolf"||type==="manul"){line(-65,-82,-111,-105,c,type==="manul"?26:19);oval(-115,-105,15,11,type==="fox"?light:c);}
   else if(type==="cat"||type==="dog")line(-70,-83,-103,-77,c,11);
  }
  ctx.restore();
 }
 function paint(canvas,m){
  if(!canvas||!m)return;canvas.width=canvas.width;const type=m.species,color=COLORS[type]||"#96a6a1";
  canvas.dataset.ageStage=m.ageStage==="young"||m.age==="若い"?"young":"adult";
  canvas.dataset.sex=m.sex==="メス"?"female":"male";
  const model={type,r:(RADII[type]||19)*(canvas.dataset.ageStage==="young"?.8:1),color,belly:"#c6c3b6",age:m.age,sex:m.sex,ageStage:canvas.dataset.ageStage};
  let drawn=false;
  if(window.Wild3D?.available&&window.Wild3D.previewAnimal){
   try{drawn=!!window.Wild3D.previewAnimal(model,canvas,.6,1.75,.12)}catch(_){}
  }
  if(!drawn)plot(canvas,type);
 }
 function preview(m,cl){
  const box=el("div",cl),canvas=el("canvas","squad-animal-preview");
  canvas.width=320;canvas.height=210;
  canvas.setAttribute("role","img");canvas.setAttribute("aria-label",m.speciesName+"のゲーム内動物プレビュー");
  box.append(canvas);
  requestAnimationFrame(()=>{if(canvas.isConnected)paint(canvas,m)});
  return box;
 }
 function metric(k,value){
  const row=el("div","squad-stat");
  row.append(el("span",null,METRICS.find(p=>p[0]===k)[1]),el("strong",value>=1? "＋"+Math.round((value-1)*100)+"%":"−"+Math.round((1-value)*100)+"%"));
  const track=el("div","squad-stat-track");const fill=el("span","squad-stat-fill");
  fill.style.width=Math.max(2,Math.min(100,(value-.6)/.8*100))+"%";
  track.append(fill);row.append(track);return row;
 }
 function detail(m){
  const d=el("div","squad-animal-detail");
  d.append(el("h3",null,m.speciesName+"　"+m.grade+"評価"));
  d.append(el("p","squad-animal-tags",(RARITY[m.rarity]||"基本")+" ／ "+m.sex+" ／ "+m.age+" ／ "+m.personality));
  d.append(el("p","squad-animal-growth","成長型："+m.growthType+"（成長率×"+m.growthRate+"） ／ LV1"));
  const stats=el("div","squad-stats");for(const [k] of METRICS)stats.append(metric(k,Number(m.iv?.[k]||1)));d.append(stats);
  d.append(el("p","squad-animal-ability","追加能力："+(m.abilities?.join("、")||"なし")));
  if(!OPERABLE.has(m.species))d.append(el("p","squad-animal-warning","この動物の専用操作は開発中。編成には採用できますが、現時点ではリーダーに指定できません。"));
  return d;
 }
 function updateHome(){
  roster.replaceChildren();const data=core.load();const members=data?.members||[];
  // Legacy saves can have missing or duplicate slotIndex values. Never hide living animals.
  // Keep valid positions where possible, then place remaining members into free positions.
  const displaySlots=Array(Math.max(MAX_OWNED,members.length)).fill(null);
  const deferred=[];
  for(const member of members){
   const pos=Number(member.slotIndex);
   if(Number.isInteger(pos)&&pos>=0&&pos<displaySlots.length&&!displaySlots[pos])displaySlots[pos]=member;
   else deferred.push(member);
  }
  for(const member of deferred){
   const free=displaySlots.indexOf(null);
   if(free>=0)displaySlots[free]=member;
  }
  for(let i=0;i<displaySlots.length;i++){
   const m=displaySlots[i],card=el("article","squad-roster-slot"+(data?.leaderId===m?.id?" is-leader":""));
   if(!m){if(i<MAX_OWNED&&members.length<MAX_OWNED){const add=makeBtn("＋",()=>openSlot(i),"squad-roster-empty squad-slot-add");add.setAttribute("aria-label",(i+1)+"枠目のガチャを引く");card.append(add,el("small",null,(i+1)+"枠目・空き"));}else card.append(el("small",null,"追加不可"));}
   else{
    const thumb=preview(m,"squad-roster-preview");card.append(thumb);
    // Show the identity and progression of each saved individual, not only its IV.
    // Text nodes avoid inserting untrusted user-defined animal names as HTML.
    const speciesLabel=el("small","squad-species-label",m.speciesName||m.species);
    const identity=el("strong","squad-individual-name",m.name||m.speciesName||"名前なし");
    const rarity=RARITY[m.rarity]||"基本";
    const level=Math.max(1,Math.floor(Number(m.level)||1));
    const rank=el("small","squad-individual-rank","Lv."+level+"｜"+rarity+"｜"+(m.grade||"D")+"評価");
    const growth=el("small","squad-individual-growth",(m.growthType||"標準成長")+"｜成長率 "+(Number.isFinite(Number(m.growthRate))?Number(m.growthRate).toFixed(2):"1.00"));
    const iv=el("small","squad-individual-iv","HP "+Math.round((m.iv?.hp||1)*100)+" / 攻 "+Math.round((m.iv?.attack||1)*100)+" / 速 "+Math.round((m.iv?.speed||1)*100)+" / 持 "+Math.round((m.iv?.stamina||1)*100));
    card.append(speciesLabel,identity,rank,growth,iv);
   }
   if(m){
    const active=data.leaderId===m.id;
    if(active){card.prepend(el("span","squad-active-badge","操作中"));card.setAttribute("aria-current","true");}
    else card.setAttribute("aria-current","false");
    const choose=()=>{
     const latest=core.load();
     if(!latest?.members?.some(q=>q.id===m.id))return;
     if(core.selectActive(m.id).ok){
      updateHome();
      window.dispatchEvent(new CustomEvent("wild-squad-selected",{detail:{memberId:m.id}}));
     }
    };
    const select=makeBtn(active?"現在操作中":"この個体を操作",choose,"squad-roster-select");
    select.disabled=active;select.setAttribute("aria-pressed",String(active));
    card.append(select);
    // Explicit one-tap continuation: select the living ID first, then use the
    // existing continue path so the saved world and exploration are retained.
    const resume=makeBtn(active?"この個体で続きから":"選んで続きから",()=>{
     const latest=core.load();
     if(!latest?.members?.some(q=>q.id===m.id)){updateHome();return;}
     if(latest.leaderId!==m.id&&!core.selectActive(m.id).ok){updateHome();return;}
     window.dispatchEvent(new CustomEvent("wild-squad-selected",{detail:{memberId:m.id}}));
     updateHome();
     const next=core.load();
     if(next?.leaderId!==m.id||!next.members?.some(q=>q.id===m.id))return;
     $("continue-btn")?.click();
    },"squad-resume-character");
    resume.setAttribute("aria-label",(m.name||m.speciesName||"動物")+"を操作して続きから");
    card.append(resume);
    card.setAttribute("aria-label",(m.name||m.speciesName||"動物")+(active?"・現在操作中":"・ストック"));
    // Explicit selection prevents accidental character switching while scrolling.
    const releaseButton=makeBtn("野生に放つ",()=>confirmRelease(m),"squad-release-character");
    releaseButton.setAttribute("aria-label",(m.name||m.speciesName||"動物")+"を野生に放つ");
    card.append(releaseButton);

   }
   // Stock slots only become active through their explicit button.
   roster.append(card);
  }
  const tickets=data?.gachaTickets||0;
  hint.textContent=!members.length?"＋を押して最初の動物を選択（無料）":data.pendingStart?"出発前は空き枠を無料で追加できます。":"所有 "+members.length+"/"+MAX_OWNED+"体｜ガチャ権 "+tickets+"枚。狩り8回・共有経験値600・探索2地点・ミッション完了で獲得。"+(members.length>MAX_OWNED?"旧セーブの4〜5体は保護中。削除せず、3体未満になるまでガチャ補充できません。":members.length===MAX_OWNED?"上限に達しています。死亡・野生への放流で枠が空くまで追加できません。":"");
  gacha.hidden=true;
 }
 function showSize(){
  info.textContent="最初の動物をガチャで獲得。初回＋最大3回引き直せます。";
  body.replaceChildren();
  const pane=el("div","squad-count-choices");
  pane.append(makeBtn("ガチャを引く",()=>{size=1;nextSlot()},"squad-count-button"));
  body.append(pane,el("p","squad-small-note","個体は1匹ずつ採用。引き直した候補も選べます。操作中1体＋ストック2体で合計3体。死亡した個体は永久に消えます。"));
 }
 function nextSlot(){
  if(chosen.length>=size){finish();return}
  slot=chosen.length+1;
  // The world clock persists through party wipes. Do not lock rare species
  // back to year zero when a survivor refills a vacancy or a squad is lost.
  let year=0,explored=0;
  try{
   const chronicle=JSON.parse(localStorage.getItem("wild-reclaim-world-chronicle-v1")||"null");
   year=Math.max(0,Number(chronicle?.worldYearsElapsed)||Math.floor((Number(chronicle?.elapsed)||0)/120));
  }catch(_){}
  const liveClock=window.WildWorldTime?.getState?.();
  if(Number.isFinite(liveClock?.year))year=Math.max(year,liveClock.year);
  if(localStorage.getItem("wild-reclaim-explicit-new-world-v1")==="1"||core.load()?.newWorldOnStart)year=0;
  draw=core.drawSlot(year,explored,streak);draw.roll();selected=draw.options[0].id;showDraw();
 }
 function showDraw(){
  info.textContent=(slotTarget+1)+"枠目のガチャ　残り引き直し "+(4-draw.options.length)+"回";
  body.replaceChildren();
  const option=draw.options.find(m=>m.id===selected)||draw.options[0];selected=option.id;
  const hero=el("article","squad-featured squad-rarity-"+(option.rarity||"basic"));
  hero.setAttribute("aria-label",(RARITY[option.rarity]||"基本")+"の抽選個体");
  hero.append(preview(option,"squad-featured-image"),detail(option));body.append(hero);
  const reveal=el("div","squad-rarity-reveal squad-rarity-"+(option.rarity||"basic"),"抽選結果："+(RARITY[option.rarity]||"基本")+" ／ "+option.grade+"評価");
  reveal.setAttribute("role","status");body.insertBefore(reveal,hero);
  const group=el("div","squad-options");group.setAttribute("role","group");group.setAttribute("aria-label","抽選済み候補");
  for(const m of draw.options){
   const card=makeBtn("",()=>{selected=m.id;showDraw()},"squad-candidate"+(selected===m.id?" selected":""));
   card.setAttribute("aria-pressed",String(selected===m.id));
   card.append(preview(m,"squad-candidate-image"),el("strong",null,m.speciesName),el("span",null,m.grade+"評価　"+(RARITY[m.rarity]||"基本")));
   const mini=el("small",null,"HP "+Math.round(m.iv.hp*100)+" / 攻 "+Math.round(m.iv.attack*100)+" / 速 "+Math.round(m.iv.speed*100)+" / 持 "+Math.round(m.iv.stamina*100));card.append(mini);
   card.append(el("small",null,m.sex+"・"+m.age+"・"+m.growthType+" ×"+m.growthRate));
   if(m.id!==selected){const selectedMember=draw.options.find(x=>x.id===selected);if(selectedMember){const diff=METRICS.map(([k,label])=>{const d=Math.round((m.iv[k]-selectedMember.iv[k])*100);return label+(d>=0?"+":"")+d}).join(" / ");card.append(el("small","squad-candidate-diff","選択中との差 "+diff));}}
   group.append(card);
  }
  body.append(el("h3","squad-option-title","引いた候補から選択"),group);
  const actions=el("footer","squad-gacha-actions");
  const reroll=makeBtn("もう一度引く（残り"+(4-draw.options.length)+"回）",()=>{draw.roll();showDraw()},"squad-reroll");
  reroll.disabled=draw.options.length>=4;
  const choose=makeBtn("この個体を採用 →",()=>{const m=draw.choose(selected);streak=["C","D"].includes(m.grade)?streak+1:0;m.slotIndex=slotTarget;chosen.push(m);nextSlot()},"squad-adopt");
  actions.append(reroll,choose);body.append(actions);
 }
 function finish(){
  info.textContent=(slotTarget+1)+"枠目に採用する個体を確認";
  body.replaceChildren();leader=leader&&chosen.some(m=>m.id===leader)?leader:(chosen.find(m=>OPERABLE.has(m.species))?.id||chosen[0]?.id);
  for(const m of chosen){
   const card=el("article","squad-final-member"+(m.id===leader?" selected":""));
   card.append(preview(m,"squad-final-image"));
   const field=el("div","squad-final-field");
   field.append(el("strong",null,m.speciesName+"　"+m.grade+"評価"));
   const label=el("label",null,"名前：");const input=el("input",null);input.value=m.name;input.maxLength=18;input.setAttribute("aria-label",m.speciesName+"の名前");
   input.addEventListener("input",()=>{m.name=input.value.trim()||m.speciesName});
   label.append(input);field.append(label,el("p",null,"HP "+Math.round(m.iv.hp*100)+"% ／ 攻撃 "+Math.round(m.iv.attack*100)+"% ／ 速度 "+Math.round(m.iv.speed*100)+"% ／ 持久 "+Math.round(m.iv.stamina*100)+"%"));
   const btn=makeBtn(m.id===leader?"✓ リーダー":"リーダーに指定",()=>{if(!OPERABLE.has(m.species)){info.textContent="未実装の操作種はリーダーに指定できません。";return}leader=m.id;finish()},"squad-leader-button");
   btn.setAttribute("aria-pressed",String(m.id===leader));field.append(btn);card.append(field);body.append(card);
  }
  const actions=el("footer","squad-gacha-actions");
  actions.append(makeBtn("最後のガチャに戻る",()=>{chosen.pop();nextSlot()},"squad-reroll"));
  const confirm=makeBtn("この個体を"+(slotTarget+1)+"枠目に採用",()=>{
   if(!refill&&!chosen.some(m=>OPERABLE.has(m.species))){info.textContent="操作可能な動物がいません。最後のガチャに戻ってください。";return}
   const chosenLeader=chosen.find(m=>m.id===leader);
   if(!refill&&(!chosenLeader||!OPERABLE.has(chosenLeader.species))){info.textContent="操作可能なリーダーを選んでください。";return}
   if(refill){
    const current=core.load();
    if((!window.__wildSquadAtDen&&$("menu")?.classList.contains("hidden"))||!current?.members?.length||current.members.length>=MAX_OWNED){info.textContent="タイトル画面か巣で空き枠を確認してください。";return;}
    const result=current.pendingStart?core.addInitialSlot(chosen[0]):core.fillVacancy(chosen[0]);
    if(!result.ok){info.textContent=result.reason;return;}
    root.hidden=true;updateHome();
    window.dispatchEvent(new CustomEvent("wild-squad-refilled",{detail:{memberId:chosen[0].id}}));
    window.dispatchEvent(new Event("wild-squad-updated"));
    return;
   }
   if((core.load()?.members||[]).length){info.textContent="生存中の個体は破棄できません。";return;}
   core.newSquad(chosen,leader);updateHome();root.hidden=true;
   window.dispatchEvent(new Event("wild-squad-updated"));
  },"squad-adopt");
  actions.append(confirm);body.append(actions);
 }
 function showLivingSquad(){
  const current=core.load(),members=current?.members||[];
  if(!members.length){showSize();return;}
  info.textContent="所有動物 "+members.length+"/"+MAX_OWNED+"体。操作中1体、ほかはストックです。死亡すると永久に消えます。";
  body.replaceChildren();
  const rosterGrid=el("div","squad-living-grid");
  for(const member of members){
   const isLeader=current.leaderId===member.id;
   const card=el("article","squad-final-member"+(isLeader?" selected":""));
   card.append(preview(member,"squad-final-image"));
   const field=el("div","squad-final-field");
   field.append(el("strong",null,(isLeader?"▼ 操作中　":"")+(member.name||member.speciesName)));
   field.append(el("p",null,"LV"+(member.level||1)+"・"+member.grade+"評価・"+(RARITY[member.rarity]||"基本")));
   field.append(el("p",null,member.sex+"・"+member.age+"・"+member.personality+"・"+member.growthType));
   field.append(el("p",null,"HP "+Math.round((member.hpRatio??1)*100)+"%／能力値 HP "+Math.round((member.iv?.hp??1)*100)+"・攻 "+Math.round((member.iv?.attack??1)*100)+"・速 "+Math.round((member.iv?.speed??1)*100)+"・持 "+Math.round((member.iv?.stamina??1)*100)));
   card.append(field);
   if(!isLeader)card.append(makeBtn("この個体を操作",()=>{
    if(core.selectActive(member.id).ok){
     showLivingSquad();updateHome();
     window.dispatchEvent(new CustomEvent("wild-squad-selected",{detail:{memberId:member.id}}));
    }
   },"squad-select-character"));
   card.append(makeBtn("野生に放つ",()=>confirmRelease(member),"squad-release-character"));
   rosterGrid.append(card);
  }
  body.append(rosterGrid);
  body.append(el("p","squad-small-note","ガチャ権："+(current.gachaTickets||0)+"枚。生存中は編成を上書きしません。"));
  const actions=el("footer","squad-gacha-actions");
  if(members.length<MAX_OWNED){const b=makeBtn("空き枠ガチャ（残り"+(current.gachaTickets||0)+"権）",()=>openRefill(true),"squad-refill-button");b.disabled=!canRefill();actions.append(b);if(!canRefill())body.append(el("p","squad-small-note","補充にはガチャ権が必要です。探索・狩り・ミッションで獲得できます。"));}
  actions.append(makeBtn("選択中の個体で出発",()=>{const current=core.load();if(!current?.members?.some(m=>m.id===current.leaderId)){message("操作する個体を所有一覧から選択してください。");return;}root.hidden=true;updateHome();$("continue-btn")?.click();},"squad-adopt"));
  actions.append(makeBtn("閉じる",()=>{root.hidden=true;updateHome();},"squad-close"));
  body.append(actions);
 }
 function message(text){
  root.hidden=false;body.replaceChildren();info.textContent=text;
  body.append(makeBtn("閉じる",()=>{root.hidden=true;updateHome()},"squad-close"));
 }
 function openSlot(index){
  const current=core.load(),members=current?.members||[];
  if(!Number.isInteger(index)||index<0||index>=MAX_OWNED||members.some(m=>m.slotIndex===index))return;
  // Reject field gacha before drawing: only the title screen or an actual den may replenish stock.
  if(members.length&&!current?.pendingStart&&$("menu")?.classList.contains("hidden")&&!window.__wildSquadAtDen){
   message("追加ガチャはタイトル画面か巣でのみ利用できます。巣に戻るかタイトルへ移動してください。");
   return;
  }
  if(members.length&&!current.pendingStart&&(current.gachaTickets||0)<1){
   message("ガチャ権が0枚です。獲得方法：続きからプレイ → 獲物8匹・共有経験値600・探索地点2か所・チュートリアル完了で獲得する → タイトルか巣で空き枠の＋を押す。最初の編成は無料です。");
   const play=makeBtn("続きからプレイ",()=>{root.hidden=true;updateHome();$("continue-btn")?.click();},"squad-adopt");
   body.prepend(play);return;
  }
  refill=members.length>0;slotTarget=index;size=1;chosen=[];draw=null;selected=null;streak=0;
  leader=null;root.hidden=false;nextSlot();root.scrollTop=0;
 }
 function confirmRelease(member){
  const latest=core.load();
  if(!latest?.members?.some(m=>m.id===member.id)){
   updateHome();return;
  }
  // This action also starts on a title-screen roster card while the gacha
  // overlay is hidden. Show the confirmation before accepting any release.
  const wasHidden=root.hidden;
  root.hidden=false;
  root.scrollTop=0;
  const name=member.name||member.speciesName||"動物";
  message(name+"を野生に放ちますか？ この個体は所有に戻せません。野生では強化個体として再登場します。"+(latest.members.length===1?" 最後の個体なので次はガチャから再出発します。":""));
  body.replaceChildren();
  const actions=el("footer","squad-gacha-actions");
  const cancel=()=>{if(wasHidden){root.hidden=true;updateHome();}else{showLivingSquad();}};
  const confirm=makeBtn("放流を確定",()=>{
   if(confirm.disabled)return;
   confirm.disabled=true;
   let result;
   try{result=core.release(member.id)}
   catch(_){confirm.disabled=false;info.textContent="放流の保存に失敗しました。再試行するかキャンセルしてください。";return;}
   if(!result?.ok){
    confirm.disabled=false;
    info.textContent=result?.reason||"所有情報が変更されました。キャンセルして一覧を更新してください。";
    return;
   }
   root.hidden=true;updateHome();
   window.dispatchEvent(new CustomEvent("wild-squad-released",{detail:{memberId:member.id,newLeaderId:result.newLeaderId}}));
   window.dispatchEvent(new CustomEvent("wild-animal-released",{detail:{animal:result.released}}));
   window.dispatchEvent(new Event("wild-squad-updated"));
  },"squad-release");
  actions.append(confirm,makeBtn("キャンセル",cancel,"squad-close"));
  body.append(actions);
  requestAnimationFrame(()=>{if(!root.hidden)actions.querySelector("button.squad-close")?.focus();});
 }
 function confirmReset(){
  message("ゲームをリセットして新規で開始しますか？現在の編成と自動セーブは消えます。チュートリアルの完了記録は残ります。");
  body.replaceChildren();
  const actions=el("footer","squad-gacha-actions");
  actions.append(makeBtn("リセットする",()=>{
   core.resetForNewGame();
   try{localStorage.removeItem("wild-reclaim-autosave-v2")}catch(_){}
   root.hidden=true;updateHome();
   window.dispatchEvent(new Event("wild-squad-reset"));
  },"squad-adopt"),makeBtn("キャンセル",()=>{root.hidden=true;updateHome()},"squad-close"));
  body.append(actions);
 }
 function begin(){
  if((core.load()?.members||[]).length){refill=false;root.hidden=false;showLivingSquad();root.scrollTop=0;return;}
  refill=false;size=0;slot=0;chosen=[];draw=null;selected=null;streak=0;leader=null;
  root.hidden=false;showSize();root.scrollTop=0;
 }
 // Gamepad/keyboard-friendly gacha: keep focus inside the modal and return it on close.
 let lastFocus=null;
 const oldBegin=begin;
 root.addEventListener("keydown",event=>{
  if(root.hidden)return;
  if(event.key==="Escape"){event.preventDefault();close.click();return;}
  if(event.key!=="Tab")return;
  const controls=[...root.querySelectorAll("button:not([disabled]),input:not([disabled])")].filter(node=>node.getClientRects().length);
  if(!controls.length)return;
  const first=controls[0],last=controls[controls.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 const focusGacha=()=>{if(root.hidden)return;lastFocus=document.activeElement;requestAnimationFrame(()=>close.focus());};
 const restoreGachaFocus=()=>{if(lastFocus?.isConnected)requestAnimationFrame(()=>lastFocus.focus());};
 new MutationObserver(()=>{
  if(root.hidden)restoreGachaFocus();
  else focusGacha();
 }).observe(root,{attributes:true,attributeFilter:["hidden"]});
 gacha.addEventListener("click",begin);
 const resetButton=$("start-btn");if(resetButton){resetButton.textContent="ゲームをリセットして新規で開始する";resetButton.addEventListener("click",confirmReset);}
 $("checkpoint-menu-btn")?.classList.add("hidden");$("checkpoint-list")?.classList.add("hidden");
 $("spawn-picker")?.classList.add("hidden");
 menu.querySelector(".menu-foot")?.remove();
 menu.querySelector(".landscape-menu-choice .pick-head")?.remove();
 // Refresh the roster whenever the title is shown after a death or a pause.
 if(typeof MutationObserver==="function"){
  const observer=new MutationObserver(()=>{if(!menu.classList.contains("hidden"))updateHome()});
  observer.observe(menu,{attributes:true,attributeFilter:["class"]});
 }
 window.WildSquadGachaUI={open:begin,openSlot,confirmReset,refresh:updateHome};home.dataset.initialized="true";
 updateHome();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();