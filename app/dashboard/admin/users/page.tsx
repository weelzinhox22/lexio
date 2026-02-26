import { createClient } from "@supabase/supabase-js"
import { UsersTable } from "./users-table"
import { Shield } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient as createServerClient } from "@/lib/supabase/server"

export default async function AdminUsersPage() {
    const supabaseServer = await createServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) redirect("/auth/login")

    const { data: profile } = await supabaseServer
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

    if (profile?.role !== "admin") {
        redirect("/dashboard")
    }

    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all profiles with their subscriptions
    const { data: profiles, error: pError } = await adminSupabase
        .from("profiles")
        .select("id, full_name, email, role")
        .order("created_at", { ascending: false })

    const { data: subscriptions, error: sError } = await adminSupabase
        .from("subscriptions")
        .select("*")

    if (pError || sError) {
        console.error(pError, sError)
        return <div>Erro ao carregar dados.</div>
    }

    const usersWithSubs = profiles.map(p => ({
        ...p,
        subscription: subscriptions.find(s => s.user_id === p.id) || null
    }))

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-600" />
                    Gerenciadores de Assinatura
                </h1>
                <p className="text-slate-600 mt-1 md:text-base text-sm">Visualize todos os usuários e conceda tempo extra de acesso à plataforma.</p>
            </div>

            <UsersTable users={usersWithSubs} />
        </div>
    )
}
