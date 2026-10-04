import { QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { AdminApp } from "@/admin/AdminApp";
import { ME_QUERY_KEY } from "@/admin/auth/context";
import { ApiError } from "@/lib/api/client";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    // A session that expires on any page sends the user back to the login page.
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        queryClient.setQueryData(ME_QUERY_KEY, null);
      }
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
    </QueryClientProvider>
  </StrictMode>,
);
