'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function DiscardPublicationPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadPublication()
  }, [])

  async function loadPublication() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data } = await supabase
        .from('jusbrasil_publications')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!data) {
        router.push('/dashboard/publications')
        return
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading publication:', error)
      router.push('/dashboard/publications')
    }
  }

  async function handleDiscard() {
    setSaving(true)
    try {
      const response = await fetch('/api/jusbrasil/publications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          publicationId: id, 
          status: 'discarded',
          notes: notes.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (data.publication) {
        router.push(`/dashboard/publications/${id}`)
      } else {
        alert('Erro ao descartar publicação')
      }
    } catch (error) {
      console.error('Error discarding publication:', error)
      alert('Erro ao descartar publicação')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Descartar Publicação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Motivo do descarte (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione o motivo pelo qual esta publicação está sendo descartada..."
              rows={5}
              className="mt-2"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDiscard}
              disabled={saving}
              variant="destructive"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Descartar Publicação'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

