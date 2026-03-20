
async function testJusbrasilFetch() {
    const url = 'https://www.jusbrasil.com.br/busca?q=84379/BA';
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            }
        });
        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Length: ${text.length}`);
        const match = text.match(/([A-Z\s]{10,})\s*\(?OAB:?\s*BA\s*84379/i);
        if (match) {
            console.log(`Found Name: ${match[1].trim()}`);
        } else {
            console.log('Name not found in HTML');
            // console.log(text.substring(0, 1000));
        }
    } catch (e) {
        console.error(e);
    }
}

testJusbrasilFetch();
