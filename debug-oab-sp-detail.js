
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';

async function runTest() {
    const query = {
        query: { match_all: {} },
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
            data.hits.hits.forEach(hit => {
                console.log('SP Process:', hit._source.numeroProcesso);
                console.log('SP Source keys:', Object.keys(hit._source));
                if (hit._source.partes) {
                    console.log('SP Partes found!');
                    console.log('First party:', JSON.stringify(hit._source.partes[0]));
                }
            });
        }
    } catch (error) { }
}

runTest();
