
const https = require('https');

const options = {
    hostname: 'esaj.tjba.jus.br',
    port: 443,
    path: '/cpopg/open.do',
    method: 'GET',
    rejectUnauthorized: false, // For testing
    minVersion: 'TLSv1'
};

const req = https.request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('TLS Version:', res.socket.getProtocol());
    res.on('data', (d) => {
        // Process data
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.end();
