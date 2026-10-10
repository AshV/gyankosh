-- ==============================================================================
-- Gyankosh SQLite Database Schema
-- Local Working Engine for Gita Press Verification & Option A Errata Reviews
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- 1. Texts / Granthas Catalog
CREATE TABLE IF NOT EXISTS texts (
    slug TEXT PRIMARY KEY,                       -- e.g. 'hanuman-chalisa'
    title TEXT NOT NULL,                         -- e.g. 'हनुमान चालीसा'
    author TEXT,                                 -- e.g. 'गोस्वामी तुलसीदास'
    description TEXT NOT NULL,
    category TEXT NOT NULL,                      -- 'Veda', 'Upanishad', 'Gita', 'Chalisa', 'Stotra', 'Aarti', 'Purana', 'Other'
    language TEXT DEFAULT 'Sanskrit',
    cover_color TEXT,
    cover_image TEXT,
    show_numbering INTEGER DEFAULT 1,            -- 1 = true, 0 = false
    context TEXT,
    weight INTEGER,
    chapter INTEGER,
    tags_json TEXT DEFAULT '[]',                 -- JSON array of tag strings
    gita_press_code TEXT,                        -- e.g. '1374' (from TODO.md)
    verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'in_progress', 'verified'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_texts_category ON texts(category);
CREATE INDEX IF NOT EXISTS idx_texts_status ON texts(verification_status);

-- 2. Blocks / Verses Table (Preserves 100% exact document order)
CREATE TABLE IF NOT EXISTS blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_slug TEXT NOT NULL,
    block_order INTEGER NOT NULL,                -- 1, 2, 3... sequence in markdown
    block_type TEXT NOT NULL,                    -- 'Instruction', 'Viniyoga', 'Speaker', 'Shloka', 'Doha', 'Chaupai', 'Mantra', 'Name', 'Prose', 'Chhanda', 'Translation', 'Plain'
    verse_num INTEGER,                           -- Numbered verse counter (1, 2, 3...) or NULL for unnumbered
    speaker TEXT,                                -- Associated speaker (e.g. 'श्रीभगवानुवाच')
    content_raw TEXT NOT NULL,                   -- Raw body lines of block (without [Tag])
    padas_json TEXT DEFAULT '[]',                -- JSON array of lines / padas
    bhavarth TEXT,                               -- Paired translation if available
    gita_press_page INTEGER,                     -- Physical reference page
    is_verified INTEGER DEFAULT 0,               -- 1 = verified against Gita Press
    notes TEXT,                                  -- Internal editorial notes / doubts
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (text_slug) REFERENCES texts(slug) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocks_text_order ON blocks(text_slug, block_order);
CREATE INDEX IF NOT EXISTS idx_blocks_verse ON blocks(text_slug, verse_num);

-- 3. Local Errata / Typo Reviews Queue (Fetched from Cloud API for Option A review)
CREATE TABLE IF NOT EXISTS local_errata_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cloud_report_id INTEGER,                     -- ID from cloud MySQL database
    text_slug TEXT NOT NULL,
    verse_id TEXT NOT NULL,                      -- e.g. 'verse-3'
    selected_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    book_reference TEXT,                         -- e.g. 'Gita Press 1374, page 4'
    user_note TEXT,
    anon_device_id TEXT NOT NULL,
    review_status TEXT DEFAULT 'pending',        -- 'pending', 'accepted', 'rejected'
    admin_notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_errata_status ON local_errata_reviews(review_status);
