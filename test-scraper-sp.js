
async function testTJSPScraper() {
    const oab = '100000';
    const uf = 'SP';
    const oabComUf = `${oab}${uf}`;
    const baseUrl = 'https://esaj.tjsp.jus.br/cpopg';
    const searchUrl = `${baseUrl}/search.do?conversationId=&cbPesquisa=NUMOAB&dadosConsulta.valorConsulta=${oabComUf}&cdForo=-1`;

    console.log(`Testing SP Scraper: ${searchUrl}`);
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
    } catch (error) {
        console.error(error);
    }
}

testTJSPScraper();
