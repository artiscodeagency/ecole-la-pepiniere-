<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AdmissionStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\AdminAdmissionRequestResource;
use App\Models\AdmissionRequest;
use App\Support\ActivityLogger;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

/** Admission requests sent from the public admission form. */
class AdmissionRequestController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => ['nullable', Rule::enum(AdmissionStatus::class)],
            'q' => ['nullable', 'string', 'max:100'],
        ]);

        $admissions = AdmissionRequest::query()
            ->with(['level', 'handler'])
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->input('status')))
            ->when($request->filled('q'), function (Builder $query) use ($request) {
                $term = '%'.str_replace(['%', '_'], ['\%', '\_'], $request->string('q')->trim()).'%';
                $query->where(fn (Builder $query) => $query
                    ->where('parent_name', 'like', $term)
                    ->orWhere('child_name', 'like', $term)
                    ->orWhere('email', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('level_label', 'like', $term)
                    ->orWhereHas('level', fn (Builder $query) => $query->where('name_fr', 'like', $term)));
            })
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return AdminAdmissionRequestResource::collection($admissions)->additional(['counts' => $this->counts()]);
    }

    /** Unlike a message, opening a request does not change its status: "in progress" is set by hand. */
    public function show(AdmissionRequest $admissionRequest): AdminAdmissionRequestResource
    {
        return AdminAdmissionRequestResource::make($admissionRequest->load(['level', 'handler']));
    }

    public function update(Request $request, AdmissionRequest $admissionRequest): AdminAdmissionRequestResource
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::enum(AdmissionStatus::class)],
            'internal_note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ], [], ['internal_note' => 'note interne']);

        $admissionRequest->fill($data);
        if (isset($data['status'])) {
            // Who handled it, and when, is kept only while it is "handled".
            $handled = AdmissionStatus::from($data['status']) === AdmissionStatus::Handled;
            $admissionRequest->handled_by = $handled ? ($admissionRequest->handled_by ?? $request->user()->id) : null;
            $admissionRequest->handled_at = $handled ? ($admissionRequest->handled_at ?? now()) : null;
        }
        $admissionRequest->save();

        $changed = array_keys(collect($admissionRequest->getChanges())->except('updated_at')->all());
        if ($changed !== []) {
            ActivityLogger::record('admissions.updated', $admissionRequest, ['fields' => $changed, 'status' => $admissionRequest->status->value]);
        }

        return AdminAdmissionRequestResource::make($admissionRequest->load(['level', 'handler']));
    }

    public function destroy(AdmissionRequest $admissionRequest): Response
    {
        Gate::authorize('delete', $admissionRequest);

        $admissionRequest->delete();
        // No personal data in the log: the request is gone.
        ActivityLogger::record('admissions.deleted', $admissionRequest);

        return response()->noContent();
    }

    /**
     * @return array<string, int>
     */
    private function counts(): array
    {
        $counts = AdmissionRequest::query()->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return collect(AdmissionStatus::cases())
            ->mapWithKeys(fn (AdmissionStatus $status) => [$status->value => (int) ($counts[$status->value] ?? 0)])
            ->all();
    }
}
