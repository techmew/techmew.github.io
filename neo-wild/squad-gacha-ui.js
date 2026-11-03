/* Gacha-first title and readable, model-backed squad comparison. No stock. */
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
 const core=window.WildSquad,menu=$("menu");if(!core||!menu||$("squad-home"))return;
 // Leave the old choice buttons in the DOM solely for SAVE_SCHEMA2 game code.
 // They cannot be seen, focused or used to bypass the new squad flow.
 const oldPicker=menu.querySelector(".animals");
 const legacyTitle=oldPicker?.previousElementSibling;
 if(oldPicker){oldPicker.id="legacy-animal-picker";oldPicker.hidden=true;oldPicker.setAttribute("aria-hidden","true");oldPicker.querySelectorAll("button").forEach(b=>b.tabIndex=-1);}
 if(legacyTitle&&legacyTitle.classList.contains("pick-head")){legacyTitle.hidden=true;legacyTitle.setAttribute("aria-hidden","true");}
 const oldLabel=$("new-game-animal-label");if(oldLabel){oldLabel.hidden=true;oldLabel.setAttribute("aria-hidden","true");}
 const home=el("section","squad-home");home.id="squad-home";home.setAttribute("aria-label","編成ガチャと現在の仲間");
 const gacha=makeBtn("ガチャを引く・編成する",()=>{}, "squad-home-gacha");
 // Handler is assigned below after begin exists.
 gacha.id="squad-open";
 const title=el("h2","squad-home-title","現在の編成");
 const roster=el("div","squad-home-roster");roster.id="squad-roster";
 const hint=el("p","squad-home-hint","ストックなし・最大3体。ガチャで編成して出発。");
 home.append(gacha,title,roster,hint);
 const lead=menu.querySelector(".lead")||menu.querySelector(".hero-title");
 if(lead)lead.insertAdjacentElement("afterend",home);else menu.querySelector(".menu-shell")?.prepend(home);
 // Collapse rarely used information instead of stacking buttons in two columns.
 const extras=el("details","squad-menu-extras");extras.id="squad-menu-extras";
 extras.append(el("summary",null,"その他・画面設定・探索記録"));
 const moveIds=["bestiary-open","world-history-open","trophies-open","new-game-options"];
 for(const id of moveIds){const item=$(id);if(item)extras.append(item);}
 home.insertAdjacentElement("afterend",extras);
 const root=el("section","squad-gacha");root.id="squad-gacha";root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.setAttribute("aria-label","編成ガチャ");
 const wrap=el("div","squad-gacha-wrap"),head=el("header","squad-gacha-head");
 const close=makeBtn("× 閉じる",()=>{root.hidden=true;updateHome()},"squad-close");
 head.append(el("h2",null,"編成ガチャ"),close);
 const info=el("p","squad-gacha-info","編成数を選択");info.id="squad-info";
 const body=el("div","squad-gacha-body");body.id="squad-body";
 wrap.append(head,info,body);root.append(wrap);document.body.append(root);
 let size=0,slot=0,draw=null,chosen=[],selected=null,streak=0,leader=null,refill=false;
 const denPanel=$("den-inventory");
 const refillButton=makeBtn("空き枠に仲間を迎える",()=>{
  const r=core.load();if(!window.__wildSquadAtDen||!r?.members?.length||r.members.length>=3)return;
  if((r.gachaTickets||0)<1){info.textContent="ガチャ権がありません。探索や狩りで獲得してください。";return;}
  refill=true;size=1;chosen=[];streak=0;root.hidden=false;nextSlot();
 },"squad-refill-button");
 if(denPanel){
  refillButton.id="squad-refill-den";
  refillButton.hidden=true;
  denPanel.append(refillButton);
  const refreshDen=()=>{
   const r=core.load(),n=r?.members?.length||0;
   refillButton.hidden=denPanel.classList.contains("hidden")||!window.__wildSquadAtDen||n===0||n>=3;
   refillButton.disabled=!(r?.gachaTickets>0);
   refillButton.textContent="空き枠ガチャ（残り"+(r?.gachaTickets||0)+"権）";
  };
  if(typeof MutationObserver==="function")new MutationObserver(refreshDen).observe(denPanel,{attributes:true,attributeFilter:["class"]});
  refillButton.addEventListener("focus",refreshDen);
 }
 function plot(canvas,type){
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const w=canvas.width,h=canvas.height;
  const ground=ctx.createLinearGradient(0,0,0,h);ground.addColorStop(0,"#1a3b40");ground.addColorStop(1,"#0b1c24");
  ctx.fillStyle=ground;ctx.fillRect(0,0,w,h);
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
   if(type==="lion")for(let i=0;i<12;i++){const a=i*Math.PI/6;oval(57+Math.cos(a)*29,-111+Math.sin(a)*32,14,15,"#8d633e")}
   if(type==="gorilla")for(const x of [-25,49]){line(x,-85,x+1,-20,dark,23)}
   if(type==="tibetanFox"){line(40,-139,83,-139,dark,2);}
   if(type==="fox"||type==="tibetanFox"||type==="wolf"||type==="manul"){line(-65,-82,-111,-105,c,type==="manul"?26:19);oval(-115,-105,15,11,type==="fox"?light:c);}
   else if(type==="cat"||type==="dog")line(-70,-83,-103,-77,c,11);
  }
  ctx.restore();
 }
 function paint(canvas,m){
  if(!canvas||!m)return;canvas.width=canvas.width;const type=m.species,color=COLORS[type]||"#96a6a1";
  canvas.dataset.ageStage=m.ageStage==="young"||m.age==="若い"?"young":"adult";
  const model={type,r:(RADII[type]||19)*(canvas.dataset.ageStage==="young"?.8:1),color,belly:"#c6c3b6",age:m.age,sex:m.sex,ageStage:canvas.dataset.ageStage};
  let drawn=false;
  if(window.Wild3D?.available&&window.Wild3D.previewAnimal){
   try{drawn=!!window.Wild3D.previewAnimal(model,canvas,.6,1.45,.12)}catch(_){}
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
  for(let i=0;i<3;i++){
   const m=members[i],card=el("article","squad-roster-slot"+(data?.leaderId===m?.id?" is-leader":""));
   if(!m){card.append(el("div","squad-roster-empty","＋"),el("small",null,(i+1)+"枠目・空き"));}
   else{
    const thumb=preview(m,"squad-roster-preview");card.append(thumb);
    card.append(el("strong",null,m.name||m.speciesName),el("small",null,m.grade+"評価 / "+(data.leaderId===m.id?"リーダー":"仲間")),el("small",null,"HP "+Math.round((m.iv?.hp||1)*100)+"% / 攻 "+Math.round((m.iv?.attack||1)*100)+"%"),el("small",null,"速 "+Math.round((m.iv?.speed||1)*100)+"% / 持 "+Math.round((m.iv?.stamina||1)*100)+"%"));
   }
   roster.append(card);
  }
  hint.textContent=members.length?members.length+"体で生存中。既存個体を破棄するガチャはできません。":"まだ編成がありません。ガチャを引いて最大3体を選択。";
  gacha.disabled=members.length>0;
  gacha.textContent=members.length?"生存中の編成を維持":"ガチャを引く・編成する";
 }
 function showSize(){
  info.textContent="編成数を選択してください。各枠、初回＋最大3回の引き直し。";
  body.replaceChildren();
  const pane=el("div","squad-count-choices");
  for(let n=1;n<=3;n++){pane.append(makeBtn(n+"体で編成",()=>{size=n;nextSlot()},"squad-count-button"));}
  body.append(pane,el("p","squad-small-note","個体は1匹ずつ採用。引き直した候補も選べます。所持枠・ストックはありません。"));
 }
 function nextSlot(){
  if(chosen.length>=size){finish();return}
  slot=chosen.length+1;draw=core.drawSlot(0,0,streak);draw.roll();selected=draw.options[0].id;showDraw();
 }
 function showDraw(){
  info.textContent="編成 "+slot+" / "+size+"　残り引き直し "+(4-draw.options.length)+"回";
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
   group.append(card);
  }
  body.append(el("h3","squad-option-title","引いた候補から選択"),group);
  const actions=el("footer","squad-gacha-actions");
  const reroll=makeBtn("もう一度引く（残り"+(4-draw.options.length)+"回）",()=>{draw.roll();showDraw()},"squad-reroll");
  reroll.disabled=draw.options.length>=4;
  const choose=makeBtn("この個体を採用 →",()=>{const m=draw.choose(selected);streak=["C","D"].includes(m.grade)?streak+1:0;chosen.push(m);nextSlot()},"squad-adopt");
  actions.append(reroll,choose);body.append(actions);
 }
 function finish(){
  info.textContent=refill?"空き枠へ迎える個体を確認":"編成確認　リーダーと名前を決めて出発";
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
  const confirm=makeBtn(refill?"この個体を空き枠に採用":"この編成で出発",()=>{
   if(!chosen.some(m=>OPERABLE.has(m.species))){info.textContent="操作可能な動物がいません。ガチャを引き直してください。";return}
   const chosenLeader=chosen.find(m=>m.id===leader);
   if(!chosenLeader||!OPERABLE.has(chosenLeader.species)){info.textContent="操作可能なリーダーを選んでください。";return}
   if(refill){
    const current=core.load();
    if(!window.__wildSquadAtDen||!current?.members?.length||current.members.length>=3){info.textContent="巣の近くで空き枠を確認してください。";return;}
    const result=core.fillVacancy(chosen[0]);
    if(!result.ok){info.textContent=result.reason;return;}
    root.hidden=true;updateHome();
    window.dispatchEvent(new CustomEvent("wild-squad-refilled",{detail:{memberId:chosen[0].id}}));
    return;
   }
   if((core.load()?.members||[]).length){info.textContent="生存中の個体は破棄できません。";return;}
   core.newSquad(chosen,leader);updateHome();root.hidden=true;
   window.dispatchEvent(new CustomEvent("wild-squad-start"));
  },"squad-adopt");
  actions.append(confirm);body.append(actions);
 }
 function begin(){
  if((core.load()?.members||[]).length){updateHome();return;}
  refill=false;size=0;slot=0;chosen=[];draw=null;selected=null;streak=0;leader=null;
  root.hidden=false;showSize();root.scrollTop=0;
 }
 gacha.addEventListener("click",begin);
 // Refresh the roster whenever the title is shown after a death or a pause.
 if(typeof MutationObserver==="function"){
  const observer=new MutationObserver(()=>{if(!menu.classList.contains("hidden"))updateHome()});
  observer.observe(menu,{attributes:true,attributeFilter:["class"]});
 }
 window.WildSquadGachaUI={open:begin,refresh:updateHome};
 updateHome();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();