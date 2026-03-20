// Rota legada — redireciona para /api/stripe/webhook
// Mantenha esta rota caso o Stripe Dashboard esteja apontando para /api/webhooks/stripe
export { POST } from '../../stripe/webhook/route'
