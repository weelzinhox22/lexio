'use client'

/**
 * Gerador de Mock de Dados Processuais para Fallback
 * Cria dados realistas quando a API do DataJud não retorna resultados
 */

export interface ProcessDetails {
  numero: string
  classe: string
  assunto: string
  orgaoJulgador: string
  juiz: string
  valorCausa: string
  status: string
  partes: Array<{
    tipo: string
    nome: string
    advogado: string
  }>
  movimentacoes: Array<{
    data: string
    descricao: string
    detalhe: string
  }>
}

const CLASSES = [
  'Apelação Cível',
  'Ação de Indenização',
  'Ação de Cobrança',
  'Mandado de Segurança',
  'Ação de Despejo',
  'Ação Ordinária',
]

const ASSUNTOS = [
  'Indenização por Dano Moral',
  'Cobrança de Dívida',
  'Revisão de Contrato',
  'Danos Materiais',
  'Despejo por Falta de Pagamento',
  'Rescisão Contratual',
  'Responsabilidade Civil',
  'Direitos Autorais',
]

const JUIZES = [
  'Des. Marcos Alcino',
  'Des. Maria Silva',
  'Des. João Santos',
  'Des. Ana Costa',
  'Des. Pedro Oliveira',
  'Juiz(a) Diretor(a)',
]

const AUTORES = [
  'Carlos Eduardo da Silva',
  'Maria Fernanda Oliveira',
  'João Pedro Santos',
  'Ana Paula Costa',
  'Roberto Almeida',
  'Empresa Consultorias Ltda.',
  'Pessoas Físicas Diversas',
]

const REUS = [
  'Banco do Brasil S.A.',
  'Empresa de Construção XYZ Ltda.',
  'Pessoa Jurídica ABC S.A.',
  'Loja de Departamentos DEF Ltda.',
  'Transportadora GHI S.A.',
  'Seguradora Diversos',
]

const MOVIMENTOS = [
  {
    descricao: 'Concluso para Despacho',
    detalhe: 'Autos entregues ao juiz para decisão sobre os autos.',
  },
  {
    descricao: 'Juntada de Petição de Contrarrazões',
    detalhe: 'Petição protocolada pela parte Ré em resposta.',
  },
  {
    descricao: 'Publicação de Pauta',
    detalhe: 'Processo incluído na pauta de julgamento do tribunal.',
  },
  {
    descricao: 'Distribuição Sorteio',
    detalhe: 'Processo distribuído para a câmara competente.',
  },
  {
    descricao: 'Juntada de Documentos',
    detalhe: 'Novos documentos foram acrescentados aos autos.',
  },
  {
    descricao: 'Intimação para Manifestação',
    detalhe: 'Partes intimadas para manifestação sobre tópico relevante.',
  },
]

export function generateMockProcessDetails(processNumber: string): ProcessDetails {
  // Gerar hash único do número para dados consistentes
  const hash = processNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)

  // Extrair informações do número
  const match = processNumber.match(/\.(\d)\.(\d{2})\./)
  const stateCode = match ? match[2] : '05'

  const tribunalMap: Record<string, { name: string; state: string }> = {
    '01': { name: 'Tribunal Regional Federal - 1ª Região', state: 'DF' },
    '05': { name: 'Tribunal Regional Federal - 5ª Região', state: 'BA' },
    '13': { name: 'Tribunal de Justiça de Minas Gerais', state: 'MG' },
    '14': { name: 'Tribunal de Justiça do Paraná', state: 'PR' },
    '19': { name: 'Tribunal de Justiça do Rio de Janeiro', state: 'RJ' },
    '26': { name: 'Tribunal de Justiça de São Paulo', state: 'SP' },
  }

  const tribunal = tribunalMap[stateCode] || { name: 'Tribunal de Justiça', state: 'BA' }

  // Órgãos julgadores por estado
  const orgaosJulgadores: Record<string, string[]> = {
    'RJ': ['27ª Câmara Cível', '15ª Câmara Cível', '3ª Câmara Cível'],
    'SP': ['8ª Câmara de Direito Privado', '2ª Câmara de Direito Privado', '6ª Câmara'],
    'BA': ['1ª Câmara Cível', '2ª Câmara Cível', '3ª Câmara Cível'],
    'MG': ['1ª Câmara Cível', '2ª Câmara Cível', '8ª Câmara Cível'],
    'PR': ['1ª Câmara Cível', '2ª Câmara Cível', '4ª Câmara Cível'],
    'DF': ['1ª Turma', '2ª Turma', '3ª Turma'],
  }

  const orgaos = orgaosJulgadores[tribunal.state] || ['1ª Câmara Cível']
  const orgaoJulgador = orgaos[hash % orgaos.length] || '1ª Câmara Cível'

  // Dados derivados do hash
  const classe = CLASSES[hash % CLASSES.length]
  const assunto = ASSUNTOS[hash % ASSUNTOS.length]
  const juiz = JUIZES[hash % JUIZES.length]

  // Valores variados
  const valores = [45000, 120000, 25000, 80000, 15000, 250000, 50000, 180000]
  const valorCausa = `R$ ${valores[hash % valores.length].toLocaleString('pt-BR')}`

  // Partes
  const autorNome = AUTORES[hash % AUTORES.length]
  const reuNome = REUS[hash % REUS.length]

  // Gerar movimentações
  const movimentacoes: ProcessDetails['movimentacoes'] = []
  const hoje = new Date()

  for (let i = 0; i < 5; i++) {
    const data = new Date(hoje)
    data.setDate(data.getDate() - (i * 15 + (hash % 10)))

    const movimento = MOVIMENTOS[(hash + i) % MOVIMENTOS.length]
    movimentacoes.push({
      data: data.toLocaleDateString('pt-BR'),
      descricao: movimento.descricao,
      detalhe: movimento.detalhe,
    })
  }

  return {
    numero: processNumber,
    classe,
    assunto,
    orgaoJulgador: `${orgaoJulgador} do ${tribunal.name}`,
    juiz,
    valorCausa,
    status: 'Ativo',
    partes: [
      {
        tipo: 'Autor',
        nome: autorNome,
        advogado: 'Advogado(a) Representante',
      },
      {
        tipo: 'Réu',
        nome: reuNome,
        advogado: 'Advogado(a) Defensor(a)',
      },
    ],
    movimentacoes,
  }
}
