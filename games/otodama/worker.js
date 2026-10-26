/** OTODAMA ∞ room + random matchmaking server — Cloudflare Workers + Durable Objects
 * Room-code matchmaking, two participants, authoritative (prototype) battle replay.
 * User-recorded attacks are NOT relayed until trusted server-side moderation exists. No audio is persisted.
 * Not ranked-safe: client-origin voice data is still unverified; server ignores posted stats.
 */
import { DurableObject } from 'cloudflare:workers';
import { sanitizePublicName, isForbiddenName } from './moderation.js';

const safeJson = (obj, code=200) => new Response(JSON.stringify(obj), {
  status:code, headers:{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*','cache-control':'no-store'}
});
const clamp = (x,min,max) => Math.max(min,Math.min(max,Number(x)||0));
const ELEMENTS=new Set(['雷','炎','水','風','光','影','鋼','音','樹','霧']);
function autoRoll(state,seat,salt){
 const id=typeof state.matchId==='string'?state.matchId.slice(0,8):'0';
 let n=((parseInt(id,16)||0)^Math.imul(state.turn+1,0x9e3779b9)^Math.imul(seat+1,0x85ebca6b)^Math.imul(salt+1,0xc2b2ae35))>>>0;
 n=Math.imul(n^n>>>16,0x7feb352d);n=Math.imul(n^n>>>15,0x846ca68b);
 return ((n^n>>>16)>>>0)/4294967296;
}
// Unjoined room sockets and unsearched matchmaking sockets must not occupy free capacity forever.
function pruneIdleSockets(sockets,now){let closed=0;for(const ws of sockets){const a=ws.deserializeAttachment?.()||{};const opened=!a.creature&&Number.isFinite(a.openedAt)?a.openedAt:a.status==='connected'&&Number.isFinite(a.time)?a.time:0;if(ws.readyState===1&&opened>0&&now-opened>30000){try{ws.close(1008,'Join/search timeout');closed++}catch{}}}return closed;}

// Cap untrusted registration payloads even for chunked transfers without Content-Length.
async function readLimitedText(request,limit=512){
 const header=request.headers.get('content-length');
 if(header!==null&&(!/^[0-9]+$/.test(header)||Number(header)>limit))return null;
 if(!request.body){const value=await request.text();return new TextEncoder().encode(value).length<=limit?value:null;}
 const reader=request.body.getReader(),parts=[];let total=0;
 try{
  for(;;){const {done,value}=await reader.read();if(done)break;
   total+=value.byteLength;if(total>limit){await reader.cancel();return null}parts.push(value);
  }
  const bytes=new Uint8Array(total);let offset=0;
  for(const part of parts){bytes.set(part,offset);offset+=part.byteLength}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
 }catch{try{await reader.cancel()}catch{}return null}finally{reader.releaseLock()}
}
export default {
  async fetch(request,env) {
    const url = new URL(request.url);
    const origin=request.headers.get('Origin');
    if(origin&&!/^https:\/\/techmew\.github\.io$/.test(origin)&&!/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin))return safeJson({error:'Origin not allowed'},403);
    if(request.method==='OPTIONS'&&['/identity','/leaderboard'].includes(url.pathname))return new Response(null,{status:204,headers:{'access-control-allow-origin':origin||'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type','cache-control':'no-store'}});
    if(url.pathname==='/identity'&&request.method==='POST'||url.pathname==='/leaderboard'&&request.method==='GET'){
      const obj=env.RANKINGS.get(env.RANKINGS.idFromName('seasonal-v1'));
      if(request.method==='POST'&&!(request.headers.get('content-type')||'').toLowerCase().startsWith('application/json'))return safeJson({error:'JSON required'},415);
      const textBody=request.method==='POST'?await readLimitedText(request):null;
      if(request.method==='POST'&&textBody===null)return safeJson({error:'Registration payload too large or invalid'},413);
      return obj.fetch(new Request('https://internal.example/'+(url.pathname==='/identity'?'issue':'leaderboard'),{method:request.method,headers:{'content-type':'application/json'},...(textBody!==null?{body:textBody}:{})}));
    }
    if (url.pathname === '/' || url.pathname === '/health') return safeJson({ok:true,service:'otodama-room',version:'0.10.16',randomMatch:true,seasonalRanking:true});
    if(url.pathname==='/random'){
      if(request.method!=='GET'||(request.headers.get('Upgrade')||'').toLowerCase()!=='websocket')return safeJson({error:'WebSocket upgrade required'},426);
      return env.MATCHMAKER.get(env.MATCHMAKER.idFromName('global-v1')).fetch(request);
    }
    const match = /^\/room\/([A-HJ-NP-Z2-9]{6})$/.exec(url.pathname);
    if (!match) return safeJson({error:'Unknown path'},404);
    if (request.method !== 'GET' || (request.headers.get('Upgrade')||'').toLowerCase() !== 'websocket')
      return safeJson({error:'WebSocket upgrade required'},426);
    // Give every code a separate tiny Durable Object room.
    return env.ROOM.get(env.ROOM.idFromName(match[1])).fetch(request);
  }
};

