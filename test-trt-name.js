
const apiKey = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const name = 'JUNIALISSON NEPOMUCENO COSTA';

async function searchTRT() {
    const endpoint = 'https://api-publica.datajud.cnj.jus.br/api_publica_trt5/_search';
    const query = {
        query: {
            query_string: {
                query: `"${name}"`,
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
        console.log(`TRT5 Hits for Name: ${data.hits?.total?.value || 0}`);
        if (data.hits?.hits?.length > 0) {
            console.log('Sample TRT5 document found!');
            console.log(JSON.stringify(data.hits.hits[0]._source, null, 2).substring(0, 1500));
        }
    } catch (e) { }
}

searchTRT();
