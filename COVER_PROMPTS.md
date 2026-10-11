# 🎨 Gyankosh Sacred Cover Art Design System & Prompt Registry

> **Standard Version**: 2.0 (Post-Golden Frame Redesign)  
> **Aspect Ratio**: 3:4 Portrait (`896 × 1200` Master Generation → `768 × 1024` WebP / JPEG)  
> **Artistic Lineage**: Classical Gita Press Devotional Heritage & Raja Ravi Varma Academic Realism  
> **Status**: Verified with Masterwork Pilot Generation

---

## 🏛️ 1. Core Principles & Negative Constraints

To ensure 100% aesthetic harmony and eliminate the inconsistencies found in previous iterations (such as 80s bazaar posters, synthetic brown banners, and mismatched square crops), every cover image generated for Gyankosh must adhere to three foundational rules:

### A. Strict 3:4 Vertical Aspect Ratio
* **Why**: The redesigned Gyankosh card architecture (`BookCard.astro`) features a dedicated left column thumbnail frame with `aspect-ratio: 3 / 4` (rendered at `120 × 160px` up to `140 × 187px`).
* **Requirement**: Generation must use `3:4` vertical portrait mode (`896 × 1200` master). This frames the complete sacred form from the divine crown (*मुकुट*) to the lotus feet (*चरण कमल*) with zero awkward cropping.

### B. 100% Pure Text-Free Sacred Painting (Zero AI Typography)
* **Why**: The web card header **already displays the sacred title in vector Devanagari** (`॥ श्री हनुमान चालीसा ॥`) with gold divider flourish.
* **Negative Prompt Rule**: **STRICTLY NO TEXT, NO LETTERS, NO DEVANAGARI, NO ENGLISH, NO COMPUTER-GENERATED BANNER STRIPS, NO TITLE BOXES, NO WATERMARKS, NO SIGNATURES.** Any digital lettering instantly destroys the timeless museum-grade quality.

### C. Zero Artificial Outer Frames
* **Why**: The web card UI **already surrounds the entire card with an authentic repoussé golden temple frame** (`public/borders/sacred-gold-frame.webp`).
* **Requirement**: No thick rectangular frames or decorative border stripes inside the artwork itself. The background should extend edge-to-edge with organic temple architecture (*गर्भगृह तोरण, मेहराब, स्तम्भ*), sacred rivers, or cosmic skies.

---

## 🎨 2. The 5 Sacred Indic Color Traditions

Every grantha in Gyankosh belongs strictly to one of **5 authentic spiritual traditions**, each defined by a precise color palette, sacred natural pigments, symbolic lighting, and spiritual mood (*रस*):

