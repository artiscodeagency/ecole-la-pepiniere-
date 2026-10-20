<?php

namespace App\Support;

use Closure;
use Illuminate\Validation\Rule;

/**
 * The school information edited as single values (contacts, address, hours,
 * social links, school year). Each key is one row of the settings table and
 * is read by the public site through /api/public/school-info.
 */
final class SchoolSettings
{
    /** Storage keys, in the shape the admin sends them (dots are nesting). */
    public const KEYS = [
        'contact.phones',
        'contact.whatsapp',
        'contact.whatsapp_primary',
        'contact.email',
        'location.address_fr',
        'location.address_en',
        'location.city',
        'hours.kindergarten',
        'hours.primary',
        'social.facebook',
        'social.instagram',
        'admissions.academic_year',
    ];

    private const PHONE = 'regex:/^[0-9+().\s-]{6,30}$/';

    /**
     * @param  array<string, mixed>  $input
     * @return array<string, mixed>
     */
    public static function rules(array $input): array
    {
        $rules = [
            'contact' => ['required', 'array'],
            'contact.phones' => ['present', 'array', 'max:4'],
            'contact.phones.*' => ['required', 'string', 'distinct', self::PHONE],
            'contact.whatsapp' => ['present', 'array', 'max:4'],
            'contact.whatsapp.*' => ['required', 'string', 'distinct', self::PHONE],
            // The number that receives the website forms must be one of the WhatsApp numbers.
            'contact.whatsapp_primary' => ['nullable', 'string', Rule::in(data_get($input, 'contact.whatsapp') ?: [])],
            'contact.email' => ['nullable', 'string', 'email', 'max:190'],
            'location' => ['required', 'array'],
            'location.address_fr' => ['nullable', 'string', 'max:255'],
            'location.address_en' => ['nullable', 'string', 'max:255'],
            'location.city' => ['nullable', 'string', 'max:100'],
            'hours' => ['required', 'array'],
            'social' => ['required', 'array'],
            'social.facebook' => ['nullable', 'string', 'url:https', 'max:255'],
            'social.instagram' => ['nullable', 'string', 'url:https', 'max:255'],
            'admissions' => ['required', 'array'],
            'admissions.academic_year' => ['nullable', 'string', 'regex:/^\d{4}-\d{4}$/', self::consecutiveYears()],
        ];

        foreach (['kindergarten', 'primary'] as $section) {
            $rules["hours.$section"] = ['nullable', 'array'];
            foreach (['mon_thu', 'friday'] as $days) {
                $path = "hours.$section.$days";
                $rules["$path.start"] = ['nullable', "required_with:$path.end", 'date_format:H:i'];
                $rules["$path.end"] = ['nullable', "required_with:$path.start", 'date_format:H:i', "after:$path.start"];
            }
        }

        return $rules;
    }

    /**
     * French names of the fields, for the validation messages.
     *
     * @return array<string, string>
     */
    public static function attributes(): array
    {
        $attributes = [
            'contact.phones.*' => 'numéro de téléphone',
            'contact.whatsapp.*' => 'numéro WhatsApp',
            'contact.whatsapp_primary' => 'numéro qui reçoit les formulaires',
            'contact.email' => 'adresse email',
            'location.address_fr' => 'adresse',
            'location.address_en' => 'adresse en anglais',
            'location.city' => 'ville',
            'social.facebook' => 'lien Facebook',
            'social.instagram' => 'lien Instagram',
            'admissions.academic_year' => 'année scolaire',
        ];
        foreach (['kindergarten', 'primary'] as $section) {
            foreach (['mon_thu', 'friday'] as $days) {
                $attributes["hours.$section.$days.start"] = 'heure d\'arrivée';
                $attributes["hours.$section.$days.end"] = 'heure de sortie';
            }
        }

        return $attributes;
    }

    /**
     * The value to store for a key: empty values are not stored at all.
     *
     * @param  array<string, mixed>  $validated
     */
    public static function valueFor(array $validated, string $key): mixed
    {
        $value = data_get($validated, $key);

        if (is_string($value)) {
            $value = trim(preg_replace('/\s+/', ' ', $value));
        }
        if (is_array($value) && array_is_list($value)) {
            $value = array_values(array_filter(array_map(fn ($item) => trim(preg_replace('/\s+/', ' ', (string) $item)), $value)));
        } elseif (is_array($value)) {
            // Opening hours: a day without both times is left out.
            $value = array_filter($value, fn ($times) => ! empty($times['start']) && ! empty($times['end']));
        }

        return $value === '' || $value === [] ? null : $value;
    }

    private static function consecutiveYears(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) {
            if (is_string($value) && preg_match('/^(\d{4})-(\d{4})$/', $value, $years) && (int) $years[2] !== (int) $years[1] + 1) {
                $fail('L\'année scolaire doit couvrir deux années qui se suivent, par exemple 2026-2027.');
            }
        };
    }
}
