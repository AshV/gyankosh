-- ==============================================================================
-- Gyankosh Cloud API — MySQL Schema
-- Run this script on your Cloud MySQL / MariaDB server
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS gyankosh_cloud 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE gyankosh_cloud;

-- 1. Typo & Errata Queue (Crowdsourced corrections from live readers)
CREATE TABLE IF NOT EXISTS errata_reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    text_slug VARCHAR(120) NOT NULL,
    verse_id VARCHAR(50) NOT NULL,
    selected_text TEXT NOT NULL,
    suggested_text TEXT NOT NULL,
    book_reference VARCHAR(255) NULL,   -- e.g. "Gita Press Code 1374, page 4"
    user_note TEXT NULL,
    anon_device_id VARCHAR(64) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    INDEX idx_status (status),
    INDEX idx_slug (text_slug),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Anonymous Devotional Analytics Events (Privacy-first reading metrics)
CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    anon_device_id VARCHAR(64) NOT NULL,
    event_type ENUM('view', 'read_start', 'read_finish', 'search_empty') NOT NULL,
    text_slug VARCHAR(120) NULL,
    duration_seconds INT UNSIGNED DEFAULT 0,
    metadata_json JSON NULL,
    ip_hash CHAR(64) NULL,              -- SHA-256 hash of IP + daily salt (for bot filtering, no raw IP stored)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event (event_type),
    INDEX idx_text_slug (text_slug),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
