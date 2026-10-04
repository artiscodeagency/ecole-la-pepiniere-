import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { AuthLayout } from "@/admin/components/AuthLayout";
import { FormAlert } from "@/admin/components/FormAlert";
import { TextField } from "@/admin/components/FormField";
import { SubmitButton } from "@/admin/components/SubmitButton";
import { PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

export function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  usePageMeta("Mot de passe oublié | Administration La Pépinière", "Réinitialisation du mot de passe.");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    setPending(true);
    setError(null);
    try {
      const { message } = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setSent(message);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthLayout
      title="Mot de passe oublié"
      description="Indiquez votre adresse email : un lien pour choisir un nouveau mot de passe vous sera envoyé."
    >
      {sent ? (
        <div className="space-y-5">
          <FormAlert tone="success">{sent}</FormAlert>
          <p className="text-sm leading-relaxed text-ink-soft">
            Rien reçu après quelques minutes ? Demandez au Directeur : il peut définir un nouveau mot de
            passe pour vous depuis l'administration.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {error && !error.field("email") && <FormAlert tone="error">{error.message}</FormAlert>}
          <TextField
            label="Adresse email"
            name="email"
            type="email"
            autoComplete="username"
            inputMode="email"
            required
            autoFocus
            error={error?.field("email")}
          />
          <SubmitButton pending={pending} pendingLabel="Envoi…">
            Envoyer le lien
          </SubmitButton>
        </form>
      )}
      <p className="mt-6 text-center text-sm">
        <Link to={PATHS.login} className="font-medium text-primary-dark transition-colors hover:text-ink">
          Retour à la connexion
        </Link>
      </p>
    </AuthLayout>
  );
}
