
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oabSP = '233333';

async function scanSP() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';
    const query = {
        query: {
            query_string: {
                query: `*${oabSP}*`,
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
        if (data.hits?.hits?.length > 0) {
            console.log('SP Document Found. Scanning keys and values...');
            const source = data.hits.hits[0]._source;
            for (const [key, value] of Object.entries(source)) {
                if (JSON.stringify(value).includes(oabSP)) {
                    console.log(`Found OAB ${oabSP} in key: "${key}"`);
                    console.log('Value excerpt:', JSON.stringify(value).substring(0, 300));
                }
            }
        } else {
            console.log('No SP document found with this OAB.');
        }
    } catch (e) { }
}

scanSP();
