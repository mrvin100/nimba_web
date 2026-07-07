/**
 * Client + server environment (NEXT_PUBLIC_* only). Never read process.env
 * outside this file (client) or env.server.ts (server). The browser talks to the
 * backend through a same-origin path that Next.js proxies (see next.config.ts),
 * so only the versioned base path is needed here.
 */
export const env = {
  apiBasePath: process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/v1",
  // Public backend API URL (browser-visible twin of the server-only API_BASE_URL).
  // Normal calls go same-origin through the proxy; this is read only to wake a
  // managed host that sleeps when idle (Render — see ServiceWakeNotice). Empty for
  // local dev and on-premise, where the backend never sleeps.
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
} as const;
