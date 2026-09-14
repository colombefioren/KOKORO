/**
 * Input sanitization utilities for XSS prevention.
 */

// ── HTML escaping (prevents XSS in rendered output) ─────────────
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"'`/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

// ── Strip dangerous content ─────────────────────────────────────
export function stripDangerousContent(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^>]*>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/data:text\/html/gi, "");
}

// ── Sanitize user input (for room names, bios, etc.) ────────────
export function sanitizeUserInput(input: string, maxLength = 500): string {
  return stripDangerousContent(input.slice(0, maxLength)).trim();
}

// ── Sanitize message content ────────────────────────────────────
export function sanitizeMessageContent(content: string): string {
  return stripDangerousContent(content.slice(0, 5000)).trim();
}

// ── Safe user object (never expose emails, tokens, etc.) ────────
export interface SafeUser {
  id: string;
  name: string;
  image: string | null;
  email?: never; // Explicitly excluded
  username: string | null;
  displayUsername: string | null;
  bio: string | null;
  createdAt: string;
}

export function toSafeUser(user: Record<string, unknown>): SafeUser {
  const { email: _, ...safeUser } = user;
  return safeUser as SafeUser;
}

export function toSafeUsers(users: Record<string, unknown>[]): SafeUser[] {
  return users.map(toSafeUser);
}
