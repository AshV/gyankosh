import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const libDir = path.resolve('a:/GitHub/Gyankosh/src/content/library');
const coversDir = path.resolve('a:/GitHub/Gyankosh/public/covers');
const outDir = path.resolve('a:/GitHub/Gyankosh/public/og');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const logoPath = path.resolve('a:/GitHub/Gyankosh/public/logo.png');

// Category Hindi label mapping
const categoryLabels = {
  'Gita': 'गीता',
  'Upanishad': 'उपनिषद्',
  'Veda': 'वेद',
  'Purana': 'पुराण',
  'Stotra': 'स्तोत्र',
  'Chalisa': 'चालीसा',
  'Aarti': 'आरती',
  'Other': 'ग्रन्थ'
};

const escapeXml = (unsafe) => (unsafe || '').replace(/[<>&'"]/g, c => {
  switch (c) {
    case '<': return '&lt;';
    case '>': return '&gt;';
    case '&': return '&amp;';
    case '\'': return '&apos;';
    case '"': return '&quot;';
    default: return c;
  }
});

async function generateAllOg() {
  const force = process.argv.includes('--force');
  const files = fs.readdirSync(libDir).filter(f => f.endsWith('.md'));
  console.log(`Checking OG cards for ${files.length} texts${force ? ' (force mode)' : ''}...`);
  const startTime = Date.now();

  const width = 1200;
  const height = 630;

  const logoSize = 56;
  const logoTop = 64;
  const logoLeft = 70;

  const logoBuffer = await sharp(logoPath)
    .resize(logoSize, logoSize, { fit: 'contain' })
    .toBuffer();

  let generated = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace('.md', '');
    const outFile = path.join(outDir, `${slug}.jpg`);

    if (!force && fs.existsSync(outFile)) {
      skipped++;
      continue;
    }

    const content = fs.readFileSync(path.join(libDir, file), 'utf8');

    // Simple frontmatter parser
    const titleMatch = content.match(/^title:\s*"([^"]+)"/m);
    const authorMatch = content.match(/^author:\s*"([^"]+)"/m);
    const categoryMatch = content.match(/^category:\s*"([^"]+)"/m);
    const coverMatch = content.match(/^coverImage:\s*"([^"]+)"/m);

    const title = titleMatch ? titleMatch[1] : slug;
    const author = authorMatch ? authorMatch[1] : '';
    const category = categoryMatch ? categoryMatch[1] : 'Stotra';
    const categoryName = categoryLabels[category] || category;

    // Resolve cover image
    let coverFile = coverMatch ? coverMatch[1].replace(/^\/covers\//, '').replace(/^\//, '') : `${slug}.webp`;
    let coverPath = path.join(coversDir, coverFile);

    if (!fs.existsSync(coverPath)) {
      // Try with .jpg or fallback
      const baseCover = coverFile.replace(/\.(webp|jpg|png)$/, '');
      if (fs.existsSync(path.join(coversDir, `${baseCover}.webp`))) {
        coverPath = path.join(coversDir, `${baseCover}.webp`);
      } else if (fs.existsSync(path.join(coversDir, `${baseCover}.jpg`))) {
        coverPath = path.join(coversDir, `${baseCover}.jpg`);
      } else {
        // Fallback to bhagavad-gita or default
        coverPath = path.join(coversDir, 'shiva-tandava-stotram.webp');
      }
    }

    const coverBuffer = await sharp(coverPath)
      .resize(340, 480, { fit: 'cover' })
      .toBuffer();

    const titleLen = title.length;
    const titleFontSize = titleLen > 30 ? 36 : (titleLen > 20 ? 42 : (titleLen > 14 ? 48 : 54));

    const svgOverlay = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1c0a06" />
          <stop offset="45%" stop-color="#2a0f08" />
          <stop offset="100%" stop-color="#120503" />
        </linearGradient>

        <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#f3d078" />
          <stop offset="50%" stop-color="#d4af37" />
          <stop offset="100%" stop-color="#aa7c11" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bg)" />

      <!-- Sacred Geometric Borders -->
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="14" fill="none" stroke="url(#gold)" stroke-width="1.6" stroke-opacity="0.45" />
      <rect x="32" y="32" width="${width - 64}" height="${height - 64}" rx="10" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-opacity="0.1" />

      <!-- Corner Bindu Accents -->
      <circle cx="24" cy="24" r="5" fill="#d4af37" />
      <circle cx="${width - 24}" cy="24" r="5" fill="#d4af37" />
      <circle cx="24" cy="${height - 24}" r="5" fill="#d4af37" />
      <circle cx="${width - 24}" cy="${height - 24}" r="5" fill="#d4af37" />

      <!-- Logo Subtle Gold Accent Ring -->
      <rect x="${logoLeft - 2}" y="${logoTop - 2}" width="${logoSize + 4}" height="${logoSize + 4}" rx="14" fill="none" stroke="url(#gold)" stroke-width="1.5" stroke-opacity="0.75" />

      <!-- Top Header Typography -->
      <g transform="translate(${logoLeft + logoSize + 16}, ${logoTop})">
        <text x="0" y="38" font-family="'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="1">ज्ञानकोश</text>
        <text x="120" y="36" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#b09f91" letter-spacing="2">/ GYANKOSH</text>

        <rect x="280" y="14" width="100" height="30" rx="15" fill="#3a150c" stroke="#d4af37" stroke-width="1" stroke-opacity="0.65" />
        <text x="330" y="34" text-anchor="middle" font-family="'Noto Sans Devanagari', sans-serif" font-size="14" font-weight="bold" fill="#f3d078">${escapeXml(categoryName)}</text>
      </g>

      <!-- Main Title -->
      <g transform="translate(70, 205)">
        <text x="0" y="0" font-family="'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif" font-size="${titleFontSize}" font-weight="bold" fill="#fffaf5">
          ${escapeXml(title)}
        </text>
      </g>

      <!-- Author -->
      ${author ? `
      <g transform="translate(70, 275)">
        <text x="0" y="0" font-family="'Noto Sans Devanagari', sans-serif" font-size="24" font-weight="600" fill="url(#gold)">
          ✍ ${escapeXml(author)}
        </text>
      </g>` : ''}

      <!-- Highlight Badge -->
      <g transform="translate(70, 355)">
        <rect x="0" y="0" width="570" height="66" rx="8" fill="#ffffff" fill-opacity="0.04" stroke="#ffffff" stroke-opacity="0.09" />
        <text x="24" y="40" font-family="'Noto Sans Devanagari', sans-serif" font-size="18" fill="#e8ded5">
          मूल शुद्ध पाठ • अन्वय • प्रामाणिक हिन्दी भावार्थ
        </text>
      </g>

      <!-- Footer Credentials -->
      <g transform="translate(70, 520)">
        <text x="0" y="0" font-family="system-ui, sans-serif" font-size="18" font-weight="600" fill="#f3d078" letter-spacing="0.5">
          ashishvishwakarma.com/gyankosh
        </text>
        <text x="0" y="26" font-family="'Noto Sans Devanagari', sans-serif" font-size="14" fill="#a39386">
          सनातन धर्म के १०८ पावन ग्रन्थों का प्रामाणिक डिजिटल संग्रह
        </text>
      </g>

      <!-- Book Cover Golden Border & Frame -->
      <rect x="765" y="70" width="350" height="490" rx="14" fill="none" stroke="url(#gold)" stroke-width="2.5" />
    </svg>
    `;

    const finalImage = await sharp(Buffer.from(svgOverlay))
      .composite([
        {
          input: coverBuffer,
          top: 75,
          left: 770,
        },
        {
          input: logoBuffer,
          top: logoTop,
          left: logoLeft,
        }
      ])
      .jpeg({ quality: 86, mozjpeg: true })
      .toBuffer();

    fs.writeFileSync(path.join(outDir, `${slug}.jpg`), finalImage);
    generated++;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n🎉 OG cards ready: ${generated} generated, ${skipped} already up to date (${duration}s).`);
  console.log(`Output directory: ${outDir}`);
}

generateAllOg().catch(console.error);
