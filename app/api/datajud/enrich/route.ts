import { NextRequest, NextResponse } from 'next/server'
import { getProcessDetailsByNumber } from '@/lib/datajud/process-by-number'
import { createClient } from '@/lib/supabase/server'

/**
 * Mapeamento de código TR (posição 14-15 do número CNJ) para sigla do tribunal.
 * Formato CNJ: NNNNNNN-DD.AAAA.J.TR.OOOO
 *   J = Justiça: 1=STF, 2=CNJ, 3=STJ, 4=JF, 5=JT, 6=JE, 7=JM, 8=Estadual, 9=JME
 *   TR = Tribunal (código de 2 dígitos)
 *
 * Para J=8 (Justiça Estadual):
 *   TR = UF numérica → mapeamento IBGE para sigla do TJ
 */
const TR_ESTADUAL: Record<string, string> = {
    '01': 'TJAC', '02': 'TJAL', '03': 'TJAP', '04': 'TJAM', '05': 'TJBA',
    '06': 'TJCE', '07': 'TJDF', '08': 'TJES', '09': 'TJGO', '10': 'TJMA',
    '11': 'TJMT', '12': 'TJMS', '13': 'TJMG', '14': 'TJPA', '15': 'TJPB',
    '16': 'TJPR', '17': 'TJPE', '18': 'TJPI', '19': 'TJRJ', '20': 'TJRN',
    '21': 'TJRS', '22': 'TJRO', '23': 'TJRR', '24': 'TJSC', '25': 'TJSP',
    '26': 'TJSE', '27': 'TJTO',
}

// Para J=4 (Justiça Federal)
const TR_FEDERAL: Record<string, string> = {
    '01': 'TRF1', '02': 'TRF2', '03': 'TRF3', '04': 'TRF4', '05': 'TRF5', '06': 'TRF6',
}

// TJDFT tem código especial
const TJDFT_CODE = '07'

/**
 * Extrai o tribunal do número CNJ.
 * Retorna a sigla (ex: TJBA, TRF1, TJDFT) ou null se não conseguir.
 */
function detectTribunalFromCNJ(processNumber: string): string | null {
    // Remover tudo que não é dígito
    const digits = processNumber.replace(/\D/g, '')

    // CNJ tem 20 dígitos: NNNNNNN DD AAAA J TR OOOO
    //                       7       2  4   1  2  4
    if (digits.length !== 20) return null

    const J = digits[13]   // Dígito da Justiça (posição 13, 0-indexed)
    const TR = digits.slice(14, 16) // Código do tribunal (posições 14-15)

    switch (J) {
        case '8': // Justiça Estadual
            if (TR === TJDFT_CODE) return 'TJDFT'
            return TR_ESTADUAL[TR] || null

        case '4': // Justiça Federal
            return TR_FEDERAL[TR] || null

        case '5': // Justiça do Trabalho
            return `TRT${parseInt(TR, 10)}` // TRT1, TRT2, etc.

        default:
            return null
    }
}

export async function GET(request: NextRequest) {
    // Auth check — prevent anonymous abuse of DataJud API
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const processNumber = searchParams.get('processNumber')

    if (!processNumber) {
        return NextResponse.json({ error: 'processNumber é obrigatório' }, { status: 400 })
    }

    // Detectar tribunal automaticamente
    const tribunal = detectTribunalFromCNJ(processNumber)
    if (!tribunal) {
        return NextResponse.json({
            error: 'Não foi possível detectar o tribunal. Verifique o número do processo.',
            detectedTribunal: null,
        }, { status: 400 })
    }

    try {
        const details = await getProcessDetailsByNumber({
            tribunal,
            processNumber: processNumber.replace(/\D/g, ''),
        })

        if (!details) {
            return NextResponse.json({
                detectedTribunal: tribunal,
                found: false,
                message: 'Processo não encontrado no DataJud.',
            })
        }

        return NextResponse.json({
            detectedTribunal: tribunal,
            found: true,
            data: {
                court: details.court,
                classe: details.classe,
                assunto: details.assunto,
                orgaoJulgador: details.orgaoJulgador,
                distributionDate: details.distributionDate,
                lastMovementDate: details.lastMovementDate,
                movementsCount: details.movements.length,
                movements: details.movements.slice(0, 10), // Primeiras 10
                parties: details.parties,
            },
        })
    } catch (err: any) {
        console.error('[DataJud Enrich] error:', err)
        return NextResponse.json({
            detectedTribunal: tribunal,
            found: false,
            error: err.message || 'Erro ao consultar DataJud',
        }, { status: 500 })
    }
}
