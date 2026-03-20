
async function testTJBAScraper() {
    const oab = '30802';
    const uf = 'BA';
    const oabComUf = `${oab}${uf}`;
    const baseUrl = 'https://esaj.tjba.jus.br/cpopg';
    // Try NUMOAB first
    const searchUrl = `${baseUrl}/search.do?conversationId=&cbPesquisa=NUMOAB&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`;

    console.log(`Testing BA Scraper (NUMOAB): ${searchUrl}`);
    try {
        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const html = await response.text();
        console.log(`HTML Length: ${html.length}`);
        console.log(`Contains linkProcesso: ${html.includes('linkProcesso')}`);
        console.log(`Contains captcha: ${html.includes('captcha')}`);

        if (!html.includes('linkProcesso')) {
            // Try DOCADVOGADO
            const searchUrl2 = `${baseUrl}/search.do?conversationId=&cbPesquisa=DOCADVOGADO&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`;
            console.log(`Testing BA Scraper (DOCADVOGADO): ${searchUrl2}`);
            const response2 = await fetch(searchUrl2, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });
            const html2 = await response2.text();
            console.log(`HTML2 Length: ${html2.length}`);
            console.log(`Contains linkProcesso: ${html2.includes('linkProcesso')}`);
        }
    } catch (error) {
        console.error(error);
    }
}

testTJBAScraper();
