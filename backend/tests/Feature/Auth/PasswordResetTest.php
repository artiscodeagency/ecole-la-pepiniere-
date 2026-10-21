<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_answer_does_not_reveal_whether_an_account_exists(): void
    {
        Notification::fake();
        $user = User::factory()->create(['email' => 'assistante@example.com']);

        $known = $this->postJson('/api/auth/forgot-password', ['email' => 'assistante@example.com'])->assertOk();
        $unknown = $this->postJson('/api/auth/forgot-password', ['email' => 'inconnu@example.com'])->assertOk();

        $this->assertSame($known->json('message'), $unknown->json('message'));
        Notification::assertSentTo($user, ResetPassword::class);
        Notification::assertSentTimes(ResetPassword::class, 1);
    }

    public function test_the_reset_email_is_in_french_and_links_to_the_admin(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use ($user) {
            $mail = $notification->toMail($user);

            return $mail->subject === 'Réinitialisation de votre mot de passe'
                && $mail->actionText === 'Choisir un nouveau mot de passe'
                && str_starts_with($mail->actionUrl, 'http://localhost/admin/mot-de-passe/reinitialiser?token=');
        });
    }

    public function test_a_valid_token_sets_the_new_password(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->postJson('/api/auth/forgot-password', ['email' => $user->email]);

        $token = null;
        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token) {
            $token = $notification->token;

            return true;
        });

        $this->postJson('/api/auth/reset-password', [
            'token' => $token,
            'email' => $user->email,
            'password' => 'nouveau-mdp-2026',
            'password_confirmation' => 'nouveau-mdp-2026',
        ])->assertOk();

        $this->assertTrue(Hash::check('nouveau-mdp-2026', $user->fresh()->password));
    }

    public function test_an_invalid_token_is_refused(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/reset-password', [
            'token' => 'faux-jeton',
            'email' => $user->email,
            'password' => 'nouveau-mdp-2026',
            'password_confirmation' => 'nouveau-mdp-2026',
        ])->assertStatus(422)->assertJsonPath('errors.email.0', 'Ce lien de réinitialisation est invalide ou a expiré.');
    }

    public function test_a_weak_password_is_refused(): void
    {
        $user = User::factory()->create();

        $this->postJson('/api/auth/reset-password', [
            'token' => 'jeton',
            'email' => $user->email,
            'password' => 'court',
            'password_confirmation' => 'court',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    }
}
