<?php

use App\Http\Controllers\Web\NewsSharePageController;
use App\Http\Controllers\Web\SeoFilesController;
use Illuminate\Support\Facades\Route;

// The public site and the admin are React applications served as static
// files. Web routes: /actualites/{slug} (index.html with each article's own
// share metadata), /robots.txt and /sitemap.xml.
Route::get('/actualites/{slug}', NewsSharePageController::class)
    ->where('slug', '[a-z0-9-]+')
    ->name('news.share-page');

Route::get('/robots.txt', [SeoFilesController::class, 'robots'])->name('robots');
Route::get('/sitemap.xml', [SeoFilesController::class, 'sitemap'])->name('sitemap');
