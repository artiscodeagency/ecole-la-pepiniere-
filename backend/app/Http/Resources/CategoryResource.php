<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** A section or a news category: slug and bilingual name. */
class CategoryResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'name' => $this->localized('name'),
        ];
    }
}
