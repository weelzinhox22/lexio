import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { DeadlineNotifications } from "@/components/notifications/deadline-notifications"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col w-full lg:pl-64">
        <DashboardHeader user={user} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
        <DeadlineNotifications />
      </div>
    </div>
  )
}
