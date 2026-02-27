// Testar CNA - Cadastro Nacional dos Advogados
async function testCNA() {
    // Testar a API do CNA para buscar por número de inscrição
    const oab = '84379';
    const uf = 'BA';

    // Tentativa 1: API REST do CNA
    try {
        const url = `https://cna.oab.org.br/api/buscar-advogados?NumeroInscricao=${oab}&TipoInscricao=1&UF=${uf}&pagina=1&ItensPorPagina=10`;
        console.log(`[1] Tentando: ${url}`);
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Referer': 'https://cna.oab.org.br/',
                'Origin': 'https://cna.oab.org.br'
            }
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Response: ${text.substring(0, 500)}`);
    } catch (e) {
        console.error('[1] Erro:', e.message);
    }

    // Tentativa 2: URL alternativa
    try {
        const url2 = `https://cna.oab.org.br/Home/Search?NumeroInscricao=${oab}&TipoInscricao=1&UfInscricao=${uf}`;
        console.log(`\n[2] Tentando: ${url2}`);
        const res2 = await fetch(url2, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Referer': 'https://cna.oab.org.br/'
            }
        });
        console.log(`Status: ${res2.status}`);
        const html = await res2.text();
        // Procurar nome no HTML
        const nameMatch = html.match(/Detalhe[^"]*"[^>]*>([^<]+)</);
        const nameMatch2 = html.match(/Nome[:\s]*<[^>]*>([^<]+)/i);
        const nameMatch3 = html.match(/<td[^>]*>([A-Z\s]{5,})<\/td>/);
        console.log(`HTML length: ${html.length}`);
        console.log(`Name match 1: ${nameMatch?.[1]}`);
        console.log(`Name match 2: ${nameMatch2?.[1]}`);
        console.log(`Name match 3: ${nameMatch3?.[1]}`);

        // Mostrar trecho relevante
        const idx = html.indexOf('84379');
        if (idx > -1) {
            console.log(`\nContexto perto de '84379': ...${html.substring(Math.max(0, idx - 200), idx + 200)}...`);
        }
    } catch (e) {
        console.error('[2] Erro:', e.message);
    }

    // Tentativa 3: POST form
    try {
        const url3 = 'https://cna.oab.org.br/Home/Search';
        console.log(`\n[3] POST para: ${url3}`);
        const body = new URLSearchParams({
            'NumeroInscricao': oab,
            'TipoInscricao': '1',
            'UfInscricao': uf
        });
        const res3 = await fetch(url3, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Referer': 'https://cna.oab.org.br/',
                'Origin': 'https://cna.oab.org.br'
            },
            body: body.toString()
        });
        console.log(`Status: ${res3.status}`);
        const html3 = await res3.text();
        console.log(`HTML length: ${html3.length}`);
        const idx = html3.indexOf('JUNIALISSON');
        if (idx > -1) {
            console.log(`FOUND! Context: ${html3.substring(Math.max(0, idx - 100), idx + 200)}`);
        } else {
            console.log('JUNIALISSON not found');
            // Check for any names
            const allNames = html3.match(/<td[^>]*>\s*([A-Z][A-Z\s]{5,})\s*<\/td>/g);
            console.log('Names found:', allNames?.slice(0, 5));
        }
    } catch (e) {
        console.error('[3] Erro:', e.message);
    }
}

testCNA();
