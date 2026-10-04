<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** An album of the gallery, seeded with the official categories. */
#[Fillable(['slug', 'name_fr', 'name_en', 'cover_media_id', 'sort_order', 'is_visible'])]
class GalleryCategory extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    public function cover(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'cover_media_id');
    }

    public function photos(): HasMany
    {
        return $this->hasMany(GalleryPhoto::class, 'category_id');
    }
}
