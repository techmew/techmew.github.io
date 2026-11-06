(()=>{
"use strict";
const GAME_URL="https://techmew.github.io/neo-wild/";
const el=id=>document.getElementById(id);
let info=null,png=null,preview=null,version=0;
const causes={ufo:"UFOに捕獲",starvation:"餓死",poison:"毒による衰弱",fire:"火災",lightning:"落雷",bleeding:"出血"};
const reason=value=>causes[value]||String(value||"原因不明").slice(0,36);
const lived=t=>{const s=Math.max(0,Math.floor(Number(t)||0));return s<60?s+"秒":s<3600?Math.floor(s/60)+"分":Math.floor(s/3600)+"時間"+Math.floor(s%3600/60)+"分"};
function postText(d=info){
 if(!d)return "";
 const name=d.name===d.speciesName?d.name:d.name+"（"+d.speciesName+"）";
 return "【WILD RECLAIM｜生存記録】\n\n"+name+" Lv."+d.level+
 "\n到達：YEAR "+d.year+"｜討伐："+d.kills+"体\n生存時間："+lived(d.livedSeconds)+
 "\n\n死因："+reason(d.cause)+"\nこの世界で、あなたは何年生き残れる？\n\n🎮 "+GAME_URL+"\n#WILDRECLAIM #ブラウザゲーム";
}
function status(s){if(el("death-share-status"))el("death-share-status").textContent=s}
function reset(){
 version++;
 if(preview)URL.revokeObjectURL(preview);
 preview=null;png=null;info=null;
 const img=el("death-share-preview");if(img)img.removeAttribute("src");
 const panel=el("death-share-panel");if(panel)panel.hidden=true;
 for(const id of ["death-share-download","death-share-x"]){const b=el(id);if(b)b.disabled=true}
 status("");
}
function prepare(value){
 reset();if(!value?.speciesName)return false;
 info={name:String(value.name||value.speciesName),speciesName:String(value.speciesName),grade:String(value.grade||""),
  level:Math.max(1,Math.floor(value.level||1)),year:Math.max(0,Math.floor(value.year||0)),
  kills:Math.max(0,Math.floor(value.kills||0)),livedSeconds:Math.max(0,Number(value.livedSeconds)||0),
  area:String(value.area||"未確認"),cause:String(value.cause||"原因不明")};
 const node=el("death-share-panel");if(node)node.hidden=false;
 status("死亡時の画像を作成中…");return true;
}
function cover(ctx,img,x,y,w,h){
 if(!img?.width||!img?.height)return false;
 const f=Math.max(w/img.width,h/img.height),sw=w/f,sh=h/f;
 ctx.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);return true;
}
function makeCard(sources){
 if(!info)return null;
 const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=675;
 const c=canvas.getContext("2d");if(!c)return null;
 c.fillStyle="#101b17";c.fillRect(0,0,1200,675);
 let hasImage=false;
 if(sources.gpu)hasImage=cover(c,sources.gpu,0,0,1200,402);
 if(sources.scene)hasImage=cover(c,sources.scene,0,0,1200,402)||hasImage;
 if(!hasImage)return null;
 const grad=c.createLinearGradient(0,0,0,410);grad.addColorStop(0,"rgba(5,13,11,.5)");grad.addColorStop(.50,"rgba(5,13,11,.02)");grad.addColorStop(1,"rgba(5,13,11,.93)");
 c.fillStyle=grad;c.fillRect(0,0,1200,410);
 c.textBaseline="middle";c.font="bold 25px sans-serif";c.fillStyle="#e3ede3";c.fillText("WILD RECLAIM",44,52);
 c.textAlign="right";c.fillStyle="#f2ca93";c.fillText("SURVIVAL RECORD",1156,52);c.textAlign="left";
 c.font='900 65px "Noto Sans JP",sans-serif';c.fillStyle="#fff";c.fillText("生存終了",44,345);
 c.fillStyle="#111f1b";c.fillRect(0,402,1200,273);
 const fit=(text,max,limit=30)=>{let t=String(text).slice(0,limit);while(t.length>2&&c.measureText(t).width>max)t=t.slice(0,-2)+"…";return t};
 c.font='800 34px "Noto Sans JP",sans-serif';c.fillStyle="#fff";
 c.fillText(fit(info.name===info.speciesName?info.name:info.name+"｜"+info.speciesName,730),44,452);
 c.font='700 24px "Noto Sans JP",sans-serif';c.fillStyle="#bccdc0";c.fillText("評価 "+(info.grade||"—")+" ・ Lv."+info.level,44,495);
 c.font='600 20px "Noto Sans JP",sans-serif';c.textAlign="right";c.fillText("死因",1154,430);
 c.font='800 23px "Noto Sans JP",sans-serif';c.fillStyle="#edc58f";c.fillText(fit(reason(info.cause),360),1154,474);c.textAlign="left";
 c.strokeStyle="#395449";c.beginPath();c.moveTo(44,518);c.lineTo(1154,518);c.stroke();
 [["世界YEAR",info.year],["生存時間",lived(info.livedSeconds)],["討伐数",info.kills+"体"],["探索地域",info.area]].forEach(([k,v],i)=>{
  const x=44+i*291;c.font='600 17px "Noto Sans JP",sans-serif';c.fillStyle="#a8b7ae";c.fillText(k,x,549);
  c.font='800 24px "Noto Sans JP",sans-serif';c.fillStyle="#f4f6ef";c.fillText(fit(v,259),x,583);
 });
 c.fillStyle="#2a4138";c.fillRect(0,612,1200,63);
 c.fillStyle="#d9e9dc";c.font='700 19px "Noto Sans JP",sans-serif';c.fillText("この世界で、どこまで生き残れるか。",44,641);
 c.fillStyle="#f3c992";c.textAlign="right";c.fillText("techmew.github.io/neo-wild/",1154,641);
 return canvas;
}
function capture(sources){
 if(!info||png)return false;
 let image=null;try{image=makeCard(sources||{})}catch(err){console.warn("Death card rendering failed",err)}
 if(!image){status("実際の死亡シーンを取得できませんでした。");return false}
 const captureVersion=version;
 image.toBlob(blob=>{
  if(!info||captureVersion!==version)return;
  if(!blob){status("PNGを生成できませんでした。");return}
  png=blob;preview=URL.createObjectURL(blob);
  const node=el("death-share-preview");if(node){node.src=preview;node.alt="死亡直前の3Dゲーム画面と生存記録";}
  for(const id of ["death-share-download","death-share-x"]){const b=el(id);if(b)b.disabled=false}
  status("記録画像を作成しました。");
 },"image/png");return true;
}
function finish(won){const panel=el("death-share-panel");if(panel)panel.hidden=!!won||!info;}
function download(){
 if(!png||!info)return;
 const url=URL.createObjectURL(png),a=document.createElement("a");
 a.href=url;a.download="wild-reclaim-YEAR-"+info.year+".png";document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),5000);status("画像を保存しました。Xに添付できます。");
}
async function share(){
 if(!png||!info)return;
 const text=postText();
 if(typeof navigator.share==="function"&&typeof navigator.canShare==="function"&&typeof File==="function"){
  try{
   const file=new File([png],"wild-reclaim-YEAR-"+info.year+".png",{type:"image/png"});
   if(navigator.canShare({files:[file]})){
    await navigator.share({files:[file],text,title:"WILD RECLAIM 生存記録"});
    status("共有先でXを選び、画像と本文を確認して投稿してください。");return;
   }
  }catch(err){if(err?.name==="AbortError"){status("共有をキャンセルしました。");return}console.warn("Image share failed",err)}
 }
 // X Web Intent has no local screenshot attachment. User must attach downloaded PNG.
 const intent="https://twitter.com/intent/tweet?text="+encodeURIComponent(text);
 const link=document.createElement("a");link.href=intent;link.target="_blank";link.rel="noopener noreferrer";
 document.body.appendChild(link);link.click();link.remove();
 status("X投稿画面を開きました。画像を保存してXに添付してください。");
}
el("death-share-download")?.addEventListener("click",download);
el("death-share-x")?.addEventListener("click",share);
window.WildDeathShare={prepare,capture,finish,reset,postText};
})();