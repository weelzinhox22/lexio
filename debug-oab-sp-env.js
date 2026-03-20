
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '134460';
const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search';

async function runTest() {
    const query = {
        query: {
            query_string: {
                query: `"${oab}"`,
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

        if (response.ok) {
            const data = await response.json();
            console.log(`SP Hits with ENV KEY for OAB ${oab}: ${data.hits?.total?.value || 0}`);
        } else {
            console.log(`Error: ${await response.text()}`);
        }
    } catch (error) {
        console.error(error);
    }
}

runTest();
