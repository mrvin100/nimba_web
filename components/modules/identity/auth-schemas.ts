import { z } from "zod";

/** Login form schema; the inferred type is the request payload (one source of truth). */
export const loginSchema = z.object({
  email: z.string().min(1, "Adresse e-mail requise").email("Adresse e-mail invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Authenticated analyst, as returned by /auth/me and /auth/login. */
export interface MeResponse {
  userId: string;
  fullName: string;
  email: string;
  role: string;
}
