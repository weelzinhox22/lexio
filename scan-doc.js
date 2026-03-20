
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const processNum = '80573465120208050001';

async function scanDocument() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';
    const query = { query: { match: { "numeroProcesso": processNum } } };
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
            const source = data.hits.hits[0]._source;
            const sourceStr = JSON.stringify(source, null, 2);
            console.log('Document found. Length:', sourceStr.length);

            // Look for any 5-digit or more number that might be an OAB
            // 30802 is one from earlier.
            if (sourceStr.includes('30802')) console.log('OAB 30802 found!');
            if (sourceStr.includes('899')) console.log('OAB 899 found!');

            // Look for common keywords
            if (sourceStr.includes('OAB')) console.log('Keyword OAB found!');
            if (sourceStr.includes('Advogado')) console.log('Keyword Advogado found!');

            // Check movements
            if (source.movimentos) {
                console.log('Checking movements...');
                const movementsStr = JSON.stringify(source.movimentos);
                if (movementsStr.includes('30802')) console.log('OAB found in movements!');
            }
        }
    } catch (e) { }
}

scanDocument();
