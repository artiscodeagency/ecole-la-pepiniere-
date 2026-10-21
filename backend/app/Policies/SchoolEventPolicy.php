<?php

namespace App\Policies;

use App\Enums\EventStatus;
use App\Models\SchoolEvent;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Both roles create, publish, cancel and archive events. Deleting is
 * reserved to the director, except an assistant's own drafts.
 */
class SchoolEventPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, SchoolEvent $event): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, SchoolEvent $event): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, SchoolEvent $event): Response
    {
        if ($user->isDirector()) {
            return Response::allow();
        }
        if ($event->author_id === $user->id && $event->status === EventStatus::Draft) {
            return Response::allow();
        }

        return Response::deny(
            'Seul le Directeur peut supprimer un événement déjà publié ou créé par quelqu\'un d\'autre. Vous pouvez l\'annuler ou l\'archiver.'
        );
    }

    public function restore(User $user, SchoolEvent $event): bool
    {
        return $user->isDirector();
    }
}
