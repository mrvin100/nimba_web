import { QueryClient } from "@tanstack/react-query";

/**
 * Creates the TanStack Query client. Server state (cache + invalidation) lives
 * here and in the per-domain hooks; components never fetch directly. A modest
 * stale time avoids refetch storms; window-focus refetch is off for this internal
 * tool.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
