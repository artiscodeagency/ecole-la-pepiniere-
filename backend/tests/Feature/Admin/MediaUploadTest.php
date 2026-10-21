<?php

namespace Tests\Feature\Admin;

use App\Models\Media;
use App\Models\News;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MediaUploadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media', ['url' => config('filesystems.disks.media.url')]);
    }

    public function test_a_phone_photo_is_stored_as_light_versions_without_the_original(): void
    {
        $this->actingAs(User::factory()->create());

        $response = $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->image('IMG_2041.jpg', 4000, 3000),
            'alt_fr' => 'Les élèves dans la cour',
        ])->assertCreated()
            ->assertJsonPath('data.width', 1920)
            ->assertJsonPath('data.height', 1440)
            ->assertJsonPath('data.alt.fr', 'Les élèves dans la cour');

        $media = Media::query()->sole();
        $disk = Storage::disk('media');
        foreach (['thumb' => [400, 300], 'medium' => [1024, 768], 'large' => [1920, 1440], 'og' => [1200, 630]] as $variant => [$width, $height]) {
            $disk->assertExists($media->variants[$variant]);
            $this->assertSame([$width, $height], array_slice(getimagesizefromstring($disk->get($media->variants[$variant])), 0, 2), $variant);
        }
        // Only the four versions: the original is not kept.
        $this->assertCount(4, $disk->allFiles());
        // Stored under a random name, never the visitor's file name.
        $this->assertStringNotContainsString('IMG_2041', implode(' ', $disk->allFiles()));
        $this->assertSame('http://localhost/media/'.$media->variants['thumb'], $response->json('data.urls.thumb'));
    }

    public function test_a_small_photo_is_not_enlarged(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('petite.png', 300, 200)])
            ->assertCreated()
            ->assertJsonPath('data.width', 300);
    }

    public function test_a_script_disguised_as_a_photo_is_refused_from_its_content(): void
    {
        $this->actingAs(User::factory()->create());
        // A real file, as in a real upload: its type is read from the content, not the ".jpg" name.
        // Harmless PHP on purpose: antivirus software (Windows Defender) blocks reading a
        // temp file that looks like a webshell, which made this test fail for that reason only.
        $path = tempnam(sys_get_temp_dir(), 'upload');
        file_put_contents($path, '<?php echo "pepiniere"; ?>');

        try {
            $this->assertSame('text/x-php', (new \finfo(FILEINFO_MIME_TYPE))->file($path));

            $this->postJson('/api/admin/media', [
                'file' => new UploadedFile($path, 'photo.jpg', null, null, true),
            ])->assertStatus(422)
                ->assertJsonPath('errors.file.0', 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.');

            $this->assertDatabaseCount('media', 0);
            $this->assertSame([], Storage::disk('media')->allFiles());
        } finally {
            @unlink($path);
        }
    }

    public function test_a_file_that_is_not_a_readable_image_is_refused(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/media', [
            'file' => UploadedFile::fake()->createWithContent('photo.jpg', 'pas une image'),
        ])->assertStatus(422)->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('media', 0);
    }

    public function test_svg_files_are_refused(): void
    {
        $this->actingAs(User::factory()->create());
        $svg = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>';

        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->createWithContent('logo.svg', $svg)])
            ->assertStatus(422);
    }

    public function test_guests_cannot_upload(): void
    {
        $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('photo.jpg')])->assertUnauthorized();
    }

    public function test_unused_uploads_are_pruned_after_a_day_but_used_ones_are_kept(): void
    {
        $this->actingAs(User::factory()->create());
        $unusedId = $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('a.jpg', 800, 600)])->json('data.id');
        $usedId = $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('b.jpg', 800, 600)])->json('data.id');
        $recentId = $this->postJson('/api/admin/media', ['file' => UploadedFile::fake()->image('c.jpg', 800, 600)])->json('data.id');
        News::factory()->create(['cover_media_id' => $usedId]);
        Media::query()->whereKey([$unusedId, $usedId])->update(['created_at' => now()->subDays(2)]);

        $this->artisan('pepiniere:prune-media')->assertSuccessful();

        $this->assertEqualsCanonicalizing([$usedId, $recentId], Media::query()->pluck('id')->all());
        $this->assertCount(8, Storage::disk('media')->allFiles());
    }
}
