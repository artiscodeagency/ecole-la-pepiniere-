<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdmissionRequest;
use App\Models\SchoolLevel;
use App\Models\Setting;
use App\Support\ActivityLogger;
use App\Support\SchoolInfoLists;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

/** Fees, documents to provide, transport prices, FAQ, team and levels: director only. */
class SchoolInfoListController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['data' => collect(SchoolInfoLists::MODELS)->keys()->mapWithKeys(
            fn (string $list) => [$list => $this->payload($list)],
        )]);
    }

    /** The whole list is sent: rows kept by id, new rows created, missing rows deleted. */
    public function update(Request $request, string $list): JsonResponse
    {
        abort_unless(isset(SchoolInfoLists::MODELS[$list]), 404);
        $model = SchoolInfoLists::MODELS[$list];

        $rules = ['items' => ['present', 'array', 'max:'.SchoolInfoLists::MAX_ITEMS]];
        $rules['items.*.id'] = ['nullable', 'integer', Rule::exists((new $model)->getTable(), 'id')];
        foreach (SchoolInfoLists::itemRules($list) as $field => $fieldRules) {
            $rules["items.*.$field"] = $fieldRules;
        }
        if ($list === 'school-fees') {
            $rules['due_dates'] = ['nullable', 'array'];
            $rules['due_dates.first'] = ['nullable', 'date_format:Y-m-d'];
            $rules['due_dates.second'] = ['nullable', 'date_format:Y-m-d', 'after:due_dates.first'];
        }

        $validated = $request->validate($rules, [
            'items.*.amount.required_without' => 'Indiquez un montant ou un texte.',
            'items.*.amount_text_fr.required_without' => 'Indiquez un montant ou un texte.',
            'items.*.amount.prohibits' => 'Indiquez un montant ou un texte, pas les deux.',
            'due_dates.second.after' => 'La 2e tranche doit être après la 1re.',
        ], SchoolInfoLists::attributes());

        DB::transaction(function () use ($validated, $model, $list, $request) {
            $keep = [];
            foreach ($validated['items'] as $index => $item) {
                $values = [...collect($item)->only(SchoolInfoLists::fields($list))->all(), 'sort_order' => $index + 1];
                $row = isset($item['id']) ? $model::query()->findOrFail($item['id']) : new $model;
                if ($list === 'school-levels' && ! $row->exists) {
                    // Made once: it stays the same when the level is renamed.
                    $row->code = $this->uniqueLevelCode($values['name_fr']);
                }
                $row->fill($values)->save();
                $keep[] = $row->id;
            }

            if ($list === 'school-levels') {
                // A request keeps the name of a level that is removed from the list.
                SchoolLevel::query()->whereNotIn('id', $keep)->each(fn (SchoolLevel $level) => AdmissionRequest::query()
                    ->where('level_id', $level->id)
                    ->update(['level_id' => null, 'level_label' => $level->name_fr]));
            }
            $model::query()->whereNotIn('id', $keep)->delete();

            if ($list === 'school-fees') {
                foreach (['first', 'second'] as $index => $which) {
                    $key = SchoolInfoLists::LIST_SETTINGS[$list][$index];
                    $date = $validated['due_dates'][$which] ?? null;
                    $date === null
                        ? Setting::query()->where('key', $key)->delete()
                        : Setting::query()->updateOrCreate(['key' => $key], ['value' => $date, 'updated_by' => $request->user()->id]);
                }
            }
        });

        ActivityLogger::record("school-info.$list.updated", changes: ['items' => count($validated['items'])]);

        return response()->json(['data' => $this->payload($list)]);
    }

    /** "class-1", or "class-1-2" when the name is already used. */
    private function uniqueLevelCode(string $name): string
    {
        $base = Str::slug($name) ?: 'niveau';
        $code = $base;
        for ($suffix = 2; SchoolLevel::query()->where('code', $code)->exists(); $suffix++) {
            $code = "{$base}-{$suffix}";
        }

        return $code;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(string $list): array
    {
        $model = SchoolInfoLists::MODELS[$list];
        $rows = $model::query()->orderBy('sort_order')->orderBy('id')->get();
        $payload = [
            'items' => $rows->map(fn ($row) => ['id' => $row->id, ...$row->only(SchoolInfoLists::fields($list))])->values(),
            'updated_at' => $rows->max('updated_at')?->toIso8601String(),
        ];

        if ($list === 'school-fees') {
            [$first, $second] = SchoolInfoLists::LIST_SETTINGS[$list];
            $payload['due_dates'] = ['first' => Setting::get($first), 'second' => Setting::get($second)];
        }

        return $payload;
    }
}
