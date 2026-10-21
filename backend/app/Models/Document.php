<?php

namespace App\Models;

use App\Enums\DocumentType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/** A downloadable PDF: internal rules, school calendar, supplies list... */
#[Fillable([
    'title_fr', 'title_en', 'description_fr', 'description_en', 'type', 'media_id',
    'is_public', 'sort_order',
])]
class Document extends Model
{
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'type' => DocumentType::class,
            'is_public' => 'boolean',
        ];
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
