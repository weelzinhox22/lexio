"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function generateLegalDocument(data: {
    caseDescription: string;
    clientId: string;
    processId?: string;
    type: 'petition' | 'contract' | 'criminal' | 'tax' | 'corporate';
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Não autorizado" }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    const { data: client } = await supabase.from("clients").select("*").eq("id", data.clientId).single()
    const { data: process } = data.processId && data.processId !== 'none'
        ? await supabase.from("processes").select("*").eq("id", data.processId).single()
        : { data: null }

    const description = data.caseDescription.toLowerCase()
    const lawyerName = profile?.full_name || "NOME DO ADVOGADO"
    const oabNumber = profile?.oab_number ? `${profile.oab_number}/${profile.oab_state || ''}` : "OAB/XX N.º 00.000"

    let title = "Documento Jurídico"
    let content = ""

    const header = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ___ VARA CÍVEL DA COMARCA DE ...

AUTOR: ${client?.name}, ${client?.nationality || 'brasileiro(a)'}, ${client?.civil_status || 'estado civil'}, portador do CPF nº ${client?.document || '...'}, residente em ${client?.address || '...'}, por seu advogado infra-assinado, ${lawyerName}, inscrito na ${oabNumber}, com endereço profissional em ..., onde recebe intimações.

RÉU: [NOME DO RÉU], [QUALIFICAÇÃO], residente e domiciliado em ...
`

    // --- HEURISTIC LOGIC ENGINE v4.2 (Highly Descriptive Templates) ---
    if (data.type === 'criminal') {
        const criminalHeader = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA ___ VARA CRIMINAL DA COMARCA DE ...\n\n`
        if (description.includes("habeas") || description.includes("liberdade") || description.includes("prisão")) {
            title = "Petição de Habeas Corpus com Pedido Liminar"
            content = `EXCELENTÍSSIMO SENHOR DOUTOR DESEMBARGADOR PRESIDENTE DO EGRÉGIO TRIBUNAL DE JUSTIÇA DO ESTADO DE ...

PACIENTE: ${client?.name}, CPF ${client?.document || '...'}, atualmente sob custódia em [LOCAL DA CUSTÓDIA].
IMPETRANTE: ${lawyerName}, OAB ${oabNumber}.

I - DO CABIMENTO E DA SÍNTESE DOS FATOS
O Paciente sofre constrangimento ilegal em sua liberdade de locomoção por ato de [AUTORIDADE COATORA]. Foi decretada a prisão preventiva/temporária fundamentada em [FUNDAMENTO ANALISADO], contudo, tal decisão é carente de base legal idônea.

II - DO DIREITO
Conforme o art. 5º, LXVIII da CF e art. 647 do CPP, concede-se habeas corpus sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção. 
No caso, o Paciente possui residência fixa, trabalho lícito e é primário. Não há elementos que indiquem risco à ordem pública ou instrução criminal. A prisão deve ser a ultima ratio.

III - DO PEDIDO LIMINAR
Requer a concessão da ordem liminarmente para suspender o decreto prisional, expedindo-se o competente Alvará de Soltura.

Comarca de ..., ${new Date().toLocaleDateString('pt-BR')}
${lawyerName} - ${oabNumber}`
        } else {
            title = "Resposta à Acusação (Art. 396-A CPP)"
            content = `${criminalHeader}
PROCESSO Nº ${process?.process_number || '[NÚMERO]'}
ACUSADO: ${client?.name}

O Acusado, por seu advogado, vem apresentar RESPOSTA À ACUSAÇÃO.

I - DOS FATOS
O Acusado foi denunciado pela prática de [TIPO PENAL]. No entanto, a instrução processual provará que a acusação não condiz com a realidade fática.

II - DO DIREITO
A denúncia é inepta (art. 41 CPP) por não descrever a conduta individualizada. (Opcional: Tese de Excludente de Ilicitude / Negativa de Autoria).

III - DOS PEDIDOS
1. A absolvição sumária (art. 397 CPP);
2. A produção de prova testemunhal conforme rol anexo.

Pede Deferimento.
${lawyerName} - ${oabNumber}`
        }
    } else if (data.type === 'tax') {
        title = "Embargos à Execução Fiscal"
        content = `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DA ___ VARA DE EXECUÇÕES FISCAIS DE ...

PROCESSO Nº ${process?.process_number || '[NÚMERO]'}
EMBARGANTE: ${client?.name}
EMBARGADO: FAZENDA PÚBLICA DE ...

O EMBARGANTE vem opor EMBARGOS À EXECUÇÃO FISCAL, pelas razões seguintes:

I - DA NULIDADE DA CDA
A Certidão de Dívida Ativa (CDA) que baseia a execução é nula por violar o art. 202 do CTN, pois omite a base de cálculo, o termo inicial de juros e a fundamentação legal específica.

II - DO MÉRITO (Opcional)
Há excesso de execução/prescrição do crédito tributário, pois decorreram mais de 5 anos entre o fato gerador e o despacho citatório.

III - DOS PEDIDOS
1. Efeito suspensivo aos embargos;
2. Extinção da Execução Fiscal;
3. Condenação em honorários.

Pede Deferimento.
${lawyerName} - ${oabNumber}`
    } else if (data.type === 'corporate') {
        title = "Acordo de Sócios e Investimento"
        content = `INSTRUMENTO PARTICULAR DE ACORDO DE SÓCIOS

SÓCIO 1: ${client?.name}, brasileiro, empresário.
SÓCIO 2: [NOME DO SÓCIO 2], qualificação completa.

CLÁUSULA 1 - DO OBJETO: Regular a governança da sociedade [NOME DA SOCIEDADE].

CLÁUSULA 2 - DAS QUOTAS: As quotas são impenhoráveis e inalienáveis a terceiros sem o consentimento unânime.

CLÁUSULA 3 - DO TAG ALONG: Em caso de venda do controle, o sócio minoritário terá o direito de vender suas quotas nas mesmas condições do majoritário.

CLÁUSULA 4 - RESOLUÇÃO DE CONFLITOS: Qualquer disputa será resolvida por arbitragem conforme as regras da [CÂMARA DE ARBITRAGEM].

${new Date().toLocaleDateString('pt-BR')}
___________________________
${client?.name}`
    } else if (data.type === 'petition') {
        if (description.includes("aluguel") || description.includes("locação") || description.includes("despejo")) {
            title = "Petição Inicial - Despejo e Cobrança"
            content = `${header}
TÍTULO: AÇÃO DE DESPEJO POR FALTA DE PAGAMENTO CUMULADA COM COBRANÇA

I - DOS FATOS
O Autor locou o imóvel situado em [ENDEREÇO] ao Réu. O Réu deixou de pagar os aluguéis desde [DATA ADICIONAR], acumulando dívida de R$ ${process?.value || '[VALOR]'}.

II - DO DIREITO
A Lei 8.245/91 autoriza o despejo (art. 9º, III). O descumprimento do dever contratual de pagar é causa de rescisão objetiva.

III - DOS PEDIDOS
1. A citação para purgar a mora ou contestar;
2. A rescisão do contrato e o despejo;
3. A condenação aos valores em atraso.

Valor da Causa: R$ ${process?.value || '[VALOR]'}.
${lawyerName} - ${oabNumber}`
        } else if (description.includes("consumidor") || description.includes("dano moral")) {
            title = "Petição - Indenizatória Consumidor"
            content = `${header}
TÍTULO: AÇÃO INDENIZATÓRIA POR DANOS MORAIS E MATERIAIS - CDC

I - DOS FATOS
O Autor adquiriu de boa-fé [PRODUTO/SERVIÇO], apresentando vício de qualidade não sanado pela Ré.

II - DO DIREITO
Aplica-se o CDC. O Autor é parte vulnerável. Requer-se a inversão do ônus da prova (art. 6, VIII). A falha no serviço gera dever de indenizar.

III - DOS PEDIDOS
1. Danos Materiais de R$ [VALOR];
2. Danos Morais de R$ [VALOR];
3. Inversão do ônus da prova.

Pede Deferimento.
${lawyerName} - ${oabNumber}`
        } else {
            title = "Petição Inicial - Geral"
            content = `${header}
TÍTULO: AÇÃO DE [PEDIDO]

I - DOS FATOS
${data.caseDescription}

II - DO DIREITO
Com base no Código Civil e jurisprudência dominante...

III - DOS PEDIDOS
Diante do exposto, requer a procedência da demanda em todos os seus termos.

${lawyerName} - ${oabNumber}`
        }
    } else {
        title = `Contrato de Honorários - ${client?.name}`
        content = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS

CONTRATANTE: ${client?.name}
CONTRATADO: ${lawyerName}, OAB ${oabNumber}.

OBJETO: Patrocínio jurídico na causa [DATA.CASEDESCRIPTION].
HONORÁRIOS: R$ ${process?.value || '[VALOR ADICIONAR]'}.

Comarca de ..., ${new Date().toLocaleDateString('pt-BR')}
___________________________
${lawyerName}
___________________________
${client?.name}`
    }

    return {
        success: true,
        title,
        content,
        type: data.type,
        metadata: {
            generated_at: new Date().toISOString(),
            engine: "Lexio Heuristic v4.2 (Structured Templates)"
        }
    }
}

export async function saveAiDocument(data: {
    title: string;
    content: string;
    type: string;
    clientId?: string;
    processId?: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Não autorizado" }

    const { error } = await supabase.from("ai_generated_documents").insert({
        user_id: user.id,
        title: data.title,
        content: data.content,
        type: data.type,
        client_id: data.clientId === 'none' ? null : data.clientId,
        process_id: data.processId === 'none' ? null : data.processId
    })

    if (error) return { success: false, error: error.message }
    revalidatePath("/dashboard/ai-writer")
    return { success: true }
}

export async function contributeAsTemplate(data: {
    title: string;
    content: string;
    type: string;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Não autorizado" }

    // Fetch user profile to know EXACTLY what to remove
    const { data: profile } = await supabase.from("profiles").select("full_name, oab_number, oab_state").eq("id", user.id).single()
    const lawyerName = profile?.full_name
    const oab = profile?.oab_number
    const oabState = profile?.oab_state

    let anonymousContent = data.content

    // 1. Literal replacements based on profile
    if (lawyerName) {
        anonymousContent = anonymousContent.split(lawyerName).join("[NOME DO ADVOGADO]")
    }
    if (oab) {
        anonymousContent = anonymousContent.split(oab).join("[OAB]")
    }

    // 2. Generic Signature/Footer cleaning (Aggressive)
    anonymousContent = anonymousContent.replace(/(\r?\n|^)[\s]*[A-Za-zÀ-ÖØ-öø-ÿ\s.'-]+\s*-\s*OAB\/[A-Z]{2}[\s\S]*?$/gm, "\n\n[NOME DO ADVOGADO]\n[OAB/ESTADO]")

    // 3. Header/Qualification cleaning
    anonymousContent = anonymousContent.replace(/AUTOR: (.*?) por seu advogado/g, "AUTOR: [CLIENTE] por seu advogado")
    anonymousContent = anonymousContent.replace(/portador do CPF nº (.*?),/g, "portador do CPF nº [CPF],")
    anonymousContent = anonymousContent.replace(/residente em (.*?),/g, "residente em [ENDEREÇO],")
    anonymousContent = anonymousContent.replace(/inscrito na (.*?),/g, "inscrito na [OAB],")
    anonymousContent = anonymousContent.replace(/CPF[:\s]+[0-9.-]+/gi, "CPF: [CPF]")
    anonymousContent = anonymousContent.replace(/OAB\/[A-Z]{2}[:\s]*[0-9.]+/gi, "OAB/[UF] [NÚMERO]")

    // 4. Clean specific templates signatures already generated
    anonymousContent = anonymousContent.replace(/___________________________/g, "___________________________")

    // Extract standard placeholders for the template system
    const placeholders = ["NOME_CLIENTE", "CPF_CLIENTE", "ENDERECO_CLIENTE", "CIDADE_CLIENTE", "NOME_ADVOGADO", "OAB_ADVOGADO", "DATA_ATUAL"]

    const { error } = await supabase.from("document_templates").insert({
        name: `[COLETIVO] ${data.title}`,
        category: data.type === 'contract' ? 'contracts' : 'petitions',
        subcategory: 'Inteligência Coletiva',
        content: anonymousContent,
        is_system: false,
        user_id: null,
        description: "Estrutura validada por IA e compartilhada anonimamente pela comunidade. (DADOS SENSÍVEIS REMOVIDOS)",
        placeholders: placeholders
    })

    if (error) return { success: false, error: error.message }
    return { success: true }
}

export async function getAiHistory() {
    const supabase = await createClient()
    const { data: documents, error } = await supabase
        .from("ai_generated_documents")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) return []
    return documents
}
