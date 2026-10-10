<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ज्ञानकोश — स्थानीय सम्पादन एवं सत्यापन कार्यशाला (Gyankosh Local CMS)</title>
  <link rel="stylesheet" href="style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22%3E<text y=%2226%22 font-size=%2224%22>🕉️</text></svg>">
</head>
<body>

  <!-- Top Navigation Bar -->
  <header class="top-nav">
    <div class="brand-section">
      <span class="brand-icon">🕉️</span>
      <h1 class="brand-title">ज्ञानकोश सत्यापन कार्यशाला</h1>
      <span class="brand-badge">Localhost CMS</span>
    </div>

    <div class="nav-actions">
      <div class="stat-pill">ग्रन्थ: <strong id="statTotalTexts">108</strong></div>
      <div class="stat-pill">सत्यापित: <strong id="statVerifiedTexts">0</strong></div>
      <div class="stat-pill">कुल पद/श्लोक: <strong id="statTotalVerses">4,394</strong></div>
      
      <button class="btn btn-secondary" id="btnSyncFromGit" title="Git Markdown फाइलों से SQLite को पुनः रीफ्रेश करें">
        🔄 Git से रीलोड
      </button>
      <button class="btn btn-primary" id="btnExportAll" title="SQLite से सभी Markdown फाइलों को पुनः लिखें">
        💾 Git में निर्यात
      </button>
    </div>
  </header>

  <!-- Main App Container -->
  <div class="app-container">
    
    <!-- Left Sidebar: Granthas Catalog -->
    <aside class="sidebar">
      <div class="sidebar-search-box">
        <input type="text" class="search-input" id="searchInput" placeholder="🔍 ग्रन्थ खोजें (शीर्षक, slug)...">
        
        <div class="category-filter">
          <button class="cat-btn active" data-cat="All">समस्त (108)</button>
          <button class="cat-btn" data-cat="Chalisa">🪔 चालीसा</button>
          <button class="cat-btn" data-cat="Stotra">🌸 स्तोत्र</button>
          <button class="cat-btn" data-cat="Gita">🎵 गीता</button>
          <button class="cat-btn" data-cat="Upanishad">🪷 उपनिषद्</button>
          <button class="cat-btn" data-cat="Veda">🔥 वेद</button>
          <button class="cat-btn" data-cat="Aarti">🪔 आरती</button>
          <button class="cat-btn" data-cat="Purana">📖 पुराण</button>
          <button class="cat-btn" data-cat="Other">📜 अन्य</button>
        </div>
      </div>

      <div class="catalog-list" id="catalogList">
        <!-- Dynamically populated by app.js -->
      </div>
    </aside>

    <!-- Main Workspace -->
    <main class="main-view">
      
      <!-- Content Header -->
      <div class="content-header">
        <div class="content-title-area">
          <h2 id="headerTitle">ग्रन्थ लोड हो रहा है...</h2>
          <div class="content-book-ref" id="headerBookRef">भौतिक ग्रन्थ विवरण लोड हो रहा है...</div>
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <label style="font-size: 0.85rem; color: var(--text-muted);">सत्यापन स्थिति:</label>
          <select id="headerStatusSelect" class="btn btn-secondary" style="padding: 6px 12px; outline: none; cursor: pointer;">
            <option value="unverified">⚪ असत्यापित (Unverified)</option>
            <option value="in_progress">⏳ प्रगति पर (In Progress)</option>
            <option value="verified">✅ गीताप्रेस सत्यापित (Verified)</option>
          </select>
        </div>
      </div>

      <!-- Workspace Tabs -->
      <nav class="content-tabs">
        <button class="tab-btn active" data-tab="verses">
          📖 पद, श्लोक एवं भावार्थ
        </button>
        <button class="tab-btn" data-tab="errata">
          📥 अशुद्धि समीक्षा कतार (Option A)
          <span class="tab-badge" id="errataCountBadge" style="display: none;">0</span>
        </button>
        <button class="tab-btn" data-tab="meta">
          📑 ग्रन्थ परिचय एवं मेटाडेटा
        </button>
      </nav>

      <!-- Scrollable Content Body -->
      <section class="content-body" id="contentBody">
        <!-- Dynamically rendered by app.js -->
      </section>

    </main>

  </div>

  <div id="toastContainer" class="toast-container"></div>

  <script src="app.js"></script>
</body>
</html>
