import { describe, it, expect } from "vitest";
import {
  registerSchema,
  registerBetterAuthSchema,
  emailLoginSchema,
  usernameLoginSchema,
} from "../../validation/auth";

describe("registerSchema", () => {
  const validUser = {
    firstName: "John",
    lastName: "Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "Password1",
  };

  it("accepts valid registration data", () => {
    expect(registerSchema.safeParse(validUser).success).toBe(true);
  });

  it("accepts names with spaces", () => {
    expect(
      registerSchema.safeParse({ ...validUser, firstName: "Mary Jane" })
        .success,
    ).toBe(true);
  });

  it("rejects empty firstName", () => {
    expect(
      registerSchema.safeParse({ ...validUser, firstName: "" }).success,
    ).toBe(false);
  });

  it("rejects firstName with numbers", () => {
    expect(
      registerSchema.safeParse({ ...validUser, firstName: "John123" }).success,
    ).toBe(false);
  });

  it("rejects firstName > 50 chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, firstName: "A".repeat(51) })
        .success,
    ).toBe(false);
  });

  it("rejects empty lastName", () => {
    expect(
      registerSchema.safeParse({ ...validUser, lastName: "" }).success,
    ).toBe(false);
  });

  it("rejects lastName with special chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, lastName: "Doe@" }).success,
    ).toBe(false);
  });

  it("rejects username < 3 chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, username: "ab" }).success,
    ).toBe(false);
  });

  it("rejects username > 30 chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, username: "a".repeat(31) })
        .success,
    ).toBe(false);
  });

  it("rejects username with special chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, username: "john-doe" }).success,
    ).toBe(false);
  });

  it("accepts username with underscores", () => {
    expect(
      registerSchema.safeParse({ ...validUser, username: "john_doe" }).success,
    ).toBe(true);
  });

  it("accepts username with numbers", () => {
    expect(
      registerSchema.safeParse({ ...validUser, username: "john123" }).success,
    ).toBe(true);
  });

  it("rejects invalid email format", () => {
    expect(
      registerSchema.safeParse({ ...validUser, email: "notanemail" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...validUser, email: "@example.com" }).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse({ ...validUser, email: "john@" }).success,
    ).toBe(false);
  });

  it("accepts valid email formats", () => {
    expect(
      registerSchema.safeParse({ ...validUser, email: "a@b.co" }).success,
    ).toBe(true);
    expect(
      registerSchema.safeParse({
        ...validUser,
        email: "user.name+tag@domain.com",
      }).success,
    ).toBe(true);
  });

  it("rejects password < 8 chars", () => {
    expect(
      registerSchema.safeParse({ ...validUser, password: "Pass1" }).success,
    ).toBe(false);
  });

  it("rejects password without uppercase", () => {
    expect(
      registerSchema.safeParse({ ...validUser, password: "password1" }).success,
    ).toBe(false);
  });

  it("rejects password without lowercase", () => {
    expect(
      registerSchema.safeParse({ ...validUser, password: "PASSWORD1" }).success,
    ).toBe(false);
  });

  it("rejects password without number", () => {
    expect(
      registerSchema.safeParse({ ...validUser, password: "Password" }).success,
    ).toBe(false);
  });

  it("accepts strong password", () => {
    expect(
      registerSchema.safeParse({ ...validUser, password: "Str0ngP@ss" })
        .success,
    ).toBe(true);
  });
});

describe("registerBetterAuthSchema", () => {
  const validData = {
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    password: "Password1",
  };

  it("accepts valid registration data", () => {
    expect(registerBetterAuthSchema.safeParse(validData).success).toBe(true);
  });

  it("rejects empty name", () => {
    expect(
      registerBetterAuthSchema.safeParse({ ...validData, name: "" }).success,
    ).toBe(false);
  });

  it("applies same username/email/password rules", () => {
    expect(
      registerBetterAuthSchema.safeParse({ ...validData, username: "ab" })
        .success,
    ).toBe(false);
    expect(
      registerBetterAuthSchema.safeParse({ ...validData, email: "bad" })
        .success,
    ).toBe(false);
    expect(
      registerBetterAuthSchema.safeParse({ ...validData, password: "weak" })
        .success,
    ).toBe(false);
  });
});

describe("emailLoginSchema", () => {
  it("accepts valid email and password", () => {
    expect(
      emailLoginSchema.safeParse({ email: "a@b.com", password: "pass" })
        .success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      emailLoginSchema.safeParse({ email: "bad", password: "pass" }).success,
    ).toBe(false);
  });

  it("rejects empty password", () => {
    expect(
      emailLoginSchema.safeParse({ email: "a@b.com", password: "" }).success,
    ).toBe(false);
  });
});

describe("usernameLoginSchema", () => {
  it("accepts valid username and password", () => {
    expect(
      usernameLoginSchema.safeParse({ username: "john", password: "pass" })
        .success,
    ).toBe(true);
  });

  it("rejects empty username", () => {
    expect(
      usernameLoginSchema.safeParse({ username: "", password: "pass" }).success,
    ).toBe(false);
  });

  it("rejects empty password", () => {
    expect(
      usernameLoginSchema.safeParse({ username: "john", password: "" }).success,
    ).toBe(false);
  });
});
