"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, ArrowRight, Bell, Mail, Settings, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type TourStep = {
  id: number
  title: string
  description: string
  target: string // ID do elemento ou seletor
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    href: string
  }
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: "Criar seu primeiro prazo",
    description: "Comece cadastrando um prazo importante. Você receberá alertas automáticos por e-mail.",
    target: "#tour-create-deadline",
    position: 'bottom',
    action: {
      label: "Criar prazo",
      href: "/dashboard/deadlines/new?onboarding=true"
    }
  },
  {
    id: 2,
    title: "Como funcionam os alertas",
    description: "Você receberá alertas automáticos em 7, 3, 1 dia e no dia do prazo. Nós cuidamos dos alertas, você cuida do processo.",
    target: "#tour-alerts-info",
    position: 'right',
  },
  {
    id: 3,
    title: "Configurar e-mail",
    description: "Configure o e-mail que receberá os alertas. Você também pode adicionar um e-mail alternativo como backup.",
    target: "#tour-email-settings",
    position: 'left',
    action: {
      label: "Configurar",
      href: "/dashboard/settings/notifications"
    }
  },
  {
    id: 4,
    title: "Ver notificações",
    description: "Acompanhe todos os alertas enviados e o status do sistema aqui.",
    target: "#tour-notifications",
    position: 'top',
    action: {
      label: "Ver histórico",
      href: "/dashboard/deadlines/alerts"
    }
  },
  {
    id: 5,
    title: "Pronto para começar!",
    description: "Agora você está pronto para usar o Themixa. Crie seu primeiro prazo e comece a receber alertas automáticos.",
    target: "#tour-complete",
    position: 'bottom',
    action: {
      label: "Criar primeiro prazo",
      href: "/dashboard/deadlines/new?onboarding=true"
    }
  },
]

export function GuidedTour({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkTourStatus = async () => {
      // Verificar se já completou o tour
      const tourCompleted = localStorage.getItem(`tour-completed-${userId}`)
      if (tourCompleted === 'true') return

      // Verificar se é primeira visita
      const hasSeenTour = localStorage.getItem(`tour-seen-${userId}`)
      if (hasSeenTour) return

      // Verificar se tem pelo menos 1 prazo (se tiver, não mostrar tour)
      const supabase = createClient()
      const { data: deadlines } = await supabase
        .from("deadlines")
        .select("id")
        .eq("user_id", userId)
        .limit(1)

      if (deadlines && deadlines.length > 0) {
        localStorage.setItem(`tour-completed-${userId}`, 'true')
        return
      }

      // Aguardar um pouco para não ser intrusivo
      setTimeout(() => {
        setOpen(true)
        localStorage.setItem(`tour-seen-${userId}`, 'true')
      }, 2000)
    }

    if (userId) {
      checkTourStatus()
    }
  }, [userId])

  const currentStepData = TOUR_STEPS[currentStep]
  const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem(`tour-completed-${userId}`, 'true')
    setOpen(false)
  }

  const handleComplete = () => {
    localStorage.setItem(`tour-completed-${userId}`, 'true')
    setOpen(false)
    if (currentStepData?.action?.href) {
      router.push(currentStepData.action.href)
    }
  }

  if (!open || !currentStepData) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleSkip()
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-lg">{currentStepData.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Passo {currentStep + 1} de {TOUR_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="w-full sm:w-auto"
          >
            Pular tour
          </Button>
          {currentStepData.action ? (
            <Button
              onClick={() => {
                handleComplete()
                if (currentStepData.action?.href) {
                  router.push(currentStepData.action.href)
                }
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStepData.action.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
            >
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

