
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '30802';
const uf = 'BA';

const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';

async function runTest() {
    const query = {
        query: {
            query_string: {
                query: `"${oab}"`,
                fields: ["*"]
            }
        },
        size: 5
    };

    console.log(`\n--- Testing Search for OAB ${oab} in ${endpoint} ---`);
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
            console.log(`Hits: ${data.hits?.total?.value || 0}`);
            if (data.hits?.hits?.length > 0) {
                data.hits.hits.forEach(hit => {
                    console.log('Found:', hit._source.numeroProcesso);
                    // Log all fields containing the OAB
                    const foundPaths = [];
                    function findInObj(obj, val, path = '') {
                        for (let key in obj) {
                            let curPath = path ? `${path}.${key}` : key;
                            if (typeof obj[key] === 'object' && obj[key] !== null) {
                                findInObj(obj[key], val, curPath);
                            } else if (String(obj[key]).includes(val)) {
                                foundPaths.push(curPath);
                            }
                        }
                    }
                    findInObj(hit._source, oab);
                    console.log('OAB Paths:', foundPaths);
                });
            }
        } else {
            console.log(`Error: ${await response.text()}`);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
}

runTest();
