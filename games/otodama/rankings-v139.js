/* OTODAMA v139 verified online rating. All rating calculations run in the Cloudflare Worker. */
export const INITIAL_RATING=1000;
export const PROVISIONAL_MATCHES=5;
export function seasonJST(ms=Date.now()){const at=Number.isFinite(ms)?ms:Date.now();return new Date(at+9*60*60*1000).toISOString().slice(0,7)}
export function eloDelta(ratingA,ratingB,winner,matchesA=0,matchesB=0){
 if(winner!==0&&winner!==1)throw Error('winner');
 const a=Math.max(400,Math.min(2600,Number(ratingA)||INITIAL_RATING)),
       b=Math.max(400,Math.min(2600,Number(ratingB)||INITIAL_RATING));
 const expected=1/(1+Math.pow(10,(b-a)/400));
 const k=Math.min(Number(matchesA)||0,Number(matchesB)||0)<PROVISIONAL_MATCHES?48:32;
 const delta=Math.max(1,Math.round(k*((winner===0?1:0)-expected)));
 return [delta,-delta];
}
export function boundedRating(rating,delta){return Math.max(400,Math.min(2600,Math.round(rating+delta)))}
export function provisional(matches){return Number(matches||0)<PROVISIONAL_MATCHES}
