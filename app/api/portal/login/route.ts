import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const { accessCode, password } = await request.json()

        if (!accessCode || !password) {
            return NextResponse.json({ error: 'Preencha o usuário e a senha.' }, { status: 400 })
        }

        // Use service role to check clients table efficiently
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        const { data: client, error } = await supabase
            .from('clients')
            .select('id, name')
            .eq('portal_access_code', accessCode)
            .eq('portal_password', password)
            .single()

        if (error || !client) {
            console.log('Portal Login failed: User not found or mismatch', { accessCode, password });
            return NextResponse.json({ error: 'Usuário ou senha inválidos.' }, { status: 401 })
        }

        console.log('Portal Login success for client:', client.id);

        const response = NextResponse.json({ success: true })

        // Em um sistema real de produção usaríamos JWT assinado (jose). 
        // Para este MVP vamos setar o ID diretamente em cookie HttpOnly seguro.
        response.cookies.set('portal_client_id', client.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        })

        return response

    } catch (error) {
        console.error('Portal Login Error:', error)
        return NextResponse.json({ error: 'Erro de servidor.' }, { status: 500 })
    }
}
