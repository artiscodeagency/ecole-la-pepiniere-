<?php

namespace Tests\Feature\Public;

use App\Enums\AnnouncementImportance;
use App\Enums\ContentStatus;
use App\Enums\EventStatus;
use App\Models\Announcement;
use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Models\News;
use App\Models\SchoolEvent;
use App\Models\SchoolFee;
use App\Models\Section;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_published_news_whose_date_has_come_are_listed(): void
    {
        $published = News::factory()->published()->create();
        News::factory()->create(); // draft
        News::factory()->scheduled()->create();
        News::factory()->published()->create(['status' => ContentStatus::Archived]);

        $this->getJson('/api/public/news')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $published->slug);
    }

    public function test_a_draft_article_is_not_reachable_by_its_slug(): void
    {
        $draft = News::factory()->create();

        $this->getJson("/api/public/news/{$draft->slug}")->assertNotFound();
    }

    public function test_an_article_exposes_both_languages_and_seo_fallbacks(): void
    {
        $news = News::factory()->published()->create([
            'title_fr' => 'Rentrée scolaire',
            'title_en' => '',
            'excerpt_fr' => 'Les informations de la rentrée.',
        ]);

        $this->getJson("/api/public/news/{$news->slug}")
            ->assertOk()
            ->assertJsonPath('data.title.fr', 'Rentrée scolaire')
            // A missing translation is null, never an empty or broken text.
            ->assertJsonPath('data.title.en', null)
            ->assertJsonPath('data.seo.title.fr', 'Rentrée scolaire')
            ->assertJsonPath('data.seo.description.fr', 'Les informations de la rentrée.');
    }

    public function test_only_announcements_within_their_period_are_shown(): void
    {
        $active = Announcement::factory()->create();
        Announcement::factory()->expired()->create();
        Announcement::factory()->notStarted()->create();
        Announcement::factory()->create(['status' => ContentStatus::Draft]);

        $this->getJson('/api/public/announcements')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id);
    }

    public function test_pinned_then_urgent_announcements_come_first(): void
    {
        $info = Announcement::factory()->create();
        $urgent = Announcement::factory()->create(['importance' => AnnouncementImportance::Urgent]);
        $pinned = Announcement::factory()->create(['is_pinned' => true]);

        $this->getJson('/api/public/announcements')
            ->assertJsonPath('data.0.id', $pinned->id)
            ->assertJsonPath('data.1.id', $urgent->id)
            ->assertJsonPath('data.2.id', $info->id);
    }

    public function test_a_section_page_also_gets_the_school_wide_announcements(): void
    {
        $nursery = Section::factory()->create(['slug' => 'maternelle']);
        $primary = Section::factory()->create(['slug' => 'primaire-francophone']);
        $schoolWide = Announcement::factory()->create();
        $forNursery = Announcement::factory()->create(['section_id' => $nursery->id]);
        Announcement::factory()->create(['section_id' => $primary->id]);

        $ids = $this->getJson('/api/public/announcements?section=maternelle')->json('data.*.id');

        $this->assertEqualsCanonicalizing([$schoolWide->id, $forNursery->id], $ids);
    }

    public function test_events_are_split_between_upcoming_and_past(): void
    {
        $upcoming = SchoolEvent::factory()->create();
        $past = SchoolEvent::factory()->past()->create();
        SchoolEvent::factory()->create(['status' => EventStatus::Draft]);
        $cancelled = SchoolEvent::factory()->create(['status' => EventStatus::Cancelled]);

        $this->getJson('/api/public/events')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $upcoming->id, 'is_cancelled' => false])
            ->assertJsonFragment(['id' => $cancelled->id, 'is_cancelled' => true]);

        $this->getJson('/api/public/events?period=past')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $past->id);
    }

    public function test_a_multi_day_event_stays_upcoming_until_its_last_day(): void
    {
        $event = SchoolEvent::factory()->create([
            'event_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addDay()->toDateString(),
        ]);

        $this->getJson('/api/public/events')->assertJsonPath('data.0.id', $event->id);
    }

    public function test_the_gallery_hides_hidden_photos_and_empty_or_hidden_categories(): void
    {
        $category = GalleryCategory::factory()->create(['slug' => 'salles-de-classe']);
        $visible = GalleryPhoto::factory()->create(['category_id' => $category->id]);
        GalleryPhoto::factory()->create(['category_id' => $category->id, 'is_visible' => false]);
        GalleryCategory::factory()->create(); // empty
        $hiddenCategory = GalleryCategory::factory()->create(['is_visible' => false]);
        GalleryPhoto::factory()->create(['category_id' => $hiddenCategory->id]);

        $this->getJson('/api/public/gallery/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'salles-de-classe')
            ->assertJsonPath('data.0.photos_count', 1)
            ->assertJsonPath('data.0.cover.id', $visible->media_id);

        $this->getJson('/api/public/gallery/photos')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $visible->id)
            ->assertJsonPath('data.0.media.urls.thumb', "http://localhost/media/{$visible->media->variants['thumb']}");
    }

    public function test_school_info_never_exposes_private_settings_and_computes_totals(): void
    {
        Setting::query()->create(['key' => 'contact.email', 'value' => 'ecole@example.com']);
        Setting::query()->create(['key' => 'private.note', 'value' => 'interne']);
        SchoolFee::query()->create([
            'label_fr' => 'Primaire francophone', 'first_installment' => 50_000, 'second_installment' => 30_000,
        ]);

        $this->getJson('/api/public/school-info')
            ->assertOk()
            ->assertJsonPath('data.settings', ['contact.email' => 'ecole@example.com'])
            ->assertJsonPath('data.school_fees.0.total', 80_000);
    }

    public function test_public_responses_carry_security_headers(): void
    {
        $this->getJson('/api/public/news')
            ->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY');
    }
}
