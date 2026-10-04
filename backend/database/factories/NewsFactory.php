<?php

namespace Database\Factories;

use App\Enums\ContentStatus;
use App\Models\News;
use App\Models\NewsCategory;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders.
 *
 * @extends Factory<News>
 */
class NewsFactory extends Factory
{
    public function definition(): array
    {
        return [
            'slug' => fake()->unique()->slug(4),
            'title_fr' => fake()->sentence(5),
            'title_en' => null,
            'excerpt_fr' => fake()->sentence(12),
            'body_fr' => '<p>'.fake()->paragraph().'</p>',
            'category_id' => NewsCategory::factory(),
            'status' => ContentStatus::Draft,
            'published_at' => null,
            'is_featured' => false,
        ];
    }

    public function published(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Published,
            'published_at' => now()->subDay(),
        ]);
    }

    /** Published, but with a publication date still to come. */
    public function scheduled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => ContentStatus::Published,
            'published_at' => now()->addDay(),
        ]);
    }
}
