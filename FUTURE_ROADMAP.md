# 🔮 Gyankosh Future Feature Backlog & Platform Roadmap (Web vs. App)

> **Context**: This document preserves the full inventory of advanced features conceived during the architecture transition. In the future, we will review this catalog to decide which features belong on the **Static Web Reader**, which belong in the **Mobile App**, and which should span **Both**.

---

## 🧭 Evaluation Matrix: Web vs. Mobile App

| # | Feature Concept | Web Reader Suitability | Mobile App Suitability | Proposed Home |
| :-: | :--- | :--- | :--- | :-: |
| **1** | **Sacred Highlights & Notes** | Good via `localStorage` or export | Excellent (touch-drag selection, long-press) | **Both / App-First** |
| **2** | **Nitya-Niyam (Daily Playlists)** | Useful for morning temple desktop reading | Essential (morning routine notification, lock-screen audio) | **App-First** |
| **3** | **Sankalpa & Streak Tracker** | Can use client timestamps | Best in app (push notifications, streak badges, home widget) | **App-First** |
| **4** | **Deep Verse-Level URLs** | Crucial for SEO, citations & social sharing (`/read/gita/2/47`) | Deep links opening directly into the native verse view | **Web-First (with App Deep Links)** |
| **5** | **Cross-Scripture Tagging** | Great for desktop research & comparing references | Good for contextual footnotes | **Web-First** |
| **6** | **Server Full-Text Search** | Good if index exceeds browser memory | Offline SQLite full-text search (FTS5) is instant with zero network | **App-First (Offline FTS5)** |
| **7** | **Social Quote Cards Generator** | Great for desktop export & WhatsApp sharing | Native share sheet directly to WhatsApp/Instagram Stories | **Both** |
| **8** | **Printable Pothi / A4 PDF** | Ideal on web via browser print dialog (`@media print`) | Good for offline saving | **Web-First** |
| **9** | **Daily Shloka Automation** | Web banner / Email newsletter | Lock-screen daily shloka notifications & Android home-screen widget | **App-First** |
| **10**| **Tithi / Panchang Engine** | Dynamic homepage banners based on Hindu calendar | Morning puja reminders & calendar sync | **Both** |
| **11**| **Audio Chanting & Sync** | Web audio player | Background audio playback with screen locked + Bluetooth car audio | **App-First** |
| **12**| **Japa Mala (१०८ मनके माला)** | Not natural on keyboard/mouse | Perfect with haptic vibration on each bead click | **Mobile App Only** |
| **13**| **Scholarly Commentaries & Q&A** | Best on desktop for in-depth typing & scholarly reading | Read-only mode | **Web-First** |
| **14**| **3D Pothi Page-Flip & Interactive Leaf Curl** | Stripped from Web Reader to guarantee ultra-lightweight, instant loading | GPU-accelerated 3D folio turning with finger-curl physics & haptic feedback | **Mobile App Dedicated** |

---

## 📂 Detailed Feature Specifications

### 🪷 Group 1: Devotional & Personalization Tools

#### 1.1 Sacred Highlights & Personal Reflections
* **Concept**: Readers can select any word or line and highlight it in authentic sacred hues:
  * 🟨 **केसरिया (Saffron)** — ज्ञान एवं वैराग्य
  * 🟨 **स्वर्ण (Gold)** — दिव्य उद्घोष एवं महावाक्य
  * 🟥 **रक्त वर्ण (Crimson/Maroon)** — स्तुति एवं मन्त्र
* **Implementation Note**:
  * **On Web**: Stored in `localStorage` with JSON export/import backup.
  * **On App**: Stored directly in local SQLite (`user_highlights` table).

#### 1.2 Nitya-Niyam (Daily Devotional Playlists)
* **Concept**: Devotees can build a sequential recitation path for daily practice:
  * *Morning Nitya-Path*: गणेश आरती &rarr; हनुमान चालीसा &rarr; शिव ताण्डव स्तोत्रम् &rarr; रामरक्षा स्तोत्रम्.
  * *Evening Aarti*: ॐ जय जगदीश हरे &rarr; जय अम्बे गौरी &rarr; आरती कुंजबिहारी की.
* **Implementation Note**:
  * Seamless auto-advancement from one text to the next upon completion.

#### 1.3 Sankalpa & Anushthan Streak Tracker
* **Concept**: Commitment tracker for sacred timeframes:
  * **४०-दिवसीय हनुमान चालीसा संकल्प** (40-day challenge).
  * **नवरात्रि ९-दिवसीय दुर्गा सप्तशती पारायण** (9-day Navratri Parayan).
  * **गीता स्वाध्याय** (Daily 1 Chapter).
* **Implementation Note**:
  * Best deployed in the Mobile App to leverage daily morning/evening reminder notifications and calendar streak visuals.

#### 1.4 Haptic Japa Mala Counter (Mobile App Dedicated)
* **Concept**: Virtual 108-bead Japa counter.
* **Mechanism**:
  * Tap anywhere on screen to count.
  * Subtle haptic pulse on each bead.
  * Distinct double-vibration upon completing 108 beads (१ माला पूर्ण).

---

### 🔍 Group 2: Scripture Architecture & Deep Discovery

