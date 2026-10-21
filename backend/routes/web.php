<?php

use App\Http\Controllers\Web\NewsSharePageController;
use Illuminate\Support\Facades\Route;

// The public site and the admin are React applications served as static
// files. The only web route is /actualites/{slug}: index.html with each
// article's own share metadata (title, description, image).
Route::get('/actualites/{slug}', NewsSharePageController::class)
    ->where('slug', '[a-z0-9-]+')
    ->name('news.share-page');
