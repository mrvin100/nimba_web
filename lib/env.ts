/**
 * Client + server environment (NEXT_PUBLIC_* only). Never read process.env
 * outside this file (client) or env.server.ts (server). The browser talks to the
 * backend through a same-origin path that Next.js proxies (see next.config.ts),
 * so only the versioned base path is needed here.
 */
export const env = {
  apiBasePath: process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api/v1",
} as const;
