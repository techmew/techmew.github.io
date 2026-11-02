/* Boss encounters v1: 20 distinct creatures × 2 telegraphed signature attacks.
 * Pure geometry/rendering; combat and persistence are owned by game.js.
 * No new NPCs, crowd inflation, or save-schema changes. */
(()=>{"use strict";
const catalog={
 "alpha": [
  [
   "戦慄の遠吠え",
   "ring",
   205,
   33,
   1.2,
   8.2,
   "fear",
   0.56
  ],
  [
   "追い込みの二連走り",
   "twin",
   265,
   28,
   0.95,
   8.8,
   "knock",
   0.72
  ]
 ],
 "giantSnake": [
  [
   "大蛇の締め縄",
   "target",
   90,
   68,
   1.03,
   8,
   "bind",
   0.56
  ],
  [
   "毒牙の扇撃",
   "fan",
   170,
   80,
   0.85,
   7.8,
   "wound",
   0.64
  ]
 ],
 "oldBear": [
  [
   "老熊の地割れ叩き",
   "ground",
   135,
   0,
   1.23,
   9.1,
   "crush",
   0.8
  ],
  [
   "十字の大爪",
   "cross",
   130,
   30,
   1.12,
   8.4,
   "wound",
   0.65
  ]
 ],
 "giantBoar": [
  [
   "暴走の土煙",
   "line",
   285,
   38,
   1.09,
   8.4,
   "mud",
   0.69
  ],
  [
   "牙の二方向突き",
   "fork",
   225,
   28,
   1.07,
   8.2,
   "knock",
   0.66
  ]
 ],
 "blackPanther": [
  [
   "影走りの急襲",
   "line",
   265,
   24,
   0.77,
   7.1,
   "wound",
   0.65
  ],
  [
   "影落ちの奇襲",
   "target",
   108,
   43,
   1.06,
   8.7,
   "disorient",
   0.62
  ]
 ],
 "oneEyedWolf": [
  [
   "隻眼の挟み討ち",
   "fork",
   235,
   23,
   1.05,
   8.4,
   "flank",
   0.63
  ],
  [
   "逃げ道を切る十字爪",
   "cross",
   120,
   28,
   1.15,
   9,
   "stagger",
   0.61
  ]
 ],
 "whiteTiger": [
  [
   "白虎の天井落とし",
   "target",
   130,
   48,
   1.03,
   9,
   "wound",
   0.78
  ],
  [
   "白虎の旋回斬り",
   "sweep",
   188,
   62,
   0.99,
   8.4,
   "knock",
   0.67
  ]
 ],
 "giantHyena": [
  [
   "骨砕きの飛び噛み",
   "line",
   208,
   29,
   0.82,
   7,
   "tendon",
   0.61
  ],
  [
   "群れを惑わす甲高い笑い",
   "ring",
   195,
   26,
   1.12,
   9,
   "fear",
   0.44
  ]
 ],
 "giantLion": [
  [
   "獅子の威圧咆哮",
   "fan",
   320,
   190,
   1.3,
   10.1,
   "roar",
   0.45
  ],
  [
   "三連鉤爪の裂傷",
   "scatter",
   132,
   45,
   1.06,
   8.8,
   "wound",
   0.72
  ]
 ],
 "giantMoose": [
  [
   "巨大角の横薙ぎ",
   "sweep",
   225,
   110,
   1.23,
   8.9,
   "knock",
   0.68
  ],
  [
   "背後を蹴り払う",
   "back",
   190,
   94,
   1.07,
   8.1,
   "stagger",
   0.62
  ]
 ],
 "giantBuffalo": [
  [
   "地響きの踏み鳴らし",
   "ring",
   245,
   45,
   1.35,
   10.4,
   "quake",
   0.68
  ],
  [
   "野牛の二列突進",
   "twin",
   270,
   31,
   1.13,
   9.1,
   "knock",
   0.76
  ]
 ],
 "giantCrocodile": [
  [
   "大ワニの死の回転",
   "ground",
   122,
   0,
   1.13,
   9.7,
   "drag",
   0.77
  ],
  [
   "水面を裂く斜め突進",
   "fork",
   185,
   29,
   1.02,
   8.7,
   "water",
   0.62
  ]
 ],
 "giantHippo": [
  [
   "河馬の水圧波",
   "ring",
   245,
   44,
   1.44,
   10.1,
   "quake",
   0.78
  ],
  [
   "大顎による範囲噛み",
   "fan",
   180,
   145,
   1.03,
   8.6,
   "crush",
   0.78
  ]
 ],
 "giantAnaconda": [
  [
   "渦巻く水面の罠",
   "donut",
   155,
   34,
   1.2,
   9.6,
   "bind",
   0.62
  ],
  [
   "大蛇の拘束円",
   "target",
   195,
   64,
   1.14,
   9.4,
   "bind",
   0.52
  ]
 ],
 "giantLizard": [
  [
   "巨尾の後方払い",
   "back",
   180,
   85,
   0.94,
   8.4,
   "knock",
   0.65
  ],
  [
   "裂傷を残す飛沫",
   "scatter",
   175,
   38,
   1.06,
   8.5,
   "wound",
   0.54
  ]
 ],
 "rhino": [
  [
   "サイの貫通一直線",
   "line",
   310,
   42,
   1.21,
   10,
   "pierce",
   0.85
  ],
  [
   "角による横振り払い",
   "sweep",
   213,
   93,
   1.03,
   8.8,
   "knock",
   0.73
  ]
 ],
 "giantGorilla": [
  [
   "二列の岩石衝撃",
   "twin",
   245,
   34,
   1.17,
   9.5,
   "crush",
   0.65
  ],
  [
   "胸打ちの衝撃波",
   "ground",
   155,
   0,
   1.26,
   10,
   "quake",
   0.65
  ]
 ],
 "giantElephant": [
  [
   "巨象の鼻薙ぎ",
   "sweep",
   255,
   116,
   1.26,
   10.2,
   "knock",
   0.8
  ],
  [
   "巨脚の環状地震",
   "donut",
   190,
   46,
   1.55,
   11.8,
   "quake",
   0.84
  ]
 ],
 "albinoWolf": [
  [
   "白狼の残像二閃",
   "fork",
   255,
   22,
   0.82,
   8.2,
   "disorient",
   0.62
  ],
  [
   "忍び寄る死角の爪",
   "target",
   120,
   42,
   0.95,
   9,
   "wound",
   0.65
  ]
 ],
 "giantEagle": [
  [
   "大鷲の落下衝撃",
   "target",
   205,
   60,
   1.21,
   10.1,
   "stagger",
   0.78
  ],
  [
   "羽ばたきの暴風",
   "fan",
   270,
   165,
   1.04,
   8.6,
   "wind",
   0.51
  ]
 ]
};
const TWO=Math.PI*2;
const norm=a=>Math.atan2(Math.sin(a),Math.cos(a));
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
function pattern(type,index){
 const choices=catalog[type];if(!choices)return null;
 const p=choices[(Math.max(0,index)|0)%2];
 return {name:p[0],shape:p[1],range:p[2],width:p[3],windup:p[4],cooldown:p[5],effect:p[6],power:p[7]};
}
function target(m,player,descriptor){
 if(!m||!player||!descriptor)return null;
 const dir=Math.atan2(player.y-m.y,player.x-m.x),shape=descriptor.shape;
 const anchored=shape==="target"||shape==="cross"||shape==="scatter"||shape==="donut";
 return {...descriptor,type:m.type,ownerX:m.x,ownerY:m.y,x:anchored?player.x:m.x,
  y:anchored?player.y:m.y,dir,time:descriptor.windup,total:descriptor.windup};
}
function toLocal(s,x,y){
 const dx=x-s.ownerX,dy=y-s.ownerY,c=Math.cos(s.dir),sn=Math.sin(s.dir);
 return {forward:dx*c+dy*sn,side:-dx*sn+dy*c};
}
function corridor(s,x,y,turn=0,side=0){
 const c=Math.cos(s.dir+turn),sn=Math.sin(s.dir+turn);
 const fx=s.ownerX-sn*side,fy=s.ownerY+c*side;
 const dx=x-fx,dy=y-fy,forward=dx*c+dy*sn,lateral=-dx*sn+dy*c;
 return forward>=0&&forward<=s.range&&Math.abs(lateral)<s.width;
}
function hit(s,x,y,extra=0){
 if(!s)return false;
 const local=toLocal(s,x,y),d=Math.hypot(x-s.ownerX,y-s.ownerY),off=Math.hypot(x-s.x,y-s.y);
 const direction=norm(Math.atan2(y-s.ownerY,x-s.ownerX)-s.dir);
 switch(s.shape){
  case "line":return corridor({...s,width:s.width+extra},x,y);
  case "twin":return corridor({...s,width:s.width+extra},x,y,0,64)||
   corridor({...s,width:s.width+extra},x,y,0,-64);
  case "fork":return corridor({...s,width:s.width+extra},x,y,.46)||
   corridor({...s,width:s.width+extra},x,y,-.46);
  case "fan":return d<=s.range+extra&&Math.abs(direction)<=clamp(s.width/s.range,0.38,1.3);
  case "sweep":return d<=s.range+extra&&d>s.range*.24-extra&&Math.abs(norm(direction-.43))<=clamp(s.width/s.range+.35,.8,1.5);
  case "back":return d<=s.range+extra&&Math.abs(norm(direction-Math.PI))<=clamp(s.width/s.range+.22,.6,1.3);
  case "ground":return d<=s.range+extra;
  case "ring":return Math.abs(d-s.range*.73)<=s.width+extra;
  case "target":return off<=s.width+extra;
  case "donut":return Math.abs(off-s.range*.68)<=s.width+extra;
  case "cross":return (Math.abs(x-s.x)<s.width+extra&&Math.abs(y-s.y)<s.range)||
   (Math.abs(y-s.y)<s.width+extra&&Math.abs(x-s.x)<s.range);
  case "scatter":return [-1,0,1].some(k=>{
   const cx=s.x+Math.cos(s.dir+k*2.05)*s.range*.52;
   const cy=s.y+Math.sin(s.dir+k*2.05)*s.range*.52;
   return Math.hypot(x-cx,y-cy)<s.width+extra;
  });
 }
 return false;
}
function draw(ctx,s,elapsed=0){
 if(!s)return;
 const t=clamp(1-s.time/Math.max(.01,s.total),0,1);
 ctx.save();ctx.lineWidth=3;ctx.lineJoin="round";
 ctx.globalAlpha=.38+.22*t;ctx.strokeStyle="#ffb066";
 ctx.fillStyle="rgba(146,27,30,"+(.08+.11*t).toFixed(3)+")";
 ctx.setLineDash([14,9]);ctx.lineDashOffset=-elapsed*28;
 const path=()=>{ctx.beginPath()};
 const segment=(turn=0,side=0)=>{
  const a=s.dir+turn,dx=Math.cos(a),dy=Math.sin(a),px=-dy,py=dx;
  const sx=s.ownerX+px*side,sy=s.ownerY+py*side;
  const ex=sx+dx*s.range,ey=sy+dy*s.range,w=s.width;
  path();ctx.moveTo(sx+px*w,sy+py*w);ctx.lineTo(ex+px*w,ey+py*w);
  ctx.lineTo(ex-px*w,ey-py*w);ctx.lineTo(sx-px*w,sy-py*w);ctx.closePath();
  ctx.fill();ctx.stroke();
 };
 const ring=(x,y,r,width)=>{
  path();ctx.arc(x,y,r+width,0,TWO);ctx.arc(x,y,Math.max(0,r-width),0,TWO,true);
  ctx.fill("evenodd");ctx.stroke();
 };
 const sector=(a,b,range,inner=0)=>{
  path();ctx.arc(s.ownerX,s.ownerY,range,a,b);
  if(inner>0)ctx.arc(s.ownerX,s.ownerY,inner,b,a,true);else ctx.lineTo(s.ownerX,s.ownerY);
  ctx.closePath();ctx.fill();ctx.stroke();
 };
 switch(s.shape){
  case "line":segment();break;
  case "twin":segment(0,64);segment(0,-64);break;
  case "fork":segment(.46);segment(-.46);break;
  case "fan":{const a=clamp(s.width/s.range,.38,1.3);sector(s.dir-a,s.dir+a,s.range);break;}
  case "sweep":{const a=clamp(s.width/s.range+.35,.8,1.5);sector(s.dir+.43-a,s.dir+.43+a,s.range,s.range*.24);break;}
  case "back":{const a=clamp(s.width/s.range+.22,.6,1.3);sector(s.dir+Math.PI-a,s.dir+Math.PI+a,s.range);break;}
  case "ground":path();ctx.arc(s.x,s.y,s.range,0,TWO);ctx.fill();ctx.stroke();break;
  case "ring":ring(s.x,s.y,s.range*.73,s.width);break;
  case "target":path();ctx.arc(s.x,s.y,s.width,0,TWO);ctx.fill();ctx.stroke();break;
  case "donut":ring(s.x,s.y,s.range*.68,s.width);break;
  case "cross":
   ctx.fillRect(s.x-s.width,s.y-s.range,s.width*2,s.range*2);
   ctx.strokeRect(s.x-s.width,s.y-s.range,s.width*2,s.range*2);
   ctx.fillRect(s.x-s.range,s.y-s.width,s.range*2,s.width*2);
   ctx.strokeRect(s.x-s.range,s.y-s.width,s.range*2,s.width*2);
   break;
  case "scatter":for(const k of [-1,0,1]){
   path();ctx.arc(s.x+Math.cos(s.dir+k*2.05)*s.range*.52,
    s.y+Math.sin(s.dir+k*2.05)*s.range*.52,s.width,0,TWO);
   ctx.fill();ctx.stroke();
  }break;
 }
 ctx.setLineDash([]);
 ctx.globalAlpha=.88;
 ctx.strokeStyle="#ffe2af";ctx.lineWidth=1.2;
 if(t>.72){path();ctx.arc(s.x,s.y,8+3*Math.sin(elapsed*11),0,TWO);ctx.stroke();}
 ctx.restore();
}
window.WildBossPatterns=Object.freeze({catalog,pattern,target,hit,draw});
})();