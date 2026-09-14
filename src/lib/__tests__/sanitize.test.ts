import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  stripDangerousContent,
  sanitizeUserInput,
  sanitizeMessageContent,
  toSafeUser,
  toSafeUsers,
} from "../sanitize";

describe("escapeHtml", () => {
  it("escapes ampersands", () => {
    expect(escapeHtml("a & b")).toBe("a &amp; b");
  });

  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert('xss')</script>")).toBe(
      "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;",
    );
  });

  it("escapes double quotes", () => {
    expect(escapeHtml('a "b" c')).toBe("a &quot;b&quot; c");
  });

  it("escapes single quotes and backticks", () => {
    expect(escapeHtml("it's `fine`")).toBe("it&#x27;s &#96;fine&#96;");
  });

  it("escapes forward slashes in dangerous context", () => {
    expect(escapeHtml("</script>")).toBe("&lt;&#x2F;script&gt;");
  });

  it("leaves normal text untouched", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });

  it("handles multiple special chars in one string", () => {
    const input = '<div class="test">Hello & goodbye</div>';
    const result = escapeHtml(input);
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
    expect(result).not.toContain('"');
    expect(result).toContain("&amp;");
  });
});

describe("stripDangerousContent", () => {
  it("removes <script> tags", () => {
    expect(
      stripDangerousContent("Hello <script>alert('xss')</script> world"),
    ).toBe("Hello  world");
  });

  it("removes <script> tags with attributes", () => {
    expect(stripDangerousContent('<script src="evil.js"></script>')).toBe("");
  });

  it("removes <iframe> tags", () => {
    expect(
      stripDangerousContent("Text <iframe src='evil'></iframe> more"),
    ).toBe("Text  more");
  });

  it("removes <object> tags", () => {
    expect(stripDangerousContent("Text <object data='evil'></object>")).toBe(
      "Text ",
    );
  });

  it("removes <embed> tags", () => {
    expect(stripDangerousContent("Text <embed src='evil'/>")).toBe("Text ");
  });

  it("removes onclick handlers", () => {
    expect(stripDangerousContent('<div onclick="alert(1)">click</div>')).toBe(
      "<div >click</div>",
    );
  });

  it("removes onmouseover handlers", () => {
    expect(stripDangerousContent('onmouseover="alert(1)"')).toBe("");
  });

  it("removes javascript: URLs", () => {
    expect(stripDangerousContent('href="javascript:alert(1)"')).toBe(
      'href="alert(1)"',
    );
  });

  it("removes data:text/html URIs", () => {
    // stripDangerousContent first removes <script> tags, then checks data:text/html
    expect(
      stripDangerousContent("data:text/html,<script>alert(1)</script>"),
    ).toBe(",");
  });

  it("leaves safe content untouched", () => {
    expect(stripDangerousContent("Hello World 123!")).toBe("Hello World 123!");
  });

  it("is case-insensitive for script tags", () => {
    expect(stripDangerousContent("<SCRIPT>alert(1)</SCRIPT>")).toBe("");
  });

  it("handles nested dangerous content", () => {
    const input = '<div onclick="x">safe <script>bad</script> content</div>';
    const result = stripDangerousContent(input);
    expect(result).not.toContain("script");
    expect(result).not.toContain("onclick");
    expect(result).toContain("safe");
    expect(result).toContain("content");
  });
});

describe("sanitizeUserInput", () => {
  it("trims whitespace", () => {
    expect(sanitizeUserInput("  hello  ")).toBe("hello");
  });

  it("strips dangerous content", () => {
    // stripDangerousContent removes the tag, then .trim() removes trailing space
    expect(sanitizeUserInput("Hello <script>bad</script>")).toBe("Hello");
  });

  it("truncates to default max length (500)", () => {
    const long = "a".repeat(600);
    expect(sanitizeUserInput(long).length).toBe(500);
  });

  it("truncates to custom max length", () => {
    expect(sanitizeUserInput("Hello World", 5).length).toBe(5);
  });

  it("handles empty string", () => {
    expect(sanitizeUserInput("")).toBe("");
  });
});

describe("sanitizeMessageContent", () => {
  it("trims whitespace", () => {
    expect(sanitizeMessageContent("  hello  ")).toBe("hello");
  });

  it("strips dangerous content", () => {
    // stripDangerousContent removes the tag, then .trim() removes trailing space
    expect(sanitizeMessageContent("Hello <script>bad</script>")).toBe("Hello");
  });

  it("truncates to 5000 characters", () => {
    const long = "a".repeat(6000);
    expect(sanitizeMessageContent(long).length).toBe(5000);
  });

  it("preserves normal message content", () => {
    expect(sanitizeMessageContent("Hello! How are you? 😊")).toBe(
      "Hello! How are you? 😊",
    );
  });
});

describe("toSafeUser", () => {
  it("removes email from user object", () => {
    const user = {
      id: "1",
      name: "John",
      email: "john@example.com",
      username: "john",
      image: null,
      createdAt: "2024-01-01",
    };

    const safe = toSafeUser(user);
    expect(safe.id).toBe("1");
    expect(safe.name).toBe("John");
    expect("email" in safe).toBe(false);
  });

  it("preserves all other fields", () => {
    const user = {
      id: "1",
      name: "John",
      email: "john@example.com",
      username: "john",
      displayUsername: "johnny",
      image: "https://example.com/img.jpg",
      bio: "Hello!",
      createdAt: "2024-01-01",
    };

    const safe = toSafeUser(user);
    expect(safe.id).toBe("1");
    expect(safe.username).toBe("john");
    expect(safe.displayUsername).toBe("johnny");
    expect(safe.bio).toBe("Hello!");
  });
});

describe("toSafeUsers", () => {
  it("removes emails from all users", () => {
    const users = [
      { id: "1", name: "A", email: "a@test.com" },
      { id: "2", name: "B", email: "b@test.com" },
    ];

    const safe = toSafeUsers(users);
    expect(safe).toHaveLength(2);
    expect("email" in safe[0]).toBe(false);
    expect("email" in safe[1]).toBe(false);
  });

  it("handles empty array", () => {
    expect(toSafeUsers([])).toEqual([]);
  });
});
