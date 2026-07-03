import { z } from "zod";

/** One parsed row of the uploaded schedule, transcribed raw for the preview. */
export interface PreviewLine {
  lineNumber: number;
  numeroEcheance: string;
  residualValue: boolean;
  dateEcheance: string | null;
  interet: number;
  equipement: number;
  assurance: number;
  tracking: number;
  immatriculation: number;
  capital: number;
  loyerHt: number;
  taxes: number;
  loyerTtc: number;
  capitalRestantDu: number | null;
}

/** A parse/consistency problem, optionally tied to a line and column. */
export interface ScheduleError {
  lineNumber: number | null;
  column: string | null;
  message: string;
}

/** Response of the non-persisting preview (always 200 unless the file is unreadable). */
export interface PreviewResponse {
  valid: boolean;
  lines: PreviewLine[];
  errors: ScheduleError[];
  totalLoyerTtcExcludingVr: number;
}

/** Result of a definitive upload (201). */
export interface UploadResponse {
  id: string;
  versionNumber: number;
  originalFilename: string;
  uploadedAt: string;
  lineCount: number;
  ordinaryOffsetMonths: number;
  vrOffsetMonths: number;
  fixedDayOfMonth: number;
}

/** A generated trade (bill of exchange). */
export interface Trade {
  id: string;
  numeroEcheance: string;
  dueDate: string;
  amount: number;
  amountInWords: string;
  currency: string;
}

/**
 * Due-date generation offsets. The defaults mirror the backend (ordinary +1 month,
 * VR +2 months, fixed day 5); they are surfaced as an advanced option.
 */
export const offsetsSchema = z.object({
  ordinaryOffsetMonths: z.coerce.number().int().min(0).max(6),
  vrOffsetMonths: z.coerce.number().int().min(0).max(6),
  fixedDayOfMonth: z.coerce.number().int().min(1).max(31),
});

export type OffsetsInput = z.infer<typeof offsetsSchema>;

export const DEFAULT_OFFSETS: OffsetsInput = {
  ordinaryOffsetMonths: 1,
  vrOffsetMonths: 2,
  fixedDayOfMonth: 5,
};
