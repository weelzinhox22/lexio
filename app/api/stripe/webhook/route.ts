import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export const runtime = 'nodejs'

/**
 * POST /api/stripe/webhook
 *
 * Processa eventos do Stripe Checkout e Subscriptions.
 * 
 * Eventos tratados:
 * - checkout.session.completed → cria/atualiza subscription (UPSERT)
 * - customer.subscription.updated → sincroniza status e período
 * - customer.subscription.deleted → marca como expired
 * - invoice.payment_failed → marca como expired
 *
 * IMPORTANTE: Usa UPSERT para evitar perda de pagamentos quando
 * o usuário não tem registro prévio na tabela subscriptions.
 */
export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error('[Stripe Webhook] Missing env vars:', {
      hasStripeKey: !!stripeSecretKey,
      hasWebhookSecret: !!webhookSecret,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    })
    return NextResponse.json(
      { error: 'Stripe ou Supabase não estão configurados.' },
      { status: 500 }
    )
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.acacia',
  })

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  console.log(`📨 [Stripe Webhook] Evento recebido: ${event.type} (${event.id})`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id || 'pro'

        if (!userId) {
          console.error('[Stripe Webhook] checkout.session.completed sem user_id no metadata')
          break
        }

        const now = new Date()
        const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias

        // UPSERT: cria se não existe, atualiza se existe
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan: planId,
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              current_period_start: now.toISOString(),
              current_period_end: periodEnd.toISOString(),
              cancel_at_period_end: false,
              updated_at: now.toISOString(),
            },
            { onConflict: 'user_id' }
          )

        if (upsertError) {
          console.error('[Stripe Webhook] Erro no UPSERT da subscription:', upsertError)
        } else {
          console.log(`✅ [Stripe Webhook] Subscription ativada para ${userId} (plano: ${planId}, até: ${periodEnd.toISOString()})`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        // Mapear status do Stripe para nosso status
        const statusMap: Record<string, string> = {
          active: 'active',
          trialing: 'trial',
          past_due: 'active', // Manter ativo durante período de grace
          canceled: 'cancelled',
          unpaid: 'expired',
          incomplete: 'trial',
          incomplete_expired: 'expired',
          paused: 'expired',
        }
        const mappedStatus = statusMap[subscription.status] || 'expired'
        const periodEnd = new Date(subscription.current_period_end * 1000)

        if (userId) {
          // Tentar por user_id primeiro
          const { error } = await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: userId,
                status: mappedStatus,
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end || false,
                stripe_subscription_id: subscription.id,
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'user_id' }
            )

          if (error) {
            console.error('[Stripe Webhook] Erro ao atualizar subscription:', error)
          } else {
            console.log(`✅ [Stripe Webhook] Subscription atualizada: ${userId} → ${mappedStatus} (até ${periodEnd.toISOString()})`)
          }
        } else {
          // Fallback: buscar por stripe_subscription_id
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: mappedStatus,
              current_period_end: periodEnd.toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end || false,
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('[Stripe Webhook] Erro ao atualizar por stripe_subscription_id:', error)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'expired',
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('[Stripe Webhook] Erro ao expirar subscription:', error)
        } else {
          console.log(`✅ [Stripe Webhook] Subscription expirada: ${subscription.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'expired',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('[Stripe Webhook] Erro ao marcar falha de pagamento:', error)
          } else {
            console.log(`⚠️ [Stripe Webhook] Pagamento falhou para subscription: ${subscriptionId}`)
          }
        }
        break
      }

      default:
        console.log(`ℹ️ [Stripe Webhook] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Stripe Webhook] Processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
