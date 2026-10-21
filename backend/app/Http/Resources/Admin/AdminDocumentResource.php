<?php

namespace App\Http\Resources\Admin;

use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/** @mixin Document */
class AdminDocumentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gate = Gate::forUser($request->user());

        return [
            'id' => $this->id,
            'title' => ['fr' => $this->title_fr, 'en' => $this->title_en],
            'description' => ['fr' => $this->description_fr, 'en' => $this->description_en],
            'type' => $this->type,
            'is_public' => $this->is_public,
            'file' => [
                'url' => $this->media->url(),
                'name' => $this->media->original_name,
                'size_bytes' => $this->media->size_bytes,
            ],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'deleted_at' => $this->deleted_at?->toIso8601String(),
            'can' => [
                'delete' => $gate->allows('delete', $this->resource),
                'restore' => $gate->allows('restore', $this->resource),
            ],
        ];
    }
}
