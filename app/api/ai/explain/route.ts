import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const apiKey = process.env.GROQ_API_KEY

        if (!apiKey) {
            return NextResponse.json({ error: 'GROQ_API_KEY não configurada.' }, { status: 500 })
        }

        const prompt = `Você é um assistente virtual jurídico chamado Themixa AI. A sua tarefa é receber informações técnicas do andamento de um processo e reescrevê-las em uma linguagem simples, amigável e acessível para o cliente leigo entender via WhatsApp.
    
Por favor, gere uma ÚNICA MENSAGEM de WhatsApp usando as informações abaixo. Mantenha os emojis, seja super cordial, chame o cliente pelo nome (se houver), e inclua a última movimentação de forma muito fácil de compreender. Termine com a assinatura do advogado (se houver nome).
NÃO adicione introduções ou conclusões como "Aqui está a resposta", apenas gere o texto final exato que será enviado ao cliente. 

Dados do Processo:
${JSON.stringify(body, null, 2)}
`

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // Fast model for simple rewriting
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 500
            })
        })

        if (!response.ok) {
            const err = await response.text()
            console.error("Groq Error", err)
            throw new Error("Erro na API de IA")
        }

        const data = await response.json()
        const content = data.choices[0].message.content.trim()

        return NextResponse.json({ text: content })
    } catch (error) {
        console.error('Erro na rota de IA:', error)
        return NextResponse.json({ error: 'Falha ao reescrever mensagem.' }, { status: 500 })
    }
}
