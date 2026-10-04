<?php

namespace Database\Factories;

use App\Enums\EventStatus;
use App\Models\SchoolEvent;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * Test data only: never used by the database seeders. Upcoming by default.
 *
 * @extends Factory<SchoolEvent>
 */
class SchoolEventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title_fr' => fake()->sentence(4),
            'description_fr' => fake()->sentence(12),
            'event_date' => now()->addWeek()->toDateString(),
            'start_time' => '08:00',
            'end_time' => '12:00',
            'status' => EventStatus::Published,
        ];
    }

    public function past(): static
    {
        return $this->state(fn (array $attributes) => ['event_date' => now()->subWeek()->toDateString()]);
    }
}
