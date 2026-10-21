import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ADMISSIONS_QUERY_KEY } from "@/admin/admissions/types";
import { useDashboardStats } from "@/admin/lib/useDashboardStats";
import { MESSAGES_QUERY_KEY } from "@/admin/messages/types";
import { PATHS } from "@/admin/paths";
import { toast } from "@/admin/toast/store";

const TITLE_COUNT = /^\(\d+\) /;

/**
 * Reacts to new contact messages and admission requests as soon as the
 * counts change: the open lists reload, a notice with a "Voir" button is
 * shown, and the tab title carries the number waiting ("(2) Messages | …").
 */
export function useLiveInbox() {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const previous = useRef<{ messages: number; admissions: number } | null>(null);

  const messages = stats.data?.messages_unread;
  const admissions = stats.data?.admission_requests_new;
  const pending = (messages ?? 0) + (admissions ?? 0);

  useEffect(() => {
    if (messages === undefined || admissions === undefined) return;
    const before = previous.current;
    previous.current = { messages, admissions };
    // The first counts are the starting point, not news.
    if (!before) return;

    if (messages !== before.messages) void queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY });
    if (admissions !== before.admissions) void queryClient.invalidateQueries({ queryKey: ADMISSIONS_QUERY_KEY });

    const newMessages = messages - before.messages;
    const newAdmissions = admissions - before.admissions;
    if (newMessages > 0) {
      toast.info(newMessages > 1 ? `${newMessages} nouveaux messages reçus` : "Nouveau message reçu", undefined, {
        label: "Voir",
        onClick: () => navigate(PATHS.messages),
      });
    }
    if (newAdmissions > 0) {
      toast.info(
        newAdmissions > 1 ? `${newAdmissions} nouvelles demandes d'inscription` : "Nouvelle demande d'inscription",
        undefined,
        { label: "Voir", onClick: () => navigate(PATHS.admissions) },
      );
    }
  }, [messages, admissions, queryClient, navigate]);

  // Pages set their own title, sometimes once their data has loaded: the
  // count is put back each time the title changes.
  useEffect(() => {
    const apply = () => {
      const base = document.title.replace(TITLE_COUNT, "");
      const wanted = pending > 0 ? `(${pending}) ${base}` : base;
      if (document.title !== wanted) document.title = wanted;
    };
    apply();
    const title = document.querySelector("title");
    if (!title) return;
    const observer = new MutationObserver(apply);
    observer.observe(title, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [pending, pathname]);

  return { pending };
}
