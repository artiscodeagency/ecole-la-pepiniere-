<?php

namespace Tests\Feature\Auth;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_signs_in_and_receives_their_role_and_permissions(): void
    {
        $user = User::factory()->director()->create(['email' => 'directeur@example.com']);

        $this->postJson('/api/auth/login', ['email' => 'directeur@example.com', 'password' => 'password123'])
            ->assertOk()
            ->assertJsonPath('data.role', 'director')
            ->assertJsonPath('data.abilities.manage-users', true);

        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->fresh()->last_login_at);
        $this->assertTrue(ActivityLog::query()->where('action', 'auth.login')->exists());
    }

    public function test_an_assistant_does_not_receive_director_permissions(): void
    {
        User::factory()->create(['email' => 'assistante@example.com']);

        $this->postJson('/api/auth/login', ['email' => 'assistante@example.com', 'password' => 'password123'])
            ->assertOk()
            ->assertJsonPath('data.role', 'assistant')
            ->assertJsonPath('data.abilities.manage-content', true)
            ->assertJsonPath('data.abilities.manage-users', false)
            ->assertJsonPath('data.abilities.manage-school-info', false);
    }

    public function test_a_wrong_password_is_refused_with_a_french_message(): void
    {
        User::factory()->create(['email' => 'assistante@example.com']);

        $this->postJson('/api/auth/login', ['email' => 'assistante@example.com', 'password' => 'mauvais-mot-de-passe'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Adresse email ou mot de passe incorrect.');

        $this->assertGuest();
    }

    public function test_a_deactivated_account_gets_the_same_answer_as_a_wrong_password(): void
    {
        User::factory()->inactive()->create(['email' => 'ancienne@example.com']);

        $this->postJson('/api/auth/login', ['email' => 'ancienne@example.com', 'password' => 'password123'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Adresse email ou mot de passe incorrect.');

        $this->assertGuest();
    }

    public function test_the_account_is_locked_after_five_failed_attempts(): void
    {
        User::factory()->create(['email' => 'assistante@example.com']);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/auth/login', ['email' => 'assistante@example.com', 'password' => 'faux'])->assertStatus(422);
        }

        // Even the right password is refused while locked.
        $this->postJson('/api/auth/login', ['email' => 'assistante@example.com', 'password' => 'password123'])
            ->assertStatus(429);
        $this->assertGuest();
    }

    public function test_a_signed_in_user_can_sign_out(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/auth/logout')->assertNoContent();

        $this->assertGuest('web');
    }

    public function test_the_current_user_requires_a_session(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_the_session_check_answers_a_guest_without_an_error(): void
    {
        $this->getJson('/api/auth/session')->assertOk()->assertExactJson(['data' => null]);
    }

    public function test_the_session_check_returns_the_signed_in_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->getJson('/api/auth/session')->assertOk()->assertJsonPath('data.email', $user->email);
    }

    public function test_the_session_check_signs_out_a_deactivated_user(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $user->update(['is_active' => false]);

        $this->getJson('/api/auth/session')->assertForbidden()->assertJsonPath('message', 'Ce compte est désactivé.');
        $this->assertGuest('web');
    }

    public function test_a_deactivated_user_is_signed_out_on_the_next_request(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $user->update(['is_active' => false]);

        $this->getJson('/api/auth/me')
            ->assertForbidden()
            ->assertJsonPath('message', 'Ce compte est désactivé.');
    }
}
