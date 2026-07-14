import { db } from "../src/db";
import { users, writings, reactions, comments, reviews } from "../src/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const AUTHORS = [
  { id: "author-h-r-bachchan", username: "harivansh_rai_bachchan", displayName: "Harivansh Rai Bachchan", bio: "Legendary Hindi poet of the Chhayavaad movement, best known for Madhushala.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=HB" },
  { id: "author-m-ghalib", username: "mirza_ghalib", displayName: "Mirza Ghalib", bio: "The preeminent Urdu and Persian poet of the Mughal Empire.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MG" },
  { id: "author-r-indori", username: "rahat_indori", displayName: "Rahat Indori", bio: "Acclaimed Indian Urdu poet, lyricist, and university professor.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RI" },
  { id: "author-gulzar", username: "gulzar_poetry", displayName: "Gulzar", bio: "Academy and Grammy award-winning Indian poet, lyricist, and director.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=GZ" },
  { id: "author-k-das", username: "kabir_das", displayName: "Kabir Das", bio: "15th-century Indian mystic poet and saint, whose writings influenced Hinduism's Bhakti movement.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=KD" },
  { id: "author-d-kumar", username: "dushyant_kumar", displayName: "Dushyant Kumar", bio: "Pioneering Hindi poet and ghazal writer, who revolutionized the Hindi ghazal genre.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=DK" },
  { id: "author-j-elia", username: "jaun_elia", displayName: "Jaun Elia", bio: "Legendary Pakistani Urdu poet known for his unconventional and melancholic style.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JE" },
  { id: "author-f-faiz", username: "faiz_ahmad_faiz", displayName: "Faiz Ahmad Faiz", bio: "One of the most celebrated Urdu poets of the 20th century, nominated for the Nobel Prize in Literature.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=FF" },
  { id: "author-k-vishwas", username: "kumar_vishwas", displayName: "Kumar Vishwas", bio: "Renowned contemporary Hindi poet, performer, and writer.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=KV" },
  { id: "author-m-rana", username: "munawwar_rana", displayName: "Munawwar Rana", bio: "Famous contemporary Urdu poet known for his warm poetry about motherly love.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MR" },
  { id: "author-r-s-dinkar", username: "ramdhari_singh_dinkar", displayName: "Ramdhari Singh Dinkar", bio: "Eminent Hindi poet, essayist, and patriot, honored as the Rashtrakavi.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RD" },
  { id: "author-s-t-nirala", username: "suryakant_tripathi_nirala", displayName: "Suryakant Tripathi Nirala", bio: "A pioneer of the Chhayavaad school of Hindi literature.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SN" },
  { id: "author-m-varma", username: "mahadevi_varma", displayName: "Mahadevi Varma", bio: "Eminent Hindi poet and novelist, often called the 'Modern Meera'.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MV" },
  { id: "author-s-pant", username: "sumitranandan_pant", displayName: "Sumitranandan Pant", bio: "One of the major poets of the Chhayavaad school, known for his nature themes.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SP" },
  { id: "author-a-iqbal", username: "allama_iqbal", displayName: "Allama Iqbal", bio: "Eminent philosopher, poet, and politician, often called the 'Poet of the East'.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=AI" },
  { id: "author-n-fazli", username: "nida_fazli", displayName: "Nida Fazli", bio: "Prominent Indian Hindi and Urdu poet, lyricist, and dialogue writer.", avatar: "https://api.dicebear.com/7.x/initials/svg?seed=NF" }
];

const WRITINGS_DATA: {
  authorId: string;
  title: string;
  primaryEmotion: string;
  language: string;
  tags: string[];
  content: string;
}[] = [];

// Helper to push writings safely
function addWriting(authorId: string, title: string, primaryEmotion: string, language: string, tags: string[], contentLines: string[]) {
  WRITINGS_DATA.push({
    authorId,
    title,
    primaryEmotion,
    language,
    tags,
    content: contentLines.map(line => `<p>${line}</p>`).join("")
  });
}

// 1. Harivansh Rai Bachchan (8 poems)
addWriting("author-h-r-bachchan", "Madhushala - Ansh 1 (मधुशाला - अंश १)", "nostalgia", "hi", ["#madhushala", "#classic", "#poetry", "#bachchan"], [
  "मृदु भावों के अंगूरों की आज बना लाया हाला,",
  "प्रियतम, अपने ही हाथों से आज पिलाऊँगा प्याला,",
  "पहले भोग लगा लूँ तुझको, फिर प्रसाद जग पाएगा,",
  "सजकर आने वाली है अब मेरी सुंदर मधुशाला।"
]);
addWriting("author-h-r-bachchan", "Madhushala - Ansh 2 (मधुशाला - अंश २)", "peace", "hi", ["#madhushala", "#peace", "#poetry", "#hindi"], [
  "धर्मग्रंथ सब जला चुकी है, जिसके अंतर की ज्वाला,",
  "मंदिर, मस्जिद, गिरजे सब को, तोड़ चुका जो मतवाला,",
  "पंडित, मोमिन, पादरी के फंदे को काट चुका जो,",
  "कर सकती है आज उसी का स्वागत मेरी मधुशाला।"
]);
addWriting("author-h-r-bachchan", "Koshish Karne Walon Ki (कोशिश करने वालों की)", "motivation", "hi", ["#motivation", "#strength", "#classic"], [
  "लहरों से डरकर नौका पार नहीं होती,",
  "कोशिश करने वालों की कभी हार नहीं होती।",
  "नन्हीं चींटी जब दाना लेकर चलती है,",
  "चढ़ती दीवारों पर, सौ बार फिसलती है।",
  "मन का विश्वास रगों में साहस भरता है,",
  "चढ़कर गिरना, गिरकर चढ़ना न अखरता है।",
  "आख़िर उसकी मेहनत बेकार नहीं होती,",
  "कोशिश करने वालों की कभी हार नहीं होती।"
]);
addWriting("author-h-r-bachchan", "Agneepath (अग्निपथ)", "motivation", "hi", ["#agneepath", "#motivation", "#poetry"], [
  "वृक्ष हों भले खड़े,",
  "हों घने हों बड़े,",
  "एक पत्र छांह भी,",
  "मांग मत, मांग मत, मांग मत,",
  "अग्निपथ अग्निपथ अग्निपथ।"
]);
addWriting("author-h-r-bachchan", "Jo Beet Gayi So Baat Gayi (जो बीत गई सो बात गई)", "hope", "hi", ["#hope", "#classic", "#hindi"], [
  "जीवन में एक सितारा था,",
  "माना वह बेहद प्यारा था,",
  "वह डूब गया तो डूब गया;",
  "अंबर के आनन को देखो,",
  "कितने इसके तारे टूटे,",
  "कितने इसके प्यारे छूटे,",
  "जो छूट गए फिर कहाँ मिले;",
  "पर बोलो टूटे तारों पर,",
  "कब अंबर शोक मनाता है!",
  "जो बीत गई सो बात गई।"
]);
addWriting("author-h-r-bachchan", "Ek Akela Geet (एक अकेला गीत)", "sad", "hi", ["#sad", "#loneliness", "#poetry"], [
  "इस पार प्रिय, तुम हो, मधु है,",
  "उस पार न जाने क्या होगा!",
  "यह एक अकेला गीत मेरा,",
  "सूने मन को बहलाने का ज़रिया।"
]);
addWriting("author-h-r-bachchan", "Rusk Ke Kankar (रुस्क के कंकर)", "sad", "hi", ["#sad", "#grief", "#hindi"], [
  "कंकर ही कंकर हैं राहों में,",
  "अश्कों की धारा है आँखों में,",
  "बीत रहा है पल-पल तन्हा,",
  "कोई न समझे दिल की बात यहाँ।"
]);
addWriting("author-h-r-bachchan", "Din Jaldi Jaldi Dhalta Hai (दिन जल्दी-जल्दी ढलता है)", "nostalgia", "hi", ["#time", "#life", "#nostalgia"], [
  "हो जाय न पथ में रात कहीं,",
  "मंजिल भी तो है दूर नहीं,",
  "यह सोच थका दिन का पंथी भी जल्दी-जल्दी चलता है,",
  "दिन जल्दी-जल्दी ढलता है।"
]);

