import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Carregar o PDF
        const loadingTask = pdfjsLib.getDocument({
            data: uint8Array,
            useSystemFonts: true,
            disableFontFace: true,
        });

        const pdf = await loadingTask.promise;
        let fullText = '';

        // Extrair texto de todas as páginas
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        // Lógica de Extração Inteligente (NLP Light)
        const normalizedText = fullText.toLowerCase();

        // 1. Buscar Datas de Trânsito em Julgado / Condenação
        const dateRegex = /(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/g;

        // Procurar termos próximos a datas
        const extractionResults: { type: string, date: string, context: string }[] = [];

        const keywords = [
            { type: 'Trânsito em Julgado', terms: ['trânsito', 'julgado', 'definitiv'] },
            { type: 'Extinção da Pena', terms: ['extinção', 'punibilidade', 'cumprid', 'extinta'] },
            { type: 'Condenação Anterior', terms: ['antecedentes', 'reincid'] },
        ];

        // Dividir em sentenças para contexto
        const sentences = fullText.split(/[.!?\n]/);

        for (const sentence of sentences) {
            const lowerSentence = sentence.toLowerCase();
            for (const kw of keywords) {
                if (kw.terms.some(term => lowerSentence.includes(term))) {
                    const matchDate = sentence.match(dateRegex);
                    if (matchDate) {
                        extractionResults.push({
                            type: kw.type,
                            date: matchDate[0],
                            context: sentence.trim().slice(0, 150) // Limitar tamanho do contexto
                        });
                    }
                }
            }
        }

        // Detecção de Dosimetria adicional
        const mentionsRecidivism = normalizedText.includes('reincidência') || normalizedText.includes('maus antecedentes');

        return NextResponse.json({
            success: true,
            textPreview: fullText.slice(0, 500),
            extractions: extractionResults,
            insights: {
                hasCriminalHistory: mentionsRecidivism,
            }
        });

    } catch (error: any) {
        console.error('[PDF ANALYZER ERROR]:', error);
        return NextResponse.json({
            error: 'Erro ao processar o PDF',
            details: error.message
        }, { status: 500 });
    }
}
