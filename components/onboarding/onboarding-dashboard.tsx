"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle2, Mail, Clock } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function OnboardingDashboard({ userId }: { userId: string }) {
  const [hasDeadlines, setHasDeadlines] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkDeadlines = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from("deadlines")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
      
      setHasDeadlines((data?.length || 0) > 0)
      setLoading(false)
    }

    if (userId) {
      checkDeadlines()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-slate-600">Carregando...</div>
      </div>
    )
  }

  if (hasDeadlines) {
    return null // Não mostrar se já tem prazos
  }

  // Calcular data para 3 dias a partir de hoje
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  const deadlineDate = threeDaysFromNow.toISOString().split('T')[0]
  const deadlineTime = '09:00' // 9h da manhã

  return (
    <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
      <CardContent className="p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <Bell className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Bem-vindo ao Themixa! 👋
            </h2>
            <p className="text-slate-600 max-w-md mx-auto">
              Comece cadastrando seu primeiro prazo. Nós cuidamos dos alertas. Você cuida do processo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link 
              href={`/dashboard/deadlines/new?onboarding=true&date=${deadlineDate}&time=${deadlineTime}`}
              className="w-full sm:w-auto"
            >
              <Button 
                size="lg" 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Bell className="mr-2 h-5 w-5" />
                Cadastre seu primeiro prazo
                <span className="ml-2 text-xs opacity-90">(leva menos de 1 minuto)</span>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-blue-200">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Alertas Automáticos</h3>
              <p className="text-xs text-slate-600">Você receberá alertas em 7, 3, 1 dia e no dia do prazo</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Por E-mail</h3>
              <p className="text-xs text-slate-600">Alertas enviados automaticamente para seu e-mail</p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">Sem Perder Prazos</h3>
              <p className="text-xs text-slate-600">Nunca mais perca um prazo importante</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



