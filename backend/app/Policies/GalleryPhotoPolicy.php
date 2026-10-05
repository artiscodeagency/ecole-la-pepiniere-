<?php

namespace App\Policies;

use App\Models\GalleryPhoto;
use App\Models\User;

/** Both roles add, edit and delete photos; the director restores them from the bin. */
class GalleryPhotoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, GalleryPhoto $photo): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, GalleryPhoto $photo): bool
    {
        return $user->is_active;
    }

    public function restore(User $user, GalleryPhoto $photo): bool
    {
        return $user->isDirector();
    }
}
