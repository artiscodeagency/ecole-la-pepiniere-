<?php

namespace Tests\Feature\Public;

use App\Models\News;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SeoFilesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['pepiniere.frontend_url' => 'https://lapepiniere.example']);
    }

    public function test_robots_hides_admin_and_api_and_points_to_the_sitemap(): void
    {
        $response = $this->get('/robots.txt')->assertOk();

        $this->assertStringStartsWith('text/plain', $response->headers->get('Content-Type'));
        $response->assertSee('Disallow: /admin', false)
            ->assertSee('Disallow: /api/', false)
            ->assertSee('Sitemap: https://lapepiniere.example/sitemap.xml', false);
    }

    public function test_sitemap_lists_public_pages_and_published_articles_only(): void
    {
        News::factory()->published()->create(['slug' => 'rentree-2026']);
        News::factory()->create(['slug' => 'brouillon']);
        News::factory()->scheduled()->create(['slug' => 'demain']);

        $response = $this->get('/sitemap.xml')->assertOk();

        $this->assertStringStartsWith('application/xml', $response->headers->get('Content-Type'));
        $xml = simplexml_load_string($response->getContent());
        $this->assertNotFalse($xml, 'sitemap is valid XML');

        $locs = array_map('strval', $xml->xpath('//*[local-name()="loc"]'));
        $this->assertContains('https://lapepiniere.example/', $locs);
        $this->assertContains('https://lapepiniere.example/contact', $locs);
        $this->assertContains('https://lapepiniere.example/actualites/rentree-2026', $locs);
        $this->assertNotContains('https://lapepiniere.example/actualites/brouillon', $locs);
        $this->assertNotContains('https://lapepiniere.example/actualites/demain', $locs);
        $this->assertEmpty(array_filter($locs, fn ($loc) => str_contains($loc, '/admin')));
    }
}
