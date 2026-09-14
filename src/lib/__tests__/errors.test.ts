import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AppError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  handleError,
} from "../errors";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("Error Classes", () => {
  it("creates AppError with default values", () => {
    const error = new AppError("Something went wrong");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe("AppError");
  });

  it("creates UnauthorizedError with custom message", () => {
    const error = new UnauthorizedError("Custom message");
    expect(error.message).toBe("Custom message");
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe("UNAUTHORIZED");
  });

  it("creates ForbiddenError", () => {
    const error = new ForbiddenError();
    expect(error.message).toBe("You don't have permission to do this");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("FORBIDDEN");
  });

  it("creates NotFoundError with resource name", () => {
    const error = new NotFoundError("Room");
    expect(error.message).toBe("Room not found");
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe("NOT_FOUND");
  });

  it("creates ValidationError", () => {
    const error = new ValidationError("Invalid input");
    expect(error.message).toBe("Invalid input");
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
  });

  it("error classes extend Error", () => {
    expect(new AppError("test")).toBeInstanceOf(Error);
    expect(new UnauthorizedError()).toBeInstanceOf(AppError);
    expect(new ForbiddenError()).toBeInstanceOf(AppError);
    expect(new NotFoundError("X")).toBeInstanceOf(AppError);
    expect(new ValidationError("X")).toBeInstanceOf(AppError);
  });
});

describe("handleError", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("handles AppError and returns message", async () => {
    const { toast } = await import("sonner");
    const error = new AppError("Test error", 400);
    const result = handleError(error);
    expect(result).toBe("Test error");
    expect(toast.error).toHaveBeenCalledWith("Test error");
  });

  it("handles network errors", async () => {
    const { toast } = await import("sonner");
    const error = new Error("Failed to fetch");
    const result = handleError(error);
    expect(result).toBe("Network error");
    expect(toast.error).toHaveBeenCalledWith(
      "Network error. Please check your connection."
    );
  });

  it("handles unknown errors", async () => {
    const { toast } = await import("sonner");
    const result = handleError("something weird");
    expect(result).toBe("An unexpected error occurred");
    expect(toast.error).toHaveBeenCalledWith("An unexpected error occurred");
  });
});
