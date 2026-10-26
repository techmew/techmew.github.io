// node >=22 test-rankings-v109.cjs
// Node SQLite integration for Cloudflare's SQL cursor shape. Does not deploy a Worker.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
const {webcrypto}=require('node:crypto');
const source=fs.readFileSync(__dirname+'/worker.js','utf8')
 .replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}')
 .replace("import { sanitizePublicName } from './moderation.js';",fs.readFileSync(__dirname+'/moderation.js','utf8').replace(/export /g,''))
 .replace('export default {','const workerDefault = {')
 .replace(/export class /g,'class ');
new vm.Script(source,{filename:'worker.js#test'});
const context={crypto:webcrypto,TextEncoder,Response,Request,URL,console,Date,Uint8Array,Set,Array,Math,JSON};
vm.runInNewContext(source+'\nglobalThis.rankTest={Rankings,Room,workerDefault};',context);
const db=new DatabaseSync(':memory:');
const sql={exec(query,...args){const statement=db.prepare(query);return statement.reader?statement.all(...args):(statement.run(...args),[])}};
const rank=new context.rankTest.Rankings({storage:{sql}},{});
const binding={get:()=>({fetch:request=>rank.fetch(request)}),idFromName:()=>1};
const submit=async(path,body)=>rank.fetch(new Request('https://internal.example'+path,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}));
(async()=>{
 const reg=async name=>{const r=await submit('/issue',{name});assert.equal(r.status,201);return r.json()};
 const a=await reg('こむぎ'),b=await reg('もも');
 assert.match(a.id,/^[a-f0-9]{32}$/);assert.match(a.token,/^[a-f0-9]{48}$/);
 assert.notEqual(a.token,b.token);
 let r=await submit('/validate',{token:a.token});
 assert.equal((await r.json()).id,a.id);
 r=await submit('/validate',{token:'0'.repeat(48)});
 assert.equal(r.status,401,'invented ranking identity is not accepted');
 const game=async(index,winner=0)=>{const id=index.toString(16).padStart(32,'0');
  const res=await submit('/result',{matchId:id,ids:[a.id,b.id],winner});
  return res.json();
 };
 assert.equal((await game(1)).ranked,true);
 assert.equal((await game(1)).ranked,false,'duplicate result id must not score twice');
 assert.equal((await game(2)).ranked,true);
 assert.equal((await game(3)).ranked,true);
 assert.equal((await game(4)).ranked,false,'same opponents capped at 3 ranked matches per day');
 const leaderboard=await rank.fetch(new Request('https://internal.example/leaderboard'));
 const score=await leaderboard.json();
 assert.equal(score.verifiedOnlineOnly,true);
 assert.equal(score.rows.length,2);
 assert.equal(score.rows[0].id,a.id);
 assert.equal(score.rows[0].wins,3);
 assert.equal(score.rows[0].points,110+120+130);
 assert.equal(score.rows[1].losses,3);
 r=await submit('/result',{matchId:'5'.repeat(32),ids:[a.id,a.id],winner:0});
 assert.equal(r.status,400,'same anonymous player cannot play itself for points');
 const room=new context.rankTest.Room({storage:{}},{RANKINGS:binding});
 const roomResult=await room.reportRankedResult({rankIds:[a.id,b.id],matchId:'6'.repeat(32)},0);
 assert.equal(roomResult,false,'fourth pairing should not farm more points');
 const api=await context.rankTest.workerDefault.fetch(new Request('https://otodama.example/leaderboard',{headers:{Origin:'https://techmew.github.io'}}),{RANKINGS:binding});
 assert.equal(api.status,200,'public leaderboard is readable');
 const blocked=await context.rankTest.workerDefault.fetch(new Request('https://otodama.example/result',{method:'POST',headers:{Origin:'https://techmew.github.io'},body:'{}'}),{RANKINGS:binding});
 assert.equal(blocked.status,404,'public clients cannot send score results');
 const options=await context.rankTest.workerDefault.fetch(new Request('https://otodama.example/identity',{method:'OPTIONS',headers:{Origin:'https://techmew.github.io'}}),{RANKINGS:binding});
 assert.equal(options.status,204,'identity registration CORS preflight');
 const csrf=await context.rankTest.workerDefault.fetch(new Request('https://otodama.example/identity',{method:'OPTIONS',headers:{Origin:'https://evil.example'}}),{RANKINGS:binding});
 assert.equal(csrf.status,403,'cross-site origins rejected');
 console.log('RANKINGS PASS: identities, token proof, 3-result cap, replay guard, monthly score, internal-only result, CORS');
 db.close();
})().catch(e=>{console.error(e);process.exitCode=1;db.close()});
