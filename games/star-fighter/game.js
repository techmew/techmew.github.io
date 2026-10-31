/* STAR FIGHTER v1.0 — original canvas arcade shooter. No external dependencies. */
(()=>{'use strict';
const W=1200,H=675,TAU=Math.PI*2,EXTRA=window.StarFighterEnemyExtras;
const C=document.getElementById('game'),c=C.getContext('2d',{alpha:false});
const $=id=>document.getElementById(id);
const sideNovaButton=$('sidePulseBtn'),sideEquipButton=$('sideEquipBtn');
const ui={overlay:$('overlay'),start:$('startBtn'),pause:$('sidePauseBtn'),sound:$('soundBtn'),score:$('score'),best:$('best'),mult:$('multiplier'),stage:$('stageLabel'),area:$('areaName'),progress:$('progressBar'),hp:$('hpRow'),lives:$('lives'),bombs:$('bombs'),boss:$('bossHud'),bossName:$('bossName'),bossBar:$('bossBar'),announce:$('announce'),small:$('announceSmall'),main:$('announceMain'),desc:$('announceDesc'),toast:$('toast'),meter:$('meterInfo'),upgrades:[...document.querySelectorAll('.upgrade')],equip:$('equipBtn'),pulse:$('pulseBtn')};
const NAMES=['ORBITAL FIELD','IRON CORRIDOR','DEEP NEBULA','BURNING STRATUM','FROZEN GRAVE','RELIC BELT','ABYSSAL GATE','LAST HORIZON'],SUBS=['外縁軌道を突破せよ','機械要塞を突破せよ','星雲の深部を制圧せよ','灼熱惑星の熱波を突破せよ','氷結残骸帯を突破せよ','古代遺跡の封印を突破せよ','異界境界の位相嵐を突破せよ','収束する終端宙域を突破せよ'],BOSSES=['BATTLE CRUISER','FORTRESS CORE','ABYSS TITAN','MOLTEN CRAB','FROST MAMMOTH','RELIC CENTIPEDE','AETHER JELLYFISH','HORIZON ARK'];
const STAGE_LENGTHS=[62,68,74,72,76,80,84,90],BOSS_HP=[1900,2650,3600,4250,4850,5650,6450,7400];
/* Clear stage ladder: early bosses are reasonable, final encounters are tougher.
   Modes can be changed at any point, even during a live boss fight. */
const DIFFICULTIES=Object.freeze({
 easy:Object.freeze({name:'イージー',bossHp:.73,enemyHp:.76,enemyFire:1.26,spawnInterval:1.18,speed:.93,bossTempo:.86,hullDamage:.78}),
 normal:Object.freeze({name:'ノーマル',bossHp:1,enemyHp:1,enemyFire:1,spawnInterval:1,speed:1,bossTempo:1,hullDamage:1}),
 hard:Object.freeze({name:'ハード',bossHp:1.42,enemyHp:1.28,enemyFire:.82,spawnInterval:.90,speed:1.08,bossTempo:1.17,hullDamage:1.25})
});
const validDifficulty=v=>v==='easy'||v==='normal'||v==='hard';
function difficultyProfile(){return DIFFICULTIES[validDifficulty(G.difficulty)?G.difficulty:'normal']}
function bossStageMultiplier(stage){return 1.22+.05*cl(stage,0,7)}
const DIFFICULTY_KEY='star_fighter_difficulty';
/* Eight-step damage curve. A single hull and XP-based frame level replace
   revives/lives. Growth is bounded to 25 levels; old saves are migrated. */
const SHIP_MAX_LEVEL=25,HULL_BASE=120,HULL_PER_LEVEL=8;
const HULL_HIT_BY_STAGE=Object.freeze([13,14,15,16,18,19,21,23]);
function maxHull(level){return HULL_BASE+(Math.max(1,Math.min(SHIP_MAX_LEVEL,level))-1)*HULL_PER_LEVEL}
function shipXPThreshold(level){return 70+28*level}
function actualHullDamage(weight=1){
 const base=HULL_HIT_BY_STAGE[Math.max(0,Math.min(7,G.stage))];
 return Math.max(1,Math.round(base*(weight>1?1+.53*(weight-1):1)*(G.stage>0?(G.routeRisk?1.08:.94):1)*difficultyProfile().hullDamage));
}
function repairHull(amount){
 if(!Number.isFinite(amount)||amount<=0)return 0;
 const before=p.hp;p.hp=Math.min(p.maxHp,p.hp+Math.ceil(amount));return p.hp-before;
}
function grantShipXP(amount){
 if(G.debugMode||G.mode!=='playing'||!Number.isFinite(amount)||amount<=0||G.shipLevel>=SHIP_MAX_LEVEL)return;
 G.shipXP+=Math.floor(amount);let levels=0;
 while(G.shipLevel<SHIP_MAX_LEVEL&&G.shipXP>=shipXPThreshold(G.shipLevel)){
  G.shipXP-=shipXPThreshold(G.shipLevel);G.shipLevel++;
  p.maxHp=maxHull(G.shipLevel);repairHull(HULL_PER_LEVEL+3);levels++;
 }
 if(levels){showToast('SHIP LEVEL '+G.shipLevel);updateHud()}
}
const ROUTE_OPTIONS=[[{name:'漂流船の回廊',desc:'敵が少なく物資を回収しやすい',bonus:'ノヴァ +1 / 物資抽選↑',risk:0},{name:'プラズマ急流',desc:'高速の編隊が出現し敵が増える',bonus:'カプセル +1 / 撃破得点 +25%',risk:1}],[{name:'星雲の静域',desc:'敵の攻勢が穏やかになる',bonus:'ノヴァ +1 / 物資抽選↑',risk:0},{name:'紅色の裂け目',desc:'精鋭編隊と高密度の敵が出現',bonus:'カプセル +1 / 撃破得点 +25%',risk:1}],[{name:'火山灰の補給路',desc:'冷却施設・回復中心 / ボス: 機械カニ',bonus:'ノヴァ +1 / 物資抽選↑',risk:0},{name:'恒星フレア回廊',desc:'高火力敵・希少報酬 / ボス: 太陽竜',bonus:'カプセル +1 / 撃破得点 +25%',risk:1}],[{name:'氷結整備回廊',desc:'氷片を射撃で破壊可能・補給重視 / BOSS 機械マンモス',bonus:'ノヴァ +1 / 物資抽選↑',risk:0},{name:'白夜の追撃帯',desc:'吹雪で視界悪化・精鋭部隊 / BOSS 氷海竜',bonus:'カプセル +1 / 撃破得点 +25%',risk:1}],[{name:'遺跡の記録庫',desc:'破壊可能なルーン柱・防御イベント / ボス: 機械ムカデ',bonus:'ノヴァ +1 / 古代装甲の修復',risk:0},{name:'封印中枢への突入',desc:'封印格子・守護隊の奇襲 / ボス: 黒曜の守護者',bonus:'カプセル +1 / 希少報酬抽選↑',risk:1}],[{name:'位相の避難帯',desc:'透過膜を破壊・位相共鳴 / ボス: 宇宙クラゲ',bonus:'ドライブ充填 / 低密度編隊',risk:0},{name:'裂界の追撃路',desc:'空間裂傷・異界迎撃隊 / ボス: 裂界メデューサ',bonus:'撃破補給1個 / 希少報酬抽選↑',risk:1}],[{name:'光の帰還航路',desc:'破壊可能な光晶・終端補給 / ボス: ホライゾン・アーク',bonus:'バリア補給 / 低密度編隊',risk:0},{name:'特異点の突入路',desc:'破壊不能な重力断層・最終迎撃隊 / ボス: 特異点の皇帝',bonus:'撃破補給1個 / 精鋭・高得点',risk:1}]];


/* Event choices are rolled from the run seed and previous branch, not visual RNG. */
const ROUTE_NAMES=[
 [['漂流船の回廊','青い残響','補給航路'],['プラズマ急流','赤い追跡線','雷光の峡谷']],
 [['星雲の静域','蒼光の水路','星屑の避難帯'],['紅色の裂け目','雷雲の回廊','深紅の追撃路']],
 [['火山灰の補給路','冷却管の峡谷','溶岩の迂回路'],['恒星フレア回廊','赤い突破線','熱圏の追撃路']],
  [['氷結整備回廊','青氷の補給線','凍土の避難路'],['白夜の追撃帯','氷嵐の裂け目','白い危険宙域']],
 [['古代の記録庫','青銅の回廊','静かな碑文帯'],['封印中枢','黒曜の狭間','守護者の門']],
 [['位相の避難帯','透過する海','薄明の宙道'],['裂界の追撃路','異界の傷跡','歪曲する門']],
 [['光の帰還航路','最後の灯火','終端の補給線'],['特異点の突入路','収束する闇','決戦の深層']]
];
const ROUTE_EVENTS={
 safe:[
  {id:'salvage',name:'漂流物資',short:'補給ポッド×1',desc:'航行中に物資が漂着',when:21},
  {id:'beacon',name:'修復ビーコン',short:'バリア +1',desc:'防御装置の信号を受信',when:24},
  {id:'cache',name:'旧式補給庫',short:'補給ポッド×1',desc:'旧式の補給庫を発見',when:27},
  {id:'charge',name:'青い共鳴',short:'ドライブ +30',desc:'オーバードライブを充填',when:20}
 ],
 storm:[
  {id:'pursuit',name:'追撃隊の影',short:'精鋭撃破で補給',desc:'迎撃機の追撃が発生',when:21},
  {id:'flare',name:'プラズマ嵐',short:'精鋭撃破で補給',desc:'高速の旋回部隊が襲来',when:24},
  {id:'freighter',name:'武装貨物船',short:'貨物船撃破で補給',desc:'物資を載せた敵艦を迎撃',when:27},
  {id:'ambush',name:'重力の裂け目',short:'精鋭撃破で補給',desc:'重装部隊の待ち伏せ',when:20}
 ]
};
/* Live flight gate: compact factual differences, derived from actual variants. */
const ROUTE_BOSS_INTEL=[
 ['KRAKEN ENGINE','FORTRESS CORE'],['ABYSS TITAN','IRON TYRANT'],
 ['MOLTEN CRAB / SCORPION DREAD','SOLAR WYRM'],['FROST MAMMOTH / TURTLE BULWARK','GLACIAL LEVIATHAN'],
 ['RELIC CENTIPEDE','OBSIDIAN WARDEN'],['AETHER JELLYFISH','RIFT MEDUSA'],
 ['HORIZON ARK','SINGULARITY EMPEROR']
];
const ROUTE_THREAT_INTEL=[
 ['低密度偵察・輸送船','高速迎撃・重装隊'],['低密度偵察・補給船','精鋭編隊・機雷'],
 ['熱噴出口・低密度編隊','熱噴出口・高速迎撃'],['破壊できる氷片・偵察','吹雪障害・精鋭部隊'],
 ['破壊できるルーン柱・偵察','封印格子・守護隊'],['破壊できる位相膜・偵察','空間裂傷・迎撃隊'],
 ['破壊できる光晶・偵察','重力断層・最終迎撃隊']
];
function routeOffer(stage,index){
 const previous=G.routeHistory[stage-1]?.risk??-1;
 const salt=(G.runSeed^Math.imul(previous+2,0x45d9f3b))>>>0;
 const nameRoll=mixSeed(salt,stage+11,index+3);
 const eventRoll=mixSeed(salt^0xa1f5c3d9,stage+29,index+7);
 const event=stage===6?(index?{id:'finalHunters',name:'最終迎撃隊',short:'撃破で補給1個',desc:'過去の危険航路数で追撃が強まる',when:30}:{id:'finalBeacon',name:'終端の灯台',short:'バリア+1 / ドライブ+15',desc:'残された航路記録から補給を回収',when:30}):stage===5?(index?{id:'riftHunters',name:'異界迎撃隊',short:'撃破補給1個',desc:'空間裂け目から迎撃機が出現',when:29}:{id:'phaseEcho',name:'位相共鳴',short:'ドライブ+18',desc:'異界の残響を回収して充填',when:29}):stage===4?(index?{id:'sentinel',name:'封印守護隊',short:'精鋭撃破で補給1個',desc:'古代守護隊を撃破して1個回収',when:25}:{id:'archive',name:'古代記録庫',short:'バリア+1 / ドライブ+12',desc:'防御装置を起動',when:25}):ROUTE_EVENTS[index?'storm':'safe'][eventRoll%4];
 const chain=stage>0&&previous===index;
 return {...ROUTE_OPTIONS[stage][index],name:ROUTE_NAMES[stage][index][nameRoll%3],event,chain,bossName:ROUTE_BOSS_INTEL[stage][index],threat:ROUTE_THREAT_INTEL[stage][index]};
}

/* Stage 1 stays neutral. Each branch changes encounter pressure, drops and tactics. */
const ROUTE_TUNING={
 normal:{spawnInterval:1,enemyHp:1,fireInterval:1,pickupRate:.08,magnet:120,bossHp:1,maxEnemies:14,score:1,speed:1},
 safe:{spawnInterval:1.16,enemyHp:.95,fireInterval:1.08,pickupRate:.12,magnet:155,bossHp:.94,maxEnemies:9,score:1,speed:.98},
 storm:{spawnInterval:.96,enemyHp:1.08,fireInterval:.96,pickupRate:.075,magnet:120,bossHp:1.12,maxEnemies:12,score:1.25,speed:1.04}
};
function routeProfile(){return G.stage===0?ROUTE_TUNING.normal:(G.routeRisk?ROUTE_TUNING.storm:ROUTE_TUNING.safe)}

/* Encounter director: bounded, deterministic pressure; never consumes RNG.
   Storms stay riskier than supply routes, while crowding and damage buy space.
   No difficulty values are added to the visible HUD. */
function encounterDirector(){
 const tune=routeProfile(),phase=cl(G.stageTime/STAGE_LENGTHS[G.stage],0,1);
 const base=G.stage===0?.32:(G.routeRisk===1?.57:.27);
 const crowd=cl(G.enemies.length/tune.maxEnemies,0,1);
 const bullets=cl(G.bullets.length/55,0,1);
 const recovery=G.directorGrace>0?Math.min(.24,.10+G.directorGrace*.016):0;
 // 34/36: last-life recovery window; patrols and continuous combat remain active.
 const ratio=p.hp/Math.max(1,p.maxHp),critical=ratio<.28;
 const resilience=ratio>.8?.05:ratio<.3?-.15:ratio<.5?-.08:0;
 const pressure=cl(base+phase*.16+resilience-crowd*.22-bullets*.09-recovery,.12,critical?.54:.82);
 return {pressure,crowd,bullets,recovery,budget:pressure>.59?4:pressure>.32?3:2};
}
function nextWaveDelay(){
 const d=encounterDirector(),tune=routeProfile();
 // Compact, overlapping formations. Crowd and damage still trigger restraint.
 const raw=GR(1.35,2.05)*tune.spawnInterval*difficultyProfile().spawnInterval;
 const crowdDelay=d.crowd>.58?(d.crowd-.58)*1.8:0;
 const recoveryDelay=G.directorGrace>0?.38:0;
 return cl(raw*(1.04-(d.pressure-.3)*.13)+crowdDelay+recoveryDelay,1.15,3.2);
}

const MAX=[2,3,2,2,3,3],PNAMES=['BOOST','SPREAD','LASER','MISSILE','OPTION','SHIELD'];
/* Six run-only passive modules, two ranks each; no permanent power creep. */
const PASSIVES=[
 {name:'高速給弾',desc:'自動射撃の間隔を12%短縮'},
 {name:'回収磁場',desc:'アイテム吸引範囲 +70'},
 {name:'蓄電回路',desc:'ドライブ充填量 +22%'},
 {name:'再生装甲',desc:'バリア+1、次の面でも+1'},
 {name:'衝撃増幅',desc:'ノヴァの威力 +30%'},
 {name:'回収解析',desc:'敵の補給品ドロップ率 +2.5%'}
];
const passiveRank=i=>G.passives[i]||0;
const pickupMagnetRadius=()=>routeProfile().magnet+70*passiveRank(1);
const pickupPullSpeed=()=>250+65*passiveRank(1);
const salvageRate=()=>Math.min(.25,routeProfile().pickupRate+.025*passiveRank(5)+(synergyActive(5)?.02*passiveRank(5):0));
const passiveSummary=()=>PASSIVES.map((a,i)=>passiveRank(i)?a.name+' '+passiveRank(i):'').filter(Boolean).join(' / ');
/* Run-only synergies: derived from existing weapons and passives, no save format change. */
const SYNERGIES=[
 {weapon:1,passive:0,name:'連射散弾',desc:'SPREADに中央補助弾を追加'},
 {weapon:2,passive:2,name:'光電変換',desc:'LASER初命中でドライブ充填'},
 {weapon:3,passive:4,name:'破砕弾頭',desc:'MISSILE着弾時に小範囲ダメージ'},
 {weapon:4,passive:1,name:'磁気追尾',desc:'OPTION弾が近い敵へ緩く追尾'},
 {weapon:5,passive:3,name:'反応障壁',desc:'SHIELD被弾時に周囲の敵弾を消去'},
 {weapon:0,passive:5,name:'加速回収',desc:'BOOST中の補給ドロップ率が上昇'}
];
const synergyActive=i=>G.levels[SYNERGIES[i].weapon]>0&&passiveRank(SYNERGIES[i].passive)>0;
const synergySummary=()=>SYNERGIES.filter((s,i)=>synergyActive(i)).map(s=>s.name).join(' / ');
/* Attack damage sets the primary threat. Ship level makes a small contribution
   so the encounter director reacts to overall progress as well as upgrades.
   Higher levels never secretly change a boss already in combat. */
function offensiveBuild(){
 const l=G.levels||[0,0,0,0,0,0];
 return cl(((l[1]||0)*1+(l[2]||0)*2.6+(l[3]||0)*1.5+
  (l[4]||0)*1.6+(G.passives?.[0]||0)*.9)/17.8,0,1);
}
function pilotThreat(){
 const offense=offensiveBuild();
 const hullGrowth=cl(((G.shipLevel||1)-1)/(SHIP_MAX_LEVEL-1),0,1);
 return cl(offense*.85+hullGrowth*.15,0,1);
}
/* Preserve earned damage when a player upgrades or changes power mid-wave.
   Armor never regenerates once a particular enemy's plates are broken. */
function refreshEnemyStrength(e){
 if(!e||e.hp<=0||!Number.isFinite(e.baseHull))return;
 const threat=pilotThreat(),ease=.75+.25*cl(p.hp/Math.max(1,p.maxHp)/.7,0,1);
 if(Math.abs((e.combatTier||0)-threat)<.0001&&Math.abs((e.scalingEase||1)-ease)<.01&&e.combatDifficulty===G.difficulty)return;
 const previous=Math.max(1,e.maxHp),fraction=cl(e.hp/previous,0,1);
 const maxHp=Math.max(1,Math.round(e.baseHull*(1+4.4*threat*ease)*difficultyProfile().enemyHp));
 const armorMax=e.adaptiveArmor?
  (threat>.14?Math.round(maxHp*(.08+.25*threat)):0):
  (threat>.58&&e.armorSignature===0?Math.round(maxHp*(.25+.28*threat)):0);
 const armorFraction=e.armorMax>0?cl((e.armor||0)/e.armorMax,0,1):1;
 e.hp=Math.max(.1,maxHp*fraction);
 e.maxHp=maxHp;
 e.armorMax=armorMax;
 e.armor=e.armorBroken?0:Math.round(armorMax*armorFraction);
 e.combatTier=threat;e.scalingEase=ease;e.combatDifficulty=G.difficulty;
}
function refreshActiveEnemies(){
 if(!G.enemies?.length)return;
 for(const e of G.enemies)refreshEnemyStrength(e);
}
function refreshBossStrength(b){
 if(!b||b.hp<=0||invulnerablePracticeBoss())return;
 const next=offensiveBuild();
 if(Math.abs(next-(b.adaptiveTier||0))<.0001&&b.combatDifficulty===G.difficulty)return;
 const ratio=cl(b.hp/Math.max(1,b.maxHp),0,1);
 const newMax=Math.max(1,Math.round(b.adaptiveBaseHp*(1+7.2*next)*difficultyProfile().bossHp));
 b.maxHp=newMax;b.hp=Math.max(.1,newMax*ratio);
 b.adaptiveTier=next;b.combatDifficulty=G.difficulty;
 b.reactiveDamage=Math.min(b.reactiveDamage||0,newMax*.10);
}
function bossArmorMultiplier(b){
 const tier=b?.adaptiveTier||0;
 if(tier<=0)return 1;
 const cycle=(Math.max(0,b.t||0)+.35)%5.8;
 const open=cycle>=2.05&&cycle<4.70;
 const lowHull=p.hp/Math.max(1,p.maxHp)<.31;
 // Burst fire triggers a short, visible counter-shield. Dodging its salvo
 // buys a weak-core opening. Low hull softens defensive pressure.
 if(b.reactiveShield>0)return lowHull?.38:.055;
 if(b.reactiveExpose>0)return 1+.40*tier;
 return open?1+.26*tier:(lowHull?1-.10*tier:1-.62*tier);
}
/* Heavier foes can shatter armor, dodge once, then fire a warned retort.
   Light scouts deliberately remain fragile to preserve power fantasy. */
/* Piercing shots may damage several different targets, but not the same target
   repeatedly on every animation frame while intersecting its hitbox. */
function projectileFirstHit(shot,target){
 if(!shot.hitTargets)shot.hitTargets=new Set();
 if(shot.hitTargets.has(target))return false;
 shot.hitTargets.add(target);return true;
}
function damageEnemy(e,damage){
 if(!e||!Number.isFinite(damage)||damage<=0||e.hp<=0)return;
 const old=e.armor||0;
 if(old>0){
  const blocked=Math.min(old,damage*.65);
  e.armor=Math.max(0,old-blocked);damage-=blocked;
  if(e.armor===0)e.armorBroken=true;
  if(e.armor===0&&e.hp>damage&&e.x<W-50&&e.x>190){
   e.dodgeTime=.55;e.dodgeSide=e.y<H*.5?1:-1;
   if(G.bullets.length<55&&p.hp/Math.max(1,p.maxHp)>.32){
    e.aiWarn=Math.max(e.aiWarn,.72);e.aiAimX=p.x;e.aiAimY=p.y;
    e.fire=Math.max(e.fire,1.15);
   }
   e.hitFlash=Math.max(e.hitFlash||0,.21);
  }
 }
 e.hp-=damage;
}
/* Boss and pilot are invulnerable only in the optional debug boss duel. */
const invulnerablePracticeBoss=()=>G.debugMode===true&&G.debugBossOnly===true;
function damageBoss(b,damage){
 if(!b||!Number.isFinite(damage)||damage<=0)return;
 if(invulnerablePracticeBoss()){b.hp=b.maxHp;return}
 if(bossMoveGuarded(b))return;
 const dealt=damage*bossArmorMultiplier(b);
 b.hp-=dealt;
 if((b.adaptiveTier||0)>.22&&b.entryReady&&b.x<=980&&
    (b.reactiveTriggers||0)<(G.stage===7?3:2)&&b.hp>Math.max(1,b.maxHp*.07)){
  b.reactiveDamage=(b.reactiveDamage||0)+dealt;
  if((b.reactiveCooldown||0)<=0&&b.reactiveDamage>=b.maxHp*.105){
   b.reactiveShield=1.7;b.reactiveExpose=0;
   b.reactiveCooldown=5.7;b.reactiveStrike=.79;
   b.reactiveTargetY=cl(p.y,108,H-95);
   b.reactiveDamage=0;b.reactiveTriggers=(b.reactiveTriggers||0)+1;
   ring(b.x-62,b.y,180,'#83ceff',.55);
   tone(160,.35,'sawtooth',.055,310);
  }
 }
}

/* Distinct visual and mechanical moves for all 16 bosses, four each.
   Telegraph >=.65s precedes physical collision, and guarded shells genuinely
   block player damage. Original projectile attacks remain the baseline. */
const BOSS_SPECIAL_MOVES=Object.freeze({
"BATTLE CRUISER":Object.freeze([{"label":"主砲レール伸長","type":"extend"},{"label":"可動副砲旋回","type":"orbit"},{"label":"格納庫デコイ","type":"mine"},{"label":"艦体防御シャッター","type":"guard"}]),
"KRAKEN ENGINE":Object.freeze([{"label":"八腕触手伸縮","type":"tentacle"},{"label":"交差触手拘束","type":"pincer"},{"label":"吸引渦","type":"vortex"},{"label":"触手砲台旋回","type":"orbit"}]),
"FORTRESS CORE":Object.freeze([{"label":"防護壁閉鎖","type":"guard"},{"label":"中央貫通レール","type":"beam"},{"label":"分離砲台旋回","type":"orbit"},{"label":"左右砲塔挟撃","type":"pincer"}]),
"ABYSS TITAN":Object.freeze([{"label":"空間圧縮渦","type":"vortex"},{"label":"次元跳躍","type":"warp"},{"label":"衝撃環","type":"ring"},{"label":"深淵裂け目","type":"wall"}]),
"IRON TYRANT":Object.freeze([{"label":"顎の伸縮砲","type":"neck"},{"label":"装甲尾撃","type":"whip"},{"label":"重装甲防御","type":"guard"},{"label":"脚部突進","type":"charge"}]),
"MOLTEN CRAB":Object.freeze([{"label":"溶融ハサミ挟撃","type":"pincer"},{"label":"甲殻防御","type":"guard"},{"label":"熱噴出口壁","type":"wall"},{"label":"多脚横滑り","type":"charge"}]),
"SCORPION DREAD":Object.freeze([{"label":"プラズマ尾針","type":"tail"},{"label":"両ハサミ捕獲","type":"pincer"},{"label":"地中潜行","type":"warp"},{"label":"連続刺突","type":"whip"}]),
"SOLAR WYRM":Object.freeze([{"label":"竜首伸長","type":"neck"},{"label":"翼の爆炎","type":"wave"},{"label":"恒星フレア","type":"ring"},{"label":"火炎急降下","type":"charge"}]),
"TURTLE BULWARK":Object.freeze([{"label":"油圧式の長首突進","type":"neck"},{"label":"亀甲全閉装甲","type":"guard"},{"label":"甲羅の旋回砲台","type":"orbit"},{"label":"四脚重装突進","type":"charge"}]),
"FROST MAMMOTH":Object.freeze([{"label":"氷牙伸長","type":"neck"},{"label":"氷壁形成","type":"wall"},{"label":"氷晶機雷","type":"mine"},{"label":"重量踏み潰し","type":"charge"}]),
"GLACIAL LEVIATHAN":Object.freeze([{"label":"長首伸縮","type":"neck"},{"label":"流氷圧縮波","type":"wave"},{"label":"冷却ブレス","type":"beam"},{"label":"翼ひれ挟撃","type":"pincer"}]),
"RELIC CENTIPEDE":Object.freeze([{"label":"多節胴体締め付け","type":"coil"},{"label":"節砲掃射","type":"orbit"},{"label":"多脚壁走り","type":"charge"},{"label":"機械輪列","type":"ring"}]),
"OBSIDIAN WARDEN":Object.freeze([{"label":"四腕封鎖","type":"pincer"},{"label":"石装甲封印","type":"guard"},{"label":"封印光線","type":"beam"},{"label":"石腕の振り下ろし","type":"whip"}]),
"AETHER JELLYFISH":Object.freeze([{"label":"透過触手伸縮","type":"tentacle"},{"label":"電磁浮遊環","type":"ring"},{"label":"発光機雷","type":"mine"},{"label":"傘膜収縮","type":"wave"}]),
"RIFT MEDUSA":Object.freeze([{"label":"位相転移","type":"warp"},{"label":"鏡像交差","type":"mirror"},{"label":"次元裂け目壁","type":"wall"},{"label":"石化光線","type":"beam"}]),
"HORIZON ARK":Object.freeze([{"label":"格納庫放出","type":"mine"},{"label":"艦体防護モジュール","type":"guard"},{"label":"衛星アーム旋回","type":"orbit"},{"label":"航路レーザー","type":"beam"}]),
"SINGULARITY EMPEROR":Object.freeze([{"label":"重力井戸","type":"vortex"},{"label":"黒点ワープ","type":"warp"},{"label":"事象環回転","type":"orbit"},{"label":"終末光格子","type":"wall"}])
});
function bossMoveGuarded(b){
 const s=b?.specialMove;return s?.type==='guard'&&s.elapsed>=s.warning&&s.elapsed<s.warning+s.duration;
}
function startBossMove(b){
 const list=BOSS_SPECIAL_MOVES[b.name];if(!list||b.x>980)return;
 const move=list[b.pattern%4];
 b.specialMove={
  label:move.label,type:move.type,index:b.pattern%4,elapsed:0,warning:.72,
  duration:move.type==='guard'?1.7:move.type==='beam'?1:.68,
  targetY:cl(p.y,112,H-112),warpY:cl(p.y+(b.pattern%2?84:-84),152,H-152),
  started:false,active:false,pulses:0,color:G.stage>=6?'#d6aaff':G.stage===4?'#a9eaff':G.stage===3?'#ffce92':'#b4ffea'
 };
}

/* 17 individual boss salvos. Warning locks the target; bullets arrive
   in successive beats, with distinct launch points, curves and safe gaps. */
function bossSignatureVolley(b,m,beat){
 const x=b.x-154,y=b.y,goal=m.targetY,side=beat%2?1:-1;
 const fire=(xx,yy,a,speed=205,size=4.7,curve=0)=>{
  const n=G.bullets.length;
  bullet(xx,yy,a,speed+(b.phase?16:0),size,m.color);
  if(curve&&G.bullets.length>n)G.bullets[G.bullets.length-1].curve=curve;
 };
 const at=(xx,yy)=>Math.atan2(goal-yy,p.x-xx),left=Math.PI;
 switch(b.name){
 case 'BATTLE CRUISER':
  for(const h of [-82,82])for(let k=0;k<2;k++)fire(x-25,y+h,at(x-25,y+h)+side*k*.15,219+k*22);break;
 case 'KRAKEN ENGINE':
  for(let i=0;i<5;i++)fire(x-76,y+(i-2)*46,left+(i-2)*.15+side*.09,189+i*10,4.5,(i-2)*.27);break;
 case 'FORTRESS CORE':
  for(let i=0;i<7;i++)if(i!==3&&i!==1+beat%2)fire(x-42,110+i*73,left+(i%2?.055:-.055),210,5);break;
 case 'ABYSS TITAN':
  for(let i=0;i<8;i++)if(i!==beat%8&&i!==(beat+1)%8){
   const a=i*TAU/8+beat*.23;fire(x+Math.cos(a)*56,y+Math.sin(a)*60,a+Math.PI*.32,186,4.4,side*.24)}break;
 case 'IRON TYRANT':
  for(const k of [-1,0,1])fire(x-78,y-70,at(x-78,y-70)+k*.18,252,5.3);
  fire(x+28,y+107,left-side*.36,200,7);break;
 case 'MOLTEN CRAB':
  for(const h of [-118,118])for(let k=0;k<2;k++)fire(x-64,y+h,at(x-64,y+h)+Math.sign(h)*(k?.23:.07),211,5.2);break;
 case 'SCORPION DREAD':
  for(const k of [-1,0,1])fire(x-95,y-128,at(x-95,y-128)+k*(beat?.11:.24),274,6);break;
 case 'SOLAR WYRM':
  for(let i=0;i<4;i++)fire(x-i*18,102+((i+beat*2)%8)*70,left+side*.09,223+i*9,5);break;
 case 'TURTLE BULWARK':
  for(const h of [-105,105])for(const off of [-.2,.2])fire(x-49,y+h,at(x-49,y+h)+off,190,5.5);break;
 case 'FROST MAMMOTH':
  for(const h of [-68,68])for(let i=0;i<3;i++)fire(x-94,y+h,left+Math.sign(h)*(.08+i*.14),175+i*18,5.5);break;
 case 'GLACIAL LEVIATHAN':
  for(let i=0;i<5;i++)fire(x-35,y+(i-2)*53,left+side*.07*(i-2),211+Math.abs(i-2)*13,4.5,side*.19);break;
 case 'RELIC CENTIPEDE':
  for(let i=0;i<5;i++){const xx=x+34*i,yy=y+(i%2?1:-1)*(25+i*14);
   fire(xx,yy,at(xx,yy)+(i-2)*side*.12,201+i*8)}break;
 case 'OBSIDIAN WARDEN':
  for(let i=0;i<4;i++){const yy=y+(i-1.5)*83;fire(x-44,yy,at(x-44,yy)+(i%2?-.2:.2)*side,212,5.1)}break;
 case 'AETHER JELLYFISH':
  for(let i=0;i<5;i++)fire(x-83,y+(i-2)*39,left+(i-2)*.10,164+i*15,4.2,side*(i-2)*.29);break;
 case 'RIFT MEDUSA':
  for(const h of [goal,H-goal])for(const k of [-1,1]){
   const yy=cl(h,98,H-98);fire(x-39,yy,at(x-39,yy)+k*.18,218,5,side*.14)}break;
 case 'HORIZON ARK':
  for(let i=0;i<4;i++){const a=i*TAU/4+beat*.24,xx=x+Math.cos(a)*81,yy=y+Math.sin(a)*94;
   fire(xx,yy,at(xx,yy)+(i-1.5)*.1,219,5)}break;
 case 'SINGULARITY EMPEROR':
  for(let i=0;i<6;i++)if(i!==beat%6){const a=i*TAU/6+beat*.35;
   fire(x+Math.cos(a)*75,y+Math.sin(a)*77,a+left*.45,176,5,(i%2?1:-1)*.36)}break;
 }
}
function bossMoveStep(b,dt){
 const s=b.specialMove;if(!s)return;
 s.elapsed+=dt;s.active=s.elapsed>=s.warning&&s.elapsed<s.warning+s.duration;
 // Do not overwrite an extended claw or a closed shell before its visible
 // hitbox has fully retracted; each movement gets its complete active window.
 if(s.elapsed<s.warning+s.duration)
  b.fire=Math.max(b.fire,s.warning+s.duration-s.elapsed+.10);
 if(s.active&&!s.started){
  s.started=true;
  const bx=b.x-145,yy=b.y,fire=(x,y,a,vel=202,size=4.5)=>
   bullet(x,y,a,vel+G.stage*2,size,s.color);
  const aimed=(x,y)=>Math.atan2(p.y-y,p.x-x);
  if(s.type==='orbit'||s.type==='ring'){
   for(let i=0;i<10;i++){if(i===2||i===7)continue;
    fire(bx,yy,TAU*i/10+b.t*(s.type==='orbit'?.38:.13),s.type==='orbit'?187:171,4)}
  }else if(s.type==='mine'){
   for(let k=-2;k<=2;k++)if(k!==0)fire(bx,yy+k*47,Math.PI+k*.09,173);
  }else if(s.type==='wall'||s.type==='wave'){
   for(let k=0;k<8;k++)if(k!==3&&k!==4){
    const y=cl(98+k*74,95,H-95);
    fire(bx,y,Math.PI+(k%2?.1:-.1),s.type==='wall'?185:202);
   }
  }else if(s.type==='vortex'){
   for(const side of [-1,1])for(const off of [.18,.40,.62])
    fire(bx,yy,aimed(bx,yy)+side*off,187);
  }else if(s.type==='tail'){
   const y=yy-115,a=aimed(bx-65,y);
   for(const offset of [-.24,0,.24])fire(bx-65,y,a+offset,231,5);
  }else if(s.type==='mirror'){
   for(const side of [-1,1])for(const k of [0,1]){
    const y=cl(yy+side*100,97,H-97);
    fire(bx,y,aimed(bx,y)+side*(.14+k*.18),210);
   }
  }else if(s.type==='coil'){
   for(let k=-2;k<=2;k++)fire(bx,yy+k*48,aimed(bx,yy+k*48)+k*.10,205);
  }else if(s.type==='warp'){
   for(const side of [-1,1])fire(bx,s.warpY+side*37,aimed(bx,s.warpY+side*37),199);
  }else if(s.type==='guard'){
   for(const side of [-1,1])fire(bx,yy+side*95,Math.PI+side*.15,181);
  }else if(s.type==='beam'){
   b.charge=Math.max(.8,b.charge||0);b.beamY=s.targetY;
  }
 }
 if(s.active){
  const count=b.phase>0?3:2,progress=(s.elapsed-s.warning)/s.duration;
  while(s.pulses<count&&progress>=s.pulses/count){
   bossSignatureVolley(b,s,s.pulses);s.pulses++;
  }
 }
 if(s.type==='warp'&&s.active)b.y+=(s.warpY-b.y)*Math.min(1,dt*7);
 if(s.type==='charge'&&s.active)b.x=Math.max(745,b.x-195*dt);
 if(s.type==='vortex'&&s.active)for(const shot of G.bullets){
  const vx=b.x-100-shot.x,vy=b.y-shot.y,r=Math.hypot(vx,vy)||1;
  if(r<260){shot.vx+=vx/r*dt*170;shot.vy+=vy/r*dt*170}
 }
 if(s.active){
  // Collision is measured against the SAME articulated geometry as drawBossSpecial.
  // A neck, arm or claw cannot hit until it has actually reached the ship.
  const t=cl((s.elapsed-s.warning)/s.duration,0,1);
  const x=b.x-105,fx=x-90-(x-90-170)*Math.sin(Math.PI*t);
  const nearSegment=(ax,ay,bx,by,px,py,r)=>{
   const dx=bx-ax,dy=by-ay,len=dx*dx+dy*dy||1;
   const u=cl(((px-ax)*dx+(py-ay)*dy)/len,0,1);
   return Math.hypot(px-(ax+u*dx),py-(ay+u*dy))<=r;
  };
  const limbY=s.type==='whip'||s.type==='coil'?
   s.targetY+Math.sin(s.elapsed*10)*40:s.targetY;
  if(['tentacle','extend','neck','whip','coil'].includes(s.type)){
   let contact=false;
   if(s.type==='tentacle'||s.type==='coil'){
    let prevX=x,prevY=b.y;
    for(let i=1;i<=18;i++){
     const u=i/18,v=1-u;
     const bx=v*v*v*x+3*v*v*u*(x-120)+3*v*u*u*(fx+100)+u*u*u*fx;
     const by=v*v*v*b.y+3*v*v*u*(b.y+60)+3*v*u*u*(limbY-70)+u*u*u*limbY;
     contact=contact||nearSegment(prevX,prevY,bx,by,p.x,p.y,29);
     prevX=bx;prevY=by;
    }
   }else contact=nearSegment(x,b.y,fx,limbY,p.x,p.y,s.type==='neck'?34:27);
   if(contact)hitPlayer(1);
  }else if(s.type==='pincer'){
   for(const side of [-1,1]){
    const mx=(x+fx)/2,my=b.y+side*110,ey=s.targetY+side*47;
    if(nearSegment(x,b.y+side*72,mx,my,p.x,p.y,27)||
       nearSegment(mx,my,fx,ey,p.x,p.y,27))hitPlayer(1);
   }
  }
 }
 if(s.elapsed>s.warning+s.duration+.35)b.specialMove=null;
}
function drawBossSpecial(b){
 const s=b?.specialMove;if(!s)return;
 const active=s.active,warn=s.elapsed<s.warning,
  fraction=cl((s.elapsed-s.warning)/s.duration,0,1),col=s.color;
 const x=b.x-105,y=b.y,endX=warn?x-90:x-90-(x-90-170)*Math.sin(Math.PI*fraction);
 c.save();c.globalAlpha=warn?.47+.2*Math.sin(G.time*16):active?.96:.18;
 if(['tentacle','extend','neck','whip','coil'].includes(s.type)){
  const targetY=s.type==='whip'||s.type==='coil'?s.targetY+Math.sin(s.elapsed*10)*40:s.targetY;
  c.beginPath();c.moveTo(x,y);c.strokeStyle=col;c.lineWidth=s.type==='neck'?25:18;
  if(s.type==='tentacle'||s.type==='coil')
   c.bezierCurveTo(x-120,y+60,endX+100,targetY-70,endX,targetY);
  else c.lineTo(endX,targetY);
  c.stroke();
  for(let k=0;k<(s.type==='neck'?6:3);k++){
   const px=x+(endX-x)*k/6,py=y+(targetY-y)*k/6;
   ellipse(px,py,10,13,'#29495e',col,2);
  }
  glowCircle(endX,targetY,17,col,14);
 }else if(s.type==='pincer'){
  for(const side of [-1,1]){
   const py=s.targetY+side*47;
   c.strokeStyle=col;c.lineWidth=17;c.beginPath();c.moveTo(x,y+side*72);
   c.lineTo((x+endX)/2,y+side*110);c.lineTo(endX,py);c.stroke();
   glowCircle(endX,py,15,col,12);
  }
 }else if(s.type==='guard'){
  ellipse(b.x-10,b.y,140,118,active?'#263e4ddd':'#2d384777',col,active?9:3);
  for(let i=0;i<6;i++){const a=i*TAU/6+b.t*.2;
   glowCircle(b.x-10+Math.cos(a)*115,b.y+Math.sin(a)*93,8,col,10)}
 }else if(s.type==='warp'||s.type==='mirror'){
  ellipse(b.x-130,s.warpY,94,48,'#313b6b22',col,4);
  glowCircle(b.x-130,s.warpY,16,col,20);
 }else if(s.type==='charge'){
  line(b.x-120,y-90,b.x-120,y+90,col,9);
  for(const side of [-1,1])glowCircle(b.x-120,y+side*92,13,col,12);
 }else{
  const radius=s.type==='vortex'?100:s.type==='ring'||s.type==='orbit'?88:61,
   cy=s.type==='tail'?y-113:y;
  c.beginPath();c.arc(x-30,cy,radius,0,TAU);c.strokeStyle=col;c.lineWidth=3;c.stroke();
  for(let j=0;j<4;j++){const a=j*TAU/4+b.t*.8;
   glowCircle(x-30+Math.cos(a)*radius,cy+Math.sin(a)*radius,6,col,6)}
 }
 c.restore();
}

function applyShotSynergy(shot,target){
 if(shot.kind==='laser'&&synergyActive(1)&&!shot.driveCharged){
  shot.driveCharged=true;chargeDrive(.7*passiveRank(2));
 }
 if(shot.kind==='missile'&&synergyActive(2)&&!shot.splashed){
  shot.splashed=true;
  const rank=passiveRank(4),radius=65+12*rank,damage=10+8*rank;
  for(const e of G.enemies)if(e!==target&&e.x<=W-40&&circleHit(shot.x,shot.y,radius,e.x,e.y,20))damageEnemy(e,damage);
  if(G.boss&&G.boss!==target&&circleHit(shot.x,shot.y,radius,G.boss.x-53,G.boss.y,65))damageBoss(G.boss,Math.round(damage*.65));
  ring(shot.x,shot.y,radius,'#ffa76e',.26);
 }
}
function steerDrone(shot,dt){
 if(!synergyActive(3))return;
 let tx=0,ty=0,nearest=(330+55*passiveRank(1))**2,found=false;
 for(const e of G.enemies){
  const dx=e.x-shot.x,dy=e.y-shot.y,d2=dx*dx+dy*dy;
  if(e.hp>0&&dx>-25&&d2<nearest){nearest=d2;tx=dx;ty=dy;found=true}
 }
 if(G.boss&&G.boss.hp>0){
  const dx=G.boss.x-53-shot.x,dy=G.boss.y-shot.y,d2=dx*dx+dy*dy;
  if(dx>-25&&d2<nearest){nearest=d2;tx=dx;ty=dy;found=true}
 }
 if(!found)return;
 const dist=Math.max(1,Math.sqrt(tx*tx+ty*ty)),turn=Math.min(1,dt*(2+passiveRank(1)*.9));
 shot.vx+=(890*tx/dist-shot.vx)*turn;shot.vy+=(890*ty/dist-shot.vy)*turn;
}

const R=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(R(a,b+1)),cl=(v,a,b)=>Math.max(a,Math.min(b,v)),len=(x,y)=>Math.hypot(x,y);
/* Separate encounter RNG from particles, drawing and audio. Same seed + route + inputs => same gameplay rolls. */
let encounterState=0;
function mixSeed(seed,stage,risk){
 let x=(seed^Math.imul(stage+1,0x9e3779b9)^Math.imul(risk+1,0x85ebca6b))>>>0;
 x^=x>>>16;x=Math.imul(x,0x7feb352d);x^=x>>>15;x=Math.imul(x,0x846ca68b);
 return (x^x>>>16)>>>0;
}
function seedStage(){encounterState=mixSeed(G.runSeed,G.stage,G.routeRisk)}
function gameRandom(){
 encounterState=(encounterState+0x6d2b79f5)>>>0;
 let t=encounterState;t=Math.imul(t^(t>>>15),t|1);
 t^=t+Math.imul(t^(t>>>7),t|61);
 return ((t^(t>>>14))>>>0)/4294967296;
}
const GR=(a,b)=>a+gameRandom()*(b-a),gri=(a,b)=>Math.floor(GR(a,b+1));
function seedHex(n){return (n>>>0).toString(16).toUpperCase().padStart(8,'0')}
const seedInput=$('seedInput'),seedLabel=$('seedLabel'),seedReplay=$('seedReplay'),quickHelp=$('quickHelp');
try{
 const q=new URLSearchParams(window.location?.search||'').get('seed');
 if(q&&/^[0-9a-f]{1,8}$/i.test(q))seedInput.value=q.toUpperCase();
}catch(e){}
seedReplay.addEventListener('click',()=>{
 if(G.mode!=='over'&&G.mode!=='win')return;
 seedInput.value=seedHex(G.runSeed);startGame();
});
function chooseSeed(){
 const typed=seedInput.value.trim().replace(/^0x/i,'');
 if(typed&&!/^[0-9a-f]{1,8}$/i.test(typed)){
  seedLabel.textContent='16進数 1〜8桁で入力';seedInput.focus();return null;
 }
 return typed?parseInt(typed,16)>>>0:Math.floor(Math.random()*4294967296)>>>0;
}

/* Safe auto-save at sector boundaries and route gates; combat state is not serialized. */
/* Persistent 300 cosmetic trophies are independent of the original four medals. */
const TROPHIES=window.STAR_TROPHIES;
if(!TROPHIES||TROPHIES.catalog.length!==300)throw Error('trophy catalog missing');
/* Unlockable cosmetic medals: no persistent stat upgrades. */
const MEDAL_KEY='star_fighter_medals_v1';
const MEDALS=[
 {id:'first',name:'初撃破',color:'#68e7fa',hint:'ボスを1体倒す'},
 {id:'risk',name:'挑戦者',color:'#ffcb81',hint:'危険航路を選ぶ'},
 {id:'graze',name:'回避名人',color:'#b5a2ff',hint:'1周で20回かする'},
 {id:'clear',name:'踏破者',color:'#9ff6b1',hint:'全ステージを突破する'}
];
function readMedals(){
 try{
  const raw=localStorage.getItem(MEDAL_KEY);if(!raw)return {unlocked:[],active:''};
  const d=JSON.parse(raw);
  if(!d||!Array.isArray(d.unlocked)||d.unlocked.length>MEDALS.length||!d.unlocked.every(id=>MEDALS.some(m=>m.id===id))||new Set(d.unlocked).size!==d.unlocked.length||typeof d.active!=='string'||(d.active&&!d.unlocked.includes(d.active)))return {unlocked:[],active:''};
  return {unlocked:d.unlocked.slice(),active:d.active};
 }catch(e){return {unlocked:[],active:''}}
}
let medalState=readMedals();
function saveMedals(){try{localStorage.setItem(MEDAL_KEY,JSON.stringify(medalState))}catch(e){}}
function updateMedalButton(){
 const b=$('medalBtn'),m=MEDALS.find(x=>x.id===medalState.active);
 b.textContent='記章 '+medalState.unlocked.length+'/'+MEDALS.length+' · '+(m?m.name:'未解禁')+' ↻';
 b.title='タップで切替。'+MEDALS.map(x=>x.name+'：'+x.hint).join(' / ');
}
function unlockMedal(id){
 if(G.debugMode)return false;
 if(!MEDALS.some(m=>m.id===id)||medalState.unlocked.includes(id))return false;
 medalState.unlocked.push(id);if(!medalState.active)medalState.active=id;
 saveMedals();updateMedalButton();showToast('記章解禁 · '+MEDALS.find(m=>m.id===id).name);return true;
}
function cycleMedal(){
 if(!medalState.unlocked.length){showToast('ボスを倒すと記章が解禁');return}
 const i=medalState.unlocked.indexOf(medalState.active);
 medalState.active=medalState.unlocked[(i+1)%medalState.unlocked.length];
 saveMedals();updateMedalButton();
}
$('medalBtn').addEventListener('click',cycleMedal);
const CHECKPOINT_KEY='star_fighter_checkpoint_v1';
const continueBtn=$('continueBtn'),continueInfo=$('continueInfo');
function readCheckpoint(){
 try{
  const raw=localStorage.getItem(CHECKPOINT_KEY);if(!raw)return null;
  const d=JSON.parse(raw),int=(v,a,b)=>Number.isInteger(v)&&v>=a&&v<=b;
  if(!d||![1,2].includes(d.v)||!['sector','route','reward'].includes(d.mode)||!int(d.stage,0,NAMES.length-1)||!int(d.runSeed,0,0xffffffff)||
    !int(d.score,0,1e9)||!int(d.lives??0,0,3)||!int(d.pulses,0,5)||!int(d.pulseRecharge??0,0,59)||!int(d.energy,0,6)||
    !int(d.selected,0,5)||!Array.isArray(d.levels)||d.levels.length!==6||!d.levels.every((v,i)=>int(v,0,MAX[i]))||
     (d.pendingUpgrades!==undefined&&(!Array.isArray(d.pendingUpgrades)||d.pendingUpgrades.length!==6||!d.pendingUpgrades.every((v,i)=>int(v,0,MAX[i]-d.levels[i]))))||
    !Array.isArray(d.routeHistory)||d.routeHistory.length!==d.stage||!int(d.routeRisk,0,1)||
    !d.player||!int(d.player.hp,1,d.v===1?3:400)||!int(d.player.shield,0,5)||!int(d.driveCharge,0,100)||
    (d.v===2&&(!int(d.shipLevel,1,SHIP_MAX_LEVEL)||!int(d.shipXP,0,10000000)||d.player.maxHp!==maxHull(d.shipLevel)||d.player.hp>d.player.maxHp||d.lives!==0))||
    !int(d.grazes,0,1e7)||!int(d.maxCombo,0,1e7)||!int(d.killCount,0,1e7)||!int(d.eventCount,0,2)||
    d.routeHistory.some((r,i)=>!r||r.stage!==i+2||!int(r.risk,0,1)||typeof r.route!=='string'||r.route.length>30||
      typeof r.event!=='string'||r.event.length>30)||
    (d.stage===0&&d.routeRisk!==0)||(d.stage>0&&d.routeRisk!==d.routeHistory[d.stage-1].risk)||
    (d.mode==='reward'&&d.stage>=NAMES.length-1)||
    (d.rewardHistory!==undefined&&(!Array.isArray(d.rewardHistory)||d.rewardHistory.length>NAMES.length-1||d.rewardHistory.some((r,i)=>!r||!Number.isInteger(r.stage)||r.stage!==i||typeof r.id!=='string'||r.id.length>24||typeof r.name!=='string'||r.name.length>40)))||
    (d.passives!==undefined&&(!Array.isArray(d.passives)||d.passives.length!==PASSIVES.length||!d.passives.every(v=>int(v,0,2))))||
    (d.difficulty!==undefined&&!validDifficulty(d.difficulty)))throw Error('invalid checkpoint');
  if(d.v===1){
   d.shipLevel=1;d.shipXP=0;
   d.player.hp=Math.max(1,Math.round(HULL_BASE*d.player.hp/3));
   d.player.maxHp=HULL_BASE;d.lives=0;d.v=2;
  }
  d.difficulty=d.difficulty??'normal';
  return d;
 }catch(e){try{localStorage.removeItem(CHECKPOINT_KEY)}catch(err){}return null}
}
function updateContinueButton(){
 const d=readCheckpoint();continueBtn.hidden=!d;continueInfo.hidden=!d;
 if(d){continueBtn.textContent='続きから再開 · SECTOR 0'+(d.stage+1)+(d.mode==='route'?' / ROUTE':d.mode==='reward'?' / REWARD':'')+' ▶';
  continueInfo.textContent='SEED '+seedHex(d.runSeed)+' · セクター開始地点から再開'}
}
function saveCheckpoint(mode='sector'){
 if(G.debugMode||!['playing','route','reward'].includes(G.mode))return;
 const d={v:2,mode,stage:G.stage,runSeed:G.runSeed,score:Math.max(0,Math.floor(G.score)),
  lives:0,shipLevel:G.shipLevel,shipXP:G.shipXP,difficulty:G.difficulty,pulses:G.pulses,pulseRecharge:Math.floor(G.pulseRecharge),energy:G.energy,selected:G.selected,levels:G.levels.slice(),pendingUpgrades:G.pendingUpgrades.slice(),
  routeRisk:G.routeRisk,routeHistory:G.routeHistory.map(r=>({...r})),rewardHistory:G.rewardHistory.map(r=>({...r})),passives:G.passives.slice(),
  player:{hp:p.hp,maxHp:p.maxHp,shield:p.shield},driveCharge:Math.floor(G.driveCharge),
  grazes:G.grazes,maxCombo:G.maxCombo,killCount:G.killCount,eventCount:G.eventCount};
 try{localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(d))}catch(e){}
}
function clearCheckpoint(){try{localStorage.removeItem(CHECKPOINT_KEY)}catch(e){}updateContinueButton()}
function resumeCheckpoint(){
 const d=readCheckpoint();if(!d){updateContinueButton();showToast('セーブデータがありません');return}
 seedInput.value=seedHex(d.runSeed);startGame(false,true);if(G.mode!=='playing')return;
 G.stage=d.stage;G.score=d.score;G.lives=0;G.difficulty=d.difficulty;difficultySelect.value=G.difficulty;G.shipLevel=d.shipLevel;G.shipXP=d.shipXP;G.pulses=d.pulses;G.pulseRecharge=d.pulseRecharge??0;G.energy=d.energy;G.selected=d.selected;
 G.levels=d.levels.slice();G.pendingUpgrades=d.pendingUpgrades?d.pendingUpgrades.slice():[0,0,0,0,0,0];G.selected=Math.max(0,powerMeterIndex());G.passives=d.passives?d.passives.slice():[0,0,0,0,0,0];G.routeRisk=d.routeRisk;G.routeHistory=d.routeHistory.map(r=>({...r}));G.rewardHistory=(d.rewardHistory||[]).map(r=>({...r}));
 G.driveCharge=d.driveCharge;G.grazes=d.grazes;G.maxCombo=d.maxCombo;G.killCount=d.killCount;G.eventCount=d.eventCount;TROPHIES.resetAfterResume({score:G.score,grazes:G.grazes});
 p.hp=d.player.hp;p.maxHp=d.player.maxHp;p.shield=d.player.shield;p.invul=1.8;
 G.stageTime=0;G.eliteSpawned=false;G.routePatrolSpawned=false;G.scroll=G.stage*1800;G.pendingWave=null;G.spawn=2*routeProfile().spawnInterval;G.directorGrace=0;G.directorWaveCount=0;
 G.activeEvent=null;G.eventTriggered=false;G.eventChain=false;
 if(G.stage>0){const prev=G.routeHistory[G.stage-1],offer=routeOffer(G.stage-1,prev.risk);
  G.activeEvent=offer.event;G.eventChain=!!prev.chain}
 seedStage();resetTerrain();G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.boss=null;
 G.transitioning=false;G.bossDone=false;G.transition=0;G.flowPhase=null;G.overdrive=0;
 if(d.mode==='reward'||d.mode==='route')resumeFlightGate(d.mode);
 else{showAnnounce('CONTINUE / SECTOR 0'+(G.stage+1),NAMES[G.stage],'セクター開始地点から再開',2.5);saveCheckpoint()}
 updateHud();syncOrientation();
}
continueBtn.addEventListener('click',resumeCheckpoint);

const KEY={};let audio=null,bgm=null,sound=true,last=0,screenPulse=0,stickX=0,stickY=0,stickPointer=null,pausedByRotation=false;
const G={mode:'title',difficulty:'normal',time:0,total:0,stage:0,stageTime:0,scroll:0,spawn:0,score:0,best:0,combo:0,comboTime:0,lives:0,shipLevel:1,shipXP:0,pulses:2,pulseRecharge:0,energy:0,selected:0,levels:[0,0,0,0,0,0],pendingUpgrades:[0,0,0,0,0,0],boss:null,bossDone:false,transition:0,transitioning:false,flowPhase:null,shots:[],enemies:[],bullets:[],pickups:[],particles:[],rings:[],stars:[],player:null,trail:[],shake:0,announceTime:0,toastTime:0,fireTimer:0,missileTimer:0,musicTime:0,beat:0,uiTime:0,firstInput:false,driveCharge:0,overdrive:0,grazes:0,maxCombo:0,killCount:0,routeRisk:0,routeHistory:[],routeSelected:0,runSeed:0,routeOffers:[],rewardOffers:[],rewardSelected:0,rewardHistory:[],passives:[0,0,0,0,0,0],activeEvent:null,eventTriggered:false,eventChain:false,eventCount:0,pendingWave:null,waveSerial:0,squadAttackCooldown:0,aiVolleys:0,directorGrace:0,directorWaveCount:0,terrain:null,terrainSchedule:[],terrainIndex:0,ambientTimer:.6,eliteSpawned:false,routePatrolSpawned:false};
G.debugMode=false;
try{
 G.best=Number(localStorage.getItem('star_fighter_best')||0)||0;
 sound=localStorage.getItem('star_fighter_sound')!=='off';
 const savedDifficulty=localStorage.getItem(DIFFICULTY_KEY);
 if(validDifficulty(savedDifficulty))G.difficulty=savedDifficulty;
}catch(e){}
const difficultySelect=$('difficultySelect');difficultySelect.value=G.difficulty;
function setDifficulty(value){
 if(!validDifficulty(value)){difficultySelect.value=G.difficulty;return false}
 const oldProfile=difficultyProfile(),changed=value!==G.difficulty;
 G.difficulty=value;difficultySelect.value=value;
 try{localStorage.setItem(DIFFICULTY_KEY,value)}catch(e){}
 if(changed){
  // Apply immediately without enemy healing or boss phase reset.
  const factor=difficultyProfile().enemyFire/oldProfile.enemyFire;
  for(const e of G.enemies){if(e.fire>0)e.fire*=factor;if(e.eliteFire>0)e.eliteFire*=factor}
  refreshActiveEnemies();refreshBossStrength(G.boss);
  if(!G.debugMode){
   // Keep a paused player's existing checkpoint and current difficulty in sync.
   try{
    const raw=localStorage.getItem(CHECKPOINT_KEY);
    if(raw){const data=JSON.parse(raw);if(data&&[1,2].includes(data.v)){
     data.difficulty=value;localStorage.setItem(CHECKPOINT_KEY,JSON.stringify(data))
    }}
   }catch(e){}
  }
  if(G.mode==='playing'||G.mode==='paused')showToast('難易度 '+difficultyProfile().name);
  updateHud();
 }
 return true;
}
difficultySelect.addEventListener('change',()=>setDifficulty(difficultySelect.value));
const SOUND_MIXES=[{name:'標準',music:1,effects:1},{name:'BGM重視',music:1.2,effects:.55},{name:'効果音重視',music:.55,effects:1.2}];
let soundMix=0,mixHoldTimer=null,suppressMixClick=false;
try{const saved=Number(localStorage.getItem('star_fighter_mix'));if(Number.isInteger(saved)&&saved>=0&&saved<SOUND_MIXES.length)soundMix=saved}catch(e){}
ui.sound.textContent=sound?'♫ BGM ON':'♫ BGM OFF';
function applySoundMix(){const m=SOUND_MIXES[soundMix];bgm?.setMix?.(m.music,m.effects);ui.sound.title='音量バランス：'+m.name+'（長押しで変更）';ui.sound.setAttribute('aria-label','サウンド切替、長押しで音量バランス変更：'+m.name)}
function cycleSoundMix(){soundMix=(soundMix+1)%SOUND_MIXES.length;try{localStorage.setItem('star_fighter_mix',String(soundMix))}catch(e){}applySoundMix();showToast('音量バランス：'+SOUND_MIXES[soundMix].name)}
applySoundMix();
for(let i=0;i<170;i++)G.stars.push({x:R(0,W),y:R(0,H),z:R(.25,2.6),tw:R(0,TAU),size:R(.4,1.9)});
let p={x:215,y:337,targetX:215,targetY:337,angle:0,hp:HULL_BASE,maxHp:HULL_BASE,invul:0,shield:0,alive:true};G.player=p;
function beginAudio(){if(!sound)return;try{if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();if(!bgm&&window.CyberBGM)bgm=new window.CyberBGM(audio);if(bgm){applySoundMix();bgm.setEnabled(true);bgm.start()}}catch(e){audio=null}}
function tone(freq,dur=.08,type='sine',volume=.045,slide=0){if(!audio||!sound)return;try{const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(30,freq),now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),now+dur);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.0001,now+dur);o.connect(g);g.connect(bgm?.sfxInput||audio.destination);o.start(now);o.stop(now+dur+.01);o.onended=()=>{o.disconnect();g.disconnect()}}catch(e){}}
function melody(dt){if(sound&&bgm)bgm.update(G.stage,!!G.boss)}
function showToast(txt){
 const important=/カプセル不足|最大強化済み|LEVEL|SYNERGY|NOVA再充填|NOVA BURST|無料強化券|セーブデータがありません|音量バランス/.test(txt);
 ui.toast.textContent=txt;ui.toast.classList.toggle('show',important);G.toastTime=important?1.15:0;
}
function showAnnounce(head,title,sub,duration=3){ui.announce.classList.remove('show');G.announceTime=0;}
function hideOverlay(){
 ui.overlay.classList.add('hidden');
 // Invisible menus must not remain keyboard-focusable during gameplay.
 ui.overlay.inert=true;
 ui.overlay.setAttribute('aria-hidden','true');
 $('runResult').hidden=true;
}

