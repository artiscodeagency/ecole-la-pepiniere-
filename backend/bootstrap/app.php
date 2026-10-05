<?php

use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Session cookies for the admin, which is served from the same domain.
        $middleware->statefulApi();
        $middleware->api(append: [SecurityHeaders::class]);
        $middleware->alias(['active' => EnsureUserIsActive::class]);
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*')
            ? null
            : config('pepiniere.admin_paths.login'));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Laravel does not translate these answers: give the admin French ones,
        // and never expose internal names (a 404 can name a model class).
        $exceptions->render(fn (AuthenticationException $e, Request $request) => $request->is('api/*')
            ? response()->json(['message' => 'Vous devez vous connecter.'], 401)
            : null);

        $exceptions->render(function (HttpExceptionInterface $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $message = match ($e->getStatusCode()) {
                // Keeps the French reasons given by the API itself (deactivated account...).
                403 => in_array($e->getMessage(), ['', 'This action is unauthorized.'], true)
                    ? "Vous n'avez pas accès à cette action."
                    : $e->getMessage(),
                404 => 'Élément introuvable.',
                405 => 'Action impossible sur cette adresse.',
                419 => 'Votre session a expiré. Rechargez la page.',
                429 => 'Trop de tentatives. Patientez un instant avant de réessayer.',
                default => null,
            };

            return $message === null
                ? null
                : response()->json(['message' => $message], $e->getStatusCode(), $e->getHeaders());
        });
    })->create();
