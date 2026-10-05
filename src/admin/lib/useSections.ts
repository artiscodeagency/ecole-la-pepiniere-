import { useQuery } from "@tanstack/react-query";

import type { Category } from "@/admin/types";
import { api } from "@/lib/api/client";

/** The school sections: maternelle, primaire francophone, primaire anglophone. */
export function useSections() {
  return useQuery({
    queryKey: ["sections"],
    queryFn: async () => (await api<{ data: Category[] }>("/public/sections")).data,
    staleTime: Infinity,
  });
}
