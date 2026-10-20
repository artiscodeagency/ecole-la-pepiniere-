import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/admin/components/Button";
import { Card } from "@/admin/components/Card";
import { ConfirmDialog } from "@/admin/components/ConfirmDialog";
import { FormAlert } from "@/admin/components/FormAlert";
import { TextAreaField } from "@/admin/components/FormField";
import { PageHeader } from "@/admin/components/PageHeader";
import { type RadioCardOption, RadioCards } from "@/admin/components/RadioCards";
import { formatDateTime } from "@/admin/lib/dates";
import { type AdminContactMessage, type MessageStatus, MESSAGES_QUERY_KEY } from "@/admin/messages/types";
import { PATHS } from "@/admin/paths";
import { api, ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/usePageMeta";
import { telUrl, whatsappUrl } from "@/lib/whatsapp";

const STATUS_OPTIONS: RadioCardOption<MessageStatus>[] = [
  { value: "new", label: "Nouveau", description: "À lire : compté dans le tableau de bord." },
  { value: "read", label: "Lu", description: "Vu, mais pas encore traité." },
  { value: "handled", label: "Traité", description: "La famille a reçu une réponse." },
];

const contactLinkClasses =
  "inline-flex items-center gap-2 rounded-btn border border-border-soft bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface-alt";

function MessageView({ message }: { message: AdminContactMessage }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(message.status);
  const [note, setNote] = useState(message.internal_note ?? "");
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = status !== message.status || note !== (message.internal_note ?? "");

  const refreshLists = () => {
    void queryClient.invalidateQueries({ queryKey: [...MESSAGES_QUERY_KEY, "list"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
  };

  // Opening the message marked it as read on the server: the counters change.
  useEffect(refreshLists, []); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: () =>
      api<{ data: AdminContactMessage }>(`/admin/contact-messages/${message.id}`, {
        method: "PUT",
        body: { status, internal_note: note || null },
      }),
    onSuccess: ({ data }) => {
      queryClient.setQueryData([...MESSAGES_QUERY_KEY, "detail", message.id], data);
      refreshLists();
      setSaved(true);
    },
  });

  const remove = useMutation({
    mutationFn: () => api(`/admin/contact-messages/${message.id}`, { method: "DELETE" }),
    onSuccess: () => {
      refreshLists();
      navigate(PATHS.messages, { replace: true });
    },
  });

  const reply = `mailto:${message.email}?subject=${encodeURIComponent(`Re : ${message.subject}`)}`;
  const greeting = `Bonjour ${message.name}, nous avons bien reçu votre message « ${message.subject} ».`;
  const error = save.error ?? remove.error;

  return (
    <div>
      <PageHeader title={message.subject} back={{ to: PATHS.messages, label: "Messages" }} />

      <div className="mb-6 space-y-3" aria-live="polite">
        {saved && !dirty && <FormAlert tone="success">Message mis à jour.</FormAlert>}
        {error && <FormAlert tone="error">{error instanceof ApiError ? (error.field("internal_note") ?? error.message) : error.message}</FormAlert>}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[8rem_1fr]">
              <dt className="text-ink-soft">De</dt>
              <dd className="font-semibold text-ink">{message.name}</dd>
              <dt className="text-ink-soft">Email</dt>
              <dd className="break-all text-ink">{message.email}</dd>
              <dt className="text-ink-soft">Téléphone</dt>
              <dd className="text-ink">{message.phone}</dd>
              <dt className="text-ink-soft">Reçu le</dt>
              <dd className="text-ink">{formatDateTime(message.created_at)}</dd>
            </dl>
            <div className="mt-6 whitespace-pre-wrap break-words rounded-btn bg-surface-alt p-4 leading-relaxed text-ink">{message.message}</div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={reply} className={contactLinkClasses}>
                <Mail size={16} aria-hidden="true" />
                Répondre par email
              </a>
              <a href={telUrl(message.phone)} className={contactLinkClasses}>
                <Phone size={16} aria-hidden="true" />
                Appeler
              </a>
              <a href={whatsappUrl(message.phone, greeting)} target="_blank" rel="noopener noreferrer" className={contactLinkClasses}>
                <MessageCircle size={16} aria-hidden="true" />
                Écrire sur WhatsApp
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
              hint="Visible seulement par l'équipe : qui a répondu, ce qui a été convenu…"
              maxLength={2000}
              rows={4}
            />
            <Button variant="primary" className="mt-5 w-full" pending={save.isPending} disabled={!dirty} onClick={() => save.mutate()}>
              Enregistrer
            </Button>
            {message.handled_by && message.handled_at && (
              <p className="mt-3 text-xs text-ink-soft">
                Traité par {message.handled_by} le {formatDateTime(message.handled_at)}.
              </p>
            )}
            {message.can.delete && (
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
        title="Supprimer ce message ?"
        message="Il sera supprimé définitivement, avec les coordonnées de la famille. Cette action ne peut pas être annulée."
        confirmLabel="Supprimer définitivement"
        pending={remove.isPending}
        onConfirm={() => remove.mutate()}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export function MessageDetailPage() {
  const { id } = useParams();
  const messageId = Number(id);
  const message = useQuery({
    queryKey: [...MESSAGES_QUERY_KEY, "detail", messageId],
    queryFn: async () => (await api<{ data: AdminContactMessage }>(`/admin/contact-messages/${messageId}`)).data,
    // Always read again: opening a message is what marks it as read.
    staleTime: 0,
  });

  usePageMeta("Message | Administration La Pépinière", "Message reçu par le formulaire de contact.");

  if (message.isPending) {
    return (
      <p role="status" className="flex items-center gap-2 py-10 text-sm text-ink-soft">
        <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        Chargement du message…
      </p>
    );
  }
  if (message.isError) {
    return (
      <div className="space-y-4">
        <PageHeader title="Message" back={{ to: PATHS.messages, label: "Messages" }} />
        <FormAlert tone="error">
          {message.error instanceof ApiError && message.error.status === 404
            ? "Ce message n'existe pas ou a été supprimé."
            : message.error.message}
        </FormAlert>
      </div>
    );
  }
  return <MessageView key={message.data.id} message={message.data} />;
}
