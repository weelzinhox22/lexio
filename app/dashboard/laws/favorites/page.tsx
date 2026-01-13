import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ExternalLink, Trash2, BookOpen } from "lucide-react"
import Link from "next/link"
import { FavoriteLawsList } from "@/components/laws/favorite-laws-list"

export default async function FavoriteLawsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: favorites, error } = await supabase
    .from("favorite_laws")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Leis Favoritas</h1>
          <p className="text-slate-600 mt-1 text-sm md:text-base">
            Suas leis mais consultadas e notas pessoais
          </p>
        </div>
        <Link href="/dashboard/laws">
          <Button variant="outline" className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />
            Buscar Leis
          </Button>
        </Link>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-red-600">Erro ao carregar favoritos</p>
          </CardContent>
        </Card>
      ) : !favorites || favorites.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Star className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Nenhuma lei favoritada ainda
            </h3>
            <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">
              Comece a favoritar leis para ter acesso rápido às legislações que você mais consulta.
            </p>
            <Link href="/dashboard/laws">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <BookOpen className="h-4 w-4 mr-2" />
                Buscar Leis
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <FavoriteLawsList favorites={favorites} />
      )}
    </div>
  )
}










