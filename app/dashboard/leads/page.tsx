import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { LeadList } from "@/components/leads/lead-list"
import { LeadStats } from "@/components/leads/lead-stats"

export default async function LeadsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // Calculate stats
  const newLeads = leads?.filter((l) => l.status === "new").length || 0
  const qualifiedLeads = leads?.filter((l) => l.status === "qualified").length || 0
  const convertedLeads = leads?.filter((l) => l.status === "converted").length || 0
  const totalLeads = leads?.length || 0
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leads</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Gerencie seus potenciais clientes</p>
        </div>
        <Link href="/dashboard/leads/new" className="flex-1 sm:flex-initial">
          <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Novo Lead</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </Link>
      </div>

      <LeadStats
        newLeads={newLeads}
        qualifiedLeads={qualifiedLeads}
        convertedLeads={convertedLeads}
        conversionRate={conversionRate}
      />

      <Card className="border-slate-200">
        <LeadList leads={leads || []} />
      </Card>
    </div>
  )
}
