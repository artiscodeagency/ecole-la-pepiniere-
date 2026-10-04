<?php

namespace Database\Factories;

use App\Enums\AnnouncementImportance;
use App\Enums\ContentStatus;
use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders. Active by default.
 *
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title_fr' => fake()->sentence(4),
            'message_fr' => fake()->sentence(12),
            'importance' => AnnouncementImportance::Info,
            'section_id' => null,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addWeek(),
            'status' => ContentStatus::Published,
            'is_pinned' => false,
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'starts_at' => now()->subWeeks(2),
            'ends_at' => now()->subMinute(),
        ]);
    }

    public function notStarted(): static
    {
        return $this->state(fn (array $attributes) => ['starts_at' => now()->addDay()]);
    }
}
