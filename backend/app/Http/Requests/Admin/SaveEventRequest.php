<?php

namespace App\Http\Requests\Admin;

use App\Enums\EventStatus;
use App\Enums\MediaKind;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/** Creating and updating an event send the whole form. */
class SaveEventRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'description_fr' => ['required', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'event_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:event_date'],
            'start_time' => ['nullable', 'date_format:H:i'],
            'end_time' => ['nullable', 'date_format:H:i'],
            'location_fr' => ['nullable', 'string', 'max:255'],
            'location_en' => ['nullable', 'string', 'max:255'],
            'section_id' => ['nullable', 'integer', Rule::exists('sections', 'id')],
            'category_id' => ['nullable', 'integer', Rule::exists('news_categories', 'id')],
            'image_media_id' => ['nullable', 'integer', Rule::exists('media', 'id')->where('kind', MediaKind::Image->value)],
            'status' => ['required', Rule::enum(EventStatus::class)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'end_date.after_or_equal' => 'La date de fin doit être le même jour que la date de début, ou après.',
            'event_date.date_format' => 'Le champ date est invalide.',
            'start_time.date_format' => "L'heure de début est invalide.",
            'end_time.date_format' => "L'heure de fin est invalide.",
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
            'description_fr' => 'description (français)',
            'description_en' => 'description (anglais)',
            'event_date' => 'date',
            'end_date' => 'date de fin',
            'location_fr' => 'lieu (français)',
            'location_en' => 'lieu (anglais)',
            'section_id' => 'section concernée',
            'category_id' => 'catégorie',
            'image_media_id' => 'photo',
            'status' => 'statut',
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $sameDay = ! $this->filled('end_date') || $this->input('end_date') === $this->input('event_date');
                if (
                    $sameDay
                    && $this->filled(['start_time', 'end_time'])
                    && ! $validator->errors()->hasAny(['start_time', 'end_time'])
                    && $this->input('end_time') <= $this->input('start_time')
                ) {
                    $validator->errors()->add('end_time', "L'heure de fin doit être après l'heure de début.");
                }
            },
        ];
    }

    /**
     * Validated values; a one-day event stores no end date.
     *
     * @return array<string, mixed>
     */
    public function eventData(): array
    {
        $data = $this->validated();
        if (($data['end_date'] ?? null) === $data['event_date']) {
            $data['end_date'] = null;
        }

        return $data;
    }
}
