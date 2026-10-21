<?php

namespace App\Models;

use App\Enums\AdmissionStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Contains a child's personal data: only visible to signed-in staff. */
#[Fillable([
    'parent_name', 'child_name', 'child_birth_date', 'level_id', 'level_label', 'phone',
    'email', 'message', 'academic_year', 'status', 'handled_by', 'handled_at',
    'internal_note', 'ip_hash',
])]
#[Hidden(['ip_hash'])]
class AdmissionRequest extends Model
{
    protected function casts(): array
    {
        return [
            'status' => AdmissionStatus::class,
            'child_birth_date' => 'date',
            'handled_at' => 'datetime',
        ];
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(SchoolLevel::class, 'level_id');
    }

    public function handler(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}
