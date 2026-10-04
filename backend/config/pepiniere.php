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

    'passwords' => [
        'min_length' => 10,
    ],

];
