
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function searchNameBroad() {
    const endpoints = [
        'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search',
        'https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search',
        'https://api-publica.datajud.cnj.jus.br/api_publica_stj/_search'
    ];

    for (const endpoint of endpoints) {
        const query = {
            query: {
                match_phrase: { "partes.nome": "JUNIALISSON NEPOMUCENO COSTA" }
            },
            size: 1
        };
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `APIKey ${apiKey}` },
                body: JSON.stringify(query)
            });
            const data = await response.json();
            console.log(`${endpoint} -> Hits: ${data.hits?.total?.value || 0}`);
        } catch (e) { }
    }
}

searchNameBroad();
