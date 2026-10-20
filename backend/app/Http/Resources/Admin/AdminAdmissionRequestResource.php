<?php

namespace App\Http\Resources\Admin;

use App\Models\AdmissionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/**
 * An admission request sent from the public admission form.
 *
 * @mixin AdmissionRequest
 */
class AdminAdmissionRequestResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $detailed = ! $request->routeIs('admin.admission-requests.index');

        return [
            'id' => $this->id,
            'parent_name' => $this->parent_name,
            'child_name' => $this->child_name,
            // A plain date: no time zone to shift it by a day.
            'child_birth_date' => $this->child_birth_date?->format('Y-m-d'),
            'child_age' => $this->child_birth_date?->age,
            // The official level when the form used the level list, otherwise
            // the level as the family wrote it (the official list is not set yet).
            'level' => $this->whenLoaded('level', fn () => $this->level?->name_fr) ?? $this->level_label,
            'phone' => $this->phone,
            'email' => $this->email,
            'message' => $this->when($detailed, $this->message),
            'academic_year' => $this->academic_year,
            'status' => $this->status,
            'handled_at' => $this->handled_at?->toIso8601String(),
            'handled_by' => $this->whenLoaded('handler', fn () => $this->handler?->name),
            'internal_note' => $this->when($detailed, $this->internal_note),
            'created_at' => $this->created_at?->toIso8601String(),
            'can' => ['delete' => Gate::forUser($request->user())->allows('delete', $this->resource)],
        ];
    }
}
