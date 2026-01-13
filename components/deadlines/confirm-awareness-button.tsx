'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function ConfirmAwarenessButton({
  deadlineId,
  disabled,
}: {
  deadlineId: string
  disabled?: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || loading}
      onClick={async () => {
        try {
          setLoading(true)
          await fetch(`/api/deadlines/${deadlineId}/ack`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
          })
          router.refresh()
        } finally {
          setLoading(false)
        }
      }}
    >
      {disabled ? 'Ciência confirmada' : loading ? 'Confirmando…' : 'Confirmar ciência'}
    </Button>
  )
}




