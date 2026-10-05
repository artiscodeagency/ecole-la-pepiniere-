<?php

namespace App\Http\Requests\Admin;

use App\Enums\ContentStatus;
use App\Enums\MediaKind;
use App\Models\News;
use App\Services\RichText;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/** Creating and updating a news article send the whole form. */
class SaveNewsRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $news = $this->route('news');

        return [
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'excerpt_fr' => ['required', 'string', 'max:500'],
            'excerpt_en' => ['nullable', 'string', 'max:500'],
            'body_fr' => ['required', 'string', 'max:100000'],
            'body_en' => ['nullable', 'string', 'max:100000'],
            'category_id' => ['required', 'integer', Rule::exists('news_categories', 'id')],
            'cover_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')->where('kind', MediaKind::Image->value)],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'published_at' => ['nullable', 'date'],
            'is_featured' => ['boolean'],
            'slug' => [
                'nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                // Soft-deleted articles keep their address too.
                Rule::unique('news', 'slug')->ignore($news instanceof News ? $news->getKey() : null),
            ],
            'seo_title_fr' => ['nullable', 'string', 'max:255'],
            'seo_title_en' => ['nullable', 'string', 'max:255'],
            'seo_description_fr' => ['nullable', 'string', 'max:300'],
            'seo_description_en' => ['nullable', 'string', 'max:300'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'slug.regex' => "L'adresse ne peut contenir que des lettres minuscules sans accent, des chiffres et des tirets.",
            'slug.unique' => 'Une autre actualité utilise déjà cette adresse.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'title_fr' => 'titre (français)',
            'title_en' => 'titre (anglais)',
            'excerpt_fr' => 'résumé (français)',
            'excerpt_en' => 'résumé (anglais)',
            'body_fr' => 'contenu (français)',
            'body_en' => 'contenu (anglais)',
            'category_id' => 'catégorie',
            'cover_media_id' => 'image de couverture',
            'status' => 'statut',
            'published_at' => 'date de publication',
            'slug' => 'adresse',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                // An editor can send "<p></p>": that is no content.
                if (! $validator->errors()->has('body_fr') && RichText::isEmpty(RichText::sanitize($this->input('body_fr')))) {
                    $validator->errors()->add('body_fr', 'Le champ contenu (français) est obligatoire.');
                }
            },
        ];
    }

    /**
     * Validated values, with the HTML cleaned and the publication date set
     * to now when an article is published without one.
     *
     * @return array<string, mixed>
     */
    public function newsData(): array
    {
        $data = $this->validated();
        $data['body_fr'] = RichText::sanitize($data['body_fr']);
        $data['body_en'] = RichText::sanitize($data['body_en'] ?? null);
        $data['is_featured'] = (bool) ($data['is_featured'] ?? false);

        // Without a date, an article keeps the one it had: whether it has been online matters (see NewsPolicy).
        if (empty($data['published_at'])) {
            $existing = $this->route('news');
            $data['published_at'] = match (true) {
                $existing instanceof News && $existing->published_at !== null => $existing->published_at,
                $data['status'] === ContentStatus::Published->value => now(),
                default => null,
            };
        }

        unset($data['slug']);

        return $data;
    }
}
