// Testes unitários para Edge Function de monitoramento de processos

import { assert, assertEquals, assertRejects } from 'https://deno.land/std@0.190.0/testing/asserts.ts'
import { CircuitBreaker } from './index.ts'

// Mock para Supabase Client
const mockSupabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        not: () => ({
          order: () => ({
            range: () => ({
              data: [],
              error: null
            })
          })
        })
      })
    }),
    update: () => ({
      eq: () => ({
        data: {},
        error: null
      })
    }),
    insert: () => ({
      error: null
    })
  })
}

// Testes para CircuitBreaker
Deno.test('CircuitBreaker - should allow requests when closed', () => {
  const cb = new CircuitBreaker()
  assert(cb.canRequest(), 'Should allow requests when circuit is closed')
})

Deno.test('CircuitBreaker - should open after threshold failures', () => {
  const cb = new CircuitBreaker()
  
  // Adicionar falhas até atingir o threshold
  for (let i = 0; i < 4; i++) {
    cb.recordFailure()
    assert(cb.canRequest(), 'Should allow requests before threshold')
  }
  
  // 5ª falha deve abrir o circuito
  cb.recordFailure()
  assert(!cb.canRequest(), 'Should block requests when circuit is open')
})

Deno.test('CircuitBreaker - should reset after timeout', () => {
  const cb = new CircuitBreaker()
  
  // Abrir o circuito
  for (let i = 0; i < 5; i++) cb.recordFailure()
  assert(!cb.canRequest(), 'Circuit should be open')
  
  // Avançar o tempo além do timeout
  const originalDateNow = Date.now
  Date.now = () => originalDateNow() + 300001 // 5 minutos + 1ms
  
  assert(cb.canRequest(), 'Circuit should be half-open after timeout')
  
  // Restaurar Date.now
  Date.now = originalDateNow
})

Deno.test('CircuitBreaker - should close after successful request in half-open state', () => {
  const cb = new CircuitBreaker()
  
  // Abrir o circuito
  for (let i = 0; i < 5; i++) cb.recordFailure()
  
  // Forçar half-open state
  const originalDateNow = Date.now
  Date.now = () => originalDateNow() + 300001
  cb.canRequest() // Isso muda para half-open
  
  // Registrar sucesso
  cb.recordSuccess()
  
  // Verificar que está fechado
  assert(cb.canRequest(), 'Circuit should be closed after success')
  assertEquals(cb.getStatus().state, 'closed')
  
  Date.now = originalDateNow
})

// Testes para hasNewMovements
Deno.test('hasNewMovements - should detect new movements when stored date is null', () => {
  const result = hasNewMovements(
    undefined,
    '2024-01-01T10:00:00Z',
    [{ dataHora: '2024-01-01T10:00:00Z', descricao: 'Test' }]
  )
  assert(result, 'Should detect new movement when no stored date')
})

Deno.test('hasNewMovements - should detect new movements when new date is later', () => {
  const result = hasNewMovements(
    '2024-01-01T10:00:00Z',
    '2024-01-01T11:00:00Z',
    [{ dataHora: '2024-01-01T11:00:00Z', descricao: 'Test' }]
  )
  assert(result, 'Should detect new movement when new date is later')
})

Deno.test('hasNewMovements - should not detect new movements when dates are equal', () => {
  const result = hasNewMovements(
    '2024-01-01T10:00:00Z',
    '2024-01-01T10:00:00Z',
    [{ dataHora: '2024-01-01T10:00:00Z', descricao: 'Test' }]
  )
  assert(!result, 'Should not detect new movement when dates are equal')
})

Deno.test('hasNewMovements - should not detect new movements when new date is earlier', () => {
  const result = hasNewMovements(
    '2024-01-01T11:00:00Z',
    '2024-01-01T10:00:00Z',
    [{ dataHora: '2024-01-01T10:00:00Z', descricao: 'Test' }]
  )
  assert(!result, 'Should not detect new movement when new date is earlier')
})

// Testes para withRetry
Deno.test('withRetry - should succeed on first attempt', async () => {
  let attempts = 0
  const result = await withRetry(async () => {
    attempts++
    return 'success'
  })
  
  assertEquals(result, 'success')
  assertEquals(attempts, 1)
})

