<?php
declare(strict_types=1);

/**
 * cloud-api/config.php
 * Configuration for Gyankosh Cloud API.
 * Reads environment variables with safe defaults.
 */

return [
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_NAME') ?: 'gyankosh_cloud',
        'username' => getenv('DB_USER') ?: 'root',
        'password' => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],
    // Secret key required by Local CMS to fetch pending typo reports
    // Change this to a secure random string when deploying to your public server!
    'admin_api_key' => getenv('ADMIN_API_KEY') ?: 'gyankosh_secret_admin_key_2026',
    
    // Allowed CORS origins
    'allowed_origins' => [
        'https://gyankosh.app',
        'https://www.gyankosh.app',
        'https://www.ashishvishwakarma.com',
        'https://ashv.github.io',
        'http://localhost:4321',
        'http://localhost:8080',
        'http://127.0.0.1:4321',
        'http://127.0.0.1:8080',
    ],
];
