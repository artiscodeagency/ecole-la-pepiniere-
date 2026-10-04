<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/** A school transport price (whole FCFA); the label describes the distance band. */
#[Fillable(['amount', 'label_fr', 'label_en', 'sort_order'])]
class TransportTariff extends Model
{
    protected function casts(): array
    {
        return ['amount' => 'integer'];
    }
}
