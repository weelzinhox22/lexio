'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useToolsConsent() {
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [isLoadingConsent, setIsLoadingConsent] = useState(true)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const checkConsent = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setIsLoadingConsent(false)
          return
        }
        
        setUserId(user.id)

        const { data, error } = await supabase
          .from('profiles')
          .select('tools_accepted')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error fetching tools consent:', error)
          setIsLoadingConsent(false)
          return
        }

        if (!data?.tools_accepted) {
          setShowConsentModal(true)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setIsLoadingConsent(false)
      }
    }

    checkConsent()
  }, [])

  const handleAcceptConsent = () => {
    setShowConsentModal(false)
  }

  return { showConsentModal, isLoadingConsent, handleAcceptConsent, userId }
}
