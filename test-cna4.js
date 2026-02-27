// Validar CNA com cookie handling correto
async function testCNAFull() {
    // Step 1: GET da home para pegar TODOS os cookies e token
    const homeRes = await fetch('https://cna.oab.org.br/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html'
        }
    });

    const homeHtml = await homeRes.text();

    // Extrair TODOS os set-cookie headers
    const rawHeaders = homeRes.headers;
    let allCookies = '';

    // Node 18+ supports getSetCookie
    if (typeof rawHeaders.getSetCookie === 'function') {
        const setCookies = rawHeaders.getSetCookie();
        console.log(`Set-Cookie headers: ${setCookies.length}`);
        setCookies.forEach((c, i) => console.log(`  [${i}] ${c.substring(0, 80)}...`));
        allCookies = setCookies.map(c => c.split(';')[0]).join('; ');
    } else {
        const setCookie = rawHeaders.get('set-cookie') || '';
        console.log(`Single set-cookie: ${setCookie.substring(0, 80)}...`);
        allCookies = setCookie.split(';')[0];
    }

    console.log(`All cookies: ${allCookies.substring(0, 100)}...`);

    // Extrair token do HTML
    const tokenMatch = homeHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    const token = tokenMatch?.[1];
    console.log(`Token: ${token ? 'OK (' + token.length + ' chars)' : 'NOT FOUND'}`);

    if (!token) {
        console.error('Token not found');
        return;
    }

    // Step 2: POST de busca com cookies corretos
    const body = `__RequestVerificationToken=${encodeURIComponent(token)}&IsMobile=false&NomeAdvo=&Insc=84379&Uf=BA&TipoInsc=`;

    const searchRes = await fetch('https://cna.oab.org.br/Home/Search', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'Cookie': allCookies,
            'Referer': 'https://cna.oab.org.br/',
            'Origin': 'https://cna.oab.org.br'
        },
        body
    });

    console.log(`\nSearch status: ${searchRes.status}`);
    const responseText = await searchRes.text();
    console.log(`Response length: ${responseText.length}`);

    try {
        const data = JSON.parse(responseText);
        console.log(`Success: ${data.Success}`);
        if (data.Success && data.Data && Array.isArray(data.Data)) {
            console.log(`Results: ${data.Data.length}`);
            data.Data.forEach((item, i) => {
                console.log(`  [${i}] ${item.Nome} - OAB ${item.Inscricao}/${item.UF} (${item.TipoInscOab})`);
            });
        } else {
            console.log('Message:', data.Message?.substring(0, 200));
        }
    } catch (e) {
        console.log('Not JSON:', responseText.substring(0, 300));
    }
}

testCNAFull();
