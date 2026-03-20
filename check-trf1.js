
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function checkTRF1() {
    const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search`;
    const query = {
        query: {
            exists: { field: "partes.advogados.numeroOAB" }
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
        if (response.ok) {
            const data = await response.json();
            console.log(`TRF1 - Hits with lawyer field: ${data.hits?.total?.value || 0}`);
        }
    } catch (e) { }
}

checkTRF1();
