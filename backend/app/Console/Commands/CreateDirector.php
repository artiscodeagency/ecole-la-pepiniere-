<?php

namespace App\Console\Commands;

use App\Enums\Role;
use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;
use function Laravel\Prompts\text;

/** The site has no public sign-up: the first director account is created here. */
#[Signature('pepiniere:create-director')]
#[Description('Crée un compte Directeur')]
class CreateDirector extends Command
{
    public function handle(): int
    {
        $data = [
            'name' => text('Nom complet', required: true),
            'email' => text('Adresse email (identifiant de connexion)', required: true),
            'password' => password('Mot de passe (10 caractères minimum, lettres et chiffres)', required: true),
            'password_confirmation' => password('Confirmez le mot de passe', required: true),
        ];

        $validator = Validator::make($data, [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => Role::Director,
            'is_active' => true,
        ]);
        ActivityLogger::record('users.created', $user, [...$user->only('name', 'email', 'role'), 'via' => 'console']);

        $this->info("Compte Directeur créé pour {$user->email}.");

        return self::SUCCESS;
    }
}
