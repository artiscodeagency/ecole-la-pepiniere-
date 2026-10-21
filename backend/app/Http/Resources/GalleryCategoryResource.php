<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\GalleryCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GalleryCategory */
class GalleryCategoryResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // The chosen cover, or else the first visible photo of the category.
        $cover = $this->cover ?? $this->photos->first()?->media;

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->localized('name'),
            'photos_count' => $this->photos_count,
            'cover' => $cover ? MediaResource::make($cover) : null,
        ];
    }
}
