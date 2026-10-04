<?php

namespace Tests\Feature;

use App\Models\GalleryCategory;
use App\Models\NewsCategory;
use App\Models\Section;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferenceDataSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_seeds_only_the_official_lists_and_can_run_twice(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(3, Section::query()->count());
        $this->assertSame(12, NewsCategory::query()->count());
        $this->assertSame(10, GalleryCategory::query()->count());
        // No account and no demo content.
        $this->assertSame(0, User::query()->count());

        $this->assertSame(
            ['batiments', 'Bâtiments', 'Buildings'],
            array_values(GalleryCategory::query()->orderBy('sort_order')->first()->only('slug', 'name_fr', 'name_en')),
        );
    }
}
