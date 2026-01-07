import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { DeadlineList } from "@/components/deadlines/deadline-list"
import { DeadlineStats } from "@/components/deadlines/deadline-stats"
import { DeadlineCalendar } from "@/components/deadlines/deadline-calendar"

export default async function DeadlinesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: deadlines } = await supabase
    .from("deadlines")
    .select(
      `
      *,
      processes (
        id,
        title,
        process_number
      )
    `,
    )
    .eq("user_id", user!.id)
    .order("deadline_date", { ascending: true })

  // Calculate stats
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const todayDeadlines =
    deadlines?.filter((d) => {
      const deadlineDate = new Date(d.deadline_date)
      return deadlineDate >= today && deadlineDate < tomorrow && d.status === "pending"
    }).length || 0

  const weekDeadlines =
    deadlines?.filter((d) => {
      const deadlineDate = new Date(d.deadline_date)
      return deadlineDate >= today && deadlineDate < nextWeek && d.status === "pending"
    }).length || 0

  const overdueDeadlines = deadlines?.filter((d) => d.status === "overdue").length || 0
  const pendingDeadlines = deadlines?.filter((d) => d.status === "pending").length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Prazos</h1>
          <p className="text-slate-600 mt-1">Nunca perca um prazo importante</p>
        </div>
        <Link href="/dashboard/deadlines/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Novo Prazo
          </Button>
        </Link>
      </div>

      <DeadlineStats
        todayDeadlines={todayDeadlines}
        weekDeadlines={weekDeadlines}
        overdueDeadlines={overdueDeadlines}
        pendingDeadlines={pendingDeadlines}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="border-slate-200">
            <DeadlineList deadlines={deadlines || []} />
          </Card>
        </div>
        <div>
          <Card className="border-slate-200">
            <DeadlineCalendar deadlines={deadlines || []} />
          </Card>
        </div>
      </div>
    </div>
  )
}
