<?php

namespace Tests\Feature\Public;

use App\Models\Media;
use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewsSharePageTest extends TestCase
{
    use RefreshDatabase;

    private string $index;

    protected function setUp(): void
    {
        parent::setUp();

        // The built index.html, as Vite writes it (generic tags of the site).
        $this->index = tempnam(sys_get_temp_dir(), 'index');
        file_put_contents($this->index, <<<'HTML'
            <!doctype html>
            <html lang="fr">
              <head>
                <meta charset="UTF-8" />
                <meta
                  name="description"
                  content="Site description"
                />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="La Pépinière | Bertoua" />
                <title>La Pépinière | Bertoua</title>
                <script type="module" src="/assets/index.js"></script>
              </head>
              <body><div id="root"></div></body>
            </html>
            HTML);
        config(['pepiniere.spa_index' => $this->index, 'pepiniere.frontend_url' => 'https://lapepiniere.example']);
    }

    protected function tearDown(): void
    {
        @unlink($this->index);
        parent::tearDown();
    }

    public function test_a_shared_article_shows_its_own_title_description_and_image(): void
    {
        $cover = Media::factory()->create();
        News::factory()->published()->create([
            'slug' => 'rentree-2026',
            'title_fr' => 'Rentrée 2026',
            'excerpt_fr' => 'Les informations pour la rentrée.',
            'cover_media_id' => $cover->id,
        ]);

        $html = $this->get('/actualites/rentree-2026')->assertOk()->assertHeader('Content-Type', 'text/html; charset=UTF-8')->getContent();

        $this->assertStringContainsString('<title>Rentrée 2026 | La Pépinière</title>', $html);
        $this->assertStringContainsString('<meta property="og:title" content="Rentrée 2026" />', $html);
        $this->assertStringContainsString('<meta name="description" content="Les informations pour la rentrée." />', $html);
        $this->assertStringContainsString('<meta property="og:url" content="https://lapepiniere.example/actualites/rentree-2026" />', $html);
        $this->assertStringContainsString('<meta property="og:image" content="'.$cover->url('og').'" />', $html);
        // The site's generic tags are replaced, not duplicated; the app is still loaded.
        $this->assertSame(1, substr_count($html, '<title>'));
        $this->assertSame(1, substr_count($html, 'og:title'));
        $this->assertStringNotContainsString('Site description', $html);
        $this->assertStringContainsString('<script type="module" src="/assets/index.js"></script>', $html);
    }

    public function test_the_seo_fields_win_and_text_is_escaped(): void
    {
        News::factory()->published()->create([
            'slug' => 'fete',
            'title_fr' => 'Fête',
            'seo_title_fr' => 'La "grande" fête <script>',
            'seo_description_fr' => 'Venez & partagez',
        ]);

        $html = $this->get('/actualites/fete')->assertOk()->getContent();

        $this->assertStringContainsString('content="La &quot;grande&quot; fête &lt;script&gt;"', $html);
        $this->assertStringContainsString('content="Venez &amp; partagez"', $html);
        $this->assertStringNotContainsString('<script>', $html);
        $this->assertStringNotContainsString('og:image', $html);
    }

    public function test_an_unpublished_article_gets_the_site_with_a_404(): void
    {
        News::factory()->create(['slug' => 'brouillon', 'title_fr' => 'Brouillon secret']);
        News::factory()->scheduled()->create(['slug' => 'demain', 'title_fr' => 'Pas encore']);

        foreach (['brouillon', 'demain', 'inconnue'] as $slug) {
            $html = $this->get("/actualites/{$slug}")->assertNotFound()->getContent();
            $this->assertStringContainsString('<title>La Pépinière | Bertoua</title>', $html);
            $this->assertStringNotContainsString('Brouillon secret', $html);
        }
    }

    public function test_a_missing_build_is_reported(): void
    {
        config(['pepiniere.spa_index' => sys_get_temp_dir().'/does-not-exist.html']);

        $this->get('/actualites/quelque-chose')->assertServiceUnavailable();
    }
}
