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

/**
 * Current schedule state of a case: the latest uploaded version, plus whether the
 * active trades were generated from THIS version (`tradesUpToDate` is false right
 * after an upload, or after a re-import supersedes the generated trades' source).
 * Server state — this is what the échéancier screen derives its workflow from,
 * so a page refresh can never lose the "imported, generate the trades" step.
 */
export interface LatestSchedule {
  id: string;
  versionNumber: number;
  originalFilename: string;
  uploadedAt: string;
  lineCount: number;
  ordinaryOffsetMonths: number;
  vrOffsetMonths: number;
  fixedDayOfMonth: number;
  tradesUpToDate: boolean;
}

/** Payment state of one échéance relative to today (computed by the backend). */
export type PaymentStatus = "PAYE" | "EN_COURS" | "A_VENIR";

/** Sortable columns of the detailed table (mirrors the backend enum). */
export type TableSortField = "PERIODE" | "DATE" | "CAPITAL" | "INTERET" | "MENSUALITE" | "CAPITAL_RESTANT";

/** One sort state of the detailed table (column + direction). */
export interface TableSort {
  field: TableSortField;
  direction: "asc" | "desc";
}

export interface AmortizationSummary {
  loanAmount: number;
  paidPrincipal: number;
  remainingPrincipal: number;
  interestPaid: number;
  durationMonths: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
}

export interface AmortizationTimeline {
  startDate: string | null;
  endDate: string | null;
  today: string;
  /** Number of settled périodes — where the "today" marker sits on the chart. */
  currentPeriod: number;
  remainingPeriods: number;
}

export interface AmortizationChartPoint {
  period: number;
  date: string | null;
  remainingCapital: number;
  paidCapital: number;
  paidPercentage: number;
}

export interface AmortizationProgress {
  completedPayments: number;
  remainingPayments: number;
  completion: number;
}

/** Everything the dossier overview screen needs, in one backend response. */
export interface AmortizationOverview {
  summary: AmortizationSummary;
  timeline: AmortizationTimeline;
  chart: AmortizationChartPoint[];
  status: AmortizationProgress;
}

/** Optional chart date range; the backend filters, the frontend only renders. */
export interface OverviewRange {
  from?: string;
  to?: string;
}

/** Row of the lazily-loaded detailed table. */
export interface AmortizationTableRow {
  period: string;
  date: string | null;
  capital: number;
  interet: number;
  mensualite: number;
  capitalRestantDu: number | null;
  status: PaymentStatus;
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
