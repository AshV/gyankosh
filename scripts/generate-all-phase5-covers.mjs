import sharp from 'sharp';
import path from 'path';

const BASE_FRAME = 'public/covers/kanakadhara-stotram.jpg';

const covers = [
  {
    fileName: 'chanakya-niti.jpg',
    sourceFile: 'public/covers/rigveda-mandala1.jpg',
    crop: { left: 40, top: 450, width: 480, height: 340 },
    topText: 'चाणक्य नीति',
    topFontSize: 52,
    subText: 'आचार्य चाणक्य विरचितम्',
    subFontSize: 28,
    colors: ['#1e0a04', '#3d1808', '#1e0a04']
  },
  {
    fileName: 'vidura-niti.jpg',
    sourceFile: 'public/covers/bhagavad-gita.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'विदुर नीति',
    topFontSize: 52,
    subText: 'महात्मा विदुर — महाभारत उद्योगपर्व',
    subFontSize: 26,
    colors: ['#081426', '#162c4e', '#081426']
  },
  {
    fileName: 'ashtavakra-gita.jpg',
    sourceFile: 'public/covers/narayana-suktam.jpg',
    crop: { left: 130, top: 320, width: 764, height: 550 },
    topText: 'अष्टावक्र गीता',
    topFontSize: 52,
    subText: 'महर्षि अष्टावक्र विरचितम्',
    subFontSize: 28,
    colors: ['#140620', '#2d1042', '#140620']
  },
  {
    fileName: 'durga-saptashati.jpg',
    sourceFile: 'public/covers/durga-suktam.jpg',
    crop: { left: 100, top: 150, width: 824, height: 720 },
    topText: 'दुर्गा सप्तशती',
    topFontSize: 52,
    subText: 'कवच • अर्गला • कीलक — महर्षि मार्कण्डेय',
    subFontSize: 26,
    colors: ['#240408', '#480b12', '#240408']
  },
  {
    fileName: 'gopi-geet.jpg',
    sourceFile: 'public/covers/krishna-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'गोपी गीत',
    topFontSize: 52,
    subText: 'श्रीमद्भागवत महापुराण — रासपञ्चाध्यायी',
    subFontSize: 26,
    colors: ['#041628', '#0c2b4d', '#041628']
  },
  {
    fileName: 'damodarashtakam.jpg',
    sourceFile: 'public/covers/madhurashtakam.jpg',
    crop: { left: 60, top: 130, width: 680, height: 780 },
    topText: 'दामोदराष्टकम्',
    topFontSize: 52,
    subText: 'पद्मपुराणान्तर्गतम् — सत्यव्रत मुनि',
    subFontSize: 28,
    colors: ['#261402', '#4a2806', '#261402']
  },
  {
    fileName: 'aarti-kunjbihari-ki.jpg',
    sourceFile: 'public/covers/krishna-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'आरती कुंजबिहारी की',
    topFontSize: 48,
    subText: 'श्री गिरिधर कृष्ण मुरारी महाआरती',
    subFontSize: 28,
    colors: ['#061a2b', '#0f3352', '#061a2b']
  },
  {
    fileName: 'aarti-jai-jagdish-hare.jpg',
    sourceFile: 'public/covers/vishnu-sahasranama.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'ॐ जय जगदीश हरे',
    topFontSize: 50,
    subText: 'भगवान श्री लक्ष्मीनारायण महाआरती',
    subFontSize: 28,
    colors: ['#181004', '#38260c', '#181004']
  },
  {
    fileName: 'aarti-hanuman-ji.jpg',
    sourceFile: 'public/covers/hanuman-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'आरती हनुमान लला की',
    topFontSize: 48,
    subText: 'दुष्ट दलन रघुनाथ कला की',
    subFontSize: 28,
    colors: ['#260b03', '#4a1808', '#260b03']
  },
  {
    fileName: 'aarti-shiva-ji.jpg',
    sourceFile: 'public/covers/shiva-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'जय शिव ओंकारा',
    topFontSize: 52,
    subText: 'देवाधिदेव महादेव महाआरती',
    subFontSize: 28,
    colors: ['#05141c', '#0c2938', '#05141c']
  },
  {
    fileName: 'aarti-durga-mata.jpg',
    sourceFile: 'public/covers/durga-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'जय अम्बे गौरी',
    topFontSize: 52,
    subText: 'माँ जगदम्बा भवानी महाआरती',
    subFontSize: 28,
    colors: ['#240408', '#480b12', '#240408']
  },
  {
    fileName: 'aarti-ganesh-ji.jpg',
    sourceFile: 'public/covers/ganesh-chalisa.jpg',
    crop: { left: 60, top: 60, width: 680, height: 680 },
    topText: 'जय गणेश देवा',
    topFontSize: 52,
    subText: 'प्रथम पूज्य विघ्नहर्ता महाआरती',
    subFontSize: 28,
    colors: ['#140602', '#301004', '#140602']
  }
];

async function generateCover(cfg) {
  const centerArt = await sharp(cfg.sourceFile)
    .extract(cfg.crop)
    .resize(876, 744, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 95 })
    .toBuffer();

  const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${cfg.colors[0]}"/>
          <stop offset="50%" stop-color="${cfg.colors[1]}"/>
          <stop offset="100%" stop-color="${cfg.colors[2]}"/>
        </linearGradient>
        <linearGradient id="botGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="${cfg.colors[0]}"/>
          <stop offset="50%" stop-color="${cfg.colors[1]}"/>
          <stop offset="100%" stop-color="${cfg.colors[2]}"/>
        </linearGradient>
      </defs>
      <!-- Top banner solid fill with ornate gold border -->
      <rect x="72" y="48" width="880" height="110" rx="4" fill="url(#topGrad)" stroke="#e5b85c" stroke-width="2" />
      <text x="512" y="118"
            font-family="Nirmala UI, Mangal, Arial, sans-serif"
            font-size="${cfg.topFontSize}"
            font-weight="bold"
            fill="#ffe494"
            letter-spacing="3"
            text-anchor="middle">${cfg.topText}</text>
      <!-- Bottom banner solid fill with ornate gold border -->
      <rect x="72" y="890" width="880" height="76" rx="4" fill="url(#botGrad)" stroke="#e5b85c" stroke-width="2" />
      <text x="512" y="939"
            font-family="Nirmala UI, Mangal, Arial, sans-serif"
            font-size="${cfg.subFontSize}"
            font-weight="bold"
            fill="#ffd97d"
            letter-spacing="1.5"
            text-anchor="middle">${cfg.subText}</text>
    </svg>
  `;

  const outputPath = path.join('public/covers', cfg.fileName);
  await sharp(BASE_FRAME)
    .composite([
      { input: centerArt, left: 74, top: 154 },
      { input: Buffer.from(svg), top: 0, left: 0 }
    ])
    .jpeg({ quality: 96 })
    .toFile(outputPath);

  console.log(`Generated: ${cfg.fileName}`);
}

async function run() {
  console.log(`Starting Phase 5 cover generation for ${covers.length} covers...`);
  for (const c of covers) {
    await generateCover(c);
  }
  console.log('All 12 Phase 5 covers successfully generated!');
}

run().catch(console.error);
