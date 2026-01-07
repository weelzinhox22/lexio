import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Process, Deadline } from "@/lib/types/database"
import { Briefcase, CheckCircle2, Clock } from "lucide-react"

export function ProcessReport({ processes, deadlines }: { processes: Process[]; deadlines: Deadline[] }) {
  // Calculate metrics
  const activeProcesses = processes.filter((p) => p.status === "active").length
  const wonProcesses = processes.filter((p) => p.status === "won").length
  const lostProcesses = processes.filter((p) => p.status === "lost").length
  const archivedProcesses = processes.filter((p) => p.status === "archived").length

  const winRate = processes.length > 0 ? ((wonProcesses / processes.length) * 100).toFixed(1) : "0"

  // Group by type
  const processByType: Record<string, number> = {}
  processes.forEach((p) => {
    const type = p.process_type || "Outros"
    processByType[type] = (processByType[type] || 0) + 1
  })

  // Group by priority
  const processByPriority: Record<string, number> = {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0,
  }
  processes.forEach((p) => {
    processByPriority[p.priority] = (processByPriority[p.priority] || 0) + 1
  })

  // Deadline metrics
  const completedDeadlines = deadlines.filter((d) => d.status === "completed").length
  const overdueDeadlines = deadlines.filter((d) => d.status === "overdue").length
  const pendingDeadlines = deadlines.filter((d) => d.status === "pending").length

  const deadlineCompletionRate = deadlines.length > 0 ? ((completedDeadlines / deadlines.length) * 100).toFixed(1) : "0"

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Processos Ativos</CardTitle>
            <div className="rounded-lg p-2 bg-blue-50">
              <Briefcase className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeProcesses}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Processos Ganhos</CardTitle>
            <div className="rounded-lg p-2 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{wonProcesses}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Taxa de Vitória</CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{winRate}%</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700">Prazos Atrasados</CardTitle>
            <div className="rounded-lg p-2 bg-red-50">
              <Clock className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueDeadlines}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Processos por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(processByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium capitalize">{type}</span>
                      <span className="text-slate-900 font-semibold">{count} processos</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{
                          width: `${(count / processes.length) * 100}%`,
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
            <CardTitle className="text-slate-900">Distribuição por Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(processByPriority).map(([priority, count]) => {
                const colors: Record<string, string> = {
                  urgent: "bg-red-500",
                  high: "bg-orange-500",
                  medium: "bg-blue-500",
                  low: "bg-slate-400",
                }
                const labels: Record<string, string> = {
                  urgent: "Urgente",
                  high: "Alta",
                  medium: "Média",
                  low: "Baixa",
                }
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-700 font-medium">{labels[priority]}</span>
                      <span className="text-slate-900 font-semibold">{count} processos</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${colors[priority]}`}
                        style={{
                          width: `${processes.length > 0 ? (count / processes.length) * 100 : 0}%`,
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
          <CardTitle className="text-slate-900">Performance de Prazos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Concluídos</p>
                <p className="text-2xl font-bold text-green-600">{completedDeadlines}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{pendingDeadlines}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Taxa de Conclusão</p>
                <p className="text-2xl font-bold text-blue-600">{deadlineCompletionRate}%</p>
              </div>
            </div>
            <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex">
              <div
                className="h-full bg-green-500"
                style={{
                  width: `${deadlines.length > 0 ? (completedDeadlines / deadlines.length) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-orange-500"
                style={{
                  width: `${deadlines.length > 0 ? (pendingDeadlines / deadlines.length) * 100 : 0}%`,
                }}
              />
              <div
                className="h-full bg-red-500"
                style={{
                  width: `${deadlines.length > 0 ? (overdueDeadlines / deadlines.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
