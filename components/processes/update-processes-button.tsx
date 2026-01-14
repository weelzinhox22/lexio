'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpdateProcessesButtonProps {
  userId: string
}

export function UpdateProcessesButton({ userId }: UpdateProcessesButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpdate = async () => {
    setIsLoading(true)
    setSuccess(false)

    try {
      const response = await fetch('/api/processes/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar processos')
      }

      const data = await response.json()
      setSuccess(true)
      
      // Recarregar a página após 1.5s
      setTimeout(() => {
        router.refresh()
        setSuccess(false)
      }, 1500)
    } catch (error) {
      console.error('[Update Processes Error]:', error)
      alert('Erro ao atualizar processos. Esta funcionalidade requer integração com APIs de tribunais.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleUpdate}
      disabled={isLoading}
      variant="outline"
      className="border-slate-300 hover:bg-slate-100 hover:border-slate-400 transition-all"
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Atualizando...
        </>
      ) : success ? (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
          Atualizado!
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Processos
        </>
      )}
    </Button>
  )
}












