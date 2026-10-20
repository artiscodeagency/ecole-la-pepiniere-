<?php

namespace Tests\Feature\Console;

use App\Models\GalleryPhoto;
use Database\Seeders\ReferenceDataSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ImportGalleryPhotosTest extends TestCase
{
    use RefreshDatabase;

    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media');
        $this->seed(ReferenceDataSeeder::class);

        $this->directory = storage_path('framework/testing/import-gallery');
        File::ensureDirectoryExists($this->directory);
        foreach (['school-building.jpeg', 'children-outside.jpeg', 'WhatsApp Image 2026-09-20 at 23.12.21.jpeg'] as $name) {
            $image = imagecreatetruecolor(2400, 1600);
            imagejpeg($image, "{$this->directory}/{$name}");
        }
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->directory);
        parent::tearDown();
    }

    public function test_listed_photos_are_optimised_into_their_album_and_others_left_out(): void
    {
        $this->artisan('pepiniere:import-gallery', ['--dir' => $this->directory])->assertSuccessful();

        $photos = GalleryPhoto::query()->with(['media', 'category'])->get()->keyBy(fn (GalleryPhoto $photo) => $photo->media->original_name);
        $this->assertSame(['children-outside.jpeg', 'school-building.jpeg'], $photos->keys()->sort()->values()->all());
        $this->assertSame('batiments', $photos['school-building.jpeg']->category->slug);
        $this->assertSame('espaces-de-jeux', $photos['children-outside.jpeg']->category->slug);
        $this->assertSame('Photo – Bâtiments', $photos['school-building.jpeg']->alt_fr);
        $this->assertTrue($photos['school-building.jpeg']->is_visible);
        // Reduced to the largest stored size, as an upload in the admin.
        $this->assertSame(1920, $photos['school-building.jpeg']->media->width);
        Storage::disk('media')->assertExists($photos['school-building.jpeg']->media->variants['thumb']);
    }

    public function test_running_it_again_imports_nothing_twice(): void
    {
        $this->artisan('pepiniere:import-gallery', ['--dir' => $this->directory])->assertSuccessful();
        $this->artisan('pepiniere:import-gallery', ['--dir' => $this->directory])->assertSuccessful();

        $this->assertSame(2, GalleryPhoto::query()->count());
    }

    public function test_a_dry_run_imports_nothing(): void
    {
        $this->artisan('pepiniere:import-gallery', ['--dir' => $this->directory, '--dry-run' => true])
            ->expectsOutputToContain('Bâtiments ← school-building.jpeg')
            ->assertSuccessful();

        $this->assertSame(0, GalleryPhoto::query()->count());
    }
}
