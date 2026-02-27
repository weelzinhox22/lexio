
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function checkTRT() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search';
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
        const data = await response.json();
        if (data.hits?.hits?.length > 0) {
            console.log('TRT5 Document Keys:', Object.keys(data.hits.hits[0]._source));
            if (data.hits.hits[0]._source.partes) {
                console.log('Partes found in TRT5! Sample:');
                console.log(JSON.stringify(data.hits.hits[0]._source.partes[0], null, 2));
            }
        }
    } catch (e) { }
}

checkTRT();
