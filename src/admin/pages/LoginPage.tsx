import { type FormEvent, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { AuthLayout } from "@/admin/components/AuthLayout";
import { FormAlert } from "@/admin/components/FormAlert";
import { PasswordField, TextField } from "@/admin/components/FormField";
import { SubmitButton } from "@/admin/components/SubmitButton";
import { PATHS } from "@/admin/paths";
import { ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

/** Only admin paths: never send the user to another site after signing in. */
function safeRedirect(from: unknown) {
  return typeof from === "string" && from.startsWith("/") && !from.startsWith("//")
    ? from
    : PATHS.home;
}

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = safeRedirect((location.state as { from?: unknown } | null)?.from);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  usePageMeta("Connexion | Administration La Pépinière", "Espace d'administration de La Pépinière.");

  if (status === "authenticated") {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      await login(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
      navigate(redirectTo, { replace: true });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught : new ApiError(0, "Une erreur inattendue est survenue."));
      setPending(false);
    }
  };

  // Wrong credentials come back on the email field; show them as one message.
  const message = error?.field("email") ?? error?.message;

  return (
    <AuthLayout
      title="Connexion"
      description="Accédez à l'espace de gestion du site de l'école."
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {message && <FormAlert tone="error">{message}</FormAlert>}
        <TextField
          label="Adresse email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          autoFocus
        />
        <PasswordField
          label="Mot de passe"
          name="password"
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end">
          <Link
            to={PATHS.forgotPassword}
            className="text-sm font-medium text-primary-dark transition-colors hover:text-ink"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <SubmitButton pending={pending} pendingLabel="Connexion…">
          Se connecter
        </SubmitButton>
      </form>
    </AuthLayout>
  );
}
