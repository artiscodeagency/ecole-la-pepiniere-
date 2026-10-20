<?php

return [

    /*
    | Timezone of the school (Bertoua). Dates are stored in UTC; this one is
    | used to decide what "today" means (upcoming events, expiry dates).
    */
    'timezone' => 'Africa/Douala',

    /*
    | Origin of the public site and of the admin (same domain in production).
    */
    'frontend_url' => rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost')), '/'),

    /*
    | Admin pages linked from emails.
    */
    'admin_paths' => [
        'login' => '/admin/connexion',
        'reset_password' => '/admin/mot-de-passe/reinitialiser',
    ],

    /*
    | The built public site's index.html (npm run build). Served with each
    | article's own title, description and share image for /actualites/{slug},
    | so links shared on WhatsApp or Facebook show the article.
    */
    'spa_index' => env('SPA_INDEX_PATH', base_path('../dist/index.html')),

    'passwords' => [
        'min_length' => 10,
    ],

];
