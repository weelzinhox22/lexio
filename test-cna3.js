// Validar CNA programaticamente
async function testCNAProgrammatic() {
    // Step 1: GET da home para pegar cookie e token
    const homeRes = await fetch('https://cna.oab.org.br/', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html'
        }
    });

    const homeHtml = await homeRes.text();
    const setCookieHeader = homeRes.headers.get('set-cookie') || '';

    // Extrair token do HTML
    const tokenMatch = homeHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    const token = tokenMatch?.[1];
    console.log(`Token: ${token ? token.substring(0, 20) + '...' : 'NOT FOUND'}`);

    // Extrair cookie
    const cookieMatch = setCookieHeader.match(/__RequestVerificationToken=([^;]+)/);
    const cookie = cookieMatch ? `__RequestVerificationToken=${cookieMatch[1]}` : '';
    console.log(`Cookie: ${cookie ? cookie.substring(0, 40) + '...' : 'NOT FOUND'}`);

    if (!token || !cookie) {
        console.error('Failed to get token or cookie');
        return;
    }

    // Step 2: POST de busca
    const body = `__RequestVerificationToken=${encodeURIComponent(token)}&IsMobile=false&NomeAdvo=&Insc=84379&Uf=BA&TipoInsc=`;

    const searchRes = await fetch('https://cna.oab.org.br/Home/Search', {
        method: 'POST',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest',
            'RequestVerificationToken': token,
            'Cookie': cookie,
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
        if (data.Data && Array.isArray(data.Data)) {
            console.log(`Results: ${data.Data.length}`);
            data.Data.forEach((item, i) => {
                console.log(`  [${i}] ${item.Nome} - OAB ${item.Inscricao}/${item.UF} (${item.TipoInscOab})`);
            });
        } else {
            console.log('Response:', responseText.substring(0, 500));
        }
    } catch (e) {
        console.log('Not JSON. Raw:', responseText.substring(0, 500));
    }
}

testCNAProgrammatic();