/* 32/36: read-only post-run report; never purchases upgrades. */
function updateRunResult(kind){
 const panel=$('runResult'),finished=kind==='over'||kind==='win';
 panel.hidden=!finished;if(!finished)return;
 const set=(id,value)=>{$(id).textContent=value};
 const time=Math.max(0,Math.floor(G.total));
 set('resultScore',Math.floor(G.score).toLocaleString('ja-JP'));
 set('resultBest',Math.floor(Math.max(G.best,G.score)).toLocaleString('ja-JP'));
 set('resultSector',kind==='win'?'8 / 8 完走':(G.stage+1)+' / '+NAMES.length+' 到達');
 set('resultStats','撃破 '+G.killCount+' · 最大連続 '+G.maxCombo+' · GRAZE '+G.grazes+' · '+Math.floor(time/60)+':'+String(time%60).padStart(2,'0'));
 set('resultBuild',PNAMES.map((name,i)=>name+' '+G.levels[i]+'/'+MAX[i]).join(' · '));
 set('resultPassives',PASSIVES.map((item,i)=>G.passives[i]?item.name+' '+G.passives[i]:'').filter(Boolean).join(' · ')||'なし');
 set('resultRoutes',G.routeHistory.map(r=>'S'+String(r.stage).padStart(2,'0')+' '+(r.risk?'高危険':'補給')+' · '+r.route).join(' / ')||'分岐なし');
 set('resultRewards',G.rewardHistory.map(r=>'S'+String(r.stage+1).padStart(2,'0')+' '+r.name).join(' / ')||'獲得なし');
}
function showOverlay(kind){
 updateRunResult(kind);
 // Reset old scroll offsets when reopening title, pause and results.
 ui.overlay.scrollTop=0;
 ui.overlay.querySelector('.overlay-inner').scrollTop=0;
 ui.overlay.inert=false;
 ui.overlay.setAttribute('aria-hidden','false');
 ui.overlay.dataset.state=kind;$('debugPanel').hidden=!(debugUnlocked&&(kind==='title'||kind==='pause'));$('landscapeStartBtn').hidden=kind!=='title';updateMedalButton();$('medalBtn').hidden=kind!=='title';$('trophyBtn').hidden=kind!=='title'&&kind!=='pause';ui.overlay.classList.remove('hidden');continueBtn.hidden=kind!=='title';continueInfo.hidden=kind!=='title';if(kind==='title')updateContinueButton();if(quickHelp)quickHelp.open=false;seedLabel.textContent=kind==='title'?'SEED — 空欄ならランダム':'SEED '+seedHex(G.runSeed);seedReplay.hidden=kind!=='win'&&kind!=='over';const inner=ui.overlay.querySelector('.overlay-inner');const eyebrow=inner.querySelector('.eyebrow'),title=inner.querySelector('.title-mark'),subtitle=inner.querySelector('.subtitle'),intro=inner.querySelector('.intro');title.tabIndex=kind==='title'?0:-1;if(kind==='pause'){eyebrow.textContent='MISSION INTERRUPTED';title.innerHTML='<span>PAUSE</span><strong>MODE</strong>';subtitle.textContent='一時停止中';intro.innerHTML='準備ができたら戦闘に戻ろう。';ui.start.innerHTML='RESUME <span>▶</span>'}else if(kind==='win'){eyebrow.textContent='ALL SECTORS CLEAR';title.innerHTML='<span>MISSION</span><strong>CLEAR</strong>';subtitle.textContent='全'+NAMES.length+'ステージ突破';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 宇宙の平和を守り抜いた！';ui.start.innerHTML='新しい配置で再出撃 <span>▶</span>'}else if(kind==='over'){eyebrow.textContent='SIGNAL LOST';title.innerHTML='<span>GAME</span><strong>OVER</strong>';subtitle.textContent='任務失敗';intro.innerHTML='SCORE '+G.score.toLocaleString()+' · MAX CHAIN '+G.maxCombo+'<br>GRAZE '+G.grazes+' · 再出撃して記録を更新しよう。';ui.start.innerHTML='新しい配置で再出撃 <span>▶</span>'}else{eyebrow.textContent='NEW ARCADE EXPERIENCE / 2026';title.innerHTML='<span>STAR</span><strong>FIGHTER</strong>';subtitle.textContent='横スクロール・シューティング';intro.innerHTML='高速戦闘。装備進化。巨大戦艦との決戦。<br>シンプル操作で、撃ち抜く快感を。';ui.start.innerHTML='縦画面で出撃 <span>▶</span>'}}

/* Secret diagnostic: seven title-mark clicks without time limit, session-only.
   Jumping routes leaves the normal save, score and medals untouched. */
let debugUnlocked=false,debugTapCount=0;
const debugPanel=$('debugPanel'),debugStage=$('debugStage'),debugRoute=$('debugRoute');
const debugPlayMode=$('debugPlayMode'),debugBoss=$('debugBoss');
const DEBUG_BOSS_ROSTER=[
 {stage:0,risk:0,name:BOSSES[0],key:'0:0'},
 ...ROUTE_BOSS_INTEL.flatMap((names,i)=>names.map((name,risk)=>({
  stage:i+1,risk,name:i===2&&risk===0?'MOLTEN CRAB':i===3&&risk===0?'FROST MAMMOTH':name,
  key:(i+1)+':'+risk,variant:i===2&&risk===0?'crab':i===3&&risk===0?'mammoth':null
 }))),
 {stage:3,risk:0,name:'SCORPION DREAD',key:'3:2',variant:'scorpion'},
 {stage:4,risk:0,name:'TURTLE BULWARK',key:'4:2',variant:'turtle'}
];
function updateDebugModeControls(){
 const solo=debugPlayMode.value==='boss';
 $('debugStageControls').hidden=solo;$('debugBossControls').hidden=!solo;
 $('debugLaunch').textContent=solo?'選んだボスと対決':'無敵で開始／ステージ移動';
}
debugPlayMode.addEventListener('change',updateDebugModeControls);
const debugTrigger=$('debugTrigger');
function unlockDebugTap(){
 if(G.mode!=='title'||debugUnlocked)return;
 // Hidden seven-tap unlock: no progress text, number, toast or visual counter.
 // The full debug menu appears only after the seventh tap.
 if(++debugTapCount===7){
  debugUnlocked=true;debugPanel.hidden=false;
  debugPanel.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  tone(750,.11,'triangle',.045,300);
 }
}
debugTrigger.addEventListener('click',unlockDebugTap);
debugTrigger.addEventListener('keydown',e=>{
 if(e.key==='Enter'||e.key===' '){e.preventDefault();unlockDebugTap()}
});
function debugJumpTo(stage,risk=0){
 if(!G.debugMode||G.mode!=='playing'||!Number.isInteger(stage)||stage<0||stage>=NAMES.length)return false;
 risk=risk===1?1:0;
 G.stage=stage;G.forcedBossVariant=null;G.routeHistory=[];G.rewardHistory=[];
 for(let i=0;i<stage;i++){
  const route=i===stage-1?risk:0,offer=routeOffer(i,route);
  G.routeHistory.push({stage:i+2,route:offer.name,risk:route,event:offer.event.id,
   eventName:offer.event.name,chain:offer.chain});
 }
 G.routeRisk=stage?risk:0;
 const chosen=stage?routeOffer(stage-1,risk):null;
 G.activeEvent=chosen?.event||null;G.eventChain=!!chosen?.chain;
 G.eventTriggered=false;G.eventCount=0;
 G.stageTime=0;G.scroll=stage*1800;G.spawn=.42*routeProfile().spawnInterval;G.ambientTimer=.6;
 G.eliteSpawned=false;G.routePatrolSpawned=false;G.pendingWave=null;G.waveSerial=0;
 G.squadAttackCooldown=0;G.directorGrace=0;G.directorWaveCount=0;
 G.boss=null;G.bossDone=false;G.debugBossClear=false;G.transition=0;G.transitioning=false;G.flowPhase=null;
 G.routeOffers=[];G.rewardOffers=[];G.rewardSelected=0;G.routeSelected=0;
 G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.particles=[];G.rings=[];
 G.lives=0;p.hp=p.maxHp;p.invul=1.8;p.alive=true;
 p.x=p.targetX=215;p.y=p.targetY=H/2;p.angle=0;
 G.trail=Array.from({length:120},(_,i)=>({x:p.x-i*3,y:p.y}));
 seedStage();resetTerrain();resetStick();updateHud();return true;
}
function prepareDebugBoss(stage,risk){
 if(!debugJumpTo(stage,risk))return false;
 G.forcedBossVariant=G.debugBossChoice;
 G.debugBossOnly=true;G.debugBossClear=false;
 // Debug-only practice arsenal. Regular game builds and storage are unchanged.
 G.levels=[1,1,1,1,1,1];G.pendingUpgrades=[0,0,0,0,0,0];
 G.energy=0;G.pulses=3;G.pulseRecharge=0;G.stageTime=STAGE_LENGTHS[stage];
 G.spawn=1e6;G.ambientTimer=1e6;G.terrain=null;G.pendingWave=null;
 G.enemies=[];G.bullets=[];G.pickups=[];G.shots=[];
 spawnBoss();updateHud();return true;
}
function launchDebug(){
 if(!debugUnlocked||(G.mode!=='title'&&G.mode!=='paused'))return false;
 const solo=debugPlayMode.value==='boss';
 const bossSelection=DEBUG_BOSS_ROSTER.find(x=>x.key===debugBoss.value);
 const stage=solo?bossSelection?.stage:Number(debugStage.value);
 const risk=solo?bossSelection?.risk:(Number(debugRoute.value)===1?1:0);
 if(!Number.isInteger(stage)||stage<0||stage>=NAMES.length||![0,1].includes(risk))return false;
 if(G.mode==='title'){startGame(true);if(G.mode!=='playing')return false}
 else{
  G.debugMode=true;TROPHIES.setDebug(true);G.mode='playing';hideOverlay();
  last=performance.now();
  if(sound&&bgm){bgm.setEnabled(true);bgm.start()}
  $('sidePauseBtn').innerHTML='Ⅱ <span>一時停止</span>';
 }
 G.debugBossOnly=solo;G.debugBossClear=false;G.debugBossChoice=solo?bossSelection?.variant||null:null;
 const ok=solo?prepareDebugBoss(stage,risk):debugJumpTo(stage,risk);
 if(ok)updateHud();
 return ok;
}
$('debugLaunch').addEventListener('click',launchDebug);
function startFreshRun(){seedInput.value='';startGame()}
function startGame(debugStart=false,resuming=false){const runSeed=chooseSeed();if(runSeed===null)return;cancelCombatPresses();G.mode='playing';G.debugMode=debugStart===true;G.debugBossOnly=false;G.debugBossClear=false;G.forcedBossVariant=null;G.debugBossChoice=null;screenPulse=0;$('sidePauseBtn').innerHTML='Ⅱ <span>一時停止</span>';stickX=stickY=0;resetStick();G.time=0;G.total=0;G.stage=0;G.stageTime=0;G.scroll=0;G.spawn=.42;G.ambientTimer=.6;G.eliteSpawned=false;G.routePatrolSpawned=false;G.score=0;G.combo=0;G.comboTime=0;G.lives=0;G.shipLevel=1;G.shipXP=0;G.pulses=1;G.pulseRecharge=0;G.energy=0;G.selected=0;G.levels=[0,0,0,0,0,0];G.pendingUpgrades=[0,0,0,0,0,0];G.shots=[];G.enemies=[];G.bullets=[];G.pickups=[];G.particles=[];G.rings=[];G.boss=null;G.bossDone=false;G.transition=0;G.transitioning=false;G.flowPhase=null;G.shake=0;G.fireTimer=0;G.missileTimer=0;G.beat=0;G.musicTime=0;G.firstInput=false;G.routeRisk=0;G.routeSelected=0;G.routeHistory=[];G.routeOffers=[];G.rewardOffers=[];G.rewardSelected=0;G.rewardHistory=[];G.passives=[0,0,0,0,0,0];G.activeEvent=null;G.eventTriggered=false;G.eventChain=false;G.eventCount=0;G.pendingWave=null;G.waveSerial=0;G.squadAttackCooldown=0;G.aiVolleys=0;G.directorGrace=0;G.directorWaveCount=0;G.runSeed=runSeed;seedStage();resetTerrain();seedLabel.textContent='SEED '+seedHex(G.runSeed);$('routePanel').classList.remove('open');$('rewardPanel').classList.remove('open');G.driveCharge=0;G.overdrive=0;G.grazes=0;G.maxCombo=0;G.killCount=0;G.trail=[];G.player={x:215,y:337,targetX:215,targetY:337,angle:0,hp:HULL_BASE,maxHp:HULL_BASE,invul:1.6,shield:0,alive:true};p=G.player;for(let i=0;i<120;i++)G.trail.push({x:p.x-i*3.5,y:p.y});TROPHIES.begin(G.debugMode,resuming);showAnnounce('MISSION 01',NAMES[0],SUBS[0],3.5);hideOverlay();beginAudio();tone(440,.25,'sawtooth',.05,620);if(!G.debugMode)saveCheckpoint();updateHud()}
function pause(){
 cancelCombatPresses();
 if(G.mode==='playing'){
  G.mode='paused';resetStick();showOverlay('pause');bgm?.stop();
 }else if(G.mode==='paused'){
  G.mode='playing';hideOverlay();last=performance.now();
  if(sound&&bgm){bgm.setEnabled(true);bgm.start()}
 }
 $('sidePauseBtn').innerHTML=G.mode==='paused'?'▶ <span>再開</span>':'Ⅱ <span>一時停止</span>';
 updateHud();
}
function endGame(victory=false){TROPHIES.finish(victory,{score:G.score,grazes:G.grazes,maxCombo:G.maxCombo});cancelCombatPresses();if(victory&&!G.debugMode)unlockMedal('clear');G.terrain=null;bgm?.stop();G.mode=victory?'win':'over';G.pulses=0;G.pulseRecharge=0;screenPulse=0;G.rings=[];if(!G.debugMode)clearCheckpoint();if(!G.debugMode&&G.score>G.best){G.best=G.score;try{localStorage.setItem('star_fighter_best',String(G.best))}catch(e){}}tone(victory?520:140,.55,'sawtooth',.08,victory?380:-110);showOverlay(G.mode);updateHud()}
ui.start.addEventListener('click',()=>{if(G.mode==='paused')pause();else if(G.mode==='over'||G.mode==='win')startFreshRun();else if(G.mode==='title')startGame()});
$('landscapeStartBtn').addEventListener('click',()=>{if(G.mode==='title')startGame()});
ui.pause.addEventListener('click',pause);
/* A purchase must originate from one physical press on the right action
   button, or a genuine focused keyboard activation. Ignore every unpaired
   compatibility click: Android can synthesize one after pointer cancellation,
   rotation, multitouch, or a touch that began elsewhere on the screen. */
const manualUpgradeToken=Symbol('confirmed-manual-upgrade');
const combatPressCancels=[];
function cancelCombatPresses(){for(const cancel of combatPressCancels)cancel()}
function bindCombatAction(button,act){
 let tracking=null;const clearPress=()=>{tracking=null};combatPressCancels.push(clearPress);
 window.addEventListener('blur',clearPress);window.addEventListener('orientationchange',clearPress);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)clearPress()});
 const inside=(e,pad=0)=>{const r=button.getBoundingClientRect();return e.clientX>=r.left-pad&&e.clientX<=r.right+pad&&e.clientY>=r.top-pad&&e.clientY<=r.bottom+pad};
 button.addEventListener('pointerdown',e=>{
  // Secondary right thumb is allowed while left thumb controls movement.
  if(G.mode!=='playing'||tracking||(e.pointerType==='mouse'&&e.button!==0)||!inside(e))return;
  tracking={id:e.pointerId,x:e.clientX,y:e.clientY,moved:false};
  // Do not request explicit capture: layout/rotation may release it before up.
 });
 const move=e=>{if(tracking&&e.pointerId===tracking.id&&Math.hypot(e.clientX-tracking.x,e.clientY-tracking.y)>36)tracking.moved=true};
 button.addEventListener('pointermove',move);window.addEventListener('pointermove',move);
 const cancel=e=>{if(tracking&&e.pointerId===tracking.id)tracking=null};
 button.addEventListener('pointercancel',cancel);window.addEventListener('pointercancel',cancel);button.addEventListener('lostpointercapture',cancel);
 const finish=e=>{
  if(!tracking||e.pointerId!==tracking.id)return;
  const pressed=tracking;tracking=null;
  if(G.mode!=='playing'||pressed.moved||Math.hypot(e.clientX-pressed.x,e.clientY-pressed.y)>36||!inside(e,9))return;
  e.preventDefault();act();
 };
 button.addEventListener('pointerup',finish);window.addEventListener('pointerup',finish);
 button.addEventListener('click',e=>{
  if(e.detail!==0||e.isTrusted!==true||document.activeElement!==button||G.mode!=='playing'){e.preventDefault();return}
  e.preventDefault();act();
 });
}
bindCombatAction(sideNovaButton,pulse);
bindCombatAction(sideEquipButton,()=>equip(manualUpgradeToken));
$('titleReturnBtn').addEventListener('click',()=>{if(G.mode==='title')return;TROPHIES.finish(false,{score:G.score,grazes:G.grazes,maxCombo:G.maxCombo});cancelCombatPresses();bgm?.stop();resetStick();G.mode='title';G.debugMode=false;G.debugBossOnly=false;G.debugBossClear=false;G.pulseRecharge=0;screenPulse=0;G.rings=[];$('sidePauseBtn').innerHTML='Ⅱ <span>一時停止</span>';$('routePanel').classList.remove('open');$('rewardPanel').classList.remove('open');showOverlay('title');updateHud()});ui.sound.addEventListener('pointerdown',()=>{suppressMixClick=false;clearTimeout(mixHoldTimer);mixHoldTimer=setTimeout(()=>{mixHoldTimer=null;suppressMixClick=true;cycleSoundMix()},650)});
for(const eventName of ['pointerup','pointercancel','pointerleave'])ui.sound.addEventListener(eventName,()=>{clearTimeout(mixHoldTimer);mixHoldTimer=null});
ui.sound.addEventListener('contextmenu',e=>e.preventDefault());
ui.sound.addEventListener('click',e=>{if(suppressMixClick){suppressMixClick=false;return}if(e.shiftKey){cycleSoundMix();return}sound=!sound;ui.sound.textContent=sound?'♫ BGM ON':'♫ BGM OFF';try{localStorage.setItem('star_fighter_sound',sound?'on':'off')}catch(e){}if(sound){if(!bgm)beginAudio();else{audio?.resume();applySoundMix();bgm.setEnabled(true);if(G.mode==='playing')bgm.start()}}else bgm?.setEnabled(false)});
// Hidden duplicate action buttons must not initiate purchases or NOVA.
$('helpBtn').addEventListener('click',()=>{if(G.mode==='playing'){pause();quickHelp.open=true}else if(G.mode==='title'||G.mode==='paused')quickHelp.open=!quickHelp.open});
// The six meter cells are passive indicators; clicking them never selects equipment.
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();const focusedControl=!!e.target?.closest?.('button,input,textarea,select,[contenteditable="true"]');if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();KEY[k]=true;if(e.repeat)return;if(k==='p'||k==='escape'){pause();return}if(k==='m'){if(e.shiftKey)cycleSoundMix();else ui.sound.click();return}if(G.mode==='title'||G.mode==='over'||G.mode==='win'){if(k==='enter'&&!focusedControl){if(G.mode==='title')startGame();else startFreshRun()}return}if(G.mode==='reward'){if(k==='1'||k==='2'||k==='3')chooseReward(Number(k)-1);if(k==='arrowleft'||k==='arrowright')selectRewardCard((G.rewardSelected+(k==='arrowright'?1:2))%3);if(k==='enter')chooseReward(G.rewardSelected);return}if(G.mode==='route'){if(k==='1'||k==='2')chooseRoute(Number(k)-1);if(k==='arrowleft'||k==='arrowright')selectRouteCard(1-G.routeSelected);if(k==='enter')chooseRoute(G.routeSelected);return}if(G.mode!=='playing')return;if(k===' '){pulse();return}if(k==='z'&&!focusedControl&&!e.ctrlKey&&!e.metaKey&&!e.altKey)equip(manualUpgradeToken)});
window.addEventListener('keyup',e=>{KEY[e.key.toLowerCase()]=false});window.addEventListener('blur',()=>{if(G.mode==='playing')pause()});


