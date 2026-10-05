<?php

use App\Http\Controllers\Api\Admin\AnnouncementController as AdminAnnouncementController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\MediaController;
use App\Http\Controllers\Api\Admin\NewsController as AdminNewsController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\PasswordResetController;
use App\Http\Controllers\Api\Public\AdmissionRequestController;
use App\Http\Controllers\Api\Public\AnnouncementController;
use App\Http\Controllers\Api\Public\ContactMessageController;
use App\Http\Controllers\Api\Public\DocumentController;
use App\Http\Controllers\Api\Public\EventController;
use App\Http\Controllers\Api\Public\GalleryController;
use App\Http\Controllers\Api\Public\NewsController;
use App\Http\Controllers\Api\Public\SchoolInfoController;
use App\Http\Controllers\Api\Public\SectionController;
use Illuminate\Support\Facades\Route;

/*
| Public site: read-only content, plus the two forms.
*/
Route::prefix('public')->name('public.')->group(function () {
    Route::get('school-info', SchoolInfoController::class)->name('school-info');
    Route::get('sections', SectionController::class)->name('sections');
    Route::get('news', [NewsController::class, 'index'])->name('news.index');
    Route::get('news/{slug}', [NewsController::class, 'show'])->name('news.show');
    Route::get('news-categories', [NewsController::class, 'categories'])->name('news-categories');
    Route::get('announcements', [AnnouncementController::class, 'index'])->name('announcements');
    Route::get('events', [EventController::class, 'index'])->name('events');
    Route::get('gallery/categories', [GalleryController::class, 'categories'])->name('gallery.categories');
    Route::get('gallery/photos', [GalleryController::class, 'photos'])->name('gallery.photos');
    Route::get('documents', [DocumentController::class, 'index'])->name('documents');

    Route::middleware('throttle:public-forms')->group(function () {
        Route::post('contact-messages', [ContactMessageController::class, 'store'])->name('contact-messages.store');
        Route::post('admission-requests', [AdmissionRequestController::class, 'store'])->name('admission-requests.store');
    });
});

/*
| Authentication of the admin (session cookie, same domain).
*/
Route::prefix('auth')->name('auth.')->group(function () {
    Route::post('login', [AuthController::class, 'login'])->middleware('throttle:login')->name('login');
    Route::middleware('throttle:password-reset')->group(function () {
        Route::post('forgot-password', [PasswordResetController::class, 'sendLink'])->name('forgot-password');
        Route::post('reset-password', [PasswordResetController::class, 'reset'])->name('reset-password');
    });

    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::post('logout', [AuthController::class, 'logout'])->name('logout');
        Route::get('me', [AuthController::class, 'me'])->name('me');
        Route::put('profile', [AuthController::class, 'updateProfile'])->name('profile');
        Route::put('password', [AuthController::class, 'updatePassword'])->name('password');
    });
});

/*
| Admin. Every route checks the session and the permission on the server.
| Content modules (news, announcements, events, gallery, inbox, school
| information) are added one by one in stage 3.
*/
Route::prefix('admin')->name('admin.')->middleware(['auth:sanctum', 'active', 'can:manage-content'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::post('media', [MediaController::class, 'store'])->name('media.store');
    Route::patch('media/{media}', [MediaController::class, 'update'])->name('media.update');

    Route::apiResource('news', AdminNewsController::class);
    Route::post('news/{news}/restore', [AdminNewsController::class, 'restore'])->withTrashed()->name('news.restore');

    Route::apiResource('announcements', AdminAnnouncementController::class);
    Route::post('announcements/{announcement}/restore', [AdminAnnouncementController::class, 'restore'])
        ->withTrashed()
        ->name('announcements.restore');

    Route::middleware('can:manage-users')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::put('users/{user}/password', [UserController::class, 'resetPassword'])->name('users.password');
    });
});
