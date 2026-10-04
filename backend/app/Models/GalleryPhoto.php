<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

#[Fillable([
    'media_id', 'category_id', 'caption_fr', 'caption_en', 'alt_fr', 'alt_en',
    'sort_order', 'is_visible', 'uploaded_by',
])]
class GalleryPhoto extends Model
{
    use HasFactory, SoftDeletes;

    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(GalleryCategory::class, 'category_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /** Visible photo in a visible category. */
    #[Scope]
    protected function visible(Builder $query): void
    {
        $query->where('is_visible', true)
            ->whereHas('category', fn (Builder $query) => $query->where('is_visible', true));
    }
}
