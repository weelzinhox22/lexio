
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const oab = '84379';

async function testFormats() {
    const formats = [
        `"${oab}"`,
        `"BA${oab}"`,
        `"BA ${oab}"`,
        `"BA/${oab}"`,
        `"${oab}/BA"`,
        `"${oab}BA"`
    ];

    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjba/_search';

    for (const f of formats) {
        const query = {
            query: {
                query_string: {
                    query: f,
                    fields: ["*"]
                }
            },
            size: 1
        };
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `APIKey ${apiKey}` },
                body: JSON.stringify(query)
            });
            const data = await response.json();
            console.log(`Format ${f} -> Hits: ${data.hits?.total?.value || 0}`);
        } catch (e) { }
    }
}

testFormats();
