<?php

namespace Database\Factories;

use App\Enums\MediaKind;
use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Test data only: never used by the database seeders.
 *
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    public function definition(): array
    {
        $uuid = (string) Str::uuid();

        return [
            'uuid' => $uuid,
            'kind' => MediaKind::Image,
            'path' => "2026/10/{$uuid}-1920.webp",
            'variants' => [
                'thumb' => "2026/10/{$uuid}-400.webp",
                'medium' => "2026/10/{$uuid}-1024.webp",
                'large' => "2026/10/{$uuid}-1920.webp",
                'og' => "2026/10/{$uuid}-og.jpg",
            ],
            'mime_type' => 'image/webp',
            'size_bytes' => 250_000,
            'width' => 1920,
            'height' => 1440,
            'alt_fr' => fake()->sentence(4),
            'alt_en' => null,
        ];
    }
}
