<?php

namespace Database\Seeders;

use App\Models\GalleryCategory;
use App\Models\NewsCategory;
use App\Models\Section;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Official reference lists, copied from the public site (src/data/school.ts).
 * Safe to run again: existing rows are updated by slug, never duplicated.
 * Levels, fees, contacts... are not seeded: they are migrated in stage 5,
 * once confirmed by the school.
 */
class ReferenceDataSeeder extends Seeder
{
    private const SECTIONS = [
        ['Maternelle', 'Nursery'],
        ['Primaire francophone', 'French-speaking primary'],
        ['Primaire anglophone', 'English-speaking primary'],
    ];

    private const NEWS_CATEGORIES = [
        ['Informations de rentrée', 'Back-to-school information'],
        ['Communiqués de la direction', 'Announcements from the management'],
        ['Journées portes ouvertes', 'Open days'],
        ['Excursions', 'Excursions'],
        ['Activités sportives', 'Sports activities'],
        ['Activités culturelles', 'Cultural activities'],
        ['Activités musicales', 'Music activities'],
        ['Activités agricoles', 'Agricultural activities'],
        ['Activités culinaires', 'Cooking activities'],
        ['Événements scolaires', 'School events'],
        ['Informations destinées aux parents', 'Information for parents'],
        ['Fêtes scolaires et remises des prix', 'School celebrations and prize-giving ceremonies'],
    ];

    private const GALLERY_CATEGORIES = [
        ['Bâtiments', 'Buildings'],
        ['Salles de classe', 'Classrooms'],
        ['Maternelle', 'Nursery'],
        ['Espaces de jeux', 'Play areas'],
        ['Salle informatique', 'Computer room'],
        ['Activités sportives', 'Sports activities'],
        ['Activités culturelles', 'Cultural activities'],
        ['Excursions', 'Excursions'],
        ['Journées portes ouvertes', 'Open days'],
        ["Événements de l'école", 'School events'],
    ];

    public function run(): void
    {
        $this->seed(Section::class, self::SECTIONS);
        $this->seed(NewsCategory::class, self::NEWS_CATEGORIES);
        $this->seed(GalleryCategory::class, self::GALLERY_CATEGORIES);
    }

    /**
     * @param  class-string<Model>  $model
     * @param  list<array{string, string}>  $names
     */
    private function seed(string $model, array $names): void
    {
        foreach ($names as $index => [$fr, $en]) {
            $model::query()->updateOrCreate(
                ['slug' => Str::slug($fr)],
                ['name_fr' => $fr, 'name_en' => $en, 'sort_order' => $index + 1],
            );
        }
    }
}