export class Room extends DurableObject {
  async fetch(request) {
    const active=await this.ctx.storage.get('live');
    pruneIdleSockets(this.ctx.getWebSockets(),Date.now());
    const connected=this.peers();
    const joined=this.livePeers();
    // Unjoined WebSockets cannot occupy an active player's seat or block a valid resume.
    if(joined.length>=2)return safeJson({error:'This room is full'},409);
    let resumeSeat=-1,resumeToken='';
    if(active?.active){
      // A stale resume token cannot revive an expired match before the alarm runs.
      if(active.disconnectedAt&&Date.now()-active.disconnectedAt>15000)return safeJson({error:'Reconnection window expired'},410);
      resumeToken=new URL(request.url).searchParams.get('resume')||'';
      resumeSeat=active.tokens?.indexOf(resumeToken)??-1;
      if(!/^[a-f0-9]{32}$/.test(resumeToken)||resumeSeat<0||joined.some(p=>p.deserializeAttachment()?.seat===resumeSeat))
        return safeJson({error:'Match active: valid resume token required'},409);
    }
    if(resumeSeat<0&&connected.length>=4)return safeJson({error:'This room is full'},409);
    const [client,server]=Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    if(resumeSeat>=0){
      server.serializeAttachment({creature:active.creatures[resumeSeat],ready:false,seat:resumeSeat,resumeToken,rankId:active.rankIds?.[resumeSeat]||null,voiceConsent:{send:false,receive:false}});
      this.send(server,{type:'session',token:resumeToken,seat:resumeSeat});
      const peers=this.livePeers();
      if(peers.length===2){
        active.disconnectedAt=0;
        await this.ctx.storage.put('live',active);
        for(let seat=0;seat<2;seat++)this.send(peers[seat],{
          type:'live_resumed',creatures:seat===0?active.creatures:active.creatures.slice().reverse(),
          max:seat===0?active.max:active.max.slice().reverse(),
          hp:seat===0?active.hp:active.hp.slice().reverse(),
          charge:seat===0?active.charge:active.charge.slice().reverse(),
          dodgeCooldown:seat===0?active.dodgeCooldown:active.dodgeCooldown.slice().reverse(),
          skillArmed:seat===0?active.skillArmed:active.skillArmed.slice().reverse(),
          stance:seat===0?active.stance:active.stance.slice().reverse(),
          turnStance:seat===0?(active.turnStance||active.stance):(active.turnStance||active.stance).slice().reverse(),
          turn:active.turn,autoOnly:!!active.autoOnly,awakened:seat===0?(active.awakened||[false,false]):(active.awakened||[false,false]).slice().reverse()
        });
        // Reconnection must not reroll the attack, damage, stance or accepted inputs.
        // Resume the existing server-owned deadline rather than restarting the turn.
        if(active.phase==='telegraph'){
          this.liveSend(peers,active,{type:'live_turn',seq:active.turn,atk:active.atk,
            kind:active.kind,duration:900,elapsed:Math.max(0,Date.now()-active.startedAt),
            resumed:true,dodgeCooldown:active.dodgeCooldown,actionStatus:active.actions.map(a=>a?.action||null)});
          await this.ctx.storage.setAlarm(Math.max(Date.now()+1,active.startedAt+900));
        }else if(active.phase==='pause'){
          await this.ctx.storage.setAlarm(Math.max(Date.now()+1,active.pauseUntil||Date.now()+1));
        }
      }else this.send(server,{type:'live_wait',seconds:15});
      this.voicePolicy();
    }else{
      server.serializeAttachment({creature:null,ready:false,openedAt:Date.now()});
      // Clean unjoined sockets even without another visitor.
      await this.ctx.storage.setAlarm(Date.now()+30000);
    }
    return new Response(null,{status:101,webSocket:client});
  }
  peers(){return this.ctx.getWebSockets().filter(ws=>ws.readyState===1)}
  send(ws,obj){try{if(ws.readyState===1)ws.send(JSON.stringify(obj))}catch{}}
  voicePolicy(){const ps=this.livePeers();for(const peer of ps)this.send(peer,{type:'voice_policy',canSend:false,canReceive:false,reason:'サーバー側の音声内容審査が未実装のため、対戦相手への録音声送信を停止中'});}
  state(){const ps=this.livePeers();for(const peer of ps){
    const own=peer.deserializeAttachment()||{};
    this.send(peer,{type:'state',me:own.seat,youReady:!!own.ready,
      players:ps.map(p=>{let a=p.deserializeAttachment()||{};return{name:a.creature?.name||'接続中',ready:!!a.ready}})});
  }}
  // Browser-supplied battle stats are untrusted. Rebuild them from bounded voice metrics.
  baseStats(v){
    const z=v||{},vol=z.vol||0,p=z.pitch||0,r=z.res||0,h=z.rhythm||0,st=z.stable||0,br=z.breath||0;
    return [
      Math.round(clamp(25+vol*.14+r*.31+br*.18+h*.13,26,95)),
      Math.round(clamp(22+st*.36+r*.23+br*.12,27,95)),
      Math.round(clamp(19+p*.38+h*.34,27,95)),
      Math.round(clamp(24+st*.41+h*.25,27,95)),
      Math.round(clamp(23+r*.34+p*.29+st*.17,28,95))
    ];
  }
  cleanCreature(v){
    if(!v||typeof v!=='object'||Array.isArray(v))return null;
    // Reject malformed nested values instead of silently stringifying attacker-controlled objects.
    if(typeof v.name!=='string'||typeof v.type!=='string'||v.name.length>80||v.type.length>80||!Number.isSafeInteger(v.seed)||v.seed<0||v.seed>4294967295)return null;
    if(v.parts===null||v.voice===null||typeof v.parts!=='object'||typeof v.voice!=='object'||Array.isArray(v.parts)||Array.isArray(v.voice))return null;
    if(Object.keys(v.parts).length>40||Object.keys(v.voice).length>20)return null;
    const parts=v.parts,voice=v.voice;
    const nums={body:5,eyes:20,brows:20,nose:20,mouth:20,ears:20,left:30,right:30,color:10,family:12,crest:30,back:16,pattern:24,legs:16};
    // Reject coercible strings, negative values and nested objects instead of hiding invalid input with clamp().
    let safeParts={};for(const [key,max] of Object.entries(nums)){
      if(parts[key]!==undefined&&(!Number.isInteger(parts[key])||parts[key]<0||parts[key]>=max))return null;
      safeParts[key]=parts[key]??0;
    }
    let safeVoice={};for(const key of ['vol','pitch','res','rhythm','stable','breath']){
      if(!Number.isFinite(voice[key])||voice[key]<0||voice[key]>100)return null;
      safeVoice[key]=Math.floor(voice[key]);
    }
    const stats=this.baseStats(safeVoice),power=stats.reduce((a,b)=>a+b,0);
    return{seed:(Number(v.seed)||1)>>>0,name:sanitizePublicName(v.name,v.seed),
      element:ELEMENTS.has(v.element)?v.element:'音',type:sanitizePublicName(v.type,v.seed).slice(0,18),
      rank:power>=330?'A':power>=270?'B':'C',parts:safeParts,voice:safeVoice,stats};
  }
  simulate(a,b){
    const fighters=[a,b],max=fighters.map(c=>Math.round(140+c.stats[1]*.6)),hp=max.slice(),events=[];
    const kinds=['rush','aerial','warp','beam','combo','spin','uppercut','shockwave','meteor','counter'];
    let streak=0,last=-1;
    for(let turn=0;turn<35&&hp[0]>0&&hp[1]>0;turn++){
      let atk=turn%2;if(Math.random()<.34)atk=Math.random()<.5?0:1;
      if(atk===last)streak++;else streak=0;if(streak>=3){atk=1-atk;streak=0}last=atk;
      const def=1-atk,A=fighters[atk],B=fighters[def];let kind=kinds[Math.floor(Math.random()*kinds.length)];
      const crit=Math.random()<.08+A.stats[3]/950,hits=['combo','aerial','spin'].includes(kind)?2+Math.floor(Math.random()*4):1;
      let dodge=Math.random()<.065+B.stats[2]/750,counter=!dodge&&Math.random()<.04+B.stats[3]/1080;
      if(Math.random()<.065){kind='meteor';dodge=false}
      let damage=Math.max(4,Math.round((12+A.stats[0]*.2+A.stats[4]*.13-B.stats[1]*.11+(Math.random()*16-6))*(hits>1?1+.15*(hits-1):1)*(crit?1.45:1)));
      if(dodge)damage=0;else if(counter)damage=Math.max(2,Math.round(damage*.32));
      const selfDamage=counter?Math.round(10+B.stats[0]*.19+Math.random()*8+2):0;
      hp[def]=Math.max(0,hp[def]-damage);hp[atk]=Math.max(0,hp[atk]-selfDamage);
      let recovery=0;if(hp[atk]>0&&hp[atk]<max[atk]*.5&&Math.random()<.11){recovery=Math.round(8+Math.random()*17);hp[atk]=Math.min(max[atk],hp[atk]+recovery)}
      const arena=Math.random()<.115?['無重力ゾーン','落雷の嵐','残響増幅','空間反転','音速暴走'][Math.floor(Math.random()*5)]:null;
      events.push({atk,kind,damage,crit,hits,dodge,counter,selfDamage,recovery,arena,hp:hp.slice()});
    }
    return {events,max,winner:hp[0]/max[0]>=hp[1]/max[1]?0:1};
  }
  // Hibernation-safe authoritative live battle. All HP, skill costs and action windows
  // are decided by the Durable Object clock, never by a client's damage report.
  livePeers(){return this.peers().filter(p=>p.deserializeAttachment()?.creature).sort((a,b)=>a.deserializeAttachment().seat-b.deserializeAttachment().seat).slice(0,2)}
  liveSend(peers, state, packet){
    for(let seat=0;seat<peers.length;seat++)this.send(peers[seat],{
      ...packet,
      ...(packet.hp?{hp:seat===0?packet.hp:packet.hp.slice().reverse()}:{}),
      ...(packet.charge?{charge:seat===0?packet.charge:packet.charge.slice().reverse()}:{}),
      ...(packet.dodgeCooldown?{dodgeCooldown:seat===0?packet.dodgeCooldown:packet.dodgeCooldown.slice().reverse()}:{}),
      ...(packet.actionStatus?{actionStatus:seat===0?packet.actionStatus:packet.actionStatus.slice().reverse()}:{}),
      ...(packet.atk!==undefined?{atk:packet.atk===seat?0:1}:{}),
      ...(packet.winner!==undefined?{winner:packet.winner===seat?0:1}:{}),
      ...(packet.awakenSide!==undefined?{awakenSide:packet.awakenSide<0?-1:packet.awakenSide===seat?0:1}:{})
    });
  }
  sendLatencyProbe(ws){
    const a=ws.deserializeAttachment()||{};
    const nonce=Array.from(crypto.getRandomValues(new Uint8Array(8)),b=>b.toString(16).padStart(2,'0')).join('');
    ws.serializeAttachment({...a,pingNonce:nonce,pingAt:Date.now()});
    this.send(ws,{type:'live_ping',nonce});
  }
  async startLiveBattle(peers){
    const creatures=peers.map(p=>p.deserializeAttachment().creature);
    const autoOnly=peers.some(p=>p.deserializeAttachment().autoOnly===true)||
      peers.every(p=>!!p.deserializeAttachment().rankId);
    const max=creatures.map(c=>Math.round(140+c.stats[1]*.6));
    const state={active:true,autoOnly,awakened:[false,false],phase:'telegraph',turn:0,creatures,max,hp:max.slice(),charge:[18,18],
      stance:['balance','balance'],turnStance:['balance','balance'],skillArmed:[false,false],dodgeCooldown:[0,0],actions:[null,null],startedAt:0,
      tokens:peers.map(p=>p.deserializeAttachment().resumeToken),rankIds:peers.map(p=>p.deserializeAttachment().rankId||null),matchId:Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join(''),disconnectedAt:0};
    await this.ctx.storage.put('live',state);
    for(let i=0;i<2;i++){this.send(peers[i],{type:'live_start',creatures:i===0?creatures:creatures.slice().reverse(),max:i===0?max:max.slice().reverse(),duration:900});this.sendLatencyProbe(peers[i]);}
    await this.announceLiveTurn(state,peers);
  }
  async announceLiveTurn(state,peers){
    if(peers.length!==2){await this.ctx.storage.delete('live');return}
    if(state.turn>=40){await this.finishLive(state,peers);return}
    const atk=state.turn%2,def=1-atk;
    const kinds=['rush','aerial','warp','beam','combo','spin','uppercut','shockwave','meteor','counter'];
    const A=state.creatures[atk],B=state.creatures[def];
    const moves=state.autoOnly?(A.stats[0]>A.stats[2]*1.08?['meteor','uppercut','shockwave']:
      A.stats[2]>A.stats[1]*1.07?['combo','aerial','warp']:['rush','beam','spin']):kinds;
    const kind=moves[Math.floor((state.autoOnly?autoRoll(state,atk,3):Math.random())*moves.length)];
    const damage=Math.max(5,Math.round(12+A.stats[0]*.21+A.stats[4]*.12-B.stats[1]*.1+Math.random()*9));
    state.phase='telegraph';state.turnStance=state.stance.slice();state.startedAt=Date.now();state.atk=atk;state.kind=kind;state.damage=damage;state.actions=[null,null];
    if(state.dodgeCooldown[def]>0)state.dodgeCooldown[def]--;
    await this.ctx.storage.put('live',state);
    if(state.turn>0&&state.turn%5===0)for(const peer of peers)this.sendLatencyProbe(peer);
    this.liveSend(peers,state,{type:'live_turn',seq:state.turn,atk,kind,duration:900,
      warning:atk===0?'攻撃チャンス':'敵の攻撃に備えろ',dodgeCooldown:state.dodgeCooldown});
    await this.ctx.storage.setAlarm(state.startedAt+900);
  }
  async reportRankedResult(state,winner){
    if(!this.env?.RANKINGS||!Array.isArray(state.rankIds)||state.rankIds.length!==2||!state.rankIds.every(Boolean))return false;
    try{
      const board=this.env.RANKINGS.get(this.env.RANKINGS.idFromName('seasonal-v1'));
      const result=await board.fetch(new Request('https://internal.example/result',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({matchId:state.matchId,ids:state.rankIds,winner})}));
      return result.ok&&!!(await result.json()).ranked;
    }catch{return false}
  }
  async finishLive(state,peers){
    state.active=false;state.phase='finished';
    const winner=state.hp[0]/state.max[0]>=state.hp[1]/state.max[1]?0:1;
    const ranked=await this.reportRankedResult(state,winner);
    this.liveSend(peers,state,{type:'live_end',winner,hp:state.hp,charge:state.charge,ranked});
    await this.ctx.storage.delete('live');
  }
  async resolveLiveTurn(state,peers){
    const atk=state.atk,def=1-atk,guard=state.actions[def],lockedStance=state.turnStance||state.stance;
    const auto=!!state.autoOnly,A=state.creatures[atk],B=state.creatures[def];
    const parry=auto?autoRoll(state,def,5)<Math.min(.29,.045+B.stats[1]/670):
      guard?.action==='guard'&&guard.valid===true;
    const dodge=auto?!parry&&state.dodgeCooldown[def]===0&&
      autoRoll(state,def,6)<Math.min(.22,.025+B.stats[2]/780):
      guard?.action==='dodge'&&guard.valid===true;
    if(auto&&dodge)state.dodgeCooldown[def]=3;
    let damage=state.damage;
    const strike=auto?autoRoll(state,atk,7)<Math.min(.42,.12+A.stats[2]/400):
      state.actions[atk]?.action==='strike'&&state.actions[atk]?.valid===true;
    let awakenSide=-1;
    if(auto){
      state.awakened=state.awakened||[false,false];
      for(const side of [atk,def])if(!state.awakened[side]&&state.hp[side]/state.max[side]<.38&&
        autoRoll(state,side,8)<.76){
        state.awakened[side]=true;awakenSide=side;
        state.charge[side]=Math.min(100,state.charge[side]+24);
      }
      if(state.charge[atk]>=60&&(autoRoll(state,atk,9)<.72||state.hp[atk]<state.max[atk]*.4)){
        state.charge[atk]-=60;state.skillArmed[atk]=true;
      }
      if(state.awakened[atk])damage=Math.round(damage*1.17);
    }
    if(strike){damage=Math.round(damage*1.22);state.charge[atk]=Math.min(100,state.charge[atk]+6);}
    if(lockedStance[atk]==='rush')damage=Math.round(damage*1.22);
    if(lockedStance[atk]==='guard')damage=Math.round(damage*.9);
    if(lockedStance[def]==='rush')damage=Math.round(damage*1.12);
    if(lockedStance[def]==='guard')damage=Math.round(damage*.76);
    let skill=false;
    if(state.skillArmed[atk]){damage=Math.round(damage*1.85);state.skillArmed[atk]=false;skill=true}
    if(parry){damage=Math.min(2,Math.round(damage*.09));state.charge[def]=Math.min(100,state.charge[def]+24);state.hp[atk]=Math.max(0,state.hp[atk]-8)}
    else if(dodge){damage=0;state.charge[def]=Math.min(100,state.charge[def]+9)}
    else if(auto||!guard)state.charge[def]=Math.min(100,state.charge[def]+6);
    state.charge[atk]=Math.min(100,state.charge[atk]+12);
    state.hp[def]=Math.max(0,state.hp[def]-damage);
    const finished=state.hp.some(h=>h<=0)||state.turn>=39;
    this.liveSend(peers,state,{type:'live_impact',seq:state.turn,atk,kind:state.kind,damage,parry,dodge,skill,strike,
      hp:state.hp,charge:state.charge,finished,autoOnly:auto,awakenSide});
    if(finished){await this.finishLive(state,peers);return}
    state.turn++;state.phase='pause';state.pauseUntil=Date.now()+280;await this.ctx.storage.put('live',state);
    await this.ctx.storage.setAlarm(state.pauseUntil);
  }
  async alarm(){
    pruneIdleSockets(this.ctx.getWebSockets(),Date.now());
    const state=await this.ctx.storage.get('live');if(!state?.active)return;
    const peers=this.livePeers();
    if(peers.length!==2){
      if(!state.disconnectedAt){state.disconnectedAt=Date.now();await this.ctx.storage.put('live',state)}
      if(Date.now()<state.disconnectedAt+15000){await this.ctx.storage.setAlarm(state.disconnectedAt+15000);return}
      const ranked=peers.length===1?await this.reportRankedResult(state,peers[0].deserializeAttachment().seat):false;
      for(const peer of peers){this.send(peer,{type:'live_forfeit',winner:0,ranked});const a=peer.deserializeAttachment();peer.serializeAttachment({...a,ready:false})}
      await this.ctx.storage.delete('live');this.state();return;
    }
    if(state.phase==='telegraph')await this.resolveLiveTurn(state,peers);
    else if(state.phase==='pause')await this.announceLiveTurn(state,peers);
  }
  async liveAction(ws,data,attachment){
    const state=await this.ctx.storage.get('live');if(!state?.active)return;
    const peers=this.livePeers(),seat=peers.indexOf(ws);if(seat<0)return;
    const action=data.action;
    if(peers.length!==2)return;
    if(state.autoOnly){this.send(ws,{type:'live_ack',action,valid:false,reason:'creature_auto_only'});return;}
    if(action==='stance'){
      if(!['rush','balance','guard'].includes(data.value))return;
      state.stance[seat]=data.value;await this.ctx.storage.put('live',state);
      this.send(ws,{type:'live_ack',action,value:data.value,valid:true,effective:'next_turn'});return;
    }
    if(action==='skill'){
      if(state.charge[seat]<60||state.skillArmed[seat]){this.send(ws,{type:'live_ack',action:'skill',valid:false,charge:state.charge[seat]});return;}
      state.charge[seat]-=60;state.skillArmed[seat]=true;
      await this.ctx.storage.put('live',state);
      this.send(ws,{type:'live_ack',action,valid:true,charge:state.charge[seat]});return;
    }
    if(!['guard','dodge','strike'].includes(action)||state.phase!=='telegraph'||data.seq!==state.turn||state.actions[seat])return;
    if((action==='strike')!==(seat===state.atk))return;
    const elapsed=Date.now()-state.startedAt;
    const grace=Math.min(90,Math.round((attachment.rtt||0)/2));
    const valid=action==='strike'?elapsed>=270-grace&&elapsed<=660+grace:action==='guard'?elapsed>=180-grace&&elapsed<=650+grace:elapsed>=80-grace&&elapsed<=450+grace&&state.dodgeCooldown[seat]===0;
    if(action==='dodge'&&state.dodgeCooldown[seat]===0)state.dodgeCooldown[seat]=3;
    state.actions[seat]={action,valid};await this.ctx.storage.put('live',state);
    this.send(ws,{type:'live_ack',action,seq:state.turn,valid});
  }
  async webSocketMessage(ws,raw){
    // Online audio transfer is disabled; gameplay packets should never be megabyte-sized.
    if(typeof raw!=='string'){try{ws.close(1003,'Text packets only')}catch{}return}
    if(raw.length>8192){try{ws.close(1009,'Message too large')}catch{}return}
    let data;try{data=JSON.parse(raw)}catch{return}
    if(!data||typeof data!=='object'||Array.isArray(data)){this.send(ws,{type:'error',message:'無効なメッセージ'});return;}
    const attachment=ws.deserializeAttachment()||{creature:null,ready:false};
    if(!attachment.creature&&attachment.openedAt&&Date.now()-attachment.openedAt>30000){try{ws.close(1008,'Join timeout')}catch{}return;}
    const now=Date.now(),expired=now-(attachment.rateAt||0)>10000;
    const windowStart=expired?now:attachment.rateAt;
    const burst=expired?1:(attachment.rateCount||0)+1;
    if(burst>30){this.send(ws,{type:'error',message:'送信が多すぎます'});try{ws.close(1008,'rate limited')}catch{}return;}
    attachment.rateAt=windowStart;attachment.rateCount=burst;ws.serializeAttachment(attachment);
    if(data.type==='pong'){
      if(typeof data.nonce==='string'&&data.nonce===attachment.pingNonce&&Number.isFinite(attachment.pingAt)){
        ws.serializeAttachment({...attachment,rtt:Math.min(220,Math.max(0,now-attachment.pingAt)),pingNonce:null,pingAt:null});
      }
      return;
    }
    if(data.type==='action'){await this.liveAction(ws,data,attachment);return;}
    if(data.type==='join'){
      if(attachment.creature)return;
      const creature=this.cleanCreature(data.creature);
      if(!creature){this.send(ws,{type:'error',message:'キャラデータが不正です'});return}
      let rankId=null;
      if(this.env?.RANKINGS&&typeof data.playerToken==='string'&&/^[a-f0-9]{48}$/.test(data.playerToken)){
        try{const board=this.env.RANKINGS.get(this.env.RANKINGS.idFromName('seasonal-v1'));
          const response=await board.fetch(new Request('https://internal.example/validate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({token:data.playerToken})}));
          if(response.ok){const player=await response.json();if(player.valid&&/^[a-f0-9]{32}$/.test(player.id))rankId=player.id;}
        }catch{}
      }
      // Validate the optional ranking token before claiming a seat. Recheck capacity
      // afterwards to avoid concurrent awaiting joins assigning the same seat.
      if((await this.ctx.storage.get('live'))?.active){this.send(ws,{type:'error',message:'対戦開始済みです'});return}
      const occupied=new Set(this.livePeers().map(p=>p.deserializeAttachment().seat));
      const seat=occupied.has(0)?1:0;
      if(occupied.has(seat)){this.send(ws,{type:'error',message:'満室です'});return}
      const token=Array.from(crypto.getRandomValues(new Uint8Array(16)),x=>x.toString(16).padStart(2,'0')).join('');
      ws.serializeAttachment({...attachment,creature,ready:false,seat,resumeToken:token,rankId,voiceConsent:{send:false,receive:false}});
      this.send(ws,{type:'session',token,seat});this.state();this.voicePolicy();return;
    }
    if(data.type==='voice_consent'){
      if(!attachment.creature||typeof data.send!=='boolean'||typeof data.receive!=='boolean')return;
      ws.serializeAttachment({...attachment,voiceConsent:{send:data.send,receive:data.receive}});
      this.voicePolicy();return;
    }
    if(data.type==='voice'){
      // A client-side "passed" flag is forgeable. Do not relay user audio
      // until independently verifiable server-side speech moderation exists.
      // Local/offline reviewed playback is unaffected.
      this.send(ws,{type:'voice_rejected',reason:'オンライン音声送信は審査導入まで停止中'});
      return;
    }
    if(data.type==='ready'){
      if((await this.ctx.storage.get('live'))?.active||this.startingBattle)return;
      if(!attachment.creature)return;
      ws.serializeAttachment({...attachment,ready:true,autoOnly:data.autoOnly===true});
      const peers=this.livePeers();if(peers.length!==2){this.state();return}
      const both=peers.map(s=>s.deserializeAttachment()||{});
      if(both.every(p=>p.creature&&p.ready)){
        for(const p of peers){const a=p.deserializeAttachment();p.serializeAttachment({...a,ready:false})}
        this.startingBattle=true;
        try{await this.startLiveBattle(peers)}finally{this.startingBattle=false}
      }
      this.state();
    }
  }
  async webSocketClose(ws){
    const attachment=ws.deserializeAttachment()||{};
    const active=await this.ctx.storage.get('live');
    if(active?.active){
      // Unknown sockets must never be able to forfeit a match.
      if(!Number.isInteger(attachment.seat)||!attachment.resumeToken||active.tokens?.[attachment.seat]!==attachment.resumeToken)return;
      if(this.livePeers().some(p=>p.deserializeAttachment().seat===attachment.seat))return;
      if(!active.disconnectedAt)active.disconnectedAt=Date.now();
      await this.ctx.storage.put('live',active);
      await this.ctx.storage.setAlarm(active.disconnectedAt+15000);
      for(const peer of this.livePeers())this.send(peer,{type:'live_wait',seconds:15});
      return;
    }
    for(const peer of this.livePeers()){
      let data=peer.deserializeAttachment();if(data)peer.serializeAttachment({...data,ready:false});
      this.send(peer,{type:'left'});
    }
    this.state();this.voicePolicy();
  }
  async webSocketError(ws){try{ws.close(1011,'Connection error')}catch{}}
}


/** Single, simple FIFO matchmaking queue for the prototype.
 * Client connects to /random and sends {type:"search"}. A pair gets a
 * random room code and reconnects to /room/CODE using the existing protocol.
 * Matchmaker uses hibernatable WebSockets; queued players have no active CPU.
 */

// Server-owned online standings. Only Room can call /result through its DO binding;
// the public Worker router deliberately never forwards those internal endpoints.
export class Rankings extends DurableObject {
 constructor(ctx,env){
  super(ctx,env);this.sql=ctx.storage.sql;
  this.sql.exec('CREATE TABLE IF NOT EXISTS players (id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created INTEGER NOT NULL)');
  this.sql.exec('CREATE TABLE IF NOT EXISTS scores (season TEXT NOT NULL, id TEXT NOT NULL, points INTEGER NOT NULL DEFAULT 0, wins INTEGER NOT NULL DEFAULT 0, losses INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, best INTEGER NOT NULL DEFAULT 0, updated INTEGER NOT NULL, PRIMARY KEY(season,id))');
  this.sql.exec('CREATE TABLE IF NOT EXISTS results (match_id TEXT PRIMARY KEY, pair TEXT NOT NULL, created INTEGER NOT NULL)');
  this.sql.exec('CREATE TABLE IF NOT EXISTS issue_limits (bucket INTEGER PRIMARY KEY, amount INTEGER NOT NULL)');
 }
 async hashToken(token){
  const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
 }
 async fetch(request){
  const path=new URL(request.url).pathname,method=request.method;
  const season=new Date().toISOString().slice(0,7);
  if(path==='/leaderboard'&&method==='GET'){
   const rows=[...this.sql.exec('SELECT p.id AS id,p.name AS name,s.points AS points,s.wins AS wins,s.losses AS losses,s.best AS best FROM scores s JOIN players p ON p.id=s.id WHERE s.season=? ORDER BY s.points DESC,s.wins DESC,s.updated ASC LIMIT 30',season)];
   return safeJson({season,verifiedOnlineOnly:true,rows:rows.map((r,i)=>({...r,rank:i+1}))});
  }
  if(!['/issue','/validate','/result'].includes(path)||method!=='POST')return safeJson({error:'Not found'},404);
  let data;try{data=await request.json()}catch{return safeJson({error:'Invalid JSON'},400)}
  if(!data||typeof data!=='object'||Array.isArray(data))return safeJson({error:'Invalid object'},400);
  if(path==='/issue'){
   if(typeof data.name!=='string'||!data.name.trim()||data.name.length>28)return safeJson({error:'Name must be 1-28 characters'},400);
   if(isForbiddenName(data.name))return safeJson({error:'使用できない名前です。別の名前を入力してください'},422);
   const name=sanitizePublicName(data.name,0).slice(0,18);
   const bucket=Math.floor(Date.now()/3600000);
   this.sql.exec('DELETE FROM issue_limits WHERE bucket<?',bucket-48);
   const count=[...this.sql.exec('SELECT amount FROM issue_limits WHERE bucket=?',bucket)][0]?.amount||0;
   if(count>=300)return safeJson({error:'Registration is temporarily limited'},429);
   const random=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),b=>b.toString(16).padStart(2,'0')).join('');
   const id=random(16),token=random(24),hash=await this.hashToken(token);
   this.sql.exec('INSERT INTO players(id,token_hash,name,created) VALUES(?,?,?,?)',id,hash,name,Date.now());
   this.sql.exec('INSERT INTO issue_limits(bucket,amount) VALUES(?,1) ON CONFLICT(bucket) DO UPDATE SET amount=amount+1',bucket);
   return safeJson({id,name,token,warning:'Keep this anonymous token private. Clearing browser storage loses this identity.'},201);
  }
  if(path==='/validate'){
   const token=typeof data.token==='string'?data.token:'';
   if(!/^[a-f0-9]{48}$/.test(token))return safeJson({valid:false},401);
   const hash=await this.hashToken(token);
   const player=[...this.sql.exec('SELECT id,name FROM players WHERE token_hash=?',hash)][0];
   return player?safeJson({valid:true,id:player.id,name:player.name}):safeJson({valid:false},401);
  }
  // Internal, server-authored match results only. Reject guest/unverified match identities.
  if(!/^[a-f0-9]{32}$/.test(data.matchId||'')||!Array.isArray(data.ids)||data.ids.length!==2||
     !data.ids.every(id=>typeof id==='string'&&/^[a-f0-9]{32}$/.test(id))||
     data.ids[0]===data.ids[1]||![0,1].includes(data.winner))return safeJson({ranked:false,reason:'Unverified players'},400);
  const [p0,p1]=data.ids,now=Date.now(),pair=[p0,p1].sort().join(':');
  const participants=[...this.sql.exec('SELECT id FROM players WHERE id IN (?,?)',p0,p1)];
  if(participants.length!==2)return safeJson({ranked:false,reason:'Unregistered player'},400);
  if([...this.sql.exec('SELECT match_id FROM results WHERE match_id=?',data.matchId)].length)return safeJson({ranked:false,reason:'Already recorded'});
  const repeats=[...this.sql.exec('SELECT COUNT(*) AS n FROM results WHERE pair=? AND created>?',pair,now-86400000)][0]?.n||0;
  if(repeats>=3)return safeJson({ranked:false,reason:'Same-opponent daily scoring cap'});
  this.sql.exec('INSERT INTO results(match_id,pair,created) VALUES(?,?,?)',data.matchId,pair,now);
  for(let seat=0;seat<2;seat++){
   const id=data.ids[seat],won=seat===data.winner;
   this.sql.exec('INSERT INTO scores(season,id,points,wins,losses,streak,best,updated) VALUES(?,?,0,0,0,0,0,?) ON CONFLICT(season,id) DO NOTHING',season,id,now);
   if(won){
    const prev=[...this.sql.exec('SELECT streak FROM scores WHERE season=? AND id=?',season,id)][0]?.streak||0;
    const next=prev+1,points=100+Math.min(100,next*10);
    this.sql.exec('UPDATE scores SET points=points+?,wins=wins+1,streak=?,best=MAX(best,?),updated=? WHERE season=? AND id=?',points,next,next,now,season,id);
   }else this.sql.exec('UPDATE scores SET losses=losses+1,streak=0,updated=? WHERE season=? AND id=?',now,season,id);
  }
  this.sql.exec('DELETE FROM results WHERE created<?',now-2592000000);
  return safeJson({ranked:true,season});
 }
}