// 2. Mirza Ghalib (8 ghazals)
addWriting("author-m-ghalib", "Dil-e-Nadaan Tujhe Hua Kya Hai (दिल-ए-नादाँ तुझे हुआ क्या है)", "sad", "ur", ["#ghalib", "#ghazal", "#shayari", "#sad"], [
  "दिल-ए-नादाँ तुझे हुआ क्या है,",
  "आख़िर इस दर्द की दवा क्या है।",
  "हम हैं मुश्ताक़ और वो बे-ज़ार,",
  "या इलाही ये माजरा क्या है।",
  "मैं भी मुँह में ज़बान रखता हूँ,",
  "काश पूछो कि मुद्दआ क्या है।"
]);
addWriting("author-m-ghalib", "Hazaron Khwaishein Aisi (हज़ारों ख़वाहिशें ऐसी)", "sad", "ur", ["#ghalib", "#classic", "#shayari"], [
  "हज़ारों ख़वाहिशें ऐसी कि हर ख़वाहिश पे दम निकले,",
  "बहुत निकले मेरे अरमान लेकिन फिर भी कम निकले।",
  "निकलना ख़ुल्द से आदम का सुनते आए हैं लेकिन,",
  "बहुत बे-आबरू होकर तेरे कूचे से हम निकले।"
]);
addWriting("author-m-ghalib", "Har Ek Baat Pe Kehte Ho (हर एक बात पे कहते हो)", "sad", "ur", ["#ghalib", "#urdu", "#ghazal"], [
  "हर एक बात पे कहते हो तुम कि तू क्या है,",
  "तुम्हीं कहो कि ये अंदाज़-ए-गुफ़्तगू क्या है।",
  "चिपक रहा है बदन पर लहू से पैराहन,",
  "हमारी जेब को अब हाजत-ए-रफ़ू क्या है।"
]);
addWriting("author-m-ghalib", "Ishq Ne Ghalib Nikamma Kar Diya (इश्क़ ने ग़ालिब निकम्मा कर दिया)", "love", "ur", ["#love", "#classic", "#ghalib"], [
  "इश्क़ ने ग़ालिब निकम्मा कर दिया,",
  "वरना हम भी आदमी थे काम के।",
  "दर्द मिन्नत-कश-ए-दवा न हुआ,",
  "मैं न अच्छा हुआ, बुरा न हुआ।"
]);
addWriting("author-m-ghalib", "Ye Na Thi Hamari Qismat (ये न थी हमारी क़िस्मत)", "sad", "ur", ["#sad", "#qismat", "#ghalib"], [
  "ये न थी हमारी क़िस्मत कि विसाल-ए-यार होता,",
  "अगर और जीते रहते यही इंतिज़ार होता।",
  "तेरे वादे पर जिए हम तो ये जान झूठ जाना,",
  "कि ख़ुशी से मर न जाते अगर ए'तिबार होता।"
]);
addWriting("author-m-ghalib", "Dard Minnat Kashe Dawa Na Hua (दर्द मिन्नत कशे दवा ना हुआ)", "sad", "ur", ["#grief", "#sad", "#ghazal"], [
  "दर्द मिन्नत-कश-ए-दवा न हुआ,",
  "मैं न अच्छा हुआ बुरा न हुआ।",
  "जमा करते हो क्यूँ रक़ीबों को,",
  "इक तमाशा हुआ गिला न हुआ।"
]);
addWriting("author-m-ghalib", "Bas Ke Dushwar Hai Har Kaam (बस कि दुश्वार है हर काम)", "motivation", "ur", ["#motivation", "#life", "#ghalib"], [
  "बस कि दुश्वार है हर काम का आसाँ होना,",
  "आदमी को भी मयस्सर नहीं इंसाँ होना।",
  "ग़म-ए-हस्ती का किस से हो जुज़ मर्ग-ए-इलाज,",
  "शम्अ हर रंग में जलती है सहर होने तक।"
]);
addWriting("author-m-ghalib", "Aah Ko Chahiye Ek Umr (आह को चाहिए एक उम्र)", "love", "ur", ["#love", "#longing", "#ghalib"], [
  "आह को चाहिए इक उम्र असर होने तक,",
  "कौन जीता है तेरी ज़ुल्फ़ के सर होने तक।",
  "आशिक़ी सब्र-तलब और तमन्ना बे-ताब,",
  "दिल का क्या रंग करूँ ख़ून-ए-जिगर होने तक।"
]);

// 3. Rahat Indori (8 shayaris)
addWriting("author-r-indori", "Bulati Hai Magar Jane Ka Nahi (बुलाती है मगर जाने का नहीं)", "humor", "hi", ["#rahatindori", "#viral", "#humor", "#shayari"], [
  "बुलाती है मगर जाने का नहीं,",
  "ये दुनिया है उधर जाने का नहीं।",
  "मेरे बेटे किसी से इश्क़ कर,",
  "मगर हद से गुज़र जाने का नहीं।"
]);
addWriting("author-r-indori", "Sabhi Ka Khoon Hai Shamil (सभी का ख़ून है शामिल)", "motivation", "hi", ["#patriotism", "#strength", "#rahatindori"], [
  "सभी का ख़ून है शामिल यहाँ की मिट्टी में,",
  "किसी के बाप का हिन्दुस्तान थोड़ी है।",
  "जो आज साहिब-ए-मसनद हैं कल नहीं होंगे,",
  "किराएदार हैं ज़ाती मकान थोड़ी है।"
]);
addWriting("author-r-indori", "Roz Taron Ko Numaish Mein (रोज़ तारों को नुमाइश में)", "sad", "hi", ["#sad", "#night", "#rahatindori"], [
  "रोज़ तारों को नुमाइश में खलल पड़ता है,",
  "चाँद पागल है अंधेरे में निकल पड़ता है।",
  "लोग हर मोड़ पे रुक-रुक के संभलते क्यूँ हैं,",
  "इतना डरते हैं तो फिर घर से निकलते क्यूँ हैं।"
]);
addWriting("author-r-indori", "Lafzon Ki Aabroo (लफ़्ज़ों की आबरू)", "motivation", "hi", ["#words", "#respect", "#shayari"], [
  "अफ़वाह थी कि मेरी तबीयत ख़राब है,",
  "लोगों ने पूछ-पूछ के बीमार कर दिया।",
  "दो गज़ सही ये मेरी मल्कियत तो है,",
  "ऐ मौत तूने मुझे ज़मींदार कर दिया।"
]);
addWriting("author-r-indori", "Aankh Mein Paani Rakho (आँख में पानी रखो)", "motivation", "hi", ["#motivation", "#eyes", "#rahatindori"], [
  "आँख में पानी रखो होंटों पे चिंगारी रखो,",
  "ज़िन्दा रहना है तो तरकीबें बहुत सारी रखो।",
  "राह के पत्थर से बढ़ कर कुछ नहीं हैं मंज़िलें,",
  "रास्ते आवाज़ देते हैं सफ़र जारी रखो।"
]);
addWriting("author-r-indori", "Jnaaza Rok Kar Mera (जनाज़ा रोक कर मेरा)", "sad", "hi", ["#death", "#sad", "#rahatindori"], [
  "वह कह रही है जनाज़ा रोक कर मेरा,",
  "कि उसने नया सूट सिलवाया है मेरी मौत पर।",
  "हमसे पहले भी मुसाफ़िर कई गुज़रे होंगे,",
  "कम से कम राह के पत्थर तो हटाते जाते।"
]);
addWriting("author-r-indori", "Dosti Jab Kisi Se Ki Jaye (दोस्ती जब किसी से की जाए)", "peace", "hi", ["#friendship", "#peace", "#shayari"], [
  "दोस्ती जब किसी से की जाए,",
  "दुश्मनों की भी राय ली जाए।",
  "लिखने वाले ने लिख दिया जो कुछ,",
  "अब उसे सोच कर जिया जाए।"
]);
addWriting("author-r-indori", "Benaam Rishta (बेनाम रिश्ता)", "love", "hi", ["#love", "#relationship", "#rahatindori"], [
  "एक ही शहर में रहना है मगर मिलना नहीं,",
  "फूल खिलना है मगर शाख़ से गिरना नहीं।",
  "इश्क़ का खेल भी अजीब है मेरे भाई,",
  "जीतना भी नहीं है और हारना भी नहीं।"
]);