/* Standard Gamepad API. Left stick and D-pad steer, A confirms the lit
   power-up, B fires NOVA, START starts/pauses/resumes. Edge-only activation
   prevents repeated or newly connected held-button purchases. */
const gpState={index:null,buttons:[],dx:0,dy:0};
const gpStatus=$('gamepadStatus');
function resetGamepad(){
 gpState.index=null;gpState.buttons=[];gpState.dx=0;gpState.dy=0;
 gpStatus.hidden=true;gpStatus.textContent='';
}
function gamepadButton(pad,i){
 const b=pad.buttons?.[i];
 return b===undefined?false:typeof b==='number'?b>.55:!!(b?.pressed||b?.value>.55);
}
function gamepadAxis(pad,i){
 const v=pad.axes?.[i];return Number.isFinite(v)?cl(v,-1,1):0;
}
function gamepadVector(pad){
 let x=gamepadAxis(pad,0),y=gamepadAxis(pad,1);
 const mag=Math.hypot(x,y),dead=.19;
 if(mag<=dead)x=y=0;
 else{const strength=cl((mag-dead)/(1-dead),0,1);x=x/mag*strength;y=y/mag*strength}
 const dpX=Number(gamepadButton(pad,15))-Number(gamepadButton(pad,14));
 const dpY=Number(gamepadButton(pad,13))-Number(gamepadButton(pad,12));
 if(dpX||dpY){x=dpX;y=dpY}
 return {x,y};
}
function pollGamepad(){
 if(typeof navigator.getGamepads!=='function'||document.hidden===true){resetGamepad();return}
 let pads;try{pads=Array.from(navigator.getGamepads()||[])}catch(_){resetGamepad();return}
 const old=gpState.index===null?null:pads[gpState.index];
 const pad=old&&old.connected!==false?old:pads.find(x=>x&&x.connected!==false);
 if(!pad){if(gpState.index!==null)resetGamepad();return}
 const index=Number.isInteger(pad.index)?pad.index:pads.indexOf(pad),same=gpState.index===index;
 const buttons=Array.from({length:Math.max(17,pad.buttons?.length||0)},(_,i)=>gamepadButton(pad,i));
 if(!same){
  gpState.index=index;gpState.buttons=buttons;
  gpStatus.textContent='GAMEPAD 接続中';gpStatus.hidden=false;
 }
 const vector=gamepadVector(pad);
 gpState.dx=G.mode==='playing'?vector.x:0;
 gpState.dy=G.mode==='playing'?vector.y:0;
 if(!same)return;
 const pressed=i=>buttons[i]&&!gpState.buttons[i];
 if(pressed(9)){
  if(G.mode==='playing'||G.mode==='paused')pause();
  else if(G.mode==='title')startGame();
  else if(G.mode==='over'||G.mode==='win')startFreshRun();
 }else if(G.mode==='playing'){
  if(pressed(0))equip(manualUpgradeToken);
  if(pressed(1))pulse();
 }else if((G.mode==='title'||G.mode==='paused')&&debugUnlocked&&!debugPanel.hidden){
  if(pressed(14)||pressed(15)){
   const step=pressed(14)?-1:1;
   if(debugPlayMode.value==='boss'){
    const i=DEBUG_BOSS_ROSTER.findIndex(b=>b.key===debugBoss.value);
    const next=DEBUG_BOSS_ROSTER[(Math.max(0,i)+step+DEBUG_BOSS_ROSTER.length)%DEBUG_BOSS_ROSTER.length];
    debugBoss.value=next.key;
   }else debugStage.value=String((Number(debugStage.value)+step+NAMES.length)%NAMES.length);
  }
  if(debugPlayMode.value==='stage'&&(pressed(12)||pressed(13)))debugRoute.value=pressed(13)?'1':'0';
  if(pressed(3))launchDebug();
  else if(pressed(0)){if(G.mode==='paused')pause();else startGame()}
 }else if(G.mode==='paused'&&pressed(0))pause();
 else if(G.mode==='title'&&pressed(0))startGame();
 else if((G.mode==='over'||G.mode==='win')&&pressed(0))startFreshRun();
 gpState.buttons=buttons;
}
window.addEventListener('gamepadconnected',()=>{/* connected controller detected by next poll */});
window.addEventListener('gamepaddisconnected',e=>{
 if(gpState.index===e.gamepad?.index)resetGamepad();
});
window.addEventListener('blur',resetGamepad);
document.addEventListener('visibilitychange',()=>{if(document.hidden)resetGamepad()});
/* Physical finger displacement only: stable fixed gain, no speed-dependent
   surges, velocity spikes, autopilot, inertia or jump on first touch.
   Capture permits continuing a drag beyond the decorative pad boundary. */
const pad=$('touchPad');
let padPointer=null,padLastX=0,padLastY=0,padScale={x:1,y:1},padCaptured=false;
function resetStick(){
 stickX=stickY=0;stickPointer=null;padPointer=null;padCaptured=false;
 pad?.classList.remove('touching');
}
function touchScale(){
 // Cache geometry once per gesture; bounded scale on narrow landscape pads.
 const rect=pad.getBoundingClientRect();
 const width=Math.max(90,rect.width),height=Math.max(90,rect.height);
 return {
  x:cl((W-197)/Math.max(240,width*1.55),2.2,3.85),
  y:cl((H-149)/Math.max(215,height*1.15),1.5,2.45)
 };
}
function padMove(e){
 if(G.mode!=='playing'||padPointer!==e.pointerId||!p)return;
 const dx=e.clientX-padLastX,dy=e.clientY-padLastY;
 if(!Number.isFinite(dx)||!Number.isFinite(dy))return;
 padLastX=e.clientX;padLastY=e.clientY;
 if(dx===0&&dy===0)return;
 // Every input delta is linear and reproducible regardless of event timing.
 const nx=cl(p.x+dx*padScale.x,62,W-135),ny=cl(p.y+dy*padScale.y,98,H-111);
 p.angle=cl((ny-p.y)*.025,-.22,.22);
 p.x=p.targetX=nx;p.y=p.targetY=ny;G.firstInput=true;
}
pad.addEventListener('pointerdown',e=>{
 if(G.mode!=='playing'||padPointer!==null)return;
 e.preventDefault();padPointer=e.pointerId;
 padLastX=e.clientX;padLastY=e.clientY;
 padScale=touchScale();pad.classList.add('touching');
 try{pad.setPointerCapture(e.pointerId);padCaptured=true}catch(_){padCaptured=false}
});
pad.addEventListener('pointermove',e=>{if(e.pointerId===padPointer){e.preventDefault();padMove(e)}});
window.addEventListener('pointermove',e=>{if(!padCaptured&&e.pointerId===padPointer)padMove(e)});
for(const kind of ['pointerup','pointercancel','lostpointercapture'])
 pad.addEventListener(kind,e=>{if(e.pointerId===padPointer){e.preventDefault();resetStick()}});
for(const kind of ['pointerup','pointercancel'])
 window.addEventListener(kind,e=>{if(!padCaptured&&e.pointerId===padPointer)resetStick()});
window.addEventListener('blur',resetStick);
/* Portrait is supported. Changing orientation must never auto-pause the run. */
function syncOrientation(){
 // Browser chrome resize alone must not interrupt a held finger.
 last=performance.now();
}
window.addEventListener('resize',syncOrientation);
window.addEventListener('orientationchange',()=>{resetStick();syncOrientation()});
let dragging=false,pid=-1;
function coords(e){const b=C.getBoundingClientRect();return{x:(e.clientX-b.left)/b.width*W,y:(e.clientY-b.top)/b.height*H}}
C.addEventListener('pointerdown',e=>{if(G.mode!=='playing'||e.pointerType==='touch')return;dragging=true;pid=e.pointerId;try{C.setPointerCapture(pid)}catch(err){}const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-111);G.firstInput=true});
C.addEventListener('pointermove',e=>{if(!dragging||e.pointerId!==pid||G.mode!=='playing')return;const q=coords(e);G.player.targetX=cl(q.x,60,W-130);G.player.targetY=cl(q.y,88,H-111)});
const release=e=>{if(e.pointerId===pid){dragging=false;pid=-1}};C.addEventListener('pointerup',release);C.addEventListener('pointercancel',release);
/* Power capsule moves one cursor step. No player selection of equipment. */
function powerMeterIndex(){
 if(G.energy>0)return G.energy-1;
 return G.pendingUpgrades.findIndex((n,i)=>n>0&&G.levels[i]<MAX[i]);
}
function advancePowerMeter(count=1){
 if(!Number.isInteger(count)||count<1)return;
 G.energy=((G.energy+count-1)%6)+1;
 G.selected=G.energy-1;
 updateHud();
}
function reducePowerMeter(count=1){
 G.energy=Math.max(0,G.energy-Math.max(0,count));
 G.selected=Math.max(0,powerMeterIndex());
 updateHud();
}
/* Weapon reward vouchers are not applied until an explicit action button tap.
   Preserve reward value, non-modal flight gates and checkpoint continuity. */
function queueManualUpgrade(index,count=1){
 if(!Number.isInteger(index)||index<0||index>=6||!Number.isInteger(count)||count<=0)return 0;
 const slots=Math.max(0,MAX[index]-G.levels[index]-G.pendingUpgrades[index]);
 const received=Math.min(count,slots);G.pendingUpgrades[index]+=received;
 return received;
}
function equip(intent){
 if(G.mode!=='playing'||intent!==manualUpgradeToken)return;
 const i=powerMeterIndex();
 if(i<0){showToast('カプセル不足・拾うとメーターが進みます');tone(150,.09,'triangle',.025);updateHud();return}
 const name=PNAMES[i],free=G.pendingUpgrades[i]>0;
 if(G.levels[i]>=MAX[i]){showToast(name+'は最大強化済み・次のカプセルで進みます');tone(155,.07,'triangle',.02);updateHud();return}
 if(free)G.pendingUpgrades[i]--;
 // Confirmed activation only: clear the meter, then show any queued voucher.
 G.energy=0;G.selected=Math.max(0,powerMeterIndex());
 G.levels[i]++;TROPHIES.event('manualUpgrades',1);TROPHIES.event('weapon'+i,1);
 if(i===5)p.shield=Math.max(p.shield,G.levels[i]);
 if(i===4)G.trail.length=0;
 for(let j=0;j<110;j++)G.trail.push({x:p.x-j*3,y:p.y});
 ring(p.x,p.y,115,'#64eaff',.65);emit(p.x,p.y,36,'#7df8ff',260);
 tone(430,.25,'sawtooth',.09,780);
 const synergy=SYNERGIES.find(s=>s.weapon===i&&passiveRank(s.passive)>0);
 showToast(synergy?'SYNERGY · '+synergy.name:name+' LEVEL '+G.levels[i]);updateHud();
}
function pulse(){
 if(G.mode!=='playing')return;
 if(G.pulses<=0){
  showToast('NOVA再充填まで '+Math.max(1,Math.ceil(60-G.pulseRecharge))+'秒');
  tone(155,.1,'triangle',.025);updateHud();return;
 }
 G.pulses--;TROPHIES.event('novas',1);G.shake=17;screenPulse=.85;G.bullets=[];
 if(G.terrain?.phase==='active')G.terrain.blocks.forEach(b=>b.hp=0);
 p.invul=Math.max(p.invul,.65);
 ring(p.x,p.y,1250,'#a6faff',.75);ring(p.x,p.y,580,'#ffffff',.48);emit(p.x,p.y,54,'#8bf4ff',420);sideNovaButton.animate?.([{filter:'brightness(2.2)'},{filter:'brightness(1)'}],{duration:240,easing:'ease-out'});
 G.enemies.forEach(e=>{if(e.x>W-40)return;damageEnemy(e,Math.round(75*(1+.30*passiveRank(4))));emit(e.x,e.y,7,'#ffca81',160)});
 if(G.boss)damageBoss(G.boss,Math.round(110*(1+.30*passiveRank(4))));
 tone(120,.8,'sawtooth',.14,800);showToast('NOVA BURST');updateHud();
}
function updateHud(){ui.score.textContent=String(G.score).padStart(8,'0');ui.best.textContent=String(Math.max(G.best,G.score)).padStart(8,'0');ui.mult.textContent='×'+(1+Math.min(3,Math.floor(G.combo/8))*.5).toFixed(1);ui.stage.textContent='SECTOR 0'+(G.stage+1);ui.area.textContent=G.stage===0?NAMES[0]:(G.routeHistory[G.stage-1]?.route||NAMES[G.stage]);ui.area.title=NAMES[G.stage]+' / '+ui.area.textContent;ui.progress.style.width=(G.bossDone?100:Math.min(100,G.stageTime/STAGE_LENGTHS[G.stage]*100))+'%';$('durabilityFill').style.width=Math.max(0,Math.min(100,p.hp/Math.max(1,p.maxHp)*100))+'%';
 $('durabilityText').textContent=Math.max(0,Math.ceil(p.hp))+' / '+p.maxHp;
 ui.hp.setAttribute('aria-label','機体耐久 '+Math.max(0,Math.ceil(p.hp))+' / '+p.maxHp);
 ui.lives.textContent='SHIP LV '+String(G.shipLevel).padStart(2,'0');ui.bombs.textContent='NOVA '+String(G.pulses).padStart(2,'0');const activeIndex=powerMeterIndex();
 G.selected=Math.max(0,activeIndex);
 ui.meter.textContent=G.energy>0?'POWER '+G.energy+'/6':activeIndex>=0?'無料強化券':'POWER 待機';$('debugStatus').hidden=!G.debugMode;$('debugStatus').textContent=G.debugMode?(G.debugBossOnly?'DEBUG · 双方無敵':'DEBUG · 無敵'):'';
 ui.meter.title=[passiveSummary(),synergySummary()].filter(Boolean).join(' / ')||'カプセルで点灯が1つ右へ進む';
 ui.upgrades.forEach((b,i)=>{
  const lit=i===activeIndex,ready=lit&&G.levels[i]<MAX[i];
  b.classList.toggle('selected',lit);
  b.classList.toggle('ready',ready);
  b.classList.toggle('maxed',G.levels[i]>=MAX[i]);
  b.setAttribute('aria-label',PNAMES[i]+(lit?'・現在点灯':'')+(G.pendingUpgrades[i]>0?'・無料強化券'+G.pendingUpgrades[i]+'回':'')+'・レベル'+G.levels[i]);
  b.querySelector('.u-key').textContent=G.pendingUpgrades[i]>0?'無料×'+G.pendingUpgrades[i]:(G.levels[i]?'LV '+G.levels[i]:String(i+1).padStart(2,'0'));
 });
 ui.equip.disabled=G.mode!=='playing'||activeIndex<0||G.levels[activeIndex]>=MAX[activeIndex];
 ui.pulse.disabled=G.mode!=='playing'||G.pulses===0;
 // The two visible buttons must always accept a touch during play, even if
 // resources are empty. Otherwise native disabled suppresses click AND feedback.
 sideEquipButton.disabled=G.mode!=='playing';
 sideNovaButton.disabled=G.mode!=='playing';
 sideEquipButton.dataset.ready=activeIndex>=0&&G.levels[activeIndex]<MAX[activeIndex]?'yes':'no';sideEquipButton.dataset.target=String(activeIndex);
 sideNovaButton.dataset.ready=G.pulses>0?'yes':'no';
 const nextNova=G.mode==='over'||G.mode==='win'?'次の出撃で回復':G.mode==='title'?'出撃時に補充':G.pulses>0?'残り'+G.pulses+'回':'補充まで'+Math.max(1,Math.ceil(60-G.pulseRecharge))+'秒';
 const nextEquip=activeIndex<0?'カプセルを取る':G.levels[activeIndex]>=MAX[activeIndex]?'MAX・次のカプセル':G.pendingUpgrades[activeIndex]>0?'無料強化券 '+G.pendingUpgrades[activeIndex]+'回':'POWER '+G.energy+'/6・使用可';
 const target=sideEquipButton.querySelector('span'),name=activeIndex<0?'強化する':PNAMES[activeIndex]+' 強化';
 if(target.textContent!==name)target.textContent=name;
 const novaInfo=$('novaActionState'),equipInfo=$('equipActionState');
 if(novaInfo.textContent!==nextNova)novaInfo.textContent=nextNova;
 if(equipInfo.textContent!==nextEquip)equipInfo.textContent=nextEquip;
 sideNovaButton.setAttribute('aria-label','ノヴァ · '+nextNova);
 sideEquipButton.setAttribute('aria-label','強化 · '+(activeIndex<0?'カプセル待ち':PNAMES[activeIndex])+' · '+nextEquip);ui.boss.classList.toggle('active',!!G.boss);if(G.boss){ui.bossName.textContent=G.boss.name+(G.boss.phase?' · RAGE':'')+(invulnerablePracticeBoss()?' · ∞':'');ui.bossBar.style.width=invulnerablePracticeBoss()?'100%':cl(G.boss.hp/G.boss.maxHp*100,0,100)+'%'}}
