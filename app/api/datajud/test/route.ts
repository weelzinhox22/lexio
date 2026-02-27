import { NextResponse } from 'next/server'
import { getDataJudApiUrl, parseCNJNumber } from '@/lib/datajud-api'

export async function POST(request: Request) {
  try {
    const { processNumber, tribunal } = await request.json()

    if (!processNumber) {
      return NextResponse.json(
        { error: 'Número do processo é obrigatório' },
        { status: 400 }
      )
    }

    // Verificar se a API_KEY está configurada
    const apiKey = process.env.DATAJUD_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'DATAJUD_API_KEY não configurada',
          details: 'Configure a variável de ambiente DATAJUD_API_KEY no servidor'
        },
        { status: 500 }
      )
    }

    // Parse do número do processo para obter tribunal
    const parsed = parseCNJNumber(processNumber)
    const tribunalCode = parsed?.tribunalCode || tribunal
    const branchCode = parsed?.branchCode

    if (!tribunalCode) {
      return NextResponse.json(
        { error: 'Não foi possível determinar o tribunal do processo' },
        { status: 400 }
      )
    }

    // Obter URL da API
    const apiUrl = getDataJudApiUrl(tribunalCode, branchCode)
    if (!apiUrl) {
      return NextResponse.json(
        { error: `Tribunal não suportado: ${tribunalCode}${branchCode ? ` (Ramo ${branchCode})` : ''}` },
        { status: 400 }
      )
    }

    const cleanNumber = parsed?.cleanNumber || processNumber.replace(/\D/g, '')

    console.log(`🔍 Consultando DataJud: ${processNumber} no tribunal ${tribunalCode} (Ramo: ${branchCode || '8'})`)

    // Fazer a requisição para a API DataJud com busca flexível
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${apiKey}`,
      },
      body: JSON.stringify({
        query: {
          bool: {
            should: [
              { match_phrase: { numeroProcesso: cleanNumber } },
              { match_phrase: { numeroProcesso: processNumber } },
              { match_phrase: { numeroCNJ: cleanNumber } },
            ],
            minimum_should_match: 1
          }
        },
        size: 1,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()

      let errorMessage = `Erro na API DataJud: ${response.status}`

      switch (response.status) {
        case 401:
          errorMessage = 'API Key inválida ou não autorizada'
          break
        case 403:
          errorMessage = 'Acesso proibido - verifique as permissões'
          break
        case 429:
          errorMessage = 'Rate limit excedido - aguarde e tente novamente'
          break
        case 500:
          errorMessage = 'Erro interno do servidor DataJud'
          break
        default:
          errorMessage = `Erro ${response.status}: ${errorText}`
      }

      return NextResponse.json(
        {
          error: errorMessage,
          status: response.status,
          tribunal: tribunalCode
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Verificar se encontrou resultados
    if (data.hits?.hits?.length === 0) {
      return NextResponse.json(
        {
          message: 'Processo não encontrado na base DataJud',
          processNumber,
          tribunal: tribunalCode,
          found: false
        },
        { status: 200 }
      )
    }

    const processData = data.hits.hits[0]._source

    return NextResponse.json({
      success: true,
      processNumber,
      tribunal: tribunalCode,
      found: true,
      data: {
        numeroProcesso: processData.numeroProcesso,
        classe: processData.classeProcessual,
        assunto: processData.assuntoPrincipal,
        situacao: processData.situacao,
        dataUltimaMovimentacao: processData.dataUltimaMovimentacao,
        movimentacoes: processData.movimentacoes?.length || 0,
        publicacoes: processData.publicacoes?.length || 0,
      },
      raw: processData // Dados completos para debug
    })

  } catch (error) {
    console.error('Erro no teste DataJud:', error)

    return NextResponse.json(
      {
        error: 'Erro interno no servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Método GET para verificar status da API
export async function GET() {
  const apiKey = process.env.DATAJUD_API_KEY

  return NextResponse.json({
    status: apiKey ? 'configured' : 'not_configured',
    has_api_key: !!apiKey,
    message: apiKey
      ? 'API DataJud configurada corretamente'
      : 'DATAJUD_API_KEY não configurada',
    timestamp: new Date().toISOString()
  })
}