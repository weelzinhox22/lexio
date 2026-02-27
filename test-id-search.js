
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function searchInternalId() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: "*84379*",
                fields: ["numeroProcesso", "id"]
            }
        }
    };
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `APIKey ${apiKey}` },
            body: JSON.stringify(query)
        });
        const data = await response.json();
        console.log(`Hits: ${data.hits?.total?.value || 0}`);
    } catch (e) { }
}

searchInternalId();
