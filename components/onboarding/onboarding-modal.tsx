'use client'

import { useState, useEffect } from 'react'
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
import { Progress } from '@/components/ui/progress'
import {
  CheckCircle2,
  User,
  Briefcase,
  Bell,
  Mail,
  DollarSign,
  ArrowRight,
} from 'lucide-react'

export interface OnboardingStep {
  id: number
  title: string
  description: string
  icon: React.ReactNode
  href: string
  completed: boolean
}

interface OnboardingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  completedSteps: number[]
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Ajustar seu perfil',
    description: 'Complete suas informações (nome, OAB, telefone) para usar o Themixa com fluidez.',
    icon: <User className="w-6 h-6" />,
    href: '/dashboard/settings',
    completed: false,
  },
  {
    id: 2,
    title: 'Cadastrar um processo',
    description: 'Centralize seus processos e acompanhe tudo em um só lugar.',
    icon: <Briefcase className="w-6 h-6" />,
    href: '/dashboard/processes',
    completed: false,
  },
  {
    id: 3,
    title: 'Criar um prazo',
    description: 'Cadastre prazos e destaque o que é crítico (hoje/amanhã) na sua Dashboard.',
    icon: <Bell className="w-6 h-6" />,
    href: '/dashboard/deadlines',
    completed: false,
  },
  {
    id: 4,
    title: 'Ativar alertas por e-mail',
    description: 'Configure lembretes 7/3/1/0 dias antes e escolha o e-mail de destino.',
    icon: <Mail className="w-6 h-6" />,
    href: '/dashboard/settings/notifications',
    completed: false,
  },
  {
    id: 5,
    title: 'Organizar finanças',
    description: 'Registre receitas/despesas e acompanhe o financeiro do escritório.',
    icon: <DollarSign className="w-6 h-6" />,
    href: '/dashboard/financial',
    completed: false,
  },
]

export function OnboardingModal({ open, onOpenChange, completedSteps }: OnboardingModalProps) {
  const router = useRouter()
  const [steps, setSteps] = useState<OnboardingStep[]>(STEPS)

  useEffect(() => {
    // Marcar passos como concluídos baseado no array completedSteps
    setSteps(
      STEPS.map((step) => ({
        ...step,
        completed: completedSteps.includes(step.id),
      }))
    )
  }, [completedSteps])

  const totalSteps = steps.length
  const completedCount = steps.filter((s) => s.completed).length
  const progressPercentage = (completedCount / totalSteps) * 100

  const handleStepClick = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Guia rápido do Themixa</DialogTitle>
          <DialogDescription>
            Um passo a passo objetivo para você configurar o essencial e aproveitar a plataforma desde o primeiro dia.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">
              {completedCount} de {totalSteps} concluídos
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(progressPercentage)}%
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 my-6">
          {steps.map((step) => (
            <Card
              key={step.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                step.completed
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-200 hover:border-primary'
              }`}
              onClick={() => !step.completed && handleStepClick(step.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {step.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                        {step.id}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-slate-900">{step.title}</h3>
                    <p className="text-xs text-slate-600 mt-1">{step.description}</p>
                  </div>
                  {!step.completed && (
                    <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </Button>
          {completedCount < totalSteps && (
            <Button
              onClick={() => {
                const nextIncompleteStep = steps.find((s) => !s.completed)
                if (nextIncompleteStep) {
                  handleStepClick(nextIncompleteStep.href)
                }
              }}
              className="w-full sm:w-auto"
            >
              Próximo Passo
            </Button>
          )}
          {completedCount === totalSteps && (
            <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
              Configuração completa
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
