import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Using service role for public external upload without exposing RLS
function getAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params
        const supabase = getAdminClient()

        // Verify Token
        const { data: link, error: linkError } = await supabase
            .from('onboarding_links')
            .select('*, clients(*)')
            .eq('token', token)
            .single()

        if (linkError || !link) {
            return NextResponse.json({ error: 'Link de cadastro inválido ou expirado.' }, { status: 404 })
        }

        if (link.status === 'completed') {
            return NextResponse.json({ error: 'Este link de cadastro já foi utilizado.' }, { status: 400 })
        }

        const formData = await request.formData()

        // Extract Fields
        const rg = formData.get('rg') as string
        const cep = formData.get('cep') as string
        const city = formData.get('city') as string
        const state = formData.get('state') as string
        const neighborhood = formData.get('neighborhood') as string
        const address_number = formData.get('address_number') as string
        const marital_status = formData.get('marital_status') as string
        const profession = formData.get('profession') as string

        const documentFile = formData.get('document_front') as File | null
        const proofFile = formData.get('proof_of_address') as File | null

        let documentUrl = ''
        let proofUrl = ''

        const clientId = link.client_id

        // Upload Document
        if (documentFile && documentFile.size > 0) {
            const ext = documentFile.name.split('.').pop()
            const path = `${clientId}/document_${Date.now()}.${ext}`
            const { error: uploadErr } = await supabase.storage
                .from('client_uploads')
                .upload(path, documentFile, { contentType: documentFile.type })
            if (!uploadErr) {
                const { data: { publicUrl } } = supabase.storage.from('client_uploads').getPublicUrl(path)
                documentUrl = publicUrl // Note: we are using public for now or signed urls later
            }
        }

        // Upload Proof
        if (proofFile && proofFile.size > 0) {
            const ext = proofFile.name.split('.').pop()
            const path = `${clientId}/proof_${Date.now()}.${ext}`
            const { error: uploadErr } = await supabase.storage
                .from('client_uploads')
                .upload(path, proofFile, { contentType: proofFile.type })
            if (!uploadErr) {
                const { data: { publicUrl } } = supabase.storage.from('client_uploads').getPublicUrl(path)
                proofUrl = publicUrl
            }
        }

        // Add file records to documents table so lawyer sees them
        if (documentUrl) {
            await supabase.from('documents').insert({
                user_id: link.user_id,
                client_id: clientId,
                title: 'Documento de Identidade (RG/CNH)',
                file_url: documentUrl,
                file_name: documentFile ? documentFile.name : 'document.pdf',
                file_size: documentFile ? documentFile.size : 0,
                file_type: documentFile ? documentFile.type : 'application/pdf',
                category: 'documento_pessoal'
            })
        }
        if (proofUrl) {
            await supabase.from('documents').insert({
                user_id: link.user_id,
                client_id: clientId,
                title: 'Comprovante de Resistência (Onboarding)',
                file_url: proofUrl,
                file_name: proofFile ? proofFile.name : 'proof.pdf',
                file_size: proofFile ? proofFile.size : 0,
                file_type: proofFile ? proofFile.type : 'application/pdf',
                category: 'comprovante'
            })
        }

        // Update Client
        await supabase.from('clients').update({
            document_rg: rg,
            address_cep: cep,
            address_city: city,
            address_state: state,
            address_neighborhood: neighborhood,
            address_number: address_number,
            marital_status: marital_status,
            profession: profession
        }).eq('id', clientId)

        // Mark link as completed
        await supabase.from('onboarding_links').update({
            status: 'completed',
            completed_at: new Date().toISOString()
        }).eq('id', link.id)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Onboarding Submit Error:', error)
        return NextResponse.json({ error: 'Erro ao enviar dados do cadastro.' }, { status: 500 })
    }
}
