/* 11-person visual identity source of truth; does not reveal the missing person's name.
   Never infer a portrait exists just because its target filename is planned. */
(function(){
"use strict";
const EXPRESSIONS=Object.freeze(["neutral","smile","doubt","anger","fear","shock","resolve"]);
const PEOPLE=[
 {id:"sae",speaker:"紗江",name:"三枝 紗江",role:"主人公・記録者",color:"#84D5EF",silhouette:"long-straight",hair:"黒髪ロング・右寄り前髪",eyes:"大きな伏し目",outfit:"紺の冬コート・暗赤色マフラー・ノート",unique:"note",previewColumn:1},
 {id:"kohei",speaker:"航平",name:"瀬戸 航平",role:"幼なじみ",color:"#A8E3B5",silhouette:"tall-broad",hair:"暗茶色の無造作な短髪",eyes:"丸い瞳と太い眉",outfit:"オリーブのコート・無地マフラー",unique:"avert"},
 {id:"riko",speaker:"莉子",name:"片桐 莉子",role:"皮肉屋の旧友",color:"#F4A8B0",silhouette:"short-forward",hair:"短い切りっぱなしの黒髪",eyes:"鋭い大きな目・左の八重歯",outfit:"墨色のフード付き上着",unique:"bite",previewColumn:0},
 {id:"aya",speaker:"絢",name:"水原 絢",role:"山荘の宿主",color:"#F3CF88",silhouette:"slender-upright",hair:"栗色の髪を低くまとめる",eyes:"穏やかな垂れ目",outfit:"生成りのニット・焦茶カーディガン・エプロン",unique:"host",previewColumn:2},
 {id:"takumi",speaker:"匠",name:"高瀬 匠",role:"写真家",color:"#BAACFF",silhouette:"thin-angular",hair:"乱れた黒髪・長い前髪",eyes:"細い縁の角形眼鏡",outfit:"濃灰ジャケット・カメラストラップ",unique:"camera",previewColumn:3},
 {id:"keisuke",speaker:"圭介",name:"佐伯 圭介",role:"医師",color:"#94BFF8",silhouette:"thin-upright",hair:"整えた黒髪",eyes:"切れ長・眼鏡なし",outfit:"深青ニット・濃灰コート・医療バッグ",unique:"examine"},
 {id:"mari",speaker:"真理",name:"宮地 真理",role:"地方記者",color:"#ECA3D6",silhouette:"angular-sharp",hair:"片側耳かけの黒ショートボブ",eyes:"切り上がった眉と鋭い瞳",outfit:"墨色ジャケット・ワイン色タイ・録音機",unique:"record"},
 {id:"genzo",speaker:"源蔵",name:"大橋 源蔵",role:"料理長",color:"#DDB78D",silhouette:"elder-stocky",hair:"白髪交じりの短髪",eyes:"太い白眉・深い皺",outfit:"濃茶のシャツ・生成りの仕事エプロン",unique:"protect"},
 {id:"chihiro",speaker:"千尋",name:"藤堂 千尋",role:"若手従業員",color:"#D3EB98",silhouette:"small-triangular",hair:"低い一つ結びの暗い栗色",eyes:"不安げな丸い瞳",outfit:"くすんだ青の制服・灰色エプロン",unique:"listen"},
 {id:"morishita",speaker:"森下",name:"森下 宗太",role:"設備管理",color:"#82CFC2",silhouette:"square-heavy",hair:"刈り込んだ黒髪",eyes:"重い眉・無口な目元",outfit:"濃緑の作業着・手袋・工具ベルト",unique:"inspect"},
 // Fiction's missing eleventh: shown as a damaged-photo silhouette only until revealed.
 {id:"missing11",speaker:null,name:"欠番",role:"11年前の集合写真に残る欠番",color:"#C7CFDA",silhouette:"unrevealed",hair:"未公開",eyes:"未公開",outfit:"古い冬服の後ろ姿",unique:"photo",spoilerProtected:true}
].map(item=>Object.freeze(Object.assign({expressions:Object.freeze([...EXPRESSIONS,item.unique]),artStatus:item.previewColumn===undefined?"planned":"temporary-preview",portraitAsset:null},item)));
const bySpeaker=Object.freeze(Object.fromEntries(PEOPLE.filter(p=>p.speaker).map(p=>[p.speaker,p])));
const byId=Object.freeze(Object.fromEntries(PEOPLE.map(p=>[p.id,p])));
window.NOVEL_CAST=Object.freeze({
 version:"2026-10-21-all-eleven-v1",
 people:Object.freeze(PEOPLE),bySpeaker,byId,
 colors:Object.freeze(Object.assign(Object.fromEntries(PEOPLE.filter(p=>p.speaker).map(p=>[p.speaker,p.color])),{"売店の人":"#D2D5D6","不明":"#D8D0EA"})),
 neutralNarration:"#FFFFFF",
 // On-screen approved previews still cover only four speakers. Other faces are NOT implemented.
 previewAtlas:"assets/cast-preview-20261021.webp"
});
})();