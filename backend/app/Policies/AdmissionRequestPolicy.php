<?php

namespace App\Policies;

use App\Models\AdmissionRequest;
use App\Models\User;

/** Both roles read and handle admission requests; only the director deletes them. */
class AdmissionRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, AdmissionRequest $admissionRequest): bool
    {
        return $user->is_active;
    }

    public function update(User $user, AdmissionRequest $admissionRequest): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, AdmissionRequest $admissionRequest): bool
    {
        return $user->can('delete-inbox-items');
    }
}
