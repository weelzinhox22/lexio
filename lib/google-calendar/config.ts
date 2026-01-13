/**
 * Google Calendar API Configuration
 * 
 * Para configurar:
 * 1. Acesse: https://console.cloud.google.com/
 * 2. Crie um novo projeto ou selecione um existente
 * 3. Ative a API do Google Calendar
 * 4. Crie credenciais OAuth 2.0
 * 5. Adicione as URLs de redirecionamento autorizadas
 * 6. Copie o Client ID e Client Secret para o .env
 */

export const GOOGLE_CALENDAR_CONFIG = {
  // Escopos necessários para ler e escrever no Google Calendar
  scopes: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
  
  // URL de redirecionamento após autenticação
  redirectUri: process.env.NEXT_PUBLIC_APP_URL 
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/google-calendar/callback`
    : 'http://localhost:3000/api/google-calendar/callback',
}

export const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
export const GOOGLE_CALENDAR_API = 'https://www.googleapis.com/calendar/v3'











