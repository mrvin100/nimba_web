import ky from "ky";

/**
 * Client-side HTTP client for the backend API. Requests are same-origin (Next.js
 * proxies /api/* to the backend, see next.config.ts), so the httpOnly,
 * SameSite=Strict session cookie is sent automatically with `credentials: include`.
 * The version prefix lives here only.
 */
export const api = ky.create({
  prefixUrl: "/api/v1",
  credentials: "include",
  retry: 0,
});
