'use client'

import { useState, useEffect } from 'react'

const POPUPS_INTERACTED_KEY = 'themixa-popups-interacted'
const POPUPS_INTERACTED_EVENT = 'themixa-popups-interacted-event'

export function usePopups() {
  const [showPopups, setShowPopups] = useState<boolean>(false)

  useEffect(() => {
    const hasInteracted = localStorage.getItem(POPUPS_INTERACTED_KEY)
    if (!hasInteracted) {
      setShowPopups(true)
    }

    const handleEvent = () => setShowPopups(false)

    window.addEventListener(POPUPS_INTERACTED_EVENT, handleEvent)
    return () => window.removeEventListener(POPUPS_INTERACTED_EVENT, handleEvent)
  }, [])

  const markAsInteracted = () => {
    localStorage.setItem(POPUPS_INTERACTED_KEY, 'true')
    setShowPopups(false)
    window.dispatchEvent(new Event(POPUPS_INTERACTED_EVENT))
  }

  return { showPopups, markAsInteracted }
}
