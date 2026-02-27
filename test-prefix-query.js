
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '30802';
const uf = 'BA';

async function testPrefixQuery() {
    const oabPrefix = `${uf}${oab}`; // BA30802
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: `"${oabPrefix}"`,
                fields: ["*"]
            }
        },
        size: 5
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
            console.log(`Prefix Query (BA30802) Hits: ${data.hits?.total?.value || 0}`);
        }
    } catch (e) { }
}

testPrefixQuery();
