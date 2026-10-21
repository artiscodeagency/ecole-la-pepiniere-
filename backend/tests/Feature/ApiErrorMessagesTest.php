<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiErrorMessagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_gets_a_french_message(): void
    {
        $this->getJson('/api/admin/dashboard')
            ->assertUnauthorized()
            ->assertExactJson(['message' => 'Vous devez vous connecter.']);
    }

    public function test_a_forbidden_action_gets_a_french_message(): void
    {
        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/users')
            ->assertForbidden()
            ->assertExactJson(['message' => "Vous n'avez pas accès à cette action."]);
    }

    public function test_the_reason_given_by_the_api_is_kept(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $user->update(['is_active' => false]);

        $this->getJson('/api/auth/me')->assertExactJson(['message' => 'Ce compte est désactivé.']);
    }

    public function test_a_missing_item_never_reveals_internal_names(): void
    {
        $this->actingAs(User::factory()->director()->create())
            ->getJson('/api/admin/users/999')
            ->assertNotFound()
            ->assertExactJson(['message' => 'Élément introuvable.']);

        $this->getJson('/api/public/news/inconnue')->assertExactJson(['message' => 'Élément introuvable.']);
        $this->getJson('/api/route-inconnue')->assertExactJson(['message' => 'Élément introuvable.']);
    }

    public function test_rate_limited_requests_keep_their_retry_delay(): void
    {
        $contact = [
            'name' => 'Parent', 'email' => 'parent@example.com', 'phone' => '694000000',
            'subject' => 'Visite', 'message' => 'Bonjour',
        ];
        // The public forms allow 20 sends per 10 minutes per IP (AppServiceProvider).
        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/public/contact-messages', $contact)->assertCreated();
        }

        $this->postJson('/api/public/contact-messages', $contact)
            ->assertTooManyRequests()
            ->assertHeader('Retry-After')
            ->assertExactJson(['message' => 'Trop de tentatives. Patientez un instant avant de réessayer.']);
    }
}
