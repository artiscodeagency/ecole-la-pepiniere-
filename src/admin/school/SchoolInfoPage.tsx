import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/admin/auth/useAuth";
import { Button } from "@/admin/components/Button";
import { FormAlert } from "@/admin/components/FormAlert";
import { PageHeader } from "@/admin/components/PageHeader";
import { SchoolSettingsForm } from "@/admin/school/SchoolSettingsForm";
import { SCHOOL_INFO_QUERY_KEY, type SchoolSettingsResponse } from "@/admin/school/types";
import { api } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";

export function SchoolInfoPage() {
  const { user } = useAuth();
  // The server refuses the others anyway; this only explains why.
  const allowed = Boolean(user?.abilities["manage-school-info"]);
  const settings = useQuery({
    queryKey: [...SCHOOL_INFO_QUERY_KEY, "settings"],
    queryFn: async () => (await api<{ data: SchoolSettingsResponse }>("/admin/school-info/settings")).data,
    enabled: allowed,
  });

  usePageMeta("Informations de l'école | Administration La Pépinière", "Coordonnées, horaires et informations pratiques de l'école.");

  return (
    <div>
      <PageHeader
        title="Informations de l'école"
        description="Les coordonnées et informations pratiques affichées sur le site. Réservé au Directeur."
      />

      {!allowed ? (
        <FormAlert tone="error">Cette page est réservée au Directeur.</FormAlert>
      ) : (
        <>
          <p className="rounded-btn bg-surface-alt px-4 py-3 text-sm text-ink-soft">
            Le site public affiche encore ses informations actuelles. Il utilisera celles-ci dès qu'il sera relié à
            l'administration.
          </p>

          <div className="mt-6">
            {settings.isPending ? (
              <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Chargement des informations…
              </p>
            ) : settings.isError ? (
              <div className="space-y-4">
                <FormAlert tone="error">{settings.error.message}</FormAlert>
                <Button onClick={() => void settings.refetch()}>Réessayer</Button>
              </div>
            ) : (
              <SchoolSettingsForm settings={settings.data} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
