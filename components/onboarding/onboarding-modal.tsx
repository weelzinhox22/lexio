'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  User,
  Briefcase,
  Bell,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completedSteps: number[]
}

const STEPS = [
  {
    id: 1,
    title: 'Complete seu perfil',
    description: 'Adicione seu nome, OAB e dados de contato.',
    icon: <User className="w-5 h-5" />,
    href: '/dashboard/settings',
  },
  {
    id: 2,
    title: 'Cadastre um processo',
    description: 'Adicione seu primeiro processo para acompanhar.',
    icon: <Briefcase className="w-5 h-5" />,
    href: '/dashboard/processes',
  },
  {
    id: 3,
    title: 'Crie um prazo',
    description: 'Configure um prazo e receba alertas automáticos.',
    icon: <Bell className="w-5 h-5" />,
    href: '/dashboard/deadlines',
  },
]

export function OnboardingModal({ open, onOpenChange, completedSteps }: OnboardingModalProps) {
  const router = useRouter()

  const steps = STEPS.map((step) => ({
    ...step,
    completed: completedSteps.includes(step.id),
  }))

  const completedCount = steps.filter((s) => s.completed).length
  const allDone = completedCount === steps.length

  const handleStepClick = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <DialogTitle className="text-xl">Bem-vindo ao Themixa!</DialogTitle>
          </div>
          <DialogDescription>
            {allDone
              ? 'Tudo pronto! Você já pode aproveitar a plataforma.'
              : 'Configure o essencial em 3 passos rápidos:'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-4">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => !step.completed && handleStepClick(step.href)}
              disabled={step.completed}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${step.completed
                  ? 'border-green-200 bg-green-50 cursor-default'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5 cursor-pointer'
                }`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${step.completed ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                }`}>
                {step.completed ? <CheckCircle2 className="w-5 h-5" /> : step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${step.completed ? 'text-green-700 line-through' : 'text-slate-900'}`}>
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              </div>
              {!step.completed && (
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            {allDone ? 'Fechar' : 'Fazer depois'}
          </Button>
          {!allDone && (
            <Button
              onClick={() => {
                const next = steps.find((s) => !s.completed)
                if (next) handleStepClick(next.href)
              }}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
            >
              Começar
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
