/* Squad selection UI: selection and persistence only; gameplay handoff remains in game.js. */
(()=>{
"use strict";
const ready=()=>{const core=window.WildSquad;if(!core)return;
const css=document.createElement("style");css.textContent=`
#squad-gacha{position:fixed;inset:0;z-index:9900;background:#09131cf2;color:#fff;overflow:auto;padding:18px;box-sizing:border-box;font:16px system-ui}
#squad-gacha[hidden]{display:none}#squad-gacha .wrap{max-width:750px;margin:auto}
#squad-gacha button,#squad-open{min-height:44px;border:1px solid #8cb6b9;border-radius:9px;background:#17343d;color:white;padding:9px 14px;margin:4px;touch-action:manipulation}
#squad-gacha button:disabled{opacity:.4}#squad-gacha button[aria-pressed=true]{background:#39746c}
#squad-gacha .card{background:#172934;border:1px solid #52767a;border-radius:12px;padding:12px;margin:10px 0}
#squad-gacha .chosen{border:2px solid #edc873}#squad-gacha .stats{font-size:.88em;line-height:1.7}
#squad-gacha input{font-size:16px;max-width:190px;padding:8px}
`;document.head.append(css);
const open=document.createElement("button");open.id="squad-open";open.type="button";open.textContent="新編成ガチャ（1〜3体）";
const menu=document.querySelector("#menu .modal, #menu .menu-inner, #menu .menu-foot, #menu");(menu||document.body).append(open);
const root=document.createElement("section");root.id="squad-gacha";root.hidden=true;root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");root.innerHTML='<div class="wrap"><button id="squad-close" type="button">閉じる</button><h2>新しい仲間を迎える</h2><p id="squad-info">編成数を選択</p><div id="squad-body"></div></div>';document.body.append(root);
const info=root.querySelector("#squad-info"),body=root.querySelector("#squad-body");
let size=0,slot=0,draw=null,chosen=[],selected=null,streak=0;
const rarity={basic:"基本",rare:"希少",legendary:"伝説級"};
function begin(){size=0;slot=0;chosen=[];selected=null;draw=null;showSize()}
function showSize(){info.textContent="編成数を選んでください。ストックはありません。";body.replaceChildren();
for(let n=1;n<=3;n++){const b=document.createElement("button");b.textContent=n+"体で開始";b.onclick=()=>{size=n;nextSlot()};body.append(b)}}
function nextSlot(){if(chosen.length>=size){finish();return}slot=chosen.length+1;draw=core.drawSlot(0,0,streak);selected=null;draw.roll();showDraw()}
function showDraw(){info.textContent="枠 "+slot+" / "+size+"：最大3回引き直し。出現済み候補から選べます。";body.replaceChildren();
for(const m of draw.options){const card=document.createElement("article");card.className="card"+(selected===m.id?" chosen":"");
const title=document.createElement("strong");title.textContent=m.speciesName+"｜"+m.grade+"評価｜"+rarity[m.rarity];card.append(title);
const detail=document.createElement("p");detail.className="stats";detail.textContent=m.sex+"・"+m.age+"・"+m.personality+"｜成長 "+m.growthType+" ("+m.growthRate+"倍)｜Lv1\nHP "+Math.round(m.iv.hp*100)+"% / 攻撃 "+Math.round(m.iv.attack*100)+"% / 速度 "+Math.round(m.iv.speed*100)+"% / 持久 "+Math.round(m.iv.stamina*100)+"%｜追加能力："+(m.abilities.join("、")||"なし");card.append(detail);
const pick=document.createElement("button");pick.textContent="この個体を選ぶ";pick.setAttribute("aria-pressed",String(selected===m.id));pick.onclick=()=>{selected=m.id;showDraw()};card.append(pick);body.append(card)}
const reroll=document.createElement("button");reroll.textContent="引き直す（残り"+(4-draw.options.length)+"回）";reroll.disabled=draw.options.length>=4;reroll.onclick=()=>{draw.roll();showDraw()};body.append(reroll);
const adopt=document.createElement("button");adopt.textContent="選択個体を採用して次へ";adopt.disabled=!selected;adopt.onclick=()=>{const m=draw.choose(selected);streak=m.grade==="D"||m.grade==="C"?streak+1:0;chosen.push(m);nextSlot()};body.append(adopt)}
function finish(){info.textContent="編成確定：リーダーと名前を設定してください。";body.replaceChildren();
let leader=chosen[0].id;
for(const m of chosen){const row=document.createElement("div");row.className="card";const label=document.createElement("label");label.textContent=m.speciesName+"（"+m.grade+"） 名前 ";const input=document.createElement("input");input.value=m.name;input.maxLength=18;input.oninput=()=>{m.name=input.value.trim()||m.speciesName};label.append(input);row.append(label);
const b=document.createElement("button");b.textContent="リーダーに指定";b.setAttribute("aria-pressed",String(leader===m.id));b.onclick=()=>{leader=m.id;finishWithLeader(leader)};row.append(b);body.append(row)}
const confirm=document.createElement("button");confirm.textContent="編成して出発";
confirm.onclick=()=>{
 const selected=chosen.find(m=>m.id===leader)||chosen[0];
 const supported=["cat","dog","fox","wolf","deer","boar","manul","tibetanFox","shoebill"];
 if(!supported.includes(selected.species)){info.textContent=selected.speciesName+"の操作系は準備中です。対応済みの個体をリーダーに選んでください。";return}
 core.newSquad(chosen,leader);root.hidden=true;
 window.dispatchEvent(new CustomEvent("wild-squad-start"));
};body.append(confirm)}
function finishWithLeader(id){const m=chosen.find(x=>x.id===id);if(m){chosen.splice(chosen.indexOf(m),1);chosen.unshift(m)}finish()}
open.onclick=()=>{root.hidden=false;begin()};window.WildSquadGachaUI={open:()=>{root.hidden=false;begin()}};root.querySelector("#squad-close").onclick=()=>root.hidden=true;
};if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready);else ready();
})();