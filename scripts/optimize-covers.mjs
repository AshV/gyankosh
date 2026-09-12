/**
 * scripts/optimize-covers.mjs
 * Resizes and compresses all book covers in public/covers/
 * - Generates high-efficiency progressive JPEGs (max width 420px, quality 80)
 * - Generates modern WebP versions alongside JPEGs (quality 80)
 * Massively cuts payload from ~23MB down to <2MB.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const coversDir = path.join(rootDir, 'public', 'covers');

async function main() {
  if (!fs.existsSync(coversDir)) {
    console.error('Covers directory does not exist:', coversDir);
    process.exit(1);
  }

  const files = fs.readdirSync(coversDir).filter((f) => f.toLowerCase().endsWith('.jpg'));
  console.log(`Found ${files.length} cover images to optimize in ${coversDir}...`);

  let totalOriginalSize = 0;
  let totalOptimizedJpgSize = 0;
  let totalWebpSize = 0;

  for (const file of files) {
    const filePath = path.join(coversDir, file);
    const originalBuffer = fs.readFileSync(filePath);
    const origSize = originalBuffer.length;
    totalOriginalSize += origSize;

    const baseName = path.basename(file, path.extname(file));
    const webpPath = path.join(coversDir, `${baseName}.webp`);

    // 1. Process optimized JPEG
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    let transformJpg = sharp(originalBuffer);
    let transformWebp = sharp(originalBuffer);

    // Resize if width > 420px
    if (metadata.width && metadata.width > 420) {
      transformJpg = transformJpg.resize({ width: 420, withoutEnlargement: true });
      transformWebp = transformWebp.resize({ width: 420, withoutEnlargement: true });
    }

    const optimizedJpgBuffer = await transformJpg
      .jpeg({ quality: 80, mozjpeg: true, progressive: true })
      .toBuffer();

    const optimizedWebpBuffer = await transformWebp
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    // Overwrite JPEG with optimized version
    fs.writeFileSync(filePath, optimizedJpgBuffer);
    // Write WebP version
    fs.writeFileSync(webpPath, optimizedWebpBuffer);

    totalOptimizedJpgSize += optimizedJpgBuffer.length;
    totalWebpSize += optimizedWebpBuffer.length;

    const reduction = Math.round((1 - optimizedWebpBuffer.length / origSize) * 100);
    console.log(
      `✓ ${file}: ${(origSize / 1024).toFixed(0)}KB -> JPG: ${(optimizedJpgBuffer.length / 1024).toFixed(0)}KB, WebP: ${(optimizedWebpBuffer.length / 1024).toFixed(0)}KB (-${reduction}%)`
    );
  }

  const origMB = (totalOriginalSize / (1024 * 1024)).toFixed(2);
  const jpgMB = (totalOptimizedJpgSize / (1024 * 1024)).toFixed(2);
  const webpMB = (totalWebpSize / (1024 * 1024)).toFixed(2);

  console.log('\n========================================');
  console.log(`Original total size : ${origMB} MB`);
  console.log(`Optimized JPG total : ${jpgMB} MB`);
  console.log(`Optimized WebP total: ${webpMB} MB`);
  console.log(
    `Overall Reduction   : -${Math.round((1 - totalWebpSize / totalOriginalSize) * 100)}%`
  );
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('Error optimizing covers:', err);
  process.exit(1);
});
