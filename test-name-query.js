
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const name = 'Gelli Donatti';

async function testNameQuery() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: `"${name}"`
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
            console.log(`Name Query Hits for ${name}: ${data.hits?.total?.value || 0}`);
            if (data.hits?.hits?.length > 0) {
                data.hits.hits.forEach(hit => console.log(hit._source.numeroProcesso));
            }
        }
    } catch (e) { }
}

testNameQuery();
