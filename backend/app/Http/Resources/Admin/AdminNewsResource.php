<?php

namespace App\Http\Resources\Admin;

use App\Enums\ContentStatus;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\Concerns\LocalizedFields;
use App\Http\Resources\MediaResource;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * A news article as edited in the admin: raw values, no public fallbacks.
 *
 * @mixin News
 */
class AdminNewsResource extends JsonResource
{
    use LocalizedFields;

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gate = Gate::forUser($request->user());
        // The list does not need the (long) article bodies.
        $detailed = ! $request->routeIs('admin.news.index');

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->localized('title'),
            'excerpt' => $this->localized('excerpt'),
            'body' => $this->when($detailed, fn () => $this->localized('body')),
            'category' => CategoryResource::make($this->whenLoaded('category')),
            'cover' => MediaResource::make($this->whenLoaded('cover')),
            'status' => $this->status,
            'is_scheduled' => $this->status === ContentStatus::Published && $this->published_at?->isFuture() === true,
            'published_at' => $this->published_at?->toIso8601String(),
            'is_featured' => $this->is_featured,
            'seo' => $this->when($detailed, fn () => [
                'title' => $this->localized('seo_title'),
                'description' => $this->localized('seo_description'),
            ]),
            'author' => $this->whenLoaded('author', fn () => $this->author ? ['id' => $this->author->id, 'name' => $this->author->name] : null),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'can' => [
                'delete' => $gate->allows('delete', $this->resource),
                'restore' => $gate->allows('restore', $this->resource),
                'change_slug' => $gate->allows('changeSlug', $this->resource),
            ],
        ];
    }
}
