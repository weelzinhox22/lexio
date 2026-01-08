# Script para criar/atualizar .env.local com todas as variáveis configuradas

$envContent = @"
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://jjljpplzszeypsjxdsxy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbGpwcGx6c3pleXBzanhkc3h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3ODIyOTIsImV4cCI6MjA4MzM1ODI5Mn0.VuY1YVwLyqeyY4kKFc5UZbqbmDk5V1CXgSRWpSiyGiI

# Service Role Key (usado apenas em API Routes e cron jobs)
# ⚠️ NUNCA exponha esta chave no frontend
# Obtenha em: https://supabase.com/dashboard/project/_/settings/api
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# WhatsApp API (opcional - para notificações)
WHATSAPP_API_URL=
WHATSAPP_API_KEY=

# Cron Secret (para proteger as rotas de cron)
# Gere uma string aleatória: openssl rand -hex 32
CRON_SECRET=

# URL do App (para links em notificações)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Stripe Configuration (para pagamentos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51Sn1YlDQOSg8zpboeCh1H9LOF7j1jOUPRZ3DvDafhVJZdnuFtel8UYPTz2LhdhgK4GZtMA8wjXcB0ILMVf5I0GGT00pJJsyIwD
STRIPE_SECRET_KEY=sk_live_... # ⚠️ OBRIGATÓRIA - Obtenha em https://dashboard.stripe.com/apikeys
STRIPE_WEBHOOK_SECRET=whsec_... # ⚠️ OBRIGATÓRIA - Veja WEBHOOK_STRIPE_PASSO_A_PASSO.md para obter

# Stripe Price IDs (opcional - IDs dos produtos criados no Stripe)
# Obtenha em: https://dashboard.stripe.com/products
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_...
NEXT_PUBLIC_STRIPE_PRICE_ENTERPRISE=price_...
"@

Set-Content -Path ".env.local" -Value $envContent -Encoding UTF8

Write-Host "✅ Arquivo .env.local criado/atualizado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Ainda precisa configurar:" -ForegroundColor Yellow
Write-Host "  - STRIPE_WEBHOOK_SECRET (obtenha em: WEBHOOK_STRIPE_PASSO_A_PASSO.md)" -ForegroundColor Yellow
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY (obtenha no Supabase Dashboard)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para editar o arquivo:" -ForegroundColor Cyan
Write-Host "  notepad .env.local" -ForegroundColor Cyan

