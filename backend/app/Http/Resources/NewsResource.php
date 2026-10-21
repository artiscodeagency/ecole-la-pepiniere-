<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin News */
class NewsResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->localized('title'),
            'excerpt' => $this->localized('excerpt'),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'cover' => MediaResource::make($this->whenLoaded('cover')),
            'published_at' => $this->published_at?->toIso8601String(),
            'is_featured' => $this->is_featured,
        ];
    }
}