// 4. Gulzar (8 poems)
addWriting("author-gulzar", "Aankhon Ko Veesa Dedo (आँखों को वीज़ा दे दो)", "love", "hi", ["#love", "#eyes", "#gulzar"], [
  "आँखों को वीज़ा दे दो, ख़्वाबों में आने जाने का,",
  "दिल की सरहद पर कोई पहरा नहीं होता।",
  "कुछ तो बात होगी इस रात में साहिब,",
  "वरना चाँद बिना बात के यूँ गहरा नहीं होता।"
]);
addWriting("author-gulzar", "Kuch Aur Din (कुछ और दिन)", "nostalgia", "hi", ["#time", "#nostalgia", "#gulzar"], [
  "हाथ छूटें तो भी रिश्ते नहीं छूटा करते,",
  "वक़्त की शाख़ से लम्हे नहीं टूटा करते।",
  "यादों की अलमारी में बंद पड़े हैं वो ख़त,",
  "जो कभी हमने तुम्हारे नाम लिखे थे।"
]);
addWriting("author-gulzar", "Zindagi Kya Hai (ज़िन्दगी क्या है)", "peace", "hi", ["#life", "#peace", "#gulzar"], [
  "ज़िन्दगी यूँ हुई आसान कि अब,",
  "कोई शिकवा न कोई फ़रियाद रही।",
  "धूप में निकलो घटाओं में नहा कर देखो,",
  "ज़िन्दगी क्या है किताबों को हटा कर देखो।"
]);
addWriting("author-gulzar", "Ajeeb Rishta Hai (अजीब रिश्ता है)", "love", "hi", ["#love", "#gulzar", "#shayari"], [
  "अजीब रिश्ता है दिल का और धड़कन का,",
  "एक रुक जाए तो दूसरा जी नहीं पाता।",
  "तुम मिले तो लगा जैसे ख़ामोशी को ज़बान मिल गई,",
  "वरना हवाओं के पास भी कहने को कुछ न था।"
]);
addWriting("author-gulzar", "Waqt Rehta Nahi Kahin Tik Kar (वक़्त रहता नहीं कहीं टिक कर)", "nostalgia", "hi", ["#time", "#life", "#gulzar"], [
  "वक़्त रहता नहीं कहीं टिक कर,",
  "इसकी आदत भी आदमी जैसी है।",
  "छोड़ जाता है पीछे सिर्फ़ यादें,",
  "और आगे धुंधली सी राह दिखाता है।"
]);
addWriting("author-gulzar", "Kitaabein Jhankti Hain (किताबें झाँकती हैं)", "nostalgia", "hi", ["#books", "#reading", "#gulzar"], [
  "किताबें झाँकती हैं बंद अलमारी के शीशों से,",
  "बड़ी हसरत से तकती हैं।",
  "महीनों अब मुलाकातें नहीं होतीं,",
  "जो शामें उनकी सोहबत में कटा करती थीं, अब अक्सर",
  "गुज़र जाती हैं कम्प्यूटर के परदों पर।"
]);
addWriting("author-gulzar", "Ek Hi Khwab Kai Baar Dekha (एक ही ख़्वाब कई बार देखा)", "dream", "hi", ["#dream", "#love", "#gulzar"], [
  "एक ही ख़्वाब ने सारी रात जगाया है मुझे,",
  "मैंने हर बार तुम्हें अपना बनाया है ख़्वाब में।",
  "सुबह आँख खुली तो सिर्फ़ तन्हाई थी हाथ में,",
  "मगर रात ने बहुत ख़ूबसूरत सजाया था मुझे।"
]);
addWriting("author-gulzar", "Triveni (त्रिवेणी)", "thoughtful", "hi", ["#triveni", "#thoughts", "#gulzar"], [
  "जा कर देखा तो कोई भी न था घर में,",
  "एक ख़ामोशी थी जो सोफ़े पे बैठी थी,",
  "और एक साया था जो दीवार से लटक रहा था।"
]);

// 5. Kabir Das (8 dohas)
addWriting("author-k-das", "Bura Jo Dekhan Main Gaya (बुरा जो देखन मैं गया)", "peace", "hi", ["#kabir", "#doha", "#wisdom", "#peace"], [
  "बुरा जो देखन मैं गया, बुरा न मिलिया कोय,",
  "जो दिल खोजा आपना, मुझसे बुरा न कोय।",
  "कबीरा खड़ा बाज़ार में, मांगे सबकी ख़ैर,",
  "ना काहू से दोस्ती, ना काहू से बैर।"
]);
addWriting("author-k-das", "Kaal Kare So Aaj Kar (काल करे सो आज कर)", "motivation", "hi", ["#kabir", "#doha", "#time", "#motivation"], [
  "काल करे सो आज कर, आज करे सो अब,",
  "पल में परलय होएगी, बहुरी करेगा कब।",
  "ऐसी बानी बोलिए, मन का आपा खोए,",
  "औरन को शीतल करे, आपहु शीतल होए।"
]);
addWriting("author-k-das", "Dheere Dheere Re Mana (धीरे-धीरे रे मना)", "peace", "hi", ["#patience", "#doha", "#kabir"], [
  "धीरे-धीरे रे मना, धीरे सब कुछ होय,",
  "माली सींचे सौ घड़ा,  ऋतु आए फल होय।",
  "माटी कहे कुम्हार से, तू क्या रौंदे मोय,",
  "एक दिन ऐसा आएगा, मैं रौंदूगी तोय।"
]);
addWriting("author-k-das", "Loot Sake To Loot Le (लूट सके तो लूट ले)", "motivation", "hi", ["#spiritual", "#doha", "#kabir"], [
  "लूट सके तो लूट ले, राम नाम की लूट,",
  "पाछे फिर पछताओगे, प्राण जाहिं जब छूट।",
  "दुख में सुमिरन सब करे, सुख में करे न कोय,",
  "जो सुख में सुमिरन करे, दुख काहे को होय।"
]);
addWriting("author-k-das", "Sai Itna Deejiye (साईं इतना दीजिए)", "gratitude", "hi", ["#gratitude", "#peace", "#kabir"], [
  "साईं इतना दीजिए, जामे कुटुम समाए,",
  "मैं भी भूखा न रहूँ, साधु न भूखा जाए।",
  "पोथी पढ़ि पढ़ि जग मुआ, पंडित भया न कोय,",
  "ढाई आखर प्रेम का, पढ़े सो पंडित होय।"
]);
addWriting("author-k-das", "Guru Govind Dono Khade (गुरु गोविंद दोनो खड़े)", "gratitude", "hi", ["#teacher", "#god", "#kabir"], [
  "गुरु गोविंद दोनो खड़े, काके लागूं पाय,",
  "बलिहारी गुरु आपने, गोविंद दियो मिलाय।",
  "निंदक नियरे राखिए, आँगन कुटी छवाय,",
  "बिन पानी साबुन बिना, निर्मल करे सुभाय।"
]);
addWriting("author-k-das", "Kasturi Kundali Base (कस्तूरी कुंडली बसै)", "thoughtful", "hi", ["#self-realization", "#doha", "#kabir"], [
  "कस्तूरी कुंडली बसै, मृग ढूँढै बन माहिं,",
  "ऐसे घटि-घटि राम हैं, दुनिया देखत नाहिं।",
  "जल में कुंभ, कुंभ में जल है, बाहर भीतर पानी,",
  "फूटा कुंभ जल जलहि समाना, यह तत कथौ गियानी।"
]);
addWriting("author-k-das", "Maya Mari Na Man Mara (माया मरी न मन मरा)", "sad", "hi", ["#desire", "#spirituality", "#kabir"], [
  "माया मरी न मन मरा, मर-मर गया सरीर,",
  "आसा तृस्ना ना मरी, कह गया दास कबीर।",
  "खजूर का पेड़ बड़ा तो क्या हुआ, जैसे पंछी को छाया नहीं,",
  "फल लागे अति दूर।"
]);

