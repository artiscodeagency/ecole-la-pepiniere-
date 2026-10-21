import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { AdminApp } from "@/admin/AdminApp";
import { ME_QUERY_KEY } from "@/admin/auth/context";
import { toast } from "@/admin/toast/store";
import { Toaster } from "@/admin/toast/Toaster";
import { ApiError } from "@/lib/api/client";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      /** Notice shown when the action succeeds; a function to word it from the result. */
      success?: string | ((data: unknown, variables: unknown) => string | null);
      /** False when the page shows the error itself and a notice would repeat it. */
      errorToast?: boolean;
    };
  }
}

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // A session that expires on any page sends the user back to the login page.
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        queryClient.setQueryData(ME_QUERY_KEY, null);
      }
    },
  }),
  // Every action of the admin reports its outcome in a notice.
  mutationCache: new MutationCache({
    onSuccess: (data, variables, _context, mutation) => {
      const success = mutation.meta?.success;
      const message = typeof success === "function" ? success(data, variables) : success;
      if (message) toast.success(message);
    },
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.errorToast === false) return;
      if (error instanceof ApiError && error.status === 401) {
        queryClient.setQueryData(ME_QUERY_KEY, null);
        toast.warning("Votre session a expiré", "Reconnectez-vous pour continuer.");
        return;
      }
      if (error instanceof ApiError && error.status === 422) {
        const first = Object.values(error.errors)[0]?.[0];
        toast.error("Certains champs sont à corriger", first ?? error.message);
        return;
      }
      toast.error("L'action n'a pas abouti", error instanceof Error ? error.message : undefined);
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      // Retry only when the server could not be reached or failed.
      retry: (failureCount, error) =>
        failureCount < 2 && (!(error instanceof ApiError) || error.status === 0 || error.status >= 500),
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AdminApp />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
