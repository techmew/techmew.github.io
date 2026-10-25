/** User-facing public text safety gate for OTODAMA. No raw text is logged or persisted.
 * Not speech recognition: recorded voice is not automatically transcribed.
 * Conservatively filter obvious insults, violent threats, explicit references,
 * hate/harassment terms, personal contact details, social promotion and spam.
 */
const TERMS = [
// JP threats, bullying and harassment
'死ね','しね','氏ね','タヒね','ころす','殺す','殺してやる','殺害','ぶっ殺す','ぶち殺す','消えろ','くたばれ','自殺しろ','自害しろ','飛び降りろ','生きる価値ない','生きてる価値ない','社会のゴミ','人間のクズ','いじめ','いじり殺す','絶滅しろ','虐殺','脅迫','暴行','レイプ','陵辱','強姦','強制性交','痴漢','盗撮','脅し','爆破予告','殺人予告','襲撃予告','誘拐','虐待','拷問','監禁','人質','ストーカー','つきまとい',
// JP explicit/adult insults
'まんこ','ちんこ','ちんぽ','おまんこ','まんまん','セックス','せっくす','性交','性行為','自慰','オナニー','おなにー','射精','精液','膣内','膣外','中出し','なかだし','パイズリ','フェラ','クンニ','露出狂','売春','援助交際','援交','風俗嬢','無修正','アダルト動画','エロ動画','ポルノ','児童ポルノ','児ポ','ロリコン','ショタコン','淫行','近親相姦','獣姦','スカトロ','グロ画像','グロ動画','グロテスク','バカ野郎','ばかやろう','クソ野郎','くそやろう','きもい','きしょい','キショい','うざい','ゴミ野郎','ブス','デブ死ね','バカ死ね','アホ死ね','カス死ね','障害者死ね',
// JP discriminatory / hateful identity-targeting statements
'差別しろ','迫害しろ','民族浄化','人種差別','人種抹殺','ヘイトスピーチ','差別主義','白人至上主義','ネオナチ','ナチス万歳','ホロコースト否定','障害者は死ね','外国人は死ね','日本人は死ね','女は死ね','男は死ね','同性愛者は死ね','黒人は死ね','移民は死ね','在日死ね','非国民','穢多','非人','土人','チョン','シナ人','クロンボ','ガイジ','池沼','知恵遅れ',
// EN threats / sexual / harassment / discrimination
'kill yourself','kys','go die','die bitch','i will kill','i will murder','murder you','rape you','rape','rapist','sexual assault','child pornography','child porn','cp trading','pedo','pedophile','molest','incest','bestiality','porn','pornhub','hentai','xxx','nudes','onlyfans','sexcam','deepfake porn','blowjob','handjob','cumshot','fuck you','fucker','motherfucker','asshole','son of a bitch','slut','whore','bitch','cunt','dickhead','retard','retarded','subhuman','ethnic cleansing','white power','white supremacy','heil hitler','nazi salute','gas the','deport all','exterminate all','hate all','go back to your country','terrorist threat','bomb threat','school shooting','mass shooting','shoot you','dox','doxxing','swat you',
// JP/EN illicit money, impersonation, solicitation and spam
'振り込め詐欺','詐欺口座','架空請求','闇バイト','強盗募集','口座買います','口座売ります','クレカ売ります','クレジットカード番号','個人情報販売','個人情報晒し','住所晒し','電話番号晒し','無料配布リンク','無料で稼ぐ','確実に儲かる','絶対に儲かる','アカウント販売','不正アクセス','パスワード教えろ','ログイン情報','違法薬物','覚醒剤売ります','麻薬売ります','薬物売買','密売','偽物販売','偽ブランド','宣伝します','フォローしろ','チャンネル登録しろ','line追加','LINE交換','discord.gg','t.me/','telegram.me','bit.ly','tinyurl','discord招待','discord nitro','click here','free money','giveaway scam','buy followers','sell accounts','cheap crypto','guaranteed profit','password dump','credit card number','ssn dump','phishing link',
];
const unicodeLoose=s=>String(s??'').normalize('NFKC').toLowerCase()
 .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'')
 .replace(/[ァ-ヶ]/g,x=>String.fromCharCode(x.charCodeAt(0)-0x60))
 .replace(/[①②③④⑤⑥⑦⑧⑨]/g,ch=>String('①②③④⑤⑥⑦⑧⑨'.indexOf(ch)+1))
 .replace(/[@4]/g,'a').replace(/[0〇]/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/5/g,'s')
 .replace(/[\s\-_.,:;~+*・\/\\\[\](){}<>"'’“”`^|]+/g,'');
const termNormalized=[...new Set(TERMS.map(unicodeLoose).filter(s=>s.length>=2))];
const latinTerms=termNormalized.filter(s=>/^[a-z]+$/.test(s));
const otherTerms=termNormalized.filter(s=>!/^[a-z]+$/.test(s));
const latinMatchers=latinTerms.map(term=>new RegExp('(?:^|[^a-z])'+term+'(?:$|[^a-z])')); // prevent grape→rape, therapist→rapist false positives
const LINKS=/(https?:\/\/|www\.|(?:t\.me|telegram\.me|discord\.gg|bit\.ly|tinyurl\.com|line\.me)\/|@[a-z\d_]{2,}|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b(?:discord|telegram|line)\b\s*[:=])/i;
const CONTACT=/(?:\d[\s\-]?){11,}/;
export function isForbiddenName(value){
 const raw=String(value??'');if(raw.length>80||LINKS.test(raw)||CONTACT.test(raw))return true;
 const normalized=unicodeLoose(raw);return otherTerms.some(term=>normalized.includes(term))||latinMatchers.some(re=>re.test(normalized));
}
export function sanitizePublicName(value, seed=1){
 const raw=String(value??'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,32);
 if(!raw||isForbiddenName(raw)||/[<>\\]/.test(raw))return `オトダマ-${(Number(seed)>>>0).toString(36).toUpperCase().slice(0,7)}`;
 return raw.slice(0,24);
}
export const moderationTermCount=TERMS.length;
