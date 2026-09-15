# 🎨 Gyankosh Cover Art Prompts Registry

This document stores curated prompts for generating high-quality **1:1 square** cover art using Gemini (or any modern AI image model).

---

## 🪷 Chitrakoot & Sri Rama Sacred Series

### 1. श्रीरामरक्षास्तोत्रम् (Shri Ram Raksha Stotram)
- **Target File**: `public/covers/ram-raksha-stotram.jpg` & `.webp`
- **Slug**: `ram-raksha-stotram`
- **Aspect Ratio**: `1:1`
- **Style**: Classical North Indian Devotional / Sacred Indian Temple Art / Raja Ravi Varma aesthetic
- **Prompt**:
```text
Magnificent 1:1 square sacred Indian devotional painting depicting Lord Rama as the supreme protector (Vajra Panjara Rama). Lord Rama is seated in serene lotus posture (baddhapadmasana) beneath a sacred Kalpavriksha tree, surrounded by a radiant golden and azure divine aura, holding his divine golden bow Kodanda and shining arrows. Adorned in bright pitambara yellow silk robes, ornate Vedic gold jewelry, pearl necklaces, and a luminous gem-studded crown. Mother Sita is seated gracefully on his left, and Lakshmana stands vigilantly with bow on his right. Ethereal golden light, sacred Sanskrit armor motifs gently glowing around, classical Indian temple art aesthetic, Raja Ravi Varma style, ultra-detailed, masterpiece.
```

---

### 2. श्रीरामचन्द्र कृपालु भजु मन (Shri Ramachandra Kripalu)
- **Target File**: `public/covers/shri-ramachandra-kripalu.jpg` & `.webp`
- **Slug**: `shri-ramachandra-kripalu`
- **Aspect Ratio**: `1:1`
- **Style**: Gita Press Gorakhpur lithograph & classical Bhakti oil painting style
- **Prompt**:
```text
Enchanting and deeply devotional 1:1 square artwork illustrating the sublime beauty of Shri Ramachandra ("नवनीलनीरद सुन्दरम्"). Lord Rama stands gracefully with gentle lotus eyes (nava-kanja lochana), glowing soft bluish-cyan complexion, adorned in sparkling yellow pitambara robes that shine like lightning against monsoon clouds, wearing a majestic crown and long fragrant floral and pearl garlands. Saint Tulsidas is depicted in humble adoration in the foreground on the sacred stone ghats of Mandakini at Chitrakoot. Soft twilight atmosphere, floating river diyas, blooming lotuses, rich warm divine illumination, masterclass traditional Indian fine art.
```

---

### 3. श्री कामतानाथ स्तुति एवं आरती (Shri Kamatanath Stuti & Aarti)
- **Target File**: `public/covers/kamtanath-stuti-aarti.jpg` & `.webp`
- **Slug**: `kamtanath-stuti-aarti`
- **Aspect Ratio**: `1:1`
- **Style**: Sacred Pilgrimage Landscape / Divine Indian Devotional Art
- **Prompt**:
```text
Sacred 1:1 square devotional art depicting the holy Kamadgiri hill (Kamtanath Swamy) at Chitrakoot Dham. The lush, sacred green mountain is seen enveloped in a celestial golden and emerald divine aura, manifesting the subtle divine presence and blessings of Lord Rama and Sita. Devotees are shown performing the parikrama path with oil lamps and flower offerings, sacred Peepal, Banyan, and Kadamba trees, temple archways of the four gates (Chaar Dwaar) adorned with saffron and yellow flags fluttering, sacred Mandakini river reflections nearby. Mystical, deeply spiritual, traditional Indian pilgrimage painting style, 8k resolution.
```

---

## 🛠️ Post-Generation Optimization Command

Once you have generated the 1:1 images and placed them in `public/covers/`:
```bash
# Optimize and generate matching .webp versions
npm run covers:optimize
```
Or process a specific image using Node/Sharp:
```javascript
const sharp = require('sharp');
const file = 'public/covers/<slug>.jpg';
sharp(file)
  .resize({ width: 420, height: 420, fit: 'cover' })
  .jpeg({ quality: 85, mozjpeg: true, progressive: true })
  .toFile('public/covers/<slug>.jpg');
sharp(file)
  .resize({ width: 420, height: 420, fit: 'cover' })
  .webp({ quality: 85, effort: 4 })
  .toFile('public/covers/<slug>.webp');
```
