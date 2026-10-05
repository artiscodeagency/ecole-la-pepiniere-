<?php

namespace App\Console\Commands;

use App\Models\Media;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * An image uploaded in a form that was never saved stays unused. Once a day,
 * images older than a day that no content uses are deleted with their files.
 */
#[Signature('pepiniere:prune-media')]
#[Description('Supprime les images envoyées mais jamais utilisées')]
class PruneMedia extends Command
{
    /** Every column that can point to a media, including soft-deleted rows. */
    public const REFERENCES = [
        'news' => ['cover_media_id', 'og_media_id'],
        'events' => ['image_media_id'],
        'gallery_photos' => ['media_id'],
        'gallery_categories' => ['cover_media_id'],
        'documents' => ['media_id'],
        'staff_members' => ['photo_media_id'],
    ];

    public function handle(): int
    {
        $query = Media::query()->where('created_at', '<', now()->subDay());
        foreach (self::REFERENCES as $table => $columns) {
            foreach ($columns as $column) {
                $query->whereNotExists(fn ($sub) => $sub->from($table)->whereColumn("{$table}.{$column}", 'media.id'));
            }
        }

        $disk = Storage::disk('media');
        $count = 0;
        $query->each(function (Media $media) use ($disk, &$count) {
            $disk->delete(array_unique([$media->path, ...array_values($media->variants ?? [])]));
            $media->delete();
            $count++;
        });

        $this->info("{$count} image(s) inutilisée(s) supprimée(s).");

        return self::SUCCESS;
    }
}
