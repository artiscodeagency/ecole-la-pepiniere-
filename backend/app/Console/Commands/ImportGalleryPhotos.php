<?php

namespace App\Console\Commands;

use App\Models\GalleryCategory;
use App\Models\GalleryPhoto;
use App\Models\Media;
use App\Services\ImageProcessor;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * One-off import of the photos built into the first version of the site
 * (src/assets) into the gallery, through the same optimisation as an upload
 * in the admin. Each file goes to the album listed below; files not listed
 * (the logo, photos without a matching album) are left out. Running it again
 * skips the files already imported.
 */
#[Signature('pepiniere:import-gallery {--dir= : Dossier des photos (par défaut : src/assets du site)} {--dry-run : Affiche le classement sans rien importer}')]
#[Description('Importe les photos d\'origine du site dans la galerie')]
class ImportGalleryPhotos extends Command
{
    /** File name => album slug, in the order the photos appear in each album. */
    public const ALBUMS = [
        'school-building.jpeg' => 'batiments',
        'school-building-upstair.jpeg' => 'batiments',
        'school-panel-with-children.jpeg' => 'batiments',
        'children-infront-school-intrance.jpeg' => 'batiments',
        'children-pointing-at-schoool-intrance.jpeg' => 'batiments',
        'children-poiting-at-school-intrance.jpeg' => 'batiments',

        'teacher-in-classroom.jpeg' => 'salles-de-classe',
        'teacher-in-class.jpeg' => 'salles-de-classe',
        'teacher-in-class..jpeg' => 'salles-de-classe',
        'teacher-in-class-with-child.jpeg' => 'salles-de-classe',
        'teacher-on-the-board.2.jpeg' => 'salles-de-classe',
        'teacher-onthe-board.jpeg' => 'salles-de-classe',
        'child-in-class.jpeg' => 'salles-de-classe',
        'child-in-class-2.jpeg' => 'salles-de-classe',
        'child-giving-a-tump-up.jpeg' => 'salles-de-classe',
        'a-child-seated.jpeg' => 'salles-de-classe',
        'a-child-seated-2.jpeg' => 'salles-de-classe',
        'a-child-seated-3.jpeg' => 'salles-de-classe',

        'teacher-photo-group-with-little-children.jpeg' => 'maternelle',
        'teacher-teaching-little-children.jpeg' => 'maternelle',
        'teacher-teaching-little-children..jpeg' => 'maternelle',
        'teacher-teaching-little-children-2.jpeg' => 'maternelle',
        'teacher-teaching-little-children-3.jpeg' => 'maternelle',
        'teacher-teaching-little-children-in-class.jpeg' => 'maternelle',
        'teacher-with-little-children-in-class.jpeg' => 'maternelle',
        'teacher-in-class-with-liitle-children.jpeg' => 'maternelle',
        'little-children-in-class.jpeg' => 'maternelle',
        'little-children-in-class..jpeg' => 'maternelle',
        'little-children-in-class...jpeg' => 'maternelle',
        'little-children-in-class....jpeg' => 'maternelle',
        'little-children-in-class-again.jpeg' => 'maternelle',
        'little-children-in-class-playing.jpeg' => 'maternelle',
        'little-children-seated-in-class.jpeg' => 'maternelle',
        'little-children-seated-in-class..jpeg' => 'maternelle',
        'little-child-in-class.jpeg' => 'maternelle',
        'little-child-in-class-playing.jpeg' => 'maternelle',
        'little-child-seated-in-class.jpeg' => 'maternelle',
        'little-child-seated-in-class..jpeg' => 'maternelle',
        'little-child-eating-in-class.jpeg' => 'maternelle',
        'two-little-children-in-class.jpeg' => 'maternelle',
        'bed-for-little-children.jpeg' => 'maternelle',
        'little-children-sleeping-on-bed.jpeg' => 'maternelle',

        'children-playing-outise.jpeg' => 'espaces-de-jeux',
        'children-outside.jpeg' => 'espaces-de-jeux',
        'children-outside-2.jpeg' => 'espaces-de-jeux',
        'children-outside-3.jpeg' => 'espaces-de-jeux',
        'children-outisde-4.jpeg' => 'espaces-de-jeux',
        'children-outside-girls.jpeg' => 'espaces-de-jeux',
        'childre-outside-class.jpeg' => 'espaces-de-jeux',
        'little-children-on-ballansoir.jpeg' => 'espaces-de-jeux',
        'little-children-outside.jpeg' => 'espaces-de-jeux',
        'little-children-outside-2.jpeg' => 'espaces-de-jeux',
        'little-children-girls-outside.jpeg' => 'espaces-de-jeux',
        'little-children-girls-outside..jpeg' => 'espaces-de-jeux',

        'teacher-photo-with-children.jpeg' => 'evenements-de-lecole',
    ];

    public function handle(ImageProcessor $images): int
    {
        $directory = rtrim($this->option('dir') ?: base_path('../src/assets'), '/\\');
        if (! is_dir($directory)) {
            $this->error("Dossier introuvable : {$directory}");

            return self::FAILURE;
        }

        $albums = GalleryCategory::query()->whereIn('slug', array_unique(self::ALBUMS))->get()->keyBy('slug');
        $missing = array_diff(array_unique(self::ALBUMS), $albums->keys()->all());
        if ($missing !== []) {
            $this->error('Albums introuvables (lancez le seeder) : '.implode(', ', $missing));

            return self::FAILURE;
        }

        $imported = $skipped = $absent = $failed = 0;
        foreach (self::ALBUMS as $file => $slug) {
            $path = $directory.DIRECTORY_SEPARATOR.$file;
            $album = $albums[$slug];

            if (! is_file($path)) {
                $this->warn("Absent : {$file}");
                $absent++;

                continue;
            }
            if ($this->alreadyImported($file)) {
                $skipped++;

                continue;
            }
            if ($this->option('dry-run')) {
                $this->line("{$album->name_fr} ← {$file}");

                continue;
            }

            try {
                $media = $images->store(new UploadedFile($path, $file, null, null, true), null);
                DB::transaction(fn () => GalleryPhoto::create([
                    'media_id' => $media->id,
                    'category_id' => $album->id,
                    // The same neutral description as an upload without one; never an invented one.
                    'alt_fr' => "Photo – {$album->name_fr}",
                    'alt_en' => $album->name_en ? "Photo – {$album->name_en}" : null,
                    'sort_order' => (int) GalleryPhoto::withTrashed()->where('category_id', $album->id)->max('sort_order') + 1,
                    'is_visible' => true,
                ]));
                $this->line("{$album->name_fr} ← {$file}");
                $imported++;
            } catch (Throwable $e) {
                $this->warn("Échec : {$file} ({$e->getMessage()})");
                $failed++;
            }
        }

        $this->info("Importées : {$imported} · déjà présentes : {$skipped} · absentes : {$absent} · échecs : {$failed}");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }

    /** A photo of the gallery (even in the bin) already made from this file. */
    private function alreadyImported(string $file): bool
    {
        return GalleryPhoto::withTrashed()
            ->whereIn('media_id', Media::query()->where('original_name', $file)->select('id'))
            ->exists();
    }
}
