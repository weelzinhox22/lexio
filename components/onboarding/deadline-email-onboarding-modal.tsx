'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Bell, ArrowRight } from 'lucide-react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetEmail: string
}

export function DeadlineEmailOnboardingModal({ open, onOpenChange, targetEmail }: Props) {
  const router = useRouter()

  const safeEmail = useMemo(() => targetEmail?.trim() || 'seu e-mail de login', [targetEmail])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Receba alertas de prazo por e-mail</DialogTitle>
          <DialogDescription>
            Você pode cadastrar um e-mail para receber lembretes automáticos de prazos (7/3/1/0 dias antes).
          </DialogDescription>
        </DialogHeader>

        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-blue-50 p-2">
                <Mail className="h-5 w-5 text-blue-700" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">E-mail de destino</div>
                <div className="text-sm text-slate-600 break-words">
                  Vamos usar: <span className="font-medium">{safeEmail}</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Você pode trocar por um e-mail alternativo nas configurações.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-yellow-50 p-2">
                <Bell className="h-5 w-5 text-yellow-700" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">Como funciona</div>
                <div className="text-sm text-slate-600">
                  O Themixa envia alertas apenas para prazos cadastrados por você. O alerta é auxiliar e não substitui a
                  conferência nos autos.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Agora não
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false)
              router.push('/dashboard/settings/notifications')
            }}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            Configurar alertas <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}




