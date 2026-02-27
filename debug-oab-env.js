
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '23333';
const uf = 'BA';

const endpoints = [
    'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search'
];

async function runTest() {
    const cleanOab = oab.replace(/\D/g, '');
    const oabWithUf = `${cleanOab}${uf.toUpperCase()}`;

    const query = {
        query: {
            bool: {
                should: [
                    { query_string: { query: `"${cleanOab}"`, fields: ["*"] } },
                    { query_string: { query: `"${oabWithUf}"`, fields: ["*"] } }
                ],
                minimum_should_match: 1
            }
        },
        size: 2
    };

    for (const endpoint of endpoints) {
        console.log(`\n--- Testing Endpoint: ${endpoint} ---`);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `APIKey ${apiKey}`
                },
                body: JSON.stringify(query)
            });

            console.log(`Status: ${response.status}`);
            if (response.ok) {
                const data = await response.json();
                console.log(`Hits: ${data.hits?.total?.value || 0}`);
                if (data.hits?.hits?.length > 0) {
                    console.log('Results found!');
                    // Log fields where OAB matches
                    data.hits.hits.forEach(hit => {
                        console.log('Process:', hit._source.numeroProcesso);
                        // Search for oab in the whole source
                        const sourceStr = JSON.stringify(hit._source);
                        if (sourceStr.includes(cleanOab)) {
                            console.log('OAB found in source!');
                            // Try to find the specific field
                            const paths = findPath(hit._source, cleanOab);
                            console.log('OAB Paths:', paths);
                        }
                    });
                }
            } else {
                console.log(`Error: ${await response.text()}`);
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

function findPath(obj, value, path = '') {
    let paths = [];
    for (let key in obj) {
        let currentPath = path ? `${path}.${key}` : key;
        if (typeof obj[key] === 'object') {
            paths = paths.concat(findPath(obj[key], value, currentPath));
        } else if (String(obj[key]).includes(value)) {
            paths.push(currentPath);
        }
    }
    return paths;
}

runTest();
