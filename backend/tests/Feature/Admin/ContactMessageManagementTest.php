<?php

namespace Tests\Feature\Admin;

use App\Enums\MessageStatus;
use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactMessageManagementTest extends TestCase
{
    use RefreshDatabase;

    private function message(array $overrides = []): ContactMessage
    {
        return ContactMessage::query()->create([
            'name' => 'Marie Ngo',
            'email' => 'marie@example.com',
            'phone' => '694000000',
            'subject' => 'Visite de l\'école',
            'message' => "Bonjour,\npeut-on visiter l'école samedi ?",
            'status' => MessageStatus::New,
            ...$overrides,
        ]);
    }

    public function test_guests_cannot_read_messages(): void
    {
        $this->getJson('/api/admin/contact-messages')->assertUnauthorized();
    }

    public function test_the_list_shows_the_newest_first_with_counts_and_no_full_text(): void
    {
        $old = $this->message(['subject' => 'Ancien']);
        $old->forceFill(['created_at' => now()->subDays(3)])->save();
        $this->message(['subject' => 'Récent']);
        $this->message(['status' => MessageStatus::Handled]);

        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/contact-messages')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.2.subject', 'Ancien')
            ->assertJsonPath('data.0.message', null)
            ->assertJsonPath('data.0.excerpt', "Bonjour, peut-on visiter l'école samedi ?")
            ->assertJsonPath('counts', ['new' => 2, 'read' => 0, 'handled' => 1]);
    }

    public function test_filters_and_search(): void
    {
        $this->message(['name' => 'Paul Mbarga', 'subject' => 'Transport scolaire']);
        $this->message(['status' => MessageStatus::Handled]);
        $this->actingAs(User::factory()->create());

        $this->getJson('/api/admin/contact-messages?status=new')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/contact-messages?q=transport')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Paul Mbarga');
    }

    public function test_opening_a_new_message_marks_it_as_read(): void
    {
        $message = $this->message();

        $this->actingAs(User::factory()->create())
            ->getJson("/api/admin/contact-messages/{$message->id}")
            ->assertOk()
            ->assertJsonPath('data.status', 'read')
            ->assertJsonPath('data.message', "Bonjour,\npeut-on visiter l'école samedi ?");

        $this->assertNotNull($message->fresh()->read_at);
    }

    public function test_marking_as_handled_records_who_and_when(): void
    {
        $assistant = User::factory()->create(['name' => 'Assistante']);
        $message = $this->message();

        $this->actingAs($assistant)
            ->putJson("/api/admin/contact-messages/{$message->id}", ['status' => 'handled', 'internal_note' => 'Rappelée le 5 octobre.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'handled')
            ->assertJsonPath('data.handled_by', 'Assistante')
            ->assertJsonPath('data.internal_note', 'Rappelée le 5 octobre.');

        $this->putJson("/api/admin/contact-messages/{$message->id}", ['status' => 'new'])
            ->assertJsonPath('data.handled_by', null)
            ->assertJsonPath('data.read_at', null);
    }

    public function test_only_the_director_deletes_a_message(): void
    {
        $message = $this->message();

        $this->actingAs(User::factory()->create())->deleteJson("/api/admin/contact-messages/{$message->id}")->assertForbidden();
        $this->actingAs(User::factory()->director()->create())->deleteJson("/api/admin/contact-messages/{$message->id}")->assertNoContent();

        $this->assertModelMissing($message);
    }

    public function test_a_message_sent_from_the_site_reaches_the_admin(): void
    {
        $this->postJson('/api/public/contact-messages', [
            'name' => 'Marie Ngo', 'email' => 'marie@example.com', 'phone' => '694000000',
            'subject' => 'Inscription', 'message' => 'Bonjour',
        ])->assertCreated();

        $this->actingAs(User::factory()->create())
            ->getJson('/api/admin/contact-messages')
            ->assertJsonPath('data.0.subject', 'Inscription')
            ->assertJsonPath('data.0.status', 'new');
        $this->getJson('/api/admin/dashboard')->assertJsonPath('data.messages_unread', 1);
    }
}
