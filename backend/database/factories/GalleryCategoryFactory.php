<?php

namespace Database\Factories;

use App\Models\GalleryCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders.
 *
 * @extends Factory<GalleryCategory>
 */
class GalleryCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'name_fr' => fake()->words(2, true),
            'name_en' => fake()->words(2, true),
            'sort_order' => 0,
            'is_visible' => true,
        ];
    }
}