| Tradition | Symbolic Hues & Hex Codes | Natural Indic Pigments | Lighting & Atmosphere | Key Granthas |
| :--- | :--- | :--- | :--- | :--- |
| **1. Rama & Vaishnava Bhakti** | **Sacred Saffron** (`#E67E22`)<br/>**Pitambara Gold** (`#D4AF37`)<br/>**Dandakaranya Emerald** (`#1B4D3E`)<br/>**Warm Sindoor** (`#D35400`) | Haridra (Turmeric), Hingula (Vermilion), Swarna Bhasma (Gold Leaf) | Warm Brahmamuhurta dawn light, gentle golden prabhamandala halo, incense and rose glow | Hanuman Chalisa, Bajrang Baan, Sundarkand, Ram Raksha, Ramcharitmanas, Bhagavad Gita, Vishnu Sahasranama |
| **2. Shiva & Rudra Stotras** | **Kailash Azure** (`#0D1B2A`)<br/>**Camphor White** (`#F7F9FB`)<br/>**Sacred Bhasma Ash** (`#8D99AE`)<br/>**Nilakantha Blue** (`#0F4C81`)<br/>**Burnished Brass** (`#C5A059`) | Karpoora (Camphor), Vibhuti (Sacred Ash), Lapis Lazuli, Neelam | Moonlit Himalayan Sandhya (twilight), cosmic starlight, glowing crescent moon, flickering camphor aarti lamps | Shiva Tandav, Rudrashtakam, Mahimna Stotra, Panchakshara, Lingashtakam, Bhairava Ashtakam |
| **3. Devi & Shakta Parayan** | **Deep Sindoor Crimson** (`#941919`)<br/>**Kumkum Maroon** (`#660F10`)<br/>**Radiant Temple Gold** (`#E5A93C`)<br/>**Nelumbo Lotus Pink** (`#E06D8C`) | Kumkuma, Raktachandana (Red Sandalwood), Manahshila | Golden hour Navaratri temple sanctum (*गर्भगृह*), glowing bronze 108-deepak lamps, falling red hibiscus petals | Durga Chalisa, Durga Saptashati, Mahishasura Mardini, Sri Suktam, Kali Chalisa, Lalita Sahasranama |
| **4. Upanishads & Vedas (Jnana Kanda)** | **Sacred Havana Amber** (`#D97706`)<br/>**Sandalwood Ivory** (`#F5EBE0`)<br/>**Vedic Terracotta** (`#A0522D`)<br/>**Hiranyagarbha Solar Gold** (`#FBBF24`) | Chandana (Sandalwood), Gairika (Red Ochre), Agnihotra Bhasma | Dawn mist over sacred riverbank, rising golden smoke from sacrificial Havan Kunda, shade of ancient Banyan tree | Isha, Katha, Kena, Mandukya, Mundaka, Prashna Upanishad, Rigveda, Purusha Suktam, Shanti Path |
| **5. Niti, Darshan & Purana (Wisdom)** | **Antique Teakwood** (`#3D2612`)<br/>**Warm Aged Parchment** (`#EFE3C3`)<br/>**Burnished Brass** (`#B8860B`)<br/>**Takshashila Sandstone** (`#C2A675`) | Kajal (Lampblack Ink), Talapatra (Palm-Leaf), Pital (Brass) | Takshashila scholar's chamber, warm chiaroscuro light from bronze oil lamp (deepak), antique birch-bark manuscripts | Chanakya Niti, Vidura Niti, Bhartrihari Niti Shatakam, Ashtavakra Gita, Puranas |

---

## 📐 3. The Multi-Layered Deep Prompt Formula

To ensure prompt depth and absolute consistency, every prompt must be engineered using this **6-Layer Architecture**:

```
[Layer 1: Master Art Lineage & Medium]
"Museum-grade classical Indian devotional oil painting on fine canvas in the authentic Gita Press and Raja Ravi Varma heritage fine art tradition..."

[Layer 2: Divine Subject, Posture & Mudra]
"Depicting [Deity / Sage] in [specific seated/standing/dynamic posture] with [Abhaya/Dhyana/Chin Mudra]..."

[Layer 3: Sacred Attire, Ornaments & Ayudhas]
"Adorned with [Kirita-Mukuta crown], [Vanamala/Rudraksha garland], [Pitambara silk/tiger skin], holding [specific weapons/attributes] in specific hands..."

[Layer 4: Sacred Sanctum / Environment & Lighting]
"Set within [ancient carved stone Garbhagriha / Kailash snowy peaks / Tapovan riverbank], illuminated by [flickering ghee oil lamps / celestial golden dawn rays / cosmic moonlit aura]..."

[Layer 5: Explicit Named Color Palette & Codes]
"Dominant color palette: [Primary Color + Hex], [Secondary Color + Hex], [Supporting Accent Tones]..."

[Layer 6: Strict Negative Constraints]
"Strict 3:4 vertical portrait aspect ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or border stripes, no modern 3D CGI cartoon look, pure sacred painting."
```

---

## 📜 4. Master Prompt Catalog for Flagship Granthas

