<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Support\ActivityLogger;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

use function Laravel\Prompts\password;

/** Resets a password from the server while the school has no mailbox for reset emails. */
#[Signature('pepiniere:reset-password {email : Adresse email du compte}')]
#[Description('Définit un nouveau mot de passe pour un compte et le déconnecte partout')]
class ResetUserPassword extends Command
{
    public function handle(): int
    {
        $user = User::query()->where('email', $this->argument('email'))->first();
        if ($user === null) {
            $this->error('Aucun compte ne correspond à cette adresse.');

            return self::FAILURE;
        }

        $data = [
            'password' => password('Nouveau mot de passe (10 caractères minimum, lettres et chiffres)', required: true),
            'password_confirmation' => password('Confirmez le mot de passe', required: true),
        ];
        $validator = Validator::make($data, ['password' => ['required', 'confirmed', Password::defaults()]]);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user->forceFill(['password' => $data['password']])->save();
        $user->endAllSessions();
        ActivityLogger::record('users.password_reset', $user, ['via' => 'console']);

        $this->info("Mot de passe mis à jour pour {$user->email}.");

        return self::SUCCESS;
    }
}
