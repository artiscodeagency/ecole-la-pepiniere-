<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** A registration fee or item: an amount in FCFA, or a text when it is not money. */
#[Fillable(['label_fr', 'label_en', 'amount', 'amount_text_fr', 'amount_text_en', 'section_id', 'sort_order'])]
class AdmissionFee extends Model
{
    protected function casts(): array
    {
        return ['amount' => 'integer'];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }
}
