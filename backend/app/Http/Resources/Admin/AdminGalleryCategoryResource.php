<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Http\Resources\MediaResource;
use App\Models\GalleryCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * An album as managed in the admin, with its photo counts.
 *
 * @mixin GalleryCategory
 */
class AdminGalleryCategoryResource extends JsonResource
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
            'name' => $this->localized('name'),
            'is_visible' => $this->is_visible,
            'sort_order' => $this->sort_order,
            'photos_count' => $this->photos_count,
            'visible_photos_count' => $this->visible_photos_count,
            'cover' => MediaResource::make($this->whenLoaded('cover')),
            'can' => ['delete' => Gate::forUser($request->user())->allows('delete', $this->resource)],
        ];
    }
}
