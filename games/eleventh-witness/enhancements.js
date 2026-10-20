/* Eleventh Witness v0.3: additive controls. Existing autosave remains unchanged. */
(function(){
'use strict';
var BASE='eleventh_witness_',KEY=BASE+'save_v1',SEEN=BASE+'seen_v2',SLOT=BASE+'slot_',RESUME=BASE+'resume_slot';
function el(id){return document.getElementById(id);}
function load(key,fallback){try{var s=localStorage.getItem(key);return s?JSON.parse(s):fallback;}catch(e){return fallback;}}
function save(key,v){try{localStorage.setItem(key,JSON.stringify(v));return true;}catch(e){return false;}}
function state(){return load(KEY,null);}
function dialog(){return !!(state()&&el('cover')&&el('cover').hidden&&el('modal').hidden&&el('interaction').hidden&&!el('textBox').hidden);}
var seen=load(SEEN,{});if(!seen||typeof seen!=='object')seen={};
function sceneKey(){var s=state();return s?String(s.pos)+'|'+String(el('text').textContent).slice(0,100):'';}
var touch={x:0,y:0,moved:false};
document.addEventListener('pointerdown',function(e){touch.x=e.clientX;touch.y=e.clientY;touch.moved=false;},true);
document.addEventListener('pointermove',function(e){if(Math.hypot(e.clientX-touch.x,e.clientY-touch.y)>9)touch.moved=true;},true);
function recordRead(){if(!dialog()||touch.moved)return;var k=sceneKey();if(k){seen[k]=true;save(SEEN,seen);}}
document.addEventListener('click',function(e){
 if(!dialog()||touch.moved)return;
 if(e.target.closest('#textBox')||e.target.closest('#next')||e.target===el('storyStage')||e.target===el('sceneWorld')||e.target===el('person')||e.target===el('location'))recordRead();
},true);
document.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&dialog()&&e.target.tagName!=='BUTTON')recordRead();},true);
var css=document.createElement('style');
css.textContent='#ew-tools{display:flex;align-items:center;gap:3px}.ew-btn{font:inherit;font-size:11px;border:1px solid #70bbb7;border-radius:7px;background:#193c4c;color:#e2fff9;padding:7px 9px;min-height:34px;touch-action:manipulation}.ew-btn[aria-pressed=true]{background:#267a6b}.ew-btn:focus-visible{outline:3px solid #ffda8c}#ew-modal{position:fixed;inset:0;z-index:99;display:flex;justify-content:center;align-items:center;padding:12px;background:#020815df;touch-action:pan-y}#ew-modal[hidden]{display:none}#ew-panel{background:#0a1b2d;border:1px solid #7fe5d4;border-radius:13px;padding:20px;color:#e8f9f4;width:min(560px,100%);max-height:90dvh;overflow:auto;line-height:1.7;font-size:14px}#ew-panel h2{margin:0 0 14px;font-size:20px}.ew-row{border-top:1px solid #365365;padding:12px 0}.ew-row strong{display:block;color:#b7f7eb}.ew-row small{display:block;color:#b2c7d0;margin:3px 0 7px}.ew-time{display:inline-block;min-width:55px;color:#9af7e6;font-family:monospace}#ew-panel button{margin:3px}@media(max-width:550px){.brand-text small{display:none}.brand-text strong{font-size:11px}.brand{gap:4px}.sigil{display:none}.small-btn{padding:6px 5px;font-size:10px}#ew-tools{gap:2px}.ew-btn{padding:6px 5px;font-size:10px}}@media(max-width:355px){.brand-text strong{font-size:10px}.small-btn{font-size:9px;padding:6px 3px}.ew-btn{font-size:9px;padding:6px 3px}}';
document.head.appendChild(css);
var tools=document.createElement('div');tools.id='ew-tools';
function btn(label,fn,disabled){var b=document.createElement('button');b.type='button';b.className='ew-btn';b.textContent=label;b.disabled=!!disabled;if(fn)b.addEventListener('click',fn);return b;}
var auto=btn('▶ 自動'),util=btn('記録');auto.setAttribute('aria-pressed','false');tools.appendChild(auto);tools.appendChild(util);
if(el('topActions'))el('topActions').insertBefore(tools,el('topActions').firstChild);
var autoOn=false,timer=null,lastPos=null;
function stopAuto(){autoOn=false;auto.textContent='▶ 自動';auto.setAttribute('aria-pressed','false');if(timer)clearTimeout(timer);timer=null;lastPos=null;}
auto.addEventListener('click',function(){if(autoOn){stopAuto();return;}autoOn=true;auto.textContent='Ⅱ 自動';auto.setAttribute('aria-pressed','true');lastPos=null;});
setInterval(function(){
 if(!autoOn)return;
 if(!dialog()){if(timer)clearTimeout(timer);timer=null;lastPos=null;return;}
 var s=state();if(!s||lastPos===s.pos)return;lastPos=s.pos;
 if(timer)clearTimeout(timer);
 var pos=s.pos;var wait=Math.max(1700,Math.min(7000,900+String(el('text').textContent).length*80));
 timer=setTimeout(function(){timer=null;if(!autoOn||!dialog()||!state()||state().pos!==pos)return;recordRead();el('next').click();},wait);
},250);
var modal=document.createElement('div');modal.id='ew-modal';modal.hidden=true;modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-label','記録と事件時刻表');
var panel=document.createElement('div');panel.id='ew-panel';modal.appendChild(panel);document.body.appendChild(modal);
function close(){modal.hidden=true;util.focus();}
modal.addEventListener('click',function(e){if(e.target===modal)close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!modal.hidden){e.stopPropagation();close();}},true);
function row(title,desc){var r=document.createElement('div');r.className='ew-row';var h=document.createElement('strong');h.textContent=title;r.appendChild(h);if(desc){var p=document.createElement('small');p.textContent=desc;r.appendChild(p);}return r;}
function slotRead(i){var s=load(SLOT+i,null);if(!s||!s.state||!Number.isInteger(s.state.pos)||s.state.pos<0||!Array.isArray(s.state.found)||!Array.isArray(s.state.log))return null;return s;}
function skipRead(){
 stopAuto();if(!dialog())return;
 for(var i=0;i<120&&dialog();i++){var s=state();if(!s||!seen[sceneKey()])break;el('next').click();if(!state()||state().pos===s.pos)break;}
}
function showTools(){
 stopAuto();modal.hidden=false;panel.replaceChildren();
 var heading=document.createElement('h2');heading.textContent='記録・時刻表';panel.appendChild(heading);
 var read=row('既読スキップ','以前に読んだ会話だけを送ります。未読の会話と推理では止まります。');
 read.appendChild(btn('既読を送る →',function(){close();skipRead();},!dialog()));panel.appendChild(read);
 var s=state();
 for(var i=1;i<=3;i++){(function(slot){
  var item=slotRead(slot),r=row('セーブ '+slot,item?'保存：'+new Date(item.savedAt).toLocaleString('ja-JP'):'未保存');
  r.appendChild(btn('保存',function(){var v=state();if(!v)return;if(!save(SLOT+slot,{savedAt:new Date().toISOString(),state:v}))window.alert('保存できませんでした。');showTools();},!s));
  r.appendChild(btn('ロード',function(){if(!item)return;if(!window.confirm('セーブ'+slot+'を読み込みますか？ 現在の自動保存は上書きされます。'))return;if(!save(KEY,item.state))return window.alert('ロードできませんでした。');try{sessionStorage.setItem(RESUME,'1');}catch(e){}window.location.reload();},!item));
  panel.appendChild(r);
 })(i);}
 var timeline=row('事件時刻表','取得した証拠だけを表示します。死亡時刻はまだ確定していません。');
 var found=s&&Array.isArray(s.found)?s.found:[];
 [['23:49','音声メモ保存',found.includes('memo')],['00:12','資料室09の扉が封鎖',found.includes('door')],['00:13','廊下で声が聞こえた（生声かは未確定）',!!s&&s.pos>=12],['00:18','資料室09の扉が解錠',found.includes('door')]].forEach(function(x){var p=document.createElement('div');p.className='ew-row';var t=document.createElement('span');t.className='ew-time';t.textContent=x[0];var v=document.createElement('span');v.textContent=x[2]?x[1]:'未調査';p.appendChild(t);p.appendChild(v);timeline.appendChild(p);});
 panel.appendChild(timeline);panel.appendChild(btn('閉じる',close));
}
util.addEventListener('click',showTools);
try{if(sessionStorage.getItem(RESUME)==='1'){sessionStorage.removeItem(RESUME);setTimeout(function(){if(el('continueBtn')&&!el('continueBtn').hidden)el('continueBtn').click();},80);}}catch(e){}
})();