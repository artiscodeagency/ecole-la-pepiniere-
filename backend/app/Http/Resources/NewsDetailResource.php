<?php

namespace App\Http\Resources;

use App\Models\News;
use Illuminate\Http\Request;

/** @mixin News */
class NewsDetailResource extends NewsResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $shareImage = $this->ogImage ?? $this->cover;

        return [
            ...parent::toArray($request),
            'body' => $this->localized('body'),
            'seo' => [
                // Falls back to the title and the excerpt when left empty.
                'title' => [
                    'fr' => $this->seo_title_fr ?: $this->title_fr,
                    'en' => $this->seo_title_en ?: $this->title_en ?: null,
                ],
                'description' => [
                    'fr' => $this->seo_description_fr ?: $this->excerpt_fr,
                    'en' => $this->seo_description_en ?: $this->excerpt_en ?: null,
                ],
                'image' => $shareImage?->url('og'),
            ],
        ];
    }
}
