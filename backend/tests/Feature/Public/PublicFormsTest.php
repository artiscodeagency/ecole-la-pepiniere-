<?php

namespace Tests\Feature\Public;

use App\Models\AdmissionRequest;
use App\Models\ContactMessage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicFormsTest extends TestCase
{
    use RefreshDatabase;

    private const CONTACT = [
        'name' => 'Marie Ngo',
        'email' => 'marie@example.com',
        'phone' => '+237 694 00 00 00',
        'subject' => 'Visite',
        'message' => 'Bonjour, peut-on visiter l\'école ?',
    ];

    private const ADMISSION = [
        'parent_name' => 'Marie Ngo',
        'child_name' => 'Paul Ngo',
        'child_birth_date' => '2020-05-12',
        'level_label' => 'Maternelle',
        'phone' => '694000000',
        'email' => 'marie@example.com',
        'message' => 'Rentrée 2026–2027.',
    ];

    public function test_a_contact_message_is_stored_as_new(): void
    {
        $this->postJson('/api/public/contact-messages', self::CONTACT)->assertCreated();

        $message = ContactMessage::query()->sole();
        $this->assertSame('new', $message->status->value);
        $this->assertSame('Visite', $message->subject);
        // The IP is only kept as a keyed hash.
        $this->assertNotNull($message->ip_hash);
        $this->assertNotSame('127.0.0.1', $message->ip_hash);
    }

    public function test_invalid_contact_messages_are_refused_in_french(): void
    {
        $this->postJson('/api/public/contact-messages', [...self::CONTACT, 'email' => 'pas-un-email'])
            ->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Le champ email doit être une adresse email valide.');

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_robots_filling_the_hidden_field_are_ignored_silently(): void
    {
        $this->postJson('/api/public/contact-messages', [...self::CONTACT, 'website' => 'https://spam.example'])
            ->assertCreated();

        $this->assertDatabaseCount('contact_messages', 0);
    }

    public function test_forms_are_limited_to_twenty_submissions_per_ten_minutes(): void
    {
        for ($i = 0; $i < 20; $i++) {
            $this->postJson('/api/public/contact-messages', self::CONTACT)->assertCreated();
        }

        $this->postJson('/api/public/contact-messages', self::CONTACT)
            ->assertTooManyRequests()
            ->assertHeader('Retry-After')
            ->assertJsonPath('message', 'Trop de tentatives. Patientez un instant avant de réessayer.');
        $this->assertDatabaseCount('contact_messages', 20);
    }

    public function test_an_admission_request_is_stored_as_new(): void
    {
        $this->postJson('/api/public/admission-requests', self::ADMISSION)->assertCreated();

        $request = AdmissionRequest::query()->sole();
        $this->assertSame('new', $request->status->value);
        $this->assertSame('Maternelle', $request->level_label);
        $this->assertSame('2020-05-12', $request->child_birth_date->toDateString());
    }

    public function test_an_admission_request_needs_a_level_and_a_past_birth_date(): void
    {
        $this->postJson('/api/public/admission-requests', [
            ...self::ADMISSION,
            'level_label' => null,
            'child_birth_date' => now()->addDay()->toDateString(),
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['level_label', 'child_birth_date']);
    }
}
