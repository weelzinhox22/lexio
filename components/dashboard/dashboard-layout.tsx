'use client'

import { useState, useEffect } from 'react'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { DeadlineEmailOnboardingModal } from '@/components/onboarding/deadline-email-onboarding-modal'
import { createClient } from '@/lib/supabase/client'
import { useEmailPopup } from '@/lib/hooks/use-email-popup'

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

  const { showPopup: showEmailOnboarding, emailTarget, markAsSeen: markEmailAsSeen } = useEmailPopup(userId, userEmail)

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
          if (!open) markEmailAsSeen()
        }}
        targetEmail={emailTarget}
      />
    </>
  )
}
