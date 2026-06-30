import "server-only";

/**
 * Server-only environment: secrets and internal endpoints, never shipped to the
 * browser. [backendOrigin] is where the Next.js dev proxy forwards /api/* (see
 * next.config.ts).
 */
export const serverEnv = {
  backendOrigin: process.env.BACKEND_ORIGIN ?? "http://localhost:8080",
} as const;
