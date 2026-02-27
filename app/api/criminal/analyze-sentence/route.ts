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
            { type: 'Trânsito em Julgado', terms: ['trânsito', 'julgado', 'definitiv', 'definitiva'] },
            { type: 'Extinção/Fim da Pena', terms: ['extinção', 'punibilidade', 'cumprimento', 'cumprid', 'extinta', 'término', 'final'] },
            { type: 'Condenação Anterior', terms: ['antecedente', 'reincid'] },
        ];

        // Dividir por blocos maiores ou quebras de linha
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

        // Remover duplicatas de Contexto + Data
        const uniqueResults = extractionResults.filter((v, i, a) =>
            a.findIndex(t => (t.date === v.date && t.type === v.type)) === i
        );

        // Detecção de Dosimetria adicional
        const mentionsRecidivism = normalizedText.includes('reincidência') || normalizedText.includes('maus antecedentes');

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
            error: 'Erro ao processar o PDF',
            details: error.message
        }, { status: 500 });
    }
}
