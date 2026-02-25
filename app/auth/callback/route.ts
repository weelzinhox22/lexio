import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /auth/callback
 *
 * Handles the OAuth/email callback from Supabase.
 * This route exchanges the auth code for a session.
 *
 * Used by:
 * - Email confirmation (sign-up)
 * - Password reset (forgot-password flow)
 * - OAuth providers (Google login)
 *
 * The `code` param is provided by Supabase in the redirect URL.
 * The `next` param indicates where to redirect after successful auth.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)

    const code = searchParams.get('code')
    const type = searchParams.get('type') // 'recovery' for password reset

    // Validate 'next' param to prevent open redirect attacks
    const rawNext = searchParams.get('next') || '/dashboard'
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // If this is a password recovery, redirect to reset-password page
            if (type === 'recovery') {
                return NextResponse.redirect(`${origin}/auth/reset-password`)
            }
            // For all other cases (signup confirmation, OAuth), redirect to next
            return NextResponse.redirect(`${origin}${next}`)
        }

        console.error('[Auth Callback] Error exchanging code:', error.message)
    }

    // If something went wrong, redirect to login with error
    return NextResponse.redirect(`${origin}/auth/login?error=auth_callback_failed`)
}
