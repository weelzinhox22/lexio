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
  ListTodo,
  DollarSign,
  FileText,
  Users,
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
    title: 'Configuração inicial',
    description: 'Crie sua conta, cadastre processos e defina seu nome para publicações',
    icon: <User className="w-6 h-6" />,
    href: '/onboarding/setup',
    completed: false,
  },
  {
    id: 2,
    title: 'Adicionar uma tarefa',
    description: 'Organize seus compromissos criando sua primeira tarefa',
    icon: <ListTodo className="w-6 h-6" />,
    href: '/onboarding/task',
    completed: false,
  },
  {
    id: 3,
    title: 'Adicionar um honorário',
    description: 'Controle seus ganhos cadastrando um honorário',
    icon: <DollarSign className="w-6 h-6" />,
    href: '/onboarding/fee',
    completed: false,
  },
  {
    id: 4,
    title: 'Tratar uma publicação',
    description: 'Mantenha processos em dia tratando sua primeira publicação',
    icon: <FileText className="w-6 h-6" />,
    href: '/onboarding/publication',
    completed: false,
  },
  {
    id: 5,
    title: 'Convidar usuários',
    description: 'Traga sua equipe para colaborar com você',
    icon: <Users className="w-6 h-6" />,
    href: '/onboarding/invite',
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Bem-vindo ao SaaS Jurídico! 🎉</DialogTitle>
          <DialogDescription>
            Vamos começar com os primeiros passos para configurar sua conta
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
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
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
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
            >
              Próximo Passo
            </Button>
          )}
          {completedCount === totalSteps && (
            <Button className="bg-green-600 hover:bg-green-700">
              ✓ Configuração Completa!
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
