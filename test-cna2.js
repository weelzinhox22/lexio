// Testar CNA com abordagem de browser-like
async function testCNA2() {
    // Step 1: Get the main page and cookies
    try {
        const mainRes = await fetch('https://cna.oab.org.br/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': 'text/html',
            }
        });
        console.log(`Main page status: ${mainRes.status}`);
        const cookies = mainRes.headers.getSetCookie?.() || [];
        console.log(`Cookies: ${cookies.length}`);
        const mainHtml = await mainRes.text();

        // Find the verification token
        const tokenMatch = mainHtml.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
        console.log(`Token found: ${!!tokenMatch}`);

        // Find form action
        const formMatch = mainHtml.match(/action="([^"]*Search[^"]*)"/i);
        console.log(`Form action: ${formMatch?.[1]}`);

        // Check for any API endpoints in the JS
        const apiMatches = mainHtml.match(/api\/[a-zA-Z]+/g);
        console.log(`API endpoints in HTML: ${JSON.stringify([...new Set(apiMatches || [])])}`);

        // Check for Angular/React endpoints
        const ngMatches = mainHtml.match(/ng-[a-z]+="[^"]*"/g);
        console.log(`Angular directives: ${ngMatches?.slice(0, 5)}`);

        // Check for fetch/ajax URLs
        const fetchMatches = mainHtml.match(/url:\s*['"]([^'"]+)['"]/g);
        console.log(`Fetch URLs: ${fetchMatches?.slice(0, 5)}`);

        // Check script sources
        const scriptMatches = mainHtml.match(/src="([^"]*\.js[^"]*)"/g);
        console.log(`Scripts: ${scriptMatches?.slice(0, 10)}`);

        // Dump relevant portion
        const idx = mainHtml.indexOf('NumeroInscricao');
        if (idx > -1) {
            console.log(`\nForm context: ${mainHtml.substring(Math.max(0, idx - 300), idx + 500)}`);
        }

        // Check if it's a SPA
        const spaIndicators = ['__next', 'react-root', 'app-root', '#app', 'ng-app'];
        for (const ind of spaIndicators) {
            if (mainHtml.includes(ind)) console.log(`SPA indicator: ${ind}`);
        }

    } catch (e) {
        console.error('Error:', e.message);
    }
}

testCNA2();
