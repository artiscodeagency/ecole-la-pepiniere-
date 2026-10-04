<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** Maternelle, primaire francophone, primaire anglophone. */
#[Fillable(['slug', 'name_fr', 'name_en', 'sort_order'])]
class Section extends Model
{
    use HasFactory;

    public function levels(): HasMany
    {
        return $this->hasMany(SchoolLevel::class)->orderBy('sort_order');
    }
}
