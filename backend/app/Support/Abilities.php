<?php

namespace App\Support;

use App\Models\User;
use Closure;

/**
 * Every permission of the admin, checked on the server for each request.
 * The admin interface only receives them to hide what is not allowed.
 */
final class Abilities
{
    /**
     * @return array<string, Closure(User): bool>
     */
    public static function all(): array
    {
        return [
            // News, announcements, events, gallery, documents, messages, admission requests.
            'manage-content' => fn (User $user) => $user->is_active,
            'delete-inbox-items' => fn (User $user) => $user->isDirector(),
            'manage-school-info' => fn (User $user) => $user->isDirector(),
            'manage-users' => fn (User $user) => $user->isDirector(),
            'view-activity-log' => fn (User $user) => $user->isDirector(),
        ];
    }
}
