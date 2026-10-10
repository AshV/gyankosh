/**
 * tools/cms/app.js
 * Frontend controller for Gyankosh Localhost CMS & Verification Workspace.
 */

const App = {
  state: {
    texts: [],
    activeSlug: null,
    activeText: null,
    activeBlocks: [],
    activeTab: 'verses',
    selectedCategory: 'All',
    stats: {},
  },

  async init() {
    this.bindEvents();
    await this.loadStats();
    await this.loadTexts();

    // Default select first text or hanuman-chalisa
    const defaultSlug = this.state.texts.find(t => t.slug === 'hanuman-chalisa')?.slug || this.state.texts[0]?.slug;
    if (defaultSlug) {
      await this.selectText(defaultSlug);
    }
  },

  bindEvents() {
    // Search input
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.filterCatalog(e.target.value);
    });

    // Category buttons
    document.querySelectorAll('.cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.selectedCategory = btn.dataset.cat;
        this.filterCatalog(document.getElementById('searchInput').value);
      });
    });

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    // Global action buttons
    document.getElementById('btnSyncFromGit')?.addEventListener('click', () => this.syncFromGit());
    document.getElementById('btnExportAll')?.addEventListener('click', () => this.exportAllToGit());
    document.getElementById('btnSeedErrata')?.addEventListener('click', () => this.seedSampleErrata());
    document.getElementById('globalVerseSearch')?.addEventListener('input', (e) => this.searchVerses(e.target.value));
  },

  async loadStats() {
    try {
      const res = await fetch('api.php?action=stats');
      const data = await res.json();
      this.state.stats = data;

      document.getElementById('statTotalTexts').textContent = data.total_texts;
      document.getElementById('statVerifiedTexts').textContent = data.verified_texts;
      document.getElementById('statTotalVerses').textContent = data.total_verses;

      const errataBadge = document.getElementById('errataCountBadge');
      if (errataBadge) {
        errataBadge.textContent = data.pending_errata;
        errataBadge.style.display = data.pending_errata > 0 ? 'inline-block' : 'none';
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  },

  async loadTexts() {
    try {
      const res = await fetch('api.php?action=texts');
      const data = await res.json();
      this.state.texts = data.texts || [];
      this.renderCatalog(this.state.texts);
    } catch (err) {
      this.showToast('Failed to load texts catalog', 'error');
    }
  },

  renderCatalog(texts) {
    const list = document.getElementById('catalogList');
    list.innerHTML = '';

    texts.forEach(t => {
      const item = document.createElement('div');
      item.className = `text-item ${t.slug === this.state.activeSlug ? 'active' : ''}`;
      item.dataset.slug = t.slug;

      const statusClass = t.verification_status || 'unverified';
      const statusLabel = statusClass === 'verified' ? 'सत्यापित' : (statusClass === 'in_progress' ? 'प्रगति पर' : 'असत्यापित');

      item.innerHTML = `
        <div>
          <div class="text-item-title">${t.title}</div>
          <div class="text-item-meta">
            <span>${t.category}</span> &bull; 
            <span>भार: ${t.weight || '-'}</span>
          </div>
        </div>
        <span class="badge-status ${statusClass}">${statusLabel}</span>
      `;

      item.addEventListener('click', () => this.selectText(t.slug));
      list.appendChild(item);
    });
  },

  filterCatalog(searchTerm = '') {
    const term = searchTerm.trim().toLowerCase();
    const cat = this.state.selectedCategory;

    const filtered = this.state.texts.filter(t => {
      const matchCat = (cat === 'All' || t.category === cat);
      const matchSearch = !term || t.title.toLowerCase().includes(term) || t.slug.toLowerCase().includes(term);
      return matchCat && matchSearch;
    });

    this.renderCatalog(filtered);
  },

  async selectText(slug) {
    this.state.activeSlug = slug;

    // Highlight in sidebar
    document.querySelectorAll('.text-item').forEach(el => {
      el.classList.toggle('active', el.dataset.slug === slug);
    });

    try {
      const res = await fetch(`api.php?action=text&slug=${slug}`);
      const data = await res.json();

      if (data.error) {
        this.showToast(data.error, 'error');
        return;
      }

      this.state.activeText = data.text;
      this.state.activeBlocks = data.blocks;

      this.renderHeader();
      this.renderActiveTab();
    } catch (err) {
      this.showToast('Error loading text details', 'error');
    }
  },

  renderHeader() {
    const text = this.state.activeText;
    document.getElementById('headerTitle').textContent = text.title;
    document.getElementById('headerBookRef').innerHTML = `
      <strong>भौतिक ग्रन्थ:</strong> ${text.gita_press_code || 'विवरण अनुपलब्ध'} &bull; 
      <strong>श्रेणी:</strong> ${text.category} &bull; 
      <strong>भाषा:</strong> ${text.language}
    `;

    const statusSelect = document.getElementById('headerStatusSelect');
    if (statusSelect) {
      statusSelect.value = text.verification_status || 'unverified';
      statusSelect.onchange = () => this.updateTextStatus(statusSelect.value);
    }
  },

  switchTab(tab) {
    this.state.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    this.renderActiveTab();
  },

  renderActiveTab() {
    const tab = this.state.activeTab;
    const body = document.getElementById('contentBody');

    if (tab === 'verses') {
      this.renderVersesView(body);
    } else if (tab === 'errata') {
      this.renderErrataView(body);
    } else if (tab === 'meta') {
      this.renderMetaView(body);
    }
  },

  renderVersesView(container) {
    container.innerHTML = '<div class="verse-grid" id="verseGrid"></div>';
    const grid = document.getElementById('verseGrid');

    this.state.activeBlocks.forEach(b => {
      const card = document.createElement('div');
      card.className = `block-card ${b.is_verified ? 'is-verified' : ''}`;
      card.id = `blockCard-${b.id}`;

      const verseLabel = b.verse_num ? `॥ ${b.verse_num} ॥` : '';
      const tagLabel = b.block_type;

      card.innerHTML = `
        <div class="block-header">
          <span class="block-tag">[${tagLabel}]</span>
          ${verseLabel ? `<span class="verse-num-badge">${verseLabel}</span>` : ''}
        </div>
        <textarea class="block-editor-textarea" id="blockContent-${b.id}">${b.content_raw}</textarea>
        <div class="block-footer">
          <label class="verification-check">
            <input type="checkbox" id="blockVerify-${b.id}" ${b.is_verified ? 'checked' : ''}>
            <span>गीताप्रेस से सत्यापित</span>
          </label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input type="number" placeholder="पृष्ठ #" value="${b.gita_press_page || ''}" id="blockPage-${b.id}" 
                   style="width: 70px; padding: 4px 8px; background: var(--bg-input); border: 1px solid var(--border-subtle); border-radius: 4px; color: var(--text-main); font-size: 0.8rem;">
            <button class="btn btn-primary" onclick="App.saveBlock(${b.id})">
              💾 सहेजें
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  },

  async saveBlock(blockId) {
    const content = document.getElementById(`blockContent-${blockId}`).value;
    const isVerified = document.getElementById(`blockVerify-${blockId}`).checked ? 1 : 0;
    const page = document.getElementById(`blockPage-${blockId}`).value;

    try {
      const res = await fetch('api.php?action=update_block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_id: blockId,
          content_raw: content,
          is_verified: isVerified,
          gita_press_page: page,
        }),
      });

      const data = await res.json();
      if (data.success) {
        this.showToast('✅ पद सहेजा गया एवं Git Markdown फाइल में स्वतः अद्यतन हुआ!');
        const card = document.getElementById(`blockCard-${blockId}`);
        if (card) {
          card.classList.toggle('is-verified', isVerified === 1);
        }
        await this.loadStats();
      } else {
        this.showToast(data.error || 'त्रुटि उत्पन्न हुई', 'error');
      }
    } catch (err) {
      this.showToast('पद सहेजने में विफल', 'error');
    }
  },

  async updateTextStatus(status) {
    try {
      const res = await fetch('api.php?action=update_text_meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: this.state.activeSlug,
          verification_status: status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        this.showToast('स्थिति अद्यतन हुई');
        await this.loadStats();
        await this.loadTexts();
      }
    } catch (err) {
      this.showToast('विफल', 'error');
    }
  },

  async renderErrataView(container) {
    container.innerHTML = '<div class="errata-container" id="errataContainer"><p style="color: var(--text-muted);">लोड हो रहा है...</p></div>';

    try {
      const res = await fetch('api.php?action=errata&status=all');
      const data = await res.json();
      const reports = data.reports || [];

      const box = document.getElementById('errataContainer');
      box.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3>📥 अशुद्धि निवारण समीक्षा कतार (Option A Reviews)</h3>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-primary" onclick="App.fetchCloudErrata()">
              📥 क्लाउड से नई रिपोर्ट लाएं
            </button>
            <button class="btn btn-secondary" onclick="App.seedSampleErrata()">
              🧪 नमूना अशुद्धि जोड़ें (परीक्षण)
            </button>
          </div>
        </div>
      `;

      if (reports.length === 0) {
        box.innerHTML += '<div class="errata-card" style="text-align: center; color: var(--text-muted); padding: 40px;">कोई अनिर्णीत अशुद्धि रिपोर्ट नहीं है। सर्वत्र शुद्ध पाठ है! 🙏</div>';
        return;
      }

      reports.forEach(r => {
        const card = document.createElement('div');
        card.className = 'errata-card';
        const isPending = r.review_status === 'pending';

        card.innerHTML = `
          <div class="errata-header">
            <div>
              <strong>${r.text_title || r.text_slug}</strong> &bull; 
              <span class="block-tag">${r.verse_id}</span>
            </div>
            <span class="badge-status ${r.review_status}">${r.review_status}</span>
          </div>
          <div class="errata-meta">
            📖 <strong>संदर्भ:</strong> ${r.book_reference || 'उल्लेखित नहीं'}<br>
            💬 <strong>पाठक टिप्पणी:</strong> ${r.user_note || 'कोई टिप्पणी नहीं'}
          </div>
          <div class="diff-grid">
            <div class="diff-box original">
              <h4>वर्तमान पाठ (Live Website)</h4>
              <div>${r.selected_text}</div>
            </div>
            <div class="diff-box suggested">
              <h4>पाठक द्वारा सुझाया गया संशोधन</h4>
              <div>${r.suggested_text}</div>
            </div>
          </div>
          ${isPending ? `
            <div class="errata-actions">
              <button class="btn btn-danger" onclick="App.resolveErrata(${r.id}, 'reject')">
                ❌ अस्वीकार करें
              </button>
              <button class="btn btn-success" onclick="App.resolveErrata(${r.id}, 'accept', '${encodeURIComponent(r.suggested_text)}')">
                ✅ स्वीकार करें एवं Git फाइल अद्यतन करें
              </button>
            </div>
          ` : `
            <div style="font-size: 0.8rem; color: var(--text-muted); text-align: right;">
              निर्णय: ${r.review_status} (${r.resolved_at || ''})
            </div>
          `}
        `;

        box.appendChild(card);
      });
    } catch (err) {
      container.innerHTML = '<p style="color: #e74c3c;">अशुद्धि समीक्षा लोड करने में त्रुटि।</p>';
    }
  },

  async resolveErrata(reportId, decision, encodedText = '') {
    const appliedText = decodeURIComponent(encodedText);

    try {
      const res = await fetch('api.php?action=resolve_errata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_id: reportId,
          decision: decision,
          applied_text: appliedText,
        }),
      });

      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        await this.loadStats();
        this.renderErrataView(document.getElementById('contentBody'));
        if (this.state.activeSlug) {
          await this.selectText(this.state.activeSlug);
        }
      }
    } catch (err) {
      this.showToast('कार्यवाही में विफलता', 'error');
    }
  },

  async fetchCloudErrata() {
    this.showToast('⏳ क्लाउड एपीआई से अनिर्णीत रिपोर्ट जांची जा रही हैं...');
    try {
      const res = await fetch('api.php?action=fetch_cloud_errata');
      const data = await res.json();
      if (data.success) {
        this.showToast(data.message);
        await this.loadStats();
        this.renderErrataView(document.getElementById('contentBody'));
      } else {
        this.showToast(data.error || 'क्लाउड सिंक विफल', 'error');
      }
    } catch (err) {
      this.showToast('क्लाउड एपीआई से संपर्क नहीं हो सका', 'error');
    }
  },

  async seedSampleErrata() {
    try {
      const res = await fetch('api.php?action=seed_sample_errata', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.showToast('परीक्षण अशुद्धि रिपोर्ट जोड़ी गई');
        await this.loadStats();
        this.renderErrataView(document.getElementById('contentBody'));
      }
    } catch (err) {
      this.showToast('विफल', 'error');
    }
  },

  renderMetaView(container) {
    const t = this.state.activeText;
    container.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: var(--bg-card); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
        <h3 style="color: var(--gold-main); margin-bottom: 16px;">मेटाडेटा एवं परिचय</h3>
        <p style="margin-bottom: 12px;"><strong>विवरण:</strong> ${t.description}</p>
        <p style="margin-bottom: 12px;"><strong>सन्दर्भ / प्रसंग:</strong> ${t.context || 'अनुपलब्ध'}</p>
        <p style="margin-bottom: 12px;"><strong>टैग्स:</strong> ${t.tags_json}</p>
        <p style="margin-bottom: 12px;"><strong>आवरण रंग:</strong> <span style="display: inline-block; width: 14px; height: 14px; background: ${t.cover_color}; border-radius: 3px; vertical-align: middle;"></span> ${t.cover_color}</p>
      </div>
    `;
  },

  async syncFromGit() {
    if (!confirm('क्या आप Git Markdown फाइलों से SQLite डेटाबेस को पुनः सिंक करना चाहते हैं?')) return;
    try {
      const res = await fetch('api.php?action=sync_all_from_git', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.showToast('✅ सम्पूर्ण लाइब्रेरी Git से SQLite में सिंक हो गई!');
        await this.loadStats();
        await this.loadTexts();
        if (this.state.activeSlug) await this.selectText(this.state.activeSlug);
      }
    } catch (err) {
      this.showToast('सिंक विफल', 'error');
    }
  },

  async exportAllToGit() {
    try {
      const res = await fetch('api.php?action=export_all_to_git', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.showToast('✅ सभी ग्रन्थ Git Markdown फाइलों में निर्यात हो गए!');
      }
    } catch (err) {
      this.showToast('निर्यात विफल', 'error');
    }
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    if (type === 'error') toast.style.borderLeftColor = 'var(--crimson-main)';
    toast.textContent = message;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

window.addEventListener('DOMContentLoaded', () => App.init());
