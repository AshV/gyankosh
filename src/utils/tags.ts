/**
 * src/utils/tags.ts
 * Centralized Tag and Slug management for Gyankosh.
 *
 * Translates Hindi / Devanagari tags into clean, human-readable English slugs
 * (e.g. "हनुमान" -> "hanuman", "गीता" -> "gita", "शिव" -> "shiva")
 * while preserving authentic Hindi appearance and behavior on the UI.
 */

const CURATED_TAG_SLUGS: Record<string, string> = {
  // Major Deities & Personas
  'हनुमान': 'hanuman',
  'बजरंगबली': 'bajrangbali',
  'बजरंगबाण': 'bajrang-baan',
  'संकटमोचन': 'sankat-mochan',
  'शिव': 'shiva',
  'महादेव': 'mahadev',
  'भोलेनाथ': 'bholenath',
  'कालभैरव': 'kala-bhairava',
  'भैरव': 'bhairav',
  'बटुकभैरव': 'batuk-bhairav',
  'रुद्राष्टक': 'rudrashtak',
  'कृष्ण': 'krishna',
  'श्रीकृष्ण': 'shri-krishna',
  'कान्हा': 'kanha',
  'कुंजबिहारी': 'kunjbihari',
  'गिरिधर': 'giridhar',
  'गोविन्द': 'govind',
  'दामोदर': 'damodar',
  'श्याम': 'shyam',
  'वासुदेव': 'vasudev',
  'राम': 'ram',
  'सीताराम': 'sitaram',
  'रघुपति': 'raghupati',
  'रामभक्त': 'rambhakt',
  'विष्णु': 'vishnu',
  'नारायण': 'narayan',
  'हरि': 'hari',
  'दुर्गा': 'durga',
  'अम्बे': 'ambey',
  'अम्बे-गौरी': 'ambey-gauri',
  'भवानी': 'bhavani',
  'देवी': 'devi',
  'लक्ष्मी': 'lakshmi',
  'महालक्ष्मी': 'mahalakshmi',
  'धनदा': 'dhanada',
  'सरस्वती': 'saraswati',
  'गणेश': 'ganesh',
  'गणपति': 'ganapati',
  'विघ्नहर्ता': 'vighnaharta',
  'प्रथम-पूज्य': 'pratham-pujya',
  'सूर्य': 'surya',
  'सूर्यदेव': 'suryadev',
  'भास्कर': 'bhaskar',
  'आदित्य': 'aditya',
  'सविता': 'savita',
  'शनि': 'shani',
  'शनिदेव': 'shanidev',
  'साढ़ेसाती': 'sadesati',
  'गंगा': 'ganga',
  'भागीरथी': 'bhagirathi',
  'पतित-पावनी': 'patit-pavani',
  'विश्वकर्मा': 'vishwakarma',
  'श्री विश्वकर्मा': 'shri-vishwakarma',
  'श्री-विश्वकर्मा': 'shri-vishwakarma',
  'ललिता': 'lalita',
  'त्रिपुरसुन्दरी': 'tripurasundari',
  'श्रीविद्या': 'shrividya',

  // Sages & Authors
  'तुलसीदास': 'tulsidas',
  'वेदव्यास': 'vedvyas',
  'शंकराचार्य': 'shankaracharya',
  'शङ्कराचार्य': 'shankaracharya',
  'अष्टावक्र': 'ashtavakra',
  'चाणक्य': 'chanakya',
  'विदुर': 'vidura',
  'अगस्त्य': 'agastya',
  'नचिकेता': 'nachiketa',
  'यमराज': 'yamaraj',
  'भीष्म': 'bhishma',
  'अर्जुन': 'arjuna',
  'धृतराष्ट्र': 'dhritarashtra',
  'राजा-जनक': 'raja-janak',
  'रावण': 'ravana',
  'पुष्पदन्त': 'pushpadanta',
  'वल्लभाचार्य': 'vallabhacharya',
  'पिप्पलाद': 'pippalada',

  // Categories & Formats
  'गीता': 'gita',
  'चालीसा': 'chalisa',
  'स्तोत्र': 'stotra',
  'अष्टक': 'ashtak',
  'अष्टकम्': 'ashtakam',
  'आरती': 'aarti',
  'उपनिषद्': 'upanishad',
  'वेद': 'veda',
  'पुराण': 'purana',
  'सूक्त': 'suktam',
  'सहस्रनाम': 'sahasranama',
  'सुन्दरकाण्ड': 'sundarkand',
  'रामायण': 'ramayana',
  'रामचरितमानस': 'ramcharitmanas',
  'महाभारत': 'mahabharata',

  // Vedas & Upanishads
  'ऋग्वेद': 'rigveda',
  'यजुर्वेद': 'yajurveda',
  'शुक्ल-यजुर्वेद': 'shukla-yajurveda',
  'कृष्ण-यजुर्वेद': 'krishna-yajurveda',
  'सामवेद': 'samaveda',
  'अथर्ववेद': 'atharvaveda',
  'ईशावास्य': 'isha-upanishad',
  'कठोपनिषद्': 'katha-upanishad',
  'केनोपनिषद्': 'kena-upanishad',
  'प्रश्नोपनिषद्': 'prashna-upanishad',
  'मुण्डकोपनिषद्': 'mundaka-upanishad',
  'माण्डूक्य': 'mandukya-upanishad',
  'तैत्तिरीयोपनिषद्': 'taittiriya-upanishad',

  // Concepts & Themes
  'भक्ति': 'bhakti',
  'ज्ञान': 'gyan',
  'कर्म': 'karma',
  'मोक्ष': 'moksha',
  'धर्म': 'dharma',
  'नीति': 'niti',
  'अद्वैत': 'advaita',
  'वेदान्त': 'vedanta',
  'वैदिक': 'vaidik',
  'संस्कृत': 'sanskrit',
  'अवधी': 'awadhi',
  'सांख्ययोग': 'sankhya-yoga',
  'कर्मयोग': 'karma-yoga',
  'भक्तियोग': 'bhakti-yoga',
  'ध्यानयोग': 'dhyana-yoga',
  'संन्यास': 'sannyasa',
  'त्याग': 'tyaga',
  'आत्मज्ञान': 'atma-gyan',
  'ब्रह्मविद्या': 'brahmavidya',
  'ब्रह्म': 'brahma',
  'गायत्री': 'gayatri',
  'नवरात्रि': 'navratri',
  'नवग्रह': 'navagraha',
  'श्री-सूक्त': 'sri-suktam',
  'पुरुष-सूक्त': 'purusha-suktam',
  'दुर्गा-सूक्त': 'durga-suktam',
  'नारायण-सूक्त': 'narayana-suktam',
  'विश्वकर्मा-सूक्त': 'vishwakarma-suktam',
};

