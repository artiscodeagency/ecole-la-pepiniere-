<?php

namespace Tests\Feature\Admin;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_cannot_reach_user_management(): void
    {
        $this->getJson('/api/admin/users')->assertUnauthorized();
    }

    public function test_the_assistant_cannot_manage_accounts(): void
    {
        $assistant = User::factory()->create();
        $director = User::factory()->director()->create();
        $this->actingAs($assistant);

        $this->getJson('/api/admin/users')->assertForbidden();
        $this->postJson('/api/admin/users', [
            'name' => 'Intrus', 'email' => 'intrus@example.com', 'role' => 'director',
            'password' => 'motdepasse-2026', 'password_confirmation' => 'motdepasse-2026',
        ])->assertForbidden();
        $this->putJson("/api/admin/users/{$assistant->id}", ['role' => 'director'])->assertForbidden();
        $this->deleteJson("/api/admin/users/{$director->id}")->assertForbidden();

        $this->assertSame('assistant', $assistant->fresh()->role->value);
        $this->assertModelExists($director);
    }

    public function test_the_director_creates_an_assistant_account(): void
    {
        $this->actingAs(User::factory()->director()->create());

        $this->postJson('/api/admin/users', [
            'name' => 'Assistante', 'email' => 'assistante@example.com', 'role' => 'assistant',
            'password' => 'motdepasse-2026', 'password_confirmation' => 'motdepasse-2026',
        ])->assertCreated()->assertJsonPath('data.role', 'assistant');

        $this->assertDatabaseHas('users', ['email' => 'assistante@example.com', 'is_active' => true]);
    }

    public function test_the_director_cannot_demote_or_deactivate_themselves(): void
    {
        $director = User::factory()->director()->create();
        $this->actingAs($director);

        $this->putJson("/api/admin/users/{$director->id}", ['role' => 'assistant'])->assertStatus(422);
        $this->putJson("/api/admin/users/{$director->id}", ['is_active' => false])->assertStatus(422);
        $this->deleteJson("/api/admin/users/{$director->id}")->assertStatus(422);

        $this->assertTrue($director->fresh()->isDirector());
        $this->assertTrue($director->fresh()->is_active);
    }

    public function test_the_last_active_director_is_detected(): void
    {
        $director = User::factory()->director()->create();
        User::factory()->director()->inactive()->create();
        User::factory()->create();

        $this->assertTrue($director->isLastActiveDirector());

        $other = User::factory()->director()->create();
        $this->assertFalse($director->isLastActiveDirector());
        $this->assertFalse($other->isLastActiveDirector());
    }

    public function test_a_director_can_demote_another_director(): void
    {
        $this->actingAs(User::factory()->director()->create());
        $other = User::factory()->director()->create();

        $this->putJson("/api/admin/users/{$other->id}", ['role' => 'assistant'])->assertOk();

        $this->assertFalse($other->fresh()->isDirector());
    }

    public function test_a_deactivated_assistant_loses_access_immediately(): void
    {
        $director = User::factory()->director()->create();
        $assistant = User::factory()->create();

        $this->actingAs($director)->putJson("/api/admin/users/{$assistant->id}", ['is_active' => false])->assertOk();

        // As on a real request, the account is read again from the database.
        $this->actingAs($assistant->fresh())->getJson('/api/admin/dashboard')->assertForbidden();
    }

    public function test_the_director_sets_a_new_password_for_the_assistant(): void
    {
        $director = User::factory()->director()->create();
        $assistant = User::factory()->create();

        $this->actingAs($director)->putJson("/api/admin/users/{$assistant->id}/password", [
            'password' => 'nouveau-mdp-2026', 'password_confirmation' => 'nouveau-mdp-2026',
        ])->assertNoContent();

        $this->assertTrue(Hash::check('nouveau-mdp-2026', $assistant->fresh()->password));
    }

    public function test_passwords_never_appear_in_responses_or_logs(): void
    {
        $this->actingAs(User::factory()->director()->create());

        $response = $this->postJson('/api/admin/users', [
            'name' => 'Assistante', 'email' => 'assistante@example.com', 'role' => 'assistant',
            'password' => 'motdepasse-2026', 'password_confirmation' => 'motdepasse-2026',
        ]);

        $this->assertStringNotContainsString('password', $response->getContent());
        $logged = ActivityLog::query()->where('action', 'users.created')->sole();
        $this->assertSame(['name', 'email', 'role'], array_keys($logged->changes));
    }
}
