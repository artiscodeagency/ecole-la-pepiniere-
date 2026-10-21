<?php

namespace Database\Factories;

use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders.
 *
 * @extends Factory<GalleryPhoto>
 */
class GalleryPhotoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'media_id' => Media::factory(),
            'category_id' => GalleryCategory::factory(),
            'alt_fr' => fake()->sentence(4),
            'sort_order' => 0,
            'is_visible' => true,
        ];
    }
}
