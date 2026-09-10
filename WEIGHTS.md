# Gyankosh Sacred Texts Weight Registry

> **Single Source of Truth**: [`src/data/weights.json`](file:///a:/GitHub/Gyankosh/src/data/weights.json)  
> Lower weight = higher priority (displayed first in library and category views).  
> To assign or adjust weights, update `src/data/weights.json` directly. No changes to Markdown files needed!

---

## ⚡ Quick Reference

| Metric | Value |
| :--- | :--- |
| **Source of Truth** | [`src/data/weights.json`](file:///a:/GitHub/Gyankosh/src/data/weights.json) |
| **Total Sacred Texts** | `74` |
| **Highest Weight Allocated** | `740` |
| **Next Recommended Weight** | **`750`** (increment by 10) |
| **Default Fallback Weight** | `1000` |

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
| **10** | Chalisa | हनुमान चालीसा | `hanuman-chalisa` |
| **20** | Purana | श्री सुन्दरकाण्ड | `sundarkand` |
| **30** | Stotra | शिव ताण्डव स्तोत्रम् | `shiva-tandava-stotram` |
| **40** | Aarti | आरती ॐ जय जगदीश हरे | `aarti-jai-jagdish-hare` |
| **50** | Stotra | बजरंग बाण | `bajrang-baan` |
| **60** | Stotra | संकटमोचन हनुमानाष्टक | `sankat-mochan-hanuman-ashtak` |
| **70** | Chalisa | शिव चालीसा | `shiva-chalisa` |
| **80** | Chalisa | दुर्गा चालीसा | `durga-chalisa` |
| **90** | Stotra | आदित्यहृदय स्तोत्रम् | `aditya-hridaya-stotram` |
| **100** | Stotra | श्रीविष्णुसहस्रनाम स्तोत्रम् | `vishnu-sahasranama` |
| **110** | Aarti | आरती जय गणेश देवा | `aarti-ganesh-ji` |
| **120** | Chalisa | गणेश चालीसा | `ganesh-chalisa` |
| **130** | Aarti | आरती हनुमान लला की | `aarti-hanuman-ji` |
| **140** | Stotra | महिषासुरमर्दिनी स्तोत्रम् | `mahishasura-mardini-stotram` |
| **150** | Stotra | कनकधारा स्तोत्रम् | `kanakadhara-stotram` |
| **160** | Chalisa | लक्ष्मी चालीसा | `lakshmi-chalisa` |
| **170** | Stotra | श्रीरुद्राष्टकम् | `rudrashtakam` |
| **180** | Stotra | मधुराष्टकम् | `madhurashtakam` |
| **190** | Aarti | आरती जय शिव ओंकारा | `aarti-shiva-ji` |
| **200** | Aarti | आरती जय अम्बे गौरी | `aarti-durga-mata` |
| **210** | Aarti | आरती कुंजबिहारी की | `aarti-kunjbihari-ki` |
| **220** | Stotra | दुर्गा सप्तशती मुख्य स्तोत्र (कवच, अर्गला, कीलक) | `durga-saptashati-traya` |
| **230** | Stotra | कालभैरवाष्टकम् | `kala-bhairava-ashtakam` |
| **240** | Stotra | शिवमहिम्नः स्तोत्रम् | `shiva-mahimna-stotram` |
| **250** | Stotra | श्री ललिता सहस्रनाम स्तोत्रम् | `lalita-sahasranama` |
| **260** | Other | गोपी गीत | `gopi-geet` |
| **270** | Stotra | दामोदराष्टकम् | `damodarashtakam` |
| **280** | Veda | श्री सूक्तम् | `sri-suktam` |
| **290** | Veda | पुरुष सूक्तम् | `purusha-suktam` |
| **300** | Gita | श्रीमद्भगवद्गीता — अध्याय १ | `bhagavad-gita-ch1` |
| **310** | Gita | श्रीमद्भगवद्गीता — अध्याय २ | `bhagavad-gita-ch2` |
| **320** | Gita | श्रीमद्भगवद्गीता — अध्याय ३ | `bhagavad-gita-ch3` |
| **330** | Gita | श्रीमद्भगवद्गीता — अध्याय ४ | `bhagavad-gita-ch4` |
| **340** | Gita | श्रीमद्भगवद्गीता — अध्याय ५ | `bhagavad-gita-ch5` |
| **350** | Gita | श्रीमद्भगवद्गीता — अध्याय ६ | `bhagavad-gita-ch6` |
| **360** | Gita | श्रीमद्भगवद्गीता — अध्याय ७ | `bhagavad-gita-ch7` |
| **370** | Gita | श्रीमद्भगवद्गीता — अध्याय ८ | `bhagavad-gita-ch8` |
| **380** | Gita | श्रीमद्भगवद्गीता — अध्याय ९ | `bhagavad-gita-ch9` |
| **390** | Gita | श्रीमद्भगवद्गीता — अध्याय १० | `bhagavad-gita-ch10` |
| **400** | Gita | श्रीमद्भगवद्गीता — अध्याय ११ | `bhagavad-gita-ch11` |
| **410** | Gita | श्रीमद्भगवद्गीता — अध्याय १२ | `bhagavad-gita-ch12` |
| **420** | Gita | श्रीमद्भगवद्गीता — अध्याय १३ | `bhagavad-gita-ch13` |
| **430** | Gita | श्रीमद्भगवद्गीता — अध्याय १४ | `bhagavad-gita-ch14` |
| **440** | Gita | श्रीमद्भगवद्गीता — अध्याय १५ | `bhagavad-gita-ch15` |
| **450** | Gita | श्रीमद्भगवद्गीता — अध्याय १६ | `bhagavad-gita-ch16` |
| **460** | Gita | श्रीमद्भगवद्गीता — अध्याय १७ | `bhagavad-gita-ch17` |
| **470** | Gita | श्रीमद्भगवद्गीता — अध्याय १८ | `bhagavad-gita-ch18` |
| **480** | Gita | अष्टावक्र गीता | `ashtavakra-gita` |
| **490** | Upanishad | ईशावास्योपनिषद् | `isha-upanishad` |
| **500** | Upanishad | कठोपनिषद् | `katha-upanishad` |
| **510** | Upanishad | केनोपनिषद् | `kena-upanishad` |
| **520** | Upanishad | माण्डूक्योपनिषद् | `mandukya-upanishad` |
| **530** | Upanishad | मुण्डकोपनिषद् | `mundaka-upanishad` |
| **540** | Upanishad | प्रश्नोपनिषद् | `prashna-upanishad` |
| **550** | Upanishad | तैत्तिरीयोपनिषद् | `taittiriya-upanishad` |
| **560** | Other | चाणक्य नीति | `chanakya-niti` |
| **570** | Other | विदुर नीति | `vidura-niti` |
| **580** | Veda | दुर्गा सूक्तम् | `durga-suktam` |
| **590** | Veda | नारायण सूक्तम् | `narayana-suktam` |
| **600** | Veda | ऋग्वेद — मण्डल १, सूक्त १ | `rigveda-mandala1` |
| **610** | Stotra | गंगा स्तोत्रम् | `ganga-stotram` |
| **620** | Stotra | नवग्रह स्तोत्रम् | `navagraha-stotram` |
| **630** | Chalisa | शनि चालीसा | `shani-chalisa` |
| **640** | Chalisa | सरस्वती चालीसा | `saraswati-chalisa` |
| **650** | Chalisa | कृष्ण चालीसा | `krishna-chalisa` |
| **660** | Chalisa | राम चालीसा | `ram-chalisa` |
| **670** | Chalisa | गायत्री चालीसा | `gayatri-chalisa` |
| **680** | Chalisa | सूर्य चालीसा | `surya-chalisa` |
| **690** | Chalisa | भैरव चालीसा | `bhairav-chalisa` |
| **700** | Chalisa | श्री विश्वकर्मा चालीसा | `vishwakarma-chalisa` |
| **710** | Aarti | आरती श्री विश्वकर्मा जी की | `vishwakarma-aarti` |
| **720** | Veda | विश्वकर्मा सूक्तम् | `vishwakarma-suktam` |
| **730** | Stotra | श्री विश्वकर्मा स्तोत्रम् एवं अष्टकम् | `vishwakarma-stotram` |
| **740** | Purana | श्री विश्वकर्मा पुराण — माहात्म्य एवं पंचऋषि कथा | `vishwakarma-puran` |

---
*Last updated: Sep 10, 2026*
