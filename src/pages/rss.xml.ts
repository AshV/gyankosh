/**
 * src/pages/rss.xml.ts
 * RSS Feed — enables feed readers and faster content discovery by search engines.
 * Publishes all library entries as feed items.
 */
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { sortTexts } from '../utils/sorting';

export async function GET(context: APIContext) {
  const allTexts = sortTexts(await getCollection('library'));

  return rss({
    title: 'ज्ञानकोश — सनातन धर्मग्रंथ संग्रह',
    description: 'सनातन वैदिक एवं पौराणिक धर्मग्रंथों का पावन डिजिटल पुस्तकालय — वेद, श्रीमद्भगवद्गीता, हनुमान चालीसा, पुराण।',
    site: context.site!,
    items: allTexts.map(text => ({
      title: text.data.title,
      description: text.data.description,
      link: `/gyankosh/read/${text.id}`,
      categories: [text.data.category],
      ...(text.data.author && { author: text.data.author }),
    })),
    customData: `<language>hi</language>`,
  });
}
