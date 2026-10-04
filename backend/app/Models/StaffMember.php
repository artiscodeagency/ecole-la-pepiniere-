<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A member of the management team shown on the public site. */
#[Fillable(['name', 'role_fr', 'role_en', 'photo_media_id', 'sort_order', 'is_visible'])]
class StaffMember extends Model
{
    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }

    public function photo(): BelongsTo
    {
        return $this->belongsTo(Media::class, 'photo_media_id');
    }
}
