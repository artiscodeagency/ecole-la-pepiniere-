<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;

#[Fillable(['name', 'email', 'password', 'role', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Defaults of a new account, readable before it is reloaded from the database.
     *
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
        'last_login_at' => null,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'is_active' => 'boolean',
        ];
    }

    public function isDirector(): bool
    {
        return $this->role === Role::Director;
    }

    /**
     * Whether this user is the only active director, who must never be
     * deactivated, demoted or deleted.
     */
    public function isLastActiveDirector(): bool
    {
        return $this->isDirector()
            && $this->is_active
            && static::query()->activeDirectors()->whereKeyNot($this->getKey())->doesntExist();
    }

    /** Signs the user out of every device (database session driver). */
    public function endAllSessions(): void
    {
        DB::table(config('session.table', 'sessions'))->where('user_id', $this->getKey())->delete();
    }

    #[Scope]
    protected function activeDirectors(Builder $query): void
    {
        $query->where('role', Role::Director)->where('is_active', true);
    }
}
