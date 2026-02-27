
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';

async function runTest() {
    const query = {
        query: {
            bool: {
                must: [
                    { exists: { field: "partes.advogados.numeroOAB" } }
                ]
            }
        },
        size: 2
    };

    console.log(`\n--- Testing Endpoint Structure: ${endpoint} ---`);
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
            console.log(`Hits: ${data.hits?.total?.value || 0}`);
            if (data.hits?.hits?.length > 0) {
                data.hits.hits.forEach(hit => {
                    const advogados = hit._source.partes?.flatMap(p => p.advogados || []) || [];
                    console.log('Sample Advogados:', JSON.stringify(advogados));
                });
            }
        } else {
            console.log(`Error: ${await response.text()}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

runTest();
