<?php

namespace Tests\Feature\Admin;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DocumentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
    }

    private function pdf(string $name = 'reglement.pdf', string $body = "%PDF-1.4\n%test\n"): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, $body)->mimeType('application/pdf');
    }

    /** @return array<string, mixed> */
    private function fields(array $overrides = []): array
    {
        return [
            'title_fr' => 'Règlement intérieur',
            'title_en' => 'Internal regulations',
            'type' => 'internal_rules',
            'is_public' => '1',
            ...$overrides,
        ];
    }

    public function test_guests_cannot_manage_documents(): void
    {
        $this->getJson('/api/admin/documents')->assertUnauthorized();
        $this->postJson('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()])->assertUnauthorized();
    }

    public function test_the_assistant_adds_a_pdf_and_the_site_lists_it(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.type', 'internal_rules')
            ->assertJsonPath('data.file.name', 'reglement.pdf');

        $document = Document::query()->with('media')->sole();
        $this->assertSame('application/pdf', $document->media->mime_type);
        $this->assertStringEndsWith('.pdf', $document->media->path);
        Storage::disk('media')->assertExists($document->media->path);

        $this->getJson('/api/public/documents')
            ->assertJsonPath('data.0.title.fr', 'Règlement intérieur')
            ->assertJsonPath('data.0.type', 'internal_rules');
    }

    public function test_a_file_that_is_not_a_pdf_is_refused_from_its_content(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/api/admin/documents', [
                ...$this->fields(),
                'file' => $this->pdf('faux.pdf', '<html><script>alert(1)</script></html>'),
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('documents', 0);
        $this->assertSame([], Storage::disk('media')->allFiles());
    }

    public function test_no_file_is_left_behind_when_the_document_cannot_be_saved(): void
    {
        // Any failure once the file is stored, such as the database refusing the row.
        Document::creating(fn () => throw new \RuntimeException('database down'));

        $this->actingAs(User::factory()->create())
            ->post('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()], ['Accept' => 'application/json'])
            ->assertServerError();

        $this->assertDatabaseCount('media', 0);
        $this->assertSame([], Storage::disk('media')->allFiles());
    }

    public function test_a_hidden_document_is_not_on_the_site(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/api/admin/documents', [...$this->fields(['is_public' => '0']), 'file' => $this->pdf()], ['Accept' => 'application/json'])
            ->assertCreated();

        $this->getJson('/api/public/documents')->assertJsonCount(0, 'data');
    }

    public function test_replacing_the_file_removes_the_old_one(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()], ['Accept' => 'application/json']);
        $document = Document::query()->with('media')->sole();
        $oldPath = $document->media->path;

        $this->post("/api/admin/documents/{$document->id}", [
            ...$this->fields(['title_fr' => 'Règlement intérieur 2026-2027']),
            '_method' => 'PUT',
            'file' => $this->pdf('reglement-2026.pdf'),
        ], ['Accept' => 'application/json'])
            ->assertOk()
            ->assertJsonPath('data.title.fr', 'Règlement intérieur 2026-2027')
            ->assertJsonPath('data.file.name', 'reglement-2026.pdf');

        Storage::disk('media')->assertMissing($oldPath);
        $this->assertDatabaseCount('media', 1);
    }

    public function test_editing_the_text_keeps_the_file(): void
    {
        $this->actingAs(User::factory()->create());
        $this->post('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()], ['Accept' => 'application/json']);
        $document = Document::query()->sole();

        $this->putJson("/api/admin/documents/{$document->id}", $this->fields(['type' => 'school_calendar', 'title_fr' => 'Calendrier']))
            ->assertOk()
            ->assertJsonPath('data.type', 'school_calendar')
            ->assertJsonPath('data.file.name', 'reglement.pdf');
    }

    public function test_the_assistant_removes_and_only_the_director_restores(): void
    {
        $assistant = User::factory()->create();
        $this->actingAs($assistant);
        $this->post('/api/admin/documents', [...$this->fields(), 'file' => $this->pdf()], ['Accept' => 'application/json']);
        $document = Document::query()->sole();

        $this->deleteJson("/api/admin/documents/{$document->id}")->assertNoContent();
        $this->getJson('/api/public/documents')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/documents?trashed=1')->assertForbidden();
        $this->postJson("/api/admin/documents/{$document->id}/restore")->assertForbidden();

        $this->actingAs(User::factory()->director()->create());
        $this->getJson('/api/admin/documents?trashed=1')->assertJsonCount(1, 'data');
        $this->postJson("/api/admin/documents/{$document->id}/restore")->assertOk();
        $this->getJson('/api/public/documents')->assertJsonCount(1, 'data');
    }

    public function test_the_fields_are_checked(): void
    {
        $this->actingAs(User::factory()->create())
            ->post('/api/admin/documents', ['title_fr' => '', 'type' => 'menu', 'is_public' => '1'], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title_fr', 'type', 'file'])
            ->assertJsonPath('errors.file.0', 'Choisissez le fichier PDF du document.');
    }
}
