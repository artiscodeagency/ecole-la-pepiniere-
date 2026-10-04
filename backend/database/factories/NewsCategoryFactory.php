<?php

namespace Database\Factories;

use App\Models\NewsCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders.
 *
 * @extends Factory<NewsCategory>
 */
class NewsCategoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(2),
            'name_fr' => fake()->words(2, true),
            'name_en' => fake()->words(2, true),
            'sort_order' => 0,
        ];
    }
}
