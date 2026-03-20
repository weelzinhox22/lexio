#!/usr/bin/env node

/**
 * Script para testar a API de busca de processos
 * Uso: node test-datajud-api.js <processNumber>
 * 
 * Exemplo:
 * node test-datajud-api.js 12345678901234567890
 */

const processNumber = process.argv[2]

if (!processNumber) {
  console.error('❌ Uso: node test-datajud-api.js <processNumber>')
  console.error('Exemplo: node test-datajud-api.js 12345678901234567890')
  process.exit(1)
}

async function testAPI() {
  console.log(`\n🔍 Testando busca para: ${processNumber}\n`)

  try {
    // Simular request ao endpoint
    // Em produção, seria uma requisição HTTP real
    const apiUrl = 'http://localhost:3000/api/jusbrasil/search'

    console.log(`📍 Endpoint: ${apiUrl}`)
    console.log(`⏱️  Timeout: 8 segundos`)
    console.log(`🔑 API Key: cDzFyJWE9nGPRnWE949n95989R939n929r98\n`)

    const startTime = Date.now()

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token', // Em teste real, usar token válido
      },
      body: JSON.stringify({ processNumber }),
    })

    const duration = Date.now() - startTime

    console.log(`✅ Resposta recebida em ${duration}ms\n`)
    console.log(`Status: ${response.status} ${response.statusText}`)
    console.log(`Content-Type: ${response.headers.get('content-type')}\n`)

    const data = await response.json()

    if (response.ok) {
      console.log('✅ SUCESSO\n')
      console.log(`📊 Resultados encontrados: ${data.results}`)
      console.log(`💾 Resultados salvos: ${data.saved}\n`)

      if (data.data && data.data.length > 0) {
        console.log('📋 Primeiros resultados:')
        data.data.slice(0, 3).forEach((item, i) => {
          console.log(`\n  ${i + 1}. ${item.processo_titulo}`)
          console.log(`     Data: ${item.data}`)
          console.log(`     Tipo: ${item.tipo}`)
          console.log(`     Descrição: ${item.descricao.substring(0, 50)}...`)
        })
      }
    } else {
      console.log('❌ ERRO\n')
      console.log(`Código: ${data.code}`)
      console.log(`Mensagem: ${data.error}`)

      if (response.status === 503) {
        console.log(
          '\n💡 Dica: A API do tribunal está indisponível. Tente novamente em alguns instantes.'
        )
      } else if (response.status === 400) {
        console.log('\n💡 Dica: O número do processo é inválido. Formato: 20 dígitos CNJ')
      } else if (response.status === 401) {
        console.log('\n💡 Dica: Você não está autenticado. Faça login primeiro.')
      }
    }

    console.log()
  } catch (error) {
    console.error('❌ ERRO DE CONEXÃO\n')
    console.error(`Mensagem: ${error.message}\n`)

    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Dica: O servidor não está rodando. Execute: npm run dev')
    } else if (error.message.includes('timeout')) {
      console.log('💡 Dica: A requisição demorou mais de 8 segundos.')
    } else if (error.message.includes('DNS')) {
      console.log('💡 Dica: Verifique a conectividade com a internet.')
    }
  }
}

// Simular teste (em produção seria fetch real)
console.log('╔════════════════════════════════════════════════════════╗')
console.log('║  Teste da API DataJud - Busca de Processos            ║')
console.log('╚════════════════════════════════════════════════════════╝\n')

// Exemplo de resposta esperada
console.log('📌 RESPOSTA ESPERADA (200 OK):\n')
console.log(
  JSON.stringify(
    {
      success: true,
      processNumber: '12345678901234567890',
      results: 3,
      saved: 3,
      data: [
        {
          data: '2025-01-08',
          descricao: 'Sentença de primeira instância proferida',
          tipo: 'Sentença',
          diario: 'Diário de Justiça Eletrônico',
          processo_titulo: 'Ação Cível Ordinária',
        },
        {
          data: '2025-01-05',
          descricao: 'Audiência realizada',
          tipo: 'Audiência',
          diario: 'DataJud',
          processo_titulo: 'Ação Cível Ordinária',
        },
        {
          data: '2025-01-01',
          descricao: 'Processo distribuído',
          tipo: 'Distribuição',
          diario: 'DataJud',
          processo_titulo: 'Ação Cível Ordinária',
        },
      ],
    },
    null,
    2
  )
)

console.log('\n📌 RESPOSTA ESPERADA (503 - API INDISPONÍVEL):\n')
console.log(
  JSON.stringify(
    {
      error: 'O sistema do tribunal está instável no momento. Tente novamente em instantes.',
      code: 'SERVICE_UNAVAILABLE',
    },
    null,
    2
  )
)

console.log('\n📌 RESPOSTA ESPERADA (400 - NÚMERO INVÁLIDO):\n')
console.log(
  JSON.stringify(
    {
      error: 'Número do processo deve ter 20 dígitos no formato CNJ',
    },
    null,
    2
  )
)

console.log('\n' + '═'.repeat(56) + '\n')
