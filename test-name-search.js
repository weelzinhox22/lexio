
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const lawyerName = 'JUNIALISSON NEPOMUCENO COSTA';

async function searchByName() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            match_phrase: { "partes.advogados.nome": lawyerName }
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
        const data = await response.json();
        console.log(`Hits for Name "${lawyerName}": ${data.hits?.total?.value || 0}`);
        if (data.hits?.hits?.length > 0) {
            console.log('Sample Record Source Partes/Advogados:');
            const advs = data.hits.hits[0]._source.partes?.flatMap(p => p.advogados || []);
            console.log(JSON.stringify(advs, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

searchByName();
