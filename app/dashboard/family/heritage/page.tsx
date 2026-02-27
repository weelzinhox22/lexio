import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { HeritageCalculator } from "@/components/family/heritage-calculator"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function HeritagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout userId={user.id} userEmail={user.email || ""}>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <HeritageCalculator />
      </div>
    </DashboardLayout>
  )
}
