import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORIES = ['Veda', 'Upanishad', 'Gita', 'Chalisa', 'Stotra', 'Aarti', 'Purana', 'Other'] as const;

const librarySchema = z.object({
  title: z.string(),
  author: z.string().optional(),
  description: z.string(),
  chapter: z.number().optional(),
  language: z.string().default('Sanskrit'),
  category: z.enum(CATEGORIES),
  coverColor: z.string().optional(),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  showNumbering: z.boolean().default(true),
});

export const collections = {
  library: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/library' }),
    schema: librarySchema,
  }),
};

export type LibraryEntry = z.infer<typeof librarySchema>;
export type Category = (typeof CATEGORIES)[number];
export { CATEGORIES };
