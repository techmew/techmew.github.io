/* OTODAMA fixed world roster & original Canvas boss art. No assets, remote calls, or save mutations. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.OtodamaBosses=api;})(typeof window!=='undefined'?window:null,function(){
'use strict';
const CHAPTERS=[{"area":"空の広場","motif":"sky","palette":["#65e7ff","#eefbff","#e6c18a"],"normal":"風唄の子|薄雲の羽音|輪唱コウモリ|飛翔のこだま|鳴翼獣 スカイロア|霞裂き|天鳴りの群れ主|旋風の尾音|蒼天の門衛|轟空獣 ガラノア","moves":["蒼穹咆哮","旋空裂爪","天輪共鳴"],"hint":"大きな予兆を見て回避し、翼の共鳴核を狙う","names":["風唄の子","薄雲の羽音","輪唱コウモリ","飛翔のこだま","鳴翼獣 スカイロア","霞裂き","天鳴りの群れ主","旋風の尾音","蒼天の門衛","轟空獣 ガラノア"]},{"area":"街の屋上","motif":"echo","palette":["#ba76ff","#f6c3ff","#eb537b"],"normal":"ネオンのささやき|屋上の跳音|歯車のこだま|雑踏の喰声|反響獣 リフレクタ|屋根の鳴影|交差する残響|鉄塔の鳴子|千窓の番人|残響魔楼 エコザリオン","moves":["遅延反響陣","共鳴反射","千口斉唱"],"hint":"遅れて跳ね返る音壁を見切る","names":["ネオンのささやき","屋上の跳音","歯車のこだま","雑踏の喰声","反響獣 リフレクタ","屋根の鳴影","交差する残響","鉄塔の鳴子","千窓の番人","残響魔楼 エコザリオン"]},{"area":"海の底","motif":"sea","palette":["#72f2df","#b7fff3","#407ccd"],"normal":"水泡の歌い手|潮鳴りの魚|泡音の群れ|深青の漂流者|水底獣 アビサル|真珠の響き|海溝の低声|漂う鰭音|深淵の門番|深海響鯨 ネブラマーレ","moves":["低周波津波","泡沫牢獄","深海圧唱"],"hint":"巨大な低音の波を耐え、反撃する","names":["水泡の歌い手","潮鳴りの魚","泡音の群れ","深青の漂流者","水底獣 アビサル","真珠の響き","海溝の低声","漂う鰭音","深淵の門番","深海響鯨 ネブラマーレ"]},{"area":"火山の道","motif":"flame","palette":["#ff9955","#ffe0a6","#ed4255"],"normal":"火種の囁き|熾火の鳴き手|焔尾の獣|火砕のこだま|爆鳴獣 カグツチ|灼岩の牙|噴煙の哀歌|赤熱の翼音|黒曜の番犬|灼熱共鳴獣 ヴォルカ＝ラグナ","moves":["溶岩轟唱","爆裂咆哮","紅蓮裂爪"],"hint":"接近攻撃をかわし、溶岩の波紋を読む","names":["火種の囁き","熾火の鳴き手","焔尾の獣","火砕のこだま","爆鳴獣 カグツチ","灼岩の牙","噴煙の哀歌","赤熱の翼音","黒曜の番犬","灼熱共鳴獣 ヴォルカ＝ラグナ"]},{"area":"夜の公園","motif":"moon","palette":["#be99ff","#f9edff","#7680de"],"normal":"夜露の小声|月影の歌姫|宵闇のこだま|星喰いの子|月輪獣 ルナリア|迷い歌の影|ひそやかな群鳴|月蝕の使い|夢鳴りの番人|幻鳴皇 ノクス＝ハウル","moves":["月輪幻唱","暗転の残響","幻影分身"],"hint":"消える本体の残光を追い、幻影に惑わされない","names":["夜露の小声","月影の歌姫","宵闇のこだま","星喰いの子","月輪獣 ルナリア","迷い歌の影","ひそやかな群鳴","月蝕の使い","夢鳴りの番人","幻鳴皇 ノクス＝ハウル"]},{"area":"雪の山道","motif":"ice","palette":["#9fe9ff","#ffffff","#668dbb"],"normal":"粉雪の声|氷滴の歌|吹雪の鳴子|白夜の足音|凍鳴獣 スノウベル|氷河の低歌|雪裂きの角|白嶺のこだま|凍てる門守|凍響巨神 フロスト＝ヴェイン","moves":["氷結絶唱","氷柱連唱","白銀重響"],"hint":"重い一撃と氷柱の予兆を見極める","names":["粉雪の声","氷滴の歌","吹雪の鳴子","白夜の足音","凍鳴獣 スノウベル","氷河の低歌","雪裂きの角","白嶺のこだま","凍てる門守","凍響巨神 フロスト＝ヴェイン"]},{"area":"天空の裂け目","motif":"sky","palette":["#96f7ff","#fff6e3","#5c7aff"],"normal":"空裂けの幼生|時雨の鳴羽|白翼の影|雷光のこだま|星翼獣 アウローラ|裂風の瞬き|雲上の雷音|空白の残響|界門の見張り|裂界鳥 アストラ＝クレイド","moves":["瞬空音刃","三重疾走","裂界急襲"],"hint":"高速移動の残像から本体の進路を読む","names":["空裂けの幼生","時雨の鳴羽","白翼の影","雷光のこだま","星翼獣 アウローラ","裂風の瞬き","雲上の雷音","空白の残響","界門の見張り","裂界鳥 アストラ＝クレイド"]},{"area":"深熱の海溝","motif":"flame","palette":["#ff7b81","#ffd7a3","#4a97c2"],"normal":"蒸気の発声|熱水の鰭|海底の灼声|赤潮の泣き手|熱響獣 バーナクル|深熱の歌|紅黒の泡影|溶海の咆哮|裂鱗の門番|冥熱龍 バハ＝ノイズ","moves":["熱水共鳴砲","冥炎轟撃","連続灼波"],"hint":"熱水と黒炎の二重波を読み切る","names":["蒸気の発声","熱水の鰭","海底の灼声","赤潮の泣き手","熱響獣 バーナクル","深熱の歌","紅黒の泡影","溶海の咆哮","裂鱗の門番","冥熱龍 バハ＝ノイズ"]},{"area":"万声の境界","motif":"chorus","palette":["#ff99d3","#fff3ba","#7ef0f2"],"normal":"ひとつめの歌|二重唱の子|重なりのこだま|異響のまゆ|共歌獣 オーケストラ|千声の残片|融合する羽音|多声のささやき|万象の門守|万声融合獣 バンショウ＝ゼロム","moves":["千重の輪唱","万象波動","多声連鎖"],"hint":"複数の声が重なる攻撃順序を見極める","names":["ひとつめの歌","二重唱の子","重なりのこだま","異響のまゆ","共歌獣 オーケストラ","千声の残片","融合する羽音","多声のささやき","万象の門守","万声融合獣 バンショウ＝ゼロム"]},{"area":"静寂の終域","motif":"void","palette":["#ebf6ff","#f2a4ba","#596b8c"],"normal":"消えかけの囁き|無声の残影|忘却の唱者|零響の群れ|無響獣 ヴォイド|消滅の呼吸|止まった旋律|空白の咆哮|終音の門番|無音神 レクイエム","moves":["静寂侵食","崩響の獣化","終聲・無音核"],"hint":"静寂・崩響・真無音の三形態を突破する","names":["消えかけの囁き","無声の残影","忘却の唱者","零響の群れ","無響獣 ヴォイド","消滅の呼吸","止まった旋律","空白の咆哮","終音の門番","無音神 レクイエム"]}];
const ATTACKS=['meteor','beam','shockwave','warp','spin','aerial','combo','uppercut','rush','counter'];
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
function stageId(n){const x=Number(n);return Number.isFinite(x)?((Math.max(1,Math.floor(x))-1)%100)+1:1;}
function stage(n){
 const id=stageId(n),chapter=Math.floor((id-1)/10),slot=(id-1)%10,world=CHAPTERS[chapter];
 const tier=slot===9?(id===100?'final':'boss'):slot===4?'mid':'normal';
 const item={id,chapter,slot,tier,name:world.names[slot],area:world.area,motif:world.motif,
   palette:world.palette,signature:world.moves,advice:world.hint,
   seed:((Math.imul(id,2654435761)^Math.imul(chapter+1,2246822519)^0x6f746f64)>>>0),
   title:tier==='final'?'最終ボス':tier==='boss'?'大ボス':tier==='mid'?'中ボス':'この地の主'};
 return item;
}
function isBoss(n){return stage(n).tier!=='normal';}
function pickMove(n,turn,hpRatio=1){
 const s=stage(n),i=Math.max(0,Math.floor(turn))%3,final=s.tier==='final';
 const phase=final?(hpRatio<.28?2:hpRatio<.63?1:0):hpRatio<.42?1:0;
 const name=final?s.signature[phase]:s.signature[(i+phase)%3];
 const moveIds={
 sky:['aerial','shockwave','meteor'],echo:['beam','warp','spin'],sea:['shockwave','beam','rush'],
 flame:['meteor','combo','shockwave'],moon:['warp','spin','aerial'],ice:['meteor','shockwave','uppercut'],
 chorus:['spin','beam','combo'],void:['shockwave','warp','beam']
 };
 const arr=moveIds[s.motif]||ATTACKS;
 return {name,kind:arr[(i+phase)%arr.length],arena:['残響増幅','空間反転','音速暴走'][((s.chapter+phase+i)%3)],phase,
    hint:s.advice};
}
function decorate(outcome,n){
 if(!isBoss(n)||!outcome||!Array.isArray(outcome.events)||!Array.isArray(outcome.max))return outcome;
 let turn=0;
 for(const event of outcome.events){if(event.atk!==1)continue;
  const ratio=Array.isArray(event.hp)?clamp((Number(event.hp[1])||0)/(Number(outcome.max[1])||1),0,1):1;
  const move=pickMove(n,turn++,ratio);
  event.kind=move.kind;event.bossMove=move.name;event.bossPhase=move.phase;event.arena=move.arena;
  event.commentary=move.name+'！ '+move.hint;
  // Damage and HP come exclusively from the original battle simulator; never falsify authoritative results.
 }
 return outcome;
}
function polygon(c,points,color,stroke,width=3){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill()}
function ring(c,x,y,r,col,width=3){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.strokeStyle=col;c.lineWidth=width;c.stroke()}
function arm(c,dir,primary,accent,phase){
 c.save();c.scale(dir,1);c.rotate(.04*Math.sin(phase));polygon(c,[[52,-45],[109,-77],[152,-27],[106,36],[60,28]],primary,accent,4);
 polygon(c,[[113,-28],[170,-68],[143,-10],[186,6],[125,35]],accent,'#0a1129',4);c.restore();
}
function wing(c,side,primary,accent,phase){
 c.save();c.scale(side,1);c.rotate(.08*Math.sin(phase));
 polygon(c,[[34,-64],[74,-175],[151,-190],[120,-119],[183,-122],[132,-56],[110,5]],primary,accent,4);
 polygon(c,[[72,-150],[112,-177],[96,-112],[129,-96],[92,-62]],accent,'#16223e',2.5);c.restore();
}
function fins(c,side,primary,accent){
 c.save();c.scale(side,1);
 for(let k=0;k<3;k++)polygon(c,[[43+k*10,-51+k*39],[124+k*13,-125+k*48],[76+k*7,12+k*38]],primary,accent,3);c.restore();
}
function horns(c,count,primary,accent){
 for(let k=0;k<count;k++){const x=(k-(count-1)/2)*36;
 polygon(c,[[x-17,-93],[x-12,-130-(k%2)*24],[x+3,-185-(k%3)*9],[x+15,-119],[x+12,-95]],primary,accent,3);
 }}
function draw(c,creature,time=0,options={}){
 const spec=creature?.stageBoss;if(!spec||spec.tier==='normal')return false;
 const pal=spec.palette,hi=pal[1],mid=pal[0],blood=pal[2],low=options.lowFx===true;
 const big=spec.tier==='final'?1.62:spec.tier==='boss'?1.47:1.21;
 const t=Number(time)||0,breath=Math.sin(t*1.4+spec.id)*4;
 const phase=options.phase||0,dim=phase>=2?'#100c21':'#121c36';
 c.save();c.scale(big,big);c.translate(0,breath);c.lineJoin='round';c.lineCap='round';
 // Three concentric sound halos form a unique voice-born outline.
 c.save();c.globalAlpha=.23+.05*Math.sin(t*2.2);
 for(let k=0;k<(low?1:3);k++)ring(c,0,-18,107+k*23+Math.sin(t*1.6+k)*7,k%2?blood:mid,2.2+k*.5);
 c.restore();
 ellipse(c,0,112,126,18,'#030c19a8');
 // Individual silhouettes: wings, echo mouths, fins, fire spines, moon rings, glacier arms.
 if(['sky','moon'].includes(spec.motif)){wing(c,-1,dim,mid,t);wing(c,1,dim,mid,t)}
 if(spec.motif==='sea'){fins(c,-1,dim,mid);fins(c,1,dim,mid)}
 if(spec.motif==='flame'){for(let side of [-1,1]){c.save();c.scale(side,1);
   for(let k=0;k<4;k++)polygon(c,[[36+k*12,53-k*30],[110+k*14,28-k*34],[51+k*4,85-k*32]],dim,blood,3);
   c.restore();}}
 if(spec.motif==='echo'){for(let side of [-1,1]){c.save();c.scale(side,1);for(let k=0;k<3;k++){
   const r=66+k*28;ring(c,50,-24,r,mid,4);ellipse(c,50+r*.71,-24,13,27,dim);}c.restore();}}
 if(spec.motif==='ice'){arm(c,-1,dim,mid,t);arm(c,1,dim,mid,t);horns(c,4,dim,hi)}
 if(spec.motif==='chorus'){for(let k=0;k<6;k++){const a=k*Math.PI/3+t*.1;
   ellipse(c,Math.cos(a)*128,Math.sin(a)*101-12,25,32,dim);ring(c,Math.cos(a)*128,Math.sin(a)*101-12,19,blood,3);}}
 if(spec.motif==='void'){for(let k=0;k<5;k++){let a=k*Math.PI*2/5+t*.04;
   polygon(c,[[Math.cos(a)*57,Math.sin(a)*53-10],[Math.cos(a-.28)*191,Math.sin(a-.28)*174-15],[Math.cos(a+.25)*146,Math.sin(a+.25)*145-5]],dim,hi,3);}}
 // Dense main body, layered resonance armor, central light source.
 ellipse(c,0,4,76,105,'#07111d');
 ellipse(c,0,-10,72,95,dim);
 polygon(c,[[-65,-32],[-34,-85],[38,-83],[66,-22],[44,68],[0,97],[-46,64]],mid,'#0b1430',7);
 polygon(c,[[-44,-38],[-19,-77],[19,-77],[44,-38],[29,37],[0,69],[-28,37]],dim,hi,3);
 if(['sky','flame','ice','void'].includes(spec.motif)){horns(c,spec.motif==='void'?5:3,dim,hi)}
 if(['flame','void'].includes(spec.motif)){arm(c,-1,dim,blood,t);arm(c,1,dim,blood,t)}
 if(spec.motif==='sea'){ellipse(c,0,24,86,60,dim);for(let k=0;k<4;k++){ellipse(c,-38+k*24,-80,8,17,hi)}}
 if(spec.motif==='moon'){ring(c,0,-118,74,hi,9);ring(c,0,-118,56,mid,3)}
 if(spec.motif==='chorus'){for(let i=-2;i<=2;i++)ellipse(c,i*23,-67,12,16,hi);}
 const pulse=1+.09*Math.sin(t*5),core=spec.tier==='final'?blood:hi;
 c.save();c.shadowBlur=low?10:36;c.shadowColor=core;
 ellipse(c,0,-9,27*pulse,36*pulse,core);
 ellipse(c,0,-9,14*pulse,24*pulse,'#ffffff');
 c.restore();
 for(let side of [-1,1]){c.save();c.scale(side,1);
   ellipse(c,31,-71,11,9,'#020b1d');ellipse(c,31,-71,6,5,blood);c.restore();}
 // Rib-shaped sound-wave vents and lower claws.
 for(let i=0;i<4;i++){const y=20+i*11;c.beginPath();c.moveTo(-38+i*4,y);
   c.quadraticCurveTo(0,y+13,38-i*4,y);c.strokeStyle=i%2?hi:mid;c.lineWidth=3;c.stroke();}
 if(spec.tier==='final'){c.save();c.globalAlpha=.76;for(let i=0;i<7;i++){const a=t*.37+i*2*Math.PI/7;
   let x=150*Math.cos(a),y=115*Math.sin(a)-14;ring(c,x,y,13,i%2?blood:hi,4);}
   c.restore();}
 if(spec.tier==='boss'||spec.tier==='final'){c.save();c.globalAlpha=.33;
   c.strokeStyle=core;c.lineWidth=4;for(let k=0;k<3;k++){const a=t*.9+k*2*Math.PI/3;
     c.beginPath();c.ellipse(0,-13,113+k*11,43+k*9,a,0,Math.PI*1.7);c.stroke();}
   c.restore();}
 c.restore();return true;
}
return Object.freeze({chapters:CHAPTERS.map(x=>({area:x.area,motif:x.motif})),stage,stageId,isBoss,pickMove,decorate,draw});
});
