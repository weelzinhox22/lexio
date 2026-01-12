'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'
import { DeadlineEmailOnboardingModal } from '@/components/onboarding/deadline-email-onboarding-modal'
import { createClient } from '@/lib/supabase/client'

interface DashboardLayoutProps {
  children: React.ReactNode
  userId: string | undefined
  userEmail: string | undefined
}

export function DashboardLayout({ children, userId, userEmail }: DashboardLayoutProps) {
  const router = useRouter()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const [showEmailOnboarding, setShowEmailOnboarding] = useState(false)
  const [emailTarget, setEmailTarget] = useState<string>('')

  const onboardingSeenKey = 'themixa-dashboard-onboarding-seen'
  const emailAlertsSeenKey = 'themixa-email-alerts-onboarding-seen'

  useEffect(() => {
    // Verificar se é primeira vez do usuário
    if (!userId) {
      setLoading(false)
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const onboardingAlreadySeen = localStorage.getItem(onboardingSeenKey) === 'true'

        const response = await fetch('/api/onboarding/status', {
          method: 'GET',
        })

        if (response.ok) {
          const data = await response.json()
          setCompletedSteps(data.completedSteps || [])
          
          // Mostrar modal se usuário é novo (nenhuma etapa completa)
          if (data.isNewUser && !onboardingAlreadySeen) {
            setShowOnboarding(true)
          }
        }
      } catch (err) {
        console.error('Error checking onboarding status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [userId])

  useEffect(() => {
    if (!userId) return

    const run = async () => {
      try {
        const emailOnboardingAlreadySeen = localStorage.getItem(emailAlertsSeenKey) === 'true'
        if (emailOnboardingAlreadySeen) return

        const supabase = createClient()

        // Só faz sentido mostrar se o usuário tem pelo menos 1 prazo ativo
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

        // Se ainda não configurou (sem registro), mostramos 1x como sugestão.
        if (!settings) {
          setEmailTarget(String(userEmail || '').trim())
          setShowEmailOnboarding(true)
          return
        }

        // Se desativou alertas, não incomoda.
        if ((settings as any).email_enabled === false) return

        // Se já tem override, assume configurado.
        const override = String((settings as any).email_override || '').trim()
        if (override) return

        // Se não tem override, ainda pode querer configurar o e-mail (opcional). Mostra 1x.
        setEmailTarget(String(userEmail || '').trim())
        setShowEmailOnboarding(true)
      } catch (e) {
        console.warn('[dashboard] email onboarding check failed', e)
      }
    }

    run()
  }, [userId, userEmail])

  if (loading) {
    return <div>{children}</div>
  }

  return (
    <>
      {children}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={(open) => {
          setShowOnboarding(open)
          if (!open) localStorage.setItem(onboardingSeenKey, 'true')
        }}
        completedSteps={completedSteps}
      />
      <DeadlineEmailOnboardingModal
        open={showEmailOnboarding}
        onOpenChange={(open) => {
          setShowEmailOnboarding(open)
          if (!open) localStorage.setItem(emailAlertsSeenKey, 'true')
        }}
        targetEmail={emailTarget}
      />
    </>
  )
}
