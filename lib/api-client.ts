import ky from "ky";
import { env } from "@/lib/env";
import { parseApiError } from "@/lib/api-error";

/**
 * Shared client-side HTTP client. Requests are same-origin (Next.js proxies
 * /api/* to the backend), so the httpOnly, SameSite=Strict session cookie is sent
 * automatically with `credentials: include` — Nimba's auth lives entirely in the
 * backend (no token handling here). Non-OK responses are surfaced as a typed
 * ApiError carrying the backend's problem detail.
 */
export const api = ky.create({
  prefixUrl: env.apiBasePath,
  credentials: "include",
  retry: 0,
  throwHttpErrors: false,
  hooks: {
    afterResponse: [
      async (_request, _options, response) => {
        if (!response.ok) {
          throw await parseApiError(response.clone());
        }
      },
    ],
  },
});
