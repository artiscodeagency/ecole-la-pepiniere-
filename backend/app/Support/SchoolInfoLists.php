<?php

namespace App\Support;

use App\Models\AdmissionFee;
use App\Models\RequiredDocument;
use App\Models\SchoolFee;
use App\Models\TransportTariff;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\Rule;

/**
 * The school information edited as short ordered lists (fees, documents to
 * provide, transport prices). Each list is saved as a whole by the admin.
 */
final class SchoolInfoLists
{
    public const MAX_ITEMS = 30;

    /** Amounts are whole FCFA; a ceiling catches a typo with extra zeros. */
    private const AMOUNT = ['integer', 'min:0', 'max:10000000'];

    /** @var array<string, class-string<Model>> */
    public const MODELS = [
        'school-fees' => SchoolFee::class,
        'admission-fees' => AdmissionFee::class,
        'required-documents' => RequiredDocument::class,
        'transport-tariffs' => TransportTariff::class,
    ];

    /** Settings stored with a list: the due dates of the two installments. */
    public const LIST_SETTINGS = [
        'school-fees' => ['fees.first_due_date', 'fees.second_due_date'],
    ];

    /**
     * Rules for one item, without the "items.*." prefix.
     *
     * @return array<string, mixed>
     */
    public static function itemRules(string $list): array
    {
        $section = ['nullable', 'integer', Rule::exists('sections', 'id')];
        $label = ['required', 'string', 'max:255'];
        $translation = ['nullable', 'string', 'max:255'];

        return match ($list) {
            'school-fees' => [
                'label_fr' => $label, 'label_en' => $translation, 'section_id' => $section,
                'first_installment' => ['required', ...self::AMOUNT],
                'second_installment' => ['required', ...self::AMOUNT],
            ],
            'admission-fees' => [
                'label_fr' => $label, 'label_en' => $translation, 'section_id' => $section,
                // Either an amount, or a text for what is not money ("two rolls of toilet paper").
                'amount' => ['nullable', 'required_without:items.*.amount_text_fr', 'prohibits:items.*.amount_text_fr', ...self::AMOUNT],
                'amount_text_fr' => ['nullable', 'required_without:items.*.amount', 'string', 'max:255'],
                'amount_text_en' => $translation,
            ],
            'required-documents' => [
                'label_fr' => $label, 'label_en' => $translation, 'section_id' => $section,
            ],
            'transport-tariffs' => [
                'amount' => ['required', ...self::AMOUNT],
                'label_fr' => $translation, 'label_en' => $translation,
            ],
        };
    }

    /**
     * @return list<string>
     */
    public static function fields(string $list): array
    {
        return array_keys(self::itemRules($list));
    }

    /**
     * French names of the fields, for the validation messages.
     *
     * @return array<string, string>
     */
    public static function attributes(): array
    {
        return [
            'items.*.label_fr' => 'libellé',
            'items.*.label_en' => 'libellé en anglais',
            'items.*.section_id' => 'section',
            'items.*.first_installment' => '1re tranche',
            'items.*.second_installment' => '2e tranche',
            'items.*.amount' => 'montant',
            'items.*.amount_text_fr' => 'texte',
            'items.*.amount_text_en' => 'texte en anglais',
            'due_dates.first' => 'date de la 1re tranche',
            'due_dates.second' => 'date de la 2e tranche',
        ];
    }
}
