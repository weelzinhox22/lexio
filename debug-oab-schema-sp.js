
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';

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
                console.log('SP Schema Keys:', Object.keys(data.hits.hits[0]._source));
                if (data.hits.hits[0]._source.partes) {
                    console.log('SP Partes exists!');
                } else {
                    console.log('SP Partes DOES NOT exist in this hit.');
                }
            }
        }
    } catch (error) { }
}

runTest();
