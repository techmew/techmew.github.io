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

// Expanded anatomy/sexual slang coverage (JP, EN, common euphemisms).
const EXTRA_TERMS = [
'ちんちん','ちんぼ','ちんぽこ','おちんちん','おちんぽ','ちん毛','陰茎','陰嚢','睾丸','金玉','きんたま','たまたま','ペニス','ちんこ','ぽこちん','まら','肉棒','亀頭','包茎','勃起','ぼっき','陰部','性器','男性器','女性器','生殖器','外陰部','陰核','クリトリス','クリ','陰唇','大陰唇','小陰唇','膣','ちつ','ヴァギナ','バギナ','まんすじ','まん毛','あそこ','おっぱい','乳首','乳輪','乳房','ちくび','ぱいぱい','おしりの穴','肛門','アナル','ケツ穴','尻穴','お尻の穴','性欲','性癖','発情','欲情','絶頂','潮吹き','精子','精巣','前立腺','オーガズム','エッチ','えっち','エロい','えろい','すけべ','スケベ','淫語','淫乱','痴女','痴男','変態','裸','全裸','ヌード','自慰行為','手淫','手コキ','手こき','口淫','口内射精','顔射','ぶっかけ','本番行為','挿入','挿れる','ハメ撮り','はめどり','ハメる','乱交','輪姦','緊縛','SMプレイ','性奴隷','セフレ','セックスフレンド','パパ活','ママ活','未成年淫行','児童買春',
'penis','vagina','vulva','clitoris','testicle','testicles','testes','scrotum','genitals','genitalia','boobs','tits','nipples','areola','breasts','butthole','anus','anal sex','pussy','cock','dick','boner','erection','masturbation','jerk off','orgasm','ejaculation','semen','sperm','cum','cumming','blow job','hand job','rimjob','deepthroat','naked','nude','horny','fetish','sexual intercourse','sexual content','sex toy','sex worker','hooker','prostitute','gangbang','creampie','bukkake','fingering','penetration','pornography','erotic','erotica','nsfw','milf','dildo','vibrator',
'性交渉','性犯罪','強制わいせつ','わいせつ','猥褻','痴漢行為','盗撮動画','性的暴行','性的虐待','性暴力','児童性的虐待'
];
const unicodeLoose=s=>String(s??'').normalize('NFKC').toLowerCase()
 .replace(/[\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/g,'')
 .replace(/[ぁ-ゖ]/g,x=>x)\n .replace(/[ァ-ヶ]/g,x=>String.fromCharCode(x.charCodeAt(0)-0x60))
 .replace(/[①②③④⑤⑥⑦⑧⑨]/g,ch=>String('①②③④⑤⑥⑦⑧⑨'.indexOf(ch)+1))
 .replace(/[@4]/g,'a').replace(/[0〇]/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/5/g,'s')
 .replace(/[\s\-_.,:;~+*・\/\\\[\](){}<>"'’“”`^|]+/g,'');
const termNormalized=[...new Set([...TERMS,...EXTRA_TERMS].map(unicodeLoose).filter(s=>s.length>=2))];
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
export const moderationTermCount=TERMS.length+EXTRA_TERMS.length;
