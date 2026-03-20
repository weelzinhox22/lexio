'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const EMAIL_ALERTS_KEY = 'themixa-email-alerts-onboarding-seen'
const EMAIL_ALERTS_EVENT = 'themixa-email-alerts-event'

export function useEmailPopup(userId?: string, userEmail?: string) {
  const [showPopup, setShowPopup] = useState(false)
  const [emailTarget, setEmailTarget] = useState('')

  useEffect(() => {
    if (!userId) return

    const run = async () => {
      try {
        const hasSeen = localStorage.getItem(EMAIL_ALERTS_KEY)
        if (hasSeen === 'true') {
          return
        }

        const supabase = createClient()

        // Só mostra se tem pelo menos 1 prazo ativo
        const { data: anyDeadline } = await supabase
          .from('deadlines')
          .select('id')
          .eq('user_id', userId)
          .neq('status', 'completed')
          .limit(1)

        if (!anyDeadline || anyDeadline.length === 0) return

        const { data: settings } = await supabase
          .from('notification_settings')
          .select('email_enabled, email_override')
          .eq('user_id', userId)
          .maybeSingle()

        // Se ainda não configurou, mostra 1x como sugestão
        if (!settings) {
          setEmailTarget(String(userEmail || '').trim())
          setShowPopup(true)
          return
        }

        if ((settings as any).email_enabled === false) return

        const override = String((settings as any).email_override || '').trim()
        if (override) return

        setEmailTarget(String(userEmail || '').trim())
        setShowPopup(true)
      } catch (e) {
        console.warn('[dashboard] email onboarding check failed', e)
      }
    }

    run()

    const handleEvent = () => setShowPopup(false)

    window.addEventListener(EMAIL_ALERTS_EVENT, handleEvent)
    return () => window.removeEventListener(EMAIL_ALERTS_EVENT, handleEvent)
  }, [userId, userEmail])

  const markAsSeen = () => {
    localStorage.setItem(EMAIL_ALERTS_KEY, 'true')
    setShowPopup(false)
    window.dispatchEvent(new Event(EMAIL_ALERTS_EVENT))
  }

  return { showPopup, emailTarget, markAsSeen }
}
