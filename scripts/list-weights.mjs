/**
 * scripts/list-weights.mjs
 * Master Weight Registry & Audit utility for Gyankosh (Workflow B).
 *
 * Source of Truth: src/data/weights.json
 *
 * Usage:
 *   node scripts/list-weights.mjs          # Display weight table & stats in console
 *   node scripts/list-weights.mjs --sync   # Synchronize WEIGHTS.md documentation
 */
import fs from 'fs';
import path from 'path';

const libraryDir = './src/content/library';
const weightsFile = './src/data/weights.json';
const isSync = process.argv.includes('--sync');

if (!fs.existsSync(weightsFile)) {
  console.error(`Error: Weights registry file not found at ${weightsFile}`);
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(weightsFile, 'utf8'));
const weightsMap = registry.weights || {};

const files = fs.readdirSync(libraryDir).filter(f => f.endsWith('.md'));

const entries = [];
const unassigned = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(libraryDir, file), 'utf8');
  const slug = file.replace(/\.md$/, '');

  const titleMatch = content.match(/^title:\s*"([^"]+)"/m) || content.match(/^title:\s*([^\n\r]+)/m);
  const categoryMatch = content.match(/^category:\s*"([^"]+)"/m) || content.match(/^category:\s*([^\n\r]+)/m);
  const chapterMatch = content.match(/^chapter:\s*(\d+)/m);

  const hasWeight = Object.prototype.hasOwnProperty.call(weightsMap, slug);
  const weight = hasWeight ? weightsMap[slug] : 1000;

  if (!hasWeight) {
    unassigned.push({ slug, file });
  }

  entries.push({
    file,
    slug,
    title: titleMatch ? titleMatch[1].trim() : file,
    category: categoryMatch ? categoryMatch[1].trim() : 'Other',
    weight,
    hasWeight,
    chapter: chapterMatch ? parseInt(chapterMatch[1], 10) : null,
  });
}

// Sort by weight, then chapter, then title
entries.sort((a, b) => {
  if (a.weight !== b.weight) return a.weight - b.weight;
  if (a.chapter !== null && b.chapter !== null) return a.chapter - b.chapter;
  return a.title.localeCompare(b.title, 'hi');
});

let maxWeight = 0;
for (const w of Object.values(weightsMap)) {
  if (typeof w === 'number' && w > maxWeight) maxWeight = w;
}
const nextWeight = maxWeight + 10;

// Update header numbers in registry if needed
if (registry.highestWeight !== maxWeight || registry.nextRecommendedWeight !== nextWeight) {
  registry.highestWeight = maxWeight;
  registry.nextRecommendedWeight = nextWeight;
  fs.writeFileSync(weightsFile, JSON.stringify(registry, null, 2), 'utf8');
}

console.log('='.repeat(78));
console.log(` 📚 Gyankosh Master Weight Registry (${entries.length} Sacred Texts)`);
console.log('    Source of Truth: src/data/weights.json');
console.log('='.repeat(78));
console.log(' Wt   | Category   | Title / Description (Slug)');
console.log('-'.repeat(78));

for (const e of entries) {
  const wtStr = e.hasWeight ? e.weight.toString().padStart(4) : ' ---';
  const catStr = e.category.padEnd(10);
  console.log(` ${wtStr} | ${catStr} | ${e.title} (${e.slug})`);
}

console.log('-'.repeat(78));
console.log(`Total Library Texts:       ${entries.length}`);
console.log(`Highest Weight Allocated:  ${maxWeight}`);
console.log(`Next Recommended Weight:   ${nextWeight}`);

if (unassigned.length > 0) {
  console.log(`⚠️  Unassigned Texts (${unassigned.length}):`);
  for (const u of unassigned) {
    console.log(`   - ${u.slug} (${u.file}) -> will default to 1000`);
  }
} else {
  console.log('✅ All library texts are properly mapped in src/data/weights.json');
}
console.log('='.repeat(78));

if (isSync) {
  // Generate WEIGHTS.md
  let mdContent = `# Gyankosh Sacred Texts Weight Registry

> **Single Source of Truth**: [\`src/data/weights.json\`](file:///a:/GitHub/Gyankosh/src/data/weights.json)  
> Lower weight = higher priority (displayed first in library and category views).  
> To assign or adjust weights, update \`src/data/weights.json\` directly. No changes to Markdown files needed!

---

## ⚡ Quick Reference

| Metric | Value |
| :--- | :--- |
| **Source of Truth** | [\`src/data/weights.json\`](file:///a:/GitHub/Gyankosh/src/data/weights.json) |
| **Total Sacred Texts** | \`${entries.length}\` |
| **Highest Weight Allocated** | \`${maxWeight}\` |
| **Next Recommended Weight** | **\`${nextWeight}\`** (increment by 10) |
| **Default Fallback Weight** | \`1000\` |

---

## 🧭 Weight Tier Architecture

Gyankosh assigns weights in blocks of 10 to allow future insertions without renumbering:

| Weight Range | Classification | Purpose / Scope |
| :--- | :--- | :--- |
| **10 – 90** | **Daily / High-Frequency** | Hanuman Chalisa, Sundarkand, Shiv Tandav, Bajrang Baan, etc. |
| **100 – 290** | **Core Stotras, Aartis & Suktams** | Vishnu Sahasranama, Ganesh Aarti, Durga Saptashati, Sri Suktam |
| **300 – 480** | **Gita Corpus** | Complete Srimad Bhagavad Gita (Ch 1–18) & Ashtavakra Gita |
| **490 – 550** | **Principal Upanishads** | Isha, Katha, Kena, Mandukya, Mundaka, Prashna, Taittiriya |
| **560 – 600** | **Niti Shastra & Classical Suktams** | Chanakya Niti, Vidura Niti, Durga/Narayana Suktams, Rigveda |
| **610 – 690** | **Additional Stotras & Deva Chalisas** | Ganga, Navagraha, Shani, Saraswati, Krishna, Ram, Gayatri, Surya, Bhairav |
| **700 – 740** | **Lord Vishwakarma Corpus** | Chalisa (700), Aarti (710), Suktam (720), Stotram (730), Puran (740) |
| **750+** | **Next Planned Additions** | Ready for next texts |

---

## 📜 Complete Text Weight Registry

| Weight | Category | Title (शीर्षक) | Slug (Identifier) |
| :---: | :--- | :--- | :--- |
`;

  for (const e of entries) {
    const wt = e.hasWeight ? `**${e.weight}**` : '*none (1000)*';
    mdContent += `| ${wt} | ${e.category} | ${e.title} | \`${e.slug}\` |\n`;
  }

  mdContent += `\n---\n*Last updated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}*\n`;

  fs.writeFileSync('./WEIGHTS.md', mdContent, 'utf8');
  console.log('✅ Synchronized WEIGHTS.md');
}
