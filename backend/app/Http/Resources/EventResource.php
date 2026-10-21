<?php

namespace App\Http\Resources;

use App\Enums\EventStatus;
use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\SchoolEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin SchoolEvent */
class EventResource extends JsonResource
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
            'description' => $this->localized('description'),
            'event_date' => $this->event_date->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'start_time' => $this->start_time ? substr($this->start_time, 0, 5) : null,
            'end_time' => $this->end_time ? substr($this->end_time, 0, 5) : null,
            'location' => $this->localized('location'),
            'section' => CategoryResource::make($this->whenLoaded('section')),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'image' => MediaResource::make($this->whenLoaded('image')),
            'is_cancelled' => $this->status === EventStatus::Cancelled,
        ];
    }
}
