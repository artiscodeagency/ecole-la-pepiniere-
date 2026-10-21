<?php

namespace App\Policies;

use App\Models\GalleryCategory;
use App\Models\User;

/**
 * Both roles rename, reorder, hide and choose the cover of albums. Creating
 * and deleting albums changes the structure of the gallery: director only.
 */
class GalleryCategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->isDirector();
    }

    public function update(User $user, GalleryCategory $category): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, GalleryCategory $category): bool
    {
        return $user->isDirector();
    }
}
