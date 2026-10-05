<?php

namespace App\Policies;

use App\Enums\ContentStatus;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Both roles write, publish and archive announcements. Deleting is reserved
 * to the director, except an assistant's own drafts.
 */
class AnnouncementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, Announcement $announcement): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, Announcement $announcement): Response
    {
        if ($user->isDirector()) {
            return Response::allow();
        }
        if ($announcement->author_id === $user->id && $announcement->status === ContentStatus::Draft) {
            return Response::allow();
        }

        return Response::deny(
            'Seul le Directeur peut supprimer une annonce déjà publiée ou créée par quelqu\'un d\'autre. Vous pouvez l\'archiver.'
        );
    }

    public function restore(User $user, Announcement $announcement): bool
    {
        return $user->isDirector();
    }
}
