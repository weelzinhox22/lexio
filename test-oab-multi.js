
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '84379';
const endpoints = [
    'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search',
    'https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search',
    'https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search'
];

async function runTest() {
    for (const endpoint of endpoints) {
        const query = {
            query: {
                query_string: {
                    query: `"${oab}"`,
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
            console.log(`${endpoint} -> Hits: ${data.hits?.total?.value || 0}`);
            if (data.hits?.hits?.length > 0) {
                const source = data.hits.hits[0]._source;
                console.log('Advogados found:');
                const advs = source.partes?.flatMap(p => p.advogados || []) || [];
                console.log(JSON.stringify(advs, null, 2));
            }
        } catch (e) { console.error(e); }
    }
}

runTest();
