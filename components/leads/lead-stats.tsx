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
