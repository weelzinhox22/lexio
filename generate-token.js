# Crie um arquivo generate-token.js
echo "const { google } = require('google-auth-library');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost'
);

// Gere a URL de autorização
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/calendar.events']
});

console.log('Authorize this app by visiting this url:', authUrl);
console.log('Enter the code from that page here:');
" > generate-token.js