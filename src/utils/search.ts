/**
 * src/utils/search.ts
 * Gyankosh Dual-Script Indic & English Catalog Search Engine.
 *
 * Enables seamless search across sacred texts using:
 * 1. English / Hinglish / Roman script (e.g., "hanuman chalisa", "gita 2", "rudrashtakam", "geeta", "shiv", "krishna")
 * 2. Hindi / Devanagari script (e.g., "हनुमान चालीसा", "गीता", "शिव", "रुद्राष्टकम्")
 */

import { tagToSlug } from './tags';

export interface SearchCatalogItem {
  slug: string;
  title: string;
  author?: string;
  category: string;
  categoryHindi: string;
  description: string;
  tags: string[];
  coverColor?: string;
  coverImage?: string;
  keywords: string[];
  weight: number;
}

const CATEGORY_HINDI_MAP: Record<string, string> = {
  Veda: 'वेद',
  Upanishad: 'उपनिषद्',
  Gita: 'गीता',
  Chalisa: 'चालीसा',
  Stotra: 'स्तोत्र',
  Aarti: 'आरती',
  Purana: 'पुराण',
  Other: 'अन्य',
};

// Common Phonetic & Theological Synonyms (English <-> Hindi <-> Alternate English)
const THEOLOGICAL_ALIASES: Record<string, string[]> = {
  // Gita
  'gita': ['geeta', 'bhagavad', 'shrimad', 'krishna', 'arjuna', 'गीता', 'भगवद्गीता', 'कृष्ण'],
  'geeta': ['gita', 'bhagavad', 'गीता'],
  'bhagavad': ['gita', 'geeta', 'krishna', 'भगवद्गीता'],
  
  // Shiva
  'shiva': ['shiv', 'mahadev', 'bholenath', 'rudra', 'shankara', 'tandav', 'शिव', 'महादेव', 'रुद्र'],
  'shiv': ['shiva', 'mahadev', 'bholenath', 'rudra', 'tandav', 'शिव'],
  'rudra': ['shiva', 'shiv', 'rudrashtakam', 'rudrashtak', 'रुद्र', 'रुद्राष्टक'],
  'tandav': ['tandava', 'shiva', 'ताण्डव'],

  // Hanuman
  'hanuman': ['bajrang', 'bajrangbali', 'maruti', 'pawanputra', 'sankatmochan', 'हनुमान', 'बजरंगबली'],
  'bajrang': ['hanuman', 'bajrangbali', 'bajrangbaan', 'बजरंगबली', 'बजरंगबाण'],
  'sundarkand': ['sundar kand', 'ramayana', 'hanuman', 'सुन्दरकाण्ड'],

  // Krishna
  'krishna': ['kanha', 'gopal', 'govind', 'kunjbihari', 'damodar', 'gita', 'कृष्ण', 'गोविन्द', 'दामोदर'],
  'kanha': ['krishna', 'कृष्ण'],

  // Rama
  'ram': ['rama', 'raghupati', 'sitaram', 'ramayana', 'ramcharitmanas', 'राम', 'श्रीराम', 'सीताराम'],
  'rama': ['ram', 'राम'],

  // Devi
  'durga': ['devi', 'kali', 'ambey', 'bhavani', 'saptashati', 'दुर्गा', 'देवी', 'अम्बे'],
  'lakshmi': ['laxmi', 'mahalakshmi', 'dhanada', 'shri', 'लक्ष्मी', 'महालक्ष्मी'],
  'laxmi': ['lakshmi', 'लक्ष्मी'],
  'saraswati': ['sharada', 'vidya', 'सरस्वती'],

  // Ganesha & Surya
  'ganesh': ['ganesha', 'ganapati', 'vinayak', 'गणेश', 'गणपति'],
  'ganapati': ['ganesh', 'गणपति'],
  'surya': ['sun', 'aditya', 'bhaskar', 'सूर्य', 'आदित्य'],
  'shani': ['shanidev', 'sadesati', 'शनि', 'शनिदेव'],

  // Vishwakarma
  'vishwakarma': ['vishvakarma', 'shri vishwakarma', 'shri-vishwakarma', 'विश्वकर्मा', 'श्री विश्वकर्मा'],
  'shri-vishwakarma': ['vishwakarma', 'shri vishwakarma', 'विश्वकर्मा', 'श्री विश्वकर्मा'],

  // Sages
  'tulsidas': ['tulsi', 'goswami', 'तुलसीदास'],
  'vedvyas': ['vyas', 'वेदव्यास'],
  'shankaracharya': ['shankara', 'adi shankaracharya', 'शंकराचार्य'],
};

/**
 * Normalizes text for resilient matching across spelling variations,
 * diacritics, and Indic marks.
 */
