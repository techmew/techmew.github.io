/* OTODAMA combat director v135 — source-owned auto spectator action, no audio/network access. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OtodamaDirector=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const STYLES=[
 {name:'パワー型',distance:128,pace:.86,pressure:.13,guard:.02,dodge:0,counter:0,skills:['meteor','uppercut','shockwave'],tell:'重い一撃をためている'},
 {name:'スピード型',distance:91,pace:1.18,pressure:.08,guard:-.01,dodge:.08,counter:.02,skills:['combo','aerial','warp'],tell:'踏み込む隙を見ている'},
 {name:'守備型',distance:169,pace:.92,pressure:-.02,guard:.095,dodge:.02,counter:.04,skills:['shockwave','counter','spin'],tell:'相手の出方を見ている'},
 {name:'カウンター型',distance:147,pace:1.04,pressure:0,guard:.035,dodge:.045,counter:.085,skills:['counter','warp','uppercut'],tell:'反撃の機会をうかがう'},
 {name:'バランス型',distance:127,pace:1.03,pressure:.045,guard:.035,dodge:.035,counter:.04,skills:['rush','aerial','uppercut'],tell:'相手の弱点を探している'},
 {name:'変化型',distance:193,pace:1.05,pressure:.045,guard:.015,dodge:.045,counter:.04,skills:['beam','warp','spin'],tell:'間合いを変えて揺さぶる'}
];
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const hash=x=>{let v=(Number(x)||0)>>>0;v=Math.imul(v^v>>>16,0x45d9f3b);v=Math.imul(v^v>>>16,0x45d9f3b);return(v^v>>>16)>>>0};
function rand(seed){let n=seed>>>0;return()=>{n=(n+0x6D2B79F5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function styleFor(c,profile){
 if(Number.isInteger(profile?.style))return clamp(profile.style,0,5);
 const s=Array.isArray(c?.stats)?c.stats:[50,50,50,50,50],v=c?.voice||{};
 const scores=[s[0]*1.15+s[4]*.2,s[2]*1.23+s[0]*.1,s[1]*1.23+s[3]*.1,s[3]*1.15+s[1]*.14,s.reduce((a,b)=>a+b,0)*.235,(Number(v.rhythm)||50)*.57+(Number(v.res)||50)*.57];
 return scores.indexOf(Math.max(...scores));
}
function getCombatPersona(c,profile){
 const style=styleFor(c,profile),v=c?.voice||{},dna=c?.audioDNA;
 // Personality uses vocal timing/consistency, never the raw microphone volume.
 const beat=clamp(Number(v.rhythm)||50,0,100)/100,steady=clamp(Number(v.stable)||50,0,100)/100;
 const signatures=(dna?.version===1&&Number.isSafeInteger(dna.signature)?dna.signature:c?.seed)||1;
 const quirks=hash(signatures^0xc75f1d);
 return {style,name:STYLES[style].name,spacing:STYLES[style].distance+(quirks%37)-18,
   tempo:clamp(STYLES[style].pace+(.5-beat)*-.12,.8,1.3),
   patience:clamp(steady*.6+(quirks%13)/40,.08,.85),initiative:.32+beat*.24,
   feint:(quirks>>>4)%11===0,signature:quirks};
}
function arenaFor(stage,turn){
 if(turn<6||turn%7!==6)return null;
 const hazards=['無重力ゾーン','空間反転','残響増幅','音速暴走','落雷の嵐','無重力ゾーン'];
 return hazards[(Math.max(1,stage)-1)%6];
}
function chooseAttack(style,rng,energy,near,guarding,atWall,combo){
 const list=STYLES[style].skills,sel=list[Math.floor(rng()*list.length)];
 if(energy>=72)return style===1?'combo':style===2?'shockwave':style===3?'counter':style===5?'beam':'meteor';
 if(atWall&&near&&rng()<.36)return 'uppercut';
 if(combo&&near&&rng()<.52)return 'combo';
 if(!near&&style===5)return rng()<.55?'beam':'warp';
 if(guarding&&rng()<.45)return 'warp';
 return sel;
}
function simulate(a,b,options={}){
 const fighters=[a,b],profiles=options.profiles||fighters.map(c=>({style:styleFor(c),mutation:{tier:0},potential:50}));
 const personas=fighters.map((c,i)=>getCombatPersona(c,profiles[i]));
 const max=fighters.map((c,i)=>Math.round(132+(c.stats?.[1]||50)*.92+(profiles[i].mutation?.tier||0)*7));
 const hp=max.slice(),events=[],rng=rand((options.seed===undefined?Date.now():options.seed)>>>0),energy=[0,0],awaken=[false,false],momentum=[0,0];
 const stage=Number(options.stage||b?.stage||1),traits=fighters.map(c=>Array.isArray(c?.audioDNA?.traits)?c.audioDNA.traits:[]);
 const edge=typeof options.edge==='function'?options.edge:()=>1;
 let distance=280,lastAtk=-1,streak=0,lastKind=['',''],arena=null;
 for(let turn=0;turn<50&&hp[0]>0&&hp[1]>0;turn++){
  const p0=personas[0],p1=personas[1],s0=a.stats,s1=b.stats;
  const aggressiveness=(momentum[0]-momentum[1])*.035+((s0[2]-s1[2])/600)+(p0.initiative-p1.initiative)*.12;
  let atk=rng()<clamp(.5+aggressiveness,.30,.70)?0:1;
  if(atk===lastAtk)streak++;else streak=0;
  if(streak>=3){atk=1-atk;streak=0}
  lastAtk=atk;
  const def=1-atk,A=fighters[atk],B=fighters[def],P=personas[atk],D=personas[def],ps=profiles[atk],ds=profiles[def],aa=A.stats,bb=B.stats;
  const state=STYLES[P.style],retreat=STYLES[D.style];
  if(turn%7===6)arena=arenaFor(stage,turn);
  const before=distance;
  // Position evolves from styles and the previous exchange, not a constant oscillating sine wave.
  distance=clamp(distance+(-state.pace*62+(retreat.distance>155?22:0)+(rng()-.5)*62),68,325);
  const near=distance<175,atWall=distance<84,guarding=D.style===2||D.style===3;
  let skill=energy[atk]>=72&&(rng()<.73||hp[atk]/max[atk]<.42);
  let kind=chooseAttack(P.style,rng,skill?100:energy[atk],near,guarding,atWall,lastKind[atk]==='combo');
  if(!skill&&energy[atk]>=72&&rng()<.27){kind='uppercut';}
  let hits=['combo','spin','aerial'].includes(kind)?2+Math.floor(rng()*3):1;
  if(skill)hits=Math.max(3,hits);
  if(arena==='音速暴走')hits=Math.max(2,hits);
  const feint=P.feint&&rng()<.21&&!skill;
  const precision=clamp(.052+(aa[3]-50)/1300+(momentum[atk]*.018),.045,.18);
  const crit=rng()<precision;
  const dodge=rng()<clamp(.07+retreat.dodge+(bb[2]-50)/1250+(arena==='無重力ゾーン'?.04:0)+(near?-.025:.018),.025,.27);
  const guard=!dodge&&rng()<clamp(.10+retreat.guard+(bb[1]-50)/1400-(P.style===5?.025:0),.04,.35);
  const counter=!dodge&&rng()<clamp(.036+retreat.counter+(bb[3]-50)/1700+(guard?.025:0),.02,.25);
  let awakenSide=-1;
  for(const side of [atk,def]){
   if(!awaken[side]&&hp[side]>0&&hp[side]/max[side]<.36&&rng()<.53){
    awaken[side]=true;awakenSide=side;energy[side]=Math.min(100,energy[side]+30);
   }
  }
  // Modest stat spread, capped elemental edge, small rarity-independent growth, and low single-hit spike.
  const base=8+aa[0]*.123+aa[4]*.057-bb[1]*.067+(rng()-.5)*5;
  const raw=base*(hits>1?1+.11*(hits-1):1)*(crit?1.3:1)*(skill?1.53:1)
     *(awaken[atk]?1.12:1)*clamp(edge(A,B),.89,1.11)
     *(1+Math.min(4,ps.mutation?.tier||0)*.0175)
     *(arena==='落雷の嵐'?1.10:arena==='空間反転'?.91:1);
  let damage=clamp(Math.round(raw),3,39),selfDamage=0;
  if(dodge)damage=0;
  else{if(guard)damage=Math.max(1,Math.round(damage*.34));
   if(counter){selfDamage=clamp(Math.round(4+bb[0]*.095),5,15);damage=Math.max(1,Math.round(damage*.72))}
  }
  hp[def]=Math.max(0,hp[def]-damage);hp[atk]=Math.max(0,hp[atk]-selfDamage);
  energy[atk]=Math.min(100,(skill?0:energy[atk])+14+(arena==='残響増幅'?8:0));
  energy[def]=Math.min(100,energy[def]+(guard?14:counter?12:7));
  momentum[atk]=damage>0?Math.min(4,momentum[atk]+1):Math.max(-2,momentum[atk]-1);
  momentum[def]=counter?Math.min(4,momentum[def]+2):Math.max(-2,momentum[def]-1);
  lastKind[atk]=kind;
  const phase=turn<4?'序盤':hp[0]<max[0]*.42||hp[1]<max[1]*.42?'終盤':'中盤';
  const commentary=awakenSide>=0?'覚醒！ ここから逆転できるか':skill?'必殺技！':
    dodge?'相手の動きを読んで回避！':counter?'受けて返した！':guard?'攻撃をしのいだ！':
    feint?'動きで相手を揺さぶった！':crit?'強打が決まった！':hits>1?'連撃をつないだ！':
    turn%7===6&&arena?'地形変化：'+arena:state.tell;
  events.push({atk,kind,damage,crit,hits,dodge,guard,counter,skill,selfDamage,arena,hp:hp.slice(),
    awakenSide,commentary,phase,feint,distanceBefore:before,distanceAfter:distance,style:P.style,enemyStyle:D.style,
    motion:skill?'special':counter?'counter':dodge?'evade':guard?'block':feint?'feint':near?'close':'dash',
    comboStep:hits>1?hits:0,windup:skill?.27:P.style===0?.31:feint?.25:.15});
 }
 const ratio=hp.map((h,i)=>h/max[i]),winner=ratio[0]===ratio[1]?(profiles[0].power>=profiles[1].power?0:1):ratio[0]>ratio[1]?0:1;
 return {events,max,winner,profiles,personas,turns:events.length,estimatedSeconds:events.length*.82+1.5};
}
function smooth(x){const t=clamp(x,0,1);return t*t*(3-2*t)}
function movement(ev,progress,atk){
 const p=clamp(progress,0,1),forward=atk===0?1:-1,style=Number(ev?.style)||0;
 const before=clamp(Number(ev?.distanceBefore)||240,75,320),after=clamp(Number(ev?.distanceAfter)||120,68,320);
 const wind=clamp(Number(ev?.windup)||.17,.08,.4);
 const phase=smooth((p-wind)/Math.max(.2,.54-wind)),recover=smooth((p-.58)/.42),travel=(after-before)*phase;
 const center=360,contact=clamp(56+after*.52,90,212),back=clamp(115+before*.5,135,252);
 const ax=center-forward*(back+(contact-back)*phase+(back-contact)*.46*recover);
 const dx=center+forward*(back*.92+(contact-back*.92)*phase*.84+Math.max(0,before-after)*.23*recover);
 const jump=['aerial','uppercut','meteor','warp'].includes(ev.kind),step=style===1?36:style===0?12:24;
 const tilt=(ev.motion==='feint'?Math.sin(p*10)*.18:0)+(p<wind?-forward*.12:forward*.17*phase);
 const launch=jump?Math.sin(Math.PI*clamp((p-.18)/.65,0,1))*96:ev.kind==='spin'?Math.sin(Math.PI*p)*40:0;
 return {attacker:{x:clamp(ax,85,635),y:214-launch-step*.3*Math.sin(Math.PI*p),rot:tilt+ (ev.kind==='spin'?forward*p*Math.PI*1.35:0),scale:.69+(ev.skill?.1:0)},
 defender:{x:clamp(dx,85,635),y:216-(ev.dodge?Math.sin(Math.PI*p)*105:ev.guard?11*Math.sin(Math.PI*p):ev.damage?24*Math.sin(Math.PI*p):0),rot:ev.dodge?-forward*.19:ev.guard?forward*.10:ev.damage?-forward*.20*phase:0,scale:.69}};
}
function morphology(c){
 const seed=Number(c?.seed)||1,voice=c?.voice||{},e=Math.min(3,c?.evolutionVoices?.length||0);
 const n=hash(seed^0x51227)%6;
 const shapes=[{name:'細身',w:.77,h:1.19},{name:'重装',w:1.16,h:.92},{name:'浮遊',w:.87,h:1.06},{name:'丸型',w:1.12,h:.87},{name:'獣型',w:.97,h:1.03},{name:'機械型',w:1.04,h:.99}];
 const shape=shapes[n];
 return {kind:n,name:shape.name,width:clamp(shape.w+((Number(voice.res)||50)-50)*.0008+e*.015,.72,1.22),
   height:clamp(shape.h+((Number(voice.pitch)||50)-50)*.0007+e*.018,.82,1.26),evolution:e};
}
function advice(events,winner){
 if(!Array.isArray(events)||!events.length)return '声を変えると戦い方も変わります';
 const mine=events.filter(e=>e.atk===0),foe=events.filter(e=>e.atk===1);
 if(winner===0)return mine.some(e=>e.skill)?'必殺技が勝負を決めました':mine.some(e=>e.counter)?'反撃のタイミングが勝因です':'得意な間合いで戦えました';
 if(foe.filter(e=>e.hits>=3&&!e.dodge).length>2)return '相手の連撃に押されました。防御型も試そう';
 if(mine.filter(e=>e.dodge).length>2)return '攻撃を避けられました。速さの違うキャラを試そう';
 if(foe.some(e=>e.skill))return '相手の必殺に押されました。耐久型も試そう';
 return '相手の戦法が上手でした。別の声・キャラで再挑戦';
}
return Object.freeze({STYLES,hash,rand,styleFor,getCombatPersona,arenaFor,chooseAttack,simulate,movement,morphology,advice});
});
