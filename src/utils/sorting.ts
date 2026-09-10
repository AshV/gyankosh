/**
 * src/utils/sorting.ts
 * Centralized weight-wise sorting utility for Gyankosh library texts.
 *
 * Sorting Hierarchy:
 * 1. Weight: ascending order (lower number = higher priority / appears first, default: 100)
 * 2. Chapter: ascending order (for multi-chapter scriptures like Gita chapters 1..18)
 * 3. Title: alphabetical Hindi/Devanagari collation
 */

import weightsRegistry from '../data/weights.json';

const weightsMap = weightsRegistry.weights as Record<string, number>;

export interface SortableText {
  id?: string;
  data: {
    title: string;
    weight?: number;
    chapter?: number;
    category?: string;
    [key: string]: any;
  };
}

export interface SortOptions {
  groupByCategory?: boolean;
}

/**
 * Resolves the weight for a text:
 * 1. Checks weights registry (src/data/weights.json) by slug/id
 * 2. Falls back to frontmatter weight (if any)
 * 3. Defaults to 1000
 */
export function getTextWeight(text: SortableText): number {
  const slug = text.id ? text.id.replace(/\.md$/, '') : '';
  return weightsMap[slug] ?? text.data.weight ?? 1000;
}

export function sortTexts<T extends SortableText>(texts: T[], options: SortOptions = {}): T[] {
  return [...texts].sort((a, b) => {
    // Optional grouping by category first
    if (options.groupByCategory && a.data.category !== b.data.category) {
      return (a.data.category || '').localeCompare(b.data.category || '', 'hi');
    }

    // 1. Weight-wise sort (lower weight = higher priority / shown first, default 1000)
    const weightA = getTextWeight(a);
    const weightB = getTextWeight(b);
    if (weightA !== weightB) {
      return weightA - weightB;
    }

    // 2. Chapter-wise sort (if both texts specify a chapter number)
    if (a.data.chapter != null && b.data.chapter != null) {
      return a.data.chapter - b.data.chapter;
    }
    if (a.data.chapter != null) return -1;
    if (b.data.chapter != null) return 1;

    // 3. Devanagari/Hindi Title Collation
    return a.data.title.localeCompare(b.data.title, 'hi');
  });
}