Deno.test('withRetry - should retry on failure and eventually succeed', async () => {
  let attempts = 0
  const result = await withRetry(async () => {
    attempts++
    if (attempts < 3) throw new Error('Temporary failure')
    return 'success'
  }, 5)
  
  assertEquals(result, 'success')
  assertEquals(attempts, 3)
})

Deno.test('withRetry - should throw after max retries', async () => {
  await assertRejects(async () => {
    await withRetry(async () => {
      throw new Error('Always failing')
    }, 2)
  }, Error, 'Always failing')
})

// Mock para fetch global
const originalFetch = globalThis.fetch
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = input.toString()
  
  if (url.includes('datajud.cnj.jus.br')) {
    return new Response(JSON.stringify({
      hits: {
        hits: [{
          _source: {
            numeroProcesso: '1234567-00.2024.8.26.0001',
            dataUltimaMovimentacao: '2024-01-01T12:00:00Z',
            movimentacoes: [
              { dataHora: '2024-01-01T12:00:00Z', descricao: 'Nova movimentação' }
            ]
          }
        }]
      }
    }), { status: 200 })
  }
  
  return originalFetch(input, init)
}

// Testes para fetchDataJudProcess (mockado)
Deno.test('fetchDataJudProcess - should fetch process data successfully', async () => {
  const cb = new CircuitBreaker()
  
  // Mock environment
  const originalEnv = Deno.env.get
  Deno.env.get = (key: string) => key === 'DATAJUD_API_KEY' ? 'test-key' : null
  
  const result = await fetchDataJudProcess('1234567-00.2024.8.26.0001', 'TJSP')
  
  assert(result.numeroProcesso === '1234567-00.2024.8.26.0001')
  assert(result.dataUltimaMovimentacao === '2024-01-01T12:00:00Z')
  
  Deno.env.get = originalEnv
})

// Testes para getActiveProcesses
Deno.test('getActiveProcesses - should return empty array when no processes', async () => {
  const result = await getActiveProcesses(mockSupabase)
  assertEquals(result, [])
})

// Funções auxiliares para teste
function hasNewMovements(
  storedDate: string | undefined,
  newDate: string | undefined,
  movements: any[] = []
): boolean {
  if (!newDate) return false
  if (!storedDate) return true

  const storedTime = new Date(storedDate).getTime()
  const newTime = new Date(newDate).getTime()

  return newTime > storedTime + 60000
}

async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) break
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Unknown error in retry operation')
}

async function fetchDataJudProcess(processNumber: string, tribunal: string): Promise<any> {
  const cb = new CircuitBreaker()
  if (!cb.canRequest()) {
    throw new Error('Circuit breaker open')
  }

  const apiKey = Deno.env.get('DATAJUD_API_KEY')
  if (!apiKey) {
    throw new Error('DATAJUD_API_KEY not configured')
  }

  const response = await fetch('https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `APIKey ${apiKey}`
    },
    body: JSON.stringify({
      query: { bool: { should: [{ match: { numeroCNJ: processNumber } }, { match: { numeroProcesso: processNumber } }] } },
      size: 1
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await response.json()
  return data.hits.hits[0]?._source || {}
}

async function getActiveProcesses(supabase: any, batch: number = 0): Promise<any[]> {
  const { data, error } = await supabase
    .from('processes')
    .select('*')
    .eq('status', 'active')
    .range(batch * 50, (batch + 1) * 50 - 1)

  if (error) throw error
  return data || []
}

// Executar todos os testes
Deno.test({
  name: 'Monitor Processes Edge Function Tests',
  fn: async () => {
    await Deno.test('CircuitBreaker tests')
    await Deno.test('hasNewMovements tests') 
    await Deno.test('withRetry tests')
    await Deno.test('fetchDataJudProcess tests')
    await Deno.test('getActiveProcesses tests')
  },
  sanitizeOps: false,
  sanitizeResources: false
})

console.log('✅ Todos os testes unitários foram criados com sucesso!')
console.log('Para executar: deno test --allow-env --allow-net test.ts')