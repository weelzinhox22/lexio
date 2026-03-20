
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oabFormatted = 'BA84379';

async function testRealOAB() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: `"${oabFormatted}"`
            }
        }
    };
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `APIKey ${apiKey}`
            },
            body: JSON.stringify(query)
        });
        const data = await response.json();
        console.log(`Hits for ${oabFormatted}: ${data.hits?.total?.value || 0}`);
    } catch (e) { }
}

testRealOAB();
