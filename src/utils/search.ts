/**
 * src/utils/search.ts
 * Gyankosh Dual-Script Indic & English Catalog Search Engine.
 *
 * Enables seamless search across sacred texts using:
 * 1. English / Hinglish / Roman script (e.g., "hanuman chalisa", "gita 2", "rudrashtakam", "geeta", "shiv", "krishna")
 * 2. Hindi / Devanagari script (e.g., "हनुमान चालीसा", "गीता", "शिव", "रुद्राष्टकम्")
 */

import { tagToSlug } from './tags';
import { getCategoryHindi } from '../data/categoryMeta';

export interface SearchCatalogItem {
  slug: string;
  title: string;
  author?: string;
  category: string;
  categoryHindi: string;
  description?: string;
  tags: string[];
  coverColor?: string;
  coverImage?: string;
  keywords: string[];
  weight: number;
  readingTime?: string;
}


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
const SEARCH_NORMALIZE_MAP: Record<string, string> = {
  ee: 'i',
  oo: 'u',
  sh: 's',
  ph: 'f',
  w: 'v',
  'क़': 'क',
  'ख़': 'ख',
  'ग़': 'ग',
  'ज़': 'ज',
  'ड़': 'ड',
  'ढ़': 'ढ',
  'फ़': 'फ',
  'ँ': 'ं',
};

const SEARCH_NORMALIZE_REGEX = /(?:ee|oo|sh|ph|w|क़|ख़|ग़|ज़|ड़|ढ़|फ़|ँ|[-_.,॥।/\\()])/g;

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(SEARCH_NORMALIZE_REGEX, (m) => SEARCH_NORMALIZE_MAP[m] || ' ')
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
  const baseWords = new Set<string>();

  const slug = entry.id.replace(/\.md$/, '');
  baseWords.add(slug);
  slug.split('-').forEach(p => { if (p) baseWords.add(p.toLowerCase()); });

  const cat = entry.data.category.toLowerCase();
  baseWords.add(cat);
  const catHindi = getCategoryHindi(entry.data.category);
  if (catHindi) baseWords.add(catHindi);

  if (entry.data.author) {
    baseWords.add(entry.data.author);
    const aSlug = tagToSlug(entry.data.author);
    if (aSlug) {
      baseWords.add(aSlug);
      aSlug.split('-').forEach(p => { if (p) baseWords.add(p.toLowerCase()); });
    }
  }

  for (const tag of entry.data.tags ?? []) {
    baseWords.add(tag);
    const tagSlug = tagToSlug(tag);
    if (tagSlug) {
      baseWords.add(tagSlug);
      tagSlug.split('-').forEach(p => { if (p) baseWords.add(p.toLowerCase()); });
    }
  }

  // 1. Expand with theological synonyms
  for (const w of Array.from(baseWords)) {
    const norm = w.toLowerCase();
    if (THEOLOGICAL_ALIASES[norm]) {
      THEOLOGICAL_ALIASES[norm].forEach(alias => keywords.add(alias));
    }
  }

  // 2. Add transliterated tag slugs for Romanized searching
  for (const tag of entry.data.tags ?? []) {
    const tagSlug = tagToSlug(tag);
    if (tagSlug) {
      tagSlug.split('-').forEach(p => {
        if (p && p.length > 2) keywords.add(p);
      });
    }
  }

  // 3. Meaningful terms from description (excluding common stop words, already known words, and short tokens)
  if (entry.data.description) {
    const descTokens = entry.data.description
      .replace(/[—–.,;:!?'"“”‘’।॥()\[\]{}/\\<>+=*#_~`]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim().toLowerCase())
      .filter(w => w.length >= 3);

    const STOP_WORDS = new Set([
      'की', 'का', 'के', 'में', 'एवं', 'और', 'है', 'हैं', 'से', 'पर', 'द्वारा',
      'कृत', 'श्री', 'यह', 'वह', 'भी', 'को', 'जो', 'तो', 'था', 'थी', 'थे',
      'हो', 'हुए', 'गया', 'गई', 'गए', 'कर', 'करते', 'करना', 'लिए', 'साथ',
      'the', 'and', 'for', 'with', 'this', 'that', 'from', 'into', 'over'
    ]);

    for (const token of descTokens) {
      if (!STOP_WORDS.has(token)) {
        keywords.add(token);
      }
    }
  }

  // Prune keywords already covered by title, slug, author, or tags
  const titleNorm = normalizeSearchText(entry.data.title);
  const slugNorm = normalizeSearchText(slug.replace(/-/g, ' '));
  const authorNorm = entry.data.author ? normalizeSearchText(entry.data.author) : '';
  const tagsNorm = (entry.data.tags ?? []).map(t => normalizeSearchText(t));

  return Array.from(keywords).filter(kw => {
    const normKw = normalizeSearchText(kw);
    if (!normKw || normKw.length < 2) return false;
    if (titleNorm.includes(normKw) || slugNorm.includes(normKw)) return false;
    if (authorNorm && authorNorm.includes(normKw)) return false;
    if (tagsNorm.some(t => t === normKw)) return false;
    return true;
  });
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
  const normDesc = item.description ? normalizeSearchText(item.description) : '';

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
    if (item.tags && item.tags.length > 0) {
      for (const tag of item.tags) {
        if (normalizeSearchText(tag).includes(token)) {
          score += 25;
          tokenMatched = true;
          break;
        }
      }
    }
    if (normDesc && normDesc.includes(token)) {
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
