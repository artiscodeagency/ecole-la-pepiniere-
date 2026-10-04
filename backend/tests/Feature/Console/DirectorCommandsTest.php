<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DirectorCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_creates_the_first_director(): void
    {
        $this->artisan('pepiniere:create-director')
            ->expectsQuestion('Nom complet', 'Directeur')
            ->expectsQuestion('Adresse email (identifiant de connexion)', 'directeur@example.com')
            ->expectsQuestion('Mot de passe (10 caractères minimum, lettres et chiffres)', 'motdepasse-2026')
            ->expectsQuestion('Confirmez le mot de passe', 'motdepasse-2026')
            ->assertSuccessful();

        $director = User::query()->sole();
        $this->assertTrue($director->isDirector());
        $this->assertTrue($director->is_active);
    }

    public function test_it_refuses_a_weak_password(): void
    {
        $this->artisan('pepiniere:create-director')
            ->expectsQuestion('Nom complet', 'Directeur')
            ->expectsQuestion('Adresse email (identifiant de connexion)', 'directeur@example.com')
            ->expectsQuestion('Mot de passe (10 caractères minimum, lettres et chiffres)', 'court')
            ->expectsQuestion('Confirmez le mot de passe', 'court')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_it_resets_a_password_without_email(): void
    {
        $user = User::factory()->director()->create(['email' => 'directeur@example.com']);

        $this->artisan('pepiniere:reset-password', ['email' => 'directeur@example.com'])
            ->expectsQuestion('Nouveau mot de passe (10 caractères minimum, lettres et chiffres)', 'nouveau-mdp-2026')
            ->expectsQuestion('Confirmez le mot de passe', 'nouveau-mdp-2026')
            ->assertSuccessful();

        $this->assertTrue(Hash::check('nouveau-mdp-2026', $user->fresh()->password));
    }
}
