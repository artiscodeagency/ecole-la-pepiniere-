<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Announcement */
class AnnouncementResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->localized('title'),
            'message' => $this->localized('message'),
            'importance' => $this->importance,
            // null: the whole school.
            'section' => CategoryResource::make($this->whenLoaded('section')),
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'is_pinned' => $this->is_pinned,
        ];
    }
}