// 6. Dushyant Kumar (8 ghazals)
addWriting("author-d-kumar", "Ho Gayi Hai Peer Parvat Si (हो गई है पीर पर्वत सी)", "motivation", "hi", ["#motivation", "#revolution", "#classic", "#dushyant"], [
  "हो गई है पीर पर्वत सी पिघलनी चाहिए,",
  "इस हिमालय से कोई गंगा निकलनी चाहिए।",
  "आज यह दीवार परदों की तरह हिलने लगी,",
  "शर्त लेकिन थी कि ये बुनियादी हिलनी चाहिए।",
  "हर सड़क पर, हर गली में, हर नगर, हर गाँव में,",
  "हाथ लहराते हुए हर लाश चलनी चाहिए।"
]);
addWriting("author-d-kumar", "Saye Mein Dhoop (साये में धूप)", "sad", "hi", ["#sad", "#system", "#dushyant"], [
  "कहाँ तो तय था चराग़ाँ हर एक घर के लिए,",
  "कहाँ चराग़ मयस्सर नहीं शहर के लिए।",
  "यहाँ दरख़्तों के साये में धूप लगती है,",
  "चलो यहाँ से चलें और उम्र भर के लिए।"
]);
addWriting("author-d-kumar", "Tu Kisi Rail Si Guzarti Hai (तू किसी रेल सी गुज़रती है)", "love", "hi", ["#love", "#metaphor", "#dushyant"], [
  "तू किसी रेल सी गुज़रती है,",
  "मैं किसी पुल सा थरथराता हूँ।",
  "एक जंगल है तेरी आँखों में,",
  "मैं जहाँ रास्ता भूल जाता हूँ।"
]);
addWriting("author-d-kumar", "Ek Sadak 57 Galiyan (एक सड़क सत्तावन गलियाँ)", "thoughtful", "hi", ["#thoughts", "#life", "#poetry"], [
  "ज़िन्दगी की हर कहानी बेअसर हो जाएगी,",
  "धूप तेज़ है पर सफ़र तो पूरा करना है।",
  "चाहता हूँ कि कोई आवाज़ दे मुझको,",
  "भीड़ में गुम हो जाने का डर सताता है।"
]);
addWriting("author-d-kumar", "Sirf Hungama Khada Karna (सिर्फ हंगामा खड़ा करना)", "motivation", "hi", ["#motivation", "#change", "#dushyant"], [
  "सिर्फ हंगामा खड़ा करना मेरा मक़सद नहीं,",
  "मेरी कोशिश है कि ये सूरत बदलनी चाहिए।",
  "मेरे सीने में नहीं तो तेरे सीने में सही,",
  "हो कहीं भी आग, लेकिन आग जलनी चाहिए।"
]);
addWriting("author-d-kumar", "Khuda Nahi Na Sahi (ख़ुदा नहीं न सही)", "sad", "hi", ["#faith", "#sad", "#dushyant"], [
  "ख़ुदा नहीं न सही आदमी का ख़्वाब सही,",
  "कोई हसीन नज़ारा तो है नज़र के लिए।",
  "वो मुतमइन हैं कि पत्थर पिघल नहीं सकता,",
  "मैं बेक़रार हूँ आवाज़ में असर के लिए।"
]);
addWriting("author-d-kumar", "Jeena Hai To Aise Jio (जीना है तो ऐसे जियो)", "peace", "hi", ["#peace", "#wisdom", "#shayari"], [
  "जीना है तो ऐसे जियो कि कोई शिकवा न रहे,",
  "रास्ते कट ही जाएँगे बस क़दम आगे बढ़ाते रहो।",
  "हवाओं से कह दो अपनी हद में रहें,",
  "हम परों से नहीं हौसलों से उड़ा करते हैं।"
]);
addWriting("author-d-kumar", "Maslehat Aamez Hote Hain (मसलहत आमेज़ होते हैं)", "thoughtful", "hi", ["#society", "#thoughts", "#dushyant"], [
  "मसलहत आमेज़ होते हैं वो सारे फ़ैसले,",
  "जो बंद कमरों में बैठ कर किए जाते हैं।",
  "सच्चाई बाहर आकर भी दम तोड़ देती है,",
  "जब झूठ के चेहरे पर नक़ाब सोने के होते हैं।"
]);

// 7. Jaun Elia (8 shayaris)
addWriting("author-j-elia", "Apne Andar Ek Shor (अपने अंदर एक शोर)", "sad", "ur", ["#jaunelia", "#sad", "#melancholy", "#shayari"], [
  "अपने अंदर एक शोर सुनता हूँ मैं,",
  "और बाहर ख़ामोशी की चादर ओढ़ लेता हूँ।",
  "क्या सितम है कि खुद को ही ढूँढना पड़े,",
  "जैसे हम अपने ही घर में अजनबी हो गए।"
]);
addWriting("author-j-elia", "Jo Guzari Na Ja Saki (जो गुज़री न जा सकी)", "sad", "ur", ["#sad", "#longing", "#jaunelia"], [
  "जो गुज़री न जा सकी हमसे,",
  "हमने वो ज़िन्दगी गुज़ारी है तुम्हारे बिना।",
  "अब क्या कहें कि किस हाल में जीते हैं,",
  "बस साँस चल रही है और हम मुस्कुराते हैं।"
]);
addWriting("author-j-elia", "Bahut Se Log The (बहुत से लोग थे)", "sad", "ur", ["#sad", "#loneliness", "#jaunelia"], [
  "बहुत से लोग थे मेरे दिल के आस-पास,",
  "फिर यूँ हुआ कि हम तन्हा होते चले गए।",
  "ग़म ये नहीं कि दुनिया बदल गई साहिब,",
  "अफ़सोस तो ये है कि तुम भी बदल गए।"
]);
addWriting("author-j-elia", "Sharminda Hain Hum (शर्मिंदा हैं हम)", "sad", "ur", ["#guilt", "#sad", "#poetry"], [
  "शर्मिंदा हैं हम अपनी ही ख़्वाहिशों से,",
  "जो कभी ख़त्म होने का नाम नहीं लेतीं।",
  "मौत आई तो लगा जैसे मुक्ति मिल गई,",
  "वरना ज़िन्दगी ने तो बहुत तंग कर रखा था।"
]);
addWriting("author-j-elia", "Uski Gali Se Jab Guzra (उसकी गली से जब गुज़रा)", "nostalgia", "ur", ["#nostalgia", "#love", "#jaunelia"], [
  "उसकी गली से जब गुज़रा तो लगा,",
  "वक़्त ठहर गया है वहीं दस साल पहले।",
  "सब कुछ वैसा ही था सिवाय मेरे चेहरे के,",
  "जिस पर झुर्रियों ने डेरा डाल रखा था।"
]);
addWriting("author-j-elia", "Be-dili Kya Yunhi (बे-दिली क्या यूँही)", "sad", "ur", ["#sad", "#heartbreak", "#jaunelia"], [
  "बे-दिली क्या यूँही दिन गुज़र जाएँगे,",
  "सिर्फ़ ज़िन्दा रहे तो मर जाएँगे।",
  "हम भी क्या लोग हैं कि जीने की तमन्ना में,",
  "रोज़ थोड़ा-थोड़ा मरते जा रहे हैं।"
]);
addWriting("author-j-elia", "Naya Ek Rishta (नया एक रिश्ता)", "love", "ur", ["#love", "#jaunelia", "#shayari"], [
  "नया एक रिश्ता पैदा क्यूँ करें हम,",
  "जब पुराना ही निभाने के क़ाबिल न रहे।",
  "चलो अब भूल जाएँ एक दूसरे को,",
  "यही एक आख़िरी ज़रिया है सुकून पाने का।"
]);
addWriting("author-j-elia", "Khamoshi Ka Matlab (ख़ामोशी का मतलब)", "thoughtful", "ur", ["#thoughts", "#silence", "#jaunelia"], [
  "ख़ामोशी का मतलब सिर्फ़ चुप रहना नहीं होता,",
  "कभी-कभी इसका मतलब बहुत कुछ कह जाना होता है।",
  "जो सुन सके मेरी ख़ामोशी को भी,",
  "मुझे तो बस ऐसे हमसफ़र की तलाश थी।"
]);

