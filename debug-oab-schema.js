
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';

async function runTest() {
    const query = {
        query: { match_all: {} },
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

        if (response.ok) {
            const data = await response.json();
            if (data.hits?.hits?.length > 0) {
                console.log('Source Schema:', JSON.stringify(data.hits.hits[0]._source, null, 2));
            }
        }
    } catch (error) { }
}

runTest();