function ring(x,y,max,color,life=.6){G.rings.push({x,y,r:4,max,color,life,t:0})}
function emit(x,y,num,color,power=160){for(let i=0;i<num;i++){const a=R(0,TAU),s=R(power*.15,power);G.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:R(.2,.85),maxLife:.85,size:R(1.2,4.4),color,glow:Math.random()>.55})}}
function explosion(x,y,r=32){emit(x,y,Math.round(r*.85),'#ffb66c',r*7);emit(x,y,Math.round(r*.4),'#70dcff',r*4);ring(x,y,r*3,'#ffbd88');G.shake=Math.min(25,G.shake+r*.12);tone(R(70,115),.2,'sawtooth',.038,-50)}
/* Lightweight, non-colliding hull fragments. Deterministic geometry: never
   consume gameplay RNG or create physics bodies. All pieces use the existing
   bounded particle pool, including boss destruction. */
function wreckFragments(e){
 const boss=e.type==='boss';
 const heavy=boss||e.elite||['tank','carrier','bulk'].includes(e.type);
 const count=boss?18:heavy?10:['turret','interceptor','siege','watcher'].includes(e.type)?7:5;
 const palette=boss?['#f4eddf','#ffc58a','#91b7ec']:heavy?['#f2b37b','#c4d9e7','#738da5']:['#ff9a82','#c0bdd8','#729db5'];
 const seed=(e.phase||0)+(e.x||0)*.007+(e.y||0)*.011;
 for(let i=0;i<count;i++){
  const a=(i+.5)*TAU/count+Math.sin(seed+i*1.17)*.22;
  const speed=(boss?175:heavy?135:115)*(.45+(i%4)*.17);
  const life=.32+(i%5)*.095;
  G.particles.push({kind:'shard',x:e.x,y:e.y,
   vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life,maxLife:life,
   size:(boss?15:heavy?11:7)*(.6+(i%3)*.22),
   color:palette[i%3],glow:false,rot:a,spin:(i%2?-1:1)*(3.2+(i%4)*1.1)});
 }
}
function chargeDrive(amount){if(G.overdrive>0)return;G.driveCharge=Math.min(100,G.driveCharge+amount*(1+.22*passiveRank(2)));if(G.driveCharge>=100){G.driveCharge=0;G.overdrive=8;TROPHIES.event('overdrives',1);G.shake=Math.max(G.shake,5);screenPulse=.24;ring(p.x,p.y,155,'#f7d989',.55);emit(p.x,p.y,25,'#ffe49b',180);showToast('OVERDRIVE · 8 SEC');tone(520,.28,'sawtooth',.08,720)}}
function addScore(n){G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);G.comboTime=3.8;G.score+=Math.round(n*(1+Math.min(3,Math.floor(G.combo/8))*.5)*(G.overdrive>0?1.5:1)*routeProfile().score);if(G.score>G.best)G.best=G.score}
function pickup(x,y,forced=false){G.pickups.push({x,y,vx:-GR(35,68),phase:GR(0,TAU),t:0,type:forced?'energy':gameRandom()>.92?'pulse':'energy'})}
function enemy(type,x,y,extra={}){const tune=routeProfile();if(G.enemies.length>=tune.maxEnemies)return;
if(x>=W){for(let attempt=0;attempt<12;attempt++){
 const blocked=G.enemies.some(e=>e.x>=W-30&&Math.abs(e.x-x)<waveRadius(type)+waveRadius(e.type)+18&&Math.abs(e.y-y)<waveRadius(type)+waveRadius(e.type)+18);
 if(!blocked)break;x+=90;
}}
let hp=EXTRA?.stats[type]?.hp??({scout:22,dart:15,tank:125,turret:75,spinner:35,carrier:100,mine:35,interceptor:65}[type]||25);
const baseHull=hp*(1+G.stage*.35)*tune.enemyHp;
const power=pilotThreat(),ease=.75+.25*cl(p.hp/Math.max(1,p.maxHp)/.7,0,1);
hp=Math.max(1,Math.round(baseHull*(1+4.4*power*ease)*difficultyProfile().enemyHp));
const heavy=['tank','carrier','turret','armature','howitzer','bulk','clamp','sting','mantis','orbiter','interceptor'].includes(type);
const signature=Math.abs(Math.round(x*.13+y*.29+(G.runSeed||0)))%3;
const phaseScout=!heavy&&power>.58&&signature===0;
const armor=heavy&&power>.14?Math.round(hp*(.08+.25*power)):
 phaseScout?Math.round(hp*(.25+.28*power)):0;
G.enemies.push({type,x,y,hp,maxHp:hp,baseHull,combatTier:power,combatDifficulty:G.difficulty,scalingEase:ease,
 adaptiveArmor:heavy,armorSignature:signature,armorBroken:false,
 armor,armorMax:armor,dodgeTime:0,dodgeSide:0,t:0,hitFlash:0,recoil:0,fire:GR(.9,1.8)*tune.fireInterval*(G.directorGrace>0?1.18:1),phase:GR(0,TAU),seed:GR(0,100),aiHomeY:y,aiPhase:0,aiWarn:0,aiVolleyArmed:false,score:type==='tank'?750:type==='carrier'?700:type==='interceptor'?540:(EXTRA?.stats[type]?.score||250),windup:0,aimX:0,aimY:0,...extra})}

/* Preserve a traversable lane for each announced formation at entry.
   The cue is not a shield: aimed bullets and later enemy motion still matter. */
const WAVE_LANES=[155,337,515];
function waveRadius(type){return EXTRA?.stats[type]?.radius??(type==='tank'||type==='carrier'?39:type==='interceptor'?29:24)}
function waveClearance(type){return EXTRA?.stats[type]?.clearance??(145+(type==='spinner'?20:type==='interceptor'?28:0))}
function placeOutsideLane(y,lane,margin){
 y=cl(y,108,H-88);const low=lane-margin,high=lane+margin;
 if(y<=low||y>=high)return y;
 const up=low>=108?low:null,down=high<=H-88?high:null;
 if(up===null)return down;if(down===null)return up;
 return y-up<=down-y?up:down;
}
function arrangeWave(units){
 if(!units.length)return {units:[],safeY:337};
 let best=null;
 // During hazards, new squads must preserve the SAME unobstructed lane.
 const lanes=G.terrain?[TERRAIN_LANES[G.terrain.safeLane]]:WAVE_LANES;
 for(const lane of lanes){
  const adjusted=units.map(u=>({...u,y:placeOutsideLane(u.y,lane,waveClearance(u.type))}));
  const move=adjusted.reduce((sum,u,i)=>sum+Math.abs(u.y-units[i].y),0);
  const cost=Math.abs(lane-p.y)*2.1+move*.23;
  if(!best||cost<best.cost)best={lane,adjusted,cost};
 }
 const placed=[];
 for(const u of best.adjusted){
  let x=u.x,rad=waveRadius(u.type);
  for(let attempt=0;attempt<14;attempt++){
   if(!placed.some(v=>Math.abs(x-v.x)<rad+waveRadius(v.type)+24&&Math.abs(u.y-v.y)<rad+waveRadius(v.type)+25))break;
   x+=92;
  }
  if(!placed.some(v=>Math.abs(x-v.x)<rad+waveRadius(v.type)+24&&Math.abs(u.y-v.y)<rad+waveRadius(v.type)+25))placed.push({...u,x});
 }
 return {units:placed,safeY:best.lane};
}
/* A light, non-loot-bearing patrol bridges gaps after fast enemy kills. */
function spawnAmbient(){
 if(G.mode!=='playing'||G.boss||G.bossDone||G.transitioning)return false;
 const tune=routeProfile();
 const visible=G.enemies.filter(e=>e.hp>0&&e.x<W+50).length;
 if(visible>=2||G.enemies.length>=tune.maxEnemies-2)return false;
 const lane=G.terrain?TERRAIN_LANES[G.terrain.safeLane]:p.y;
 const y=placeOutsideLane(150+gameRandom()*360,lane,140);
 const roll=gameRandom();
 const type=G.stage===0?(roll>.8?'dart':'scout'):roll>.8?'spinner':roll>.55?'dart':'scout';
 enemy(type,W+46,y,{ambient:true,noLoot:true,score:95,aiVolleyArmed:false,aiSafeY:lane});
 return true;
}
/* 22/36: One deterministic elite mid-sector encounter; no modal, no extra wave flood.
   The rare NOVA cache is at most one pickup per sector and never upgrades weapons. */
function spawnElite(){
 if(G.eliteSpawned||G.mode!=='playing'||G.boss||G.bossDone||G.transitioning||G.pendingWave||G.terrain||terrainApproaching()||terrainQueued()||G.stageTime<STAGE_LENGTHS[G.stage]*.56)return false;
 const tune=routeProfile();
 if(G.enemies.length>=tune.maxEnemies-3)return false;
 const signature=mixSeed(G.runSeed,G.stage,G.routeRisk+71);
 const lane=WAVE_LANES[signature%3],type=G.stage%2===0?'tank':'carrier';
 const y=placeOutsideLane(signature%2?512:162,lane,waveClearance(type)+32);
 const before=G.enemies.length;
 enemy(type,W+115,y,{elite:true,noLoot:true,score:1700+G.stage*280,eliteFire:1.3,eliteWarn:0,eliteAimY:y,fire:999,aiSafeY:lane});
 if(G.enemies.length===before)return false;
 const e=G.enemies[G.enemies.length-1];
 const eliteBoost=2.6+(G.routeRisk?0.4:0);
 e.hp*=eliteBoost;e.maxHp=e.hp;
 if(e.baseHull)e.baseHull*=eliteBoost;
 G.eliteSpawned=true;
 showToast('ELITE · '+(type==='tank'?'VANGUARD':'BULWARK'));
 return true;
}
/* 23/36: One route-specific interception during continuous flight.
   Two no-loot units replace silence, not the rare capsule economy.
   The entry corridor is arranged with the same safety geometry as waves. */
function spawnRoutePatrol(){
 if(G.stage===0||!G.activeEvent||G.routePatrolSpawned||G.mode!=='playing'||G.boss||G.bossDone||G.transitioning||G.pendingWave||G.terrain||terrainApproaching()||terrainQueued()||G.stageTime<STAGE_LENGTHS[G.stage]*.39)return false;
 const tune=routeProfile();
 if(G.enemies.length>tune.maxEnemies-3)return false;
 const risk=G.routeRisk===1,salt=mixSeed(G.runSeed,G.stage+203,G.routeRisk+17);
 const lane=WAVE_LANES[salt%3],upper=salt&1?192:482;
 const units=risk?[{type:'tank',x:W+110,y:upper},{type:'interceptor',x:W+255,y:upper===192?485:185}]:
  [{type:'carrier',x:W+110,y:upper},{type:'scout',x:W+255,y:upper===192?485:185}];
 const arranged=arrangeWave(units);
 if(arranged.units.length!==2)return false;
 for(let i=0;i<2;i++){
  const u=arranged.units[i];
  enemy(u.type,u.x,u.y,{noLoot:true,routePatrol:true,routeCaptain:i===0,routeRisk:risk?1:0,aiSafeY:arranged.safeY,fire:i===0?1.15:1.8});
 }
 G.routePatrolSpawned=true;
 return true;
}
function spawnWave(){
// A terrain warning or active barrier must never share the entry window with a formation.
if(G.pendingWave||G.boss||G.bossDone||G.transitioning)return false;
const director=encounterDirector();
const planned=[];function queueEnemy(type,x,y,extra={}){if(planned.length<director.budget&&G.enemies.length+planned.length<routeProfile().maxEnemies)planned.push({type,x,y,extra})}

const s=G.stage,tune=routeProfile(),risk=s>0&&G.routeRisk===1,safe=s>0&&!risk;
if(G.enemies.length>=Math.min(tune.maxEnemies-2,Math.floor(tune.maxEnemies*.78)))return false;
const safeWaves=[0,0,1,2,3,4,5,6,10,11,14],stormWaves=[1,2,3,4,5,6,7,7,8,9,11,12,13,14];
const stormPool=risk&&director.pressure<.53?[0,1,2,3,4,5,6,7,11,12,14]:stormWaves;
const gatePool=risk?[7,8,12,13,14,16,16,9]:[0,3,4,10,11,15,15];
 const finalPool=risk?[7,8,12,13,16,16,17,18]:[4,10,11,15,17,17,18];
 const baseWave=s===7?finalPool[gri(0,finalPool.length-1)]:s===6?gatePool[gri(0,gatePool.length-1)]:s===0?[0,0,1,2,3,4,5,6,11,14][gri(0,9)]:(risk?stormPool[gri(0,stormPool.length-1)]:safeWaves[gri(0,safeWaves.length-1)]);
 const w=EXTRA?.pick(s,baseWave,gameRandom,gri)??baseWave;
if(w===0){const yy=GR(180,465);for(let i=0;i<(safe?4:6);i++)queueEnemy('scout',W+60+i*68,cl(yy+Math.sin(i*.9)*66,122,H-70),{pattern:1})}
else if(w===1){const n=safe?3:4;for(let i=0;i<n;i++)queueEnemy('dart',W+50+i*105,145+i*390/Math.max(1,n-1),{pattern:2})}
else if(w===2){queueEnemy('tank',W+100,GR(195,490));for(let i=0;i<(safe?2:3);i++)queueEnemy('scout',W+230+i*85,GR(140,545))}
else if(w===3){for(let i=0;i<(safe?3:4);i++)queueEnemy('spinner',W+60+i*80,GR(145,540))}
else if(w===4){queueEnemy('carrier',W+70,GR(180,500));for(let i=0;i<(safe?1:2);i++)queueEnemy('scout',W+200+i*80,GR(140,540))}
else if(w===5){queueEnemy('turret',W+90,105);if(!safe){queueEnemy('turret',W+200,H-96);queueEnemy('dart',W+175,340)}}
else if(w===6){const n=safe?2:4;for(let i=0;i<n;i++)queueEnemy('mine',W+50+i*85,170+i*320/Math.max(1,n-1))}
else if(w===7){for(let i=0;i<2;i++)queueEnemy('interceptor',W+100+i*110,160+i*145,{lockY:null})}
else if(w===8){queueEnemy('tank',W+125,GR(220,440));queueEnemy('interceptor',W+310,195,{lockY:null});queueEnemy('interceptor',W+410,490,{lockY:null})}
else if(w===9){queueEnemy('carrier',W+100,GR(210,450));queueEnemy('dart',W+245,185);queueEnemy('dart',W+350,490);queueEnemy('spinner',W+450,345)}
else if(w===10){queueEnemy('carrier',W+95,GR(200,470));queueEnemy('scout',W+260,210);queueEnemy('scout',W+345,475)}
else if(w===11){const mid=GR(255,420),n=safe?4:6;for(let i=0;i<n;i++)queueEnemy('scout',W+65+i*70,cl(mid+Math.sin(i*1.15)*112,135,H-85),{pattern:3})}
else if(w===12){for(let i=0;i<3;i++){queueEnemy('dart',W+75+i*110,145+i*28,{pattern:4});queueEnemy('dart',W+125+i*110,H-145-i*28,{pattern:4})}}
else if(w===13){queueEnemy('tank',W+115,GR(245,430));for(let i=0;i<4;i++)queueEnemy('scout',W+215+i*88,175+i*97,{pattern:5})}
else if(w===14){const n=safe?4:6;for(let i=0;i<n;i++)queueEnemy('mine',W+80+i*98,i%2?H-135:135,{pattern:6})}
 else if(w===15){for(let i=0;i<3;i++)queueEnemy('spinner',W+90+i*110,185+i*130,{pattern:7});queueEnemy('dart',W+380,337,{pattern:7})}
 else if(w===16){for(let i=0;i<2;i++)queueEnemy('interceptor',W+110+i*130,205+i*260,{lockY:null,pattern:8});for(let i=0;i<2;i++)queueEnemy('mine',W+360+i*90,i?505:160,{pattern:8})}
 else if(w===17){queueEnemy('carrier',W+110,340,{pattern:9});for(let i=0;i<(risk?3:2);i++)queueEnemy('spinner',W+260+i*105,i%2?480:195,{pattern:9})}
 else if(w===18){for(let i=0;i<(risk?3:2);i++)queueEnemy('interceptor',W+120+i*130,i%2?470:190,{lockY:null,pattern:10});queueEnemy('tank',W+470,337,{pattern:10})}
 else if(w>=19&&w<=28)EXTRA?.wave(w,queueEnemy,W,GR,risk);
if(risk&&s===1&&gameRandom()>.7)queueEnemy('turret',W+420,gameRandom()>.5?125:H-110);
if(risk&&s===2&&gameRandom()>.65)queueEnemy('spinner',W+450,GR(195,480));
 if(risk&&s===6&&gameRandom()>.7)queueEnemy('turret',W+490,gameRandom()>.5?125:540);
 if(risk&&s===7&&gameRandom()>.72)queueEnemy('turret',W+540,gameRandom()>.5?155:520);
if(!planned.length)return false;
const names=['偵察編隊','高速突撃','重装護衛','旋回部隊','輸送護衛','砲台戦線','機雷帯','迎撃隊','重装迎撃','複合編隊','輸送船団','螺旋編隊','上下挟撃','槍型編隊','機雷の回廊','位相旋回隊','裂界追撃隊','終端輸送隊','収束迎撃隊','大型脆弱艦','多関節機兵','攻城砲台','槍型突進機','裂界滑空機','軌道監視機','虚空機影'];
const arranged=arrangeWave(planned);
if(!arranged.units.length)return false;
G.pendingWave={timer:.28,label:names[w],units:arranged.units,kind:w,safeY:arranged.safeY,id:++G.waveSerial,phase:GR(0,TAU)};
G.directorWaveCount++;
return true;
}
const MAX_HOSTILE_BULLETS=100;
function bullet(x,y,a,s=290,size=5,col='#ff8d61',damage=1){
 // Preserve a readable upper bound on projectile density, especially on mobile.
 if(G.bullets.length>=MAX_HOSTILE_BULLETS)return;
 G.bullets.push({x,y,px:x,py:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,size,life:5,color:col,damage});
}
function aim(x,y,spread=0){return Math.atan2(p.y-y,p.x-x)+spread}

/* Distinct enemy motion; synchronized wave roles are derived at spawn, not
   from frame-dependent RNG. The marked entry lane stays open until mid-screen. */
function moveEnemyAI(e,dt){
 const home=e.aiHomeY??e.y,slot=e.squadSlot||0,phase=e.aiPhase||e.phase;
 let target=home,follow=2.4;
 if(e.type==='scout'){
  if(e.pattern===3){target=home+Math.sin(e.t*2.4+slot*.66+phase)*66;follow=3.2}
  else if(e.pattern===5){target=home+Math.sin(e.t*1.6+slot*.22+phase)*23;follow=3}
  else{target=home+Math.sin(e.t*2.8+e.phase)*37;follow=3}
  if([2,4,10,13].includes(e.squadKind)){
   const flagship=G.enemies.find(v=>v.squadId===e.squadId&&(v.type==='tank'||v.type==='carrier')&&v.hp>0);
   if(flagship)target=flagship.y+cl(home-(flagship.aiHomeY??flagship.y),-125,125)*.7+Math.sin(e.t*2.5+slot*.4)*12;
  }
 }else if(e.type==='dart'){
  if(e.pattern===4){target=home+(home<H/2?1:-1)*Math.sin(Math.min(1,e.t/2.4)*Math.PI)*68;follow=3.6}
  else target=home+Math.sin(e.t*4.2+e.phase)*43;
 }else if(e.type==='spinner')target=home+Math.sin(e.t*2.9+e.phase)*67;
 else if(e.type==='carrier')target=home+Math.cos(e.t*1.4+phase)*28;
 else if(e.type==='tank')target=home+Math.sin(e.t*1.05+phase)*13;
 else if(e.type==='mine')target=home+Math.sin(e.t*1.4+slot*.9+phase)*15;
 const special=EXTRA?.motion(e,home,phase);
 if(special){target=special.target;follow=special.follow}
 if(e.type==='turret')return;
 target=cl(target,108,H-88);
 if(Number.isFinite(e.aiSafeY)&&e.x>540)target=placeOutsideLane(target,e.aiSafeY,105);
 e.y=cl(e.y+(target-e.y)*Math.min(1,dt*follow),100,H-75);
}
/* Locked-on squad volleys are announced for 0.92s, limited to 3 attackers.
   The warning reticle stays fixed even if the player moves. */
function coordinateVolley(e){
 if(!e.aiVolleyArmed||e.squadId===undefined||e.x>980||e.x<450||e.t<.75||(G.squadAttackCooldown>0||G.directorGrace>0))return;
 const eligible=G.enemies.filter(v=>v.squadId===e.squadId&&v.hp>0&&v.x<W-25&&v.x>130&&v.type!=='mine'&&v.type!=='interceptor'&&!EXTRA?.contains(v.type)).sort((a,b)=>a.squadSlot-b.squadSlot);
 if(eligible.length<2||eligible[0]!==e)return;
 const chosen=eligible.slice(0,3),targetX=cl(p.x,80,W-250),targetY=cl(p.y,105,H-75);
 for(const v of G.enemies)if(v.squadId===e.squadId)v.aiVolleyArmed=false;
 for(const v of chosen){v.aiWarn=.92;v.aiAimX=targetX;v.aiAimY=targetY;v.aiWarningLead=v===e}
 G.squadAttackCooldown=2.8;G.aiVolleys++;
}

function fireEnemy(e,target=null){
 if(e.type==='mine'||e.type==='interceptor')return;
 if(e.routeCaptain){
  // A compact muzzle flash is the warning; the centre lane stays free.
  const a=target?Math.atan2(target.y-e.y,target.x-(e.x-35)):aim(e.x-35,e.y);
  const offsets=e.routeRisk?[-.5,-.3,-.12,.12,.3,.5]:[-.42,-.2,.2,.42];
  for(const offset of offsets)bullet(e.x-38,e.y,a+offset,(e.routeRisk?242:204)+G.stage*4,4.5,e.routeRisk?'#f5a6d5':'#9bdfff');
  return;
 }
 if(EXTRA?.fire(e,target,p,bullet,G.stage))return;
 const a=target?Math.atan2(target.y-e.y,target.x-(e.x-30)):aim(e.x-30,e.y);
 const base=G.stage*22+(G.stage>0&&G.routeRisk?10:0)+Math.round(30*(e.combatTier||0));
 if(e.type==='tank'||e.type==='carrier'){
  for(const k of [-1,1])bullet(e.x-42,e.y,a+k*.13,260+base,6,'#ffac71');
 }else if(e.type==='turret'){
  for(let i=-1;i<=1;i++)bullet(e.x-32,e.y,a+i*.18,250+base,5,'#ff577e');
 }else if(e.type==='spinner'){
  for(let i=0;i<4;i++)bullet(e.x,e.y,e.t*1.5+i*TAU/4,205+base,4,'#ffcc7e');
 }else bullet(e.x-24,e.y,a,270+base,4,'#f9767f');
}
/* Boss variants are tied to the chosen branch, so legacy bosses remain playable.
   Safe sector 2 = abyssal octopus; dangerous sector 3 = armored dinosaur.
   The first sector and the other two branches retain their original bosses. */
function bossVariant(){if(G.forcedBossVariant&&(G.stage===3||G.stage===4)&&G.routeRisk===0)return G.forcedBossVariant;return G.stage===1&&G.routeRisk===0?'octopus':G.stage===2&&G.routeRisk===1?'dinosaur':G.stage===3?(G.routeRisk?'solarwyrm':mixSeed(G.runSeed,4,71)%4===0?'crab':'scorpion'):G.stage===4?(G.routeRisk?'leviathan':mixSeed(G.runSeed,5,82)%4===0?'turtle':'mammoth'):G.stage===5?(G.routeRisk?'warden':'centipede'):G.stage===6?(G.routeRisk?'riftmedusa':'jellyfish'):G.stage===7?(G.routeRisk?'singularity':'horizonark'):'original'}
function spawnBoss(){
 // Existing craft and already-telegraphed squads complete their flight through
 // the boss entrance instead of vanishing or breaking the wave rhythm.
 G.terrain=null;const variant=bossVariant(),name=variant==='turtle'?'TURTLE BULWARK':variant==='scorpion'?'SCORPION DREAD':variant==='octopus'?'KRAKEN ENGINE':variant==='dinosaur'?'IRON TYRANT':variant==='solarwyrm'?'SOLAR WYRM':variant==='leviathan'?'GLACIAL LEVIATHAN':variant==='warden'?'OBSIDIAN WARDEN':variant==='riftmedusa'?'RIFT MEDUSA':variant==='singularity'?'SINGULARITY EMPEROR':BOSSES[G.stage];const legacyRisk=G.routeHistory.reduce((n,r)=>n+(r.risk===1?1:0),0);
 const legacyChains=G.routeHistory.reduce((n,r,i,a)=>n+(i>0&&a[i-1].risk===r.risk?1:0),0);
 const adaptiveTier=offensiveBuild();
 const baseHp=BOSS_HP[G.stage]*routeProfile().bossHp*(variant==='original'?1:1.06)*
  (G.stage===7?1+Math.min(4,legacyRisk)*.035:1)*bossStageMultiplier(G.stage);
 const hp=Math.round(baseHp*(1+7.2*adaptiveTier)*difficultyProfile().bossHp);
 G.boss={variant,name,adaptiveTier,combatDifficulty:G.difficulty,adaptiveBaseHp:baseHp,reactiveShield:0,reactiveExpose:0,reactiveStrike:0,reactiveCooldown:0,reactiveDamage:0,reactiveTriggers:0,reactiveTargetY:335,x:W+220,y:335,w:[250,280,300,320,330,355,365,380][G.stage],hp,maxHp:hp,t:0,fire:1.6,pattern:0,core:0,phase:0,charge:0,beam:0,beamY:0,legacyRisk,legacyChains,routeDoctrine:G.activeEvent?.id||null,routeRisk:G.routeRisk,weakOpen:false,weakWarn:false,entryReady:false};G.bossDone=false;showAnnounce('WARNING / SECTOR '+String(G.stage+1).padStart(2,'0'),name,variant==='octopus'?'機械触手の予兆に注意':variant==='dinosaur'?'顎部の砲門と尾の装甲に注意':variant==='turtle'?'長首の伸縮と閉じる甲羅に注意':variant==='scorpion'?'尾砲とハサミの弾幕を回避':variant==='crab'?'巨大鋏の熱弾を回避':variant==='solarwyrm'?'炎翼と熱線を回避':variant==='mammoth'?'氷の牙と予兆ビームに注意':variant==='leviathan'?'氷晶の散弾と予兆ビームに注意':variant==='centipede'?'節ごとの砲門を見て回避':variant==='warden'?'封印光線と弾幕の隙間を回避':variant==='jellyfish'?'触手の間を抜け、予兆ビームを回避':variant==='riftmedusa'?'位相弾の隙間を抜けて回避':variant==='singularity'?'重力収束の予兆を見て回避':variant==='horizonark'?'光輪の隙間を通り抜けよ':'大型反応接近　総攻撃開始',G.debugBossOnly?1.05:2.4);tone(90,.9,'sawtooth',.09,170)}
/* Large creature attacks are bounded and telegraphed: no invisible tentacle hitboxes.
   All projectile paths use the existing bullet renderer and collision rules. */
function creatureBossAttack(b){
 if(b.x>980)return;
 const angry=b.phase>0,octo=b.variant==='octopus',speed=octo?220:260;
 if(angry&&b.pattern%4===3){
  b.charge=1.15;b.beamY=cl(p.y,112,H-88);b.fire=2.65;b.pattern++;
  tone(octo?190:140,.3,'sawtooth',.045,-75);return;
 }
 if(b.variant==='horizonark'||b.variant==='singularity'){
  const singular=b.variant==='singularity',history=Math.min(4,b.legacyRisk||0);
  const speed=205+history*7+(b.phase===2?35:0),a=aim(b.x-148,b.y);
  if(b.pattern%3===0){
   for(const side of [-1,1])for(let i=1;i<=3+(b.phase===2?1:0);i++)
    bullet(b.x-154,b.y,a+side*(.19+i*.17),speed,5,singular?'#f1a6fc':'#b6f8d8');
  }else if(b.pattern%3===1){
   for(let i=0;i<10+(b.phase===2?2:0);i++){
    if(i%5===2)continue;
    const theta=i*TAU/(10+(b.phase===2?2:0))+b.t*.13;
    bullet(b.x-112,b.y,theta,speed-30,4.5,singular?'#d19dff':'#f2e3a2');
   }
  }else{
   for(const side of [-1,1])for(let k=0;k<2+(b.phase===2?1:0);k++){
    const y=cl(b.y+side*(85+k*65),95,H-95);
    bullet(b.x-150,y,Math.atan2(p.y-y,p.x-(b.x-150))+side*.15,speed-8,5,singular?'#f9a9dc':'#b7f3ff');
   }
  }
  b.pattern++;b.fire=b.phase===2?1.03:angry?1.3:1.7;
  tone(singular?145:305,.15,'triangle',.023,-65);return;
 }
 if(b.variant==='jellyfish'||b.variant==='riftmedusa'){
 const rift=b.variant==='riftmedusa',a=aim(b.x-136,b.y),speed=rift?248:210;
 if(b.pattern%3===0){for(const side of [-1,1])for(let i=0;i<3;i++)
  bullet(b.x-145,b.y+side*(45+i*46),a+side*(.15+i*.15),speed+(angry?24:0),5,rift?'#e4a0ff':'#8df5e6')}
 else if(b.pattern%3===1){for(let i=-3;i<=3;i++)if(i!==0)
  bullet(b.x-153,b.y,a+i*(rift?.19:.23),speed+8,5,rift?'#ff9bde':'#a0ffdc')}
 else{for(const side of [-1,1])for(let i=0;i<2;i++){
  const y=cl(b.y+side*(88+i*92),90,H-80);
  bullet(b.x-120,y,Math.atan2(p.y-y,p.x-b.x+120)+side*.12,speed-12,5,rift?'#c39dff':'#94e5ff')}}
 b.pattern++;b.fire=angry?(rift?1.08:1.22):(rift?1.44:1.62);
 tone(rift?210:350,.12,'triangle',.02,-45);return;
}
if(b.variant==='centipede'||b.variant==='warden'){
  const cent=b.variant==='centipede',a=aim(b.x-155,b.y);
  if(b.pattern%3===0){for(const side of [-1,1])for(let k=0;k<2;k++){
   const y=cl(b.y+side*(62+k*86),90,H-80),x=b.x-155+k*21;
   bullet(x,y,Math.atan2(p.y-y,p.x-x)+side*.16,cent?216:243,5,cent?'#b9e6ac':'#c6a3ff');
  }}else if(b.pattern%3===1){
   for(const d of [-.48,-.27,.27,.48])bullet(b.x-152,b.y,a+d,cent?232:249,5,cent?'#b6f1c1':'#e4aaff');
  }else{for(const side of [-1,1])for(let k=0;k<2;k++){
   const y=cl(b.y+side*(70+k*92),85,H-80);bullet(b.x-155,y,Math.PI+side*.08,cent?210:245,5,'#c0b4ff');
  }}
  b.pattern++;b.fire=angry?1.20:1.70;tone(cent?185:265,.13,'triangle',.021,65);return;
 }
 if(b.variant==='turtle'){
   const armored=bossMoveGuarded(b),spd=armored?180:210;
   if(b.pattern%3===0){
    const y=cl(p.y,130,H-130),x=b.x-178,a=Math.atan2(p.y-y,p.x-x);
    for(const off of [-.29,-.10,.10,.29])bullet(x,y,a+off,spd+12,5,'#b1f7d8');
   }else if(b.pattern%3===1){
    for(const side of [-1,1])for(let k=0;k<3;k++){
     const x=b.x-91,y=cl(b.y+side*(61+k*53),90,H-90);
     bullet(x,y,Math.PI+side*(.16+k*.13),spd,5,'#d4ffec');
    }
   }else{for(let i=0;i<10;i++)if(i%5!==2){
    bullet(b.x-118,b.y,i*TAU/10+b.t*.17,spd-27,4.5,'#b5d4ff');
   }}
   b.pattern++;b.fire=armored?1.85:b.phase?1.22:1.6;
   tone(163,.15,'triangle',.025,-40);return;
  }
  if(b.variant==='mammoth'||b.variant==='leviathan'){
  const mammoth=b.variant==='mammoth';
  if(b.pattern%3===0){for(const side of [-1,1])for(let k=0;k<3;k++){
   const y=cl(b.y+side*(50+k*54),75,H-70),x=b.x-142;
   bullet(x,y,Math.PI+side*(.12+k*.10),mammoth?206:231,5,mammoth?'#91e7ff':'#b9b0ff');
  }}else if(b.pattern%3===1){const a=aim(b.x-148,b.y);for(let k=-3;k<=3;k++)if(k!==0)bullet(b.x-148,b.y,a+k*.19,218,5,'#a5e9ff')}
  else{for(const side of [-1,1])for(let k=0;k<2;k++){
   const y=cl(b.y+side*(78+k*79),75,H-70),x=b.x-175;
   bullet(x,y,Math.atan2(p.y-y,p.x-x)+side*.15,225+(angry?24:0),5,'#7ecfff');
  }}
  b.pattern++;b.fire=angry?1.20:1.68;tone(mammoth?155:310,.14,'triangle',.019,75);return;
 }
 if(b.variant==='scorpion'){
  const speed=angry?245:218,pat=b.pattern%3;
  if(pat===0){for(const side of [-1,1])for(let i=0;i<3;i++){
   const yy=cl(b.y+side*(69+i*54),92,H-87),xx=b.x-168;
   bullet(xx,yy,Math.atan2(p.y-yy,p.x-xx)+side*.14,speed,5,'#ffc38a');
  }}else if(pat===1){
   const xx=b.x-186,yy=b.y-91,a=Math.atan2(p.y-yy,p.x-xx);
   for(const offset of [-.4,-.2,0,.2,.4])bullet(xx,yy,a+offset,speed+8,5,'#ffdc9a');
  }else{for(const side of [-1,1])for(let i=0;i<2;i++){
   const yy=cl(b.y+side*(98+i*76),90,H-85),xx=b.x-151;
   bullet(xx,yy,Math.atan2(p.y-yy,p.x-xx)+side*(.12+i*.14),speed-9,5,'#ff9dab');
  }}
  b.pattern++;b.fire=angry?1.26:1.65;tone(200,.13,'triangle',.026,-60);return;
 }
 if(b.variant==='crab'||b.variant==='solarwyrm'){
  const crab=b.variant==='crab';
  if(b.pattern%3===0){for(const side of [-1,1])for(let i=0;i<4;i++){
   const y=cl(b.y+side*(90+i*33),80,H-75),x=b.x-145;
   bullet(x,y,Math.atan2(p.y-y,p.x-x)+side*.11,crab?210:238,5,crab?'#ffb574':'#ffdb8c');
  }}else if(b.pattern%3===1){const a=aim(b.x-140,b.y);for(let i=-3;i<=3;i++)bullet(b.x-140,b.y,a+i*.19,225,5,'#ff936a')}
  else for(let i=-2;i<=2;i++)if(i!==0)bullet(b.x-130,b.y+i*51,Math.PI,210,5,'#ff789c');
 }else if(octo){
  if(b.pattern%3===0){ // Four clearly separated tentacle tips, paired aimed bolts.
   for(const side of [-1,1])for(let k=0;k<2;k++){
    const y=cl(b.y+side*(68+k*68),80,H-70),x=b.x-136+k*19;
    const a=Math.atan2(p.y-y,p.x-x);
    for(const delta of (b.weakOpen?[0]:[-.12,.12]))
     bullet(x,y,a+delta,speed+(angry?35:0),5,'#ff9bd9');
   }
  }else if(b.pattern%3===1){ // Slow fan with a wider, readable safe interval.
   const a=aim(b.x-122,b.y),n=angry?9:7;
   for(let i=0;i<n;i++)bullet(b.x-122,b.y,a+(i-(n-1)/2)*.20,speed-35,5,'#da81ff');
  }else{for(let k=-2;k<=2;k++){if(k===0)continue;bullet(b.x-100,b.y+k*38,Math.PI,205+(angry?40:0),5,'#a3d3ff')}}
 }else{
  // IRON TYRANT: three distinct, bounded salvos; the jaw opening is a counterattack window.
  const exposed=b.weakOpen,spd=angry?253:225;
  if(b.pattern%3===0){const a=aim(b.x-155,b.y-48);
   for(const side of [-1,1])for(let k=0;k<(exposed?3:4);k++)
    bullet(b.x-155,b.y-48,a+side*(.20+k*.18),spd,5,'#ffad62');
  }else if(b.pattern%3===1){
   for(const side of [-1,1])for(let k=0;k<3;k++)
    bullet(b.x-28,b.y+side*(64+k*36),Math.PI+side*(.20+k*.16),230+(angry?20:0),5,'#ff8799');
  }else{for(const side of [-1,1])for(let k=0;k<2;k++){
    const y=cl(b.y+side*(78+k*68),100,H-95);
    bullet(b.x-153,y,Math.atan2(p.y-y,p.x-(b.x-153))+side*.16,spd-8,5,'#ffd19c');
  }}
 }
 b.pattern++;b.fire=octo?(angry?1.18:1.46):(b.weakOpen?(angry?1.32:1.57):(angry?1.18:1.48));
 tone(octo?235:135,.12,octo?'triangle':'sawtooth',.018,octo?60:90);
}