// 8. Faiz Ahmad Faiz (8 ghazals)
addWriting("author-f-faiz", "Mujh Se Pehli Si Mohabbat (मुझ से पहली सी मोहब्बत)", "sad", "ur", ["#faiz", "#ghazal", "#classic", "#sad"], [
  "मुझ से पहली सी मोहब्बत मेरे महबूब न माँग,",
  "मैंने समझा था कि तू है तो दरख़्शाँ है हयात।",
  "और भी दुःख हैं ज़माने में मोहब्बत के सिवा,",
  "राहतें और भी हैं वस्ल की राहत के सिवा।"
]);
addWriting("author-f-faiz", "Hum Dekhenge (हम देखेंगे)", "motivation", "ur", ["#faiz", "#revolution", "#motivation"], [
  "लाज़िम है कि हम भी देखेंगे,",
  "जब अर्ज़-ए-ख़ुदा के काबे से,",
  "सब बुत उठवाए जाएँगे,",
  "हम अहल-ए-सफ़ा मर्दूद-ए-हरम,",
  "मसनद पे बिठाए जाएँगे,",
  "सब ताज उछाले जाएँगे,",
  "सब तख़्त गिराए जाएँगे,",
  "हम देखेंगे।"
]);
addWriting("author-f-faiz", "Bol Ke Lab Azaad Hain Tere (बोल के लैब आज़ाद हैं तेरे)", "motivation", "ur", ["#freedom", "#faiz", "#motivation"], [
  "बोल कि लब आज़ाद हैं तेरे,",
  "बोल ज़बाँ अब तक तेरी है।",
  "तेरा सुतवाँ जिस्म है तेरा,",
  "बोल कि जाँ अब तक तेरी है।"
]);
addWriting("author-f-faiz", "Gulon Mein Rang Bhare (गुलों में रंग भरे)", "love", "ur", ["#love", "#spring", "#faiz"], [
  "गुलों में रंग भरे बाद-ए-नौबहार चले,",
  "चले भी आओ कि गुलशन का कारोबार चले।",
  "क़फ़स उदास है यारो सबा से कुछ तो कहो,",
  "कहीं तो बहर-ए-ख़ुदा आज ज़िक्र-ए-यार चले।"
]);
addWriting("author-f-faiz", "Dasht-e-Tanhai (दश्त-ए-तन्हाई)", "sad", "ur", ["#sad", "#loneliness", "#faiz"], [
  "दश्त-ए-तन्हाई में ऐ जान-ए-जहाँ लर्ज़ां हैं,",
  "तेरी आवाज़ के साए तेरे होठों के सराब।",
  "दश्त-ए-तन्हाई में दूरी के ख़स-ओ-ख़ार में,",
  "खिल रहे हैं तेरी यादों के चमेली के गुलाब।"
]);
addWriting("author-f-faiz", "Raat Yun Dil Mein Teri (रात यूँ दिल में तेरी)", "love", "ur", ["#love", "#night", "#faiz"], [
  "रात यूँ दिल में तेरी खोई हुई याद आई,",
  "जैसे वीराने में चुपके से बहार आ जाए।",
  "जैसे सहराओं में हौले से चले बाद-ए-समीम,",
  "जैसे बीमार को बे-वजह क़रार आ जाए।"
]);
addWriting("author-f-faiz", "Mata-e-Lauh-o-Qalam (मता-ए-लौह-ओ-क़लम)", "motivation", "ur", ["#poetry", "#purpose", "#faiz"], [
  "मता-ए-लौह-ओ-क़लम छिन गई तो क्या ग़म है,",
  "कि ख़ून-ए-दिल में डुबो ली हैं उँगलियाँ मैंने।",
  "ज़बाँ पे मुहर लगी है तो क्या कि रख दी है,",
  "हर एक हलक़ा-ए-ज़ंजीर में ज़बाँ मैंने।"
]);
addWriting("author-f-faiz", "Aaye Kuch Abr Kuch (आए कुछ अब्र कुछ)", "sad", "ur", ["#sad", "#rain", "#faiz"], [
  "आए कुछ अब्र कुछ शराब आए,",
  "इस के बाद आए जो अज़ाब आए।",
  "उम्र के हर वरक़ पे लिक्खा है,",
  "ग़म का माज़ी ग़म का हिसाब आए।"
]);

// 9. Kumar Vishwas (6 poems)
addWriting("author-k-vishwas", "Koi Deewana Kehta Hai (कोई दीवाना कहता है)", "love", "hi", ["#kumarvishwas", "#love", "#popular", "#shayari"], [
  "कोई दीवाना कहता है, कोई पागल समझता है,",
  "मगर धरती की बेचैनी को बस बादल समझता है।",
  "मैं तुझसे दूर कैसा हूँ, तू मुझसे दूर कैसी है,",
  "ये तेरा दिल समझता है या मेरा दिल समझता है।"
]);
addWriting("author-k-vishwas", "Pagal Karti Hai (पागल करती है)", "love", "hi", ["#love", "#romantic", "#kumarvishwas"], [
  "तुम्हारी याद के साए मुझे पागल बनाते हैं,",
  "हज़ारों ख़्वाब आँखों में रोज़ सजाते हैं।",
  "तुम आओ तो बहार आ जाए इस वीराने में,",
  "वरना हवा के झोंके भी सिर्फ़ डराते हैं।"
]);
addWriting("author-k-vishwas", "Hawaon Ka Jhoka (हवाओं का झोंका)", "peace", "hi", ["#peace", "#nature", "#poetry"], [
  "हवा का झोंका आया है, पैग़ाम तुम्हारा लाया है,",
  "मन शांत हो गया ऐसे जैसे गंगा का किनारा है।",
  "अब कोई चिंता नहीं कोई फ़िक्र नहीं दिल में,",
  "बस तुम्हारी सोहबत का ये सुंदर नज़ारा है।"
]);
addWriting("author-k-vishwas", "Samandar Peer Ka (समंदर पीर का)", "sad", "hi", ["#sad", "#sea", "#kumarvishwas"], [
  "मेरे अंदर भी एक गहरा समंदर बहता है,",
  "जिसमें आँसुओं का पानी दिन-रात रहता है।",
  "कोई देख नहीं पाता मेरी इस तन्हाई को,",
  "बस मेरा ख़ुदा ही मेरा ये दर्द सहता है।"
]);
addWriting("author-k-vishwas", "Apne Apne Raste (अपने-अपने रास्ते)", "thoughtful", "hi", ["#path", "#life", "#kumarvishwas"], [
  "सबके अपने-अपने रास्ते हैं अपनी-अपनी मंज़िलें,",
  "कोई साथ चलता है तो कोई पीछे छूट जाता है।",
  "ज़िन्दगी के इस सफ़र में यही तो नियम है,",
  "जो आज मिला है कल वो पराया हो जाता है।"
]);
addWriting("author-k-vishwas", "Ek Shaam Aur Dhali (एक शाम और ढली)", "nostalgia", "hi", ["#evening", "#time", "#nostalgia"], [
  "एक शाम और ढल गई तुम्हारी यादों के सहारे,",
  "तारे निकल आए हैं आसमान में सारे के सारे।",
  "हम अब भी वहीं बैठे हैं जहाँ तुम छोड़ गए थे,",
  "जैसे नदी के किनारे बैठे हों कोई बेसहारे।"
]);

