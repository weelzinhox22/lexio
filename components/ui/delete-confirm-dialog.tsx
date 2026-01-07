'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  itemName: string
  itemType: 'processo' | 'cliente' | 'documento' | 'prazo' | 'lead' | 'transação'
  isLoading?: boolean
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  itemType,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')

  if (!isOpen) return null

  const handleConfirm = () => {
    if (confirmText === itemName) {
      onConfirm()
      setConfirmText('')
    }
  }

  const handleClose = () => {
    setConfirmText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Confirmar Exclusão</h2>
        </div>

        <div className="mb-6 space-y-4">
          <p className="text-slate-600">
            Você está prestes a excluir o {itemType} <strong>"{itemName}"</strong>. Esta ação não
            pode ser desfeita.
          </p>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Digite o nome do {itemType} para confirmar:
            </label>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={itemName}
              className="border-slate-300 focus:border-red-400 focus:ring-red-200"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={confirmText !== itemName || isLoading}
            className={cn(
              'flex-1 bg-red-600 hover:bg-red-700 text-white',
              confirmText !== itemName && 'opacity-50 cursor-not-allowed',
            )}
          >
            {isLoading ? 'Excluindo...' : 'Excluir'}
          </Button>
        </div>
      </div>
    </div>
  )
}

