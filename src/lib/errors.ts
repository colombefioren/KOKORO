import { toast } from "sonner";

// ── Error Types ──────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "You must be signed in to do this") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You don't have permission to do this") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

// ── Error Handler ────────────────────────────────────────────────
export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    toast.error(error.message);
    return error.message;
  }

  if (error instanceof Error) {
    const message = error.message;
    if (message.includes("Failed to fetch")) {
      toast.error("Network error. Please check your connection.");
      return "Network error";
    }
    toast.error(message);
    return message;
  }

  toast.error("An unexpected error occurred");
  return "An unexpected error occurred";
}

// ── API Response Handler ─────────────────────────────────────────
export async function handleApiResponse<T>(
  response: { ok: boolean; json: () => Promise<T>; status: number }
): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => null) as any;
    throw new AppError(
      body?.error || `Request failed with status ${response.status}`,
      response.status
    );
  }
  return response.json();
}
