<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AdmissionStatus;
use App\Enums\EventStatus;
use App\Enums\MessageStatus;
use App\Http\Controllers\Controller;
use App\Models\AdmissionRequest;
use App\Models\Announcement;
use App\Models\ContactMessage;
use App\Models\GalleryPhoto;
use App\Models\News;
use App\Models\SchoolEvent;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json(['data' => [
            'news_published' => News::query()->published()->count(),
            'announcements_active' => Announcement::query()->active()->count(),
            'gallery_photos' => GalleryPhoto::query()->visible()->count(),
            'messages_unread' => ContactMessage::query()->where('status', MessageStatus::New)->count(),
            'admission_requests_new' => AdmissionRequest::query()->where('status', AdmissionStatus::New)->count(),
            // Cancelled events stay visible on the site, but they are not "coming up".
            'events_upcoming' => SchoolEvent::query()->where('status', EventStatus::Published)->upcoming()->count(),
        ]]);
    }
}
