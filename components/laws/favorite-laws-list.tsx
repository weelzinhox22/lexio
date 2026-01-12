'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ExternalLink, Trash2, Heart, FileText, Loader2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type FavoriteLaw = {
  id: string
  law_name: string
  law_number: string
  law_url: string
  law_category: string
  notes: string | null
  created_at: string
}

export function FavoriteLawsList({ favorites }: { favorites: FavoriteLaw[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleUpdateNotes = async (lawUrl: string) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/laws/favorite/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          law_url: lawUrl,
          notes: notes[lawUrl] || null,
        }),
      })

      if (!response.ok) throw new Error('Erro ao atualizar notas')
      
      setEditingId(null)
    } catch (error) {
      console.error('Erro ao atualizar notas:', error)
      alert('Erro ao salvar notas')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (lawUrl: string, lawName: string) => {
    setIsDeleting(lawUrl)
    try {
      const response = await fetch(`/api/laws/favorite?law_url=${encodeURIComponent(lawUrl)}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Erro ao remover favorito')
      
      window.location.reload()
    } catch (error) {
      console.error('Erro ao remover favorito:', error)
      alert('Erro ao remover favorito')
      setIsDeleting(null)
    }
  }

  return (
    <div className="grid gap-4 md:gap-6">
      {favorites.map((favorite) => (
        <Card key={favorite.id} className="border-slate-200 hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg md:text-xl mb-2 break-words">
                  {favorite.law_name}
                </CardTitle>
                <CardDescription className="text-sm mb-2">
                  {favorite.law_number}
                </CardDescription>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {favorite.law_category}
                  </Badge>
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    Favorita
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(favorite.law_url, '_blank')}
                  className="text-xs md:text-sm"
                >
                  <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  Abrir
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs md:text-sm"
                      disabled={isDeleting === favorite.law_url}
                    >
                      {isDeleting === favorite.law_url ? (
                        <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover dos Favoritos?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover <strong>{favorite.law_name}</strong> dos seus favoritos?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(favorite.law_url, favorite.law_name)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {editingId === favorite.id ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Minhas Notas
                </label>
                <Textarea
                  value={notes[favorite.law_url] ?? favorite.notes ?? ''}
                  onChange={(e) => setNotes({ ...notes, [favorite.law_url]: e.target.value })}
                  rows={3}
                  className="text-sm"
                  placeholder="Adicione suas notas pessoais sobre esta lei..."
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateNotes(favorite.law_url)}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Notas'
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null)
                      setNotes({ ...notes, [favorite.law_url]: favorite.notes ?? '' })
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Minhas Notas
                  </label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(favorite.id)
                      setNotes({ ...notes, [favorite.law_url]: favorite.notes ?? '' })
                    }}
                    className="text-xs"
                  >
                    Editar
                  </Button>
                </div>
                {favorite.notes ? (
                  <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-wrap">
                    {favorite.notes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 italic bg-slate-50 rounded-lg p-3">
                    Nenhuma nota adicionada ainda. Clique em "Editar" para adicionar.
                  </p>
                )}
              </div>
            )}
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-500">
                Adicionada em {new Date(favorite.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}









