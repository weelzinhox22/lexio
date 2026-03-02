'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type InternPermissions = Record<string, boolean> | null

/**
 * Hook to check if the current user is an intern and fetch their permissions.
 * Returns null if not an intern (full access), or the permissions object if intern.
 */
export function useInternPermissions() {
    const [permissions, setPermissions] = useState<InternPermissions>(null)
    const [isIntern, setIsIntern] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkInternStatus() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            // Check if user is an intern by checking the profile role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role !== 'estagiario') {
                setIsIntern(false)
                setPermissions(null)
                setLoading(false)
                return
            }

            // User is an intern - fetch their permissions
            const { data: internRecord } = await supabase
                .from('interns')
                .select('permissions, status')
                .eq('user_id', user.id)
                .single()

            if (internRecord) {
                setIsIntern(true)
                // If intern is inactive, deny all
                if (internRecord.status !== 'active') {
                    setPermissions({})
                } else {
                    setPermissions(internRecord.permissions as Record<string, boolean>)
                }
            }

            setLoading(false)
        }

        checkInternStatus()
    }, [])

    return { permissions, isIntern, loading }
}

/**
 * Maps navigation href paths to permission keys.
 */
export const HREF_TO_PERMISSION: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/dashboard/processes': 'processes',
    '/dashboard/kanban': 'kanban',
    '/dashboard/deadlines': 'deadlines',
    '/dashboard/calendar': 'calendar',
    '/dashboard/documents': 'documents',
    '/dashboard/templates': 'templates',
    '/dashboard/ai-writer': 'ai_writer',
    '/dashboard/ai-analysis': 'ai_analysis',
    '/dashboard/laws': 'laws',
    '/dashboard/laws/favorites': 'laws',
    '/dashboard/criminal/calculator': 'tools',
    '/dashboard/family/partilha': 'tools',
    '/dashboard/family/heritage': 'tools',
    '/dashboard/consumer/indebito': 'tools',
    '/dashboard/consumer/damages': 'tools',
    '/dashboard/timesheet': 'timesheet',
    '/dashboard/clients': 'clients',
    '/dashboard/leads': 'leads',
    '/dashboard/interns': 'dashboard', // Only lawyers see this, interns won't
    '/dashboard/financial': 'financial',
    '/dashboard/reports': 'reports',
    '/dashboard/subscription': 'subscription',
    '/dashboard/settings': 'settings',
}
