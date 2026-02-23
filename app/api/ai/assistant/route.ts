import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Fallback response se nenhuma keyword se aproximar
const fallbackResponse = "Desculpe, não consegui compreender exatamente a sua dúvida. Pode tentar usar outras palavras? 🤔\n\nExemplo do que você pode perguntar:\n- *'Como importar processo?'*\n- *'Como calcular meus honorários na plataforma?'*\n- *'Preciso do telefone do suporte'*."

async function getDynamicKnowledgeBase() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error("Supabase config missing for AI Assistant")
        return []
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data, error } = await supabase
        .from('bot_knowledge')
        .select('question, answer')
        .eq('is_active', true)

    if (error) {
        console.error("Error fetching bot knowledge:", error)
        return []
    }

    // Mapeia do banco pra estrutura do NLP
    return (data || []).map(row => ({
        // Divide as sentenças cadastradas no banco por virgula para transformar em array de keywords
        keywords: row.question.split(',').map((k: string) => k.trim()),
        response: row.answer
    }))
}

async function findBestResponse(userInput: string) {
    // Limpar acentuação, colocar minúsculas para padronizar
    const normalizedInput = userInput.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")

    let bestMatchScore = 0
    let bestResponse = fallbackResponse

    const knowledgeBase = await getDynamicKnowledgeBase()

    for (const item of knowledgeBase) {
        let currentScore = 0
        for (const keyword of item.keywords) {
            // Remover acentos da keyword também
            const normalizedKeyword = keyword.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "")

            // Se a frase contiver a palavra como uma palavra solta isolada ou sub-frase (evita que 's' dispare se o cara disser 'sol', ou 'rs' no meio de 'recurso')
            const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i')
            if (regex.test(normalizedInput)) {
                // Palavras maiores valem mais pontos para priorizar tópicos sobre onomatopéias fracas
                currentScore += normalizedKeyword.length
            }
        }

        if (currentScore > bestMatchScore) {
            bestMatchScore = currentScore
            bestResponse = item.response
        }
    }

    return bestResponse
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Formato de mensagens inválido.' }, { status: 400 })
        }

        // Pega a última pergunta do usuário que foi enviada no formato chat
        const lastUserMessage = messages[messages.length - 1]?.content || ""

        // 100% Processamento Algorítmico Local (sem chamada a APIs como ChatGPT/Groq) consultando DB em Real-Time
        const responseText = await findBestResponse(lastUserMessage)

        // Adiciona um micro atraso artificial sutil (600ms) para melhorar a experiência visual do assistente "digitando"
        await new Promise(resolve => setTimeout(resolve, 600))

        return NextResponse.json({ text: responseText })
    } catch (error) {
        console.error('Erro no Virtual Assistant (Local):', error)
        return NextResponse.json({ error: 'Desculpe, o sistema de arquivos local encontrou um erro no chat.' }, { status: 500 })
    }
}
