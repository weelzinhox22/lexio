import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Client, Lead } from "@/lib/types/database"
import { Users, UserPlus, TrendingUp, UserCheck } from "lucide-react"

export function ClientReport({ clients, leads }: { clients: Client[]; leads: Lead[] }) {
  // Calculate metrics
  const activeClients = clients.filter((c) => c.status === "active").length
  const totalClients = clients.length

  const newLeads = leads.filter((l) => l.status === "new").length
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length
  const convertedLeads = leads.filter((l) => l.status === "converted").length

  const conversionRate = leads.length > 0 ? ((convertedLeads / leads.length) * 100).toFixed(1) : "0"

  // Group clients by type
  const clientsByType = {
    person: clients.filter((c) => c.client_type === "person").length,
    company: clients.filter((c) => c.client_type === "company").length,
  }

  // Group leads by source
  const leadsBySource: Record<string, number> = {}
  leads.forEach((l) => {
    const source = l.source || "Desconhecido"
    leadsBySource[source] = (leadsBySource[source] || 0) + 1
  })

  // Group leads by status
  const leadsByStatus: Record<string, number> = {
    new: 0,
    contacted: 0,
    qualified: 0,
    converted: 0,
    lost: 0,
  }
  leads.forEach((l) => {
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1
  })

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Total de Clientes</CardTitle>
            <div className="rounded-lg p-2 bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalClients}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Clientes Ativos</CardTitle>
            <div className="rounded-lg p-2 bg-green-50">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeClients}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Novos Leads</CardTitle>
            <div className="rounded-lg p-2 bg-purple-50">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{newLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Taxa de Conversão</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{conversionRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Leads por Origem</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsBySource)
                .sort(([, a], [, b]) => b - a)
                .map(([source, count]) => (
                  <div key={source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium capitalize">{source}</span>
                      <span className="text-slate-900 font-semibold">{count} leads</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{
                          width: `${(count / leads.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(leadsByStatus).map(([status, count]) => {
                const labels: Record<string, string> = {
                  new: "Novos",
                  contacted: "Contatados",
                  qualified: "Qualificados",
                  converted: "Convertidos",
                  lost: "Perdidos",
                }
                const colors: Record<string, string> = {
                  new: "bg-blue-500",
                  contacted: "bg-purple-500",
                  qualified: "bg-indigo-500",
                  converted: "bg-green-500",
                  lost: "bg-red-500",
                }
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">{labels[status]}</span>
                      <span className="text-slate-900 font-semibold">
                        {count} ({leads.length > 0 ? ((count / leads.length) * 100).toFixed(0) : 0}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${colors[status]}`}
                        style={{
                          width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Distribuição de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 font-medium">Pessoas Físicas</span>
                <span className="text-2xl font-bold text-blue-600">{clientsByType.person}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${totalClients > 0 ? (clientsByType.person / totalClients) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-700 font-medium">Pessoas Jurídicas</span>
                <span className="text-2xl font-bold text-purple-600">{clientsByType.company}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: `${totalClients > 0 ? (clientsByType.company / totalClients) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
