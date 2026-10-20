<?php

namespace App\Policies;

use App\Models\ContactMessage;
use App\Models\User;

/** Both roles read and handle messages; only the director deletes them. */
class ContactMessagePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->is_active;
    }

    public function view(User $user, ContactMessage $message): bool
    {
        return $user->is_active;
    }

    public function update(User $user, ContactMessage $message): bool
    {
        return $user->is_active;
    }

    public function delete(User $user, ContactMessage $message): bool
    {
        return $user->can('delete-inbox-items');
    }
}
