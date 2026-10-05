<?php

namespace Tests\Feature\Admin;

use App\Enums\EventStatus;
use App\Enums\MessageStatus;
use App\Models\Announcement;
use App\Models\ContactMessage;
use App\Models\GalleryPhoto;
use App\Models\News;
use App\Models\SchoolEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_see_the_dashboard(): void
    {
        $this->getJson('/api/admin/dashboard')->assertUnauthorized();
    }

    public function test_both_roles_see_the_counters(): void
    {
        News::factory()->published()->count(2)->create();
        News::factory()->create();
        Announcement::factory()->create();
        Announcement::factory()->expired()->create();
        GalleryPhoto::factory()->count(3)->create();
        SchoolEvent::factory()->create();
        SchoolEvent::factory()->past()->create();
        // Still shown on the site, but not counted as coming up.
        SchoolEvent::factory()->create(['status' => EventStatus::Cancelled]);
        ContactMessage::query()->create([
            'name' => 'Parent', 'email' => 'parent@example.com', 'phone' => '694000000',
            'subject' => 'Visite', 'message' => 'Bonjour', 'status' => MessageStatus::New,
        ]);

        foreach ([User::factory()->director()->create(), User::factory()->create()] as $user) {
            $this->actingAs($user)->getJson('/api/admin/dashboard')
                ->assertOk()
                ->assertExactJson(['data' => [
                    'news_published' => 2,
                    'announcements_active' => 1,
                    'gallery_photos' => 3,
                    'messages_unread' => 1,
                    'admission_requests_new' => 0,
                    'events_upcoming' => 1,
                ]]);
        }
    }
}
