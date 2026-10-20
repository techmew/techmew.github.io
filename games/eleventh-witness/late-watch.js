/* First night: a quiet conversation after the discovery. */
(function(){
"use strict";
const S=window.NOVEL_DATA.scenes;
const n=(s,b,when)=>({k:"n",s,b,when}),d=(who,s,b)=>({k:"d",who,s,b}),j=to=>({k:"j",to}),f=(key,clue)=>({k:"f",key,clue}),c=(title,opts)=>({k:"c",title,opts});
S.lateWatch=[
 n("談話室では森下が短い木片を布に包んでいた。源蔵が救急箱を取りに行くと、森下は小さく頭を下げた。","lobby"),
 d("真理","食後、裏廊下へ行ったんでしょう。何を直したの？"),
 d("森下","扉の戸当たりです。風で閉まるので、木を削って挟みました。"),
 n("私は、森下が排気口の点検に行くと言っていたことを思い出した。",undefined,"followedMorishita"),
 n("私は食後の彼を見ていない。わからないことをわかったふりはできない。",undefined,"!followedMorishita"),
 c("森下にどう向き合う？",[
  {label:"皆の前で説明を求める",to:"latePublic",set:{challengedMorishita:true,trustMorishita:-1}},
  {label:"二人だけで事情を聞く",to:"latePrivate",set:{heardMorishitaAlone:true,trustMorishita:1}},
  {label:"今は絢のそばに座る",to:"lateAya",set:{protectedMorishita:true,trustAya:1}}
 ])
];
S.latePublic=[
 d("紗江","木片を見せてもらえますか。皆の前で。","lobby"),
 n("森下は布をほどいた。片面だけ青い木片だった。"),
 d("森下","廊下の扉に挟みました。見ていた人はいません。"),
 n("森下はそれを机に置いた。絢が何か言いかけたが、彼は席を離れた。"),
 f("wedgePublic","森下の木片は片面が青く、廊下の戸当たりに使ったという。確認した人はいない。"),
 j("lateReturn")
];
S.latePrivate=[
 n("廊下で森下は、木片の青い面を指で撫でた。","hall"),
 d("森下","父もここで修繕をしていました。もっと話を聞いておけばよかった。"),
 d("紗江","昔のことも？"),
 d("森下","ええ。父の話を僕が間違えて伝えるのが怖いんです。"),
 n("談話室へ戻ると真理が私を見た。森下の言葉を誰に伝えるべきか、まだ決められない。"),
 f("wedgePrivate","森下の父も霧立荘で修繕を担当。森下は過去の説明に自信がないと話した。"),
 j("lateReturn")
];
S.lateAya=[
 n("私は絢の隣に座った。彼女は湯呑みを二つ並べて、片方を私の方へ寄せた。","lobby"),
 d("絢","お茶、もう冷めちゃった。"),
 d("紗江","いいよ。ここに座ってても。"),
 d("絢","うん。……いて。"),
 n("森下は木片を工具箱にしまった。彼の説明を確かめる機会は、ひとまず過ぎていった。"),
 j("lateReturn")
];
S.lateReturn=[
 n("談話室の掛け時計は十一時一分。真理の腕時計は十時五十八分だった。","lobby"),
 d("紗江","時計、三分違う。"),
 d("真理","どっちが合ってるか、今はわからない。両方書いておく。"),
 f("clockDifference","談話室の掛け時計は23:01、真理の腕時計は22:58。どちらが正確かは未確認。"),
 j("lockdown")
];
for(const id of ["firstHourAya","firstHourChihiro","firstHourMari"]){
 const a=S[id],last=a[a.length-1];if(last.k!=="j"||last.to!=="lockdown")throw Error(id);
 last.to="lateWatch";
}
})();