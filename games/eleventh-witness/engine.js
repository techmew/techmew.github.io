/* 霧立荘 - narrative engine v1. Standalone vanilla JS, no third party runtime. */
(function(){
"use strict";
const BOOK=window.NOVEL_DATA;
if(!BOOK){document.body.textContent="物語データの読み込みに失敗しました。ページを再読み込みしてください。";return;}
const $=id=>document.getElementById(id), SAVE="eleventh_novel_reboot_2026_v1", SLOT=SAVE+"_slot_", SLOTS=3;
const ui={stage:$("scene"),world:$("world"),cover:$("cover"),name:$("who"),story:$("prose"),full:$("fullText"),dialog:$("dialog"),prompt:$("prompt"),choices:$("choices"),hint:$("hint"),location:$("location"),counter:$("counter"),modal:$("modal"),modalTitle:$("modalTitle"),modalBody:$("modalBody"),saveBadge:$("saveBadge"),portrait:$("portrait"),auto:$("autoBtn"),sound:$("soundBtn"),skip:$("skipBtn")};
let state={scene:BOOK.start,index:0,flags:{},clues:{},history:[],seen:{},bg:"stop",sound:false,auto:false,speed:30,font:1,finished:false,ending:null,visits:1};
let waiting=false,playing=false,typing=false,fullText="",typeTimer=0,autoTimer=0,autoplayToken=0,audio=null,windNode=null;
let touch={id:null,sx:0,sy:0,ox:0,oy:0,x:0,y:0,moved:false,ignore:false}, dragging=false;
const imgs={stop:"assets/reboot-snow.svg",road:"assets/reboot-road.svg",lodge:"assets/reboot-snow.svg",lobby:"assets/reboot-parlor.svg",room:"assets/reboot-room.svg",hall:"assets/reboot-hall.svg",dining:"assets/reboot-parlor.svg",dryroom:"assets/reboot-hall.svg"};
// Keep speaker identity, palette and art layout separate from save data.
// The 576x196 WebP atlas holds four 144x196 busts, left to right.
const CAST_COLUMNS=Object.freeze({"莉子":0,"紗江":1,"絢":2,"匠":3});
// Bright enough for legibility on the charcoal dialogue panel; muted rather than neon.
const SPEAKER_COLORS=Object.freeze({
 "紗江":"#8fdceb","莉子":"#f1b0c1","絢":"#f4ca91","匠":"#c6bafa",
 "航平":"#a6e2b9","真理":"#eec5d8","圭介":"#bad2ef",
 "源蔵":"#e2c395","千尋":"#cce6aa","森下":"#91d5c9",
 "売店の人":"#d2d5d6","不明":"#d8d0ea"
});
const SPEAKER_FULL_COLORS=Object.freeze(Object.fromEntries(
 Object.entries(BOOK.speakers).map(([short,full])=>[full,SPEAKER_COLORS[short]||"#ffffff"])
));
// Reserve space above the actual dialogue box; no portrait is allowed over text.
function layoutPortrait(){
 if(!ui.portrait.dataset.actor || ui.dialog.hidden){ui.portrait.hidden=true;return;}
 const scene=ui.stage.getBoundingClientRect();
 const panel=ui.dialog.getBoundingClientRect();
 const header=$("top").getBoundingClientRect();
 if(!scene.height || !panel.height)return;
 const upper=Math.max(10,Math.ceil(header.bottom-scene.top+12));
 const gap=Math.floor(panel.top-scene.top-upper-14);
 if(gap<76){ui.portrait.hidden=true;return;}
 const height=Math.min(gap,Math.max(76,Math.floor(scene.height*.39)),304);
 const width=Math.round(height*144/196);
 ui.portrait.style.top=(upper+Math.max(0,Math.floor((gap-height)/2)))+"px";
 ui.portrait.style.width=width+"px";
 ui.portrait.style.height=height+"px";
 ui.portrait.hidden=false;
}
function showPortrait(who){
 const column=CAST_COLUMNS[who];
 ui.portrait.dataset.actor=column===undefined?"":who;
 if(column===undefined){ui.portrait.hidden=true;return;}
 // background-size: 400% 100% crops precisely one atlas column.
 ui.portrait.style.backgroundPosition=(column*100/3).toFixed(3)+"% 50%";
 ui.portrait.hidden=false;
 requestAnimationFrame(layoutPortrait);
}
// Resizing a phone or its text box must never make a portrait overlap the dialogue.
window.addEventListener("resize",()=>requestAnimationFrame(layoutPortrait));
if(typeof ResizeObserver!=="undefined"){
 const portraitObserver=new ResizeObserver(()=>requestAnimationFrame(layoutPortrait));
 portraitObserver.observe(ui.dialog);
 portraitObserver.observe(ui.stage);
}
function storageGet(k){try{return localStorage.getItem(k)}catch(_){return null}}
function storageSet(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}}
function copy(o){return JSON.parse(JSON.stringify(o))}
function save(){if(!playing)return;storageSet(SAVE,JSON.stringify(state));ui.saveBadge.textContent="自動保存";}
function read(k){try{let x=JSON.parse(storageGet(k));if(x && BOOK.scenes[x.scene] && Number.isInteger(x.index) && x.index>=0 && x.index<=BOOK.scenes[x.scene].length)return x}catch(_){ }return null}
function fresh(){const old=read(SAVE);state={scene:BOOK.start,index:0,flags:{loopMemory:!!(old&&old.finished)},clues:{},history:[],seen:{},bg:"stop",sound:state.sound,auto:false,speed:state.speed,font:state.font,finished:false,ending:null,visits:(old?old.visits+1:1)};playing=true;waiting=false;ui.cover.hidden=true;show();}
function restore(obj){cancelType();cancelAuto();state=Object.assign({},state,obj);state.flags=state.flags||{};state.clues=state.clues||{};state.history=state.history||[];state.seen=state.seen||{};playing=true;waiting=false;ui.cover.hidden=true;setFont(state.font);updateButtons();show();}
function cancelType(){if(typeTimer)clearInterval(typeTimer);typeTimer=0;typing=false;}
function cancelAuto(){autoplayToken++;if(autoTimer)clearTimeout(autoTimer);autoTimer=0;}
function escapeText(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function place(bg){if(!bg)return;state.bg=bg;ui.world.style.backgroundImage='url("'+(imgs[bg]||imgs.stop)+'")';ui.stage.dataset.place=bg;ui.location.textContent=BOOK.places[bg]||"霧立荘";ui.stage.classList.remove("fadeScene");void ui.stage.offsetHeight;ui.stage.classList.add("fadeScene");}
function check(when){if(!when)return true;if(when.charAt(0)==="!")return !state.flags[when.slice(1)]&&!state.clues[when.slice(1)];return Boolean(state.flags[when]||state.clues[when]);}
function eligible(row){return !row.when||check(row.when);}
function go(scene){if(!BOOK.scenes[scene])throw Error("Missing chapter "+scene);state.scene=scene;state.index=0;ui.counter.textContent=scene==="opening"?"第一夜：到着":"第一夜："+scene;}
function digest(){let guard=500;
while(guard-->0){
 const a=BOOK.scenes[state.scene];if(!a)throw Error("Unknown scene "+state.scene);
 const row=a[state.index];
 if(!row){return {k:"e",name:"第一夜　完",subtitle:"ここから先は、次の夜に続く"};}
 if(!eligible(row)){state.index++;continue;}
 if(row.k==="j"){go(row.to);continue;}
 if(row.k==="f"){if(!state.clues[row.key])state.clues[row.key]=row.clue;state.index++;continue;}
 return row;
}
throw Error("Scene transition loop");
}
function show(){
 cancelType();cancelAuto();waiting=false;ui.choices.innerHTML="";ui.prompt.hidden=true;ui.dialog.hidden=false;
 let row;
 try{row=digest()}catch(err){console.error(err);row={k:"n",s:"物語の読み込みで問題が起きました。メニューからセーブを読み込み直してください。"};}
 if(row.b)place(row.b);else if(!state.bg)place("stop");
 showPortrait(row.k==="d"?row.who:null);
 ui.counter.textContent="第一夜："+({opening:"到着",scarf:"到着",purpose:"到着",drive:"山道",talk_photo:"山道",talk_silence:"山道",talk_alibi:"山道",gate:"山荘",photowall:"山荘",ayanote:"山荘",room:"客室",dinner:"晩餐",askBowl:"晩餐",askTakumi:"晩餐",quietBowl:"晩餐",afterDinner:"夜",firstHour:"事件",firstHourAya:"事件",firstHourChihiro:"事件",firstHourMari:"事件",withRiko:"夜",corridor:"夜",withKohei:"夜",storm:"事件",questionAya:"事件",questionDoctor:"事件",retreat:"事件",lockdown:"深夜",callOutside:"深夜",holdRiko:"深夜",openDoor:"結末",survive:"結末"}[state.scene]||"続き");
 if(state.scene.startsWith("y0_"))ui.counter.textContent="第一夜：黒い招待状";
 if(state.scene.startsWith("y1_"))ui.counter.textContent="第二夜：証言の隙間";
 if(row.k==="n"||row.k==="d"){
  const isSpeech=row.k==="d";
  ui.dialog.style.setProperty("--speaker-color",isSpeech?(SPEAKER_COLORS[row.who]||"#e0e4e8"):"#ffffff");
  ui.name.textContent=isSpeech?(BOOK.speakers[row.who]||row.who):"";
  ui.name.hidden=!isSpeech;ui.dialog.classList.toggle("speech",isSpeech);
  const key=state.scene+"/"+state.index;
  const prev=state.history[state.history.length-1];
  if(!prev||prev.key!==key){state.history.push({key,who:row.k==="d"?(BOOK.speakers[row.who]||row.who):"",s:row.s});if(state.history.length>150)state.history.shift();}
  state.seen[key]=true;
  ui.hint.textContent="タップで読み進める　／　画面をドラッグして見回す";
  sceneCue(row.s);writeText(row.s);save();return;
 }
 if(row.k==="c"){
  waiting=true;ui.dialog.hidden=true;ui.prompt.hidden=false;
  ui.prompt.querySelector("h2").textContent=row.title;
  row.opts.forEach((opt,idx)=>{
   let b=document.createElement("button");b.type="button";b.className="option";
   b.innerHTML='<span class="num">'+String(idx+1).padStart(2,"0")+'</span><span class="optionbody"><strong>'+escapeText(opt.label)+'</strong>'+(opt.note?'<small>'+escapeText(opt.note)+'</small>':"")+'</span><span aria-hidden="true">›</span>';
   b.addEventListener("click",ev=>{ev.stopPropagation();pick(opt);});
   ui.choices.appendChild(b);
  });
  ui.hint.textContent="誰を信じるか、どう動くか。選んだ後も物語は進みます。";
  save();return;
 }
 if(row.k==="e"){
  waiting=true;state.finished=true;state.ending=row.name;ui.dialog.hidden=true;ui.prompt.hidden=false;ui.prompt.querySelector("h2").textContent=row.name;
  ui.choices.innerHTML="";
  let p=document.createElement("p");p.className="endingNote";p.textContent=row.subtitle;ui.choices.appendChild(p);
  if(row.name==="第一夜・記録END" && BOOK.scenes.y1_intro){
   let next=document.createElement("button");next.className="option major";next.textContent="第二夜「証言の隙間」へ進む";
   next.addEventListener("click",()=>{
    state.finished=false;state.ending=null;state.flags=state.flags||{};state.flags.secondNight=true;
    go("y1_intro");show();
   });
   ui.choices.appendChild(next);
  }
  let retry=document.createElement("button");retry.className="option major";retry.textContent="最初から、もう一度読む";retry.addEventListener("click",fresh);ui.choices.appendChild(retry);
  let clue=document.createElement("button");clue.className="option";clue.textContent="この夜に得た記録を読み返す";clue.addEventListener("click",()=>openModal("evidence"));ui.choices.appendChild(clue);
  ui.hint.textContent=state.scene.startsWith("y1_")?"第二夜を読了。記録は自動保存されました。":"第一夜を読了。真相は、まだ確定していません。";
  save();return;
 }
}
function writeText(str){
 fullText=str;ui.full.textContent=str;ui.story.textContent="";
 if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches){ui.story.textContent=str;typing=false;afterWrite();return;}
 const letters=Array.from(str);let i=0;typing=true;
 typeTimer=setInterval(()=>{i=Math.min(letters.length,i+2);ui.story.textContent=letters.slice(0,i).join("");if(i>=letters.length){cancelType();afterWrite();}},Math.max(12,Math.min(65,state.speed)));
}
function afterWrite(){ui.hint.textContent=state.auto?"自動再生中・画面タップで次へ":"タップで進む　／　左右ドラッグで視点移動";if(state.auto)scheduleAuto();}
function scheduleAuto(){cancelAuto();if(!state.auto||waiting||typing||!playing)return;const token=autoplayToken;autoTimer=setTimeout(()=>{if(token===autoplayToken&&state.auto&&!waiting)advance();},Math.max(1400,Math.min(5600,1800+fullText.length*35)));}
function advance(){if(!playing||!ui.modal.hidden||waiting)return;if(typing){cancelType();ui.story.textContent=fullText;afterWrite();return;}cancelAuto();state.index++;playPageSound();show();}
function pick(opt){if(!waiting)return;cancelAuto();Object.entries(opt.set||{}).forEach(([k,v])=>{if(typeof v==="number"){state.flags[k]=(state.flags[k]||0)+v;}else state.flags[k]=v;});state.finished=false;state.ending=null;go(opt.to);playPageSound();show();}
function setFont(v){state.font=Math.max(.88,Math.min(1.35,Number(v)||1));document.documentElement.style.setProperty("--type-scale",state.font);}
function updateButtons(){ui.auto.classList.toggle("active",!!state.auto);ui.auto.textContent=state.auto?"自動 ON":"自動";ui.sound.classList.toggle("active",!!state.sound);ui.sound.textContent=state.sound?"音 ON":"音 OFF";}
function soundCtx(){if(!audio){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;audio=new AC()}if(audio.state==="suspended")audio.resume();return audio;}
function tone(freq,duration,vol){if(!state.sound)return;try{const a=soundCtx(),o=a.createOscillator(),g=a.createGain();o.type="triangle";o.frequency.setValueAtTime(freq,a.currentTime);g.gain.setValueAtTime(.0001,a.currentTime);g.gain.exponentialRampToValueAtTime(vol,a.currentTime+.03);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+duration);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+duration+.05);}catch(_){ }}
function playPageSound(){tone(278,.10,.004);}
/* Discrete, generated acoustic details: no external audio assets or copyrighted samples. */
function oscillatorAt(f,kind,len,vol,delay){
 if(!state.sound)return;try{
  const a=soundCtx(),t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=kind;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);
  g.gain.linearRampToValueAtTime(vol,t+.012);
  g.gain.exponentialRampToValueAtTime(.0001,t+len);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+len+.04);
 }catch(_){}
}
function sceneCue(s){
 if(!state.sound)return;
 if(s.indexOf("帳場の古い電話が鳴った")>=0){
  for(let i=0;i<3;i++){oscillatorAt(430,"sine",.32,.013,i*.78);oscillatorAt(485,"sine",.32,.01,i*.78);}
 }else if(s.indexOf("こん、こん")>=0){
  oscillatorAt(83,"triangle",.07,.035,0);oscillatorAt(81,"triangle",.07,.03,.21);
  if(s.indexOf("三回")>=0||s.indexOf("……こん")>=0)oscillatorAt(89,"triangle",.08,.037,.75);
 }else if(s.indexOf("高瀬匠は、棚と棚の間に倒れていた")>=0){
  [174.61,155.56,130.81].forEach((v,i)=>oscillatorAt(v,"sine",1.7,.022,i*.14));
 }else if(s.indexOf("照明が一瞬だけ暗くなる")>=0){
  oscillatorAt(53,"sawtooth",.68,.014,0);
 }
}
function playWind(){
 if(!state.sound||windNode)return;
 try{const a=soundCtx(),buf=a.createBuffer(1,a.sampleRate*2,a.sampleRate),c=buf.getChannelData(0);let prev=0;for(let i=0;i<c.length;i++){let v=Math.random()*2-1;prev=(prev*.992)+(v*.008);c[i]=prev*.7;}const src=a.createBufferSource(),gain=a.createGain();src.buffer=buf;src.loop=true;gain.gain.value=.09;src.connect(gain);gain.connect(a.destination);src.start();windNode={src,gain};}catch(_){}
}
function toggleSound(){state.sound=!state.sound;if(state.sound){soundCtx();playWind();tone(420,.25,.015);}else if(windNode){try{windNode.src.stop()}catch(_){}windNode=null;}updateButtons();save();}
function toggleAuto(){state.auto=!state.auto;updateButtons();if(state.auto&&!typing)scheduleAuto();else cancelAuto();save();}
function skipRead(){if(!playing||waiting||!ui.modal.hidden)return;let i=0;while(i<100){if(typing){cancelType();ui.story.textContent=fullText;}const a=BOOK.scenes[state.scene],row=a&&a[state.index],next=a&&a[state.index+1];if(!next||!state.seen[state.scene+"/"+(state.index+1)]||next.k==="c"||next.k==="e")break;state.index++;i++;}if(i){show();}else{ui.hint.textContent="未読の文章はスキップしません。";}save();}
function openModal(mode){
 if(!playing&&mode!=="howto")return;
 cancelAuto();ui.modal.hidden=false;ui.modalBody.innerHTML="";
 const make=(tag,cl,txt)=>{let x=document.createElement(tag);if(cl)x.className=cl;if(txt!==undefined)x.textContent=txt;return x;};
 const btn=(label,fn)=>{let b=make("button","modal-btn",label);b.addEventListener("click",fn);ui.modalBody.appendChild(b);return b;};
 if(mode==="log"){ui.modalTitle.textContent="ここまでの会話";for(const x of [...state.history].reverse()){let r=make("div","logRow");if(x.who){r.classList.add("speech-log");r.style.setProperty("--speaker-color",SPEAKER_FULL_COLORS[x.who]||"#e0e4e8");r.appendChild(make("b",null,x.who));}r.appendChild(make("p",null,x.s));ui.modalBody.appendChild(r);}}
 else if(mode==="evidence"){ui.modalTitle.textContent="気になったことのメモ";const es=Object.values(state.clues||{});if(!es.length)ui.modalBody.appendChild(make("p","muted","まだ記録はありません。"));es.forEach((v,i)=>ui.modalBody.appendChild(make("div","logRow",(i+1)+"．"+v)));}
 else if(mode==="save"){
  ui.modalTitle.textContent="記録を残す・呼び出す";
  ui.modalBody.appendChild(make("p","muted","このブラウザ内に保存します。端末のデータを削除すると消えます。"));
  for(let i=1;i<=SLOTS;i++){const old=read(SLOT+i);let row=make("div","slotRow");row.appendChild(make("div",null,"しおり "+i+"　"+(old?"「"+(old.ending||"第一夜") +"」／ 記録済み":"未使用")));
   let save=make("button","modal-btn","保存");save.onclick=()=>{storageSet(SLOT+i,JSON.stringify(state));closeModal();flash("しおり "+i+" に保存しました");};row.appendChild(save);
   if(old){let load=make("button","modal-btn","読む");load.onclick=()=>{if(confirm("このしおりから読み直しますか？ 現在の進行は自動保存に残ります。")){closeModal();restore(old);}};row.appendChild(load);}ui.modalBody.appendChild(row);}
 }else if(mode==="settings"||mode==="howto"){
  ui.modalTitle.textContent="遊び方と設定";
  ui.modalBody.appendChild(make("p",null,"会話を読むときは画面をタップ。背景を左右にドラッグすると少しだけ見回せます。選択肢は後の展開に影響します。"));
  ui.modalBody.appendChild(make("p",null,"「自動」は文章を自動で進めます。「既読」は読んだ箇所だけ送ります。しおりは3つ保存できます。"));
  btn("文字を大きくする",()=>{setFont(state.font+.1);save();});btn("文字を小さくする",()=>{setFont(state.font-.1);save();});
  btn("視点を正面へ戻す",()=>{touch.x=0;touch.y=0;camera();closeModal();});
  btn("新しく最初から読む",()=>{if(confirm("最初から読み直しますか？")){closeModal();fresh();}});
 }
}
function flash(msg){ui.hint.textContent=msg;}
function closeModal(){ui.modal.hidden=true;if(state.auto&&!typing)scheduleAuto();}
function camera(){ui.world.style.setProperty("--pan-x",touch.x+"px");ui.world.style.setProperty("--pan-y",touch.y+"px");}
function bindCamera(){
 ui.stage.addEventListener("pointerdown",ev=>{if(!playing||!ui.modal.hidden||!ui.cover.hidden||!ui.prompt.hidden||ev.button>0||ev.isPrimary===false)return;if(ev.target.closest("button"))return;touch.id=ev.pointerId;touch.sx=ev.clientX;touch.sy=ev.clientY;touch.ox=touch.x;touch.oy=touch.y;touch.moved=false;});
 ui.stage.addEventListener("pointermove",ev=>{if(touch.id!==ev.pointerId)return;const dx=ev.clientX-touch.sx,dy=ev.clientY-touch.sy;if(!touch.moved&&Math.hypot(dx,dy)<11)return;touch.moved=true;dragging=true;touch.x=Math.max(-80,Math.min(80,touch.ox+dx*.38));touch.y=Math.max(-40,Math.min(40,touch.oy+dy*.26));camera();});
 function end(ev){if(touch.id!==ev.pointerId)return;if(touch.moved){touch.ignore=true;setTimeout(()=>{touch.ignore=false;},100);}touch.id=null;dragging=false;}
 ui.stage.addEventListener("pointerup",end);ui.stage.addEventListener("pointercancel",end);
 ui.stage.addEventListener("click",ev=>{if(touch.ignore){ev.stopPropagation();return;}if(!playing||!ui.cover.hidden||!ui.modal.hidden||waiting)return;if(ev.target.closest("button"))return;advance();});
}
function initial(){
 ui.cover.querySelector("#beginBtn").addEventListener("click",()=>{fresh()});
 ui.cover.addEventListener("click",ev=>{if(!ev.target.closest("button"))fresh();});
 const cont=$("continueBtn");cont.hidden=!read(SAVE);cont.addEventListener("click",()=>{const saved=read(SAVE);if(saved)restore(saved);});
 $("menuBtn").addEventListener("click",()=>openModal("settings"));
 $("logBtn").addEventListener("click",()=>openModal("log"));
 $("evidenceBtn").addEventListener("click",()=>openModal("evidence"));
 $("saveBtn").addEventListener("click",()=>openModal("save"));
 $("closeModal").addEventListener("click",closeModal);
 ui.modal.addEventListener("click",e=>{if(e.target===ui.modal)closeModal()});
 ui.auto.addEventListener("click",toggleAuto);ui.sound.addEventListener("click",toggleSound);ui.skip.addEventListener("click",skipRead);
 $("centerView").addEventListener("click",()=>{touch.x=0;touch.y=0;camera();});
 document.addEventListener("keydown",ev=>{
  if(ev.key==="Escape"&&!ui.modal.hidden){closeModal();return;}
  if(ev.target.tagName==="BUTTON"||!ui.cover.hidden||!playing)return;
  if(ev.key==="Escape"){openModal("settings");return;}
  if(!ui.modal.hidden)return;
  if(ev.key===" "||ev.key==="Enter"||ev.key==="ArrowRight"){ev.preventDefault();advance();}
  if(ev.key.toLowerCase()==="a")toggleAuto();
 });
 window.addEventListener("pagehide",save);
 bindCamera();camera();place("stop");updateButtons();
}
initial();
})();