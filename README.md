# ज्ञानकोश (Gyankosh) — सनातन धर्मग्रंथ ई-रीडर एवं डिजिटल पुस्तकालय

> **ज्ञानकोश (Gyankosh)** सनातन वैदिक एवं पौराणिक धर्मग्रंथों का एक प्रामाणिक, भव्य एवं आधुनिक डिजिटल ई-रीडर पुस्तकालय है। यह पारम्परिक सनातन मुद्रण शैली, सजीव ३डी पन्ना-पलट (3D Paper Flip) एवं १००% देवनागरी/हिन्दी इंटरफेस के साथ निर्मित है।
> 
> 🌐 **लाइव वेबसाइट**: [https://www.ashishvishwakarma.com/gyankosh/](https://www.ashishvishwakarma.com/gyankosh/)

---

## 🌟 प्रमुख विशेषताएं (Features)

* 📖 **पारम्परिक पौथी पुस्तक अनुभव**: उष्ण कागज़ (Warm paper texture), लाल-स्वर्ण बॉर्डर, रनिंग हेडर (`॥ ग्रंथ शीर्षक ॥`), देवनागरी अंक एवं पारम्परिक श्लोक/भावार्थ प्रारूप।
* 📜 **सजीव ३डी पन्ना मोड़ एवं पलट (3D Paper Curl & Flip)**:
  * माउस व्हील, स्क्रॉल या टच ड्रैग करते ही पन्ना वास्तविक कागज़ की भांति मुड़ता है (Real-time live paper curl)।
  * पन्ना छोड़ने या थ्रेशोल्ड पार करने पर स्वाभाविक ३डी पन्ना-पलट (Vertical Pothi/Folio turn)।
  * निचले कोनों में वास्तविक कागज़ का तरंग व मोड़ प्रभाव (Paper corner wave & lift depth)।
* 🖼️ **पावन आरम्भ आवरण (Aarambh Cover Screen)**: प्रत्येक ग्रंथ के लिए समर्पित चित्रकला आवरण एवं "📖 आरम्भ करें" बटन, जो स्पर्श करते ही ग्रंथ को उद्घाटित करता है।
* 📱 **मोबाइल एवं नॉच अनुकूलन**:
  * छोटे स्क्रीन्स (Mobile phones) पर ग्रंथ स्पर्श करते ही स्वतः फुलस्क्रीन सक्रिय।
  * फोन के नॉच व कैमरे से बचाव हेतु शीर्ष पट्टी का सुरक्षित लेआउट।
* 🧭 **सरल पठन नियंत्रण**:
  * **⟲ प्रारम्भ से पढ़ें** (Reset to beginning)
  * **▲ पिछला पृष्ठ** &bull; **`१ / ५`** &bull; **▼ अगला पृष्ठ**
  * **`अ⁻` / `अ⁺`** अक्षर आकार (Font size) छोटा/बड़ा करने के विकल्प।
* 🔄 **सत्र समाप्ति पर स्वतः रीसेट**: ग्रंथ पूर्ण पढ़ने के उपरांत अगले सत्र में पुनः प्रथम पृष्ठ से प्रारम्भ।
* 🕉️ **१००% हिन्दी/संस्कृत स्थानीयकरण**: मुख्य सूची, श्रेणियां, ग्रंथ कार्ड, प्रोग्रेस बैज (`% पठित`) एवं मेटाडेटा पूर्णतः हिन्दी में।

---

## 📂 श्रेणियां एवं टैग्स प्रबंधन (Categories & Tags)

### १. श्रेणियों का प्रबंधन (Maintaining Categories)

1. **मास्टर सूची (Master Schema)**:
   [`src/content.config.ts`](src/content.config.ts) में `CATEGORIES` ऐरे में नई श्रेणी जोड़ें:
   ```typescript
   export const CATEGORIES = ['Veda', 'Purana', 'Chalisa', 'Stotra', 'Gita', 'Other'] as const;
   ```

2. **हिन्दी नाम, आइकन एवं विवरण (Hindi Metadata)**:
   निम्नलिखित ३ फाइलों में `categoryMeta` ऑब्जेक्ट में श्रेणी का विवरण दर्ज करें:
   * [`src/pages/index.astro`](src/pages/index.astro) (मुख्य सूची पृष्ठ)
   * [`src/pages/category/[category].astro`](src/pages/category/[category].astro) (श्रेणी संग्रह पृष्ठ)
   * [`src/components/BookCard.astro`](src/components/BookCard.astro) (ग्रंथ कार्ड)

   ```typescript
   const categoryMeta: Record<string, { icon: string; nameHindi: string; description: string }> = {
     Veda:    { icon: '🔥', nameHindi: 'वेद', description: 'सनातन वैदिक ऋचाएं एवं मन्त्र' },
     Gita:    { icon: '🎵', nameHindi: 'श्रीमद्भगवद्गीता', description: 'भगवान श्रीकृष्ण का दिव्य उपदेश' },
     Chalisa: { icon: '🪔', nameHindi: 'चालीसा', description: 'चालीस पदों वाले पावन स्तोत्र' },
     Purana:  { icon: '📖', nameHindi: 'पुराण', description: 'अठारह महापुराण एवं उपपुराण' },
     Stotra:  { icon: '🌸', nameHindi: 'स्तोत्र', description: 'देवी-देवताओं की पावन स्तुतियां' },
     Other:   { icon: '📜', nameHindi: 'अन्य धर्मग्रंथ', description: 'विशिष्ट धार्मिक एवं दार्शनिक ग्रन्थ' },
   };
   ```

---

### २. टैग्स जोड़ना (Adding Tags)

प्रत्येक ग्रंथ की मार्कडाउन फाइल में `tags` ऐरे द्वारा इच्छानुसार टैग्स जोड़े जा सकते हैं:

```yaml
---
title: "श्रीमद्भगवद्गीता — अध्याय १"
author: "वेदव्यास"
description: "श्रीमद्भगवद्गीता प्रथम अध्याय — अर्जुनविषादयोग।"
category: "Gita"
tags: ["श्रीकृष्ण", "अर्जुन", "महाभारत", "कुरुक्षेत्र", "विषादयोग"]
coverImage: "/covers/bhagavad-gita-ch1.jpg"
showNumbering: true
---
```

---

## ✍️ नया ग्रंथ कैसे जोड़ें (How to Add a New Text)

`src/content/library/` फोल्डर में नई `.md` फाइल बनाएं (उदा. `hanuman-chalisa.md`):

### फ्रंटमैटर (Frontmatter Configuration)

| फ़ील्ड | प्रकार | विवरण | उदाहरण |
| :--- | :--- | :--- | :--- |
| `title` | `string` (अनिवार्य) | ग्रंथ का शीर्षक | `"श्री हनुमान चालीसा"` |
| `author` | `string` (वैकल्पिक) | रचयिता / ऋषि | `"गोस्वामी तुलसीदास"` |
| `description` | `string` (अनिवार्य) | संक्षिप्त परिचय (SEO एवं कार्ड हेतु) | `"महाबली श्री हनुमान जी की पावन स्तुति"` |
| `category` | `enum` (अनिवार्य) | श्रेणी (`Veda`, `Gita`, `Chalisa`, आदि) | `"Chalisa"` |
| `tags` | `string[]` (वैकल्पिक) | विषय/सम्बन्धित टैग्स | `["हनुमान", "भक्ति", "चालीसा"]` |
| `coverImage` | `string` (वैकल्पिक) | आवरण चित्र का पाथ (public फोल्डर में) | `"/covers/hanuman-chalisa.jpg"` |
| `showNumbering` | `boolean` (वैकल्पिक) | श्लोक क्रमांक (`॥ १ ॥`) दिखाना या छिपाना | `false` (डिफ़ॉल्ट: `true`) |
| `language` | `string` (वैकल्पिक) | भाषा | `"Sanskrit"` / `"Awadhi"` / `"Hindi"` |
| `weight` | `number` (वैकल्पिक) | लोकप्रियता एवं वरीयता क्रम (डिफ़ॉल्ट: `1000`, 10, 20, 30 के क्रम में, न्यूनतम अंक = शीर्ष प्राथमिकता) | `10` |
| `context` | `string` (वैकल्पिक) | ऐतिहासिक एवं आध्यात्मिक पृष्ठभूमि (कवर स्क्रीन पर ज्ञान-परिचय) | `"गोस्वामी तुलसीदास जी द्वारा काशी में रचित..."` |

---

### पाठ्य संरचना टैग्स (Indic Markdown Tags)

मार्कडाउन फाइल में निम्नलिखित टैग्स का उपयोग करके पारम्परिक प्रारूप तैयार करें:

```markdown
[Instruction]
अथ श्री हनुमान चालीसा

[Speaker]
श्रीभगवानुवाच

[Shloka]
धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।
मामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय॥

[Translation]
धृतराष्ट्र बोले — हे सञ्जय! धर्मभूमि कुरुक्षेत्र में एकत्र हुए मेरे और पाण्डु के पुत्रों ने क्या किया?

[Bhavarth]
श्री गुरु के चरण-कमलों की धूलि से अपने मन रूपी दर्पण को पवित्र करके...
```

* **`[Instruction]` / `[Viniyoga]`**: अध्याय शीर्षक, विनियोग अथवा ध्यान मन्त्र।
* **`[Speaker]` / `[Uvacha]`**: पावन वक्ता टैग (उदा. `॥ धृतराष्ट्र उवाच ॥`)।
* **`[Shloka]` / `[Mantra]` / `[Chaupai]` / `[Doha]`**: मूल श्लोक (स्वतः क्रमांकित `॥ १ ॥`)।
* **`[Translation]` / `[Bhavarth]`**: प्रामाणिक हिन्दी अर्थ एवं भावार्थ।

---

## 🛠️ तकनीकी संरचना (Tech Stack)

* **Framework**: [Astro v5 (Static Site Generation)](https://astro.build/)
* **Styling**: Vanilla CSS (Tailored Sacred Indic Design System, Custom 3D CSS Keyframes & Perspective)
* **Fonts**: Google Fonts (Noto Serif Devanagari, Yatra One, Rozha One, Eczar, Gotu)
* **Zero Client Runtime Bloat**: बिल्ड-टाइम मार्कडाउन पार्सिंग एवं स्टैटिक HTML जेनरेशन।

---

## 🧞 कमांड्स (Commands)

प्रोजेक्ट रूट से टर्मिनल में चलाएं:

| कमांड | कार्य |
| :--- | :--- |
| `npm install` | सभी डिपेंडेंसीज इंस्टॉल करें |
| `npm run dev` | लोकल डेवलपमेंट सर्वर आरम्भ करें (`http://localhost:4321`) |
| `npm run build` | प्रोडक्शन स्टैटिक बिल्ड तैयार करें (`./dist/`) |
| `npm run preview` | प्रोडक्शन बिल्ड का लोकल पूर्वावलोकन करें |
