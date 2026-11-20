/* P0 Android adoption click and touch: production source + DOM mocked.
 * node neo-wild/p0-android-adopt-tap-regression.cjs */
"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const src=fs.readFileSync(path.join(__dirname,"squad-gacha-ui.js"),"utf8");
const coreSrc=fs.readFileSync(path.join(__dirname,"squad-core.js"),"utf8");
new Function(src);new Function(coreSrc);
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++};
const before=src.indexOf("const makeBtn=(label,fn,cl,reliableTouch=false)=>");
const after=src.indexOf("\nconst ready=",before);
ok(before>=0&&after>before,"real button source");
const events={};
const element={type:"",addEventListener:(name,fn)=>events[name]=fn};
const el=()=>element;
const mk=new Function("el",src.slice(before,after)+";return makeBtn;")(el);
let calls=0;
mk("この個体で決定",()=>calls++,"squad-adopt",true);
const now=Date.now(),tap={pointerType:"touch",isPrimary:true,pointerId:3,clientX:100,clientY:200,
 preventDefault(){}};
events.pointerdown(tap);
events.pointerup(tap);
ok(calls===1,"Android pointerup commits even without click");
events.click({isTrusted:true});
ok(calls===1,"synthetic native click after touch cannot double adopt");
events.click({isTrusted:false});
ok(calls===2,"direct top-button programmatic click still commits");
const commit=src.slice(src.indexOf("  const confirm=makeBtn(\"この個体を"+""),src.indexOf("  actions.append(confirm);body.append(actions);"));
ok(commit.includes("committing=true")&&commit.includes("}finally{committing=false;}"),"transaction guard");
ok(commit.includes("root.hidden=true;activeConfirm=null"),"close only after verified storage");
ok(commit.includes("core.addInitialSlot(staged)")&&commit.includes("core.fillVacancy(staged)"),"initial and release-ticket adoption");
ok(commit.includes("core.newSquad(chosen,leader)"),"empty roster durable adoption");
ok(src.includes('if(finalizing&&typeof activeConfirm==="function"){activeConfirm();return;}'),"header shares bottom transaction");
ok(commit.includes('info.textContent=reason;'),"user sees actual failure");
ok(src.includes("pointercancel")&&src.includes("Math.hypot(event.clientX-start.x"),"scroll/cancel guards");
console.log("P0 ANDROID ADOPT TAP PASS "+checks+" checks (V8/Node mocked, not phone)");
