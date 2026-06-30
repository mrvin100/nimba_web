/** RFC 7807 problem detail, as returned by the backend on errors. */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errors?: Record<string, string[]>;
}

/** Typed error carrying the backend's HTTP status and problem detail. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly problem: ProblemDetail,
  ) {
    super(problem.detail ?? problem.title ?? `HTTP ${status}`);
    this.name = "ApiError";
  }
}

/** Builds an ApiError from a non-OK response, parsing a problem body when present. */
export async function parseApiError(response: Response): Promise<ApiError> {
  const status = response.status;
  try {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("json") || contentType.includes("problem")) {
      const body = (await response.json()) as ProblemDetail;
      return new ApiError(status, body);
    }
  } catch {
    // fall through to a generic error
  }
  return new ApiError(status, { status, title: response.statusText || `Erreur ${status}` });
}

/** Human-readable message from any caught value; use in mutation catch blocks. */
export function getErrorMessage(error: unknown, fallback = "Une erreur est survenue."): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