export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    // Normalize Roman vowels/variations
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/sh/g, 's')
    .replace(/ph/g, 'f')
    .replace(/w/g, 'v')
    // Normalize Devanagari nuktas
    .replace(/क़/g, 'क')
    .replace(/ख़/g, 'ख')
    .replace(/ग़/g, 'ग')
    .replace(/ज़/g, 'ज')
    .replace(/ड़/g, 'ड')
    .replace(/ढ़/g, 'ढ')
    .replace(/फ़/g, 'फ')
    // Normalize Devanagari candrabindu to anusvara
    .replace(/ँ/g, 'ं')
    // Remove extra punctuation
    .replace(/[-_.,॥।/\\()]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Extracts comprehensive keywords (both English & Hindi) from a book entry.
 */
export function deriveSearchKeywords(entry: {
  id: string;
  data: {
    title: string;
    author?: string;
    category: string;
    description: string;
    tags?: string[];
  };
}): string[] {
  const keywords = new Set<string>();

  // 1. Slug words (e.g. "hanuman-chalisa" -> "hanuman", "chalisa", "hanuman-chalisa")
  const slug = entry.id.replace(/\.md$/, '');
  keywords.add(slug);
  slug.split('-').forEach(part => {
    if (part) keywords.add(part);
  });

  // 2. Category names in English & Hindi
  const cat = entry.data.category;
  keywords.add(cat.toLowerCase());
  const catHindi = CATEGORY_HINDI_MAP[cat];
  if (catHindi) keywords.add(catHindi);

  // 3. Author in Hindi and slugified
  if (entry.data.author) {
    keywords.add(entry.data.author);
    keywords.add(tagToSlug(entry.data.author));
  }

  // 4. Tags in Hindi and English
  for (const tag of entry.data.tags ?? []) {
    keywords.add(tag);
    const tagSlug = tagToSlug(tag);
    if (tagSlug) {
      keywords.add(tagSlug);
      tagSlug.split('-').forEach(p => keywords.add(p));
    }
  }

  // 5. Expand with theological synonyms
  for (const kw of Array.from(keywords)) {
    const norm = kw.toLowerCase();
    if (THEOLOGICAL_ALIASES[norm]) {
      THEOLOGICAL_ALIASES[norm].forEach(alias => keywords.add(alias));
    }
  }

  return Array.from(keywords);
}

/**
 * Scores a search candidate against a query. Higher score = higher relevance.
 * Returns 0 if no match.
 */
export function scoreSearchItem(item: SearchCatalogItem, rawQuery: string): number {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return 1;

  const normQuery = normalizeSearchText(query);
  const queryTokens = normQuery.split(' ').filter(Boolean);

  let score = 0;

  const normTitle = normalizeSearchText(item.title);
  const normSlug = normalizeSearchText(item.slug.replace(/-/g, ' '));
  const normAuthor = normalizeSearchText(item.author || '');
  const normCategory = normalizeSearchText(item.category + ' ' + item.categoryHindi);
  const normDesc = normalizeSearchText(item.description);

  // 1. Exact or prefix matches on Title
  if (normTitle === normQuery) {
    score += 150;
  } else if (normTitle.startsWith(normQuery)) {
    score += 100;
  } else if (normTitle.includes(normQuery)) {
    score += 70;
  }

  // 2. Exact or prefix matches on English Slug
  if (normSlug === normQuery) {
    score += 130;
  } else if (normSlug.startsWith(normQuery)) {
    score += 90;
  } else if (normSlug.includes(normQuery)) {
    score += 60;
  }

  // 3. Token-based matching across all fields
  let allTokensMatched = true;

  for (const token of queryTokens) {
    let tokenMatched = false;

    if (normTitle.includes(token)) {
      score += 40;
      tokenMatched = true;
    }
    if (normSlug.includes(token)) {
      score += 35;
      tokenMatched = true;
    }
    if (normCategory.includes(token)) {
      score += 30;
      tokenMatched = true;
    }
    if (normAuthor.includes(token)) {
      score += 25;
      tokenMatched = true;
    }
    if (normDesc.includes(token)) {
      score += 15;
      tokenMatched = true;
    }

    // Keyword & Synonym matching
    for (const kw of item.keywords) {
      const normKw = normalizeSearchText(kw);
      if (normKw === token || normKw.startsWith(token)) {
        score += 20;
        tokenMatched = true;
        break;
      }
    }

    if (!tokenMatched) {
      allTokensMatched = false;
    }
  }

  if (!allTokensMatched && score < 50) {
    return 0;
  }

  // Weight priority bonus: lower weight = higher canonical priority
  // Max bonus 20 for top weight 10, decaying to 0
  const weightBonus = Math.max(0, Math.round((1000 - item.weight) / 50));
  score += weightBonus;

  return score;
}

/**
 * Searches and sorts a catalog of items.
 */
export function searchCatalog(items: SearchCatalogItem[], query: string): SearchCatalogItem[] {
  if (!query.trim()) return items;

  const scored: { item: SearchCatalogItem; score: number }[] = [];

  for (const item of items) {
    const score = scoreSearchItem(item, query);
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.item);
}
