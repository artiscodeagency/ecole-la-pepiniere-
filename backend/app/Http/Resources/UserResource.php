<?php

namespace App\Http\Resources;

use App\Models\User;
use App\Support\Abilities;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;

/** @mixin User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $gate = Gate::forUser($this->resource);

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            // For the admin menu only: every request is still checked on the server.
            'abilities' => collect(array_keys(Abilities::all()))
                ->mapWithKeys(fn (string $ability) => [$ability => $gate->allows($ability)]),
        ];
    }
}
