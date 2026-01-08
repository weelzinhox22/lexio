'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, ExternalLink, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface PublicationActionsProps {
  publicationId: string
  processNumber: string | null
  pjeUrl: string | null
  status: string
}

export function PublicationActions({ publicationId, processNumber, pjeUrl, status }: PublicationActionsProps) {
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  async function refreshPublication() {
    if (!processNumber) return

    setRefreshing(true)
    try {
      const response = await fetch('/api/jusbrasil/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processNumber }),
      })

      const data = await response.json()

      if (data.success) {
        const count = data.publications_saved || 0
        toast.success('Publicação atualizada!', {
          description: `${count} publicação(ões) encontrada(s) e atualizada(s).`,
        })
        router.refresh()
      } else {
        toast.error('Erro ao atualizar publicação', {
          description: data.error || 'Erro desconhecido',
        })
      }
    } catch (error) {
      console.error('Error refreshing publication:', error)
      toast.error('Erro ao atualizar publicação', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      })
    } finally {
      setRefreshing(false)
    }
  }

  // Gerar URL do tribunal baseado no número do processo
  function getTribunalUrl(processNumber: string): string | null {
    const match = processNumber.match(/(\d{7})-(\d{2})\.(\d{4})\.(\d)\.(\d{2})\.(\d{4})/)
    if (!match) return null

    const tribunalCode = match[5]
    const tribunalUrls: Record<string, string> = {
      '05': 'https://pje.tjba.jus.br/pje/Processo', // TJBA
      '21': 'https://www.tjrj.jus.br', // TJRJ
      '26': 'https://esaj.tjsp.jus.br', // TJSP
      '13': 'https://www4.tjmg.jus.br', // TJMG
    }

    return tribunalUrls[tribunalCode] || null
  }

  const tribunalUrl = processNumber ? getTribunalUrl(processNumber) : null

  return (
    <div className="flex flex-wrap gap-2">
      {processNumber && (
        <Button
          variant="outline"
          onClick={refreshPublication}
          disabled={refreshing}
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          {refreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Dados
            </>
          )}
        </Button>
      )}

      {pjeUrl && (
        <Button
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          asChild
        >
          <a href={pjeUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Acessar no PJe
          </a>
        </Button>
      )}

      {tribunalUrl && !pjeUrl && (
        <Button
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
          asChild
        >
          <a href={tribunalUrl} target="_blank" rel="noopener noreferrer">
            <Globe className="h-4 w-4 mr-2" />
            Consultar no Tribunal
          </a>
        </Button>
      )}
    </div>
  )
}

