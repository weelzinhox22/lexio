
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const realOAB = '130612'; // Random SP OAB

async function testRealSP() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';
    const query = {
        query: {
            query_string: {
                query: `"${realOAB}"`,
                fields: ["*"]
            }
        },
        size: 1
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
        console.log(`Hits for Real SP OAB "${realOAB}": ${data.hits?.total?.value || 0}`);
        if (data.hits?.hits?.length > 0) {
            console.log('Keys:', Object.keys(data.hits.hits[0]._source));
        }
    } catch (e) { }
}

testRealSP();
