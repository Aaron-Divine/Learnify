interface RateLimitEntry {
  failures: number[];
  lockedUntil?: number;
}

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const LOCKOUT_MS = 10 * 60 * 1000; // 10 minutes lockout

// In-memory store (cleans up stale keys periodically)
const attemptStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds?: number;
} {
  const now = Date.now();
  const entry = attemptStore.get(key);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_FAILURES };
  }

  // Check if currently locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    const retryAfterSeconds = Math.ceil((entry.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  // Filter out attempts older than the window
  entry.failures = entry.failures.filter((ts) => now - ts < WINDOW_MS);

  if (entry.failures.length >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_MS;
    const retryAfterSeconds = Math.ceil(LOCKOUT_MS / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds,
    };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_FAILURES - entry.failures.length,
  };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const entry = attemptStore.get(key) || { failures: [] };
  entry.failures.push(now);

  if (entry.failures.length >= MAX_FAILURES) {
    entry.lockedUntil = now + LOCKOUT_MS;
  }

  attemptStore.set(key, entry);
}

export function resetRateLimit(key: string): void {
  attemptStore.delete(key);
}
