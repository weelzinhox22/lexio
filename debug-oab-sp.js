
const apiKey = 'cDzFyJWE9nGPRnWE949n95989R939n929r98';
const oab = '233333'; // Common SP OABs have more digits or 6 digits
const uf = 'SP';

const endpoints = [
    'https://api-publica.datajud.cnj.jus.br/api_publica_tjsp/_search',
    'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search'
];

async function runTest() {
    for (const endpoint of endpoints) {
        console.log(`\n--- Testing Endpoint: ${endpoint} ---`);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `APIKey ${apiKey}`
                },
                body: JSON.stringify({
                    query: { match_all: {} },
                    size: 1
                })
            });

            console.log(`Status: ${response.status}`);
            const data = await response.json();
            console.log(`Hits: ${data.hits?.total?.value || 0}`);
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

runTest();
