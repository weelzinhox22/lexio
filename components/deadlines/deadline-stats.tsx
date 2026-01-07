import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Calendar, CalendarClock, Clock } from "lucide-react"

export function DeadlineStats({
  todayDeadlines,
  weekDeadlines,
  overdueDeadlines,
  pendingDeadlines,
}: {
  todayDeadlines: number
  weekDeadlines: number
  overdueDeadlines: number
  pendingDeadlines: number
}) {
  const stats = [
    {
      name: "Hoje",
      value: todayDeadlines,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Próximos 7 Dias",
      value: weekDeadlines,
      icon: CalendarClock,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Atrasados",
      value: overdueDeadlines,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      name: "Pendentes",
      value: pendingDeadlines,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">{stat.name}</CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
