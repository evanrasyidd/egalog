import "server-only";

interface RateLimitEntry {
  attempts: number;
  firstAttemptAt: number;
}

/**
 * Factory rate limiter in-memory sederhana — cukup untuk demo, kalau mau
 * production-grade sebaiknya pindah ke store yang shared antar instance
 * (mis. Redis/Upstash) supaya konsisten di environment serverless
 * multi-instance (lihat catatan di README soal in-memory store).
 */
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts = new Map<string, RateLimitEntry>();

  return {
    isLimited(key: string): boolean {
      const entry = attempts.get(key);
      if (!entry) return false;
      if (Date.now() - entry.firstAttemptAt > windowMs) {
        attempts.delete(key);
        return false;
      }
      return entry.attempts >= maxAttempts;
    },
    recordFailure(key: string) {
      const entry = attempts.get(key);
      if (!entry || Date.now() - entry.firstAttemptAt > windowMs) {
        attempts.set(key, { attempts: 1, firstAttemptAt: Date.now() });
      } else {
        entry.attempts += 1;
      }
    },
    clear(key: string) {
      attempts.delete(key);
    },
  };
}
