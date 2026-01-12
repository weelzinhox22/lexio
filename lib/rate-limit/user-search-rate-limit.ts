/**
 * Rate limiting (MVP)
 *
 * In-memory per-user rate limiter to control costs/abuse.
 * - Max 5 searches per hour per user (sliding window).
 *
 * Limitations:
 * - In serverless/multi-instance environments, memory is not shared across instances.
 *   For true production guarantees, swap this implementation to a shared KV/Redis.
 */

export type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number // epoch ms
}

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const LIMIT = 5

type Bucket = {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

function prune(bucket: Bucket, now: number) {
  const cutoff = now - WINDOW_MS
  // Keep only timestamps within the window
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff)
}

export function consumeUserSearch(userId: string, now: number = Date.now()): RateLimitResult {
  if (!userId) {
    // If we can't identify a user, be safe and deny.
    return { allowed: false, limit: LIMIT, remaining: 0, resetAt: now + WINDOW_MS }
  }

  const bucket = buckets.get(userId) ?? { timestamps: [] }
  prune(bucket, now)

  const used = bucket.timestamps.length
  const remainingBefore = Math.max(0, LIMIT - used)

  if (remainingBefore <= 0) {
    const oldest = bucket.timestamps[0] ?? now
    const resetAt = oldest + WINDOW_MS
    buckets.set(userId, bucket)
    return { allowed: false, limit: LIMIT, remaining: 0, resetAt }
  }

  bucket.timestamps.push(now)
  buckets.set(userId, bucket)

  // After consuming, recompute remaining + resetAt
  prune(bucket, now)
  const usedAfter = bucket.timestamps.length
  const remaining = Math.max(0, LIMIT - usedAfter)
  const oldest = bucket.timestamps[0] ?? now
  const resetAt = oldest + WINDOW_MS

  return { allowed: true, limit: LIMIT, remaining, resetAt }
}





