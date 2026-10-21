<?php

namespace App\Http\Requests\Admin;

use App\Enums\AnnouncementImportance;
use App\Enums\ContentStatus;
use App\Models\Announcement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/** Creating and updating an announcement send the whole form. */
class SaveAnnouncementRequest extends FormRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title_fr' => ['required', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'message_fr' => ['required', 'string', 'max:1000'],
            'message_en' => ['nullable', 'string', 'max:1000'],
            'importance' => ['required', Rule::enum(AnnouncementImportance::class)],
            'section_id' => ['nullable', 'integer', Rule::exists('sections', 'id')],
            'starts_at' => ['nullable', 'date'],
            // Mandatory: an announcement never stays online forever by mistake.
            'ends_at' => ['required', 'date'],
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'is_pinned' => ['boolean'],
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
            'message_fr' => 'message (français)',
            'message_en' => 'message (anglais)',
            'importance' => 'importance',
            'section_id' => 'section concernée',
            'starts_at' => 'date de début',
            'ends_at' => 'date de fin',
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
                if ($validator->errors()->hasAny(['starts_at', 'ends_at'])) {
                    return;
                }
                if (Carbon::parse($this->input('ends_at'))->lessThanOrEqualTo($this->startsAt())) {
                    $validator->errors()->add('ends_at', 'La date de fin doit être après la date de début.');
                }
            },
        ];
    }

    /**
     * Validated values; without a start date, the announcement starts now
     * (or keeps the start it already had).
     *
     * @return array<string, mixed>
     */
    public function announcementData(): array
    {
        return [
            ...$this->validated(),
            'starts_at' => $this->startsAt(),
            'is_pinned' => $this->boolean('is_pinned'),
        ];
    }

    private function startsAt(): Carbon
    {
        if ($this->filled('starts_at')) {
            return Carbon::parse($this->input('starts_at'));
        }
        $existing = $this->route('announcement');

        return $existing instanceof Announcement ? $existing->starts_at : now();
    }
}
