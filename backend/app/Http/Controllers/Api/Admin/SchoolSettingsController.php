<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\ActivityLogger;
use App\Support\SchoolSettings;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;

/** Contacts, address, hours, social links and school year: director only. */
class SchoolSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return $this->response();
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate(SchoolSettings::rules($request->all()), [
            'after' => 'L\'heure de sortie doit être après l\'heure d\'arrivée.',
            'url' => 'Le :attribute doit être une adresse complète commençant par https://.',
        ], SchoolSettings::attributes());

        $stored = Setting::query()->whereIn('key', SchoolSettings::KEYS)->get()->keyBy('key');
        $changed = [];

        foreach (SchoolSettings::KEYS as $key) {
            $value = SchoolSettings::valueFor($validated, $key);
            $current = $stored->get($key);

            if ($value === null) {
                if ($current !== null) {
                    $current->delete();
                    $changed[] = $key;
                }

                continue;
            }
            if ($current?->value === $value) {
                continue;
            }
            Setting::query()->updateOrCreate(['key' => $key], ['value' => $value, 'updated_by' => $request->user()->id]);
            $changed[] = $key;
        }

        if ($changed !== []) {
            // Only the names of the fields: the values are public anyway.
            ActivityLogger::record('school-info.settings.updated', changes: ['fields' => $changed]);
        }

        return $this->response();
    }

    private function response(): JsonResponse
    {
        $settings = Setting::query()->whereIn('key', SchoolSettings::KEYS)->with('editor')->get();
        $values = [];
        foreach (SchoolSettings::KEYS as $key) {
            Arr::set($values, $key, $settings->firstWhere('key', $key)?->value);
        }
        $latest = $settings->sortByDesc('updated_at')->first();

        return response()->json(['data' => [
            'values' => $values,
            'updated_at' => $latest?->updated_at?->toIso8601String(),
            'updated_by' => $latest?->editor?->name,
        ]]);
    }
}
