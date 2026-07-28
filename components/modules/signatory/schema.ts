import { z } from "zod";
import { DEPARTMENTS, DEPARTMENT_ROLES, type Department, type DepartmentRole } from "@/components/modules/identity";

/** Whether a standalone signatory (no account) is a bank employee or outside the bank. */
export const SIGNATORY_CATEGORIES = ["INTERNE", "EXTERNE"] as const;
export type SignatoryCategory = (typeof SIGNATORY_CATEGORIES)[number];

export const SIGNATORY_CATEGORY_LABELS: Record<SignatoryCategory, string> = {
  INTERNE: "Interne",
  EXTERNE: "Externe",
};

/** One candidate in a signatory picker: a live profile, or a standalone record. */
export type SignatorySource = "PROFILE" | "STANDALONE";

export interface SignatoryOption {
  source: SignatorySource;
  refId: string;
  nom: string;
  titre: string;
  category: SignatoryCategory | null;
}

export interface SignatoryAuthorization {
  department: Department;
  departmentRole: DepartmentRole;
}

/** A standalone signatory record, as managed from the admin console. */
export interface Signatory {
  id: string;
  nom: string;
  titre: string;
  category: SignatoryCategory;
  creationReason: string;
  createdAt: string;
  authorizations: SignatoryAuthorization[];
}

const authorizationSchema = z.object({
  department: z.enum(DEPARTMENTS),
  departmentRole: z.enum(DEPARTMENT_ROLES),
});

export const signatorySchema = z.object({
  nom: z.string().min(1, "Nom requis").max(200, "200 caractères maximum"),
  titre: z.string().min(1, "Titre requis").max(200, "200 caractères maximum"),
  category: z.enum(SIGNATORY_CATEGORIES),
  creationReason: z.string().min(1, "Le motif de création est requis").max(500, "500 caractères maximum"),
  authorizations: z.array(authorizationSchema),
});

export type SignatoryInput = z.infer<typeof signatorySchema>;