/* The selected route also changes one in five boss salvos. It REPLACES
   the normal attack rather than adding bullets or a new HUD indicator. */
function routeBossAttack(b){
 if(!b.routeDoctrine||b.pattern===0||b.pattern%5!==4||b.x>980)return false;
 const risk=b.routeRisk===1,a=aim(b.x-120,b.y);
 const offsets=risk?[-.5,-.32,-.15,.15,.32,.5]:[-.44,-.2,.2,.44];
 for(const offset of offsets)bullet(b.x-125,b.y,a+offset,(risk?238:205)+G.stage*4,4.5,risk?'#ef9edc':'#98e8ff');
 b.pattern++;b.fire=risk?1.7:1.95;
 tone(risk?220:410,.12,'triangle',.018,risk?-60:100);
 return true;
}
function bossAttack(b){
startBossMove(b);
if(routeBossAttack(b))return;
if(b.variant&&b.variant!=='original'){creatureBossAttack(b);return}
if(b.x>980)return;
const a=aim(b.x-105,b.y),s=G.stage,angry=b.phase>0;
if(angry&&b.pattern%4===3){
b.charge=.95;b.beamY=cl(p.y,112,H-88);b.fire=2.35;b.pattern++;
tone(250,.37,'sawtooth',.06,-130);
return;
}
if(s===1){
  // Fortress Core: avoidable rotating gaps, offset turrets and split walls.
  const pattern=b.pattern%3,spd=angry?245:215;
  if(pattern===0){
   for(let i=0;i<12;i++){
    if(i===2||i===3||i===8||i===9)continue;
    bullet(b.x-92,b.y,i*TAU/12+b.t*.12,spd-45,4.5,'#ffc493');
   }
  }else if(pattern===1){
   for(const side of [-1,1])for(let k=0;k<3;k++){
    const yy=cl(b.y+side*(72+k*48),100,H-95),xx=b.x-138;
    bullet(xx,yy,Math.atan2(p.y-yy,p.x-xx)+side*(.13+k*.12),spd+15,5,'#f4a5a0');
   }
  }else{
   for(const side of [-1,1])for(let k=0;k<3;k++){
    const yy=cl(b.y+side*(68+k*63),100,H-95);
    bullet(b.x-148,yy,Math.PI+side*(.06+k*.10),spd,5,'#f7c37c');
   }
  }
  b.pattern++;b.fire=angry?1.16:1.48;tone(205,.12,'triangle',.018,-40);return;
 }
if(s===0){
  // Three visually distinct cruiser salvos, always with avoidable gaps.
  const pattern=b.pattern%3;
  if(pattern===0){
   for(const side of [-1,1])for(let i=0;i<4;i++)
    bullet(b.x-140,b.y,a+side*(.18+i*.16),215+(angry?24:0),5,'#ffb57d');
  }else if(pattern===1){
   const sweep=p.y<b.y?-.08:.08;
   for(let i=0;i<12;i++)if(i%4!==2)bullet(b.x-100,b.y,i*TAU/12+sweep,190,4.5,'#ffa1b4');
  }else{
   for(const side of [-1,1])for(let k=0;k<3;k++){
    const y=cl(b.y+side*(78+k*55),100,H-95);
    bullet(b.x-150,y,Math.atan2(p.y-y,p.x-(b.x-150))+side*.13,235,5,'#ff8d9b');
   }
  }
  b.pattern++;b.fire=angry?1.24:1.72;tone(165,.11,'triangle',.018,45);return;
 }
 if(s===2){
 // ABYSS TITAN: open-gap vortex ring, flank cannons and split fan.
 const pattern=b.pattern%3,spd=angry?240:210;
 if(pattern===0){for(let i=0;i<12;i++)if(i%4!==1)bullet(b.x-95,b.y,i*TAU/12+b.t*.12,spd-34,4.5,'#dc9dff')}
 else if(pattern===1){for(const side of [-1,1])for(let k=0;k<3;k++){
  const y=cl(b.y+side*(68+k*52),95,H-95);
  bullet(b.x-148,y,Math.atan2(p.y-y,p.x-(b.x-148))+side*(.14+k*.11),spd+12,5,'#f6a6dd');
 }}
 else{const a=aim(b.x-135,b.y);for(const side of [-1,1])for(let k=0;k<3;k++)
  bullet(b.x-135,b.y,a+side*(.24+k*.19),spd+5,5,'#a5d9ff')}
 b.pattern++;b.fire=angry?1.12:1.52;tone(190,.14,'triangle',.018,-70);return;
}
const count=angry?3:2;
if(b.pattern%3===0){
 for(let i=-(3+s+count);i<=3+s+count;i++)bullet(b.x-130,b.y,a+i*.12,220+s*20+(angry?35:0),5,'#ff628c')
}else if(b.pattern%3===1){
 const n=(angry?21:15)+s*4;
 for(let i=0;i<n;i++)bullet(b.x-85,b.y,i/n*TAU+b.t*.3,170+s*16,4.5,'#ffa35e')
}else{
 for(let i=0;i<(angry?6:4);i++){
  const yy=b.y-(angry?160:100)+i*(angry?64:67);
  bullet(b.x-140,yy,aim(b.x-140,yy),285+s*25,5.5,'#ff5376')
 }
}
b.pattern++;b.fire=angry?(s===2?.91:1.12):(s===2?1.24:1.48);
tone(165,.11,'triangle',.015,50)
}

/* Route gate: paused time & risk/reward choices alter subsequent encounter pacing. */

/* Navigation map: a fixed three-sector graph. Completed edges and the current
   ship position are derived only from the route history, never guessed. */
function renderRouteMap(){
 const x=Array.from({length:NAMES.length},(_,i)=>86+i*728/(NAMES.length-1)),top=40,bottom=138,center=90;
 const at=(sector,risk)=>({x:x[sector],y:sector===0?center:(risk?bottom:top)});
 const currentRisk=G.stage===0?0:(G.routeHistory[G.stage-1]?.risk||0);
 const edges=[];
 for(let sector=1;sector<NAMES.length;sector++){
  for(const sourceRisk of (sector===1?[0]:[0,1]))for(const risk of [0,1]){
   const a=at(sector-1,sourceRisk),b=at(sector,risk),curve=(b.x-a.x)*.36;
   const selected=sector<=G.stage&&G.routeHistory[sector-1]?.risk===risk&&(sector===1||G.routeHistory[sector-2]?.risk===sourceRisk);
   const offered=sector===G.stage+1&&(sector===1||sourceRisk===currentRisk);
   const cls=selected?'complete':offered?(risk?'offered risk':'offered safe'):'future';
   edges.push('<path class="map-edge '+cls+'" d="M'+a.x+' '+a.y+' C'+(a.x+curve)+' '+a.y+' '+(b.x-curve)+' '+b.y+' '+b.x+' '+b.y+'"/>');
  }
 }
 const nodes=[];
 for(let sector=0;sector<NAMES.length;sector++){
  for(const risk of (sector===0?[0]:[0,1])){
   const pt=at(sector,risk),isCurrent=sector===G.stage&&(sector===0||risk===currentRisk);
   const completed=sector<G.stage&&(sector===0||G.routeHistory[sector-1]?.risk===risk);
   const available=sector===G.stage+1;
   const chosen=available&&G.routeSelected===risk;
   const status=isCurrent?'current':completed?'complete':available?(risk?'available risk':'available safe'):'future';
   const label=sector===0?'出撃地点':completed||isCurrent?(G.routeHistory[sector-1]?.route||'航路'):(available?(G.routeOffers[risk]?.name||'航路'):'未発見');
   nodes.push('<g class="map-node '+status+(chosen?' chosen':'')+'" transform="translate('+pt.x+' '+pt.y+')">'+
    '<circle class="map-halo" r="17"/><circle class="map-dot" r="9"/>'+
    (isCurrent?'<path class="map-ship" d="M-5 0 L5 -6 L3 0 L5 6 Z"/>':'')+
    '<text class="map-node-label" y="'+(risk===1?29:-22)+'" text-anchor="middle">'+label+'</text>'+
    (isCurrent?'<text class="map-you" y="29" text-anchor="middle">● 現在地</text>':'')+
    '</g>');
  }
 }
 const svg='<svg viewBox="0 0 900 180" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
  x.map((value,i)=>'<text class="map-sector" x="'+value+'" y="13" text-anchor="middle">SECTOR '+String(i+1).padStart(2,'0')+'</text>').join('')+
  edges.join('')+nodes.join('')+'</svg>';
 const current=G.stage===0?'出撃地点':G.routeHistory[G.stage-1]?.route||NAMES[G.stage];
 const next=G.routeOffers;
 const el=$('routeMap');el.innerHTML=svg;
 el.setAttribute('aria-label','航路マップ。現在地：'+current+'。次の候補：'+next.map(o=>o.name).join('、')+'。');
}
function selectRouteCard(index){
 if(G.mode!=='route'||index!==0&&index!==1)return;
 G.routeSelected=index;
 const buttons=[$('routeSafe'),$('routeRisk')];
 buttons.forEach((b,i)=>{b.classList.toggle('selected',i===index);b.setAttribute('aria-pressed',String(i===index))});
 renderRouteMap();
}


/* Three distinct, seed-stable choices after sectors 1 and 2.  This PRNG
   never touches encounterState or the rendering/audio RNG. */
/* 16/36: deterministic, capped risk-weighted draft. One special offer at
   most; a passive remains guaranteed while one is still upgradeable.
   All probabilities are internal and never clutter the battle HUD. */
function rewardOptions(){
 const available=[];
 const add=(id,name,desc,tag,eligible=true,extra={})=>{
  if(eligible)available.push({id,name,desc,tag,rarity:'common',...extra});
 };
 add('capsule','カプセル +1','装備の強化を早める','POWER',G.energy<6);
 add('pulse','ノヴァ +1','ピンチを切り抜ける','ATTACK',G.pulses<5);
 add('shield','バリア +1','被弾を1回防ぐ','DEFENSE',p.shield<5);
 add('repair','装甲を修復','耐久を36回復','RECOVERY',p.hp<p.maxHp);
 add('drive','ドライブ +35','OVERDRIVEに近づく','ENERGY',G.driveCharge<100);
 const upgradeable=G.levels.map((level,i)=>level+G.pendingUpgrades[i]<MAX[i]?i:-1).filter(i=>i>=0);
 const weapon=upgradeable.length?upgradeable[mixSeed(G.runSeed^0x7a1b9d43,G.stage+51,G.routeRisk)%upgradeable.length]:-1;
 add('module',weapon<0?'武装の無料強化':PNAMES[weapon]+' 無料強化券','対象の装備を選び「強化」で確定','UPGRADE',weapon>=0,{levelIndex:weapon});
 const unmaxed=PASSIVES.map((_,i)=>passiveRank(i)<2?i:-1).filter(i=>i>=0);
 for(const i of unmaxed){const a=PASSIVES[i];add('passive_'+i,a.name+' Lv'+(passiveRank(i)+1),a.desc,'PASSIVE',true,{passiveIndex:i});}
 add('score','スコア獲得','ボーナス '+(3000*(G.stage+1)).toLocaleString()+'点','SCORE');
 // Preserve three valid score fallbacks if every resource and rank is capped.
 add('scorePlus','追加スコア','ボーナス '+(4500*(G.stage+1)).toLocaleString()+'点','SCORE',available.length<3);
 add('scoreMax','大量スコア','ボーナス '+(6000*(G.stage+1)).toLocaleString()+'点','SCORE',available.length<3);
 const salt=mixSeed(G.runSeed^0x8f24a13d,G.stage+71,G.routeRisk);
 const hash=id=>id.split('').reduce((n,ch)=>Math.imul(n,31)+ch.charCodeAt(0)|0,0);
 const priority=o=>{
  const h=mixSeed(salt,G.stage+89,hash(o.id))/4294967296;
  const favored=G.stage>0&&(G.routeRisk===1?
   ['ATTACK','POWER','ENERGY','UPGRADE'].includes(o.tag):
   ['DEFENSE','RECOVERY'].includes(o.tag));
  return h-(favored?.22:0);
 };
 available.sort((a,b)=>priority(a)-priority(b)||a.id.localeCompare(b.id));
 const special=[];
 const offer=(id,name,desc,tag,eligible,extra={})=>{
  if(eligible)special.push({id,name,desc,tag,rarity:'rare',tradeoff:true,...extra});
 };
 const doubleWeapons=upgradeable.filter(i=>i!==5&&MAX[i]-G.levels[i]-G.pendingUpgrades[i]>=2);
 const doubleWeapon=doubleWeapons.length?doubleWeapons[mixSeed(salt,117,3)%doubleWeapons.length]:-1;
 const focusPassive=unmaxed.length?unmaxed[mixSeed(salt,119,5)%unmaxed.length]:-1;
 offer('rare_arsenal','武装オーバークロック','無料強化券×2（手動） / バリア-1','RARE · COST',doubleWeapon>=0&&p.shield>0,{levelIndex:doubleWeapon});
 offer('rare_reactor','高出力リアクター','ドライブ+45・ノヴァ+1 / バリア-1','RARE · COST',p.shield>0&&G.driveCharge<=55&&G.pulses<5);
 offer('rare_rescue','緊急再生キット','耐久を60回復 / カプセル-2','RARE · COST',G.energy>=2&&p.hp<p.maxHp-35);
 offer('rare_focus','適応コア','パッシブ+1・ドライブ+15 / ノヴァ-1','RARE · COST',focusPassive>=0&&G.pulses>0,{passiveIndex:focusPassive});
 if(G.stage>0&&G.routeRisk===1){
  offer('storm_bounty','危険宙域の戦利品','カプセル+3・ドライブ+25 / バリア-1','HIGH RISK',G.energy<=3&&p.shield>0,{risk:'storm'});
  offer('storm_gamble','決死の武装換装','無料強化券×1・ドライブ+25 / 耐久-22','HIGH RISK',weapon>=0&&p.hp>30,{levelIndex:weapon,risk:'storm'});
 }else if(G.stage>0){
  offer('safe_refit','補給基地で再整備','耐久+27・バリア+1','SUPPLY',p.hp<p.maxHp&&p.shield<5,{rarity:'route',tradeoff:false,risk:'safe'});
  offer('safe_supply','航路補給パック','カプセル+1・ノヴァ+1','SUPPLY',G.energy<6&&G.pulses<5,{rarity:'route',tradeoff:false,risk:'safe'});
 }
 // 14% neutral / 22% supply / 44% storm special chance. Seed-stable,
 // independent from formation RNG. No more than one rare/route offer per draft.
 const chance=G.stage===0?14:G.routeRisk===1?44:22;
 const roll=mixSeed(salt,G.stage+107,G.routeRisk+13)%100;
 const chosen=roll<chance&&special.length?
  special[mixSeed(salt^0x3c2a19f1,G.stage+127,G.routeRisk+3)%special.length]:null;
 const passive=available.find(o=>o.id.startsWith('passive_'));
 // 34/36: rescue is a selectable reward, never an automatic grant or upgrade.
 const critical=p.hp/Math.max(1,p.maxHp)<=.35;
 const rescue=critical?(available.find(o=>o.id==='repair')||available.find(o=>o.id==='shield')):null;
 const result=passive?[passive]:[];
 if(rescue&&rescue!==passive)result.push(rescue);
 if(chosen)result.push(chosen);
 for(const o of available){if(result.length>=3)break;if(o!==passive&&o!==rescue)result.push(o)}
 return result.slice(0,3);
}
function selectRewardCard(index){
 if(G.mode!=='reward'||index<0||index>=3)return;
 G.rewardSelected=index;
 for(let i=0;i<3;i++){
  const btn=$('rewardCard'+i);
  btn.classList.toggle('selected',i===index);
  btn.setAttribute('aria-pressed',String(i===index));
 }
}
/* No modal interruptions: fly to a reward gate, then a destination gate. */
function resumeFlightGate(phase){
 G.mode='playing';G.bossDone=true;G.transitioning=true;G.flowPhase=phase;
 G.transition=phase==='reward'?4.8:2.4;
 G.rewardOffers=phase==='reward'?rewardOptions():[];
 G.routeOffers=phase==='route'?[routeOffer(G.stage,0),routeOffer(G.stage,1)]:[];
 $('rewardPanel').classList.remove('open');$('routePanel').classList.remove('open');
 showToast(phase==='reward'?'上下移動で報酬選択':'上下移動で進路選択');
}
function flightRewardIndex(){return p.y<251?0:p.y<423?1:2}
function flightRouteIndex(){return p.y<H/2?0:1}
function openReward(){
 if(G.stage>=NAMES.length-1){endGame(true);return}
 G.mode='reward';G.transitioning=false;resetStick();bgm?.stop();
 G.rewardOffers=rewardOptions();G.rewardSelected=0;
 $('rewardStage').textContent='SECTOR 0'+(G.stage+1)+' CLEAR';
 $('passiveOwned').textContent=passiveSummary()?'所持：'+passiveSummary():'所持パッシブ：なし';
 for(let i=0;i<3;i++){
  const o=G.rewardOffers[i],b=$('rewardCard'+i);
  b.classList.toggle('passive',o.id.startsWith('passive_'));
  b.classList.toggle('rare',o.rarity==='rare');
  b.classList.toggle('route-special',o.rarity==='route');
  b.classList.toggle('risk',o.risk==='storm');
  b.querySelector('.reward-tag').textContent=o.tag;
  b.querySelector('.reward-name').textContent=o.name;
  b.querySelector('.reward-desc').textContent=o.desc;
  b.setAttribute('aria-label',(i+1)+'番 '+o.name+' '+o.desc);
 }
 $('rewardPanel').classList.add('open');selectRewardCard(0);
 saveCheckpoint('reward');updateHud();tone(550,.2,'triangle',.04,250);
}
function chooseReward(index){
 const inline=G.mode==='playing'&&G.flowPhase==='reward';
 if((G.mode!=='reward'&&!inline)||!Number.isInteger(index)||index<0||index>2)return;
 const o=G.rewardOffers[index];if(!o)return;
 if(o.id.startsWith('passive_')&&Number.isInteger(o.passiveIndex)&&o.passiveIndex>=0&&o.passiveIndex<PASSIVES.length&&passiveRank(o.passiveIndex)<2){
  G.passives[o.passiveIndex]++;
  if(o.passiveIndex===3)p.shield=Math.min(5,p.shield+1);
 }else if(o.id==='rare_arsenal'&&Number.isInteger(o.levelIndex)&&o.levelIndex!==5&&G.levels[o.levelIndex]+G.pendingUpgrades[o.levelIndex]<MAX[o.levelIndex]&&p.shield>0){
  queueManualUpgrade(o.levelIndex,2);p.shield--;
 }else if(o.id==='rare_reactor'&&p.shield>0){
  p.shield--;G.pulses=Math.min(5,G.pulses+1);chargeDrive(45);
 }else if(o.id==='rare_rescue'&&G.energy>=2){
  reducePowerMeter(2);repairHull(60);
 }else if(o.id==='rare_focus'&&Number.isInteger(o.passiveIndex)&&passiveRank(o.passiveIndex)<2&&G.pulses>0){
  G.pulses--;G.passives[o.passiveIndex]++;if(o.passiveIndex===3)p.shield=Math.min(5,p.shield+1);chargeDrive(15);
 }else if(o.id==='storm_bounty'&&p.shield>0){
  p.shield--;advancePowerMeter(3);chargeDrive(25);
 }else if(o.id==='storm_gamble'&&p.hp>30&&Number.isInteger(o.levelIndex)&&G.levels[o.levelIndex]+G.pendingUpgrades[o.levelIndex]<MAX[o.levelIndex]){
  p.hp-=22;queueManualUpgrade(o.levelIndex,1);chargeDrive(25);
 }else if(o.id==='safe_refit'){
  repairHull(27);p.shield=Math.min(5,p.shield+1);
 }else if(o.id==='safe_supply'){
  advancePowerMeter(1);G.pulses=Math.min(5,G.pulses+1);
 }else if(o.id==='capsule')advancePowerMeter(1);
 else if(o.id==='pulse')G.pulses=Math.min(5,G.pulses+1);
 else if(o.id==='shield')p.shield=Math.min(5,p.shield+1);
 else if(o.id==='repair')repairHull(36);
 else if(o.id==='drive')chargeDrive(35);
 else if(o.id==='module'&&Number.isInteger(o.levelIndex)&&G.levels[o.levelIndex]+G.pendingUpgrades[o.levelIndex]<MAX[o.levelIndex]){
  queueManualUpgrade(o.levelIndex,1);
 }else if(o.id==='score')G.score+=3000*(G.stage+1);
 else if(o.id==='scorePlus')G.score+=4500*(G.stage+1);
 else if(o.id==='scoreMax')G.score+=6000*(G.stage+1);
 TROPHIES.event('rewards',1);const synergy=o.passiveIndex===undefined?null:SYNERGIES.find(s=>s.passive===o.passiveIndex&&G.levels[s.weapon]>0);G.rewardHistory.push({stage:G.stage,id:o.id,name:o.name});
 $('rewardPanel').classList.remove('open');
 if(inline){
  G.flowPhase='route';G.transition=2.4;G.routeOffers=[routeOffer(G.stage,0),routeOffer(G.stage,1)];
  saveCheckpoint('route');
 }else openRoute();
 updateHud();showToast(['module','rare_arsenal','storm_gamble'].includes(o.id)?'無料強化券'+(o.id==='rare_arsenal'?'×2':'×1')+' · 右の強化ボタン':'REWARD · '+o.name+(synergy?' · '+synergy.name:''));
}
for(let i=0;i<3;i++){
 const b=$('rewardCard'+i);
 b.addEventListener('click',()=>chooseReward(i));
 b.addEventListener('focus',()=>selectRewardCard(i));
 b.addEventListener('pointerenter',()=>selectRewardCard(i));
}

function openRoute(){
 if(G.stage>=NAMES.length-1){endGame(true);return}
 G.mode='route';G.transitioning=false;resetStick();bgm?.stop();
 const options=G.routeOffers=[routeOffer(G.stage,0),routeOffer(G.stage,1)],panel=$('routePanel');
 $('routeHeading').textContent='次の航路を選択';
 $('routeNextSector').textContent='SECTOR 0'+(G.stage+2);$('routeSeed').textContent='SEED '+seedHex(G.runSeed);
 $('routeSafeName').textContent=options[0].name;
 $('routeSafeDesc').textContent='NEXT · '+NAMES[G.stage+1]+' / '+options[0].desc+' / EVENT · '+options[0].event.name+(options[0].chain?' · 連続航路':'');
 $('routeSafeBonus').textContent=options[0].bonus+' · '+options[0].event.short;
 $('routeRiskName').textContent=options[1].name;
 $('routeRiskDesc').textContent='NEXT · '+NAMES[G.stage+1]+' / '+options[1].desc+' / EVENT · '+options[1].event.name+(options[1].chain?' · 連続航路':'');
 $('routeRiskBonus').textContent=options[1].bonus+' · '+options[1].event.short;
 $('routeSafe').title=options[0].event.desc;$('routeRisk').title=options[1].event.desc;
 G.routeSelected=0;panel.classList.add('open');selectRouteCard(0);saveCheckpoint('route');tone(440,.2,'triangle',.04,210);
}
function chooseRoute(index){
 const inline=G.mode==='playing'&&G.flowPhase==='route';
 if((G.mode!=='route'&&!inline)||(index!==0&&index!==1))return;
 const opt=G.routeOffers[index];
 if(opt.risk)unlockMedal('risk');TROPHIES.event(opt.risk?'riskRoutes':'safeRoutes',1);G.routeRisk=opt.risk;G.routeHistory.push({stage:G.stage+2,route:opt.name,risk:opt.risk,event:opt.event.id,eventName:opt.event.name,chain:opt.chain});
 G.activeEvent=opt.event;G.eventTriggered=false;G.eventChain=opt.chain;
 if(opt.risk)advancePowerMeter(1);
 if(opt.risk){G.score+=1000*(G.stage+1);chargeDrive(18)}else G.pulses=Math.min(5,G.pulses+1);
 $('routePanel').classList.remove('open');G.mode='playing';G.flowPhase=null;
 nextStage();
 if(opt.chain){if(opt.risk)chargeDrive(20);else p.shield=Math.min(5,p.shield+1)}
 saveCheckpoint();updateHud();
 if(!inline){if(sound&&bgm){bgm.setEnabled(true);bgm.start()}syncOrientation()}
 showToast((opt.chain?'ROUTE CHAIN · ':'')+opt.name+' · '+opt.event.name);
}
$('routeSafe').addEventListener('click',()=>chooseRoute(0));
$('routeRisk').addEventListener('click',()=>chooseRoute(1));
$('routeSafe').addEventListener('focus',()=>selectRouteCard(0));
$('routeRisk').addEventListener('focus',()=>selectRouteCard(1));
$('routeSafe').addEventListener('pointerenter',()=>selectRouteCard(0));
$('routeRisk').addEventListener('pointerenter',()=>selectRouteCard(1));


/* One announced mid-stage event per chosen route. Events never use draw RNG. */
function triggerRouteEvent(){
 const ev=G.activeEvent;
 if(!ev||G.eventTriggered||G.mode!=='playing'||G.boss||G.pendingWave||G.terrain||terrainApproaching()||terrainQueued()||G.stageTime<ev.when)return;
 const risk=G.routeRisk===1;
 if(risk&&G.enemies.length>routeProfile().maxEnemies-4)return;
 G.eventTriggered=true;G.eventCount++;TROPHIES.event('events',1);
 if(ev.id==='finalBeacon'){
   const earlierRisk=G.routeHistory.slice(0,-1).filter(r=>r.risk===1).length;
   p.shield=Math.min(5,p.shield+1);chargeDrive(earlierRisk>=3?24:15);ring(p.x,p.y,110,'#ffe3a5',.55);
  }else if(ev.id==='finalHunters'){
   const earlierRisk=G.routeHistory.slice(0,-1).filter(r=>r.risk===1).length;
   enemy('tank',W+120,340,{eventDrop:true});enemy('interceptor',W+275,205,{lockY:null});
   if(earlierRisk>=3)enemy('spinner',W+425,485);
  }else if(ev.id==='salvage'||ev.id==='cache'){
  pickup(W+80,337,true);
  }else if(ev.id==='phaseEcho'){chargeDrive(18);ring(p.x,p.y,110,'#88ffdb',.55)}else if(ev.id==='riftHunters'){enemy('interceptor',W+100,220,{lockY:null,eventDrop:true});enemy('interceptor',W+265,475,{lockY:null});enemy('spinner',W+415,337)}else if(ev.id==='archive'){
  p.shield=Math.min(5,p.shield+1);chargeDrive(12);ring(p.x,p.y,100,'#7ae5be',.7);
 }else if(ev.id==='sentinel'){
  enemy('tank',W+125,340,{eventDrop:true});enemy('spinner',W+280,480);
 }else if(ev.id==='beacon'){
  p.shield=Math.min(5,p.shield+1);ring(p.x,p.y,95,'#6feaff',.7);
 }else if(ev.id==='charge'){
  chargeDrive(30);ring(p.x,p.y,120,'#a9eaff',.6);
 }else if(ev.id==='pursuit'){
  enemy('interceptor',W+100,200,{lockY:null,eventDrop:true});
  enemy('interceptor',W+225,455,{lockY:null});
 }else if(ev.id==='flare'){
  enemy('spinner',W+110,235,{eventDrop:true});
  enemy('spinner',W+245,455);
 }else if(ev.id==='freighter'){
  enemy('carrier',W+130,325,{eventDrop:true});
  enemy('dart',W+275,195);
 }else if(ev.id==='ambush'){
  enemy('tank',W+125,340,{eventDrop:true});
  enemy('interceptor',W+285,500,{lockY:null});
 }
 if(risk&&G.eventChain)enemy('dart',W+400,175);
 showToast('ROUTE EVENT · '+ev.name);
 tone(risk?220:590,.25,'triangle',.04,risk?-90:280);
}

