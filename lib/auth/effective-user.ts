import { createClient } from '@/lib/supabase/server'

/**
 * Server-side helper to get the effective user ID.
 * For interns: returns the owner_id (lawyer's ID)
 * For lawyers/admins: returns auth.uid
 */
export async function getEffectiveUserId(): Promise<{
    authUserId: string
    effectiveUserId: string
    isIntern: boolean
    ownerName: string | null
}> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const authUserId = user.id

    // Check if user is an intern
    const { data: internRecord } = await supabase
        .from('interns')
        .select('owner_id, name, status')
        .eq('user_id', authUserId)
        .eq('status', 'active')
        .maybeSingle()

    if (internRecord?.owner_id) {
        // Get owner's name
        const { data: ownerProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', internRecord.owner_id)
            .single()

        return {
            authUserId,
            effectiveUserId: internRecord.owner_id,
            isIntern: true,
            ownerName: ownerProfile?.full_name || null,
        }
    }

    return {
        authUserId,
        effectiveUserId: authUserId,
        isIntern: false,
        ownerName: null,
    }
}