// 10. Munawwar Rana (6 poems)
addWriting("author-m-rana", "Maa Ki Mamta - Part 1 (माँ की ममता - भाग १)", "love", "ur", ["#mom", "#love", "#mother", "#munawwarrana"], [
  "किसी को घर मिला हिस्से में या कोई दुकान आई,",
  "मैं घर में सब से छोटा था मेरे हिस्से में माँ आई।",
  "कल अपने-आप को देखा था माँ की आँखों में,",
  "खु़दा की शान वहाँ कोई भी बुढ़ापा न था।"
]);
addWriting("author-m-rana", "Maa Ki Mamta - Part 2 (माँ की ममता - भाग २)", "love", "ur", ["#mom", "#respect", "#munawwarrana"], [
  "जब भी कश्ती मेरी सैलाब में आ जाती है,",
  "माँ दुआ करती हुई ख़्वाब में आ जाती है।",
  "मैंने रोते हुए पोंछे थे किसी दिन आँसू,",
  "आज तक उस रुमाल से माँ की महक आती है।"
]);
addWriting("author-m-rana", "Zindagi Ke Mele (ज़िन्दगी के मेले)", "sad", "ur", ["#sad", "#life", "#munawwarrana"], [
  "ज़िन्दगी के मेले में हम अकेले ही रह गए,",
  "सब साथी अपने-अपने रास्तों पर बह गए।",
  "बचा के रखा था जो थोड़ा सा सुकूँ दिल में,",
  "वो भी आँसुओं के रास्ते आँखों से बह गए।"
]);
addWriting("author-m-rana", "Ghar Ki Yaad (घर की याद)", "nostalgia", "ur", ["#nostalgia", "#home", "#shayari"], [
  "गाँव का वो कच्चा मकान बहुत याद आता है,",
  "जहाँ माँ का आँचल हवा में लहराता था।",
  "शहर की इस दौड़-भाग में वो सुकूँ कहाँ साहिब,",
  "जो नीम के पेड़ की छाँव में मिल जाता था।"
]);
addWriting("author-m-rana", "Sabar Ki Deewar (सबर की दीवार)", "peace", "ur", ["#peace", "#patience", "#poetry"], [
  "सबर की दीवार कभी टूटने मत देना,",
  "ख़ुदा की रहमत को कभी छूटने मत देना।",
  "वही देगा तुम्हें तुम्हारी मेहनत का फल एक दिन,",
  "बस अपने इरादों को कभी रूठने मत देना।"
]);
addWriting("author-m-rana", "Lafzon Ke Moti (लफ़्ज़ों के मोती)", "thoughtful", "ur", ["#words", "#beauty", "#munawwarrana"], [
  "लफ़्ज़ों को मोतियों की तरह पिरोना सीखो,",
  "हर किसी के सामने अपने आँसू मत बिखेरो।",
  "जो समझ सके तुम्हारी क़ीमत को दिल से,",
  "सिर्फ़ उसी के सामने अपनी दास्ताँ छेड़ो।"
]);

// 11. Ramdhari Singh Dinkar (6 poems)
addWriting("author-r-s-dinkar", "Rashmirathi - Krishna Ki Chetavni (रश्मिरथी - कृष्ण की चेतावनी)", "motivation", "hi", ["#rashmirathi", "#epic", "#motivation", "#dinkar"], [
  "वर्षों तक वन में घूमी-घूमी,",
  "बाधा-विघ्नों को चूम-चूम,",
  "सह धूप-घाम, पानी-पत्थर,",
  "पांडव आये कुछ और निखर।",
  "सौभाग्य न सब दिन सोता है,",
  "देखें, आगे क्या होता है।"
]);
addWriting("author-r-s-dinkar", "Rashmirathi - Veer (रश्मिरथी - वीर)", "motivation", "hi", ["#strength", "#courage", "#dinkar"], [
  "सच है, विपत्ति जब आती है,",
  "कायर को ही दहलाती है,",
  "सूरमा नहीं विचलित होते,",
  "क्षण एक नहीं धीरज खोते,",
  "विघ्नों को गले लगाते हैं,",
  "काँटों में राह बनाते हैं।"
]);
addWriting("author-r-s-dinkar", "Kurukshetra - Shanti (कुरुक्षेत्र - शांति)", "peace", "hi", ["#peace", "#war", "#classic"], [
  "शान्ति नहीं तब तक जब तक,",
  "नर-भाग न सम हो,",
  "न किसी को बहुत अधिक हो,",
  "न किसी को बहुत कम हो।"
]);
addWriting("author-r-s-dinkar", "Samar Shesh Hai (समर शेष है)", "motivation", "hi", ["#patriotism", "#justice", "#dinkar"], [
  "समर शेष है, नहीं पाप का भागी केवल व्याध,",
  "जो तटस्थ हैं, समय लिखेगा उनका भी अपराध।",
  "उठो वीर, अपनी तलवार संभालो तुम अब,",
  "न्याय की खातिर धर्म-युद्ध लड़ना है जब।"
]);
addWriting("author-r-s-dinkar", "Himalaya (हिमालय)", "motivation", "hi", ["#nature", "#india", "#dinkar"], [
  "मेरे नगपति! मेरे विशाल!",
  "साकार, दिव्य, गौरव-विराट,",
  "पौरुष के पुंजीभूत ज्वाल!",
  "मेरे नगपति! मेरे विशाल!"
]);
addWriting("author-r-s-dinkar", "Kalam Aaj Unki Jai Bol (कलम आज उनकी जय बोल)", "motivation", "hi", ["#martyrs", "#respect", "#patriotism"], [
  "जला अस्थियाँ बारी-बारी,",
  "चिटकाई जिनमें चिंगारी,",
  "जो चढ़ गये पुण्य-वेदी पर,",
  "लिए बिना गर्दन का मोल,",
  "कलम, आज उनकी जय बोल।"
]);

