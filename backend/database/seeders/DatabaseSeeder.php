<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database. No account and no demo content are
     * created: the first director is created with `php artisan pepiniere:create-director`.
     */
    public function run(): void
    {
        $this->call(ReferenceDataSeeder::class);
    }
}
