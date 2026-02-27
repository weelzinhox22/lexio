import { NextResponse } from 'next/server';

// Carregamento resiliente do pdfjs para ambiente Node
let pdfjsLib: any;
try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
} catch (e) {
    console.error('Falha ao carregar pdfjs-dist via require:', e);
}

export async function POST(req: Request) {
    console.log('[API] Iniciando análise de sentença PDF...');
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        console.log(`[API] Arquivo recebido: ${file.name} (${file.size} bytes)`);

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        if (!pdfjsLib) {
            throw new Error('PDFJS Library não foi carregada corretamente no servidor.');
        }

        // Carregar o PDF com configurações seguras para Node
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
            disableWorker: true, // Importante para rodar em Server Actions/API Routes sem worker separado
        });

        const pdf = await loadingTask.promise;
        console.log(`[API] PDF carregado com sucesso. Total de páginas: ${pdf.numPages}`);

        let fullText = '';

        // Extrair texto de todas as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n';
            } catch (pageErr) {
                console.warn(`[API] Erro ao extrair texto da página ${i}:`, pageErr);
            }
        }

        if (!fullText.trim()) {
            console.warn('[API] Nenhum texto extraído do PDF. O arquivo pode ser uma imagem/scan sem OCR.');
        }

        // Lógica de Extração Inteligente (NLP Light)
        const normalizedText = fullText.toLowerCase();
        const dateRegex = /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/g;
        const extractionResults: { type: string, date: string, context: string }[] = [];

        const keywords = [
            { type: 'Trânsito em Julgado', terms: ['trânsito', 'julgado', 'definitiv', 'definitiva'] },
            { type: 'Extinção/Fim da Pena', terms: ['extinção', 'punibilidade', 'cumprimento', 'cumprid', 'extinta', 'término', 'final'] },
            { type: 'Condenação Anterior', terms: ['antecedente', 'reincid'] },
        ];

        const blocks = fullText.split(/\n|(?:\s{2,})|(?:\.\s)/);

        for (const block of blocks) {
            const lowerBlock = block.toLowerCase();
            for (const kw of keywords) {
                if (kw.terms.some(term => lowerBlock.includes(term))) {
                    const matchDates = block.match(dateRegex);
                    if (matchDates) {
                        for (const date of matchDates) {
                            extractionResults.push({
                                type: kw.type,
                                date: date,
                                context: block.trim().slice(0, 150)
                            });
                        }
                    }
                }
            }
        }

        const uniqueResults = extractionResults.filter((v, i, a) =>
            a.findIndex(t => (t.date === v.date && t.type === v.type)) === i
        );

        const mentionsRecidivism = normalizedText.includes('reincidência') || normalizedText.includes('maus antecedentes');

        console.log(`[API] Análise concluída. ${uniqueResults.length} datas detectadas.`);

        return NextResponse.json({
            success: true,
            textPreview: fullText.slice(0, 500),
            extractions: uniqueResults,
            insights: {
                hasCriminalHistory: mentionsRecidivism,
            }
        });

    } catch (error: any) {
        console.error('[PDF ANALYZER ERROR]:', error);
        return NextResponse.json({
            error: 'Erro interno ao processar o PDF',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
