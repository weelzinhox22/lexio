import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, UserCheck, Users, TrendingUp } from "lucide-react"

export function LeadStats({
  newLeads,
  qualifiedLeads,
  convertedLeads,
  conversionRate,
}: {
  newLeads: number
  qualifiedLeads: number
  convertedLeads: number
  conversionRate: string
}) {
  const stats = [
    {
      name: "Novos Leads",
      value: newLeads,
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      name: "Qualificados",
      value: qualifiedLeads,
      icon: UserCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      name: "Convertidos",
      value: convertedLeads,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ]

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name} className="rounded-2xl border-slate-200/60 shadow-sm bg-white hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-5 px-5">
            <CardTitle className="text-sm font-semibold text-slate-600">{stat.name}</CardTitle>
            <div className={`rounded-xl p-2.5 shadow-sm ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className={`text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
