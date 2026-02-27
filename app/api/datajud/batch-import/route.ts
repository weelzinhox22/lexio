import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProcessDetailsByNumber } from '@/lib/datajud/process-by-number'

/**
 * Mapeamento de código TR do CNJ para sigla do tribunal.
 * NNNNNNN-DD.AAAA.J.TR.OOOO
 */
const TR_ESTADUAL: Record<string, string> = {
    '01': 'TJAC', '02': 'TJAL', '03': 'TJAP', '04': 'TJAM', '05': 'TJBA',
    '06': 'TJCE', '07': 'TJDF', '08': 'TJES', '09': 'TJGO', '10': 'TJMA',
    '11': 'TJMT', '12': 'TJMS', '13': 'TJMG', '14': 'TJPA', '15': 'TJPB',
    '16': 'TJPR', '17': 'TJPE', '18': 'TJPI', '19': 'TJRJ', '20': 'TJRN',
    '21': 'TJRS', '22': 'TJRO', '23': 'TJRR', '24': 'TJSC', '25': 'TJSP',
    '26': 'TJSE', '27': 'TJTO',
}

const TR_FEDERAL: Record<string, string> = {
    '01': 'TRF1', '02': 'TRF2', '03': 'TRF3', '04': 'TRF4', '05': 'TRF5', '06': 'TRF6',
}

function detectTribunalFromCNJ(processNumber: string): string | null {
    const digits = processNumber.replace(/\D/g, '')
    if (digits.length !== 20) return null
    const J = digits[13]
    const TR = digits.slice(14, 16)
    switch (J) {
        case '8': return TR === '07' ? 'TJDFT' : (TR_ESTADUAL[TR] || null)
        case '4': return TR_FEDERAL[TR] || null
        case '5': return `TRT${parseInt(TR, 10)}`
        default: return null
    }
}

