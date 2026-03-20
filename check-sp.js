
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oabSP = '233333'; // Known SP OAB format (usually 6 digits)

async function checkSP() {
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
            console.log('SP Document Found. Keys:', Object.keys(data.hits.hits[0]._source));
            // Look for the OAB string in the whole source
            const sourceStr = JSON.stringify(data.hits.hits[0]._source);
            if (sourceStr.includes(oabSP)) {
                console.log(`OAB ${oabSP} found in source!`);
                // Find where it is
                for (const [key, value] of Object.entries(data.hits.hits[0]._source)) {
                    if (JSON.stringify(value).includes(oabSP)) {
                        console.log(`Found in key: ${key}`);
                        console.log('Value:', JSON.stringify(value).substring(0, 200));
                    }
                }
            }
        }
    } catch (e) { }
}

checkSP();
