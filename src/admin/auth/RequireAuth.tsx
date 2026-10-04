import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { FullPageStatus } from "@/admin/components/FullPageStatus";
import { PATHS } from "@/admin/paths";

/** Shows the admin pages only with a valid session; otherwise sends to the login page. */
export function RequireAuth() {
  const { status, retry } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <FullPageStatus loading message="Chargement de votre espace…" />;
  }
  if (status === "error") {
    return (
      <FullPageStatus
        message="Impossible de joindre le serveur. Vérifiez votre connexion internet."
        actionLabel="Réessayer"
        onAction={retry}
      />
    );
  }
  if (status === "guest") {
    return (
      <Navigate
        to={PATHS.login}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}
