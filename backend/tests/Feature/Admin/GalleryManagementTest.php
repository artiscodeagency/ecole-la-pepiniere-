<?php

namespace Tests\Feature\Admin;

use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class GalleryManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('media', ['url' => config('filesystems.disks.media.url')]);
    }

    private function upload(GalleryCategory $category, array $extra = []): GalleryPhoto
    {
        $id = $this->postJson('/api/admin/gallery/photos', [
            'file' => UploadedFile::fake()->image('photo.jpg', 1600, 1200),
            'category_id' => $category->id,
            ...$extra,
        ])->assertCreated()->json('data.id');

        return GalleryPhoto::query()->findOrFail($id);
    }

    public function test_guests_cannot_manage_the_gallery(): void
    {
        $this->getJson('/api/admin/gallery/categories')->assertUnauthorized();
        $this->getJson('/api/admin/gallery/photos')->assertUnauthorized();
    }

    public function test_an_uploaded_photo_goes_to_the_end_of_its_album_with_a_neutral_description(): void
    {
        $album = GalleryCategory::factory()->create(['name_fr' => 'Salles de classe', 'name_en' => 'Classrooms']);
        $this->actingAs(User::factory()->create());

        $first = $this->upload($album);
        $second = $this->upload($album, ['caption_fr' => 'Les CE1 en lecture']);

        $this->assertSame([1, 2], [$first->sort_order, $second->sort_order]);
        $this->assertSame('Photo – Salles de classe', $first->alt_fr);
        $this->assertSame('Photo – Classrooms', $first->alt_en);
        $this->assertSame('Les CE1 en lecture', $second->caption_fr);
        $this->getJson('/api/public/gallery/photos')->assertJsonCount(2, 'data');
    }

    public function test_a_file_that_is_not_an_image_is_refused(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/admin/gallery/photos', [
            'file' => UploadedFile::fake()->createWithContent('photo.jpg', 'pas une image'),
            'category_id' => $album->id,
        ])->assertStatus(422)->assertJsonValidationErrors('file');

        $this->assertDatabaseCount('gallery_photos', 0);
    }

    public function test_a_hidden_photo_leaves_the_public_gallery(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $photo = $this->upload($album);

        $this->patchJson("/api/admin/gallery/photos/{$photo->id}", ['is_visible' => false])
            ->assertOk()
            ->assertJsonPath('data.is_visible', false);

        $this->getJson('/api/public/gallery/photos')->assertJsonCount(0, 'data');
        $this->getJson("/api/admin/gallery/photos?category={$album->id}&visibility=hidden")->assertJsonCount(1, 'data');
    }

    public function test_photos_are_reordered_within_their_album_only(): void
    {
        $album = GalleryCategory::factory()->create();
        $other = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        [$a, $b, $c] = [$this->upload($album), $this->upload($album), $this->upload($album)];
        $foreign = $this->upload($other);

        $this->putJson('/api/admin/gallery/photos/order', ['category_id' => $album->id, 'ids' => [$c->id, $a->id, $b->id]])
            ->assertOk()
            ->assertJsonPath('data.0.id', $c->id);
        $this->assertSame([2, 3, 1], [$a->fresh()->sort_order, $b->fresh()->sort_order, $c->fresh()->sort_order]);

        $this->putJson('/api/admin/gallery/photos/order', ['category_id' => $album->id, 'ids' => [$foreign->id]])
            ->assertStatus(422);
    }

    public function test_a_photo_moves_one_place_before_or_after(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        [$a, $b, $c] = [$this->upload($album), $this->upload($album), $this->upload($album)];

        $this->postJson("/api/admin/gallery/photos/{$c->id}/move", ['direction' => 'before'])->assertOk();
        $this->postJson("/api/admin/gallery/photos/{$a->id}/move", ['direction' => 'before'])->assertOk(); // already first

        $order = GalleryPhoto::query()->where('category_id', $album->id)->orderBy('sort_order')->pluck('id')->all();
        $this->assertSame([$a->id, $c->id, $b->id], $order);
    }

    public function test_moving_a_photo_puts_it_at_the_end_of_the_new_album_and_frees_the_cover(): void
    {
        $album = GalleryCategory::factory()->create();
        $other = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $photo = $this->upload($album);
        $this->upload($other);
        $this->putJson("/api/admin/gallery/categories/{$album->id}", ['cover_media_id' => $photo->media_id])->assertOk();

        $this->patchJson("/api/admin/gallery/photos/{$photo->id}", ['category_id' => $other->id])->assertOk();

        $this->assertSame(2, $photo->fresh()->sort_order);
        $this->assertNull($album->fresh()->cover_media_id);
    }

    public function test_the_cover_must_be_a_photo_of_the_album(): void
    {
        $album = GalleryCategory::factory()->create();
        $other = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $foreign = $this->upload($other);

        $this->putJson("/api/admin/gallery/categories/{$album->id}", ['cover_media_id' => $foreign->media_id])
            ->assertStatus(422)
            ->assertJsonPath('errors.cover_media_id.0', 'La couverture doit être une photo de cet album.');
    }

    public function test_both_roles_rename_hide_and_reorder_albums(): void
    {
        $first = GalleryCategory::factory()->create(['sort_order' => 1]);
        $second = GalleryCategory::factory()->create(['sort_order' => 2]);
        $this->actingAs(User::factory()->create());

        $this->putJson("/api/admin/gallery/categories/{$first->id}", ['name_fr' => 'Bâtiments et cour', 'is_visible' => false])
            ->assertOk()
            ->assertJsonPath('data.name.fr', 'Bâtiments et cour')
            ->assertJsonPath('data.is_visible', false);

        $this->putJson('/api/admin/gallery/categories/order', ['ids' => [$second->id, $first->id]])
            ->assertOk()
            ->assertJsonPath('data.0.id', $second->id);
    }

    public function test_only_the_director_creates_and_deletes_albums(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/admin/gallery/categories', ['name_fr' => 'Kermesse 2026'])->assertForbidden();
        $this->deleteJson("/api/admin/gallery/categories/{$album->id}")->assertForbidden();

        $this->actingAs(User::factory()->director()->create());
        $this->postJson('/api/admin/gallery/categories', ['name_fr' => 'Kermesse 2026'])
            ->assertCreated()
            ->assertJsonPath('data.slug', 'kermesse-2026')
            ->assertJsonPath('data.photos_count', 0);
        $this->deleteJson("/api/admin/gallery/categories/{$album->id}")->assertNoContent();
    }

    public function test_an_album_with_photos_cannot_be_deleted(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->director()->create());
        $photo = $this->upload($album);
        $this->deleteJson("/api/admin/gallery/photos/{$photo->id}")->assertNoContent();

        // Even when its photos are only in the bin.
        $this->deleteJson("/api/admin/gallery/categories/{$album->id}")->assertStatus(422)->assertJsonValidationErrors('album');
    }

    public function test_the_assistant_deletes_photos_and_the_director_restores_them(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $photo = $this->upload($album);

        $this->deleteJson("/api/admin/gallery/photos/{$photo->id}")->assertNoContent();
        $this->getJson('/api/admin/gallery/photos?trashed=1')->assertForbidden();
        $this->postJson("/api/admin/gallery/photos/{$photo->id}/restore")->assertForbidden();

        $this->actingAs(User::factory()->director()->create());
        $this->getJson('/api/admin/gallery/photos?trashed=1')->assertJsonCount(1, 'data');
        $this->postJson("/api/admin/gallery/photos/{$photo->id}/restore")->assertOk();
        $this->getJson('/api/public/gallery/photos')->assertJsonCount(1, 'data');
    }

    public function test_photos_in_the_bin_keep_their_files_for_a_restore(): void
    {
        $album = GalleryCategory::factory()->create();
        $this->actingAs(User::factory()->create());
        $photo = $this->upload($album);
        $this->deleteJson("/api/admin/gallery/photos/{$photo->id}");
        $photo->media()->update(['created_at' => now()->subDays(3)]);

        $this->artisan('pepiniere:prune-media')->assertSuccessful();

        $this->assertCount(4, Storage::disk('media')->allFiles());
    }
}
