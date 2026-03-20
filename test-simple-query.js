
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '100000'; // Real SP OAB

async function testSimpleQuery() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';
    const query = {
        query: {
            query_string: {
                query: `"${oab}"`
            }
        },
        size: 2
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
        if (response.ok) {
            const data = await response.json();
            console.log(`Simple Query Hits: ${data.hits?.total?.value || 0}`);
        }
    } catch (e) { }
}

testSimpleQuery();
