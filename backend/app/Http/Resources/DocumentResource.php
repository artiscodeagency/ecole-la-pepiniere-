<?php

namespace App\Http\Resources;

use App\Http\Resources\Concerns\LocalizedFields;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Document */
class DocumentResource extends JsonResource
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
            'type' => $this->type,
            'url' => $this->media->url(),
            'size_bytes' => $this->media->size_bytes,
        ];
    }
}
