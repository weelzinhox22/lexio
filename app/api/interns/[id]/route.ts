import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// PATCH: Update intern details and/or permissions
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone, oab_student, university, semester, permissions, status, password } = body

    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() }

    if (name !== undefined) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (oab_student !== undefined) updateData.oab_student = oab_student?.trim() || null
    if (university !== undefined) updateData.university = university?.trim() || null
    if (semester !== undefined) updateData.semester = semester?.trim() || null
    if (permissions !== undefined) updateData.permissions = permissions
    if (status !== undefined) updateData.status = status

    const { data, error } = await supabase
        .from("interns")
        .update(updateData)
        .eq("id", id)
        .eq("owner_id", user.id)
        .select()
        .single()

    if (error) {
        console.error("[interns] update error:", error)
        return NextResponse.json({ error: "Erro ao atualizar estagiário." }, { status: 500 })
    }

    // If password update requested, update via admin API
    if (password && data?.user_id) {
        if (password.length < 6) {
            return NextResponse.json({ error: "A senha deve ter no mínimo 6 caracteres." }, { status: 400 })
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (supabaseUrl && serviceRoleKey) {
            const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { error: pwError } = await adminSupabase.auth.admin.updateUserById(
                data.user_id,
                { password }
            )

            if (pwError) {
                console.error("[interns] password update error:", pwError)
                return NextResponse.json({ error: "Erro ao atualizar senha." }, { status: 500 })
            }
        }
    }

    return NextResponse.json({ intern: data, passwordUpdated: !!password })
}

// DELETE: Remove intern and their auth account
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the intern record first to find user_id
    const { data: intern, error: fetchError } = await supabase
        .from("interns")
        .select("user_id")
        .eq("id", id)
        .eq("owner_id", user.id)
        .single()

    if (fetchError || !intern) {
        return NextResponse.json({ error: "Estagiário não encontrado." }, { status: 404 })
    }

    // Delete intern record
    const { error: deleteError } = await supabase
        .from("interns")
        .delete()
        .eq("id", id)
        .eq("owner_id", user.id)

    if (deleteError) {
        console.error("[interns] delete error:", deleteError)
        return NextResponse.json({ error: "Erro ao excluir estagiário." }, { status: 500 })
    }

    // Delete auth user if exists
    if (intern.user_id) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (supabaseUrl && serviceRoleKey) {
            const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(intern.user_id)
            if (authDeleteError) {
                console.error("[interns] auth delete error:", authDeleteError)
                // Don't fail - the intern record is already deleted
            }
        }
    }

    return NextResponse.json({ success: true, message: "Estagiário excluído com sucesso." })
}
