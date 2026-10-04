<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['question_fr', 'question_en', 'answer_fr', 'answer_en', 'sort_order', 'is_visible'])]
class FaqItem extends Model
{
    protected function casts(): array
    {
        return ['is_visible' => 'boolean'];
    }
}
