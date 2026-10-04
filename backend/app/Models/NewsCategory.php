<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** The official news categories, also used by events. */
#[Fillable(['slug', 'name_fr', 'name_en', 'sort_order'])]
class NewsCategory extends Model
{
    use HasFactory;

    public function news(): HasMany
    {
        return $this->hasMany(News::class, 'category_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(SchoolEvent::class, 'category_id');
    }
}