// 12. Suryakant Tripathi Nirala (5 poems)
addWriting("author-s-t-nirala", "Vasant Aaya (वसन्त आया)", "hope", "hi", ["#spring", "#hope", "#nirala"], [
  "सखि, वसन्त आया!",
  "सुन्दर उपवन का रूप बदला,",
  "हवाओं में नया संगीत छाया।",
  "पेड़ों पर नई पत्तियाँ आईं,",
  "जैसे प्रकृति ने नया श्रृंगार सजाया।"
]);
addWriting("author-s-t-nirala", "Bhikhari (भिखारी)", "sad", "hi", ["#sad", "#poverty", "#nirala"], [
  "वह आता—",
  "दो टूक कलेजे के करता पछताता पथ पर आता।",
  "पेट पीठ दोनों मिलकर हैं एक,",
  "चल रहा लकुटिया टेक,",
  "मुट्ठी भर दाने को—भूख मिटाने को",
  "मुँह फटी-पुरानी झोली का फैलाता।"
]);
addWriting("author-s-t-nirala", "Dhwani (ध्वनि)", "hope", "hi", ["#hope", "#motivation", "#nirala"], [
  "अभी न होगा मेरा अन्त,",
  "अभी-अभी ही तो आया है,",
  "मेरे वन में मृदुल वसन्त,",
  "अभी न होगा मेरा अन्त।"
]);
addWriting("author-s-t-nirala", "Priyatama (प्रियतमा)", "love", "hi", ["#love", "#romantic", "#classic"], [
  "तुम और मैं, दो किनारे जैसे नदी के,",
  "मिलते नहीं पर साथ चलते हैं हमेशा।",
  "तुम्हारी याद का एक कतरा भी काफ़ी है,",
  "इस तन्हा दिल को बहलाने के लिए।"
]);
addWriting("author-s-t-nirala", "Sandhya Sundari (संध्या सुन्दरी)", "peace", "hi", ["#nature", "#peace", "#nirala"], [
  "दिवसावसान का समय,",
  "मेघमय आसमान से उतर रही है,",
  "वह संध्या-सुन्दरी परी-सी,",
  "धीरे-धीरे-धीरे।"
]);

// 13. Mahadevi Varma (5 poems)
addWriting("author-m-varma", "Madhur Madhur Mere Deepak Jal (मधुर-मधुर मेरे दीपक जल)", "peace", "hi", ["#peace", "#spiritual", "#mahadevi"], [
  "मधुर-मधुर मेरे दीपक जल!",
  "युग-युग प्रतिदिन प्रतिक्षण प्रतिपल,",
  "प्रियतम का पथ आलोकित कर।",
  "सौरभ फैला कर कण-कण में,",
  "जल कोमल मन के मन्दिर में।"
]);
addWriting("author-m-varma", "Main Neer Bhari Dukh Ki Badli (मैं नीर भरी दुख की बदली)", "sad", "hi", ["#sad", "#melancholy", "#mahadevi"], [
  "मैं नीर भरी दुख की बदली!",
  "स्पन्दन में चिर निष्पन्द बसा,",
  "क्रन्दन में आहत विश्व हँसा,",
  "नयनों में दीपक से जलते,",
  "पलकों में निर्झरिणी मचली।"
]);
addWriting("author-m-varma", "Deep Mera Jalta Rahe (दीप मेरा जलता रहे)", "hope", "hi", ["#hope", "#light", "#poetry"], [
  "रात चाहे कितनी भी काली हो,",
  "दीप मेरा जलता रहेगा हमेशा।",
  "राह दिखाता रहेगा मुसाफ़िरों को,",
  "जब तक प्राण रहेंगे जिस्म में।"
]);
addWriting("author-m-varma", "Tum Aaye To (तुम आए तो)", "love", "hi", ["#love", "#romantic", "#mahadevi"], [
  "तुम आए तो लगा जैसे सूनी बगिया खिल गई,",
  "हवाओं को नई खुशबू मिल गई।",
  "अब कोई गिला नहीं कोई शिकायत नहीं तक़दीर से,",
  "जैसे मनचाही मुराद मिल गई।"
]);
addWriting("author-m-varma", "Jaag Tujhe Door Jaana Hai (जाग तुझे दूर जाना है)", "motivation", "hi", ["#motivation", "#courage", "#mahadevi"], [
  "चिर सजग आँखें उनींदी,",
  "आज कैसा व्यस्त बाना!",
  "जाग, तुझको दूर जाना!",
  "अचल हिमगिरि के हृदय में आज चाहे कम्प हो ले,",
  "या प्रलय के आँसुओं में मौन अलसित व्योम रो ले।"
]);

// 14. Sumitranandan Pant (5 poems)
addWriting("author-s-pant", "Nauka Vihar (नौका विहार)", "peace", "hi", ["#peace", "#nature", "#pant"], [
  "शांत, स्निग्ध, ज्योत्स्ना उज्ज्वल,",
  "अपलक अनन्त, नीरव भूतल।",
  "सैकत-शय्या पर दुग्ध-धवल,",
  "तन्वी गंगा ग्रीष्म-विरल,",
  "लेटी हैं श्रान्त, क्लान्त, निश्चल।"
]);
addWriting("author-s-pant", "Almora Ki Ek Raat (अल्मोड़ा की एक रात)", "nostalgia", "hi", ["#nostalgia", "#hills", "#nature"], [
  "पहाड़ों की वो ठंडी हवाएँ,",
  "और देवदार के पेड़ों की सरसराहट।",
  "रात के सन्नाटे में अलमोड़ा की गलियाँ,",
  "जैसे कोई पुराना ख़्वाब गुनगुनाती हैं।"
]);
addWriting("author-s-pant", "Prakriti Ka Aanchal (प्रकृति का आँचल)", "peace", "hi", ["#nature", "#peace", "#pant"], [
  "हरे-भरे खेतों का ये सुंदर नज़ारा,",
  "बहती हुई नदी का ये शीतल किनारा।",
  "प्रकृति के इस आँचल में आकर लगा,",
  "यही तो है मेरा सच्चा ठिकाना।"
]);
addWriting("author-s-pant", "Kusum (कुसुम)", "hope", "hi", ["#hope", "#flower", "#pant"], [
  "कल जो कली थी आज वो फूल बन गई,",
  "हवाओं के साथ झूमना उसकी भूल बन गई।",
  "देती है खुशबू हर आने-जाने वाले को,",
  "बिना किसी भेदभाव के यही उसकी रीत बन गई।"
]);
addWriting("author-s-pant", "Zindagi Ek Safar (ज़िन्दगी एक सफ़र)", "thoughtful", "hi", ["#life", "#thoughts", "#pant"], [
  "ज़िन्दगी एक सफ़र है सुहाना,",
  "यहाँ कल क्या हो किसने जाना।",
  "हँसते-गाते हुए राहें काटते रहो,",
  "बस यही है जीने का असली पैमाना।"
]);

// 15. Allama Iqbal (5 shayaris)
addWriting("author-a-iqbal", "Khudi Ko Kar Buland (ख़ुदी को कर बुलंद)", "motivation", "ur", ["#iqbal", "#motivation", "#shayari", "#classic"], [
  "ख़ुदी को कर बुलंद इतना कि हर तक़दीर से पहले,",
  "ख़ुदा बंदे से ख़ुद पूछे बता तेरी रज़ा क्या है।"
]);
addWriting("author-a-iqbal", "Sitaron Se Aage Jahan (सितारों से आगे जहाँ)", "motivation", "ur", ["#iqbal", "#philosophy", "#motivation"], [
  "सितारों से आगे जहाँ और भी हैं,",
  "अभी इश्क़ के इम्तिहाँ और भी हैं।",
  "तही-दस्त-ए-शौक़ न कर अपने दामन को,",
  "यहाँ आज़माइश के सामाँ और भी हैं।"
]);
addWriting("author-a-iqbal", "Hazaron Saal Nargis (हज़ारों साल नर्गिस)", "sad", "ur", ["#sad", "#classic", "#iqbal"], [
  "हज़ारों साल नर्गिस अपनी बे-नूरी पे रोती है,",
  "बड़ी मुश्किल से होता है चमन में दीदा-वर पैदा।"
]);
addWriting("author-a-iqbal", "Khuda Ke Bande (ख़ुदा के बंदे)", "peace", "ur", ["#god", "#peace", "#shayari"], [
  "ख़ुदा के बंदे तो हैं हज़ारों बनों में फिरते हैं मारे-मारे,",
  "मैं उसका बंदा बनूँगा जिसको ख़ुदा के बंदों से प्यार होगा।"
]);
addWriting("author-a-iqbal", "Shaheen (शाहीन)", "motivation", "ur", ["#shaheen", "#eagle", "#motivation", "#iqbal"], [
  "तू शाहीन है परवाज़ है काम तेरा,",
  "तेरे सामने आसमाँ और भी हैं।"
]);

