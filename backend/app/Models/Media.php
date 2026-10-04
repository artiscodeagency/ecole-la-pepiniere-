<?php

namespace App\Models;

use App\Enums\MediaKind;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/** A file uploaded by the school, stored on the persistent "media" disk. */
#[Fillable([
    'uuid', 'kind', 'path', 'variants', 'original_name', 'mime_type', 'size_bytes',
    'width', 'height', 'alt_fr', 'alt_en', 'uploaded_by',
])]
class Media extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'kind' => MediaKind::class,
            'variants' => 'array',
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** Public URL of a variant (thumb, medium, large, og), or of the main file. */
    public function url(?string $variant = null): string
    {
        $path = $variant !== null ? ($this->variants[$variant] ?? $this->path) : $this->path;

        return Storage::disk('media')->url($path);
    }

    /**
     * URLs of every stored version, keyed by variant name.
     *
     * @return array<string, string>
     */
    public function urls(): array
    {
        $urls = ['original' => $this->url()];
        foreach (array_keys($this->variants ?? []) as $variant) {
            $urls[$variant] = $this->url($variant);
        }

        return $urls;
    }
}
