<?php

namespace Tests\Feature\Admin;

use App\Enums\AdmissionStatus;
use App\Models\AdmissionRequest;
use App\Models\SchoolLevel;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdmissionRequestManagementTest extends TestCase
{
    use RefreshDatabase;

    private function admission(array $overrides = []): AdmissionRequest
    {
        return AdmissionRequest::query()->create([
            'parent_name' => 'Marie Ngo',
            'child_name' => 'Léa Ngo',
            'child_birth_date' => '2021-03-14',
            'level_label' => 'Maternelle',
            'phone' => '694000000',
            'email' => 'marie@example.com',
            'message' => "Bonjour,\nreste-t-il des places ?",
            'status' => AdmissionStatus::New,
            ...$overrides,
        ]);
    }

    public function test_guests_cannot_read_admission_requests(): void
    {
        $this->getJson('/api/admin/admission-requests')->assertUnauthorized();
    }

    public function test_the_list_shows_the_newest_first_with_counts_and_no_message(): void
    {
        $old = $this->admission(['child_name' => 'Ancien']);
        $old->forceFill(['created_at' => now()->subDays(3)])->save();
        $this->admission(['child_name' => 'Récent']);
        $this->admission(['status' => AdmissionStatus::InProgress]);

        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/admission-requests')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.2.child_name', 'Ancien')
            ->assertJsonPath('data.0.level', 'Maternelle')
            ->assertJsonPath('data.0.child_birth_date', '2021-03-14')
            ->assertJsonMissingPath('data.0.message')
            ->assertJsonPath('counts', ['new' => 2, 'in_progress' => 1, 'handled' => 0]);
    }

    public function test_the_official_level_name_is_used_when_the_form_chose_one(): void
    {
        $section = Section::query()->create(['slug' => 'maternelle', 'name_fr' => 'Maternelle', 'sort_order' => 1]);
        $level = SchoolLevel::query()->create(['section_id' => $section->id, 'code' => 'ps', 'name_fr' => 'Petite section', 'sort_order' => 1]);
        $admission = $this->admission(['level_id' => $level->id, 'level_label' => null]);

        $this->actingAs(User::factory()->create())
            ->getJson("/api/admin/admission-requests/{$admission->id}")
            ->assertJsonPath('data.level', 'Petite section');
    }

    public function test_filters_and_search(): void
    {
        $this->admission(['parent_name' => 'Paul Mbarga', 'child_name' => 'Eric Mbarga', 'level_label' => 'CM1']);
        $this->admission(['status' => AdmissionStatus::Handled]);
        $this->actingAs(User::factory()->create());

        $this->getJson('/api/admin/admission-requests?status=handled')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/admission-requests?q=cm1')->assertJsonCount(1, 'data')->assertJsonPath('data.0.parent_name', 'Paul Mbarga');
    }

    public function test_opening_a_request_does_not_change_its_status(): void
    {
        $admission = $this->admission();

        $this->actingAs(User::factory()->create())
            ->getJson("/api/admin/admission-requests/{$admission->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'new')
            ->assertJsonPath('data.message', "Bonjour,\nreste-t-il des places ?");
    }

    public function test_marking_as_handled_records_who_and_when(): void
    {
        $assistant = User::factory()->create(['name' => 'Assistante']);
        $admission = $this->admission();

        $this->actingAs($assistant)
            ->putJson("/api/admin/admission-requests/{$admission->id}", ['status' => 'in_progress'])
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.handled_by', null);

        $this->putJson("/api/admin/admission-requests/{$admission->id}", ['status' => 'handled', 'internal_note' => 'Rendez-vous le 12.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'handled')
            ->assertJsonPath('data.handled_by', 'Assistante')
            ->assertJsonPath('data.internal_note', 'Rendez-vous le 12.');

        $this->putJson("/api/admin/admission-requests/{$admission->id}", ['status' => 'new'])
            ->assertJsonPath('data.handled_by', null)
            ->assertJsonPath('data.handled_at', null);
    }

    public function test_an_unknown_status_is_refused(): void
    {
        $admission = $this->admission();

        $this->actingAs(User::factory()->create())
            ->putJson("/api/admin/admission-requests/{$admission->id}", ['status' => 'read'])
            ->assertUnprocessable();
    }

    public function test_only_the_director_deletes_a_request(): void
    {
        $admission = $this->admission();

        $this->actingAs(User::factory()->create())->deleteJson("/api/admin/admission-requests/{$admission->id}")->assertForbidden();
        $this->actingAs(User::factory()->director()->create())->deleteJson("/api/admin/admission-requests/{$admission->id}")->assertNoContent();

        $this->assertModelMissing($admission);
    }

    public function test_a_request_sent_from_the_site_reaches_the_admin(): void
    {
        $this->postJson('/api/public/admission-requests', [
            'parent_name' => 'Marie Ngo', 'child_name' => 'Léa Ngo', 'child_birth_date' => '2021-03-14',
            'level_label' => 'Maternelle', 'phone' => '694000000', 'email' => 'marie@example.com',
        ])->assertCreated();

        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/admission-requests')
            ->assertJsonPath('data.0.child_name', 'Léa Ngo')
            ->assertJsonPath('data.0.status', 'new');
        $this->getJson('/api/admin/dashboard')->assertJsonPath('data.admission_requests_new', 1);
    }
}
