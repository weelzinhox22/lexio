import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Simple in-memory rate limiter for auth routes (edge-compatible)
const authAttempts = new Map<string, { count: number; resetAt: number }>()

function checkAuthRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const windowMs = 1 * 60 * 1000 // 1 minute
  const maxAttempts = 10 // 10 attempts per minute

  const entry = authAttempts.get(ip)

  // Cleanup expired entries periodically
  if (authAttempts.size > 1000) {
    for (const [key, val] of authAttempts.entries()) {
      if (now > val.resetAt) authAttempts.delete(key)
    }
  }

  if (!entry || now > entry.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= maxAttempts) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { allowed: false, retryAfter }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}

// Block dev routes in production unless explicitly allowed
function isDevRouteBlocked(request: NextRequest): boolean {
  if (!request.nextUrl.pathname.startsWith('/api/dev/')) {
    return false
  }
  // In production, block unless ALLOW_DEV_ROUTES is set
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== '1') {
    return true
  }
  return false
}

export async function middleware(request: NextRequest) {
  try {
    // Block dev routes in production
    if (isDevRouteBlocked(request)) {
      return NextResponse.json(
        { error: "Not found" },
        { status: 404 }
      )
    }

    // Rate limit auth pages (brute-force protection)
    if (
      request.nextUrl.pathname.startsWith('/auth/login') ||
      request.nextUrl.pathname.startsWith('/auth/sign-up') ||
      request.nextUrl.pathname.startsWith('/auth/forgot-password')
    ) {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || '0.0.0.0'

      const { allowed, retryAfter } = checkAuthRateLimit(ip)

      if (!allowed) {
        return NextResponse.json(
          { error: "Muitas tentativas. Tente novamente mais tarde.", retryAfter },
          {
            status: 429,
            headers: { 'Retry-After': String(retryAfter) },
          }
        )
      }
    }

    return await updateSession(request)
  } catch (error) {
    console.error("[Middleware Error]:", error)

    if (error instanceof Error) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Configuration error. Please check environment variables." },
          { status: 500 }
        )
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
