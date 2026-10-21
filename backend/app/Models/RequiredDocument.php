<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A document to provide for enrolment; empty section means every section. */
#[Fillable(['label_fr', 'label_en', 'section_id', 'sort_order'])]
class RequiredDocument extends Model
{
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
