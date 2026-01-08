import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useOnboarding(userId: string | undefined) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchOnboardingStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('onboarding_completed_steps')
          .eq('user_id', userId)
          .single()

        if (!error && data) {
          setCompletedSteps(data.onboarding_completed_steps || [])
        }
      } catch (err) {
        console.error('Error fetching onboarding status:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchOnboardingStatus()
  }, [userId, supabase])

  const completeStep = async (stepId: number) => {
    if (!userId) return

    const newSteps = Array.from(new Set([...completedSteps, stepId]))
    setCompletedSteps(newSteps)

    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed_steps: newSteps })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Error updating onboarding status:', err)
      // Revert on error
      setCompletedSteps(completedSteps)
    }
  }

  const resetOnboarding = async () => {
    if (!userId) return

    setCompletedSteps([])

    try {
      await supabase
        .from('user_profiles')
        .update({ onboarding_completed_steps: [] })
        .eq('user_id', userId)
    } catch (err) {
      console.error('Error resetting onboarding:', err)
    }
  }

  return {
    completedSteps,
    completeStep,
    resetOnboarding,
    loading,
  }
}
