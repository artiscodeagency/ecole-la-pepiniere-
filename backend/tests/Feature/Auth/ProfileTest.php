<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_updates_their_name_without_their_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/auth/profile', ['name' => 'Nouveau Nom', 'email' => $user->email])
            ->assertOk()
            ->assertJsonPath('data.name', 'Nouveau Nom');
    }

    public function test_changing_the_email_requires_the_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/auth/profile', ['name' => $user->name, 'email' => 'nouvelle@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('current_password');

        $this->actingAs($user)
            ->putJson('/api/auth/profile', [
                'name' => $user->name,
                'email' => 'nouvelle@example.com',
                'current_password' => 'password123',
            ])
            ->assertOk()
            ->assertJsonPath('data.email', 'nouvelle@example.com');
    }

    public function test_changing_the_password_requires_the_current_one(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->putJson('/api/auth/password', [
                'current_password' => 'faux',
                'password' => 'nouveau-mdp-2026',
                'password_confirmation' => 'nouveau-mdp-2026',
            ])
            ->assertStatus(422)
            ->assertJsonPath('errors.current_password.0', 'Le mot de passe actuel est incorrect.');

        $this->actingAs($user)
            ->putJson('/api/auth/password', [
                'current_password' => 'password123',
                'password' => 'nouveau-mdp-2026',
                'password_confirmation' => 'nouveau-mdp-2026',
            ])
            ->assertNoContent();

        $this->assertTrue(Hash::check('nouveau-mdp-2026', $user->fresh()->password));
    }
}
