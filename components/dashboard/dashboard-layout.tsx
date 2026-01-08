'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingModal } from '@/components/onboarding/onboarding-modal'

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

  useEffect(() => {
    // Verificar se é primeira vez do usuário
    if (!userId) {
      setLoading(false)
      return
    }

    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status', {
          method: 'GET',
        })

        if (response.ok) {
          const data = await response.json()
          setCompletedSteps(data.completedSteps || [])
          
          // Mostrar modal se usuário é novo (nenhuma etapa completa)
          if (data.isNewUser) {
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

  if (loading) {
    return <div>{children}</div>
  }

  return (
    <>
      {children}
      <OnboardingModal
        open={showOnboarding}
        onOpenChange={setShowOnboarding}
        completedSteps={completedSteps}
      />
    </>
  )
}
