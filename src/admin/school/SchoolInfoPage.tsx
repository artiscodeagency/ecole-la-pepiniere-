import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

import { useAuth } from "@/admin/auth/useAuth";
import { Button } from "@/admin/components/Button";
import { FormAlert } from "@/admin/components/FormAlert";
import { PageHeader } from "@/admin/components/PageHeader";
import { ListEditor } from "@/admin/school/ListEditor";
import { LISTS, type ListsResponse } from "@/admin/school/lists";
import { SchoolSettingsForm } from "@/admin/school/SchoolSettingsForm";
import { SCHOOL_INFO_QUERY_KEY, type SchoolSettingsResponse } from "@/admin/school/types";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { usePageMeta } from "@/lib/usePageMeta";

const TABS = [
  { value: "coordonnees", label: "Coordonnées et horaires" },
  { value: "frais", label: "Frais et inscription" },
] as const;

type Tab = (typeof TABS)[number]["value"];

/** Loading, error with a retry, or the content. */
function Loaded<T>({ query, children }: { query: { isPending: boolean; isError: boolean; error: Error | null; data: T | undefined; refetch: () => unknown }; children: (data: T) => ReactNode }) {
  if (query.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement des informations…
      </p>
    );
  }
  if (query.isError || query.data === undefined) {
    return (
      <div className="space-y-4">
        <FormAlert tone="error">{query.error?.message ?? "Le chargement a échoué."}</FormAlert>
        <Button onClick={() => void query.refetch()}>Réessayer</Button>
      </div>
    );
  }
  return <>{children(query.data)}</>;
}

export function SchoolInfoPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get("onglet") === "frais" ? "frais" : "coordonnees";
  // The server refuses the others anyway; this only explains why.
  const allowed = Boolean(user?.abilities["manage-school-info"]);

  const settings = useQuery({
    queryKey: [...SCHOOL_INFO_QUERY_KEY, "settings"],
    queryFn: async () => (await api<{ data: SchoolSettingsResponse }>("/admin/school-info/settings")).data,
    enabled: allowed && tab === "coordonnees",
  });
  const lists = useQuery({
    queryKey: [...SCHOOL_INFO_QUERY_KEY, "lists"],
    queryFn: async () => (await api<{ data: ListsResponse }>("/admin/school-info/lists")).data,
    enabled: allowed && tab === "frais",
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

          <div role="tablist" aria-label="Rubriques" className="mt-6 flex flex-wrap gap-1 border-b border-border-soft">
            {TABS.map((item) => (
              <button
                key={item.value}
                type="button"
                role="tab"
                aria-selected={tab === item.value}
                onClick={() => setParams(item.value === "coordonnees" ? {} : { onglet: item.value })}
                className={cn(
                  "-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                  tab === item.value ? "border-primary-dark text-primary-dark" : "border-transparent text-ink-soft hover:text-ink",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div role="tabpanel" className="mt-6">
            {tab === "coordonnees" ? (
              <Loaded query={settings}>{(data) => <SchoolSettingsForm settings={data} />}</Loaded>
            ) : (
              <Loaded query={lists}>
                {(data) => (
                  <div className="max-w-4xl space-y-6">
                    {LISTS.map((definition) => (
                      <ListEditor key={definition.name} definition={definition} data={data[definition.name]} />
                    ))}
                  </div>
                )}
              </Loaded>
            )}
          </div>
        </>
      )}
    </div>
  );
}