function stageClear(){
 // Practice never pays out a clear or enters a subsequent stage.
 if(invulnerablePracticeBoss())return;
 TROPHIES.sectorClear();
 if(G.stage===0)unlockMedal('first');
 G.pendingWave=null;G.terrain=null;G.boss=null;G.bossDone=true;G.transitioning=true;
 // The fleet stays through the boss fight; clear leftover hostiles only after victory.
 G.enemies=[];G.bullets=[];
 G.flowPhase=G.stage>=NAMES.length-1?'finish':'reward';
 G.transition=G.flowPhase==='finish'?1.8:4.8;
 // The checkpoint is saved after rescue and score changes to avoid losing progress.
 // Rescue critically damaged ships on every second sector only.
 grantShipXP(70+G.stage*12);
 const rescued=G.stage%2===1&&p.hp/p.maxHp<.30;
 if(rescued)repairHull(22);
 if(G.stage%2===1)G.pulses=Math.min(5,G.pulses+1);
 G.score+=5000*(G.stage+1);chargeDrive(22);
 if(G.flowPhase==='reward'){G.rewardOffers=rewardOptions();G.routeOffers=[];saveCheckpoint('reward')}
 showAnnounce('SECTOR CLEAR',NAMES[G.stage],'+ BONUS 5000'+(rescued?' · HULL +22':G.stage%2===1?' · NOVA +1':''),.9);
 tone(470,.55,'triangle',.055,450)
}
function nextStage(){G.stage++;if(G.stage>=NAMES.length){endGame(true);return}G.pendingWave=null;G.waveSerial=0;G.squadAttackCooldown=0;G.directorGrace=0;G.directorWaveCount=0;G.ambientTimer=.4;G.eliteSpawned=false;G.routePatrolSpawned=false;seedStage();resetTerrain();G.stageTime=0;G.spawn=.42*routeProfile().spawnInterval;G.transitioning=false;G.flowPhase=null;G.bossDone=false;G.enemies=[];G.bullets=[];G.pickups=[];p.invul=1.6;p.shield=Math.min(5,p.shield+passiveRank(3));showAnnounce('MISSION 0'+(G.stage+1),NAMES[G.stage],SUBS[G.stage],1.15);tone(400,.3,'sine',.04,350)}
function hitPlayer(damage=1){
 if(G.debugMode||p.invul>0||G.mode!=='playing')return;
 TROPHIES.hit(p.shield>0);
 if(p.shield>0){
  G.directorGrace=Math.max(G.directorGrace,4.5);
  G.spawn=Math.max(G.spawn,3.2);p.shield--;p.invul=.62;p.hitFlash=.11;
  ring(p.x,p.y,62,'#5df4ff');
  if(synergyActive(4)){
   const radius=115+35*passiveRank(3);
   for(const shot of G.bullets)if(circleHit(p.x,p.y,radius,shot.x,shot.y,shot.size||0))shot.life=0;
   ring(p.x,p.y,radius,'#7cfce9',.28);
  }
  tone(330,.19,'triangle',.07,-200);return;
 }
 G.directorGrace=Math.max(G.directorGrace,5);G.spawn=Math.max(G.spawn,3);
 p.hp=Math.max(0,p.hp-actualHullDamage(damage));p.invul=1.10;p.hitFlash=.22;
 G.shake=13;G.combo=0;G.driveCharge=Math.max(0,G.driveCharge-20);
 emit(p.x,p.y,25,'#8acbff',220);tone(190,.36,'sawtooth',.085,-160);
 if(p.hp<=0){explosion(p.x,p.y,57);endGame(false);return}
 updateHud();
}
function playerFire(){const l=G.levels,shotCount=l[2]>0?2:1;const speeds=G.overdrive>0?1250:950;if(l[2]>0){for(let i=0;i<shotCount;i++){let y=p.y+(i?9:-9);G.shots.push({x:p.x+42,y,px:p.x+42,py:y,vx:1200,vy:0,dmg:23+l[2]*12,pierce:3+l[2]*3,kind:'laser',life:1.5})}}else{G.shots.push({x:p.x+37,y:p.y,px:p.x+37,py:p.y,vx:speeds,vy:0,dmg:G.overdrive>0?28:19,pierce:1,kind:'shot',life:1.7})}if(l[1]){const spread=l[1]===1?[.16,-.16]:l[1]===2?[.12,-.12,.29,-.29]:[.09,-.09,.21,-.21,.35,-.35];for(let a of spread)G.shots.push({x:p.x+30,y:p.y,px:p.x+30,py:p.y,vx:890*Math.cos(a),vy:890*Math.sin(a),dmg:12+l[1]*2,pierce:1,kind:'spread',life:1.6})}if(synergyActive(0))for(let i=0;i<passiveRank(0);i++){
 const a=i%2?-.055:.055;
 G.shots.push({x:p.x+30,y:p.y,px:p.x+30,py:p.y,vx:890*Math.cos(a),vy:890*Math.sin(a),dmg:9,pierce:1,kind:'spread',life:1.45});
}const drones=l[4];for(let i=0;i<drones;i++){const tr=G.trail[Math.min(G.trail.length-1,17+i*24)]||p;G.shots.push({x:tr.x+20,y:tr.y,px:tr.x+20,py:tr.y,vx:890,vy:0,dmg:13,pierce:1,kind:'drone',life:1.7})}emit(p.x+44,p.y,3,'#6eeeff',75);tone(l[2]?680:380,.045,'triangle',.009,l[2]?350:110)}
function missileFire(){if(!G.levels[3])return;const shots=G.levels[3];for(let i=0;i<shots;i++)G.shots.push({x:p.x-6,y:p.y+22,px:p.x-6,py:p.y+22,vx:300,vy:170+i*100,dmg:35,pierce:1,kind:'missile',life:3.8})}
function circleHit(ax,ay,ar,bx,by,br){return (ax-bx)*(ax-bx)+(ay-by)*(ay-by)<(ar+br)*(ar+br)}

/* Sector terrain: seed-determined obstacles, with a clearly announced passable lane.
   One safe lane is selected nearest the ship before the warning; the other
   two lanes are blocked. No random draws occur during terrain rendering. */
const TERRAIN_LANES=[165,337,509];
function resetTerrain(){
 const salt=mixSeed(G.runSeed,G.stage+71,G.routeRisk+91);
 G.terrainSchedule=[15+salt%5,40+(salt>>>7)%5];
 G.terrainIndex=0;G.terrain=null;
}
function terrainApproaching(){
 // Preserve a short cue only; no four-second forced empty battlefield.
 return !G.terrain&&G.terrainIndex<2&&G.stageTime>=G.terrainSchedule[G.terrainIndex]-.55&&G.stageTime<=STAGE_LENGTHS[G.stage]-11;
}
function terrainQueued(){return !G.terrain&&G.terrainIndex<2&&G.stageTime>=G.terrainSchedule[G.terrainIndex]&&G.stageTime<=STAGE_LENGTHS[G.stage]-11}
function planTerrain(){
 if(G.terrain||G.terrainIndex>=2||G.boss||G.bossDone||G.transitioning||G.mode!=='playing')return false;
 if(G.stageTime<G.terrainSchedule[G.terrainIndex]||G.stageTime>STAGE_LENGTHS[G.stage]-11)return false;
 // Two-second visible hazard entry replaces the old empty-screen requirement.
 const roll=mixSeed(G.runSeed,G.stage+113,G.terrainIndex*17+G.routeRisk*7);
 const referenceY=G.pendingWave?.safeY??p.y;
 const safeLane=TERRAIN_LANES.reduce((best,y,i)=>Math.abs(referenceY-y)<Math.abs(referenceY-TERRAIN_LANES[best])?i:best,0);
 const type=G.stage===7?(G.routeRisk?'gravity':'prism'):G.stage===6?(G.routeRisk?'fracture':'membrane'):G.stage===5?(G.routeRisk?'seal':'rune'):G.stage===4?(G.routeRisk?'blizzard':'ice'):G.stage===3?'flare':roll%2?'wreck':'ion';
 G.terrain={type,phase:'warning',timer:2.1,x:W+135,speed:215+((roll>>>4)%4)*12+(G.stage===4&&G.routeRisk?22:0),
  safeLane,blocks:TERRAIN_LANES.map((y,i)=>({y,hp:i===safeLane?0:type==='wreck'?160:type==='ice'?185:type==='rune'?190:type==='membrane'?205:type==='prism'?230:9999})),seed:roll};
 G.terrainIndex++;G.spawn=Math.min(G.spawn,.7);
 tone(420,.16,'triangle',.045,-190);
 return true;
}
function advanceTerrain(dt){
 const t=G.terrain;
 if(!t){planTerrain();return}
 if(t.phase==='warning'){
  t.timer-=dt;
  if(t.timer<=0){t.phase='active';t.timer=0;t.x=W+135}
  return;
 }
 t.x-=t.speed*dt;
 for(const block of t.blocks){
  if(block.hp<=0)continue;
  if(Math.abs(t.x-p.x)<76&&Math.abs(block.y-p.y)<77)hitPlayer(1);
 }
 if(t.x< -145||t.blocks.every(b=>b.hp<=0))G.terrain=null;
}
function drawTerrain(){
 const t=G.terrain;if(!t||G.mode==='title')return;
 c.save();
 if(t.phase==='warning'){
  // Small edge cues only. No translucent SAFE/DANGER guidance panels.
  c.globalAlpha=.38+.22*Math.sin(G.time*9);c.strokeStyle='#ffaf82';c.lineWidth=3;
  for(let i=0;i<3;i++){
   if(i===t.safeLane)continue;
   const y=TERRAIN_LANES[i];
   c.beginPath();c.moveTo(W-72,y-44);c.lineTo(W-40,y-44);
   c.moveTo(W-72,y+44);c.lineTo(W-40,y+44);c.stroke();
  }
 }else{
  for(const block of t.blocks){
   if(block.hp<=0)continue;
   const x=t.x,y=block.y;
   c.save();c.translate(x,y);
   if(t.type==='prism'||t.type==='gravity'){
   const gravity=t.type==='gravity',edge=gravity?'#d9a1fa':'#f9e6a2';
   c.rotate(G.time*.16);c.shadowColor=edge;c.shadowBlur=14;
   poly([-64,0,-22,-61,37,-55,69,0,30,58,-32,62],gravity?'#442653':'#736444',edge,3);
   for(let j=0;j<4;j++){const aa=j*TAU/4+G.time*.45;
    line(Math.cos(aa)*43,Math.sin(aa)*43,Math.cos(aa+.6)*29,Math.sin(aa+.6)*29,edge,2)}
   glowCircle(0,0,14,edge,8);
  }else if(t.type==='membrane'||t.type==='fracture'){
 const fracture=t.type==='fracture';c.rotate(Math.sin(G.time*1.1+block.y)*.035);
 c.globalAlpha=.82;c.shadowColor=fracture?'#e69aff':'#75ffda';c.shadowBlur=14;
 ellipse(0,0,62,66,fracture?'#43265d':'#205b60',fracture?'#ecb0ff':'#abffe6',3);
 for(let j=0;j<5;j++){const a=j*TAU/5+G.time*.3;
  line(Math.cos(a)*18,Math.sin(a)*20,Math.cos(a)*51,Math.sin(a)*53,fracture?'#f5c8ff':'#c5fff2',2)}
 glowCircle(0,0,14,fracture?'#ffb5f0':'#a8fff2',8);
}else if(t.type==='rune'||t.type==='seal'){
  const seal=t.type==='seal';c.shadowColor=seal?'#c19bff':'#9df2c0';c.shadowBlur=13;
  poly([-59,-55,-20,-75,38,-72,66,-35,62,49,21,71,-48,53],seal?'#42315e':'#335b50',seal?'#b79ef5':'#c2df9c',3);
  poly([-30,-35,0,-50,29,-31,18,36,-11,47,-38,14],seal?'#6c5191':'#487e6c',seal?'#dec8ff':'#e3efb0',2);
  for(let k=0;k<4;k++){const a=k*TAU/4+G.time*.18;line(Math.cos(a)*25,Math.sin(a)*31,Math.cos(a+1)*25,Math.sin(a+1)*31,seal?'#e6bcff':'#aafbd1',2)}
  glowCircle(0,0,12,seal?'#f0baff':'#b9ffcc',8);
 }else if(t.type==='flare'){
     // Stage four's volcanic vents have a two-second warning and a safe lane.
     const glow=.7+.2*Math.sin(G.time*9+block.y);
     c.shadowColor='#ff9c47';c.shadowBlur=18;c.globalAlpha=.9;
     ellipse(0,0,62,60,'#7b342c','#ffcd7a',4);
     c.globalAlpha=glow;
     for(let k=0;k<6;k++){const aa=k*TAU/6+G.time*.6;
      poly([Math.cos(aa)*30,Math.sin(aa)*30,Math.cos(aa+.3)*48,Math.sin(aa+.3)*48,
       Math.cos(aa+.7)*35,Math.sin(aa+.7)*35],'#ff8c4e','#ffe1a0',1)}
     glowCircle(0,0,19,'#fff1a9',12);
    }else if(t.type==='ice'||t.type==='blizzard'){
     c.shadowColor='#91dfff';c.shadowBlur=12;
     poly([-65,8,-28,-59,13,-72,56,-17,70,30,19,62,-37,52],t.type==='ice'?'#316b87':'#3a536c','#bdefff',3);
     poly([-28,-20,13,-72,21,12,-7,35],'#a2eaff','#e2ffff',2);
     for(let j=0;j<4;j++)line(-42+j*27,28,-26+j*27,48,'#d6f9ff',2);
    }else if(t.type==='wreck'){
    c.rotate(Math.sin(t.seed+block.y)*.23);
    c.shadowColor='#ff8c62';c.shadowBlur=18;
    poly([-64,-18,-43,-60,14,-66,60,-32,71,17,30,63,-30,61,-70,24],
      '#644c58','#ffba87',4);
    poly([-44,-15,-12,-43,28,-23,44,19,8,43,-32,22],
      '#35465b','#ffd6a5',2);
    line(-30,-6,30,20,'#f9d6a0',3);line(12,-40,-3,5,'#ffb77d',2);
   }else{
    const glow=.6+.25*Math.sin(G.time*12+block.y);
    c.globalAlpha=.9;c.shadowColor='#ff6599';c.shadowBlur=23;
    ellipse(0,0,61,61,'#40253b','#ff86a7',4);
    c.globalAlpha=glow;
    for(let j=0;j<5;j++){
     const a=j*TAU/5+G.time*1.5;
     line(Math.cos(a)*42,Math.sin(a)*42,Math.cos(a+1.2)*50,Math.sin(a+1.2)*50,'#ffd6e4',3);
    }
    glowCircle(0,0,16,'#ffd6ec',13);
   }
   c.restore();
  }
  c.globalAlpha=.7;c.strokeStyle='#79ffe2';c.lineWidth=2;c.setLineDash([9,10]);
  const sy=TERRAIN_LANES[t.safeLane];
  c.beginPath();c.moveTo(Math.max(0,t.x-180),sy);c.lineTo(Math.min(W,t.x+130),sy);c.stroke();c.setLineDash([]);
 }
 c.restore();
}

function update(dt){
 // NOVA regenerates one stock per 60 seconds of active combat; max five.
 if(G.pulses<5){G.pulseRecharge+=dt;if(G.pulseRecharge>=60){G.pulseRecharge-=60;G.pulses++;showToast('NOVA +1');updateHud()}}
 else G.pulseRecharge=0;
 G.time+=dt;G.total+=dt;G.scroll+=(120+G.stage*27)*dt;G.stageTime+=dt;G.shake*=Math.pow(.025,dt);screenPulse=Math.max(0,screenPulse-dt*2.1);p.invul=Math.max(0,p.invul-dt);if(G.toastTime>0){G.toastTime-=dt;if(G.toastTime<=0)ui.toast.classList.remove('show')}if(G.announceTime>0){G.announceTime-=dt;if(G.announceTime<=0)ui.announce.classList.remove('show')}if(G.comboTime>0){G.comboTime-=dt;if(G.comboTime<=0)G.combo=0}if(G.overdrive>0)G.overdrive=Math.max(0,G.overdrive-dt);G.squadAttackCooldown=Math.max(0,G.squadAttackCooldown-dt);G.directorGrace=Math.max(0,G.directorGrace-dt);melody(dt);
let dx=(KEY['d']||KEY['arrowright']?1:0)-(KEY['a']||KEY['arrowleft']?1:0)+stickX+gpState.dx,dy=(KEY['s']||KEY['arrowdown']?1:0)-(KEY['w']||KEY['arrowup']?1:0)+stickY+gpState.dy;const speed=(335+G.levels[0]*85)*(KEY['shift']?.5:1);if(dx||dy){const norm=1/Math.max(1,Math.hypot(dx,dy));p.targetX=cl(p.targetX+dx*speed*dt*norm,62,W-135);p.targetY=cl(p.targetY+dy*speed*dt*norm,98,H-111)}else if(!dragging){p.targetX=p.x;p.targetY=p.y}let ox=p.x,oy=p.y;p.x+=(p.targetX-p.x)*Math.min(1,dt*29);p.y+=(p.targetY-p.y)*Math.min(1,dt*29);p.angle=cl((p.y-oy)*.022,-.22,.22);
const motion=cl(Math.hypot(p.x-ox,p.y-oy)/Math.max(dt,.001)/420,0,1);
const visualBlend=1-Math.exp(-dt*12);
p.visualMotion=cl((p.visualMotion||0)*(1-visualBlend)+motion*visualBlend,0,1);
p.hitFlash=Math.max(0,(p.hitFlash||0)-dt);
advanceTerrain(dt);
G.trail.unshift({x:p.x,y:p.y});if(G.trail.length>140)G.trail.length=140;
if(Math.random()>.1)G.particles.push({x:p.x-37,y:p.y+R(-7,7),vx:-R(165,330),vy:R(-30,30),life:R(.15,.4),maxLife:.4,size:R(2,5),color:Math.random()>.4?'#30e6ff':'#ffce77',glow:true});
G.fireTimer-=dt;if(G.fireTimer<=0){playerFire();G.fireTimer=(G.levels[2]>0?.22:.165)*(G.overdrive>0?.59:1)*Math.pow(.88,passiveRank(0))}
G.missileTimer-=dt;if(G.missileTimer<=0){missileFire();G.missileTimer=G.overdrive>0?.7:1.15}
if(!G.boss&&!G.bossDone&&!G.transitioning){spawnElite();spawnRoutePatrol();triggerRouteEvent();const deadline=STAGE_LENGTHS[G.stage];if(G.stageTime>=deadline)spawnBoss();else{G.spawn-=dt;if(G.spawn<=0){G.spawn=spawnWave()?nextWaveDelay():.35}if(Math.floor((G.stageTime-dt)/23)<Math.floor(G.stageTime/23))pickup(W-20,GR(155,525),true)}}
if(!G.boss&&!G.bossDone&&!G.transitioning){
 G.ambientTimer-=dt;
 if(G.ambientTimer<=0){const added=spawnAmbient();G.ambientTimer=added?(.95+gameRandom()*.45):.28}
}
refreshActiveEnemies();
if(G.pendingWave){G.pendingWave.timer-=dt;if(G.pendingWave.timer<=0){const wave=G.pendingWave;G.pendingWave=null;wave.units.forEach((u,i)=>enemy(u.type,u.x,u.y,{...u.extra,squadId:wave.id,squadKind:wave.kind,squadSlot:i,squadSize:wave.units.length,aiHomeY:u.y,aiPhase:wave.phase,aiSafeY:wave.safeY,aiVolleyArmed:true}))}}
if(G.transitioning){
 G.transition-=dt;
 if(G.flowPhase==='reward'&&G.transition<=2.4)chooseReward(flightRewardIndex());
 else if(G.flowPhase==='route'&&G.transition<=0){chooseRoute(flightRouteIndex());return}
 else if(G.flowPhase==='finish'&&G.transition<=0){endGame(true);return}
}
for(let i=G.enemies.length-1;i>=0;i--){const e=G.enemies[i];e.t+=dt;e.hitFlash=Math.max(0,(e.hitFlash||0)-dt);e.recoil=Math.max(0,(e.recoil||0)-dt*48);let vx=(EXTRA?.stats[e.type]?.speed??({scout:190,dart:305,tank:86,turret:76,spinner:157,carrier:100,mine:125,interceptor:98}[e.type]||140))*routeProfile().speed*(1+.20*(e.combatTier||0))*difficultyProfile().speed;e.x-=vx*dt;if(e.type==='interceptor'){if(e.lockY===null&&e.x<1050){e.lockY=cl(p.y,115,H-75);if(Number.isFinite(e.aiSafeY)&&e.x>540)e.lockY=placeOutsideLane(e.lockY,e.aiSafeY,110);e.t=0}if(e.lockY!==null){if(e.t<1){e.x+=vx*dt-43*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*1.15)}else{e.x-=465*dt;e.y+=(e.lockY-e.y)*Math.min(1,dt*5)}}}EXTRA?.advance(e,dt,p,fireEnemy,vx,W,H);if(e.type!=='interceptor')moveEnemyAI(e,dt);
if(e.dodgeTime>0){e.y=cl(e.y+e.dodgeSide*170*dt,110,H-95);e.dodgeTime=Math.max(0,e.dodgeTime-dt);}
if(e.elite){
 e.eliteFire-=dt;
 if(e.eliteWarn>0){
  e.eliteWarn-=dt;
  if(e.eliteWarn<=0&&e.hp>0&&e.x<W-55&&e.x>100){
   const a=Math.atan2(e.eliteAimY-e.y,p.x-(e.x-35));
   for(const side of [-1,1])for(const spread of [.22,.39])bullet(e.x-40,e.y,a+side*spread,205+G.stage*7,5,'#b8a8ff');
   e.eliteFire=2.9;
  }
 }else if(e.eliteFire<=0&&e.x<W-55&&e.x>230){
  e.eliteWarn=.75;e.eliteAimY=cl(p.y,115,H-90);
 }
}
if(e.aiWarn>0){e.aiWarn-=dt;if(e.aiWarn<=0&&e.hp>0&&e.x<W-35&&e.x>100){fireEnemy(e,{x:e.aiAimX,y:e.aiAimY});e.fire=Math.max(e.fire,1.35)}}
if(e.aiWarn<=0&&!terrainApproaching())coordinateVolley(e);
e.fire-=dt;
if(e.aiWarn<=0&&!terrainApproaching()&&e.fire<0&&e.x<W-35&&e.x>80){if(!EXTRA?.trigger(e,p))fireEnemy(e);e.fire=Math.max(.9,(GR(e.type==='turret'?1.15:1.65,e.type==='turret'?1.65:2.65)-G.stage*.065 )*routeProfile().fireInterval*(G.directorGrace>0?1.22:1)*(1-.35*(e.combatTier||0))*difficultyProfile().enemyFire)}if(circleHit(p.x,p.y,18,e.x,e.y,EXTRA?.stats[e.type]?.ship??(e.type==='tank'||e.type==='carrier'?36:21)))hitPlayer(1);if(e.x<-140){G.enemies.splice(i,1);continue}if(e.hp<=0){destroyEnemy(i);continue}}
let b=G.boss;if(b){
refreshBossStrength(b);
const practice=invulnerablePracticeBoss();
if(practice)b.hp=b.maxHp;
b.t+=dt;
// Loop through attack phases every minute in endless dual-invincible practice.
const practiceCycle=practice?b.t%60:0;
if(practice&&practiceCycle<18&&b.phase>0){b.phase=0;b.charge=0;b.beam=0;b.fire=Math.min(1.6,b.fire);G.bullets=[]}
b.x+=(930-b.x)*Math.min(1,dt*1.25);b.y=H/2+Math.sin(b.t*(b.variant==='dinosaur'?.85:1.15))*(b.variant==='octopus'?58:G.stage===2?95:G.stage===7?54:68);
 // 24/36: never fire the first salvo on the frame the boss enters view.
 // A visible muzzle cue precedes the opening attack on every route/variant.
 if(!b.entryReady){
  b.fire=Math.max(b.fire,.82);
  if(b.x<=980)b.entryReady=true;
 }
 if(G.stage===0){const cycle=b.t%5.2;b.weakOpen=cycle>=2.2&&cycle<4.2;b.weakWarn=cycle>=1.55&&cycle<2.2}
 if(G.stage===1){
  const cycle=b.t%(b.variant==='octopus'?5.6:6);
  const openAt=b.variant==='octopus'?2.35:2.65;
  const closeAt=b.variant==='octopus'?4.35:4.65;
  b.weakOpen=cycle>=openAt&&cycle<closeAt;
  b.weakWarn=cycle>=openAt-.65&&cycle<openAt;
 }
 if(G.stage===2){
  const cycle=b.t%(b.variant==='dinosaur'?5.9:6.4);
  const openAt=b.variant==='dinosaur'?2.1:2.4,closeAt=b.variant==='dinosaur'?3.9:4.4;
  b.weakOpen=cycle>=openAt&&cycle<closeAt;
  b.weakWarn=cycle>=openAt-.65&&cycle<openAt;
 }
if(G.stage===7&&b.phase===1&&(practice?practiceCycle>=36:b.hp<=b.maxHp*.32)){
  b.phase=2;b.fire=1.45;G.bullets=[];screenPulse=.38;
  ring(b.x-75,b.y,190,'#ffe4ad',.6);showToast('FINAL PHASE');tone(240,.55,'sawtooth',.075,-170);
 }
 if(!b.phase&&(practice?practiceCycle>=18:b.hp<=b.maxHp*(G.stage===7?.68:.55))){
 b.phase=1;b.fire=1.35;G.bullets=[];screenPulse=.34;
 ring(b.x-75,b.y,192,'#ff94b4',.6);
 emit(b.x-80,b.y,40,'#f7a4aa',240);
 showToast(G.stage===2?(b.variant==='dinosaur'?'IRON TYRANT · RAGE':'ABYSS TITAN · AWAKENED'):'BOSS · SECOND PHASE');if(G.stage===2)ring(b.x-94,b.y,126,'#9de8f6',.35);
 if(!G.debugBossOnly)for(let i=0;i<(G.stage===7?3:2+G.stage);i++)enemy('dart',W+100+i*70,200+i*80);
 tone(280,.55,'sawtooth',.08,-210);
}
if(b.charge>0){b.charge-=dt;if(b.charge<=0){b.beam=.62;screenPulse=.2;tone(105,.4,'sawtooth',.07,-70)}}
if(b.beam>0){b.beam-=dt;if(p.x<b.x-75&&Math.abs(p.y-b.beamY)<27)hitPlayer(1)}
bossMoveStep(b,dt);
 if(b.reactiveShield>0){
  b.reactiveShield=Math.max(0,b.reactiveShield-dt);
  if(b.reactiveShield===0){
   b.reactiveExpose=2.1;ring(b.x-65,b.y,180,'#9bffcd',.45);
   showToast('ARMOR BREAK · CORE EXPOSED');
   tone(460,.2,'triangle',.05,-145);
  }
 }else if(b.reactiveExpose>0)b.reactiveExpose=Math.max(0,b.reactiveExpose-dt);
 b.reactiveCooldown=Math.max(0,(b.reactiveCooldown||0)-dt);
 if(b.reactiveStrike>0){
  b.reactiveStrike-=dt;
  if(b.reactiveStrike<=0&&G.bullets.length<=96&&p.hp/Math.max(1,p.maxHp)>.25){
   const yy=cl(b.reactiveTargetY,115,H-90);
   for(const offset of [-.27,0,.27]){
    const aa=Math.atan2(yy-b.y,p.x-(b.x-118))+offset;
    bullet(b.x-118,b.y,aa,235+G.stage*7,5.4,'#b1d4ff');
   }
  }
 }
 b.fire-=dt*(practice?1.25:1.22*difficultyProfile().bossTempo);if(b.fire<=0)bossAttack(b);
if(circleHit(p.x,p.y,19,b.x-80,b.y,75))hitPlayer(1);
if(!practice&&b.hp<=0){explosion(b.x-60,b.y,170);wreckFragments({x:b.x-60,y:b.y,type:'boss',phase:b.t});emit(b.x,b.y,180,'#ffe3a6',800);addScore(12000*(G.stage+1));stageClear()}
}
for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.px=s.x;s.py=s.y;s.life-=dt;if(s.kind==='drone')steerDrone(s,dt);if(s.kind==='missile'){let target=G.boss||G.enemies.filter(e=>e.x>s.x-30).sort((a,b)=>len(a.x-s.x,a.y-s.y)-len(b.x-s.x,b.y-s.y))[0];if(target){const a=Math.atan2(target.y-s.y,target.x-s.x);s.vx+=(Math.cos(a)*550-s.vx)*Math.min(1,dt*2.9);s.vy+=(Math.sin(a)*550-s.vy)*Math.min(1,dt*2.9)}else{s.vx+=(650-s.vx)*dt;s.vy*=.96}if(Math.random()>.25)G.particles.push({x:s.x-7,y:s.y,vx:-90,vy:R(-25,25),life:.3,maxLife:.3,size:3,color:'#ffbd6e',glow:true})}s.x+=s.vx*dt;s.y+=s.vy*dt;
let gone=false;for(let j=G.enemies.length-1;j>=0;j--){const e=G.enemies[j],rad=EXTRA?.stats[e.type]?.shot??(e.type==='tank'||e.type==='carrier'?39:23);if(e.x<=W-40&&circleHit(s.x,s.y,s.kind==='laser'?8:5,e.x,e.y,rad)&&projectileFirstHit(s,e)){damageEnemy(e,s.dmg);e.hitFlash=.14;e.recoil=Math.min(8,(e.recoil||0)+Math.min(4,s.dmg*.12));applyShotSynergy(s,e);emit(s.x,s.y,3,'#8edfff',72);s.pierce--;if(e.hp<=0)destroyEnemy(j);if(s.pierce<=0){gone=true;break}}}
if(!gone&&G.terrain?.phase==='active'&&(G.terrain.type==='wreck'||G.terrain.type==='ice'||G.terrain.type==='rune'||G.terrain.type==='membrane'||G.terrain.type==='prism'))for(const block of G.terrain.blocks){if(block.hp>0&&circleHit(s.x,s.y,s.kind==='laser'?8:5,G.terrain.x,block.y,58)){block.hp-=s.dmg;emit(s.x,s.y,3,'#ffca81',60);s.pierce--;if(block.hp<=0){explosion(G.terrain.x,block.y,42);addScore(250)}if(s.pierce<=0){gone=true;break}}}
if(!gone&&G.boss&&circleHit(s.x,s.y,7,G.boss.x-53,G.boss.y,G.stage>=2?110:100)&&projectileFirstHit(s,G.boss)){
 const b=G.boss;
 const weak=b.weakOpen&&(
  (G.stage===0&&circleHit(s.x,s.y,7,b.x+20,b.y,28))||
  (G.stage===1&&circleHit(s.x,s.y,7,b.x+(b.variant==='octopus'?-39:-20),b.y,34))||
  (G.stage===2&&circleHit(s.x,s.y,7,b.x+(b.variant==='dinosaur'?-137:-35),b.y+(b.variant==='dinosaur'?-56:0),b.variant==='dinosaur'?26:32))
 );
 damageBoss(b,s.dmg*(weak?(G.stage===0?1.65:G.stage===2?(b.variant==='dinosaur'?1.55:1.6):1.5):1));
 applyShotSynergy(s,b);emit(s.x,s.y,ri(2,4),weak?'#9ffff1':'#ffca82',95);
 s.pierce--;if(s.pierce<=0)gone=true
}
if(gone||s.x>W+160||s.y<-80||s.y>H+100||s.life<=0)G.shots.splice(i,1)}
for(let i=G.bullets.length-1;i>=0;i--){const a=G.bullets[i];a.px=a.x;a.py=a.y;if(a.curve){const q=a.curve*dt,co=Math.cos(q),si=Math.sin(q),vx=a.vx;
 a.vx=vx*co-a.vy*si;a.vy=vx*si+a.vy*co;}a.x+=a.vx*dt;a.y+=a.vy*dt;a.life-=dt*(terrainApproaching()?2.2:1);if(circleHit(a.x,a.y,a.size,p.x,p.y,16)){hitPlayer(a.damage);ring(a.x,a.y,27,'#ffc391',.3);G.bullets.splice(i,1);continue}if(!a.grazed&&p.invul<=0&&circleHit(a.x,a.y,a.size,p.x,p.y,53)){a.grazed=true;G.grazes++;if(G.grazes>=20)unlockMedal('graze');G.score+=60;chargeDrive(5);emit(a.x,a.y,2,'#f8e9a5',40);if(G.grazes%10===0)showToast('GRAZE BONUS × '+G.grazes)}if(a.x<-35||a.x>W+35||a.y<-35||a.y>H+35||a.life<=0)G.bullets.splice(i,1)}
