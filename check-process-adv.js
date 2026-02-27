
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const processNum = '80573465120208050001';

async function checkProcess() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            match: { "numeroProcesso": processNum }
        }
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
            const source = data.hits.hits[0]._source;
            console.log('Partes -> Advogados found in process 8057346-51:');
            const advs = source.partes?.flatMap(p => p.advogados || []) || [];
            console.log(JSON.stringify(advs, null, 2));
        } else {
            console.log('Process not found in TJBA');
        }
    } catch (e) { console.error(e); }
}

checkProcess();
