import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function generateRandomPassword(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed easily confused chars like I,1,O,0
    let password = ''
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
}

function generateAccessCode(name: string, id: string) {
    // Ex: "joao-a1b2", keeping it simple
    let prefix = name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
    if (!prefix) prefix = 'cliente'
    const suffix = id.substring(0, 4)
    return `${prefix}-${suffix}`
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        const { data: client, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (clientError || !client) {
            return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 })
        }

        // Generate Credentials
        let accessCode = client.portal_access_code
        let password = client.portal_password

        if (!accessCode || !password) {
            accessCode = accessCode || generateAccessCode(client.name, client.id)
            password = password || generateRandomPassword()

            // Update client
            const { error: updateError } = await supabase
                .from('clients')
                .update({ portal_access_code: accessCode, portal_password: password })
                .eq('id', id)
                .eq('user_id', user.id)

            if (updateError) {
                // If there's a unique constraint violation on accessCode, fallback to full uuid snippet
                if (updateError.code === '23505') {
                    accessCode = `${accessCode}-${client.id.substring(client.id.length - 4)}`
                    await supabase.from('clients').update({ portal_access_code: accessCode, portal_password: password }).eq('id', id)
                } else {
                    throw updateError
                }
            }
        }

        // Check if an onboarding link exists, if not create one
        const { data: existingLink } = await supabase
            .from('onboarding_links')
            .select('token')
            .eq('client_id', id)
            .eq('user_id', user.id)
            .single()

        let token = existingLink?.token

        if (!token) {
            token = crypto.randomUUID()
            const { error: linkError } = await supabase
                .from('onboarding_links')
                .insert({
                    user_id: user.id,
                    client_id: id,
                    token: token
                })

            if (linkError) throw linkError
        }

        return NextResponse.json({
            success: true,
            portal_access_code: accessCode,
            portal_password: password,
            onboarding_token: token
        })

    } catch (error) {
        console.error('Error activating portal:', error)
        return NextResponse.json({ error: 'Erro ao ativar o portal' }, { status: 500 })
    }
}
