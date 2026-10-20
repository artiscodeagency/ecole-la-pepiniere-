import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  type AdminAdmissionRequest,
  type AdmissionStatus,
  ADMISSIONS_QUERY_KEY,
  formatBirthDate,
} from "@/admin/admissions/types";
import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { TextAreaField } from "@/admin/components/FormField";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import { formatDateTime } from "@/admin/lib/dates";
import { PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";

const STATUS_OPTIONS: RadioCardOption<AdmissionStatus>[] = [
  { value: "new", label: "Nouvelle", description: "Pas encore prise en charge : comptée dans le tableau de bord." },
  { value: "in_progress", label: "En cours", description: "La famille a été contactée, le dossier suit son cours." },
  { value: "handled", label: "Traitée", description: "Le dossier est terminé." },
];

const contactLinkClasses =
  "inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt";

function AdmissionView({ admission }: { admission: AdminAdmissionRequest }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(admission.status);
  const [note, setNote] = useState(admission.internal_note ?? "");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = status !== admission.status || note !== (admission.internal_note ?? "");

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: [...ADMISSIONS_QUERY_KEY, "list"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  const save = useMutation({
    mutationFn: () =>
      api<{ data: AdminAdmissionRequest }>(`/admin/admission-requests/${admission.id}`, {
        method: "PUT",
        body: { status, internal_note: note || null },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData([...ADMISSIONS_QUERY_KEY, "detail", admission.id], data);
      refreshLists();
      setSaved(true);
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/admin/admission-requests/${admission.id}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshLists();
      navigate(PATHS.admissions, { replace: true });
    },
  });

  const subject = `Demande d'inscription de ${admission.child_name}`;
  const reply = `mailto:${admission.email}?subject=${encodeURIComponent(subject)}`;
  const greeting = `Bonjour ${admission.parent_name}, nous avons bien reçu votre demande d'inscription pour ${admission.child_name}.`;
  const error = save.error ?? remove.error;

  return (
    <div>
      <PageHeader title={admission.child_name} back={{ to: PATHS.admissions, label: "Demandes d'inscription" }} />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Demande mise à jour.</FormAlert>}
        {error && <FormAlert tone="error">{error instanceof ApiError ? (error.field("internal_note") ?? error.message) : error.message}</FormAlert>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Enfant">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="text-ink-soft">Nom</dt>
              <dd className="font-semibold text-ink">{admission.child_name}</dd>
              <dt className="text-ink-soft">Date de naissance</dt>
              <dd className="text-ink">{formatBirthDate(admission.child_birth_date, admission.child_age)}</dd>
              <dt className="text-ink-soft">Niveau demandé</dt>
              <dd className="text-ink">{admission.level ?? "Non précisé"}</dd>
              {admission.academic_year && (
                <>
                  <dt className="text-ink-soft">Année scolaire</dt>
                  <dd className="text-ink">{admission.academic_year}</dd>
                </>
              )}
            </dl>
          </Card>

          <Card title="Parent">
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="text-ink-soft">Nom</dt>
              <dd className="font-semibold text-ink">{admission.parent_name}</dd>
              <dt className="text-ink-soft">Téléphone</dt>
              <dd className="text-ink">{admission.phone}</dd>
              <dt className="text-ink-soft">Email</dt>
              <dd className="break-all text-ink">{admission.email}</dd>
              <dt className="text-ink-soft">Reçue le</dt>
              <dd className="text-ink">{formatDateTime(admission.created_at)}</dd>
            </dl>
            {admission.message && (
              <div className="mt-6 whitespace-pre-wrap break-words rounded-btn bg-surface-alt p-4 leading-relaxed text-ink">
                {admission.message}
              </div>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={telUrl(admission.phone)} className={contactLinkClasses}>
                <Phone size={16} aria-hidden="true" />
                Appeler
              </a>
              <a href={whatsappUrl(admission.phone, greeting)} target="_blank" rel="noopener noreferrer" className={contactLinkClasses}>
                <MessageCircle size={16} aria-hidden="true" />
                Écrire sur WhatsApp
              </a>
              <a href={reply} className={contactLinkClasses}>
                <Mail size={16} aria-hidden="true" />
                Répondre par email
              </a>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <Card title="Suivi">
            <RadioCards
              name="status"
              legend="Statut"
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value);
                setSaved(false);
              }}
            />
            <TextAreaField
              className="mt-4"
              label="Note interne"
              value={note}
              onChange={(event) => {
                setNote(event.target.value);
                setSaved(false);
              }}
              hint="Visible seulement par l'équipe : rendez-vous, pièces reçues, réponse donnée…"
              maxLength={2000}
              rows={4}
            />
            <Button variant="primary" className="mt-5 w-full" pending={save.isPending} disabled={!dirty} onClick={() => save.mutate()}>
              Enregistrer
            </Button>
            {admission.handled_by && admission.handled_at && (
              <p className="mt-3 text-xs text-ink-soft">
                Traitée par {admission.handled_by} le {formatDateTime(admission.handled_at)}.
              </p>
            )}
            {admission.can.delete && (
              <div className="mt-4 border-t border-border-soft pt-4">
                <Button variant="danger" className="w-full" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} aria-hidden="true" />
                  Supprimer définitivement
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Supprimer cette demande ?"
        message="Elle sera supprimée définitivement, avec les informations sur l'enfant et la famille. Cette action ne peut pas être annulée."
        confirmLabel="Supprimer définitivement"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function AdmissionDetailPage() {
  const { id } = useParams();
  const admissionId = Number(id);
  const admission = useQuery({
    queryKey: [...ADMISSIONS_QUERY_KEY, "detail", admissionId],
    queryFn: async () => (await api<{ data: AdminAdmissionRequest }>(`/admin/admission-requests/${admissionId}`)).data,
  });

  usePageMeta("Demande d'inscription | Administration La Pépinière", "Demande reçue par le formulaire d'inscription.");

  if (admission.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement de la demande…
      </p>
    );
  }
  if (admission.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Demande d'inscription" back={{ to: PATHS.admissions, label: "Demandes d'inscription" }} />
        <FormAlert tone="error">
          {admission.error instanceof ApiError && admission.error.status === 404
            ? "Cette demande n'existe pas ou a été supprimée."
            : admission.error.message}
        </FormAlert>
      </div>
    );
  }
  return <AdmissionView key={admission.data.id} admission={admission.data} />;
}
