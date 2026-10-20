<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Support\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function login(LoginRequest $request): UserResource
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();
        $user->forceFill(['last_login_at' => now()])->save();
        ActivityLogger::record('auth.login', $user, user: $user);

        return UserResource::make($user);
    }

    public function logout(Request $request): Response
    {
        ActivityLogger::record('auth.logout', $request->user());

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->noContent();
    }

    public function me(Request $request): UserResource
    {
        return UserResource::make($request->user());
    }

    /**
     * The signed-in user, or `data: null` for a guest. Called when the admin
     * opens, so that "not signed in yet" is an answer, not a 401 error.
     */
    public function session(Request $request): UserResource|JsonResponse
    {
        $user = $request->user('sanctum');

        return $user ? UserResource::make($user) : response()->json(['data' => null]);
    }

    public function updateProfile(Request $request): UserResource
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'string', 'email', 'max:190', Rule::unique('users')->ignore($user)],
            // Changing the sign-in address requires the current password.
            'current_password' => [
                Rule::requiredIf(fn () => $request->input('email') !== $user->email),
                'nullable', 'current_password:web',
            ],
        ]);

        $user->fill(['name' => $data['name'], 'email' => $data['email']])->save();
        ActivityLogger::record('auth.profile_updated', $user, $user->getChanges());

        return UserResource::make($user);
    }

    public function updatePassword(Request $request): Response
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password:web'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();
        $user->forceFill(['password' => $data['password']])->save();

        // Keeps this session, signs out every other device.
        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $user->getKey())
            ->where('id', '!=', $request->session()->getId())
            ->delete();
        ActivityLogger::record('auth.password_changed', $user);

        return response()->noContent();
    }
}
