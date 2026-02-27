
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function searchPartialName() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = {
        query: {
            query_string: {
                query: "*JUNIALISSON*",
                fields: ["*"]
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
        if (data.hits?.hits?.length > 0) {
            console.log(JSON.stringify(data.hits.hits[0]._source, null, 2));
        }
    } catch (e) { }
}

searchPartialName();
