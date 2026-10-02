/**
 * src/pages/search-catalog.json.ts
 * Static Endpoint for Gyankosh Catalog Search Data.
 *
 * Emits a single, highly cacheable search-catalog.json at build time.
 * Eliminates 19+ MB of redundant inline JSON previously duplicated across all 343 HTML files.
 */
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { sortTexts, getTextWeight } from '../utils/sorting';
import { deriveSearchKeywords, type SearchCatalogItem } from '../utils/search';
import { getCategoryLabel } from '../data/categoryMeta';
import { computeBuildReadingStats } from '../utils/indicParser';

export const GET: APIRoute = async () => {
  const allTexts = sortTexts(await getCollection('library'));

  const catalog: SearchCatalogItem[] = allTexts.map((text) => {
    const stats = computeBuildReadingStats(text.body);
    const item: SearchCatalogItem = {
      slug: text.id.replace(/\.md$/, ''),
      title: text.data.title,
      category: text.data.category,
      categoryHindi: getCategoryLabel(text.data.category),
      tags: text.data.tags || [],
      keywords: deriveSearchKeywords(text),
      weight: getTextWeight(text),
      readingTime: stats.cardTimeLabel,
    };

    if (text.data.author) item.author = text.data.author;
    if (text.data.description) item.description = text.data.description;

    return item;
  });

  return new Response(JSON.stringify(catalog), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
};
