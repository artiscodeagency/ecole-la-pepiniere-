<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

/** Both roles add, replace and remove documents; only the director sees and restores removed ones. */
class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, Document $document): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, Document $document): bool
    {
        return $user->is_active;
    }

    public function restore(User $user, Document $document): bool
    {
        return $user->isDirector();
    }
}
