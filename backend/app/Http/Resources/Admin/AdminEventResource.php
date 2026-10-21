<?php

namespace App\Http\Resources\Admin;

use App\Enums\EventStatus;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\Concerns\LocalizedFields;
use App\Http\Resources\MediaResource;
use App\Models\SchoolEvent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * An event as edited in the admin.
 *
 * @mixin SchoolEvent
 */
class AdminEventResource extends JsonResource
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
            'status' => $this->status,
            'display_status' => $this->displayStatus(),
            'author' => $this->whenLoaded('author', fn () => $this->author ? ['id' => $this->author->id, 'name' => $this->author->name] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'can' => [
                'delete' => $gate->allows('delete', $this->resource),
                'restore' => $gate->allows('restore', $this->resource),
            ],
        ];
    }

    /** Upcoming, ongoing or past, in the school's timezone (same rule as the public list). */
    private function displayStatus(): string
    {
        if ($this->deleted_at !== null) {
            return 'trashed';
        }
        if ($this->status !== EventStatus::Published) {
            return $this->status->value;
        }

        $today = now(config('pepiniere.timezone'))->toDateString();
        $lastDay = ($this->end_date ?? $this->event_date)->toDateString();

        return match (true) {
            $lastDay < $today => 'past',
            $this->event_date->toDateString() <= $today => 'ongoing',
            default => 'upcoming',
        };
    }
}
