<?php

namespace Tests\Feature\Admin;

use App\Enums\ContentStatus;
use App\Models\ActivityLog;
use App\Models\News;
use App\Models\NewsCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsManagementTest extends TestCase
{
    use RefreshDatabase;

    private function article(array $overrides = []): array
    {
        return [
            'title_fr' => 'Rentrée scolaire 2026–2027',
            'excerpt_fr' => 'Les informations utiles pour la rentrée.',
            'body_fr' => '<p>La rentrée aura lieu en septembre.</p>',
            'category_id' => NewsCategory::factory()->create()->id,
            'status' => 'draft',
            ...$overrides,
        ];
    }

    public function test_guests_cannot_manage_news(): void
    {
        $this->getJson('/api/admin/news')->assertUnauthorized();
        $this->postJson('/api/admin/news', [])->assertUnauthorized();
    }

    public function test_an_assistant_creates_a_draft_with_a_generated_address(): void
    {
        $assistant = User::factory()->create();

        $this->actingAs($assistant)->postJson('/api/admin/news', $this->article())
            ->assertCreated()
            ->assertJsonPath('data.slug', 'rentree-scolaire-2026-2027')
            ->assertJsonPath('data.status', 'draft')
            ->assertJsonPath('data.published_at', null)
            ->assertJsonPath('data.author.name', $assistant->name);

        $this->assertTrue(ActivityLog::query()->where('action', 'news.created')->exists());
        // A draft is not public.
        $this->getJson('/api/public/news')->assertJsonCount(0, 'data');
    }

    public function test_two_articles_with_the_same_title_get_distinct_addresses(): void
    {
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/admin/news', $this->article());

        $this->postJson('/api/admin/news', $this->article())->assertJsonPath('data.slug', 'rentree-scolaire-2026-2027-2');
    }

    public function test_the_assistant_publishes_directly_and_the_article_is_online(): void
    {
        $this->actingAs(User::factory()->create());

        $id = $this->postJson('/api/admin/news', $this->article(['status' => 'published']))
            ->assertCreated()
            ->assertJsonPath('data.is_scheduled', false)
            ->json('data.id');

        $this->assertNotNull(News::query()->find($id)->published_at);
        $this->getJson('/api/public/news')->assertJsonCount(1, 'data');
    }

    public function test_a_future_date_schedules_the_publication(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/news', $this->article([
            'status' => 'published',
            'published_at' => now()->addDays(2)->toIso8601String(),
        ]))->assertJsonPath('data.is_scheduled', true);

        $this->getJson('/api/public/news')->assertJsonCount(0, 'data');
        $this->getJson('/api/admin/news?status=scheduled')->assertJsonCount(1, 'data');
    }

    public function test_dangerous_html_is_removed_from_the_content(): void
    {
        $this->actingAs(User::factory()->create());

        $id = $this->postJson('/api/admin/news', $this->article([
            'body_fr' => '<p onclick="voler()">Bonjour <strong>à tous</strong></p><script>alert(1)</script>'
                .'<a href="javascript:alert(1)">piège</a><img src="x" onerror="y">',
        ]))->assertCreated()->json('data.id');

        $body = News::query()->find($id)->body_fr;
        $this->assertSame('<p>Bonjour <strong>à tous</strong></p><a rel="noopener noreferrer">piège</a>', $body);
    }

    public function test_an_empty_editor_is_not_accepted_as_content(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/admin/news', $this->article(['body_fr' => '<p></p>']))
            ->assertStatus(422)
            ->assertJsonPath('errors.body_fr.0', 'Le champ contenu (français) est obligatoire.');
    }

    public function test_validation_messages_are_in_french(): void
    {
        $this->actingAs(User::factory()->create())
            ->postJson('/api/admin/news', ['status' => 'draft'])
            ->assertStatus(422)
            ->assertJsonPath('errors.title_fr.0', 'Le champ titre (français) est obligatoire.');
    }

    public function test_the_list_filters_and_searches(): void
    {
        $this->actingAs(User::factory()->create());
        News::factory()->published()->create(['title_fr' => 'Journée portes ouvertes']);
        News::factory()->create(['title_fr' => 'Sortie au zoo']);
        News::factory()->create(['title_fr' => 'Fête de fin d\'année', 'status' => ContentStatus::Archived]);

        $this->getJson('/api/admin/news')->assertJsonCount(3, 'data');
        $this->getJson('/api/admin/news?status=draft')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title.fr', 'Sortie au zoo');
        $this->getJson('/api/admin/news?status=archived')->assertJsonCount(1, 'data');
        $this->getJson('/api/admin/news?q=portes')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title.fr', 'Journée portes ouvertes');
    }

    public function test_the_assistant_deletes_only_her_own_drafts(): void
    {
        $assistant = User::factory()->create();
        $ownDraft = News::factory()->create(['author_id' => $assistant->id]);
        $ownPublished = News::factory()->published()->create(['author_id' => $assistant->id]);
        $otherDraft = News::factory()->create(['author_id' => User::factory()->director()->create()->id]);
        $this->actingAs($assistant);

        $this->deleteJson("/api/admin/news/{$ownDraft->id}")->assertNoContent();
        $this->deleteJson("/api/admin/news/{$ownPublished->id}")
            ->assertForbidden()
            ->assertJsonPath('message', 'Seul le Directeur peut supprimer une actualité déjà publiée ou écrite par quelqu\'un d\'autre. Vous pouvez l\'archiver.');
        $this->deleteJson("/api/admin/news/{$otherDraft->id}")->assertForbidden();

        $this->assertSoftDeleted($ownDraft);
        $this->assertNotSoftDeleted($ownPublished);
    }

    public function test_the_director_deletes_and_restores_from_the_bin(): void
    {
        $news = News::factory()->published()->create();
        $this->actingAs(User::factory()->director()->create());

        $this->deleteJson("/api/admin/news/{$news->id}")->assertNoContent();
        $this->getJson('/api/admin/news?status=trashed')->assertJsonCount(1, 'data');
        $this->getJson('/api/public/news')->assertJsonCount(0, 'data');

        $this->postJson("/api/admin/news/{$news->id}/restore")->assertOk();
        $this->assertNotSoftDeleted($news);
    }

    public function test_the_assistant_cannot_see_the_bin_or_restore(): void
    {
        $news = News::factory()->create();
        $news->delete();
        $this->actingAs(User::factory()->create());

        $this->getJson('/api/admin/news?status=trashed')->assertForbidden();
        $this->postJson("/api/admin/news/{$news->id}/restore")->assertForbidden();
    }

    public function test_only_the_director_changes_the_address_of_a_published_article(): void
    {
        $news = News::factory()->published()->create(['slug' => 'ancienne-adresse']);
        $payload = [
            'title_fr' => $news->title_fr,
            'excerpt_fr' => $news->excerpt_fr,
            'body_fr' => $news->body_fr,
            'category_id' => $news->category_id,
            'status' => 'published',
            'slug' => 'nouvelle-adresse',
        ];

        $this->actingAs(User::factory()->create())
            ->putJson("/api/admin/news/{$news->id}", $payload)
            ->assertStatus(422)
            ->assertJsonValidationErrors('slug');
        $this->assertSame('ancienne-adresse', $news->fresh()->slug);

        $this->actingAs(User::factory()->director()->create())
            ->putJson("/api/admin/news/{$news->id}", $payload)
            ->assertOk()
            ->assertJsonPath('data.slug', 'nouvelle-adresse');
    }

    public function test_a_published_article_set_back_to_draft_keeps_its_publication_date(): void
    {
        $news = News::factory()->published()->create();
        $publishedAt = $news->published_at->toIso8601String();

        $this->actingAs(User::factory()->create())->putJson("/api/admin/news/{$news->id}", [
            'title_fr' => $news->title_fr,
            'excerpt_fr' => $news->excerpt_fr,
            'body_fr' => $news->body_fr,
            'category_id' => $news->category_id,
            'status' => 'draft',
            'published_at' => null,
        ])->assertOk()->assertJsonPath('data.published_at', $publishedAt);
    }
}
