import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DeadlineEditForm } from "@/components/deadlines/deadline-edit-form"

export default async function DeadlineEditPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: deadline }, { data: processes }] = await Promise.all([
    supabase
      .from("deadlines")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user!.id)
      .single(),
    supabase.from("processes").select("id, title, process_number").eq("user_id", user!.id),
  ])

  if (!deadline) {
    return <div>Prazo não encontrado</div>
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/deadlines/${deadline.id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Editar Prazo</h1>
          <p className="text-slate-600 mt-1">Atualize as informações do prazo</p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">Informações do Prazo</CardTitle>
        </CardHeader>
        <CardContent>
          <DeadlineEditForm deadline={deadline} processes={processes || []} userId={user!.id} />
        </CardContent>
      </Card>
    </div>
  )
}

