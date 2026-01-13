import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, MapPin, Video, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import { AudienceList } from "@/components/audiences/audience-list"

export default async function AudiencesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Buscar audiências
  const { data: audiences } = await supabase
    .from("audiences")
    .select(`
      id,
      title,
      description,
      audience_date,
      audience_type,
      location,
      location_type,
      meeting_link,
      status,
      notes,
      processes (
        id,
        title,
        process_number
      ),
      clients (
        id,
        name
      )
    `)
    .eq("user_id", user.id)
    .order("audience_date", { ascending: true })

  const upcoming = audiences?.filter(a => {
    const date = new Date(a.audience_date)
    return date >= new Date() && a.status === 'scheduled'
  }) || []

  const past = audiences?.filter(a => {
    const date = new Date(a.audience_date)
    return date < new Date() || a.status !== 'scheduled'
  }) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Audiências</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">Gerencie suas audiências e lembretes automáticos</p>
        </div>
        <Link href="/dashboard/audiences/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Nova Audiência
          </Button>
        </Link>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Próximas</p>
                <p className="text-2xl font-bold text-slate-900">{upcoming.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Realizadas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {past.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Canceladas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {past.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Audiências */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Próximas Audiências</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-600 mb-2">Nenhuma audiência agendada</p>
                <Link href="/dashboard/audiences/new">
                  <Button variant="outline" size="sm">
                    Agendar primeira audiência
                  </Button>
                </Link>
              </div>
            ) : (
              <AudienceList audiences={upcoming} />
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-900">Audiências Anteriores</CardTitle>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-8">Nenhuma audiência anterior</p>
            ) : (
              <AudienceList audiences={past.slice(0, 10)} showPast />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

