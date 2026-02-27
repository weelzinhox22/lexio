
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function checkAdvField() {
    const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search`;
    const query = {
        query: {
            exists: { field: "advogados" }
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
        console.log(`Hits with top-level advogados field: ${data.hits?.total?.value || 0}`);
    } catch (e) { }
}

checkAdvField();
