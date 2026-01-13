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
    {
      name: "Receita do Mês",
      value: metrics.monthlyRevenue 
        ? `R$ ${metrics.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : "Em breve",
      icon: DollarSign,
      link: "/dashboard/financial",
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
    <div className="space-y-6">
      {/* Seção: Visão Geral - Cards Compactos */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Visão Geral</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {metricCards.map((metric) => {
            const Icon = metric.icon
            return (
              <Link key={metric.name} href={metric.link}>
                <Card className="border-slate-200 hover:shadow-md hover:border-slate-300 transition-all cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className={`rounded-lg p-2 bg-slate-50`}>
                        <Icon className="h-4 w-4 text-slate-600" />
                      </div>
                      {metric.badge && (
                        <Badge className="bg-blue-600 text-white text-xs">
                          {metric.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-600">{metric.name}</p>
                      <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                      {metric.trend && (
                        <p className="text-xs text-green-600">{metric.trend}</p>
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
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Atividade Recente
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/activity">
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <Link key={event.id} href={event.link}>
                  <div className={`p-3 rounded-lg border ${getEventColor(event.type)} hover:shadow-sm transition-all`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.isNew && (
                            <Badge className="bg-blue-600 text-white text-xs">Novo</Badge>
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

