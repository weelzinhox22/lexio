'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'

type EffectiveUserContextType = {
    /** The actual logged-in user ID */
    authUserId: string | null
    /** The effective user ID for data queries (owner_id for interns, auth uid for lawyers) */
    effectiveUserId: string | null
    /** Whether the user is an intern */
    isIntern: boolean
    /** The owner (lawyer) name, if intern */
    ownerName: string | null
    /** The intern's own name */
    internName: string | null
    /** Loading state */
    loading: boolean
}

const EffectiveUserContext = createContext<EffectiveUserContextType>({
    authUserId: null,
    effectiveUserId: null,
    isIntern: false,
    ownerName: null,
    internName: null,
    loading: true,
})

export function useEffectiveUser() {
    return useContext(EffectiveUserContext)
}

export function EffectiveUserProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<EffectiveUserContextType>({
        authUserId: null,
        effectiveUserId: null,
        isIntern: false,
        ownerName: null,
        internName: null,
        loading: true,
    })

    useEffect(() => {
        async function resolve() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setState(s => ({ ...s, loading: false }))
                return
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
                // It's an intern - resolve the owner's name
                const { data: ownerProfile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', internRecord.owner_id)
                    .single()

                setState({
                    authUserId,
                    effectiveUserId: internRecord.owner_id,
                    isIntern: true,
                    ownerName: ownerProfile?.full_name || 'Advogado',
                    internName: internRecord.name,
                    loading: false,
                })
            } else {
                // Regular user (lawyer/admin)
                setState({
                    authUserId,
                    effectiveUserId: authUserId,
                    isIntern: false,
                    ownerName: null,
                    internName: null,
                    loading: false,
                })
            }
        }

        resolve()
    }, [])

    return (
        <EffectiveUserContext.Provider value={state}>
            {children}
        </EffectiveUserContext.Provider>
    )
}
