<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\MediaResource;
use App\Models\AdmissionFee;
use App\Models\FaqItem;
use App\Models\RequiredDocument;
use App\Models\SchoolFee;
use App\Models\Section;
use App\Models\Setting;
use App\Models\StaffMember;
use App\Models\TransportTariff;
use Illuminate\Http\JsonResponse;

/**
 * Every school information shown on the public site, in one request:
 * the single source of truth for contacts, hours, fees, FAQ...
 */
class SchoolInfoController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $localized = fn ($model, string $field) => [
            'fr' => $model->{$field.'_fr'},
            'en' => $model->{$field.'_en'} ?: null,
        ];
        $sectionSlug = fn ($model) => $model->section?->slug;

        return response()->json(['data' => [
            // Keys prefixed "private." are never exposed. Always a JSON object, even when empty.
            'settings' => (object) Setting::query()->where('key', 'not like', 'private.%')->pluck('value', 'key')->all(),
            'sections' => Section::query()->orderBy('sort_order')->with('levels')->get()->map(fn (Section $section) => [
                ...CategoryResource::make($section)->resolve(),
                'levels' => $section->levels->where('is_active', true)->values()->map(fn ($level) => [
                    'id' => $level->id,
                    'code' => $level->code,
                    'name' => $localized($level, 'name'),
                ]),
            ]),
            'school_fees' => SchoolFee::query()->with('section')->orderBy('sort_order')->get()->map(fn (SchoolFee $fee) => [
                'label' => $localized($fee, 'label'),
                'section' => $sectionSlug($fee),
                'first_installment' => $fee->first_installment,
                'second_installment' => $fee->second_installment,
                'total' => $fee->total(),
            ]),
            'admission_fees' => AdmissionFee::query()->with('section')->orderBy('sort_order')->get()->map(fn (AdmissionFee $fee) => [
                'label' => $localized($fee, 'label'),
                'section' => $sectionSlug($fee),
                'amount' => $fee->amount,
                'amount_text' => $localized($fee, 'amount_text'),
            ]),
            'required_documents' => RequiredDocument::query()->with('section')->orderBy('sort_order')->get()->map(fn (RequiredDocument $document) => [
                'label' => $localized($document, 'label'),
                'section' => $sectionSlug($document),
            ]),
            'faq' => FaqItem::query()->where('is_visible', true)->orderBy('sort_order')->get()->map(fn (FaqItem $item) => [
                'question' => $localized($item, 'question'),
                'answer' => $localized($item, 'answer'),
            ]),
            'transport_tariffs' => TransportTariff::query()->orderBy('sort_order')->get()->map(fn (TransportTariff $tariff) => [
                'amount' => $tariff->amount,
                'label' => $localized($tariff, 'label'),
            ]),
            'staff' => StaffMember::query()->where('is_visible', true)->with('photo')->orderBy('sort_order')->get()->map(fn (StaffMember $member) => [
                'name' => $member->name,
                'role' => $localized($member, 'role'),
                'photo' => $member->photo ? MediaResource::make($member->photo)->resolve() : null,
            ]),
        ]]);
    }
}
