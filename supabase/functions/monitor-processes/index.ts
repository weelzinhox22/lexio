// Edge Function para monitoramento automatizado de processos jurídicos
// Integração com API DataJud do CNJ - Themixa Project

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Schema de validação
const ProcessSchema = z.object({
  id: z.string().uuid(),
  process_number: z.string(),
  last_update: z.string().datetime().optional(),
  status: z.enum(['active', 'archived', 'pending']),
  lawyer_id: z.string().uuid(),
  tribunal: z.string(),
  created_at: z.string().datetime()
})

const DataJudResponseSchema = z.object({
  hits: z.object({
    hits: z.array(z.object({
      _source: z.object({
        numeroCNJ: z.string().optional(),
        numeroProcesso: z.string().optional(),
        classeProcessual: z.string().optional(),
        dataUltimaMovimentacao: z.string().datetime().optional(),
        movimentacoes: z.array(z.object({
          dataHora: z.string().datetime(),
          descricao: z.string()
        })).optional(),
        assuntoPrincipal: z.string().optional(),
        situacao: z.string().optional()
      })
    }))
  })
})

// Interface TypeScript para type safety
interface Process {
  id: string
  process_number: string
  last_update?: string
  status: string
  lawyer_id: string
  tribunal: string
  created_at: string
}

interface ProcessMovement {
  dataHora: string
  descricao: string
}

interface DataJudProcess {
  numeroCNJ?: string
  numeroProcesso?: string
  classeProcessual?: string
  dataUltimaMovimentacao?: string
  movimentacoes?: ProcessMovement[]
  assuntoPrincipal?: string
  situacao?: string
}

// Circuit Breaker pattern
class CircuitBreaker {
  private failures: number = 0
  private lastFailure: number = 0
  private readonly threshold: number = 5
  private readonly resetTimeout: number = 300000 // 5 minutes
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  canRequest(): boolean {
    if (this.state === 'open') {
      const now = Date.now()
      if (now - this.lastFailure > this.resetTimeout) {
        this.state = 'half-open'
        return true
      }
      return false
    }
    return true
  }

  recordSuccess() {
    if (this.state === 'half-open') {
      this.state = 'closed'
    }
    this.failures = 0
  }

  recordFailure() {
    this.failures++
    this.lastFailure = Date.now()
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }

  getStatus() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailure: this.lastFailure
    }
  }
}

// Configurações globais
const BATCH_SIZE = 50
const MAX_CONCURRENT_REQUESTS = 10
const GLOBAL_TIMEOUT_MS = 50000
const DATAJUD_TIMEOUT_MS = 30000

// Circuit breaker global
const dataJudCircuitBreaker = new CircuitBreaker()

// Logger estruturado
const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({ 
      level: 'INFO', 
      message, 
      timestamp: new Date().toISOString(),
      ...data 
    }))
  },
  error: (message: string, error?: any) => {
    console.error(JSON.stringify({ 
      level: 'ERROR', 
      message, 
      timestamp: new Date().toISOString(),
      error: error?.message || error 
    }))
  },
  warn: (message: string, data?: any) => {
    console.warn(JSON.stringify({ 
      level: 'WARN', 
      message, 
      timestamp: new Date().toISOString(),
      ...data 
    }))
  }
}

// Retry com backoff exponencial
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
      logger.warn(`Tentativa ${attempt} falhou, retry em ${delay}ms`, { error: error.message })
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError || new Error('Unknown error in retry operation')
}

// Consulta otimizada ao banco de dados
async function getActiveProcesses(supabase: any, batch: number = 0): Promise<Process[]> {
  const { data, error } = await supabase
    .from('processes')
    .select('id, process_number, last_update, status, lawyer_id, tribunal, created_at')
    .eq('status', 'active')
    .eq('project', 'Themixa')
    .not('process_number', 'is', null)
    .not('tribunal', 'is', null)
    .order('last_update', { ascending: true, nullsFirst: true })
    .range(batch * BATCH_SIZE, (batch + 1) * BATCH_SIZE - 1)

  if (error) {
    throw new Error(`Database query error: ${error.message}`)
  }

  return data || []
}

// Integração com API DataJud
async function fetchDataJudProcess(processNumber: string, tribunal: string): Promise<DataJudProcess> {
  if (!dataJudCircuitBreaker.canRequest()) {
    throw new Error('Circuit breaker open - DataJud API temporarily unavailable')
  }

  const apiKey = Deno.env.get('DATAJUD_API_KEY')
  if (!apiKey) {
    throw new Error('DATAJUD_API_KEY not configured')
  }

  const tribunalCode = tribunal.toLowerCase().replace('tj', '')
  const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_tj${tribunalCode}/_search`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DATAJUD_TIMEOUT_MS)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${apiKey}`
      },
      body: JSON.stringify({
        query: {
          bool: {
            should: [
              { match: { numeroCNJ: processNumber } },
              { match: { numeroProcesso: processNumber } }
            ]
          }
        },
        size: 1
      }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorText = await response.text()
      
      switch (response.status) {
        case 401:
          throw new Error('DataJud API: Unauthorized - Invalid API key')
        case 403:
          throw new Error('DataJud API: Forbidden - Access denied')
        case 429:
          throw new Error('DataJud API: Rate limit exceeded')
        case 500:
          throw new Error('DataJud API: Internal server error')
        default:
          throw new Error(`DataJud API: HTTP ${response.status} - ${errorText}`)
      }
    }

    const data = await response.json()
    const validatedData = DataJudResponseSchema.parse(data)
    
    if (validatedData.hits.hits.length === 0) {
      throw new Error('Process not found in DataJud')
    }

    dataJudCircuitBreaker.recordSuccess()
    return validatedData.hits.hits[0]._source

  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new Error('DataJud API request timeout')
    }
    
    dataJudCircuitBreaker.recordFailure()
    throw error
  }
}

