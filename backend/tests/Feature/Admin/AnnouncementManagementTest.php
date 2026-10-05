<?php

namespace Tests\Feature\Admin;

use App\Enums\ContentStatus;
use App\Models\ActivityLog;
use App\Models\Announcement;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnnouncementManagementTest extends TestCase
{
    use RefreshDatabase;

    private function announcement(array $overrides = []): array
    {
        return [
            'title_fr' => 'Réunion des parents',
            'message_fr' => 'Une réunion aura lieu samedi à 9 h dans la cour.',
            'importance' => 'important',
            'ends_at' => now()->addWeek()->toIso8601String(),
            'status' => 'published',
            ...$overrides,
        ];
    }

    public function test_guests_cannot_manage_announcements(): void
    {
        $this->getJson('/api/admin/announcements')->assertUnauthorized();
    }

    public function test_a_published_announcement_without_start_is_online_immediately(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/announcements', $this->announcement())
            ->assertCreated()
            ->assertJsonPath('data.display_status', 'active')
            ->assertJsonPath('data.importance', 'important');

        $this->getJson('/api/public/announcements')->assertJsonCount(1, 'data');
        $this->assertTrue(ActivityLog::query()->where('action', 'announcements.created')->exists());
    }

    public function test_the_end_date_is_mandatory_and_after_the_start(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/announcements', $this->announcement(['ends_at' => null]))
            ->assertStatus(422)
            ->assertJsonPath('errors.ends_at.0', 'Le champ date de fin est obligatoire.');

        $this->postJson('/api/admin/announcements', $this->announcement([
            'starts_at' => now()->addDays(3)->toIso8601String(),
            'ends_at' => now()->addDay()->toIso8601String(),
        ]))
            ->assertStatus(422)
            ->assertJsonPath('errors.ends_at.0', 'La date de fin doit être après la date de début.');
    }

    public function test_a_future_start_schedules_and_an_expired_one_disappears(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/announcements', $this->announcement([
            'starts_at' => now()->addDay()->toIso8601String(),
            'ends_at' => now()->addDays(5)->toIso8601String(),
        ]))->assertJsonPath('data.display_status', 'scheduled');
        Announcement::factory()->expired()->create();

        $this->getJson('/api/public/announcements')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/announcements?status=scheduled')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/announcements?status=expired')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.display_status', 'expired');
    }

    public function test_a_draft_is_never_public(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/announcements', $this->announcement(['status' => 'draft']))
            ->assertJsonPath('data.display_status', 'draft');

        $this->getJson('/api/public/announcements')->assertJsonCount(0, 'data');
    }

    public function test_an_announcement_can_target_a_section(): void
    {
        $nursery = Section::factory()->create(['slug' => 'maternelle']);
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/announcements', $this->announcement(['section_id' => $nursery->id]))
            ->assertJsonPath('data.section.slug', 'maternelle');
        Announcement::factory()->create();

        $this->getJson('/api/admin/announcements?section=maternelle')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/announcements?section=ecole')->assertJsonCount(1, 'data');
        $this->getJson('/api/public/sections')->assertJsonPath('data.0.slug', 'maternelle');
    }

    public function test_updating_keeps_the_original_start(): void
    {
        $announcement = Announcement::factory()->create(['starts_at' => now()->subDays(2)]);
        $start = $announcement->starts_at->toIso8601String();

        $this->actingAs(User::factory()->create())
            ->putJson("/api/admin/announcements/{$announcement->id}", $this->announcement(['title_fr' => 'Nouveau titre']))
            ->assertOk()
            ->assertJsonPath('data.title.fr', 'Nouveau titre')
            ->assertJsonPath('data.starts_at', $start);
    }

    public function test_the_assistant_deletes_only_her_own_drafts(): void
    {
        $assistant = User::factory()->create();
        $ownDraft = Announcement::factory()->create(['author_id' => $assistant->id, 'status' => ContentStatus::Draft]);
        $ownPublished = Announcement::factory()->create(['author_id' => $assistant->id]);
        $this->actingAs($assistant);

        $this->deleteJson("/api/admin/announcements/{$ownDraft->id}")->assertNoContent();
        $this->deleteJson("/api/admin/announcements/{$ownPublished->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Seul le Directeur peut supprimer une annonce déjà publiée ou créée par quelqu\'un d\'autre. Vous pouvez l\'archiver.');
        $this->getJson('/api/admin/announcements?status=trashed')->assertForbidden();
    }

    public function test_the_director_deletes_and_restores(): void
    {
        $announcement = Announcement::factory()->create();
        $this->actingAs(User::factory()->director()->create());

        $this->deleteJson("/api/admin/announcements/{$announcement->id}")->assertNoContent();
        $this->getJson('/api/public/announcements')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/announcements?status=trashed')->assertJsonPath('data.0.display_status', 'trashed');

        $this->postJson("/api/admin/announcements/{$announcement->id}/restore")->assertOk();
        $this->getJson('/api/public/announcements')->assertJsonCount(1, 'data');
    }
}
