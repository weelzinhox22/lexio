
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '84379';

async function searchOABGlobal() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: `*${oab}*`,
                fields: ["*"]
            }
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
        console.log(`Global Hits for OAB "${oab}": ${data.hits?.total?.value || 0}`);
        if (data.hits?.hits?.length > 0) {
            console.log(JSON.stringify(data.hits.hits[0]._source, null, 2).substring(0, 1000));
        }
    } catch (e) {
        console.error(e);
    }
}

searchOABGlobal();
