import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { DeadlineNotifications } from "@/components/notifications/deadline-notifications"
import { DeadlineAlertBanner } from "@/components/deadlines/deadline-alert-banner"
import { VirtualAssistant } from "@/components/assistant/virtual-assistant"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile for avatar and name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single()

  // Banner: destaque apenas para prazos críticos (hoje/amanhã/vencidos) e ainda não confirmados.
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const { data: rawDeadlines } = await supabase
    .from("deadlines")
    .select("id, title, deadline_date, status, acknowledged_at")
    .eq("user_id", user.id)
    .neq("status", "completed")
    .limit(200)

  const bannerDeadlines =
    (rawDeadlines || [])
      .map((d: any) => {
        const dd = new Date(d.deadline_date)
        const daysRemaining = Math.ceil((dd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          id: d.id,
          title: d.title,
          deadline_date: d.deadline_date,
          days_remaining: daysRemaining,
          acknowledged_at: d.acknowledged_at || null,
          status: d.status,
        }
      })
      .filter((d: any) => d.status !== "completed" && !d.acknowledged_at && d.days_remaining <= 1)
      .slice(0, 10) || []

  // Security Check for Admin link
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",")
  const isAdmin = user.email ? adminEmails.includes(user.email) : false

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar isAdmin={isAdmin} />
      <div className="flex flex-1 flex-col w-full lg:pl-64">
        <DashboardHeader
          user={user}
          profileName={profile?.full_name || null}
          avatarUrl={profile?.avatar_url || null}
          isAdmin={isAdmin}
        />
        <DeadlineAlertBanner deadlines={bannerDeadlines} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <DeadlineNotifications />
        <VirtualAssistant />
      </div>
    </div>
  )
}
