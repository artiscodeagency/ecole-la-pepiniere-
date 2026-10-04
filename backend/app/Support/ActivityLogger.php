<?php

namespace App\Support;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

final class ActivityLogger
{
    /**
     * Records an admin action. Never pass secrets (passwords, tokens) in $changes.
     *
     * @param  array<string, mixed>  $changes
     */
    public static function record(string $action, ?Model $subject = null, array $changes = [], ?User $user = null): void
    {
        ActivityLog::create([
            'user_id' => ($user ?? auth()->user())?->getKey(),
            'action' => $action,
            'subject_type' => $subject?->getMorphClass(),
            'subject_id' => $subject?->getKey(),
            'changes' => $changes ?: null,
            'ip_address' => request()->ip(),
        ]);
    }
}
