'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface TestResult {
  success: boolean
  message: string
  data?: any
  error?: string
}

export default function DataJudTestPage() {
  const [processNumber, setProcessNumber] = useState('')
  const [tribunal, setTribunal] = useState('26') // TJSP padrão
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])

  const tribunais = [
    { value: '26', label: 'TJSP - São Paulo' },
    { value: '19', label: 'TJRJ - Rio de Janeiro' },
    { value: '05', label: 'TJBA - Bahia' },
    { value: '13', label: 'TJMG - Minas Gerais' },
    { value: '01', label: 'TRF1 - Federal' },
    { value: '08', label: 'TJES - Espírito Santo' },
    { value: '24', label: 'TJSE - Sergipe' },
  ]

  const testProcesses = [
    '0000000-00.2024.8.26.0001', // TJSP
    '0000000-00.2024.8.19.0001', // TJRJ
    '0000000-00.2024.8.05.0001', // TRF1
  ]

  const runTest = async (testProcess: string, testTribunal: string) => {
    setIsTesting(true)

    try {
      const response = await fetch('/api/datajud/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          processNumber: testProcess,
          tribunal: testTribunal,
        }),
      })

      const result = await response.json()

      if (response.ok && result.found !== false) {
        setTestResults(prev => [{
          success: true,
          message: `Processo ${testProcess} no ${testTribunal} encontrado`,
          data: result
        }, ...prev])
        toast.success('Teste realizado com sucesso!')
      } else if (result.found === false) {
        setTestResults(prev => [{
          success: false,
          message: `Processo ${testProcess} não encontrado no tribunal ${result.tribunal || testTribunal}`,
          error: 'A API do DataJud retornou vazio para este número.'
        }, ...prev])
        toast.warning('Processo não encontrado')
      } else {
        setTestResults(prev => [{
          success: false,
          message: `Erro no processo ${testProcess}`,
          error: result.error || 'Erro desconhecido'
        }, ...prev])
        toast.error('Erro no teste da API')
      }
    } catch (error) {
      setTestResults(prev => [{
        success: false,
        message: `Falha na requisição: ${testProcess}`,
        error: error instanceof Error ? error.message : 'Erro de conexão'
      }, ...prev])
      toast.error('Erro de conexão')
    } finally {
      setIsTesting(false)
    }
  }

  const handleTest = () => {
    if (!processNumber.trim()) {
      toast.error('Digite um número de processo')
      return
    }
    runTest(processNumber, tribunal)
  }

  const runQuickTests = () => {
    testProcesses.forEach(proc => {
      runTest(proc, '26') // Testa todos com TJSP
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teste da API DataJud</h1>
          <p className="text-muted-foreground">
            Painel administrativo para testar a integração com a API do CNJ
          </p>
        </div>
        <Badge variant={isTesting ? "destructive" : "outline"}>
          {isTesting ? "Testando..." : "Pronto"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Controle */}
        <Card>
          <CardHeader>
            <CardTitle>Configuração do Teste</CardTitle>
            <CardDescription>
              Insira os dados para testar a API DataJud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="processNumber">Número do Processo CNJ</Label>
              <Input
                id="processNumber"
                placeholder="0000000-00.2024.8.26.0001"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tribunal">Tribunal</Label>
              <Select value={tribunal} onValueChange={setTribunal}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tribunal" />
                </SelectTrigger>
                <SelectContent>
                  {tribunais.map((trib) => (
                    <SelectItem key={trib.value} value={trib.value}>
                      {trib.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleTest}
                disabled={isTesting}
                className="flex-1"
              >
                {isTesting ? 'Testando...' : 'Executar Teste'}
              </Button>

              <Button
                onClick={runQuickTests}
                disabled={isTesting}
                variant="outline"
              >
                Testes Rápidos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>
              Últimos resultados das consultas à API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum teste realizado ainda
                </p>
              ) : (
                testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${result.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? 'SUCESSO' : 'ERRO'}
                      </Badge>
                      <span className="text-sm font-medium">{result.message}</span>
                    </div>

                    {result.error && (
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    )}

                    {result.data && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <pre>{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da API */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da API DataJud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              <Badge variant="outline" className="bg-green-100">
                Conectado
              </Badge>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Endpoint</h4>
              <code className="text-xs bg-muted p-1 rounded">
                api-publica.datajud.cnj.jus.br
              </code>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Tribunais Suportados</h4>
              <span className="text-sm">{tribunais.length} tribunais</span>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-1">⚠️ Importante</h4>
            <p className="text-sm text-yellow-700">
              Certifique-se de que a variável de ambiente <code>DATAJUD_API_KEY</code>
              está configurada corretamente no servidor.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}