const VOWELS: Record<string, string> = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'am', 'अः': 'ah', 'ॐ': 'om'
};

const MATRAS: Record<string, string> = {
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h'
};

const CONSONANTS: Record<string, string> = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gya'
};

/**
 * Converts any Devanagari or mixed script tag string into a clean, URL-safe English slug.
 *
 * Examples:
 *   tagToSlug("हनुमान")     => "hanuman"
 *   tagToSlug("गीता")       => "gita"
 *   tagToSlug("शिव")        => "shiva"
 *   tagToSlug("सुन्दरकाण्ड") => "sundarkand"
 */
export function tagToSlug(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return '';

  // 1. Direct curated override match
  if (CURATED_TAG_SLUGS[trimmed]) {
    return CURATED_TAG_SLUGS[trimmed];
  }

  // 2. Already ASCII text: clean and slugify
  if (/^[a-zA-Z0-9\-_ ]+$/.test(trimmed)) {
    return trimmed.toLowerCase().replace(/\s+/g, '-');
  }

  // 3. Algorithmic Devanagari-to-Roman Transliteration
  let result = '';
  const len = trimmed.length;

  for (let i = 0; i < len; i++) {
    const ch = trimmed[i];
    const next = i + 1 < len ? trimmed[i + 1] : '';

    if (ch === '-' || ch === ' ' || ch === '_') {
      result += '-';
      continue;
    }

    if (VOWELS[ch]) {
      result += VOWELS[ch];
      continue;
    }

    if (CONSONANTS[ch]) {
      const c = CONSONANTS[ch];
      if (next === '्') {
        // Halant suppresses inherent vowel 'a'
        result += c;
        i++; // skip halant character
      } else if (MATRAS[next]) {
        result += c + MATRAS[next];
        i++; // skip matra character
      } else if (CONSONANTS[next] || VOWELS[next] || next === '-' || next === ' ' || !next) {
        // Schwa handling: add 'a' unless it's the final character of a word/token
        if (i === len - 1 || next === '-' || next === ' ') {
          result += c;
        } else {
          result += c + 'a';
        }
      } else {
        result += c;
      }
      continue;
    }

    if (MATRAS[ch]) {
      result += MATRAS[ch];
      continue;
    }

    if (ch === '्') continue;

    // ASCII numbers
    if (ch >= '0' && ch <= '9') {
      result += ch;
      continue;
    }

    // Devanagari digits ०-९
    const devDigits = '०१२३४५६७८९';
    const dIdx = devDigits.indexOf(ch);
    if (dIdx !== -1) {
      result += dIdx;
      continue;
    }
  }

  const slug = result
    .toLowerCase()
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'tag';
}
