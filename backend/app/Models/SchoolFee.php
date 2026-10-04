<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Tuition of one section, in two installments (whole FCFA). */
#[Fillable(['section_id', 'label_fr', 'label_en', 'first_installment', 'second_installment', 'sort_order'])]
class SchoolFee extends Model
{
    protected function casts(): array
    {
        return [
            'first_installment' => 'integer',
            'second_installment' => 'integer',
        ];
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /** Computed, never stored, so it cannot drift from the installments. */
    public function total(): int
    {
        return $this->first_installment + $this->second_installment;
    }
}