function formatCNJ(digits: string): string {
    const d = digits.replace(/\D/g, '')
    if (d.length !== 20) return digits
    return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16, 20)}`
}

export async function POST(request: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { processNumbers, clientId } = body as {
        processNumbers: string[]
        clientId: string | null
    }

    if (!processNumbers || !Array.isArray(processNumbers) || processNumbers.length === 0) {
        return NextResponse.json({ error: 'Lista de processos é obrigatória' }, { status: 400 })
    }

    if (processNumbers.length > 50) {
        return NextResponse.json({ error: 'Máximo de 50 processos por importação' }, { status: 400 })
    }

    const results: Array<{
        processNumber: string
        status: 'success' | 'error' | 'duplicate' | 'not_found'
        message: string
        processId?: string
    }> = []

    let resolvedClientId = clientId;
    if (!resolvedClientId) {
        // Find existing generic client or create one
        const { data: existingClient } = await supabase
            .from('clients')
            .select('id')
            .eq('user_id', user.id)
            .eq('name', 'Cliente Padrão (Sem Vínculo)')
            .limit(1)
            .single()

        if (existingClient?.id) {
            resolvedClientId = existingClient.id
        } else {
            const { data: newClient } = await supabase
                .from('clients')
                .insert({
                    user_id: user.id,
                    name: 'Cliente Padrão (Sem Vínculo)',
                    client_type: 'person',
                    status: 'active',
                    notes: 'Criado automaticamente na importação do DataJud porque processos exigem vínculo com algum cliente.'
                })
                .select('id')
                .single()

            if (newClient?.id) {
                resolvedClientId = newClient.id;
            } else {
                // If it fails to create for some reason, just grab the first client the user has
                const { data: fallback } = await supabase
                    .from('clients')
                    .select('id')
                    .eq('user_id', user.id)
                    .limit(1)
                    .single()
                resolvedClientId = fallback?.id || null
            }
        }
    }

    // Verificar processos já existentes
    const { data: existing } = await supabase
        .from('processes')
        .select('process_number')
        .eq('user_id', user.id)

    const existingNumbers = new Set(
        (existing || []).map((p: any) => p.process_number?.replace(/\D/g, ''))
    )

    for (const rawNumber of processNumbers) {
        const digits = rawNumber.replace(/\D/g, '')
        const formatted = formatCNJ(digits)

        // Verificar duplicata
        if (existingNumbers.has(digits)) {
            results.push({
                processNumber: formatted,
                status: 'duplicate',
                message: 'Processo já cadastrado no sistema',
            })
            continue
        }

        // Detectar tribunal
        const tribunal = detectTribunalFromCNJ(digits)
        if (!tribunal) {
            results.push({
                processNumber: formatted,
                status: 'error',
                message: 'Não foi possível detectar o tribunal pelo número CNJ',
            })
            continue
        }

        // Buscar no DataJud
        try {
            const details = await getProcessDetailsByNumber({
                tribunal,
                processNumber: digits,
            })

            if (!details) {
                // Criar mesmo sem dados do DataJud, com dados mínimos
                const { data: newProcess, error: insertError } = await supabase
                    .from('processes')
                    .insert({
                        user_id: user.id,
                        client_id: resolvedClientId || null,
                        process_number: formatted,
                        title: `Processo ${formatted}`,
                        court: tribunal,
                        status: 'active',
                        priority: 'medium',
                        polo: 'ativo',
                    })
                    .select('id')
                    .single()

                if (insertError) {
                    results.push({
                        processNumber: formatted,
                        status: 'error',
                        message: `Erro ao inserir: ${insertError.message}`,
                    })
                } else {
                    existingNumbers.add(digits)
                    results.push({
                        processNumber: formatted,
                        status: 'not_found',
                        message: `Cadastrado com dados básicos (não encontrado no DataJud - ${tribunal})`,
                        processId: newProcess?.id,
                    })
                }
                continue
            }

            // Cadastrar com dados completos do DataJud
            const insertData: any = {
                user_id: user.id,
                client_id: resolvedClientId || null,
                process_number: formatted,
                title: details.classe || `Processo ${formatted}`,
                court: details.court,
                vara: details.orgaoJulgador || null,
                process_type: details.classe || null,
                matter: details.assunto || null,
                start_date: details.distributionDate || null,
                status: 'active',
                priority: 'medium',
                polo: 'ativo',
            }

            const { data: newProcess, error: insertError } = await supabase
                .from('processes')
                .insert(insertData)
                .select('id')
                .single()

            if (insertError) {
                results.push({
                    processNumber: formatted,
                    status: 'error',
                    message: `Erro ao inserir: ${insertError.message}`,
                })
                continue
            }

            // Importar movimentações (até 50)
            if (newProcess && details.movements.length > 0) {
                const movements = details.movements.slice(0, 50).map((m) => ({
                    user_id: user.id,
                    process_id: newProcess.id,
                    title: m.name || 'Movimentação',
                    update_type: m.code ? `Código ${m.code}` : 'datajud',
                    update_date: m.date || new Date().toISOString(),
                    description: `Importado do DataJud (${tribunal})`,
                }))

                await supabase.from('process_updates').insert(movements)
            }

            existingNumbers.add(digits)
            results.push({
                processNumber: formatted,
                status: 'success',
                message: `✅ Importado com ${details.movements.length} movimentações — ${tribunal} — ${details.classe || 'Sem classe'}`,
                processId: newProcess?.id,
            })

            // Delay entre requests para evitar rate limit
            await new Promise((r) => setTimeout(r, 300))

        } catch (err: any) {
            results.push({
                processNumber: formatted,
                status: 'error',
                message: `Erro: ${err.message || 'Erro desconhecido'}`,
            })
        }
    }

    const summary = {
        total: results.length,
        success: results.filter((r) => r.status === 'success').length,
        notFound: results.filter((r) => r.status === 'not_found').length,
        duplicates: results.filter((r) => r.status === 'duplicate').length,
        errors: results.filter((r) => r.status === 'error').length,
    }

    return NextResponse.json({ results, summary })
}
