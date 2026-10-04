<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/** Director only (route middleware "can:manage-users"). */
class UserController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UserResource::collection(User::query()->orderBy('name')->get());
    }

    public function store(Request $request): UserResource
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:190', 'unique:users'],
            'role' => ['required', Rule::enum(Role::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([...$data, 'is_active' => true]);
        ActivityLogger::record('users.created', $user, $user->only('name', 'email', 'role'));

        return UserResource::make($user);
    }

    public function show(User $user): UserResource
    {
        return UserResource::make($user);
    }

    public function update(Request $request, User $user): UserResource
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:120'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:190', Rule::unique('users')->ignore($user)],
            'role' => ['sometimes', 'required', Rule::enum(Role::class)],
            'is_active' => ['sometimes', 'required', 'boolean'],
        ]);

        $losesDirectorAccess = (isset($data['role']) && $data['role'] !== Role::Director->value)
            || (isset($data['is_active']) && ! $data['is_active']);
        if ($losesDirectorAccess && $user->isDirector()) {
            $this->ensureDirectorRemains($request, $user);
        }

        $user->fill($data)->save();
        if (! $user->is_active) {
            $user->endAllSessions();
        }
        ActivityLogger::record('users.updated', $user, collect($user->getChanges())->except('updated_at')->all());

        return UserResource::make($user);
    }

    public function destroy(Request $request, User $user): Response
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['user' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }
        if ($user->isLastActiveDirector()) {
            throw ValidationException::withMessages(['user' => 'Il doit toujours rester au moins un Directeur actif.']);
        }

        $user->endAllSessions();
        ActivityLogger::record('users.deleted', $user, $user->only('name', 'email', 'role'));
        $user->delete();

        return response()->noContent();
    }

    /** For a colleague who lost their password while no school mailbox exists. */
    public function resetPassword(Request $request, User $user): Response
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages(['user' => 'Changez votre propre mot de passe depuis votre profil.']);
        }

        $data = $request->validate(['password' => ['required', 'confirmed', Password::defaults()]]);

        $user->forceFill(['password' => $data['password']])->save();
        $user->endAllSessions();
        ActivityLogger::record('users.password_reset', $user);

        return response()->noContent();
    }

    /**
     * @throws ValidationException
     */
    private function ensureDirectorRemains(Request $request, User $user): void
    {
        if ($user->is($request->user())) {
            throw ValidationException::withMessages([
                'user' => 'Vous ne pouvez pas retirer vos propres droits de Directeur ni désactiver votre compte.',
            ]);
        }
        if ($user->isLastActiveDirector()) {
            throw ValidationException::withMessages(['user' => 'Il doit toujours rester au moins un Directeur actif.']);
        }
    }
}
