<?php

namespace App\Http\Resources\Concerns;

/**
 * Exposes a bilingual column pair (title_fr / title_en) as {"fr": ..., "en": ...}.
 * A missing English text stays null: the site then shows the French one.
 */
trait LocalizedFields
{
    /**
     * @return array{fr: ?string, en: ?string}
     */
    protected function localized(string $field): array
    {
        return [
            'fr' => $this->resource->{$field.'_fr'},
            'en' => $this->resource->{$field.'_en'} ?: null,
        ];
    }
}
