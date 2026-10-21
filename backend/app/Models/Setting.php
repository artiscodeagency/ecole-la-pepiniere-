<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A school information value (contacts, address, hours, social links...).
 * This table is the single source of truth for those values.
 */
#[Fillable(['key', 'value', 'updated_by'])]
class Setting extends Model
{
    protected function casts(): array
    {
        return ['value' => 'json'];
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return static::query()->where('key', $key)->value('value') ?? $default;
    }
}