for(let i=G.pickups.length-1;i>=0;i--){const q=G.pickups[i];q.t+=dt;q.x+=q.vx*dt;q.y+=Math.sin(q.t*2+q.phase)*17*dt;if(len(q.x-p.x,q.y-p.y)<pickupMagnetRadius()){const a=Math.atan2(p.y-q.y,p.x-q.x);q.x+=Math.cos(a)*pickupPullSpeed()*dt;q.y+=Math.sin(a)*pickupPullSpeed()*dt}if(circleHit(q.x,q.y,19,p.x,p.y,22)){if(q.type==='elite'){G.pulses=Math.min(5,G.pulses+1);showToast('RARE · NOVA +1')}else if(q.type==='pulse'){G.pulses=Math.min(5,G.pulses+1);showToast('NOVA +1')}else{advancePowerMeter(1);TROPHIES.event('capsules',1);showToast('POWER '+G.energy+'/6')}emit(q.x,q.y,15,'#fffba6',155);tone(510,.15,'triangle',.055,380);G.pickups.splice(i,1)}else if(q.x<-40)G.pickups.splice(i,1)}
for(let i=G.particles.length-1;i>=0;i--){const q=G.particles[i];q.life-=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vx*=Math.pow(.12,dt);q.vy*=Math.pow(.16,dt);if(q.kind==='shard')q.rot+=q.spin*dt;if(q.life<=0)G.particles.splice(i,1)}if(G.particles.length>620)G.particles.splice(0,G.particles.length-620);
for(let i=G.rings.length-1;i>=0;i--){const r=G.rings[i];r.t+=dt;r.r=r.max*(r.t/r.life);if(r.t>=r.life)G.rings.splice(i,1)}
TROPHIES.observe(dt,{score:G.score,grazes:G.grazes,maxCombo:G.maxCombo});G.uiTime-=dt;if(G.uiTime<=0){updateHud();G.uiTime=.11}}
function destroyEnemy(i){const e=G.enemies[i];if(!e)return;addScore(e.score);if(e.routeCaptain)chargeDrive(e.routeRisk?16:8);G.killCount++;grantShipXP(e.elite?34:e.type==='tank'||e.type==='carrier'?24:EXTRA?.contains(e.type)?19:12);TROPHIES.event('kills',1);if(e.elite)TROPHIES.event('elites',1);if(e.type==='carrier')TROPHIES.event('carrierKills',1);chargeDrive(e.type==='tank'||e.type==='carrier'?13:6);explosion(e.x,e.y,e.type==='tank'||e.type==='carrier'?46:21);wreckFragments(e);if(e.elite){if(mixSeed(G.runSeed,G.stage,G.routeRisk+93)%100<32){G.pickups.push({x:e.x,y:e.y,vx:-50,phase:0,t:0,type:'elite'});showToast('RARE · NOVA CACHE')}else chargeDrive(16)}else if(e.eventDrop)pickup(e.x,e.y,true);else if(!e.noLoot&&gameRandom()<(e.type==='carrier'?.40:salvageRate()))pickup(e.x,e.y,gameRandom()>.08);G.enemies.splice(i,1)}
function poly(points,fill,stroke,width=1){c.beginPath();c.moveTo(points[0],points[1]);for(let i=2;i<points.length;i+=2)c.lineTo(points[i],points[i+1]);c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function glowCircle(x,y,r,col,blur=16){c.save();c.shadowColor=col;c.shadowBlur=blur;c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.restore()}
function ellipse(x,y,rx,ry,fill,stroke,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke()}}
function line(x,y,x2,y2,color,w=1){c.strokeStyle=color;c.lineWidth=w;c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.stroke()}

/* Three low-overdraw parallax planes. Cached by run seed, stage and route:
   background decoration never consumes combat RNG or creates new textures. */
const DEPTH_TINTS=[
 ['#74b8d6','#9ab3ed'],['#83c5d5','#e1a1bd'],['#78bdcb','#d28ab5'],
 ['#d6a077','#e5a58a'],['#9bc9e0','#a9b8dc'],['#92c9b1','#c2a3dc'],
 ['#8bd4cf','#b89adf'],['#dbc596','#b6a0e5']
];
const DEPTH_SPEEDS=[.09,.32,.88];
let depthCache={key:'',value:null};
function depthField(){
 const key=[G.runSeed>>>0,G.stage,G.routeRisk].join(':');
 if(depthCache.key===key)return depthCache.value;
 let state=((G.runSeed>>>0)^Math.imul(G.stage+1,0x9e3779b9)^(G.routeRisk?0x85ebca6b:0x27d4eb2f))>>>0;
 if(!state)state=0x6d2b79f5;
 const random=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return (state>>>0)/4294967296};
 const layers=DEPTH_SPEEDS.map((speed,index)=>{
  const nodes=[],count=[12,10,8][index],span=W+360;
  for(let i=0;i<count;i++){
   const y=index===2?(i%2?H-24-random()*49:24+random()*49):54+random()*(H-108);
   nodes.push({x:random()*span,y,size:(index===0?20:index===1?14:28)+random()*(index===2?45:30),
    opacity:(index===0?.065:index===1?.085:.07)+random()*.055,angle:random()*TAU});
  }
  return {speed,span,nodes};
 });
 depthCache={key,value:{key,tint:DEPTH_TINTS[G.stage]??DEPTH_TINTS[0],layers}};
 return depthCache.value;
}
function depthX(node,layer,scroll=G.scroll){
 return ((node.x-scroll*layer.speed)%layer.span+layer.span)%layer.span-180;
}
function drawDepthPlane(index){
 const field=depthField(),layer=field.layers[index],tint=field.tint[G.routeRisk?1:0];
 c.save();c.strokeStyle=index===0?'#a5c5e1':tint;c.fillStyle=tint;
 for(const node of layer.nodes){
  const x=depthX(node,layer),y=node.y,s=node.size;
  if(x<-s*2||x>W+s*2)continue;
  c.globalAlpha=node.opacity;c.lineWidth=index===0?1.1:index===1?1.4:1.2;
  c.beginPath();
  if(index===0){
   // Distant wisps: almost stationary, behind the starfield.
   c.moveTo(x-s,y+s*.16);c.bezierCurveTo(x-s*.4,y-s*.32,x+s*.35,y+s*.3,x+s,y-s*.12);c.stroke();
  }else if(index===1){
   // Mid-depth crystalline wreck fragments; no collision or pickup cue.
   c.moveTo(x-s*.6,y);c.lineTo(x-s*.14,y-s*.48);c.lineTo(x+s*.63,y-s*.2);
   c.lineTo(x+s*.44,y+s*.32);c.lineTo(x-s*.27,y+s*.48);c.closePath();c.fill();c.stroke();
  }else{
   // Fast near-plane motion only at top/bottom edges: never cover the ship.
   c.moveTo(x-s,y);c.lineTo(x+s*.7,y+Math.sin(node.angle)*4);c.stroke();
   c.moveTo(x-s*.45,y+4);c.lineTo(x+s,y+5);c.stroke();
  }
 }
 c.restore();
}

/* 26/36 — route-specific nebula installations and ruins. Procedural original
   vector artwork, cached per seed/stage/route; no combat RNG, no collisions. */
const ROUTE_ART=[
 [['relay','#69dce9','#245d77'],['wreck','#bd9cff','#45305d']],
 [['dock','#77e9db','#2a5860'],['fortress','#ffac91','#62374b']],
 [['reef','#6ce8cf','#2b6461'],['spires','#f59ac9','#5c365d']],
 [['foundry','#ffc77b','#694237'],['solar','#ff8c73','#743849']],
 [['cargo','#a8f3ff','#365b73'],['icefall','#e0e8ff','#3c5072']],
 [['archive','#a4f3c9','#3a6657'],['obelisk','#dbabf3','#4c3a6d']],
 [['phase','#83f9e6','#325e75'],['rift','#d4a0ff','#533b76']],
 [['beacon','#ffe3a4','#71604a'],['orbit','#c6a8ff','#51426c']]
];
const ROUTE_PATHS={
 relay:[[-48,0,48,0],[0,-47,0,47],[-32,-32,32,32],[-32,32,32,-32]],
 wreck:[[-60,-20,-18,-38,10,-8,49,-30,24,22,-16,10,-50,36],[-18,-38,-25,13,24,22]],
 dock:[[-57,-22,57,-22,57,22,-57,22,-57,-22],[-32,-37,32,-37,32,37,-32,37,-32,-37],[-16,-22,-16,22],[16,-22,16,22]],
 fortress:[[-56,31,-47,-19,-20,-19,0,-54,20,-19,47,-19,56,31,-56,31],[-40,0,40,0],[0,-19,0,31]],
 reef:[[-52,22,-32,-33,-14,4,0,-53,20,6,38,-33,54,22],[-40,22,40,22]],
 spires:[[-57,33,-40,-30,-25,33],[-30,33,-7,-53,13,33],[7,33,30,-38,54,33]],
 foundry:[[-46,34,-46,-28,46,-28,46,34,-46,34],[-27,-28,-27,-52,-12,-52,-12,-28],[17,-28,17,-58,34,-58,34,-28],[-34,5,34,5]],
 solar:[[-50,0,-33,0],[33,0,50,0],[0,-50,0,-33],[0,33,0,50],[-37,-37,-24,-24],[24,24,37,37],[-37,37,-24,24],[24,-24,37,-37]],
 cargo:[[-54,-24,-17,-24,-17,24,-54,24,-54,-24],[-14,-36,24,-36,24,12,-14,12,-14,-36],[27,-12,58,-12,58,34,27,34,27,-12]],
 icefall:[[-59,-34,-21,-7,-39,20,3,42,24,6,59,-27],[-20,-52,0,-20,27,-41],[3,42,35,55]],
 archive:[[-57,33,57,33],[-49,-25,-49,33],[-28,-25,-28,33],[-10,-25,-10,33],[10,-25,10,33],[28,-25,28,33],[49,-25,49,33],[-57,-25,0,-57,57,-25]],
 obelisk:[[0,-58,49,0,0,58,-49,0,0,-58],[-23,-23,23,-23,23,23,-23,23,-23,-23],[-23,-23,23,23],[23,-23,-23,23]],
 phase:[[-57,-19,-30,-44,3,-6,34,-35,57,-9],[-57,19,-30,44,3,6,34,35,57,9]],
 rift:[[-50,-51,-18,-19,-36,2,7,18,-12,51,51,11],[-36,2,-56,30],[7,18,39,50]],
 beacon:[[-33,39,-14,-28,14,-28,33,39,-33,39],[-25,-40,25,-40,25,-28,-25,-28,-25,-40],[-48,-48,48,-48],[-33,-58,33,-58]],
 orbit:[[-55,0,-28,-18,0,-7,28,-18,55,0],[55,0,28,18,0,7,-28,18,-55,0]]
};
let routeArtCache={key:'',value:null};
function routeArtField(){
 const key=[G.runSeed>>>0,G.stage,G.routeRisk].join(':');
 if(routeArtCache.key===key)return routeArtCache.value;
 let state=mixSeed(G.runSeed>>>0,G.stage+37,G.routeRisk+23)||0x6d2b79f5;
 const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296};
 const [motif,ink,fill]=ROUTE_ART[G.stage]?.[G.routeRisk?1:0]||ROUTE_ART[0][0];
 const layers=[0,1].map(k=>({speed:k?.43:.13,span:W+460,nodes:Array.from({length:k?7:5},(_,i)=>({
  x:rand()*(W+460),y:(i%2?H-92:92)+(rand()-.5)*66,
  size:(k?59:41)+rand()*(k?32:26),angle:(rand()-.5)*.19,
  alpha:(k?.29:.18)+rand()*.06
 }))}));
 const haze={x:rand()*(W+360),y:rand()>.5?H*.73:H*.27,radius:230+rand()*90};
 return(routeArtCache={key,value:{key,motif,ink,fill,layers,haze}}).value;
}
/* 33/36: bounded seed-specific gradient cache. */
const routeHazeGradients=new Map();
function drawRouteArt(pass){
 const f=routeArtField(),layer=f.layers[pass],paths=ROUTE_PATHS[f.motif];
 c.save();c.strokeStyle=f.ink;c.fillStyle=f.fill;c.lineWidth=2.4;
 if(pass===0){
  // One route-colored, slow-moving nebula per frame, behind stars and bullets.
  const h=f.haze,x=((h.x-G.scroll*.07)%(W+360)+W+360)%(W+360)-180;
  let glow=routeHazeGradients.get(f.key);
  if(!glow){glow=c.createRadialGradient(0,h.y,0,0,h.y,h.radius);
   glow.addColorStop(0,f.ink+'27');glow.addColorStop(.58,f.ink+'0c');glow.addColorStop(1,f.ink+'00');
   if(routeHazeGradients.size>=12)routeHazeGradients.clear();routeHazeGradients.set(f.key,glow);
  }
  c.save();c.translate(x,0);c.fillStyle=glow;c.fillRect(-h.radius,h.y-h.radius,h.radius*2,h.radius*2);c.restore();
  c.fillStyle=f.fill;
 }
 const roundMotif=f.motif==='relay'||f.motif==='reef'||f.motif==='solar'||f.motif==='orbit'||f.motif==='phase';
 for(const node of layer.nodes){
  const x=((node.x-G.scroll*layer.speed)%layer.span+layer.span)%layer.span-230;
  if(x<-130||x>W+130)continue;
  c.save();c.translate(x,node.y);c.rotate(node.angle);c.scale(node.size/65,node.size/65);
  c.globalAlpha=node.alpha;
  for(const path of paths){
   c.beginPath();c.moveTo(path[0],path[1]);
   for(let j=2;j<path.length;j+=2)c.lineTo(path[j],path[j+1]);
   if(path.length>=8&&path[0]===path[path.length-2]&&path[1]===path[path.length-1]){
    c.globalAlpha=node.alpha*.42;c.fill();c.globalAlpha=node.alpha;
   }
   c.stroke();
  }
  // Orbital structures are distinct from the rectilinear docks and ruins.
  if(roundMotif){
   c.beginPath();c.ellipse(0,0,f.motif==='orbit'?52:30,
    f.motif==='phase'?22:32,f.motif==='orbit'?.55:0,0,TAU);c.stroke();
  }
  c.globalAlpha=node.alpha*.8;c.fillStyle=f.ink;
  c.beginPath();c.arc(0,0,f.motif==='orbit'?10:4,0,TAU);c.fill();
  c.restore();
 }
 c.restore();
}
/* 33/36: reuse stage/route Canvas gradients across frames. */
let backgroundGradientCache={key:'',grad:null},nebulaGradientCache={key:'',gradients:[]},edgeGradientCache=null;
function drawBackground(dt){const stage=G.stage,gradientKey=stage+':'+(G.routeRisk?1:0);
let grad=backgroundGradientCache.grad;if(backgroundGradientCache.key!==gradientKey){grad=c.createLinearGradient(0,0,0,H);if(stage===0){grad.addColorStop(0,'#070e27');grad.addColorStop(.53,'#102b48');grad.addColorStop(1,'#080e23')}else if(stage===1){grad.addColorStop(0,G.routeRisk?'#301523':'#0b2638');grad.addColorStop(.5,G.routeRisk?'#4c3040':'#1a4b60');grad.addColorStop(1,G.routeRisk?'#1c0f20':'#081a2d')}else if(stage===2){grad.addColorStop(0,G.routeRisk?'#3b101e':'#190d32');grad.addColorStop(.5,G.routeRisk?'#4a2735':'#12475a');grad.addColorStop(1,G.routeRisk?'#220f25':'#081c33')}else if(stage===3){grad.addColorStop(0,'#35131f');grad.addColorStop(.5,G.routeRisk?'#863120':'#7a3e24');grad.addColorStop(1,'#240e17')}else if(stage===4){grad.addColorStop(0,'#091f37');grad.addColorStop(.5,G.routeRisk?'#25455e':'#1b5b76');grad.addColorStop(1,'#071b35')}else if(stage===5){grad.addColorStop(0,G.routeRisk?'#241332':'#0a2427');grad.addColorStop(.5,G.routeRisk?'#40305b':'#285047');grad.addColorStop(1,G.routeRisk?'#150d29':'#071d22')}else if(stage===7){grad.addColorStop(0,G.routeRisk?'#180b31':'#141d30');grad.addColorStop(.5,G.routeRisk?'#4c225c':'#5c493d');grad.addColorStop(1,G.routeRisk?'#080b1e':'#171e2b')}else{grad.addColorStop(0,G.routeRisk?'#240d43':'#062f3a');grad.addColorStop(.5,G.routeRisk?'#4a2265':'#19646a');grad.addColorStop(1,G.routeRisk?'#0a1032':'#061b32')}backgroundGradientCache={key:gradientKey,grad};}c.fillStyle=grad;c.fillRect(0,0,W,H);
if(nebulaGradientCache.key!==gradientKey)nebulaGradientCache={key:gradientKey,gradients:[]};
const neb=[[320,270,350,'#1b688a'],[850,385,260,'#524283'],[1150,170,370,'#145e83']];for(let i=0;i<3;i++){const ar=neb[i],x=((ar[0]-G.scroll*(.08+i*.05))%(W+750)+W+750)%(W+750)-250;let g=nebulaGradientCache.gradients[i];if(!g){g=c.createRadialGradient(0,ar[1],10,0,ar[1],ar[2]);let color=stage===0?ar[3]:stage===1?['#4c375f','#784d3c','#1c5673'][i]:stage===2?['#943679','#1e8b9b','#723681'][i]:stage===3?['#ee8037','#c43942','#ffc059'][i]:stage===4?['#b5e8ff','#4e8fb6','#d7faff'][i]:stage===5?(G.routeRisk?['#8853c4','#4d397c','#bd8fcf']:['#79d8a9','#5b9b91','#d1c387'])[i]:stage===7?(G.routeRisk?['#ac59c9','#743d8b','#d18edc']:['#d5b56d','#9d7c63','#ffdaa2'])[i]:(G.routeRisk?['#a44ed6','#5d3eb3','#b56bff']:['#54b6bb','#57d7b4','#82e9f3'])[i];g.addColorStop(0,color+'99');g.addColorStop(.45,color+'44');g.addColorStop(1,color+'00');nebulaGradientCache.gradients[i]=g;}c.save();c.translate(x,0);c.fillStyle=g;c.fillRect(-ar[2],ar[1]-ar[2],ar[2]*2,ar[2]*2);c.restore()}
drawDepthPlane(0);
drawRouteArt(0);
for(const s of G.stars){let x=((s.x-G.scroll*s.z*.22)%(W+20)+W+20)%(W+20),y=s.y,a=.38+Math.sin(G.time*.8+s.tw)*.22+s.z*.11;c.globalAlpha=cl(a,0,1);c.fillStyle=s.z>1.9?'#d8faff':'#8babc6';c.fillRect(x,y,s.size*s.z*.75,s.size*s.z*.75);if(s.z>1.6)line(x+1,y,x+2+G.scroll%7*s.z,y,'#9cd9f0',.5)}c.globalAlpha=1;
drawDepthPlane(1);
drawRouteArt(1);
if(stage===0){for(let i=0;i<13;i++){const x=((i*232-G.scroll*.6)%(W+300)+W+300)%(W+300)-120,y=100+((i*181)%520),r=14+(i*29)%65;c.save();c.translate(x,y);c.rotate(i*1.2+G.time*.03);poly([-r,0,-r*.75,-r*.65,r*.22,-r*.9,r*.9,-r*.28,r*.72,r*.7,-r*.2,r],i%2?'#172c42':'#1e394f','#315169',1.2);poly([-r*.35,-r*.2,-r*.1,-r*.46,r*.32,-r*.29,r*.4,-r*.08,r*.15,r*.13],'#35546a55');c.restore()}}
if(stage===1){for(let i=0;i<10;i++){const x=((i*235-G.scroll*.74)%(W+320)+W+320)%(W+320)-160;for(let side of [-1,1]){c.save();c.translate(x,side===-1?0:H);c.scale(1,side===-1?1:-1);poly([-130,0,136,0,108,40,95,88,-100,87], '#243045','#607286',2);c.fillStyle='#111c2b';c.fillRect(-102,24,180,37);for(let j=0;j<5;j++){c.fillStyle=(i+j)%2?'#6c798c':'#bf7d5c';c.fillRect(-92+j*35,29,13,6)}line(-106,89,106,89,'#d98959',2);c.restore()}}}
if(stage===2){for(let i=0;i<9;i++){let x=((i*196-G.scroll*.65)%(W+320)+W+320)%(W+320)-140;for(let side of [-1,1]){c.save();c.translate(x,side===-1?0:H);c.scale(1,side===-1?1:-1);c.fillStyle='#361e43';c.beginPath();c.moveTo(-120,0);c.lineTo(120,0);c.bezierCurveTo(80,110,30,78,-25,115);c.bezierCurveTo(-55,72,-100,80,-120,0);c.fill();c.strokeStyle='#a64d8277';c.lineWidth=4;c.stroke();for(let j=0;j<5;j++)glowCircle(-82+j*43,27+Math.sin(j*2+i)*23,4,'#dd60c4',10);c.restore()}}}
if(stage===3){for(let i=0;i<10;i++){const x=((i*231-G.scroll*.58)%(W+340)+W+340)%(W+340)-120;
  for(const side of [-1,1]){c.save();c.translate(x,side<0?0:H);c.scale(1,side<0?1:-1);
  poly([-90,0,95,0,66,91+i%3*17,-47,111+i%4*16],'#572b33','#c06a53',2);c.restore()}}}
if(stage===4){for(let i=0;i<13;i++){
 const x=((i*177-G.scroll*(i%2?.67:.42))%(W+320)+W+320)%(W+320)-130;
 const y=70+(i*113)%540,r=15+(i*23)%48;
 c.save();c.translate(x,y);c.rotate(i*.8+G.time*.025);
 poly([-r,0,-r*.4,-r*.7,r*.3,-r*.95,r,.1,r*.25,r*.75],i%2?'#1b5c80':'#2d7594','#a9eaff',1.6);
 line(-r*.25,-r*.45,r*.2,r*.43,'#c7f6ff',1.5);c.restore();
}}
if(stage===5)for(let i=0;i<11;i++){
  const x=((i*194-G.scroll*(i%2?.57:.31))%(W+360)+W+360)%(W+360)-160,y=62+(i*137)%535,r=26+i%4*13;
  c.save();c.translate(x,y);c.rotate(i*.18);c.globalAlpha=.8;
  poly([-r,-r,r,-r,r,r,-r,r],G.routeRisk?'#463b6d':'#315c56',G.routeRisk?'#a78bd5':'#9bc9ad',2);c.restore();
 }
 if(stage===7)for(let i=0;i<13;i++){
   const x=((i*233-G.scroll*(i%2?.31:.57))%(W+450)+W+450)%(W+450)-200;
   const y=65+(i*113)%535,r=24+(i%4)*13;
   c.save();c.translate(x,y);c.rotate(G.time*.035+i*.4);c.globalAlpha=.63;
   c.strokeStyle=G.routeRisk?'#b990ff':'#f8d99b';c.lineWidth=2;
   c.beginPath();c.ellipse(0,0,r*1.7,r*.7,0,0,TAU);c.stroke();
   line(-r*.9,0,r*.9,0,G.routeRisk?'#b47ddc':'#ffdfb3',1.5);c.restore();
  }
 if(stage===6)for(let i=0;i<12;i++){
  const x=((i*184-G.scroll*(i%2?.36:.65))%(W+420)+W+420)%(W+420)-190;
  const y=75+(i*139)%530,r=22+i%5*11;
  c.save();c.translate(x,y);c.rotate(G.time*.045+i*1.2);
  c.globalAlpha=.65;c.strokeStyle=G.routeRisk?'#b98bff':'#8ce9e1';c.lineWidth=2.5;
  c.beginPath();c.ellipse(0,0,r,r*.64,0,0,TAU);c.stroke();
  for(let j=0;j<4;j++){const a=j*TAU/4;
   line(Math.cos(a)*r*.6,Math.sin(a)*r*.35,Math.cos(a+1)*r,Math.sin(a+1)*r*.7,c.strokeStyle,1)}
  c.restore();
 }
 drawDepthPlane(2);
 c.globalAlpha=.13;c.fillStyle='#9dc8e3';for(let y=0;y<H;y+=5)c.fillRect(0,y,W,.55);c.globalAlpha=1;
if(!edgeGradientCache){const outer=c.createLinearGradient(0,0,W,0);outer.addColorStop(0,'#00000033');outer.addColorStop(.5,'#00000000');outer.addColorStop(1,'#00000033');edgeGradientCache=outer;}c.fillStyle=edgeGradientCache;c.fillRect(0,0,W,H)}
function drawShip(x,y,angle=0,invul=0){c.save();if(invul>0)c.globalAlpha=.66+.24*(.5+.5*Math.sin(G.time*17));c.translate(x,y);c.rotate(angle);
const visualMotion=G.mode==='playing'||G.mode==='paused'?cl(p.visualMotion||0,0,1):0;
const flame=22+Math.sin(G.time*34)*11+visualMotion*16+(G.overdrive>0?12:0);
const thrust=c.createLinearGradient(-flame-40,0,-22,0);thrust.addColorStop(0,'#00a5ff00');thrust.addColorStop(.75,'#56cfffad');thrust.addColorStop(1,'#c9faff');poly([-36,-7,-36-flame,0,-36,7],thrust);glowCircle(-31,0,7,'#5ef5ff',17);line(-34,-9,-34-flame*.55,-12,'#6bd9ff',1.5);line(-34,9,-34-flame*.55,12,'#6bd9ff',1.5);
poly([-33,-17,-2,-22,32,-7,50,0,32,7,-2,22,-33,17,-22,0],'#93c9e5','#d9faff',2.2);
poly([-12,-13,6,-30,21,-31,13,-8],'#2d9cc9','#72efff',1.5);poly([-12,13,6,30,21,31,13,8],'#2d9cc9','#72efff',1.5);
poly([-25,-7,8,-9,34,0,8,9,-25,7],'#173c64','#79e5fd',1.5);
poly([-5,-8,21,-5,27,0,21,5,-5,8],'#91ebff','#eafaff',1.2);
poly([28,-8,50,0,28,8,33,0],'#e6ffff');glowCircle(5,0,4,MEDALS.find(m=>m.id===medalState.active)?.color||'#43dfff',12);
line(-25,-18,-7,-18,'#dafaff',1);line(-25,18,-7,18,'#dafaff',1);
if((G.mode==='playing'||G.mode==='paused')&&p.hp/p.maxHp<=.25){line(-21,-7,-5,-12,'#eeb48d',1.5);line(1,11,18,7,'#eeb48d',1.5)}
if((G.mode==='playing'||G.mode==='paused')&&p.hitFlash>0){c.save();c.globalAlpha=cl(p.hitFlash/.22,0,1)*.78;line(-28,-14,22,-8,'#ff9d75',3);line(-28,14,22,8,'#ff9d75',3);c.restore()}
if(p.shield>0){c.save();c.globalAlpha=.55+.14*Math.sin(G.time*8);c.strokeStyle='#70f9ff';c.lineWidth=2.5;c.shadowColor='#4aeaff';c.shadowBlur=22;c.beginPath();c.arc(0,0,43,0,TAU);c.stroke();for(let i=0;i<6;i++){const a=i*TAU/6+G.time*.4;line(Math.cos(a)*41,Math.sin(a)*41,Math.cos(a+.18)*43,Math.sin(a+.18)*43,'#c5fdff',2)}c.restore()}
c.restore()}
function drawDrone(x,y,i){c.save();c.translate(x,y);c.rotate(Math.sin(G.time*2+i)*.08);poly([-19,0,-4,-13,14,-7,24,0,14,7,-4,13],'#2e709e','#8bdeff',1.6);poly([-11,-5,12,0,-11,5],'#b6efff');glowCircle(10,0,3,'#3cebff',10);glowCircle(-13,0,3,'#ffa85b',8);c.restore()}
function drawEnemyImpact(e){
 if(!(e.hitFlash>0))return;
 c.save();c.globalAlpha=cl(e.hitFlash/.14,0,1)*.7;
 c.strokeStyle='#fff0d8';c.lineWidth=2.4;c.beginPath();
 const r=Math.min(53,waveRadius(e.type)+8);
 c.ellipse(-5,0,r,r*.72,0,-.75,.75);c.stroke();c.restore();
}
function drawEnemy(e){const {x,y,type,t}=e;c.save();c.translate(x+(e.recoil||0),y);
if((e.armor||0)>0){c.save();c.globalAlpha=.35+.4*Math.min(1,e.armor/Math.max(1,e.armorMax));
 c.strokeStyle='#a0dcff';c.lineWidth=3;c.beginPath();
 c.ellipse(0,0,waveRadius(e.type)*.95,waveRadius(e.type)*.72,0,-2.4,2.4);c.stroke();c.restore();}
if(type==='tank'||type==='carrier'||type==='turret')c.rotate(Math.sin((t||0)*2.4+(e.phase||0))*.018);
if(EXTRA?.draw(e,c,{poly,ellipse,line,glowCircle})){drawEnemyImpact(e);c.restore();return}if(type==='interceptor'){c.rotate(Math.sin(t*7)*.06);poly([-40,-13,-8,-24,41,0,-8,24,-40,13,-22,0],'#5e4553','#ffb87d',2);poly([-10,-17,14,-29,14,-7],'#a85e65','#ffe1a9',1.5);poly([-10,17,14,29,14,7],'#a85e65','#ffe1a9',1.5);poly([-25,-7,35,0,-25,7],'#2d4058','#ffe4be',1.3);glowCircle(-26,0,6,'#ff9a51',13)}else if(type==='scout'||type==='dart'){c.rotate(Math.sin(t*4+e.phase)*.14);const d=type==='dart'?1.3:1;poly([-30*d,0,-2*d,-15*d,19*d,-18*d,7*d,0,19*d,18*d,-2*d,15*d],'#6c334e','#ff7083',2);poly([-17*d,-3*d,12*d,-5*d,33*d,0,12*d,5*d,-17*d,3*d],'#ac5570','#f7b4be',1);glowCircle(-17*d,0,5,'#ffb26b',12)}else if(type==='tank'||type==='carrier'){const r=type==='tank'?1:1.25;c.scale(r,r);poly([-37,-23,-15,-34,36,-28,48,0,36,28,-15,34,-37,23,-24,0],'#573846','#e29573',2);poly([-37,-16,25,-23,32,0,25,23,-37,16],'#28374d','#a9acbc',1.5);poly([-12,-19,16,-18,29,0,16,18,-12,19],'#905868','#ffb483',1.4);glowCircle(-4,0,12,'#ff9377',18);line(-12,-34,30,-27,'#c2d2e4',3);line(-12,34,30,27,'#c2d2e4',3)}else if(type==='turret'){poly([-28,-26,20,-22,31,0,20,22,-28,26],'#544466','#ff9a8c',2);ellipse(0,0,19,19,'#263c57','#d6abb4',2);poly([-35,-8,-49,-6,-49,6,-35,8],'#fd7685');glowCircle(0,0,7,'#ff7093',17)}else if(type==='spinner'){c.rotate(t*2);for(let k=0;k<4;k++){c.save();c.rotate(k*TAU/4);poly([-8,-8,7,-9,29,-27,21,8],'#9a4776','#ff8ba0',1.2);c.restore()}glowCircle(0,0,12,'#ffc17b',17)}else{c.rotate(t*.5);poly([-19,-16,2,-28,27,-8,23,20,-5,27,-28,10],'#594061','#ff957f',1.4);glowCircle(0,0,5,'#ff6f83',11)}if(e.routeCaptain){c.save();c.globalAlpha=.78;ellipse(0,0,51,40,'#00000000',e.routeRisk?'#eea0d8':'#8ee9ff',2);glowCircle(-36,0,6,e.routeRisk?'#f8c3e7':'#c5f8ff',7);c.restore()}if(e.elite){c.save();c.globalAlpha=.75;ellipse(0,0,56,46,'#242a5444','#aaa6ff',2.5);c.restore();if(e.eliteWarn>0)glowCircle(-37,0,6+3*Math.abs(Math.sin(t*19)),'#f5d7ff',12)}drawEnemyImpact(e);c.restore()}
function drawCreatureBoss(b){
 c.save();c.translate(b.x,b.y);
 const hurt=b.phase>0,t=b.t,octo=b.variant==='octopus';
 c.shadowColor=octo?'#d47bff':'#ff9454';c.shadowBlur=10;
 if(b.variant==='horizonark'||b.variant==='singularity'){
   const dark=b.variant==='singularity',edge=dark?'#c89dff':'#ffe1a3',base=dark?'#45305d':'#5c5a59';
   for(let k=0;k<9;k++){const aa=k*TAU/9+t*.09;
    const x=Math.cos(aa)*133,y=Math.sin(aa)*116;
    c.save();c.translate(x,y);c.rotate(aa);
    poly([-18,-18,15,-21,32,0,15,21,-18,18],base,edge,2);c.restore();
   }
   ellipse(0,0,108,89,base,edge,4);
   c.save();c.rotate(t*(dark?-.18:.15));
   for(let k=0;k<6;k++){const aa=k*TAU/6;
    line(Math.cos(aa)*45,Math.sin(aa)*43,Math.cos(aa)*94,Math.sin(aa)*79,edge,5)}
   c.restore();
   poly([-96,-38,-170,-56,-206,0,-170,56,-96,38],dark?'#624078':'#877654',edge,3);
   glowCircle(-51,0,33,hurt?'#ff8a9d':dark?'#dba5ff':'#fff1ba',19);
   if(b.phase===2){c.strokeStyle=edge;c.lineWidth=4;c.beginPath();c.ellipse(0,0,151,130,0,0,TAU);c.stroke()}
  }else if(b.variant==='jellyfish'||b.variant==='riftmedusa'){
 const rift=b.variant==='riftmedusa',edge=rift?'#c59aff':'#9effeb',core=rift?'#8b5dc1':'#328b95';
 // Two original mechanical medusae with animated filaments and pulsing cores.
 for(let i=0;i<10;i++){
  const x=-95+i*18,y=(i-4.5)*17;
  c.beginPath();c.moveTo(x,y);
  c.bezierCurveTo(x-70,y+Math.sin(t*2+i)*14,x-120,y+Math.cos(t*2+i)*29,x-195,y+Math.sin(t*2.7+i)*25);
  c.strokeStyle=rift?'#b07aff':'#7de5db';c.lineWidth=i%2?5:8;c.stroke();
  glowCircle(x-185,y+Math.sin(t*2.7+i)*25,3,edge,3);
 }
 ellipse(-4,0,113,92,core,edge,4);
 for(let k=0;k<7;k++){const a=k*TAU/7+t*.18;
  ellipse(Math.cos(a)*75,Math.sin(a)*59,17,12,rift?'#5e3b8b':'#2c6e7b',edge,1.5)}
 poly([-111,-22,-143,-6,-145,16,-111,32],rift?'#6c469c':'#267c86',edge,2);
 glowCircle(-59,0,32,hurt?'#ff8cab':rift?'#ec9dff':'#a8ffeb',17);
}else if(b.variant==='centipede'){
  for(let j=8;j>=0;j--){const x=40+j*25,y=Math.sin(t*2+j*.65)*14;
   ellipse(x,y,28-j*.9,33-j*.8,'#41635b','#c2e3aa',2);
   for(const side of [-1,1]){const yy=y+side*25;poly([x-9,yy,x+14,yy+side*18,x+35,yy+side*42,x+6,yy+side*24],'#4b7770','#d7e9b3',2)}}
  poly([-60,-58,-139,-71,-191,-27,-198,26,-135,68,-63,45],'#527c67','#d6efb6',4);
  glowCircle(-70,0,28,hurt?'#ff7d9e':'#a7ffd0',17);
 }else if(b.variant==='warden'){
  for(let k=0;k<6;k++){const a=k*TAU/6+t*.17,x=Math.cos(a)*111,y=Math.sin(a)*105;
   c.save();c.translate(x,y);c.rotate(a+.4);poly([-16,-30,18,-30,31,12,0,37,-30,12],'#59486f','#d5bbff',2);glowCircle(0,0,5,'#d9c1ff',8);c.restore()}
  poly([-89,-66,0,-109,95,-69,125,0,95,69,0,109,-89,66,-151,0],'#433c63','#bfa8ee',4);
  glowCircle(-59,0,34,hurt?'#ff7d9f':'#d8b1ff',19);
 }else if(b.variant==='turtle'){
   // Original four-legged siege turtle with hydraulic telescoping neck and
   // damage-proof shell closure. Shell hitbox is governed by bossMoveGuarded().
   const shell=bossMoveGuarded(b),ext=b.specialMove?.type==='neck'&&b.specialMove?.active?66:15;
   for(const side of [-1,1]){c.save();c.scale(1,side);
    for(let k=0;k<2;k++){const x=30+k*65,y=66+k*24+Math.sin(t*2.3+k)*8;
     line(x,25,x+27,y-13,'#416775',16);
     line(x+27,y-13,x+8,y+37,'#8dceb6',11);
     ellipse(x+8,y+37,18,11,'#2d505e','#b3e7cf',2)}
    c.restore()}
   const neckX=shell?-39:-78-ext;
   line(-45,0,neckX,0,'#5e908f',shell?15:32);
   ellipse(neckX,0,shell?18:29,shell?18:27,'#315b65','#c0eadc',3);
   if(!shell){poly([neckX-9,-22,neckX-36,-8,neckX-36,11,neckX-9,21],
      '#7b9e94','#efffe0',3);glowCircle(neckX-16,-7,6,'#e0ffcb',11)}
   ellipse(27,0,shell?139:133,shell?107:111,
    shell?'#183b4e':'#396a73','#b6ffdf',shell?8:4);
   for(let ringIdx=0;ringIdx<3;ringIdx++){
    const size=110-ringIdx*27;
    poly([-size,-46+ringIdx*18,-size+70,-78+ringIdx*11,size-12,-32+ringIdx*13,
     size-12,32-ringIdx*13,-size+70,78-ringIdx*11,-size,46-ringIdx*18],
     ringIdx%2?'#386c68':'#36646e',shell?'#e5fff0':'#8fd9cb',2);
   }
   for(let i=-2;i<=2;i++)glowCircle(38+i*35,0,7,shell?'#e8ffb2':'#8decda',6);
  }else if(b.variant==='mammoth'){
  for(const side of [-1,1]){c.save();c.scale(1,side);
   poly([5,49,90,75,119,123,73,131,34,80],'#426780','#b3e5f4',3);
   poly([-92,26,-157,45,-190,105,-163,110,-117,68,-69,54],'#d7f2f7','#ffffff',3);
   c.restore()}
  ellipse(0,0,111,87,'#35536c','#c4e8f5',4);
  for(let k=0;k<6;k++)poly([-78+k*29,-63,-62+k*29,-91,-43+k*29,-58],'#7cb4cc','#d9f9ff',2);
  poly([-75,-34,-153,-29,-174,12,-155,72,-132,77,-122,13],'#537c98','#d0f4ff',3);
  glowCircle(-70,0,29,hurt?'#ff82b2':'#81edff',17);
 }else if(b.variant==='leviathan'){
  for(let i=7;i>=0;i--){const x=65+i*22,y=Math.sin(t*2+i*.6)*18;
   ellipse(x,y,31-i*2,29-i,'#294c70','#9cdff7',2)}
  for(const side of [-1,1]){c.save();c.scale(1,side);
   poly([-40,29,55,42,115,133,19,99,-112,37],'#397d9b','#c6faff',3);
   for(let k=0;k<4;k++)poly([k*31-20,40,k*31-6,72,k*31+11,39],'#72c2df','#e8ffff',1);
   c.restore()}
  poly([-38,-36,-117,-63,-188,-29,-202,0,-157,32,-62,28],'#3c6a88','#d8f9ff',4);
  glowCircle(-162,-28,9,'#e4ffff',10);glowCircle(-55,0,31,hurt?'#ff86bb':'#93ecff',15);
 }else if(b.variant==='scorpion'){
  // Distinct eight-legged silhouette, paired claws and six-joint tail cannon.
  for(const side of [-1,1]){c.save();c.scale(1,side);
   for(let i=0;i<4;i++){
    const x=-12+i*37,y=65+i*14+Math.sin(t*2+i)*8;
    line(x,22,x+27,y-25,'#a65f54',11);line(x+27,y-25,x+5,y+13,'#f7bb82',7);
    ellipse(x+27,y-25,9,9,'#643b49','#ffddab',2);
   }
   const swing=Math.sin(t*2+side)*19;
   line(-58,35,-117,75+swing,'#8b5860',19);line(-117,75+swing,-182,104+swing,'#ffaf83',13);
   poly([-183,103+swing,-225,83+swing,-241,110+swing,-201,140+swing],'#b4655c','#ffe1a9',3);
   poly([-183,103+swing,-203,146+swing,-237,142+swing,-214,106+swing],'#693d4c','#ffb988',2);
   c.restore()}
  for(let j=5;j>=0;j--){
   const x=65+j*31,y=-20-j*23+Math.sin(t*2+j)*9;
   ellipse(x,y,28-j*2,23-j*1.5,'#6c3f4c','#ffd6a0',2);
  }
  poly([211,-138,270,-160,244,-117],'#ffb474','#fff4c7',3);
  glowCircle(248,-141,10,'#ffe3a4',16);
  ellipse(0,0,108,81,'#743f50','#ffd29c',4);
  poly([-102,-36,10,-75,112,-40,129,0,112,40,10,75,-102,36],'#a56059','#ffe4ac',3);
  for(let k=0;k<6;k++){const x=-48+k*27;poly([x,-58,x+11,-79,x+25,-57],'#b97960','#ffcf94',2)}
  glowCircle(-49,0,29,hurt?'#ff6694':'#ffe4b1',18);
 }else if(b.variant==='crab'){
  // Mechanical crab: articulated claws, shell armor and exposed core.
  for(const side of [-1,1]){c.save();c.scale(1,side);
   poly([-30,40,65,60,125,123,70,149,5,93],'#8b493c','#ffc187',3);
   poly([-83,70,-169,99,-205,52,-144,29,-77,38],'#bc6044','#ffdb99',3);
   for(let j=0;j<3;j++)poly([10+j*40,44,55+j*25,99,66+j*24,126,39+j*26,69],'#653b47','#ed986c',2);
   c.restore()}
  ellipse(0,0,110,85,'#5d3442','#ffcb81',4);
  poly([-83,-22,16,-75,108,-29,118,26,19,68,-83,21],'#a65a43','#ffe5a1',3);
  for(let i=0;i<5;i++)poly([-50+i*27,-55,-40+i*27,-83,-21+i*27,-52],'#bf6648','#ffdc9b',2);
  glowCircle(-54,0,33,hurt?'#ff5b88':'#ffc76b',15);
 }else if(b.variant==='solarwyrm'){
  // Solar serpent with broad wings, separate from the armored dinosaur.
  for(let i=0;i<7;i++){const x=50+i*24,y=i*17-35+Math.sin(t*2+i)*11;
   ellipse(x,y,32-i*2,28-i,'#773e4e','#ffad77',2)}
  for(const side of [-1,1]){c.save();c.scale(1,side);
   poly([-6,18,62,40,125,151,41,114,-58,47],'#ac4750','#ffe4ab',3);c.restore()}
  poly([-33,-41,-123,-89,-183,-55,-202,-8,-146,24,-60,37],'#873a55','#ffca88',4);
  poly([-198,-4,-108,8,-43,27,-115,46,-187,34],'#613449','#ffe0a6',2);
  glowCircle(-134,-55,10,'#fff0aa',12);glowCircle(-44,0,31,hurt?'#ff4b88':'#ffd16c',17);
 }else if(octo){
  // Eight individually animated, plated arms are procedural, not borrowed art.
  for(let i=0;i<8;i++){
   const upper=i<4,side=upper?-1:1,k=i%4;
   const sy=side*(30+k*12),endY=side*(110+k*42+Math.sin(t*2.2+i*1.7)*18)*(b.weakOpen?.72:1);
   const endX=-165-k*18+Math.sin(t*1.6+i)*21+(b.weakOpen?32:0);
   c.strokeStyle=hurt?'#ad557b':'#47778f';c.lineWidth=21-k*2;
   c.beginPath();c.moveTo(-16,sy);c.bezierCurveTo(-95,sy+side*25,-90-k*20,endY-side*34,endX,endY);c.stroke();
   c.strokeStyle='#87d8e4';c.lineWidth=3;c.stroke();
   for(let j=0;j<3;j++)glowCircle(-90-j*23,endY*(.40+j*.18),3,'#a4d7f1',0);
   glowCircle(endX,endY,7,hurt?'#ff8ea6':'#6fe8ee',5);
  }
  ellipse(12,0,107,94,'#233e59','#92b7d0',5);
  poly([-56,-65,24,-112,96,-81,115,0,96,81,24,112,-56,65],'#345d75','#c6e4ef',3);
  for(let j=-1;j<=1;j++)poly([-30,j*27-11,72,j*27-7,86,j*27+7,-30,j*27+11],'#35566d','#8cc9e2',1);
  ellipse(-48,0,55,62,'#162c43','#b4d6e2',4);
  for(const sign of [-1,1]){ellipse(-78,sign*27,16,13,'#091425','#c0eaf3',2);glowCircle(-83,sign*27,7,hurt?'#ff90bf':'#69f7ef',9)}
  glowCircle(-39,0,b.weakOpen?29:21,b.weakOpen?'#9ffff1':hurt?'#ff639d':'#76f1fe',b.weakOpen?23:17);
  if(b.weakWarn){c.strokeStyle='#83ffec';c.lineWidth=2.5;c.beginPath();c.arc(-39,0,36,0,TAU);c.stroke()}
  poly([-128,-13,-102,-26,-98,0,-102,26,-128,13],'#7f9db5','#e0f9ff',2);
 }else{
  // Armored saurian profile: segmented tail, back spines, moving jaw and legs.
  for(let j=0;j<6;j++){
   const xx=80+j*25,yy=35+Math.sin(t*2+j*.5)*7+j*j*.6;
   poly([xx-15,yy-19,xx+16,yy-12,xx+23,yy+8,xx-18,yy+12],'#62566a','#de987d',2);
  }
  poly([-52,-65,-5,-107,58,-93,114,-47,112,44,34,90,-52,66,-88,12],'#57536b','#e0ad90',4);
  for(let k=0;k<7;k++){const x=-35+k*21,y=-79+(k%2)*-14;poly([x-12,y+18,x,y-22,x+18,y+18],'#b8a39c','#ffe0b2',2)}
  for(const a of [-1,1]){c.save();c.translate(46,a*60);c.rotate(Math.sin(t*2+a)*.09);poly([-24,0,20,0,35,45,0,39],'#786878','#ffd0a5',2);poly([-1,32,40,42,45,53,-8,49],'#b4a0a0','#ffe1b8',1);c.restore()}
  poly([-57,-66,-145,-106,-189,-78,-171,-18,-88,8,-31,-11],'#6e6577','#ffbd90',3);
  const jawGap=b.weakOpen?18:0;poly([-169,-30,-91,-12,-49,-6,-60,36+jawGap,-123,30+jawGap,-177,8+jawGap],'#303a53','#ffd4a9',3);
  for(let k=0;k<6;k++){const x=-155+k*15;poly([x,1,x+8,1,x+4,13],'#fff0be')}
  glowCircle(-137,-56,b.weakOpen?21:10,b.weakOpen?'#a6fff0':hurt?'#ff6a5c':'#ffd167',b.weakOpen?20:12);if(b.weakWarn){c.strokeStyle='#9ef7e8';c.lineWidth=2.5;c.beginPath();c.arc(-137,-56,29,0,TAU);c.stroke()}
  ellipse(0,2,39,33,'#30334f','#b9aac0',3);
  glowCircle(-1,0,17,hurt?'#ff774f':'#9ef3ff',14);
  poly([45,-15,99,-30,92,3,48,12],'#a59994','#ffe4be',2);
 }
 c.shadowBlur=0;c.restore();
}
function drawBoss(b){if(b.variant&&b.variant!=='original'){drawCreatureBoss(b);return}const s=G.stage;c.save();c.translate(b.x,b.y);const q=Math.sin(b.t*3)*4;c.shadowColor=s===2?'#d03bc0':'#ff7364';c.shadowBlur=18;
if(s===0){poly([-157,-36,-118,-91,-5,-114,122,-69,151,0,122,69,-5,114,-118,91,-157,36],'#35455c','#afc5d4',3);poly([-157,-18,-80,-53,70,-47,131,0,70,47,-80,53,-157,18],'#21314b','#e5ac81',2);for(let a of [-1,1]){c.save();c.scale(1,a);poly([-80,42,-10,117,65,98,94,43],'#485673','#c5d9e6',2);poly([-85,59,29,76,41,56],'#8997b3');for(let j=0;j<3;j++)glowCircle(-44+j*38,82,5,'#ffab74',12);c.restore()}glowCircle(20,0,30+q*.3,b.weakOpen?'#a8fff4':'#ff9c70',b.weakOpen?34:20);
 if(b.weakWarn){c.strokeStyle='#8eece7';c.lineWidth=3;c.beginPath();c.arc(21,0,34,0,TAU);c.stroke()}
 ellipse(21,0,22,22,b.weakOpen?'#aaffee':'#ffe4b0','#fffae0',2);
 if(!b.weakOpen){poly([0,-26,42,-26,26,0,42,26,0,26,14,0],'#675568','#e7b99e',2)}poly([-174,-32,-124,-19,-126,18,-174,34],'#be7f72','#ffe0b0',2)}
else if(s===1){poly([-150,-68,-80,-142,64,-120,149,-42,165,55,64,120,-80,142,-150,68],'#45445c','#aaafb9',4);for(let i=0;i<9;i++){c.save();c.rotate(i*TAU/9+b.t*.07);poly([-11,-130,18,-130,38,-91,21,-68],'#6c556e','#c18c94',2);c.restore()}ellipse(-20,0,101,101,'#18283f','#a1a9c3',5);c.save();c.rotate(-b.t*.4);for(let j=0;j<8;j++){c.rotate(TAU/8);poly([-13,-94,13,-94,23,-60,-17,-60],'#b27e8d','#ffd2bd',1)}c.restore();glowCircle(-20,0,b.weakOpen?45:34,b.weakOpen?'#9ffff1':'#fd777f',b.weakOpen?27:19);
 ellipse(-20,0,32,32,b.weakOpen?'#c6fff5':'#ffe4aa','#fff4d0',3);
 if(b.weakWarn){c.strokeStyle='#83ffec';c.lineWidth=2.5;c.beginPath();c.arc(-20,0,49,0,TAU);c.stroke()}for(let i of [-1,1]){glowCircle(-110,i*57,10,'#ffa36d',22)}}
else{for(let i=0;i<9;i++){const ang=i*TAU/9+b.t*.1,rx=Math.cos(ang)*115,ry=Math.sin(ang)*121;line(rx*.36,ry*.36,rx+Math.sin(b.t*2+i)*16,ry+Math.cos(b.t*2+i)*21,'#9b4e9c',20);glowCircle(rx+Math.sin(b.t*2+i)*16,ry+Math.cos(b.t*2+i)*21,12,'#e165b6',13)}ellipse(0,0,104,96,'#49305a','#e597c7',5);ellipse(12,0,82,70,'#281f48','#8ba5e5',4);for(let i=0;i<8;i++){const a=i*TAU/8+b.t*.5;glowCircle(Math.cos(a)*67,Math.sin(a)*58,7,'#f07fc5',8)}glowCircle(-34,0,b.weakOpen?43:31,b.weakOpen?'#a9fff1':'#d979fb',b.weakOpen?30:19);ellipse(-35,0,30,30,b.weakOpen?'#bbfff1':'#ffdbef','#ffffff',2);if(b.weakWarn){c.strokeStyle='#a9fff1';c.lineWidth=2.5;c.beginPath();c.arc(-35,0,44,0,TAU);c.stroke()}if(!b.weakOpen)poly([-62,-27,-18,-27,-32,0,-18,27,-62,27,-46,0],'#624b78','#d8b5e5',2);poly([-163,-32,-110,-55,-68,-27,-60,0,-68,27,-110,55,-163,32],'#794c79','#ff9dd6',3)}
c.shadowBlur=0;c.restore()}

