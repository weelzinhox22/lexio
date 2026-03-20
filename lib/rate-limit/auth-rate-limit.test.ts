import { describe, expect, it } from 'vitest'
import { checkAuthRateLimit, getClientIp } from './auth-rate-limit'

describe('auth-rate-limit', () => {
    it('allows first request', () => {
        const result = checkAuthRateLimit('192.168.1.1', 'login', Date.now())
        expect(result.allowed).toBe(true)
        expect(result.remaining).toBe(4) // 5 limit - 1 used
    })

    it('blocks after exceeding login limit (5)', () => {
        const ip = '10.0.0.1'
        const now = Date.now()

        // Consume all 5 attempts
        for (let i = 0; i < 5; i++) {
            const r = checkAuthRateLimit(ip, 'login', now + i)
            expect(r.allowed).toBe(true)
        }

        // 6th attempt should be blocked
        const blocked = checkAuthRateLimit(ip, 'login', now + 10)
        expect(blocked.allowed).toBe(false)
        expect(blocked.remaining).toBe(0)
        expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    })

    it('blocks after exceeding signup limit (3)', () => {
        const ip = '10.0.0.2'
        const now = Date.now()

        for (let i = 0; i < 3; i++) {
            checkAuthRateLimit(ip, 'signup', now + i)
        }

        const blocked = checkAuthRateLimit(ip, 'signup', now + 10)
        expect(blocked.allowed).toBe(false)
    })

    it('blocks after exceeding forgot-password limit (3)', () => {
        const ip = '10.0.0.3'
        const now = Date.now()

        for (let i = 0; i < 3; i++) {
            checkAuthRateLimit(ip, 'forgot-password', now + i)
        }

        const blocked = checkAuthRateLimit(ip, 'forgot-password', now + 10)
        expect(blocked.allowed).toBe(false)
    })

    it('resets after window expires', () => {
        const ip = '10.0.0.4'
        const now = Date.now()
        const windowMs = 15 * 60 * 1000

        // Exhaust limit
        for (let i = 0; i < 5; i++) {
            checkAuthRateLimit(ip, 'login', now + i)
        }

        // Should be blocked
        expect(checkAuthRateLimit(ip, 'login', now + 10).allowed).toBe(false)

        // After window expires, should be allowed again
        const afterWindow = now + windowMs + 1000
        const result = checkAuthRateLimit(ip, 'login', afterWindow)
        expect(result.allowed).toBe(true)
    })

    it('tracks different IPs independently', () => {
        const now = Date.now()

        // Exhaust IP A
        for (let i = 0; i < 5; i++) {
            checkAuthRateLimit('ip-a', 'login', now + i)
        }
        expect(checkAuthRateLimit('ip-a', 'login', now + 10).allowed).toBe(false)

        // IP B should still be allowed
        expect(checkAuthRateLimit('ip-b', 'login', now + 20).allowed).toBe(true)
    })

    it('tracks different actions independently', () => {
        const ip = '10.0.0.5'
        const now = Date.now()

        // Exhaust login
        for (let i = 0; i < 5; i++) {
            checkAuthRateLimit(ip, 'login', now + i)
        }

        // Signup should still work (different action bucket)
        expect(checkAuthRateLimit(ip, 'signup', now + 10).allowed).toBe(true)
    })

    describe('getClientIp', () => {
        it('extracts IP from x-forwarded-for', () => {
            const req = new Request('http://localhost', {
                headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
            })
            expect(getClientIp(req)).toBe('1.2.3.4')
        })

        it('extracts IP from x-real-ip', () => {
            const req = new Request('http://localhost', {
                headers: { 'x-real-ip': '9.8.7.6' },
            })
            expect(getClientIp(req)).toBe('9.8.7.6')
        })

        it('falls back to 0.0.0.0', () => {
            const req = new Request('http://localhost')
            expect(getClientIp(req)).toBe('0.0.0.0')
        })
    })
})
