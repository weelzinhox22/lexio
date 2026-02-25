/**
 * Auth Rate Limiter (brute-force protection)
 *
 * In-memory sliding window rate limiter for authentication routes.
 * Limits login/signup attempts per IP to prevent brute-force attacks.
 *
 * - Login: 5 attempts per 15 minutes per IP
 * - Sign-up: 3 attempts per 15 minutes per IP
 * - Forgot password: 3 attempts per 15 minutes per IP
 *
 * Note: In serverless environments, memory is per-instance.
 * For strict production use, swap to Vercel KV/Redis.
 */

export type AuthRateLimitResult = {
    allowed: boolean
    limit: number
    remaining: number
    retryAfterSeconds: number
}

const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

type Bucket = {
    timestamps: number[]
}

const buckets = new Map<string, Bucket>()

// Cleanup old buckets every 5 minutes to prevent memory leak
let lastCleanup = Date.now()
function cleanupBuckets(now: number) {
    if (now - lastCleanup < 5 * 60 * 1000) return
    lastCleanup = now
    const cutoff = now - WINDOW_MS
    for (const [key, bucket] of buckets.entries()) {
        bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff)
        if (bucket.timestamps.length === 0) {
            buckets.delete(key)
        }
    }
}

function prune(bucket: Bucket, now: number) {
    const cutoff = now - WINDOW_MS
    bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff)
}

export function checkAuthRateLimit(
    ip: string,
    action: 'login' | 'signup' | 'forgot-password',
    now: number = Date.now()
): AuthRateLimitResult {
    cleanupBuckets(now)

    const limits: Record<string, number> = {
        login: 5,
        signup: 3,
        'forgot-password': 3,
    }

    const limit = limits[action] || 5
    const key = `${action}:${ip}`

    const bucket = buckets.get(key) ?? { timestamps: [] }
    prune(bucket, now)

    const used = bucket.timestamps.length
    const remaining = Math.max(0, limit - used)

    if (remaining <= 0) {
        const oldest = bucket.timestamps[0] ?? now
        const retryAfterMs = oldest + WINDOW_MS - now
        const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)

        return {
            allowed: false,
            limit,
            remaining: 0,
            retryAfterSeconds: Math.max(0, retryAfterSeconds),
        }
    }

    // Consume one attempt
    bucket.timestamps.push(now)
    buckets.set(key, bucket)

    return {
        allowed: true,
        limit,
        remaining: remaining - 1,
        retryAfterSeconds: 0,
    }
}

/**
 * Helper to extract IP from request headers
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    const realIp = request.headers.get('x-real-ip')
    if (realIp) {
        return realIp.trim()
    }
    return '0.0.0.0'
}
