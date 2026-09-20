/**
 * src/data/tagMeta.ts
 * Centralized Tag Metadata Registry for Gyankosh.
 *
 * Allows defining custom cover images, devotional icons, descriptions,
 * and context paragraphs for specific tag pages (e.g. hanuman, krishna, shiva, ram).
 */

import { tagToSlug } from '../utils/tags';

export interface TagMeta {
  icon?: string;
  coverImage?: string;   // Path in /public or absolute URL, e.g. '/covers/hanuman-chalisa.jpg'
  description?: string;  // Concise subtitle & SEO / OpenGraph description
  context?: string;      // Spiritual, historical, or literary context paragraph
}

export const TAG_META: Record<string, TagMeta> = {
  // ── Major Deities ──────────────────────────────────────────
  hanuman: {
    icon: '🚩',
    coverImage: '/covers/hanuman-chalisa.jpg',
    description: 'पवनपुत्र श्री हनुमान जी के पावन चरित्र, चालीसा, अष्टक एवं संकटमोचन स्तुतियां।',
    context: 'महाबली संकटमोचन श्री हनुमान जी अतुलित बल, निष्काम सेवा, भक्ति और ज्ञान के सर्वोच्च प्रतीक हैं। यहाँ संकलित समस्त पाठ संकट निवारण, भय नाश और आत्मबल संवर्धन हेतु नित्य श्रद्धापूर्वक गाए जाते हैं।',
  },
  shiva: {
    icon: '🔱',
    coverImage: '/covers/shiva-tandava-stotram.jpg',
    description: 'देवाधिदेव महादेव शिव जी के पावन स्तोत्र, ताण्डव, महिम्न एवं रुद्राष्टकम्।',
    context: 'कल्याणकारी भगवान शिव संहार और पुनर्जन्म के स्वामी तथा परम वैरागी योगी हैं। उनके पावन स्तोत्रों का वाचन अंतःकरण को शांत, भयमुक्त और एकाग्र बनाता है।',
  },
  bholenath: {
    icon: '🔱',
    coverImage: '/covers/rudrashtakam.jpg',
    description: 'भोलेनाथ शिव शम्भू की पावन स्तुतियां, रुद्राष्टक एवं आरतियां।',
  },
  krishna: {
    icon: '🪶',
    coverImage: '/covers/madhurashtakam.jpg',
    description: 'आनंदकंद भगवान श्रीकृष्ण की दिव्य लीलाएं, मधुराष्टकम्, गोपी-गीत एवं गीता उपदेश।',
    context: 'भगवान श्रीकृष्ण प्रेम, धर्म, कर्म और ज्ञान के पूर्ण अवतार हैं। उनकी मधुर स्तुतियां और दिव्य गीता उपदेश संसार के हर द्वंद्व और संशय का सहज समाधान प्रदान करते हैं।',
  },
  'shri-krishna': {
    icon: '🪶',
    coverImage: '/covers/bhagavad-gita.jpg',
    description: 'भगवान श्रीकृष्ण के पावन संवाद, श्रीमद्भगवद्गीता एवं दिव्य स्तुतियां।',
    context: 'कुरुक्षेत्र के पावन रणक्षेत्र से लेकर वृन्दावन की दिव्य कुंज गलियों तक भगवान श्रीकृष्ण का पावन चरित्र सनातन धर्म का प्राण है।',
  },
  ram: {
    icon: '🏹',
    coverImage: '/covers/ramashtakam.jpg',
    description: 'मर्यादा पुरुषोत्तम भगवान श्री रामचन्द्र जी की पावन स्तुतियां, अष्टक एवं रामरक्षा स्तोत्र।',
    context: 'रघुकुल तिलक श्री राम मर्यादा, सत्य और धर्म के साक्षात् विग्रह हैं। उनके नाम और स्तुतियों का पाठ समस्त आपदाओं से रक्षा कर जीवन में धर्म और मर्यादा की प्रतिष्ठा करता है।',
  },
  durga: {
    icon: '🌺',
    coverImage: '/covers/durga-saptashati.jpg',
    description: 'आदिशक्ति माँ दुर्गा की पावन आराधना, दुर्गा सप्तशती, कवच एवं अर्गला स्तोत्र।',
    context: 'जगज्जननी माँ दुर्गा शक्ति, करुणा और दुष्ट-दलन की अधिष्ठात्री देवी हैं। उनके मन्त्र और स्तुतियां साधकों को निर्भयता, आध्यात्मिक तेज और विजय प्रदान करती हैं।',
  },
  ganesh: {
    icon: '🐘',
    coverImage: '/covers/ganesh-chalisa.jpg',
    description: 'प्रथम पूज्य भगवान श्री गणेश जी की चालीसा, आरती एवं विघ्नहर्ता स्तुतियां।',
    context: 'बुद्धि, विवेक और ऋद्धि-सिद्धि के दाता भगवान गणेश हर शुभ कार्य के आरम्भ में विघ्नों के निवारण और मंगल की प्राप्ति हेतु पूजे जाते हैं।',
  },
  surya: {
    icon: '☀️',
    coverImage: '/covers/aditya-hridaya-stotram.jpg',
    description: 'प्रत्यक्ष देव भगवान भुवन-भास्कर सूर्य देव की पावन स्तुतियां एवं आदित्य हृदय स्तोत्र।',
    context: 'समस्त ब्रह्माण्ड को जीवन, प्रकाश और ऊर्जा देने वाले सूर्य देव आरोग्य, तेज और विजय के प्रदाता हैं। भगवान राम ने भी रावण-वध से पूर्व अगस्त्य ऋषि द्वारा प्रदत्त आदित्य हृदय स्तोत्र का पाठ किया था।',
  },
  lakshmi: {
    icon: '🪷',
    coverImage: '/covers/kanakadhara-stotram.jpg',
    description: 'माता महालक्ष्मी जी की पावन स्तुतियां, कनकधारा स्तोत्र एवं श्री सूक्तम्।',
    context: 'समृद्धि, सौभाग्य, शुचिता और ऐश्वर्य की अधिष्ठात्री माता महालक्ष्मी की आराधना दरिद्रता, अज्ञान और अभाव का नाश करती है।',
  },
  ganga: {
    icon: '🌊',
    coverImage: '/covers/ganga-stotram.jpg',
    description: 'पतित-पावनी माँ गंगा जी के पावन स्तोत्र एवं महिमा।',
    context: 'हिमालय की गोद से प्रवाहित होने वाली माँ गंगा केवल एक नदी नहीं, बल्कि सनातन संस्कृति की अमृत-धारा, पाप-नाशिनी और मोक्षदायिनी शक्ति हैं।',
  },
  'shri-vishwakarma': {
    icon: '⚒️',
    coverImage: '/covers/vishwakarma-puran.jpg',
    description: 'देवशिल्पी भगवान श्री विश्वकर्मा जी की स्तुतियां, चालीसा, पुराण एवं आरती।',
    context: 'समस्त सृष्टि के दिव्य वास्तुकार, शिल्पविद्या के जनक और यंत्र-कला के प्रवर्तक भगवान विश्वकर्मा समस्त रचनात्मक कर्म और ज्ञान के मूल आधार हैं।',
  },

  // ── Major Formats & Philosophy ─────────────────────────────
  gita: {
    icon: '🎵',
    coverImage: '/covers/bhagavad-gita.jpg',
    description: 'श्रीमद्भगवद्गीता एवं अष्टावक्र गीता — सनातन वेदान्त दर्शन का अमर उपदेश।',
    context: 'गीता केवल एक धार्मिक ग्रंथ नहीं, बल्कि जीवन जीने का व्यावहारिक और आध्यात्मिक विज्ञान है जो मनुष्य को कर्म, वैराग्य और आत्मज्ञान का पथ दिखाता है।',
  },
  upanishad: {
    icon: '🕉️',
    coverImage: '/covers/upanishad.jpg',
    description: 'वेदान्त दर्शन के आधारभूत पावन उपनिषद् — आत्मज्ञान एवं ब्रह्मविद्या का अमृत।',
    context: 'उपनिषद् सनातन ऋषियों के गहनतम आत्म-साक्षात्कार की वाणी हैं, जो जीव, जगत् और परब्रह्म की अद्वैत एकता का उद्घोष करते हैं।',
  },
  veda: {
    icon: '🔥',
    coverImage: '/covers/purusha-suktam.jpg',
    description: 'अपौरुषेय सनातन वेद — ऋचाएं, सूक्त एवं वैदिक संहिताओं का दिव्य ज्ञान।',
    context: 'वेद समस्त सनातन ज्ञान-परम्परा के मूल आधार हैं। इनकी ध्वनि और ऋचाओं का उच्चारण सृष्टि के शाश्वत नियमों का प्रकटीकरण है।',
  },
  stotra: {
    icon: '🌸',
    coverImage: '/covers/shiva-mahimna-stotram.jpg',
    description: 'ऋषि-मुनियों एवं संतों द्वारा रचित देवी-देवताओं की पावन स्तुतियां एवं अष्टक।',
  },
  chalisa: {
    icon: '🪔',
    coverImage: '/covers/hanuman-chalisa.jpg',
    description: 'चालीस पावन पदों वाले देवी-देवताओं के जनप्रिय स्तोत्र एवं नित्य पाठ।',
  },
};

/**
 * Resolves metadata for any given tag string or slug.
 * Works symmetrically whether looked up by Devanagari string or English slug.
 */
export function getTagMetadata(tagSlugOrName: string): TagMeta {
  if (!tagSlugOrName) return {};
  const trimmed = tagSlugOrName.trim();
  const slug = tagToSlug(trimmed);

  return TAG_META[slug] || TAG_META[trimmed] || {};
}
