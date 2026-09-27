/**
 * src/data/categoryMeta.ts
 * Single source of truth for category metadata across Gyankosh.
 *
 * Previously duplicated in:
 *   - src/utils/search.ts (CATEGORY_HINDI_MAP)
 *   - src/pages/search-catalog.json.ts (CATEGORY_ICONS)
 *   - src/layouts/ReaderLayout.astro (categoryHindiMap)
 *   - src/pages/index.astro (categoryMeta)
 */

export interface CategoryMeta {
  icon: string;
  nameHindi: string;
  description: string;
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  Veda:       { icon: '🔥', nameHindi: 'वेद',       description: 'सनातन वैदिक ऋचाएं एवं मन्त्र' },
  Upanishad:  { icon: '🕉️', nameHindi: 'उपनिषद्',  description: 'वेदान्त दर्शन के आधारभूत पावन उपनिषद्' },
  Gita:       { icon: '🎵', nameHindi: 'गीता',      description: 'भगवान श्रीकृष्ण का दिव्य उपदेश' },
  Chalisa:    { icon: '🪔', nameHindi: 'चालीसा',    description: 'चालीस पदों वाले पावन स्तोत्र' },
  Stotra:     { icon: '🌸', nameHindi: 'स्तोत्र',   description: 'देवी-देवताओं की पावन स्तुतियां' },
  Aarti:      { icon: '🪔', nameHindi: 'आरती',      description: 'नित्य देव-आराधना एवं मंगल आरतियाँ' },
  Purana:     { icon: '📖', nameHindi: 'पुराण',     description: 'अठारह महापुराण एवं उपपुराण' },
  Other:      { icon: '📜', nameHindi: 'अन्य',      description: 'विशिष्ट धार्मिक एवं दार्शनिक ग्रन्थ' },
};

/** Quick lookup: category key → "icon nameHindi" label (e.g. "🔥 वेद") */
export function getCategoryLabel(category: string): string {
  const m = CATEGORY_META[category];
  return m ? `${m.icon} ${m.nameHindi}` : category;
}

/** Quick lookup: category key → Hindi name only (e.g. "वेद") */
export function getCategoryHindi(category: string): string {
  return CATEGORY_META[category]?.nameHindi ?? category;
}
