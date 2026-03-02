import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Default permissions for new interns
const DEFAULT_PERMISSIONS = {
    dashboard: true,
    processes: true,
    kanban: true,
    deadlines: true,
    calendar: true,
    documents: true,
    templates: false,
    ai_writer: true,
    ai_analysis: true,
    laws: true,
    tools: true,
    timesheet: true,
    clients: false,
    leads: false,
    financial: false,
    reports: false,
    subscription: true,
    settings: true,
}

// Password generation removed - lawyer defines the password

// GET: List all interns for the current lawyer
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
        .from("interns")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ interns: data })
}

// POST: Create a new intern
export async function POST(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, oab_student, university, semester, permissions, password } = body

    if (!name?.trim() || !email?.trim()) {
        return NextResponse.json(
            { error: "Nome e e-mail são obrigatórios." },
            { status: 400 }
        )
    }

    // Validate password
    if (!password || password.length < 6) {
        return NextResponse.json(
            { error: "A senha deve ter no mínimo 6 caracteres." },
            { status: 400 }
        )
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return NextResponse.json(
            { error: "Formato de e-mail inválido." },
            { status: 400 }
        )
    }

    // Check for duplicate email under same owner
    const { data: existing } = await supabase
        .from("interns")
        .select("id")
        .eq("owner_id", user.id)
        .eq("email", email.trim().toLowerCase())
        .maybeSingle()

    if (existing) {
        return NextResponse.json(
            { error: "Já existe um estagiário cadastrado com este e-mail." },
            { status: 409 }
        )
    }

    // Create Supabase auth user using admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json(
            { error: "Configuração do servidor incompleta." },
            { status: 500 }
        )
    }

    const adminSupabase = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    // Create auth user
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password: password,
        email_confirm: true, // Skip email verification
        user_metadata: {
            full_name: name.trim(),
            role: "estagiario",
            owner_id: user.id,
        }
    })

    if (authError) {
        // If user already exists in auth
        if (authError.message?.includes("already been registered") || authError.message?.includes("already exists")) {
            return NextResponse.json(
                { error: "Este e-mail já está registrado na plataforma. Use outro e-mail." },
                { status: 409 }
            )
        }
        console.error("[interns] auth create error:", authError)
        return NextResponse.json(
            { error: "Erro ao criar conta do estagiário." },
            { status: 500 }
        )
    }

    const internUserId = authData.user.id

    // Create profile for the intern
    const { error: profileError } = await adminSupabase
        .from("profiles")
        .upsert({
            id: internUserId,
            full_name: name.trim(),
            email: email.trim().toLowerCase(),
            role: "estagiario",
        }, { onConflict: "id" })

    if (profileError) {
        console.error("[interns] profile create error:", profileError)
    }

    // Create intern record
    const mergedPermissions = { ...DEFAULT_PERMISSIONS, ...(permissions || {}) }

    const { data: internData, error: internError } = await supabase
        .from("interns")
        .insert({
            owner_id: user.id,
            user_id: internUserId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || null,
            oab_student: oab_student?.trim() || null,
            university: university?.trim() || null,
            semester: semester?.trim() || null,
            permissions: mergedPermissions,
            status: "active",
        })
        .select()
        .single()

    if (internError) {
        console.error("[interns] record create error:", internError)
        // Clean up auth user if intern record fails
        await adminSupabase.auth.admin.deleteUser(internUserId)
        return NextResponse.json(
            { error: "Erro ao salvar dados do estagiário." },
            { status: 500 }
        )
    }

    return NextResponse.json({
        intern: internData,
        message: "Estagiário criado com sucesso!",
    })
}
