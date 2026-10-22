<?php

// Boots a release with the real shared/.env and checks the production
// settings. Prints only OK/FAIL lines, never a value from .env.
//   php preflight.php <backend>
// Replaces `php artisan about`, which needs proc_open (disabled on Hostinger).

$base = $argv[1] ?? '';

require $base.'/vendor/autoload.php';
$app = require $base.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$checks = [
    'APP_ENV is production' => fn () => app()->environment('production'),
    'APP_DEBUG is false' => fn () => config('app.debug') === false,
    'APP_KEY is set' => fn () => filled(config('app.key')),
    'APP_URL is https' => fn () => str_starts_with((string) config('app.url'), 'https://'),
    'SESSION_SECURE_COOKIE is true' => fn () => config('session.secure') === true,
    'SPA_INDEX_PATH folder exists' => fn () => is_dir(dirname((string) config('pepiniere.spa_index'))),
    'storage is writable' => fn () => is_writable(storage_path('framework')) && is_writable(storage_path('logs')),
    'media folder is writable' => fn () => is_writable(storage_path('app/public/media')),
    'database answers' => fn () => Illuminate\Support\Facades\DB::select('select 1 as ok')[0]->ok == 1,
];

$failed = 0;
foreach ($checks as $label => $check) {
    try {
        $ok = (bool) $check();
    } catch (Throwable $e) {
        $ok = false;
    }
    echo $ok ? "  [OK]   $label\n" : "  [FAIL] $label\n";
    $failed += $ok ? 0 : 1;
}

exit($failed > 0 ? 1 : 0);
