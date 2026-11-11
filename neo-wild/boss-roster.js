/* WILD RECLAIM | defeated bosses are owned in three slots separate from gacha.
 * No older save can resurrect a dead or replaced boss. No AI follower party.
 */
(()=>{"use strict";
const KEY="wild-reclaim-boss-roster-v1",DEAD="wild-reclaim-boss-dead-v1",
 RETIRED="wild-reclaim-boss-retired-v1",CLAIMED="wild-reclaim-boss-claimed-v1",
 PENDING="wild-reclaim-boss-pending-v1",MAX=3;
const LABELS=Object.freeze({
 alpha:"アルファウルフ",giantSnake:"大蛇",oldBear:"老熊",giantBoar:"巨大イノシシ",
 blackPanther:"黒豹",oneEyedWolf:"隻眼の狼",whiteTiger:"白虎",
 giantHyena:"巨大ハイエナ",giantLion:"巨大ライオン",giantMoose:"巨大ヘラジカ",
 giantBuffalo:"巨大バッファロー",giantCrocodile:"巨大ワニ",giantHippo:"巨大カバ",
 giantAnaconda:"巨大アナコンダ",giantLizard:"巨大オオトカゲ",
 rhino:"サイ",giantGorilla:"巨大ゴリラ",giantElephant:"巨大ゾウ",
 albinoWolf:"アルビノの狼",giantEagle:"大鷲",worldEnd:"この世の終わり"
});
const read=(key,fallback)=>{
 const raw=localStorage.getItem(key);if(raw===null)return fallback;
 return JSON.parse(raw);
};
const readIds=key=>{
 const raw=read(key,[]);if(!Array.isArray(raw)||raw.some(s=>typeof s!=="string"||!s||s.length>240))
  throw Error("ボス永久IDの保存データが破損しています: "+key);
 return new Set(raw);
};
const write=(key,value)=>{
 const serialized=JSON.stringify(value);
 localStorage.setItem(key,serialized);
 if(localStorage.getItem(key)!==serialized)throw Error("ボスの保存を検証できません: "+key);
};
function load(){
 const forbidden=new Set([...readIds(DEAD),...readIds(RETIRED)]);
 const raw=read(KEY,{version:1,members:[],activeId:null,updatedAt:0});
 if(!raw||raw.version!==1||!Array.isArray(raw.members)||raw.members.length>MAX)
  throw Error("ボスの所有データが破損しています");
 const used=new Set();
 const members=raw.members.filter(m=>m&&typeof m.id==="string"&&m.id.length<=240&&
  LABELS[m.type]&&!forbidden.has(m.id)&&!used.has(m.id)&&used.add(m.id))
  .map(m=>({id:m.id,type:m.type,name:LABELS[m.type],hpRatio:Math.max(.01,Math.min(1,Number(m.hpRatio)||1)),
    level:Math.max(1,Math.min(1000,Math.floor(Number(m.level)||1)))}));
 const activeId=members.some(m=>m.id===raw.activeId)?raw.activeId:null;
 return {version:1,members,activeId,updatedAt:Math.max(0,Number(raw.updatedAt)||0)};
}
function save(roster){
 const before=load();const dead=new Set([...readIds(DEAD),...readIds(RETIRED)]);
 const requested=roster?.members;
 if(!Array.isArray(requested)||requested.length>MAX)throw Error("ボスの枠は3体まで");
 const members=requested.filter(m=>m&&!dead.has(m.id));
 if(members.length!==requested.length||members.some(m=>!LABELS[m.type]))throw Error("永久離脱したボスは復活できません");
 if(new Set(members.map(m=>m.id)).size!==members.length)throw Error("ボスIDが重複しています");
 // An older tab must not silently discard a live boss or older selected slot.
 if(Number(roster.updatedAt||0)<before.updatedAt)
  throw Error("別タブに新しいボス編成があります。画面を更新してください");
 const activeId=members.some(m=>m.id===roster.activeId)?roster.activeId:null;
 const next={version:1,members,activeId,updatedAt:Math.max(Date.now(),before.updatedAt+1)};
 write(KEY,next);return load();
}
function pendingOffer(){
 try{
  const p=read(PENDING,null);
  return p&&LABELS[p.type]&&typeof p.sourceId==="string"&&p.sourceId.length<=180&&
   !readIds(CLAIMED).has(p.sourceId)?{type:p.type,sourceId:p.sourceId}:null;
 }catch(_){return null}
}
function queueOffer(info){
 if(!LABELS[info?.type]||typeof info.sourceId!=="string"||!info.sourceId||info.sourceId.length>180)return false;
 try{
  if(readIds(CLAIMED).has(info.sourceId))return false;
  write(PENDING,{type:info.type,sourceId:info.sourceId});
  return true;
 }catch(_){return false}
}
function recruit(info,replaceId=null){
 if(!LABELS[info?.type]||!info?.sourceId||typeof info.sourceId!=="string"||info.sourceId.length>180)
  return {ok:false,reason:"ボスの討伐情報が不正です"};
 try{
  const claims=readIds(CLAIMED);if(claims.has(info.sourceId))return {ok:false,reason:"この討伐は判定済みです"};
  const r=load(),id="boss:"+info.sourceId;
  if(r.members.some(m=>m.id===id)||readIds(DEAD).has(id)||readIds(RETIRED).has(id))
   return {ok:false,reason:"このボスは登録済みです"};
  let members=r.members.slice(),previousRetired=null;
  if(members.length>=MAX){
   if(!replaceId||!members.some(m=>m.id===replaceId))
    return {ok:false,reason:"ボス3枠が満員です。交代対象を選んでください"};
   // Permanent retirement happens before replacement; old save cannot restore it.
   const retired=readIds(RETIRED);previousRetired=[...retired];
   retired.add(replaceId);write(RETIRED,[...retired]);
   members=members.filter(m=>m.id!==replaceId);
  }
  members.push({id,type:info.type,name:LABELS[info.type],hpRatio:1,level:1});
  // Keep ordinary selection unchanged. Acquired bosses are selected by the user.
  let next;
  try{next=save({...r,members,activeId:r.activeId===replaceId?null:r.activeId})}
  catch(error){
   // An unsuccessful replacement must not permanently erase the previous owner.
   if(previousRetired)try{write(RETIRED,previousRetired)}catch(_){}
   throw error;
  }
  claims.add(info.sourceId);
  try{write(CLAIMED,[...claims])}
  catch(_){return {ok:true,roster:next,warning:"ボス取得済み。討伐履歴の保存確認が必要です"}}
  return {ok:true,roster:next};
 }catch(error){return {ok:false,reason:error?.message||"保存エラー"}}
}
function select(id){
 try{
  const r=load();if(id!==null&&!r.members.some(m=>m.id===id))return {ok:false,reason:"所有していないボスです"};
  save({...r,activeId:id});
  window.dispatchEvent(new CustomEvent("wild-boss-selected",{detail:{id}}));
  // Live game can reject habitat placement or world autosave and synchronously
  // roll the selected boss back. Report the actual committed selection.
  const confirmed=load();
  if(confirmed.activeId!==id)return {ok:false,reason:"切替を確定できませんでした。元の個体を維持します",roster:confirmed};
  return {ok:true,roster:confirmed};
 }catch(error){return {ok:false,reason:error.message}}
}
function kill(id){
 if(!id)return false;
 try{
  const dead=readIds(DEAD);dead.add(id);write(DEAD,[...dead]);
  const r=load();save({...r,members:r.members.filter(m=>m.id!==id),activeId:r.activeId===id?null:r.activeId});return true;
 }catch(error){console.error("Boss permanent death save failed",error);return false}
}
function updateVitals(id,ratio,level){
 try{
  const r=load(),m=r.members.find(m=>m.id===id);if(!m)return false;
  m.hpRatio=Math.max(.01,Math.min(1,Number(ratio)||1));
  m.level=Math.max(1,Math.min(1000,Math.floor(Number(level)||1)));
  save(r);return true;
 }catch(_){return false}
}
function decline(sourceId){
 if(!sourceId)return false;
 try{const claims=readIds(CLAIMED);claims.add(sourceId);write(CLAIMED,[...claims]);return true}catch(_){return false}
}
function renderTitle(){
 const home=document.getElementById("squad-home"),after=document.getElementById("save-menu-actions");
 if(!home||!after)return;
 let root=document.getElementById("boss-owned-slots");
 if(!root){root=document.createElement("section");root.id="boss-owned-slots";
  root.setAttribute("aria-label","ボス専用の所有3枠");after.insertAdjacentElement("afterend",root);}
 // Restore a previously rendered root to stylesheet-managed sizing.
 root.style.cssText="";root.className="boss-owned-root";root.replaceChildren();
 const heading=document.createElement("h2");heading.className="boss-owned-heading";
 heading.textContent="討伐したボス｜専用3枠";root.append(heading);
 let r;try{r=load()}catch(error){root.append(document.createTextNode(error.message));return;}
 const slots=document.createElement("div");slots.className="boss-owned-grid";
 for(let i=0;i<MAX;i++){
  const m=r.members[i],active=!!m&&r.activeId===m.id;
  const slot=document.createElement("article");
  slot.className="boss-owned-card"+(active?" is-active":"")+(m?"":" is-empty");
  slot.setAttribute("aria-label",m?m.name+" ボス所有枠":"未獲得のボス枠");
  const crest=document.createElement("span");crest.className="boss-owned-crest";
  crest.setAttribute("aria-hidden","true");crest.textContent=m?"✦":"◇";slot.append(crest);
  const name=document.createElement("strong");name.className="boss-owned-name";
  name.textContent=m?m.name:"未獲得";slot.append(name);
  const detail=document.createElement("small");detail.className="boss-owned-meta";
  detail.textContent=m?"LV "+m.level+"｜HP "+Math.round(m.hpRatio*100)+"%":(i+1)+"枠目・空き";
  slot.append(detail);
  if(m){
   const gauge=document.createElement("span");gauge.className="boss-owned-hp";
   gauge.setAttribute("aria-label","残りHP "+Math.round(m.hpRatio*100)+"%");
   const fill=document.createElement("span");fill.style.width=Math.round(m.hpRatio*100)+"%";
   gauge.append(fill);slot.append(gauge);
   const btn=document.createElement("button");btn.type="button";btn.className="boss-owned-action";
   btn.textContent=active?"✓ 操作対象":"このボスを選択";btn.disabled=active;
   btn.addEventListener("click",()=>{const changed=select(m.id);if(!changed.ok)alert(changed.reason);renderTitle();});
   slot.append(btn);
  }
  slots.append(slot);
 }
 root.append(slots);
 if(r.activeId){
  const ready=document.createElement("button");ready.type="button";ready.className="boss-owned-deploy";
  ready.textContent="選択中のボスで出撃";ready.addEventListener("click",()=>document.getElementById("continue-btn")?.click());
  root.append(ready);
  if(window.WildSquad?.load?.()?.members?.length){
   const reset=document.createElement("button");reset.type="button";reset.className="boss-owned-reset";
   reset.textContent="通常動物に戻す";
   reset.addEventListener("click",()=>{const changed=select(null);if(!changed.ok)alert(changed.reason);renderTitle();});
   root.append(reset);
  }
 }
}
let offer=null;
function showOffer(info){
 if(!LABELS[info?.type]||!info?.sourceId)return false;
 if(readIds(CLAIMED).has(info.sourceId))return false;
 queueOffer(info); // The choice survives a reload of the saved world.
 offer=info;
 let root=document.getElementById("boss-recruit-offer");
 if(!root){root=document.createElement("div");root.id="boss-recruit-offer";root.setAttribute("role","dialog");
  root.setAttribute("aria-modal","true");root.setAttribute("aria-label","討伐したボスの仲間選択");
  root.style.cssText="position:fixed;inset:0;z-index:15000;display:flex;align-items:center;justify-content:center;background:#000d;padding:18px";
  document.body.append(root);}
 root.replaceChildren();
 const box=document.createElement("div");box.style.cssText="max-width:430px;width:100%;background:#1a2c28;color:#f7f6ee;border:2px solid #bb9871;border-radius:14px;padding:22px;text-align:center";
 const h=document.createElement("h2");h.textContent="強ボスを討伐！";h.style.cssText="margin:0 0 8px;font-size:21px";box.append(h);
 const name=document.createElement("p");name.textContent=LABELS[info.type]+"を仲間にしますか？";box.append(name);
 let roster;try{roster=load()}catch(error){name.textContent=error.message;roster=null}
 let swap=null;
 if(roster?.members.length===MAX){
  const label=document.createElement("label");label.textContent="ボス枠が満員です。入れ替える1体を選択";
  const selectBox=document.createElement("select");selectBox.style.cssText="display:block;width:100%;padding:9px;margin:7px 0 13px";
  roster.members.forEach(m=>{const o=document.createElement("option");o.value=m.id;o.textContent=m.name;o.selected=swap===m.id;selectBox.append(o)});
  swap=selectBox.value;selectBox.addEventListener("change",()=>{swap=selectBox.value;});
  label.append(selectBox);box.append(label);
 }
 const message=document.createElement("p");message.style.cssText="min-height:1.3em;font-size:12px;color:#f8c1aa";
 const actions=document.createElement("div");actions.style.cssText="display:flex;gap:10px;justify-content:center";
 const accept=document.createElement("button");accept.type="button";accept.textContent="仲間にする";
 const declineBtn=document.createElement("button");declineBtn.type="button";declineBtn.textContent="見送る";
 for(const b of [accept,declineBtn])b.style.cssText="min-height:44px;padding:10px 17px;border:1px solid #c0ab90;border-radius:8px;background:#476151;color:white;font-size:14px";
 const close=()=>{try{localStorage.removeItem(PENDING)}catch(_){}
  root.remove();offer=null;renderTitle();window.dispatchEvent(new CustomEvent("wild-boss-offer-closed"));};
 accept.addEventListener("click",()=>{
  const result=recruit(info,swap);
  if(!result.ok){message.textContent=result.reason;return;}
  close();
 });
 declineBtn.addEventListener("click",()=>{if(!decline(info.sourceId)){message.textContent="辞退の保存に失敗しました";return}close();});
 actions.append(accept,declineBtn);box.append(actions,message);root.append(box);
 accept.focus({preventScroll:true});return true;
}
window.addEventListener("wild-squad-selected",()=>{try{const r=load();if(r.activeId)select(null)}catch(_){}});
window.addEventListener("wild-squad-updated",renderTitle);
window.addEventListener("wild-boss-selected",renderTitle);
window.WildBossRoster=Object.freeze({KEY,DEAD,RETIRED,CLAIMED,PENDING,LABELS,load,recruit,select,kill,updateVitals,decline,renderTitle,showOffer,pendingOffer,queueOffer});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",renderTitle,{once:true});else renderTitle();
})();