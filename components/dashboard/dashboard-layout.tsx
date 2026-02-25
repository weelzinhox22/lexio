'use client'

import { useState, useEffect } from 'react'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { DeadlineEmailOnboardingModal } from '@/components/onboarding/deadline-email-onboarding-modal'
import { createClient } from '@/lib/supabase/client'

interface DashboardLayoutProps {
  children: React.ReactNode
  userId: string | undefined
  userEmail: string | undefined
}

const ONBOARDING_KEY = 'themixa-onboarding-completed'
const EMAIL_ALERTS_KEY = 'themixa-email-alerts-onboarding-seen'

export function DashboardLayout({ children, userId, userEmail }: DashboardLayoutProps) {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const [showEmailOnboarding, setShowEmailOnboarding] = useState(false)
  const [emailTarget, setEmailTarget] = useState<string>('')

  useEffect(() => {
    if (!userId) return

    // Se o usuário já fechou o onboarding, não mostrar mais
    const alreadyDismissed = localStorage.getItem(ONBOARDING_KEY) === 'true'
    if (alreadyDismissed) return

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const data = await response.json()
          setCompletedSteps(data.completedSteps || [])

          // Mostrar somente se é novo usuário (nunca viu o modal)
          if (data.isNewUser) {
            setShowOnboarding(true)
          } else {
            // Se já completou algum passo, marca como visto
            localStorage.setItem(ONBOARDING_KEY, 'true')
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err)
      }
    }

    checkOnboardingStatus()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const run = async () => {
      try {
        const emailOnboardingAlreadySeen = localStorage.getItem(EMAIL_ALERTS_KEY) === 'true'
        if (emailOnboardingAlreadySeen) return

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
          setShowEmailOnboarding(true)
          return
        }

        if ((settings as any).email_enabled === false) return

        const override = String((settings as any).email_override || '').trim()
        if (override) return

        setEmailTarget(String(userEmail || '').trim())
        setShowEmailOnboarding(true)
      } catch (e) {
        console.warn('[dashboard] email onboarding check failed', e)
      }
    }

    run()
  }, [userId, userEmail])

  return (
    <>
      {children}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open)
          if (!open) localStorage.setItem(ONBOARDING_KEY, 'true')
        }}
        completedSteps={completedSteps}
      />
      <DeadlineEmailOnboardingModal
        open={showEmailOnboarding}
        onOpenChange={(open) => {
          setShowEmailOnboarding(open)
          if (!open) localStorage.setItem(EMAIL_ALERTS_KEY, 'true')
        }}
        targetEmail={emailTarget}
      />
    </>
  )
}
