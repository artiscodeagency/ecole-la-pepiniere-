<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\GalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin GalleryPhoto */
class GalleryPhotoResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'caption' => $this->localized('caption'),
            'alt' => $this->localized('alt'),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'media' => MediaResource::make($this->whenLoaded('media')),
        ];
    }
}
