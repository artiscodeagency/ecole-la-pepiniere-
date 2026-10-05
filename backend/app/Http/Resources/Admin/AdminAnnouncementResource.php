<?php

namespace App\Http\Resources\Admin;

use App\Enums\ContentStatus;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * An announcement as edited in the admin.
 *
 * @mixin Announcement
 */
class AdminAnnouncementResource extends JsonResource
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
            'message' => $this->localized('message'),
            'importance' => $this->importance,
            'section' => CategoryResource::make($this->whenLoaded('section')),
            'starts_at' => $this->starts_at->toIso8601String(),
            'ends_at' => $this->ends_at->toIso8601String(),
            'status' => $this->status,
            'display_status' => $this->displayStatus(),
            'is_pinned' => $this->is_pinned,
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

    /** What the public sees right now: same rule as the public "active" scope. */
    private function displayStatus(): string
    {
        return match (true) {
            $this->deleted_at !== null => 'trashed',
            $this->status !== ContentStatus::Published => $this->status->value,
            $this->starts_at->isFuture() => 'scheduled',
            $this->ends_at->isPast() => 'expired',
            default => 'active',
        };
    }
}
