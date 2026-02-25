import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOnboarding(userId: string | undefined) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const data = await response.json()
          setCompletedSteps(data.completedSteps || [])
        }
      } catch (err) {
        console.error('Error fetching onboarding status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [userId])

  const isStepCompleted = (stepId: number) => completedSteps.includes(stepId)

  return {
    completedSteps,
    isStepCompleted,
    loading,
  }
}