function drawAdaptiveBossArmor(b){
 if(!b||!(b.adaptiveTier>.08))return;
 const covered=bossArmorMultiplier(b)<1;
 c.save();c.translate(b.x-60,b.y);c.globalAlpha=.30+b.adaptiveTier*.45;
 for(const side of [-1,1]){c.save();c.scale(1,side);
  poly([-72,80,-9,94,55,100,20,116,-80,102],
   covered?'#486999':'#397b70',covered?'#9fc9ff':'#b1ffe4',covered?4:2);
  glowCircle(-28,99,covered?6:10,covered?'#8eb8f8':'#b8ffde',8);c.restore();}
 c.restore();
}
function drawBossReactor(b){
 if(!b||!(b.adaptiveTier>.22)||!(b.reactiveShield>0||b.reactiveExpose>0||b.reactiveStrike>0))return;
 const protectedCore=b.reactiveShield>0,x=b.x-70,y=b.y;
 c.save();
 c.strokeStyle=protectedCore?'#8bcfff':'#aaffd2';c.lineWidth=protectedCore?6:3.5;
 c.globalAlpha=protectedCore?.73:.82;
 c.beginPath();c.ellipse(x,y,118+Math.sin(b.t*11)*5,99+Math.sin(b.t*11)*4,0,0,TAU);c.stroke();
 if(protectedCore){
  for(const a of [0,TAU/3,2*TAU/3]){
   c.beginPath();c.arc(x+Math.cos(a)*115,y+Math.sin(a)*99,10,0,TAU);c.stroke();
  }
 }else glowCircle(x-30,y,16,'#b4ffda',14);
 if(b.reactiveStrike>0){
  c.globalAlpha=.83;c.strokeStyle='#b4cfff';c.lineWidth=3;
  c.beginPath();c.arc(b.x-115,b.y,15+(1-b.reactiveStrike/.79)*18,0,TAU);c.stroke();
 }
 c.restore();
}
function drawBossBeam(b){
 // Three compact muzzle signatures preview the next volley: paired fan,
 // ring, or flank cannons. No full-screen reticle, long aim line or text.
 if(b&&b.x<=980&&b.fire>0&&b.fire<.62&&b.charge<=0&&b.beam<=0){
  const route=b.routeDoctrine&&b.pattern>0&&b.pattern%5===4;
  const mode=route?3:b.pattern%3;
  const x=b.x-(route?125:135),y=b.y;
  const hue=route?(b.routeRisk?'#f5b7ee':'#a6f2ff'):'#ffdfac';
  c.save();c.globalAlpha=.57+.18*Math.sin(G.time*15);
  if(mode===0){
   glowCircle(x,y-23,7,hue,8);glowCircle(x,y+23,7,hue,8);
  }else if(mode===1){
   c.strokeStyle=hue;c.lineWidth=3;
   c.beginPath();c.arc(x,y,17,0,TAU);c.stroke();
   glowCircle(x,y,5,hue,6);
  }else if(mode===2){
   glowCircle(x,y-68,7,hue,8);glowCircle(x,y+68,7,hue,8);
  }else glowCircle(x,y,10,hue,10);
  c.restore();
 }
 if(!b||b.charge<=0&&b.beam<=0)return;
 const y=b.beamY,endpoint=b.x-130,active=b.beam>0;
 c.save();
 if(active){
  c.shadowColor='#ff517f';c.shadowBlur=31;
  line(0,y,endpoint,y,'#ff426d',52);
  line(0,y,endpoint,y,'#ffc4cb',18);
  line(0,y,endpoint,y,'#ffffff',5);
  for(let i=0;i<16;i++){const x=(i*89+G.time*150)%Math.max(1,endpoint);glowCircle(x,y+Math.sin(G.time*12+i)*15,2,'#ffebef',9)}
 }else{
  c.globalAlpha=.5+.33*Math.sin(G.time*22);
  c.setLineDash([15,13]);
  line(0,y,endpoint,y,'#ff557d',4);
  c.setLineDash([]);
  c.fillStyle='#ffdce9';c.font='bold 16px ui-monospace,monospace';c.textAlign='left';
  // The beam itself remains the warning. No text navigator.
 }
 c.restore();
}


/* In-world charging light only; no red crosshair or incoming-wave navigator. */
function drawEnemyWindup(){
 for(const e of G.enemies)if(e.aiWarn>0&&e.x<W+30){
  c.save();c.globalAlpha=Math.min(.65,e.aiWarn/.92);
  glowCircle(e.x-23,e.y,7,'#ffe2ad',3);c.restore();
 }
}
function drawFlightGate(){
 if(!G.transitioning||G.mode!=='playing'||G.flowPhase==='finish')return;
 const rewards=G.flowPhase==='reward',items=rewards?G.rewardOffers:G.routeOffers;
 if(!items?.length)return;
 const laneY=rewards?[165,337,509]:[218,460],focus=rewards?flightRewardIndex():flightRouteIndex();
 c.save();c.textAlign='right';c.textBaseline='middle';c.font='bold 19px system-ui,sans-serif';
 c.globalAlpha=.94;c.fillStyle='#e6f9ff';
 c.fillText(rewards?'報酬：上下移動で選択':'進路：上下移動で選択',W-57,87);
 for(let i=0;i<items.length;i++){
  const y=laneY[i],current=i===focus;
  c.globalAlpha=current?.95:.57;
  const x=rewards?W-390:W-465,width=rewards?333:408,half=rewards?37:65;
  c.fillStyle=current?'#155568ca':'#112239af';c.fillRect(x,y-half,width,half*2);
  c.strokeStyle=current?'#78e8ed':'#496985';c.lineWidth=current?3:1.5;
  c.strokeRect(x,y-half,width,half*2);
  c.fillStyle=current?'#f2ffff':'#bdd9e6';
  if(rewards){
   c.textAlign='right';c.font='bold 19px system-ui,sans-serif';
   c.fillText((current?'◆ ':'◇ ')+(items[i].name||'NEXT'),W-71,y-4);
   c.font='13px system-ui,sans-serif';c.fillStyle='#accddd';
   c.fillText(items[i].tag||'MODULE',W-71,y+21);
  }else{
   const o=items[i],left=x+15;
   c.textAlign='left';c.font='bold 17px system-ui,sans-serif';
   c.fillText((current?'◆ ':'◇ ')+(o.name||'NEXT'),left,y-43);
   c.font='12px system-ui,sans-serif';c.fillStyle='#b5e5f1';
   c.fillText('敵・地形：'+(o.threat||o.desc||''),left,y-19);
   c.fillText('ボス：'+(o.bossName||''),left,y+1);
   c.fillText('イベント：'+(o.event?.short||''),left,y+21);
   c.fillStyle=current?'#b6ffe7':'#b6d5df';
   c.fillText('選択特典：'+(o.bonus||''),left,y+42);
  }
 }
 c.restore()
}

function drawTacticalMeter(){if(G.mode!=='playing'&&G.mode!=='paused')return;const x=236,y=H-36,w=166,h=7,active=G.overdrive>0;
c.save();c.globalAlpha=.95;c.fillStyle='#071422ba';c.fillRect(x-12,y-29,w+25,56);c.font='bold 12px ui-monospace,monospace';c.textAlign='left';c.textBaseline='middle';c.fillStyle=active?'#ffe99f':'#82d6ea';c.fillText(active?'OVERDRIVE '+G.overdrive.toFixed(1)+'s':'OVERDRIVE CHARGE',x,y-10);c.fillStyle='#24425b';c.fillRect(x,y,w,h);c.fillStyle=active?'#ffdb7b':'#4cdded';c.fillRect(x,y,w*(active?G.overdrive/8:G.driveCharge/100),h);c.strokeStyle=active?'#ffe19a':'#5ccdeb';c.lineWidth=1;c.strokeRect(x,y,w,h);c.restore()}
/* 28/36: Enemy bullets remain readable without hue discrimination.
   A dark outline + bright interior distinguish them from friendly cyan fire.
   Geometry conveys threat even under red/green colour-vision deficiencies.
   No per-projectile shadowBlur, RNG, extra particles or gameplay changes. */
const HOSTILE_BULLET_PALETTE={
 orb:{core:'#ffe58c',rim:'#10152b',mark:'#ffffff'},
 lance:{core:'#ffb6dc',rim:'#10152b',mark:'#ffffff'},
 heavy:{core:'#c7b7ff',rim:'#10152b',mark:'#ffffff'}
};
function hostileBulletVisual(a){
 const speed=Math.hypot(a.vx||0,a.vy||0);
 const shape=a.size>=8||a.damage>1?'heavy':speed>=390?'lance':'orb';
 return {shape,...HOSTILE_BULLET_PALETTE[shape],radius:Math.max(3,a.size)};
}
function drawHostileBullet(a){
 const v=hostileBulletVisual(a),r=v.radius;
 c.save();c.translate(a.x,a.y);c.rotate(Math.atan2(a.vy,a.vx));
 c.lineJoin='round';c.lineCap='round';c.lineWidth=3;
 c.strokeStyle=v.rim;c.fillStyle=v.core;c.beginPath();
 if(v.shape==='heavy'){
  c.moveTo(r+3,0);c.lineTo(0,-r-3);c.lineTo(-r-3,0);c.lineTo(0,r+3);c.closePath();
 }else if(v.shape==='lance'){
  c.moveTo(r+3,0);c.lineTo(-r-2,-r*.9);c.lineTo(-r*.45,0);
  c.lineTo(-r-2,r*.9);c.closePath();
 }else c.arc(0,0,r+1,0,TAU);
 c.fill();c.stroke();
 c.strokeStyle=v.mark;c.fillStyle=v.mark;
 if(v.shape==='orb'){c.beginPath();c.arc(0,0,Math.max(1.5,r*.33),0,TAU);c.fill()}
 else if(v.shape==='lance'){c.lineWidth=1.5;c.beginPath();c.moveTo(-r*.55,0);c.lineTo(r+1,0);c.stroke()}
 else{c.lineWidth=1.7;c.beginPath();c.moveTo(-r*.4,0);c.lineTo(r*.4,0);c.moveTo(0,-r*.4);c.lineTo(0,r*.4);c.stroke()}
 c.restore();
}
function drawScene(){c.save();if(G.shake>.2)c.translate(R(-G.shake,G.shake),R(-G.shake,G.shake));drawBackground();if(G.mode==='title'){drawShip(274,344,0,0);for(let i=0;i<4;i++){const e={x:750+i*122,y:210+i*90,type:i%2?'scout':'spinner',t:G.time*.7,phase:i};drawEnemy(e)}}
else{for(const q of G.pickups){c.save();c.translate(q.x,q.y);c.rotate(q.t*1.5);c.shadowColor=q.type==='elite'?'#c9a5ff':q.type==='pulse'?'#ffcb60':'#7dfff8';c.shadowBlur=22;poly([0,-18,18,0,0,18,-18,0],q.type==='elite'?'#5d438e':q.type==='pulse'?'#9e7129':'#157881',q.type==='elite'?'#f2ddff':q.type==='pulse'?'#fff3a0':'#d4fff7',2);c.font='bold 18px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f5ffff';c.rotate(-q.t*1.5);c.fillText(q.type==='elite'?'✦':q.type==='pulse'?'✹':'P',0,1);c.restore()}
drawTerrain();drawEnemyWindup();drawFlightGate();
for(const e of G.enemies){drawEnemy(e);if(e.eventDrop){c.save();c.globalAlpha=.72;c.strokeStyle='#ffec99';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,43+Math.sin(G.time*5)*3,0,TAU);c.stroke();c.restore()}}if(G.boss){drawBoss(G.boss);drawAdaptiveBossArmor(G.boss);drawBossReactor(G.boss);drawBossSpecial(G.boss);drawBossBeam(G.boss)}
for(const s of G.shots){c.save();c.lineCap='round';if(s.kind==='laser'){line(s.x-95,s.y,s.x+24,s.y,'#178fff',14);line(s.x-105,s.y,s.x+24,s.y,'#83faff',6);line(s.x-105,s.y,s.x+28,s.y,'#fff',2)}else if(s.kind==='missile'){poly([s.x+12,s.y,s.x-13,s.y-7,s.x-8,s.y,s.x-13,s.y+7],'#ffbc81','#fff1b4',1);line(s.x-28,s.y+R(-2,2),s.x-10,s.y,'#ff954d',5)}else{line(s.x-20,s.y-s.vy*.012,s.x+12,s.y+s.vy*.012,'#55d6ff',s.kind==='shot'?6:3.5);line(s.x-16,s.y,s.x+14,s.y,'#d4fbff',2)}c.restore()}
for(const a of G.bullets)drawHostileBullet(a)
for(let i=G.levels[4]-1;i>=0;i--){let tr=G.trail[Math.min(G.trail.length-1,17+i*24)];if(tr)drawDrone(tr.x-9,tr.y,i)}drawShip(p.x,p.y,p.angle,p.invul);
/* Visual-only cap: simulation and gameplay remain unchanged. */
const MAX_DRAW_PARTICLES=260;
for(let i=Math.max(0,G.particles.length-MAX_DRAW_PARTICLES);i<G.particles.length;i++){const q=G.particles[i];c.save();c.globalAlpha=cl(q.life/q.maxLife,0,1);
if(q.kind==='shard'){c.translate(q.x,q.y);c.rotate(q.rot);c.fillStyle=q.color;c.fillRect(-q.size*.5,-q.size*.18,q.size,q.size*.36);c.globalAlpha*=.65;c.fillStyle='#eaf6ff';c.fillRect(-q.size*.3,-q.size*.13,q.size*.43,q.size*.08)}
else{if(q.glow){c.shadowColor=q.color;c.shadowBlur=12}c.fillStyle=q.color;c.fillRect(q.x-q.size*.5,q.y-q.size*.5,q.size,q.size)}
c.restore()}
for(const r of G.rings){c.save();c.globalAlpha=Math.max(0,1-r.t/r.life);c.strokeStyle=r.color;c.lineWidth=Math.max(1,8*(1-r.t/r.life));c.shadowColor=r.color;c.shadowBlur=20;c.beginPath();c.arc(r.x,r.y,r.r,0,TAU);c.stroke();c.restore()}}
drawTacticalMeter();
if(screenPulse>0){c.fillStyle='rgba(197,244,255,'+(screenPulse*.25)+')';c.fillRect(0,0,W,H)}
c.restore()}
function render(ms){const dt=Math.min((ms-last)/1000||0,.034);last=ms;pollGamepad();if(G.mode==='playing')update(dt);else{G.time+=dt;G.scroll+=30*dt}drawScene();requestAnimationFrame(render)}
const dpr=window.matchMedia?.('(pointer: coarse)').matches?1:Math.min(1.5,window.devicePixelRatio||1);C.width=W*dpr;C.height=H*dpr;c.setTransform(dpr,0,0,dpr,0,0);showOverlay('title');syncOrientation();updateHud();requestAnimationFrame(render);
})();