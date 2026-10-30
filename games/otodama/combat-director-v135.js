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
function voiceFusion(c){
 const list=Array.isArray(c?.evolutionVoices)?c.evolutionVoices.slice(0,9):[];
 const kinds=['リズム','響き','安定','変化'];const counts=kinds.map(name=>list.filter(v=>v?.focus===name).length);
 return {extra:list.length,rhythm:counts[0],echo:counts[1],steady:counts[2],change:counts[3],unique:counts.filter(Boolean).length};
}
// Stage bonus is determined by the recorded evolution voice; older saves retain defaults.
function evolutionCombatBonus(c){
 const voices=Array.isArray(c?.evolutionVoices)?c.evolutionVoices.slice(0,3):[];
 let attack=0,hp=0;
 for(const v of voices){
  attack+=Number.isFinite(v?.attackBonus)?clamp(v.attackBonus,8,14):12;
  hp+=Number.isFinite(v?.hpBonus)?clamp(v.hpBonus,5,10):8;
 }
 return {attack:Math.min(42,attack),hp:Math.min(30,hp)};
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
 const evo=fighters.map(evolutionCombatBonus);
 const max=fighters.map((c,i)=>{const tier=i===1?c?.stageBoss?.tier:'';const factor=tier==='final'?1.85:tier==='boss'?1.48:tier==='mid'?1.24:1;return Math.round((132+(c.stats?.[1]||50)*.92+(profiles[i].mutation?.tier||0)*7)*(1+evo[i].hp/100)*factor);});
 const hp=max.slice(),events=[],rng=rand((options.seed===undefined?Date.now():options.seed)>>>0),energy=[0,0],awaken=[false,false],momentum=[0,0];
 const stage=Number(options.stage||b?.stage||1),traits=fighters.map(c=>Array.isArray(c?.audioDNA?.traits)?c.audioDNA.traits:[]);
 const fused=fighters.map(voiceFusion);
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
  const resonance=fused[atk],shelter=fused[def];
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
  if(kind==='combo'&&resonance.rhythm&&rng()<.18*resonance.rhythm)hits=Math.min(5,hits+1);
  if(arena==='音速暴走')hits=Math.max(2,hits);
  const feint=P.feint&&rng()<.21&&!skill;
  const precision=clamp(.052+(aa[3]-50)/1300+(momentum[atk]*.018),.045,.18);
  const crit=rng()<precision;
  const dodge=rng()<clamp(.07+retreat.dodge+(bb[2]-50)/1250+(arena==='無重力ゾーン'?.04:0)+(near?-.025:.018)+shelter.change*.016,.025,.27);
  const guard=!dodge&&rng()<clamp(.10+retreat.guard+(bb[1]-50)/1400-(P.style===5?.025:0)+shelter.steady*.018,.04,.35);
  const counter=!dodge&&rng()<clamp(.036+retreat.counter+(bb[3]-50)/1700+(guard?.025:0),.02,.25);
  let awakenSide=-1;
  for(const side of [atk,def]){
   if(!awaken[side]&&hp[side]>0&&hp[side]/max[side]<.36&&rng()<.53){
    awaken[side]=true;awakenSide=side;energy[side]=Math.min(100,energy[side]+30);
   }
  }
  // Modest stat spread, capped elemental edge, small rarity-independent growth, and low single-hit spike.
  const base=8+aa[0]*.123+aa[4]*.057-bb[1]*.067+(rng()-.5)*5;
  const bossPressure=atk===1?(A?.stageBoss?.tier==='final'?1.17:A?.stageBoss?.tier==='boss'?1.12:A?.stageBoss?.tier==='mid'?1.06:1):1;
  const raw=base*bossPressure*(P.style===0?1.24:1)*(hits>1?1+.11*(hits-1):1)*(crit?1.3:1)*(skill?1.53:1)
     *(awaken[atk]?1.12:1)*(skill?1+resonance.echo*.024:1)*clamp(edge(A,B),.89,1.11)
     *(1+Math.min(4,ps.mutation?.tier||0)*.0175)
     *(1+evo[atk].attack/100)
     *(arena==='落雷の嵐'?1.10:arena==='空間反転'?.91:1);
  // Evolved attacks get a slightly higher damage ceiling so the boost is not erased at 39.
  let damage=clamp(Math.round(raw),3,39+Math.min(3,resonance.extra)*4),selfDamage=0;
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
    feint?'動きで相手を揺さぶった！':crit?'強打が決まった！':hits>1&&resonance.rhythm?'重ねた声で連撃！':hits>1?'連撃をつないだ！':
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
// v138 cinematic blocking: coherent charge -> velocity burst -> shared impact -> aerial chase / knockback.
// Every strike reaches the defender at p=0.54; no arbitrary sinusoidal fighter displacement.
function movement(ev,progress,atk){
 const p=clamp(Number(progress),0,1),forward=atk===0?1:-1,kind=typeof ev?.kind==='string'?ev.kind:'rush';
 const style=clamp(Number(ev?.style)||0,0,5),hits=clamp(Math.round(Number(ev?.hits)||1),1,7);
 const before=clamp(Number(ev?.distanceBefore)||265,68,325),after=clamp(Number(ev?.distanceAfter)||135,68,325);
 const charge=clamp(Number(ev?.windup)||.16,.08,.34),contact=.54;
 const fast=clamp((p-charge)/(contact-charge),0,1),dash=1-Math.pow(1-fast,2.55);
 const recoil=Math.sin(Math.PI*clamp(p/charge,0,1))*((style===0||ev?.skill)?23:12);
 const recovery=smooth((p-contact)/.43),bodyHit=clamp((p-.48)/.16,0,1);
 const startR=clamp(119+before*.34,140,231),settleR=clamp(105+after*.34,136,220);
 const beam=['beam','shockwave'].includes(kind),teleport=kind==='warp';
 const closeR=beam?clamp(103+after*.19,122,164):(ev?.dodge?47:51);
 let approach=dash;
 if(teleport&&p>.34&&p<.51)approach=clamp(approach+.19,0,1);
 let attackR=startR+(closeR-startR)*approach+recoil*(1-approach);
 let defendR=startR*.94+(closeR-startR*.94)*approach;
 const hit=!!(Number(ev?.damage)>0)&&!ev?.dodge;
 // Chasing a successful aerial knockback uses a second, smaller burst after impact.
 const bounce=hit?(beam?38:Math.min(143,67+Number(ev.damage)*1.55+(ev?.skill?18:0))):0;
 const evade=ev?.dodge?111:0;
 const guarded=!!ev?.guard;
 const counter=!!ev?.counter&&!ev?.dodge;
 attackR=attackR+(settleR-attackR)*recovery*.78-(hits>1&&hit?29*Math.sin(Math.PI*recovery):0);
 defendR=defendR+(settleR+bounce+evade-defendR)*recovery;
 if(counter){attackR+=(55+23*recovery)*recovery;defendR-=50*recovery;}
 if(ev?.dodge&&p>.54){attackR-=36*recovery;}
 const jump=['aerial','uppercut','meteor','warp','spin','combo'].includes(kind);
 const airborne=jump?Math.sin(Math.PI*clamp((p-.13)/.78,0,1)):0;
 const attackerLift=kind==='meteor'
   ?(p<.4?120*smooth((p-.1)/.3):120*(1-smooth((p-.4)/.15)))
   :kind==='uppercut'?Math.sin(Math.PI*clamp((p-.24)/.68,0,1))*91:
    kind==='warp'?Math.sin(Math.PI*clamp((p-.31)/.42,0,1))*115:
    airborne*(kind==='aerial'?103:kind==='combo'?49:kind==='spin'?60:38);
 const retaliate=counter?Math.sin(Math.PI*clamp((p-.48)/.5,0,1))*45:0;
 const launched=hit?Math.sin(Math.PI*clamp((p-.51)/.49,0,1))*
    (kind==='uppercut'||kind==='aerial'?142:kind==='meteor'?57:kind==='combo'?100:ev?.skill?104:69):0;
 const dodgeLift=ev?.dodge?Math.sin(Math.PI*clamp((p-.32)/.61,0,1))*132:0;
 // Distinct snap hits within a combo; avoids an always-static attacker during the recorded 7-hit rush.
 const combo=hits>=3&&hit?Math.sin(Math.PI*2*hits*clamp((p-.40)/.37,0,1)):0;
 const tremor=combo*(1-recovery)*14;
 const ax=clamp(360-forward*attackR+forward*tremor,77,643);
 const dx=clamp(360+forward*defendR+forward*(ev?.dodge?16*bodyHit:0),77,643);
 const attackY=clamp(229-attackerLift+(ev?.skill?11*Math.sin(p*18):0)-Math.abs(combo)*7,70,339);
 const defenseY=clamp(230-launched-dodgeLift-retaliate+(guarded?10:0),65,345);
 const lungeTilt=forward*(p<charge?-.24:(.27+.22*(1-recovery))*dash);
 const spin=kind==='spin'?forward*Math.PI*2.05*smooth(p):kind==='aerial'?forward*.58*airborne:kind==='uppercut'?-forward*.47*airborne:0;
 const knocked=hit?-forward*(.68*bodyHit*(1-recovery)+.12*recovery):0;
 return {attacker:{x:ax,y:attackY,rot:lungeTilt+spin+(teleport?forward*.15*airborne:0),scale:clamp(.73+.16*dash+(ev?.skill ? .075 : 0)+Math.abs(combo)*.024,.68,1.03)},
 defender:{x:dx,y:defenseY,rot:ev?.dodge?-forward*.32*dodgeLift/132:counter?forward*.35*recovery:guarded?forward*.12:knocked,
 scale:clamp(.73-(hit ? .035*bodyHit : 0)+(guarded ? .06 : 0),.65,.88)},
 impact:{x:clamp((ax+dx)/2,85,635),y:clamp((attackY+defenseY)/2,78,355)},
 intensity:clamp((dash*(1-recovery)*.6+Math.abs(combo)*.2+(ev?.skill?.3:0)),0,1),
 rush:hits>1,charged:p<charge,hit:hit&&p>=contact-.09&&p<contact+.25};
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
return Object.freeze({STYLES,hash,rand,styleFor,getCombatPersona,voiceFusion,evolutionCombatBonus,arenaFor,chooseAttack,simulate,movement,morphology,advice});
});
