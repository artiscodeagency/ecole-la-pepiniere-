<?php

namespace Tests\Feature\Admin;

use App\Enums\EventStatus;
use App\Models\NewsCategory;
use App\Models\SchoolEvent;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventManagementTest extends TestCase
{
    use RefreshDatabase;

    private function event(array $overrides = []): array
    {
        return [
            'title_fr' => 'Journée portes ouvertes',
            'description_fr' => 'Les familles découvrent les classes et rencontrent les enseignants.',
            'event_date' => now(config('pepiniere.timezone'))->addWeek()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'location_fr' => 'Cour de l\'école',
            'status' => 'published',
            ...$overrides,
        ];
    }

    public function test_guests_cannot_manage_events(): void
    {
        $this->getJson('/api/admin/events')->assertUnauthorized();
    }

    public function test_a_published_event_is_upcoming_and_public(): void
    {
        $category = NewsCategory::factory()->create();
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/events', $this->event(['category_id' => $category->id]))
            ->assertCreated()
            ->assertJsonPath('data.display_status', 'upcoming')
            ->assertJsonPath('data.start_time', '08:00')
            ->assertJsonPath('data.category.id', $category->id);

        $this->getJson('/api/public/events')->assertJsonCount(1, 'data');
    }

    public function test_today_is_ongoing_and_yesterday_is_past(): void
    {
        $today = now(config('pepiniere.timezone'));
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/events', $this->event(['event_date' => $today->toDateString()]))
            ->assertJsonPath('data.display_status', 'ongoing');
        $this->postJson('/api/admin/events', $this->event(['event_date' => $today->copy()->subDay()->toDateString()]))
            ->assertJsonPath('data.display_status', 'past');

        $this->getJson('/api/admin/events?status=upcoming')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/events?status=past')->assertJsonCount(1, 'data');
    }

    public function test_a_cancelled_event_stays_public_with_its_mark(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/events', $this->event(['status' => 'cancelled']))
            ->assertJsonPath('data.display_status', 'cancelled');

        $this->getJson('/api/public/events')->assertJsonPath('data.0.is_cancelled', true);
    }

    public function test_a_draft_is_never_public(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/events', $this->event(['status' => 'draft']));

        $this->getJson('/api/public/events')->assertJsonCount(0, 'data');
    }

    public function test_dates_and_times_must_be_in_order(): void
    {
        $this->actingAs(User::factory()->create());
        $start = now()->addWeek();

        $this->postJson('/api/admin/events', $this->event([
            'event_date' => $start->toDateString(),
            'end_date' => $start->copy()->subDay()->toDateString(),
        ]))->assertStatus(422)
            ->assertJsonPath('errors.end_date.0', 'La date de fin doit être le même jour que la date de début, ou après.');

        $this->postJson('/api/admin/events', $this->event(['start_time' => '14:00', 'end_time' => '10:00']))
            ->assertStatus(422)
            ->assertJsonPath('errors.end_time.0', "L'heure de fin doit être après l'heure de début.");

        // Over several days, finishing earlier in the day is fine.
        $this->postJson('/api/admin/events', $this->event([
            'event_date' => $start->toDateString(),
            'end_date' => $start->copy()->addDays(2)->toDateString(),
            'start_time' => '14:00',
            'end_time' => '10:00',
        ]))->assertCreated();
    }

    public function test_a_one_day_event_keeps_no_end_date(): void
    {
        $this->actingAs(User::factory()->create());
        $date = now()->addWeek()->toDateString();

        $this->postJson('/api/admin/events', $this->event(['event_date' => $date, 'end_date' => $date]))
            ->assertJsonPath('data.end_date', null);
    }

    public function test_the_date_is_required_in_french(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/admin/events', $this->event(['event_date' => null]))
            ->assertStatus(422)
            ->assertJsonPath('errors.event_date.0', 'Le champ date est obligatoire.');
    }

    public function test_the_assistant_deletes_only_her_own_drafts(): void
    {
        $assistant = User::factory()->create();
        $ownDraft = SchoolEvent::factory()->create(['author_id' => $assistant->id, 'status' => EventStatus::Draft]);
        $published = SchoolEvent::factory()->create(['author_id' => $assistant->id]);
        $this->actingAs($assistant);

        $this->deleteJson("/api/admin/events/{$ownDraft->id}")->assertNoContent();
        $this->deleteJson("/api/admin/events/{$published->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Seul le Directeur peut supprimer un événement déjà publié ou créé par quelqu\'un d\'autre. Vous pouvez l\'annuler ou l\'archiver.');
    }

    public function test_the_director_deletes_and_restores(): void
    {
        $event = SchoolEvent::factory()->create();
        $this->actingAs(User::factory()->director()->create());

        $this->deleteJson("/api/admin/events/{$event->id}")->assertNoContent();
        $this->getJson('/api/public/events')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/events?status=trashed')->assertJsonPath('data.0.display_status', 'trashed');

        $this->postJson("/api/admin/events/{$event->id}/restore")->assertOk();
        $this->getJson('/api/public/events')->assertJsonCount(1, 'data');
    }
}
