
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';

async function findProcessWithLawyer(tribunal) {
    const endpoint = `https://api-publica.datajud.cnj.jus.br/api_publica_tj${tribunal}/_search`;
    console.log(`Searching in ${endpoint}...`);

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
            console.log(`${tribunal} - Hits with lawyer field: ${data.hits?.total?.value || 0}`);
            if (data.hits?.hits?.length > 0) {
                console.log(`${tribunal} lawyer sample:`, JSON.stringify(data.hits.hits[0]._source.partes[0].advogados[0]));
            }
        } else {
            console.log(`${tribunal} error: ${response.status}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await findProcessWithLawyer('sp');
    await findProcessWithLawyer('ba');
}

run();
