import { createClient } from "@/lib/supabase/server"
import { CalendarView } from "@/components/calendar/calendar-view"
import { redirect } from "next/navigation"

export default async function CalendarPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Fetch all events (deadlines + appointments)
  const [deadlinesResult, appointmentsResult] = await Promise.all([
    supabase
      .from("deadlines")
      .select(
        `
        id,
        title,
        description,
        deadline_date,
        priority,
        status,
        process_id,
        processes (
          title,
          process_number
        )
      `,
      )
      .eq("user_id", user.id)
      .order("deadline_date", { ascending: true }),
    supabase
      .from("appointments")
      .select(
        `
        id,
        title,
        description,
        start_time,
        end_time,
        location,
        type,
        status
      `,
      )
      .eq("user_id", user.id)
      .order("start_time", { ascending: true }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Calendário</h1>
        <p className="text-slate-600 mt-1">Visualize todos os seus prazos e compromissos</p>
      </div>

      <CalendarView deadlines={deadlinesResult.data || []} appointments={appointmentsResult.data || []} />
    </div>
  )
}