export class Matchmaker extends DurableObject {
  async fetch() {
    pruneIdleSockets(this.ctx.getWebSockets(),Date.now());
    // Keep the free global queue bounded against abandoned/open socket floods.
    if(this.ctx.getWebSockets().filter(ws=>ws.readyState===1).length>=64)return safeJson({error:'Queue busy; retry shortly'},503);
    const [client,server]=Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({status:'connected',time:Date.now()});
    const pending=await this.ctx.storage.getAlarm?.();
    await this.ctx.storage.setAlarm(Math.min(pending??Infinity,Date.now()+30000));
    return new Response(null,{status:101,webSocket:client});
  }
  async webSocketMessage(ws,raw){
    const previous=ws.deserializeAttachment()||{},now=Date.now();
    const fresh=now-(previous.rateAt||0)>10000;
    const rateAt=fresh?now:previous.rateAt;
    const rateCount=fresh?1:(previous.rateCount||0)+1;
    if(rateCount>20){try{ws.close(1008,'Search rate limit')}catch{}return;}
    ws.serializeAttachment({...previous,rateAt,rateCount});
    if(typeof raw!=='string'||raw.length>256)return;
    let msg;try{msg=JSON.parse(raw)}catch{return}
    if(!msg||typeof msg!=='object'||Array.isArray(msg))return;
    if(msg.type==='cancel'){ws.serializeAttachment({status:'cancelled',time:Date.now()});try{ws.close(1000,'cancelled')}catch{}return;}
    if(msg.type!=='search')return;
    const state=ws.deserializeAttachment()||{};
    if(state.status==='connected'&&Date.now()-(state.time||0)>30000){try{ws.close(1008,'Search timeout')}catch{}return;}
    if(state.status!=='connected')return;
    ws.serializeAttachment({status:'waiting',time:Date.now()});
    await this.pair();
  }
  async pair(){
    let waiting=this.ctx.getWebSockets().filter(w=>w.readyState===1&&w.deserializeAttachment()?.status==='waiting')
      .sort((a,b)=>a.deserializeAttachment().time-b.deserializeAttachment().time);
    const cutoff=Date.now()-120000;for(const socket of waiting){if(socket.deserializeAttachment()?.time<cutoff){try{socket.send(JSON.stringify({type:'error',message:'待機時間が終了しました。再検索してください'}));socket.close(1000,'expired')}catch{}}}
    waiting=waiting.filter(w=>w.readyState===1&&w.deserializeAttachment()?.time>=cutoff);
    const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    while(waiting.length>=2){
      const a=waiting.shift(),b=waiting.shift();
      if(a.readyState!==1||b.readyState!==1)continue;
      const bytes=crypto.getRandomValues(new Uint8Array(6));
      const code=Array.from(bytes,x=>chars[x%chars.length]).join('');
      for(const socket of [a,b]){
        socket.serializeAttachment({status:'paired',time:Date.now()});
        try{socket.send(JSON.stringify({type:'matched',code}));socket.close(1000,'paired')}catch{}
      }
    }
    const deadlines=this.ctx.getWebSockets().filter(w=>w.readyState===1).map(w=>{
      const a=w.deserializeAttachment()||{};
      return a.status==='waiting'?a.time+120000:a.status==='connected'?a.time+30000:Infinity;
    }).filter(Number.isFinite);
    if(deadlines.length)await this.ctx.storage.setAlarm(Math.min(...deadlines));
  }
  async alarm(){pruneIdleSockets(this.ctx.getWebSockets(),Date.now());await this.pair()}
  async webSocketClose(ws,code,reason){try{ws.close(code||1000,reason||'closed')}catch{}}
  async webSocketError(ws){try{ws.close(1011,'Socket error')}catch{}}
}
