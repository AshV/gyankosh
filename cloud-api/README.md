# ☁️ Gyankosh Cloud API (PHP & MySQL)

This is the lightweight, public backend for **Gyankosh** that handles:
1. **Option A Errata & Typo Reports**: Collects crowdsourced text corrections from live readers.
2. **Privacy-First Devotional Analytics**: Anonymous reading metrics (shlotras read, reading completion, zero-result searches).

---

## 🚀 Quick Deployment Guide

### 1. Requirements
* PHP 8.1+ with `pdo_mysql` extension
* MySQL 5.7+ or MariaDB 10.3+

### 2. Database Setup
1. Create a MySQL database (e.g. `gyankosh_cloud`).
2. Run the SQL script from [`database/schema_cloud.sql`](database/schema_cloud.sql) in phpMyAdmin or MySQL CLI.

### 3. Configuration
Copy or edit [`config.php`](config.php):
* Set your database credentials (`host`, `database`, `username`, `password`).
* Set a strong `admin_api_key` for your Localhost CMS to sync pending reports.

### 4. Uploading to Server
Upload the contents of `cloud-api/` to your server (e.g., `https://api.ashishvishwakarma.com/` or `https://example.com/api/`).

---

## 📡 Available Endpoints

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/errata/report` | **Public** | Submit an errata/typo report with verse reference. |
| **GET** | `/api/errata/pending` | **Admin Key** | Fetch pending typo reports for Local CMS review. |
| **POST** | `/api/errata/resolve` | **Admin Key** | Mark report as accepted or rejected. |
| **POST** | `/api/analytics/event`| **Public** | Log anonymous reading events (`read_start`, `read_finish`). |
| **GET** | `/api/analytics/summary`| **Admin Key**| Fetch top recited stotras and search gaps. |