#### 2.1 Deep Verse-Level Permanent URLs (Permalinks)
* **Concept**: Give every shloka, doha, and chaupai its own shareable canonical link:
  * `/read/bhagavad-gita-ch2#verse-47` or `/shloka/gita/2/47`
  * `/read/sundarkand#doha-15`
* **Value**:
  * Crucial for social media citations, scholarly discussions, and SEO.

#### 2.2 Relational Cross-Scripture Tagging
* **Concept**: Connect characters, places, and philosophical concepts across scriptures:
  * Example: Clicking **"चित्रकूट"** lists all verses across *Ramcharitmanas (Ayodhyakand)*, *Vinaya Patrika*, and *Kamadnath Stuti*.
  * Example: Clicking **"कर्मयोग"** highlights verses across *Bhagavad Gita*, *Vidura Niti*, and *Upanishads*.

#### 2.3 Offline Full-Text Search via SQLite FTS5 (App Dedicated)
* **Concept**: Blazing-fast instant search across all 4,394 verses with 0 network latency.
* **Mechanism**:
  * Because `database/gyankosh.db` is bundled locally inside the app, SQLite's built-in `FTS5` engine can search exact words, roots, and transliteration instantly.

---

### 🎨 Group 3: Media, Chanting & Social Sharing

#### 3.1 Dynamic Shloka Quote Card Generator
* **Concept**: 1-click generation of high-resolution, devotional quote cards:
  * Calligraphic Devanagari verse text on parchment background with gold floral border.
  * Standard aspect ratios: **1:1** (Instagram Post) and **9:16** (WhatsApp / Instagram Story).
* **Implementation Note**:
  * Can be rendered client-side via HTML5 Canvas on Web or natively via Flutter/Capacitor on Mobile.

#### 3.2 Dynamic Printable Pothi / A4 PDF Export
* **Concept**: Devotees or temple priests can download printable physical copies of any stotra:
  * **Pothi Format**: Horizontal orientation (Landscape Folio) with red-gold borders.
  * **A4 Format**: Standard clean vertical book format with verse numbers and Hindi meaning.
* **Implementation Note**:
  * Implementable via a dedicated `@media print` CSS stylesheet in Astro.

#### 3.3 Timestamped Audio Chanting Player
* **Concept**: Guided chanting with authentic Sanskrit recitation:
  * Synchronized karaoke-style verse highlighting as audio plays.
  * Loop single shloka for memorization / pronunciation practice.

---

### ⏰ Group 4: Devotional Automation & Panchang

#### 4.1 Daily Shloka Automation (Cron)
* **Concept**: Automated daily Gita shloka or Subhashita with Hindi meaning:
  * Push notification on mobile.
  * Automated delivery via WhatsApp Business API or Telegram Bot.

#### 4.2 Tithi & Panchang Smart Recommendations
* **Concept**: Dynamic calendar-aware recommendations:
  * **मङ्गलवार / शनिवार**: Hanuman Chalisa, Bajrang Baan, Sundarkand.
  * **सोमवार / प्रदोष**: Shiva Tandava, Shiva Chalisa, Rudrashtakam.
  * **एकादशी**: Vishnu Sahasranama, Bhagavad Gita.
  * **शुक्रवार**: Sri Suktam, Lakshmi Chalisa, Mahishasura Mardini Stotram.

---

### 🤝 Group 5: Community & Scholarly Collaboration

#### 5.1 Scholarly Word-by-Word Sandhi & Anvaya Breakdowns
* **Concept**: Expandable grammatical word-by-word sandhi breakdown (*पदच्छेद एवं अन्वय*) under complex Sanskrit verses for students and researchers.

#### 5.2 Moderated Public Commentaries & Discussions
* **Concept**: Scholarly footnotes, philosophical interpretations (Advaita, Vishishtadvaita, Dvaita), and verified temple traditions submitted by users and moderated via the Local CMS.

---

### 📖 Group 6: Premium Interactive Reading & Folio Physics (Mobile App Dedicated)

#### 6.1 3D Vertical Pothi Page-Flip & Gesture Leaf Curl
* **Concept**: Authentic sacred pothi vertical leaf flip animation (*पन्ना पलट*):
  * Physical touch gesture tracking where user's thumb bends and curls the paper folio upward in true 3D space (`rotateX`, `translateZ`, specular lighting sheen).
  * Subtle haptic feedback (`vibrate(12)`) on page turn.
  * Deferred from web reader to keep the static web app ultra-lightweight, zero-overhead, and instantly responsive on all devices.

---

## 📌 Decision Log & Revisit Checklist

When ready to prioritize new features, use this checklist:

- [ ] **Phase A (Web Enhancements)**: Printable Pothi PDF (`@media print`), Social Quote Card Generator (Canvas), Deep Verse Permalinks.
- [ ] **Phase B (Mobile App MVP)**: Pre-bundled offline SQLite (`database/gyankosh.db`), 3D Pothi Page-Flip & Touch Curl Physics, Japa Mala Haptic Counter, Nitya-Niyam Playlists.
- [ ] **Phase C (Automation & Devotion)**: Daily Shloka Notifications, Panchang Tithi Matching, Audio Chanting Sync.
