<?php
declare(strict_types=1);

/**
 * tools/cms/config.php
 * Configuration for Gyankosh Localhost CMS Workspace.
 * Used for pulling pending crowdsourced errata reports from your Cloud API.
 */

return [
    // URL of your deployed Cloud API (or local test instance)
    // Example: 'https://api.ashishvishwakarma.com' or 'http://127.0.0.1:8000'
    'cloud_api_url' => getenv('GYANKOSH_CLOUD_API_URL') ?: 'https://api.ashishvishwakarma.com',

    // Secret Admin Key matching ADMIN_API_KEY in cloud-api/config.php
    'admin_api_key' => getenv('GYANKOSH_ADMIN_KEY') ?: 'gyankosh_secret_admin_key_2026',
];
