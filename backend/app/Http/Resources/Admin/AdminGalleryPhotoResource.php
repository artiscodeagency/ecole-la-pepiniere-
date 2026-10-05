<?php

namespace App\Http\Resources\Admin;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Http\Resources\MediaResource;
use App\Models\GalleryPhoto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * A gallery photo as managed in the admin.
 *
 * @mixin GalleryPhoto
 */
class AdminGalleryPhotoResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gate = Gate::forUser($request->user());

        return [
            'id' => $this->id,
            'caption' => $this->localized('caption'),
            'alt' => $this->localized('alt'),
            'category_id' => $this->category_id,
            'media' => MediaResource::make($this->whenLoaded('media')),
            'sort_order' => $this->sort_order,
            'is_visible' => $this->is_visible,
            'uploader' => $this->whenLoaded('uploader', fn () => $this->uploader?->name),
            'created_at' => $this->created_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'can' => [
                'delete' => $gate->allows('delete', $this->resource),
                'restore' => $gate->allows('restore', $this->resource),
            ],
        ];
    }
}
