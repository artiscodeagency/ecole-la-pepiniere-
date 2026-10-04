<?php

namespace App\Providers;

use App\Support\Abilities;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Model::shouldBeStrict(! $this->app->isProduction());

        foreach (Abilities::all() as $ability => $check) {
            Gate::define($ability, $check);
        }

        Password::defaults(fn () => Password::min(config('pepiniere.passwords.min_length'))->letters()->numbers());

        ResetPassword::createUrlUsing(fn ($user, string $token) => config('pepiniere.frontend_url')
            .config('pepiniere.admin_paths.reset_password')
            .'?'.http_build_query(['token' => $token, 'email' => $user->getEmailForPasswordReset()]));

        // Per IP. The login also has a per-account limit (see LoginRequest).
        RateLimiter::for('login', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));
        RateLimiter::for('password-reset', fn (Request $request) => Limit::perMinute(3)->by($request->ip()));
        RateLimiter::for('public-forms', fn (Request $request) => Limit::perMinutes(10, 5)->by($request->ip()));
    }
}