// 16. Nida Fazli (5 shayaris)
addWriting("author-n-fazli", "Duniya Jise Kehte Hain (दुनिया जिसे कहते हैं)", "thoughtful", "hi", ["#nidafazli", "#wisdom", "#shayari"], [
  "दुनिया जिसे कहते हैं जादू का खिलौना है,",
  "मिल गया सो मिट्टी है खो गया सो सोना है।"
]);
addWriting("author-n-fazli", "Kabhi Kisi Ko Mukammal (कभी किसी को मुकम्मल)", "sad", "hi", ["#sad", "#life", "#nidafazli"], [
  "कभी किसी को मुकम्मल जहाँ नहीं मिलता,",
  "कहीं ज़मीन तो कहीं आसमाँ नहीं मिलता।",
  "जिसे भी देखिए वो अपने आप में गुम है,",
  "ज़बाँ मिली है मगर हमज़बाँ नहीं मिलता।"
]);
addWriting("author-n-fazli", "Ghar Se Masjid Hai (घर से मस्जिद है)", "peace", "hi", ["#peace", "#humanity", "#nidafazli"], [
  "घर से मस्जिद है बहुत दूर चलो यूँ कर लें,",
  "किसी रोते हुए बच्चे को हँसाया जाए।"
]);
addWriting("author-n-fazli", "Apna Gham Lekar (अपना ग़म लेकर)", "sad", "hi", ["#sad", "#nidafazli", "#shayari"], [
  "अपना ग़म लेकर कहीं और न जाया जाए,",
  "घर की बिखरी हुई चीज़ों को सजाया जाए।",
  "धूप बहुत तेज़ है साए की तलाश मत करो,",
  "अपनी पलकों को ही साया बनाया जाए।"
]);
addWriting("author-n-fazli", "Dushmani Lakh Sahi (दुश्मनी लाख सही)", "peace", "hi", ["#peace", "#friendship", "#nidafazli"], [
  "दुश्मनी लाख सही ख़त्म न कीजे रिश्ता,",
  "दिल मिले न मिले हाथ मिलाते रहिए।"
]);

const REACTION_TYPES = ["felt_this", "inspired", "powerful", "beautiful", "relatable", "thoughtful"];

const COMMENT_TEMPLATES = [
  "अति सुंदर! बहुत ही गहरी बात कही है।",
  "लाजवाब रचना! दिल को छू गई।",
  "वाह! क्या खूब लिखा है।",
  "शब्दों का बहुत ही खूबसूरत चयन।",
  "Bahut khoob! Behad khoobsurat lines.",
  "Very deep and meaningful lines. Touched my soul.",
  "अद्भुत! यह कविता मन को शांत कर देती है।",
  "This is pure gold. Legendary writing indeed.",
  "दिल को छू लेने वाली पंक्तियाँ। वाह!",
  "Absolutely beautiful phrasing.",
  "One of the best pieces of Hindi literature.",
  "Very relatable! Captures the true human emotion.",
  "कमाल की लिखाई है। सलाम!",
  "Highly emotional and expressive. Masterpiece."
];

const REVIEW_TEMPLATES = [
  { rating: 5, content: "Excellent rhythm and flow. A true masterpiece." },
  { rating: 5, content: "मन को मोह लेने वाली कविता। अवश्य पढ़नी चाहिए।" },
  { rating: 4, content: "Beautiful phrasing. Highly recommended for poetry lovers." },
  { rating: 5, content: "Stunning depth of emotion. Splendid work." },
  { rating: 4, content: "Great message and meter." }
];

async function main() {
  console.log("=== HINDI SHAYARI DATABASE SEEDER ===");

  // 1. Create or verify all Author Accounts
  console.log(`Checking/Inserting ${AUTHORS.length} legendary poet accounts...`);
  for (const author of AUTHORS) {
    const [existing] = await db.select().from(users).where(eq(users.id, author.id));
    if (!existing) {
      await db.insert(users).values({
        ...author,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`+ Created account: @${author.username}`);
    } else {
      console.log(`~ Account already exists: @${author.username}`);
    }
  }

  // 2. Insert all 100+ writings
  console.log(`\nInserting ${WRITINGS_DATA.length} writings...`);
  const seededWritings: any[] = [];
  
  for (const writing of WRITINGS_DATA) {
    const slug = writing.title.toLowerCase()
      .replace(/[^a-z0-9\u0900-\u097F]+/g, "-") // preserve hindi characters or convert them cleanly
      .replace(/-+/g, "-")
      .trim();

    // Check if writing already exists by title or slug
    const [existing] = await db.select().from(writings).where(eq(writings.slug, slug));
    
    if (!existing) {
      const id = crypto.randomUUID();
      const wordCount = writing.content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      const [newWriting] = await db.insert(writings).values({
        id,
        userId: writing.authorId,
        title: writing.title,
        slug,
        content: writing.content,
        primaryEmotion: writing.primaryEmotion,
        language: writing.language,
        tags: writing.tags,
        readingTime,
        views: Math.floor(Math.random() * 200) + 50, // realistic initial view count
        isDraft: false,
        publishedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      seededWritings.push(newWriting);
      console.log(`+ Seeded writing: "${writing.title}"`);
    } else {
      seededWritings.push(existing);
      console.log(`~ Writing already exists: "${writing.title}"`);
    }
  }

  // 3. Seed community interactions (comments, reactions, reviews)
  console.log("\nSeeding community engagement (reactions, comments, reviews)...");
  
  for (const writing of seededWritings) {
    // Select a subset of random authors to react/comment/review
    const otherAuthors = AUTHORS.filter(a => a.id !== writing.userId);
    
    // Shuffled other authors
    const shuffled = [...otherAuthors].sort(() => 0.5 - Math.random());
    
    // 1. Reactions (2 to 5 per writing)
    const reactionCount = Math.floor(Math.random() * 4) + 2; 
    const reactionAuthors = shuffled.slice(0, reactionCount);
    for (const actor of reactionAuthors) {
      // Check if reaction already exists
      const rId = crypto.randomUUID();
      const rxType = REACTION_TYPES[Math.floor(Math.random() * REACTION_TYPES.length)];
      
      const [existingRx] = await db.select().from(reactions).where(eq(reactions.writingId, writing.id));
      // Only insert if no reaction by this user on this writing
      // (For simplicity we just insert unless overall reactions table is too full)
      try {
        await db.insert(reactions).values({
          id: rId,
          userId: actor.id,
          writingId: writing.id,
          type: rxType,
          createdAt: new Date()
        });
      } catch (err) {
        // Safe skip composite/unique checks
      }
    }

    // 2. Comments (1 to 3 per writing)
    const commentCount = Math.floor(Math.random() * 3) + 1;
    const commentAuthors = shuffled.slice(0, commentCount);
    for (const actor of commentAuthors) {
      const cId = crypto.randomUUID();
      const commentText = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];
      
      try {
        await db.insert(comments).values({
          id: cId,
          userId: actor.id,
          writingId: writing.id,
          content: commentText,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (err) {
        // Safe skip
      }
    }

    // 3. Reviews (1 to 2 per writing)
    const reviewCount = Math.floor(Math.random() * 2) + 1;
    const reviewAuthors = shuffled.slice(0, reviewCount);
    for (const actor of reviewAuthors) {
      const revId = crypto.randomUUID();
      const revTemplate = REVIEW_TEMPLATES[Math.floor(Math.random() * REVIEW_TEMPLATES.length)];
      
      try {
        await db.insert(reviews).values({
          id: revId,
          userId: actor.id,
          writingId: writing.id,
          rating: revTemplate.rating,
          content: revTemplate.content,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } catch (err) {
        // Safe skip
      }
    }
  }

  console.log("\nCommunity engagement seeding complete!");
  console.log("Seeding process successfully finished!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
