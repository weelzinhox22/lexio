
const apiKey = 'cDzFyJWE9nGPRnWE949n95989R939n929r98';
const oab = '23333';
const uf = 'BA';

const endpoints = [
    'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search',
    'https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search',
    'https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search'
];

const queries = [
    {
        query: {
            query_string: {
                query: `"${oab}"`,
                fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"],
                default_operator: "OR"
            }
        },
        size: 10
    },
    {
        query: {
            query_string: {
                query: `"${oab}${uf}"`,
                fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"],
                default_operator: "OR"
            }
        },
        size: 10
    },
    {
        query: {
            query_string: {
                query: `*${oab}*`,
                fields: ["partes.advogados.numeroOAB", "partes.advogados.numeroOab", "advogados.numeroOAB", "numeroOAB"],
                default_operator: "OR"
            }
        },
        size: 10
    }
];

async function runTest() {
    for (const endpoint of endpoints) {
        console.log(`\n--- Testing Endpoint: ${endpoint} ---`);
        for (let i = 0; i < queries.length; i++) {
            console.log(`Testing Query ${i + 1}...`);
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `APIKey ${apiKey}`
                    },
                    body: JSON.stringify(queries[i])
                });

                console.log(`Status: ${response.status}`);
                const data = await response.json();
                console.log(`Hits: ${data.hits?.total?.value || 0}`);

                if (data.hits?.hits?.length > 0) {
                    console.log(`Found ${data.hits.hits.length} items.`);
                    const first = data.hits.hits[0]._source;
                    console.log('Sample Advantage fields:', JSON.stringify(first.partes?.flatMap(p => p.advogados || [])?.filter(a => a.numeroOAB?.includes(oab))?.map(a => ({ num: a.numeroOAB, uf: a.ufOAB })) || []));
                }
            } catch (error) {
                console.error(`Error: ${error.message}`);
            }
        }
    }
}

runTest();