### 1. श्री हनुमान चालीसा (`hanuman-chalisa`)
* **Tradition**: Theme 1 (Rama & Vaishnava Bhakti)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Lord Hanuman in divine seated meditation posture (Dhyana mudra) on a sacred golden pedestal inside an ancient stone temple sanctum (Garbhagriha). Powerful, divine, compassionate golden complexion, wearing a resplendent jewel-encrusted golden crown (Kirita-Mukuta), pearls and fragrant red rose garland (Vanamala), sacred white sacred thread (Yajnopavita), and glowing saffron-golden Pitambara silk dhoti. An ornate golden mace (Gada) rests gracefully beside him. His right hand is raised in reassuring blessing (Abhaya Mudra) while his left hand rests gently on his knee. Radiant golden aura (Prabhamandala) glowing behind his head. Background features warm flickering ghee oil lamps (Deepak) casting soft amber chiaroscuro light across ancient carved stone temple pillars, with scattered fresh pink lotus and marigold flower petals. Rich color palette: Sacred Saffron (#E67E22), Pitambara Gold (#D4AF37), Warm Sindoor Orange (#D35400), and Temple Stone Amber. Masterwork devotional fine art in the authentic Gita Press and Raja Ravi Varma heritage oil painting tradition, richly textured canvas brushwork, divine serenity, spiritual gravitas. Strict vertical 3:4 portrait aspect ratio, zero text, no words, no letters, no Devanagari, no English writing, no outer borders, no modern CGI, pure sacred painting.
  ```

---

### 2. शिव ताण्डव स्तोत्रम् (`shiva-tandava-stotram`)
* **Tradition**: Theme 2 (Shiva & Rudra Stotras)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting depicting Lord Shiva performing the cosmic Ananda Tandava dance of divine creation and dissolution atop the snow-covered sacred peaks of Mount Kailash. Majestic, serene, cosmic form with radiant camphor-white complexion (Karpoora Gaura) and deep spiritual calm amid dynamic cosmic motion. His flying matted locks (Jata) billow outwards, cradling the crescent moon (Chandra) and the sacred cascading waters of River Ganga illuminated like liquid silver light. Around his neck coils the serpent Vasuki, with a delicate blue throat (Nilakantha) glowing softly. In his upper right hand he holds the cosmic drum (Damru) pulsating with the primordial rhythm of creation (Nada-Brahma), while his upper left hand holds the blazing divine Trishula. Glowing third eye on his forehead marked with three horizontal lines of sacred white ash (Tripundra). Wears a tiger skin (Vyaghra-Charma) and sacred Rudraksha beads. Midnight Himalayan sky behind with swirling starlight, nebulas, and moonlit snow ridges. Color palette: Kailash Azure and Lapis Lazuli (#0D1B2A, #1B263B), Camphor White (#F7F9FB), Sacred Bhasma Ash Grey (#8D99AE), Nilakantha Blue (#0F4C81), and Burnished Brass Gold. Masterwork devotional fine art in classical Gita Press and Raja Ravi Varma heritage oil tradition, deep chiaroscuro, cosmic sublimity. Strict 3:4 vertical portrait orientation, zero text, no letters, no Devanagari, no English, no outer frames or artificial borders, pure sacred painting.
  ```

---

### 3. श्री दुर्गा चालीसा (`durga-chalisa`)
* **Tradition**: Theme 3 (Devi & Shakta Parayan)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Maa Durga (Sherawali) in majestic eight-armed divine form, seated gracefully upon a powerful, noble golden lion (Simharudha) amidst blooming sacred pink Nelumbo lotuses. Her countenance radiates supreme maternal grace, compassion, and indomitable courage. Her divine complexion glows like molten gold (Tapta-Kanchana). She wears a radiant jewel-studded golden crown (Kirita-Mukuta), ornate pearl necklaces, and a luxurious heavy silk Kanjeevaram crimson-red saree embroidered with intricate gold zari borders. In her eight sacred hands she holds divine ayudhas: the golden Trishula (trident), glowing Sudarshana Chakra, Conch (Shankha), bow and arrow, Khadga sword, lotus flower, and her primary right hand is raised in supreme fear-dispelling Abhaya Mudra. Behind her head shines a magnificent radiating golden sunburst halo (Prabhamandala). Ethereal red hibiscus and jasmine flower petals float through the atmosphere. Background features a sacred temple sanctum with glowing bronze ghee lamps (Aarti Deepaks) casting warm divine amber light. Dominant color palette: Deep Sindoor Crimson (#941919), Kumkum Maroon (#660F10), Radiant Temple Gold (#E5A93C), and Soft Lotus Pink (#E06D8C). Masterwork devotional fine art in the authentic Gita Press and Raja Ravi Varma heritage oil painting tradition, rich oil glazes, magnificent spiritual presence. Strict vertical 3:4 portrait aspect ratio, zero text, no words, no letters, no Devanagari, no English script, no artificial frames or border strips, pure sacred painting.
  ```

---

### 4. चाणक्य नीति (`chanakya-niti`)
* **Tradition**: Theme 5 (Niti & Darshan Wisdom)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian historical fine art oil painting of Acharya Chanakya (Kautilya) in his study chamber at the ancient university of Takshashila. The venerable master of statecraft is seated in dignified contemplation upon a carved teakwood chauki platform. Sharp intellect, intense penetrating gaze, shaved head with a traditional Brahmin sikha (tuft), clad in simple elegant natural ecru khadi angavastra and uttariya scarf, wearing rudraksha beads and sacred thread (Yajnopavita). In his hand he holds an ancient iron stylus (Shalaka) inscribing timeless Sanskrit aphorisms onto palm-leaf manuscripts (Talapatra / Bhojapatra) bound with sacred red Mauli threads. A heavy antique burnished brass oil lamp (Deepak) with warm golden ghee flame sits on a low wooden table, casting rich chiaroscuro amber light across the scholar's workspace, stone Takshashila pillars, carved bookshelves with rolled Sanskrit scrolls, and an antique clay inkpot. Color palette: Antique Teakwood Brown (#3D2612), Warm Aged Parchment (#EFE3C3), Burnished Brass Gold (#B8860B), Lampblack Ink (#1A1A1A), and Takshashila Sandstone Ochre (#C2A675). Masterwork historical and philosophical fine art in classical academic oil painting tradition, warm atmospheric golden glow, profound wisdom and gravitas. Strict 3:4 vertical portrait ratio, zero text, no modern typography, no digital borders or banners, pure sacred historical painting.
  ```

---

### 5. ईशावास्योपनिषद् (`isha-upanishad`)
* **Tradition**: Theme 4 (Upanishads & Vedas - Jnana Kanda)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting representing the sublime Vedic wisdom of the Isha Upanishad (Ishavasya Upanishad). In a serene Vedic Tapovan hermitage at dawn, a venerable ancient Vedic Rishi with a long silver beard, radiant countenance, and luminous eyes sits in Padmasana upon a sacred deer skin beneath the shade of an ancient sprawling Banyan tree near the misty banks of a sacred river. Before the sage, a sacred carved stone Havan Kunda burns with pure golden sacrificial Agnihotra fire, fragrant curls of holy smoke rising gracefully into the morning sky. Two youthful disciples with folded hands (Anjali Mudra) listen in deep reverence. The entire atmosphere is suffused with an ethereal, omnipresent golden divine light (Hiranyagarbha Prabha) breaking through the morning mist, visually personifying the immortal verse 'Ishavasyam Idam Sarvam' (The Divine pervades all existence). Sacred birch-bark manuscripts (Bhojapatra) and a simple terracotta Kamandalu rest beside the sage. Color palette: Sacred Havana Amber (#D97706), Sandalwood Ivory (#F5EBE0), Vedic Terracotta (#A0522D), Dawn Solar Gold (#FBBF24), and Tapovan Forest Ochre (#7A6136). Masterwork classical fine art in authentic Gita Press and Raja Ravi Varma heritage oil painting tradition, serene transcendental stillness, sacred Upanishadic gravitas. Strict 3:4 vertical portrait ratio, zero text, no English, no Devanagari, no artificial borders or banners, pure sacred painting.
  ```

---

### 6. श्रीमद्भगवद्गीता (`bhagavad-gita` & `bhagavad-gita-ch1`)
* **Tradition**: Theme 1 (Vaishnava Bhakti / Gitopadesh)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Gitopadesh on the holy battlefield of Kurukshetra, viewed from a coherent three-quarter perspective. A magnificent golden Vedic war chariot (Ratha) with a tall ornate golden canopy and fluttering flag bearing the emblem of Lord Hanuman (Kapi-dhvaja). Four magnificent divine white war stallions are harnessed side-by-side in perfect unison and parallel alignment, all four facing forward in the same unified direction toward the battlefield, their muscular forms, golden harnesses, and noble heads aligned cohesively. Standing on the chariot platform as the divine charioteer (Partha-sarathi) is Lord Sri Krishna, with radiant dark-cloud complexion (Megha-Shyam), wearing an ornate peacock-feather (Mayura-Pankha) golden crown and glowing yellow Pitambara silk dhoti; he holds the unified reins of the four horses with his left hand while raising his right hand in sacred Chin Mudra, turning with deep divine compassion to instruct Arjuna. Kneeling reverently behind Krishna on the chariot floor is warrior prince Arjuna in golden armor and helmet, with folded hands in Anjali Mudra, his celestial bow Gandiva resting beside him. In the background, the vast Kurukshetra battlefield unfolds between the armies, with celestial golden dawn rays breaking through morning mist and dramatic clouds. Color palette: Divine Pitambara Gold (#D4AF37), Lapis Cloud Blue (#1B263B), Sacred Vermilion (#D35400), Stallion White (#FFFFFF), and Bronze Ochre (#8C6239). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, perfect anatomical and structural coherence, profound spiritual gravitas. Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no misaligned horse bodies, no horses facing backwards, no artificial frames or borders, pure sacred painting.
  ```

---

### 7. श्री रामरक्षा स्तोत्रम् (`ram-raksha-stotram`)
* **Tradition**: Theme 1 (Rama & Vaishnava Bhakti)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Maryada Purushottam Lord Sri Rama in divine standing posture (Prasanna Mudra) inside a majestic Ayodhya royal pavilion. Golden crown (Kirita-Mukuta), serene lotus eyes (Rajeeva Lochana), dark cerulean blue complexion (Neelambuja Shyamala). His left hand holds the legendary Kodanda bow resting gracefully on the ground, while his right hand holds a golden arrow (Bana). A quiver of sacred arrows strapped to his back. Wearing radiant golden Pitambara silk and a fragrant garland of Tulsi and white Parijata flowers. Behind his head radiates a brilliant solar aura (Surya Prabha). Warm amber lighting with carved sandstone pillars and delicate marigold garlands. Color palette: Sarayu Blue (#1C3F60), Sacred Pitambara Gold (#D4AF37), Tulsi Emerald (#1B4D3E), and Royal Crimson (#8B0000). Masterwork Gita Press classical oil style, royal serenity and divine protection. Strict 3:4 vertical portrait orientation, zero text, no borders.
  ```

---

### 8. सुन्दरकाण्ड (`sundarkand`)
* **Tradition**: Theme 1 (Rama & Vaishnava Bhakti)
* **Master Prompt**:
  ```text
  Dramatic classical Indian devotional oil painting of Lord Hanuman in colossal yet devotional form leaping across the ocean towards Lanka. Muscular golden-furred body glowing with the radiance of a thousand suns, flowing red silk uttariya scarf trailing dramatically behind him in the wind. Fearless, resolute, and compassionate expression with eyes fixed on the distant shore. Beneath him surge the dark sapphire waves of the ocean reflecting golden moonlight and dawn embers, with sea creatures and flying celestial beings showering white Parijata blossoms from the clouds above. Radiant golden morning sun rising on the horizon. Color palette: Saffron Gold (#E67E22), Ocean Sapphire (#0F2B48), Dawn Crimson (#C0392B), and Glowing Gold (#F1C40F). Masterwork devotional fine art in classical Gita Press heritage tradition, epic heroism and divine devotion (Veera and Bhakti Rasa). Strict 3:4 vertical portrait format, zero text, no letters, no borders.
  ```

---

### 9. श्री रुद्राष्टकम् (`rudrashtak`)
* **Tradition**: Theme 2 (Shiva & Rudra Stotras)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Lord Shiva as Vishwanatha in deep meditative trance (Dhyanastha) atop a granite rock on the banks of holy river Ganga in Kashi. Luminous camphor-white complexion (Karpoora Gaura), serene closed eyes, crescent moon adorning his high matted dreadlocks (Jata-Mukuta). River Ganga cascades gently from his locks into the misty river below. Coiled around his blue neck (Nilakantha) is the serpent Vasuki. Forehead adorned with sacred white Vibhuti tripundra mark and glowing third eye. A divine Trishula stands beside him tied with a small Damru. Flickering brass lamps and floating earthen deepaks in the dark river create golden reflections. Color palette: Deep Ganga Midnight (#0B192C), Camphor White (#F7F9FB), Sacred Ash (#8D99AE), and Flickering Deepak Gold (#FFB703). Masterwork classical Gita Press fine art oil tradition, profound meditative peace (Shanta Rasa). Strict 3:4 vertical portrait, zero text, no frames.
  ```

---

### 10. श्री सूक्तम् (`sri-suktam`)
* **Tradition**: Theme 3 (Devi & Shakta / Lakshmi)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Goddess Mahalakshmi seated upon an enormous blooming pink Nelumbo lotus (Kamalavasini) in the middle of a golden celestial lake (Kshirasagara). Radiant molten-golden complexion (Hiranya-Varna), gentle compassionate maternal smile, wearing a glittering gold-embroidered crimson silk saree and opulent Vedic gold jewelry with emeralds and pearls. In her four hands she holds two fragrant pink lotuses, while her right lower hand displays the fear-dispelling Abhaya Mudra and her left lower hand shows Varada Mudra showering a gentle stream of golden coins. Flanked on either side by two majestic white royal elephants (Gajaraja) gently bathing her with sacred water from golden urns. Golden dawn sky filled with celestial light and floating fragrant flowers. Dominant color palette: Hiranya Gold (#E5A93C), Deep Crimson (#941919), Lotus Pink (#E06D8C), and Ivory White (#F8F9FA). Masterwork classical Tanjore and Raja Ravi Varma fine art oil tradition, supreme prosperity and auspiciousness. Strict 3:4 vertical portrait ratio, zero text, no borders.
  ```

---

### 11. बजरंग बाण (`bajrang-baan`)
* **Tradition**: Theme 1 (Rama & Vaishnava Bhakti)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Lord Hanuman in his invincible, heroic protective form (Veera Hanuman) as invoked in the sacred Bajrang Baan. Resolute, fearless, yet deeply compassionate divine countenance, standing firmly in a heroic protective stance (Veerasana) upon an ancient carved temple plinth. Powerful muscular golden form glowing with the radiance of a million suns, wearing an ornate jewel-studded golden crown (Kirita-Mukuta), pearls and red rose garland (Vanamala), sacred white Yajnopavita, and glowing saffron-golden Pitambara silk dhoti with a flowing red silk uttariya scarf. In his raised right hand he wields the heavy golden thunderbolt mace (Vajra-Gada) crackling with divine golden protective light, while his left hand holds the luminous Dronagiri mountain with glowing Sanjeevani herbs. Brilliant radiating golden solar aura (Prabhamandala) glowing behind his head, dispelling all shadows and malevolent forces. Background features ancient stone temple pillars with warm flickering bronze ghee lamps casting amber chiaroscuro light, with scattered marigold and pink lotus petals. Color palette: Sacred Saffron (#E67E22), Pitambara Gold (#D4AF37), Warm Sindoor Orange (#D35400), and Temple Stone Amber (#A06535). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, heroic spiritual majesty (Veera and Bhakti Rasa), rich oil glazes. Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 12. आदित्यहृदय स्तोत्रम् (`aditya-hridaya-stotram`)
* **Tradition**: Theme 1 / Vedic Solar (Vaishnava)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Lord Surya Bhagavan (the Sun God as revealed in the sacred Aditya Hridaya Stotram). Resplendent solar deity with glowing golden complexion, wearing an opulent jewel-encrusted solar crown (Surya Mukuta), earrings, and radiant vermilion-and-gold silk robes. In his two hands he gracefully holds two blooming red lotuses (Rakta Padma). Behind him blazes an immense, brilliant cosmic sunburst halo (Surya Prabhamandala) filling the dawn sky with celestial golden light. He rides across the celestial heavens upon a majestic golden chariot (Saptashva Ratha) driven by the red-hued charioteer Aruna, drawn across dawn clouds by seven magnificent divine white horses with golden harnesses leaping in graceful unison across the horizon. Below on the misty earth near the sacred ocean, venerable Sage Agastya stands instructing warrior Lord Sri Rama who listens reverently with folded hands in Anjali Mudra. Color palette: Blazing Solar Gold (#F59E0B), Deep Vermilion (#B91C1C), Sacred Saffron (#EA580C), Stallion White (#FFFFFF), and Dawn Sapphire Blue (#1E3A8A). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, sublime solar brilliance, cosmic grandeur and spiritual protection. Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 13. महिषासुरमर्दिनी स्तोत्रम् (`mahishasura-mardini-stotram`)
* **Tradition**: Theme 3 (Devi & Shakta Parayan)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Goddess Durga as Mahishasura Mardini (the Slayer of Mahishasura as celebrated in the sacred Mahishasura Mardini Stotram). Magnificent eighteen-armed divine form radiating supreme maternal power, courage, and transcendental serenity amidst dynamic cosmic battle. Divine complexion glowing like molten gold (Tapta-Kanchana), wearing an ornate jewel-studded golden crown (Kirita-Mukuta), pearl necklaces, and a billowing crimson-red silk saree with intricate gold zari embroidery. She rides her powerful, roaring golden lion (Simha) which fiercely attacks the demon buffalo. With her primary hands she forcefully thrusts the blazing golden Trishula (trident) into the chest of the defeated demon Mahishasura emerging from the buffalo. In her multiple divine hands she holds celestial weapons: the glowing Sudarshana Chakra, Conch (Shankha), sharp Khadga sword, golden bow and arrow, polished shield, and mace. A brilliant radiating sunburst halo (Prabhamandala) illuminates the battlefield. Background of dramatic storm clouds, lightning strikes, celestial flowers showered by devas, and distant mountain peaks. Color palette: Deep Sindoor Crimson (#941919), Kumkum Maroon (#660F10), Radiant Temple Gold (#E5A93C), Polished Steel (#CAD2C5), and Storm Midnight Navy (#181D26). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, epic spiritual heroism (Veera and Raudra-Shanta Rasa), rich oil glazes. Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 14. कालभैरवाष्टकम् (`kala-bhairava-ashtakam`)
* **Tradition**: Theme 2 (Shiva & Rudra Stotras)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Lord Kala Bhairava (the divine guardian of Kashi as revered in the sacred Kala Bhairava Ashtakam). Powerful, majestic cosmic form with radiant dark sapphire-blue complexion, sharp compassionate yet awe-inspiring gaze, third eye glowing upon his forehead, with a delicate crescent moon adorning his fiery matted locks. He is adorned with sacred Rudraksha beads, coiled serpent ornaments, and a sacred garland of skulls (Mundamala). In his four divine hands he wields the sacred golden Trishula (trident), a cosmic Damru drum, a sharp gleaming sword (Khadga), and a golden Kapala vessel. Standing loyally beside him is his noble, powerful black dog vahana (Shvana) wearing a delicate golden collar. Setting: the ancient stone ghats of Varanasi (Kashi) at midnight twilight, with sacred river Ganga reflecting the silver light of the full moon and distant temple oil deepak lamps casting mystical golden-amber chiaroscuro reflections across ancient stone temple pillars. Color palette: Midnight Lapis Azure (#0A1128), Sacred Bhasma Ash (#8D99AE), Burnished Temple Brass Gold (#D4AF37), Mystical Crimson (#990000), and Charcoal Night (#1C1C1C). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, awe-inspiring spiritual sovereignty (Raudra, Bhairava and Shanta Rasa), rich oil glazes. Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 15. श्रीविष्णुसहस्रनाम स्तोत्रम् (`vishnu-sahasranama`)
* **Tradition**: Theme 1 (Vaishnava Bhakti)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting of Supreme Lord Maha Vishnu in his transcendental cosmic form of Sheshashayi Vishnu (Anantashayana) resting in Vaikuntha upon the celestial milky ocean (Kshirasagara). The Supreme Lord reclines in divine yogic slumber upon the coils of the thousand-headed golden serpent king Ananta Shesha, whose glowing jewel-crested hoods fan out overhead like a majestic divine canopy. Dark radiant monsoon-cloud complexion (Neelamegha Shyamala), wearing an opulent jewel-encrusted golden crown (Kirita-Mukuta), shimmering yellow Pitambara silk robes, sacred pearl necklaces, the glowing Kaustubha gem upon his chest, and a fragrant forest garland (Vanamala). In his four divine hands he holds the luminous Sudarshana Chakra, sacred white Conch (Panchajanya Shankha), golden mace (Kaumodaki Gada), and a blooming pink lotus (Padma). Goddess Mahalakshmi sits gracefully at his lotus feet, massaging them in deep reverence. From his navel rises a sacred lotus upon which Lord Brahma sits in deep meditation. Celestial golden light, floating lotuses on the milky waves, and devas showering Parijata flowers from the heavens. Color palette: Milky Ocean Azure (#153243), Divine Pitambara Gold (#D4AF37), Sacred Lotus Pink (#E06D8C), Lapis Navy (#0F4C81), and Celestial White (#F8F9FA). Masterwork devotional fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, supreme transcendental peace and cosmic majesty (Shanta and Bhakti Rasa). Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 16. विदुर नीति (`vidura-niti`)
* **Tradition**: Theme 5 (Niti & Darshan Wisdom)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian historical and philosophical oil painting depicting Mahatma Vidura imparting righteous moral wisdom and statecraft (Vidura Niti from the Mahabharata). In a regal Hastinapur palace council chamber at midnight, the venerable and wise Mahatma Vidura sits in a dignified counseling posture upon a carved teakwood chauki platform. Wise penetrating eyes, serene countenance, adorned in natural ecru silk khadi angavastra, sacred rudraksha beads, and white sacred thread (Yajnopavita), with his right hand raised in gentle didactic gesture (Vyakhyana Mudra) counseling the troubled blind King Dhritarashtra who sits listening in sorrowful contemplation upon the ornate royal throne. In the foreground sits a low wooden table with ancient rolled palm-leaf manuscripts (Talapatra) and a heavy antique burnished brass oil lamp (Deepak) with warm flickering golden flame casting rich chiaroscuro amber light across the stone pillars and royal tapestries. Color palette: Antique Teakwood Brown (#3D2612), Warm Aged Parchment (#EFE3C3), Burnished Brass Gold (#B8860B), Royal Maroon (#581845), and Sandstone Ochre (#C2A675). Masterwork historical fine art in authentic Gita Press and Raja Ravi Varma academic oil painting heritage, profound philosophical gravitas and moral sovereignty (Shanta and Niti Rasa). Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

### 17. कठोपनिषद् (`katha-upanishad`)
* **Tradition**: Theme 4 (Upanishads & Vedas - Jnana Kanda)
* **Master Prompt**:
  ```text
  Museum-grade classical Indian devotional oil painting depicting the profound Upanishadic dialogue of the Katha Upanishad between youthful seeker Nachiketa and Lord Yama (Dharmaraja). In an ancient, majestic Vedic realm of truth and cosmic law, the noble and awe-inspiring Lord Yama sits upon an ornate carved stone throne, holding his sacred staff of cosmic justice (Danda); his countenance is venerable, majestic, and full of deep reverence for the boy's uncompromising spiritual wisdom. Standing before him in fearless devotion with folded hands (Anjali Mudra) is the youthful, radiant brahmachari Nachiketa, dressed in simple saffron bark-cloth and sacred thread, asking for the supreme secret of the immortal Self (Atman) that transcends death. Between them burns the sacred sacrificial Nachiketa Fire (Agnihotra Kunda) with fragrant golden flames, illuminating the ancient stone hall and birch-bark manuscripts with rich amber chiaroscuro light. Ethereal golden divine radiance permeates the atmosphere, symbolizing transcendental Self-realization (Atma-Vidya). Color palette: Sacred Havana Amber (#D97706), Sandalwood Ivory (#F5EBE0), Vedic Terracotta (#A0522D), Deep Bronze (#4A3728), and Solar Gold (#FBBF24). Masterwork philosophical fine art in authentic Gita Press and Raja Ravi Varma oil painting heritage, profound transcendental stillness, spiritual wisdom (Shanta and Jnana Rasa). Strict 3:4 vertical portrait ratio, zero text, no words, no letters, no Devanagari, no English writing, no artificial frames or borders, pure sacred painting.
  ```

---

## 🛠️ 5. Image Conversion & Deployment Pipeline

Once an image is generated via `generate_image`, run the following Node.js processing pipeline to produce both Retina-ready WebP and JPEG fallbacks at uniform 3:4 proportions:

```javascript
import sharp from 'sharp';
import path from 'path';

async function optimizeCover(inputPath, slug) {
  const destDir = path.resolve('public/covers');
  
  // 1. WebP (768 × 1024 px, Quality 88, effort 6)
  await sharp(inputPath)
    .resize(768, 1024, { fit: 'cover', position: 'center' })
    .webp({ quality: 88, effort: 6 })
    .toFile(path.join(destDir, `${slug}.webp`));

  // 2. JPEG Fallback (768 × 1024 px, Quality 88, mozjpeg)
  await sharp(inputPath)
    .resize(768, 1024, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(path.join(destDir, `${slug}.jpg`));
    
  console.log(`✓ Processed cover for: ${slug}`);
}
```
