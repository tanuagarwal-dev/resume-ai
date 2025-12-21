import { describe, it, expect } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("allows requests within limit", () => {
    const result = rateLimit("user-1", "test-key", {
      limit: 3,
      windowMs: 60000,
    });
    expect(result.allowed).toBe(true);
  });

  it("blocks requests exceeding limit", () => {
    const userId = "user-2";
    const key = "test-key";
    rateLimit(userId, key, { limit: 2, windowMs: 60000 });
    rateLimit(userId, key, { limit: 2, windowMs: 60000 });
    const result = rateLimit(userId, key, { limit: 2, windowMs: 60000 });
    expect(result.allowed).toBe(false);
  });

  it("returns remaining time when blocked", () => {
    const userId = "user-3";
    const key = "test-key";
    rateLimit(userId, key, { limit: 1, windowMs: 60000 });
    const result = rateLimit(userId, key, { limit: 1, windowMs: 60000 });
    expect(result.allowed).toBe(false);
    expect(result.remainingMs).toBeGreaterThan(0);
    expect(result.remainingMs).toBeLessThanOrEqual(60000);
  });

  it("isolates per user", () => {
    const key = "same-key";
    const r1 = rateLimit("user-a", key, { limit: 1, windowMs: 60000 });
    const r2 = rateLimit("user-b", key, { limit: 1, windowMs: 60000 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });

  it("isolates per action key", () => {
    const userId = "user-x";
    const r1 = rateLimit(userId, "key-1", { limit: 1, windowMs: 60000 });
    const r2 = rateLimit(userId, "key-2", { limit: 1, windowMs: 60000 });
    expect(r1.allowed).toBe(true);
    expect(r2.allowed).toBe(true);
  });
});
