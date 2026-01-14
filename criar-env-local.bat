@echo off
echo Criando arquivo .env.local...
copy env.example .env.local
echo.
echo Arquivo .env.local criado com sucesso!
echo.
echo IMPORTANTE: Edite o arquivo .env.local e configure:
echo - STRIPE_WEBHOOK_SECRET (obtenha em: WEBHOOK_STRIPE_PASSO_A_PASSO.md)
echo - SUPABASE_SERVICE_ROLE_KEY (obtenha no Supabase Dashboard)
echo - STRIPE_PRICE_* IDs (opcional, obtenha no Stripe Dashboard)
echo.
pause