// Comparação de movimentações considerando fuso horário
function hasNewMovements(
  storedDate: string | undefined,
  newDate: string | undefined,
  movements: ProcessMovement[] = []
): boolean {
  if (!newDate) return false
  if (!storedDate) return true

  // Converter para timestamps considerando UTC
  const storedTime = new Date(storedDate).getTime()
  const newTime = new Date(newDate).getTime()

  // Considerar diferença de até 1 minuto como mesma movimentação
  return newTime > storedTime + 60000
}

// Atualização do processo no banco
async function updateProcessWithNewMovement(
  supabase: any,
  processId: string,
  newData: DataJudProcess,
  lawyerId: string
): Promise<void> {
  const { data, error } = await supabase
    .from('processes')
    .update({
      last_update: newData.dataUltimaMovimentacao || new Date().toISOString(),
      status: newData.situacao || 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', processId)

  if (error) {
    throw new Error(`Failed to update process: ${error.message}`)
  }

  // Criar notificação
  await createNotification(supabase, {
    lawyer_id: lawyerId,
    process_id: processId,
    type: 'movement',
    message: `Nova movimentação no processo ${newData.numeroProcesso}`,
    details: JSON.stringify(newData),
    priority: 'high',
    read: false
  })

  // Integração com Google Calendar
  await createCalendarEvent(lawyerId, processId, newData)
}

// Criação de notificação
async function createNotification(supabase: any, notification: any): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .insert(notification)

  if (error) {
    logger.error('Failed to create notification', error)
  }
}

// Integração com Google Calendar
async function createCalendarEvent(
  lawyerId: string,
  processId: string,
  processData: DataJudProcess
): Promise<void> {
  try {
    const calendarToken = Deno.env.get('GOOGLE_CALENDAR_OAUTH_TOKEN')
    if (!calendarToken) {
      logger.warn('Google Calendar OAuth token not configured')
      return
    }

    const event = {
      summary: `Movimentação Processo: ${processData.numeroProcesso}`,
      description: `Nova movimentação no processo ${processData.numeroProcesso}\n\n` +
                  `Classe: ${processData.classeProcessual}\n` +
                  `Assunto: ${processData.assuntoPrincipal}\n` +
                  `Situação: ${processData.situacao}\n\n` +
                  `Última atualização: ${processData.dataUltimaMovimentacao}`,
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'America/Sao_Paulo'
      },
      end: {
        dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hora depois
        timeZone: 'America/Sao_Paulo'
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 1440 } // 24 horas antes
        ]
      }
    }

    // Aqui iria a implementação real da API do Google Calendar
    logger.info('Google Calendar event would be created', { event })
    
  } catch (error) {
    logger.error('Failed to create Google Calendar event', error)
  }
}

// Processamento em lote com controle de concorrência
async function processBatch(
  supabase: any,
  processes: Process[],
  batchNumber: number
): Promise<{ processed: number; updated: number; errors: number }> {
  let processed = 0
  let updated = 0
  let errors = 0

  const processQueue = processes.map(process => async () => {
    try {
      processed++
      
      const dataJudData = await withRetry(
        () => fetchDataJudProcess(process.process_number, process.tribunal)
      )

      if (hasNewMovements(
        process.last_update,
        dataJudData.dataUltimaMovimentacao,
        dataJudData.movimentacoes
      )) {
        await updateProcessWithNewMovement(
          supabase,
          process.id,
          dataJudData,
          process.lawyer_id
        )
        updated++
        
        logger.info('Process updated with new movement', {
          processId: process.id,
          processNumber: process.process_number,
          lastUpdate: dataJudData.dataUltimaMovimentacao
        })
      }

    } catch (error) {
      errors++
      logger.error('Failed to process process', {
        processId: process.id,
        processNumber: process.process_number,
        error: error.message
      })
    }
  })

  // Executar com controle de concorrência
  const chunks = []
  for (let i = 0; i < processQueue.length; i += MAX_CONCURRENT_REQUESTS) {
    chunks.push(processQueue.slice(i, i + MAX_CONCURRENT_REQUESTS))
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(task => task()))
  }

  return { processed, updated, errors }
}

// Handler principal da Edge Function
serve(async (req: Request) => {
  const startTime = Date.now()
  
  try {
    // Verificar se é uma requisição de cron
    const authHeader = req.headers.get('Authorization')
    const cronSecret = Deno.env.get('CRON_SECRET')
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Configurar timeout global
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Global timeout exceeded')), GLOBAL_TIMEOUT_MS)
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    let batch = 0
    let totalProcessed = 0
    let totalUpdated = 0
    let totalErrors = 0

    // Processar em batches
    while (true) {
      const processes = await getActiveProcesses(supabase, batch)
      if (processes.length === 0) break

      const result = await processBatch(supabase, processes, batch)
      
      totalProcessed += result.processed
      totalUpdated += result.updated
      totalErrors += result.errors

      logger.info(`Batch ${batch} processed`, result)
      
      if (processes.length < BATCH_SIZE) break
      batch++
    }

    const processingTime = Date.now() - startTime

    // Métricas de performance
    const metrics = {
      totalProcessed,
      totalUpdated,
      totalErrors,
      processingTimeMs: processingTime,
      processesPerSecond: totalProcessed / (processingTime / 1000),
      circuitBreakerStatus: dataJudCircuitBreaker.getStatus()
    }

    logger.info('Monitoring completed', metrics)

    return new Response(
      JSON.stringify({
        success: true,
        metrics
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    const processingTime = Date.now() - startTime
    
    logger.error('Monitoring failed', {
      error: error.message,
      processingTimeMs: processingTime
    })

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})