"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase, Users, TrendingUp, Calendar, DollarSign,
  Bell, ArrowRight, Clock, FileText, Activity
} from "lucide-react"
import Link from "next/link"

type MetricCard = {
  name: string
  value: string | number
  icon: React.ElementType
  link: string
  badge?: string
  trend?: string
}

type RecentEvent = {
  id: string
  type: 'movement' | 'audience' | 'deadline' | 'alert'
  title: string
  description: string
  date: string
  link: string
  isNew?: boolean
}

type EnrichedDashboardProps = {
  metrics: {
    activeProcesses: number
    totalClients: number
    clientsGrowth?: number
    recentMovements: number
    upcomingAudiences: number
    monthlyRevenue?: number
  }
  recentEvents: RecentEvent[]
}

export function EnrichedDashboard({ metrics, recentEvents }: EnrichedDashboardProps) {
  const metricCards: MetricCard[] = [
    {
      name: "Receita Mensal",
      value: metrics.monthlyRevenue !== undefined ? `R$ ${metrics.monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00",
      icon: DollarSign,
      link: "/dashboard/financial",
      trend: "Este mês",
    },
    {
      name: "Processos Ativos",
      value: metrics.activeProcesses,
      icon: Briefcase,
      link: "/dashboard/processes",
    },
    {
      name: "Clientes Cadastrados",
      value: metrics.totalClients,
      icon: Users,
      link: "/dashboard/clients",
      trend: metrics.clientsGrowth ? `+${metrics.clientsGrowth} este mês` : undefined,
    },
    {
      name: "Movimentações Recentes",
      value: metrics.recentMovements,
      icon: Activity,
      link: "/dashboard/processes",
      badge: metrics.recentMovements > 0 ? "Novo" : undefined,
    },
    {
      name: "Audiências Próximas",
      value: metrics.upcomingAudiences,
      icon: Calendar,
      link: "/dashboard/audiences",
    },
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'movement':
        return <Activity className="h-4 w-4" />
      case 'audience':
        return <Calendar className="h-4 w-4" />
      case 'deadline':
        return <Clock className="h-4 w-4" />
      case 'alert':
        return <Bell className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'movement':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      case 'audience':
        return 'bg-purple-50 border-purple-200 text-purple-700'
      case 'deadline':
        return 'bg-orange-50 border-orange-200 text-orange-700'
      case 'alert':
        return 'bg-green-50 border-green-200 text-green-700'
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700'
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 mt-2">
      {/* Seção: Visão Geral - Cards Compactos */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 px-1">Visão Geral</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metricCards.map((metric) => {
            const Icon = metric.icon
            return (
              <Link key={metric.name} href={metric.link}>
                <Card className="rounded-2xl border-slate-200/60 bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`rounded-xl p-2.5 bg-slate-100 border border-slate-200/50 shadow-sm transition-colors duration-300 ${metric.name === "Receita Mensal" ? "group-hover:bg-green-600 group-hover:border-green-700" : "group-hover:bg-slate-900"}`}>
                        <Icon className={`h-5 w-5 text-slate-600 group-hover:text-white transition-colors duration-300`} />
                      </div>
                      {metric.badge && (
                        <Badge className="bg-blue-600 text-white text-xs border-blue-700 shadow-sm rounded-full px-2">
                          {metric.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-sm font-medium text-slate-500">{metric.name}</p>
                      <p className={`text-2xl font-bold tracking-tight ${metric.name === "Receita Mensal" ? "text-green-700" : "text-slate-900"}`}>{metric.value}</p>
                      {metric.trend && (
                        <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${metric.name === "Receita Mensal" ? "text-green-600/80" : "text-emerald-600"}`}>
                          <TrendingUp className="h-3 w-3" />
                          {metric.trend}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Seção: Atividade Recente */}
      {recentEvents.length > 0 && (
        <Card className="rounded-2xl border-slate-200/60 bg-white shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 text-base font-semibold flex items-center gap-2">
                <Activity className="h-5 w-5 text-slate-500" />
                Destaques Recentes
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-full" asChild>
                <Link href="/dashboard/activity">
                  Ver todas
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <Link key={event.id} href={event.link} className="block group/event">
                  <div className={`p-3.5 rounded-xl border ${getEventColor(event.type)} hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5 p-2 rounded-lg bg-white/60 shadow-sm border border-black/5">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="font-semibold text-sm text-slate-900 group-hover/event:text-slate-700 transition-colors">{event.title}</p>
                          {event.isNew && (
                            <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] px-1.5 py-0 leading-tight rounded-full shadow-sm">Novo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-1">{event.description}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(event.date).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}



