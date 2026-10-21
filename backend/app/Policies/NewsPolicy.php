<?php

namespace App\Policies;

use App\Enums\ContentStatus;
use App\Models\News;
use App\Models\User;
use Illuminate\Auth\Access\Response;

/**
 * Both roles write, publish and archive news. Deleting is reserved to the
 * director, except an assistant's own drafts.
 */
class NewsPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, News $news): bool
    {
        return $user->is_active;
    }

    public function create(User $user): bool
    {
        return $user->is_active;
    }

    public function update(User $user, News $news): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, News $news): Response
    {
        if ($user->isDirector()) {
            return Response::allow();
        }
        if ($news->author_id === $user->id && $news->status === ContentStatus::Draft && ! self::hasBeenOnline($news)) {
            return Response::allow();
        }

        return Response::deny(
            'Seul le Directeur peut supprimer une actualité déjà publiée ou écrite par quelqu\'un d\'autre. Vous pouvez l\'archiver.'
        );
    }

    /** Deleted news can be listed and restored by the director only. */
    public function restore(User $user, News $news): bool
    {
        return $user->isDirector();
    }

    /** The address of an article that has been online may already be shared: only the director changes it. */
    public function changeSlug(User $user, News $news): bool
    {
        return $user->isDirector() || ! self::hasBeenOnline($news);
    }

    private static function hasBeenOnline(News $news): bool
    {
        return $news->published_at !== null && $news->published_at->isPast();
    }
}
