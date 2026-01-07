import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, priceId } = await request.json()

    // Verificar se o usuário já tem subscription ativa
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Criar sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email || undefined,
      payment_method_types: ['card', 'boleto'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/subscription?canceled=true`,
      metadata: {
        user_id: user.id,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('[Stripe Checkout Error]:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao criar checkout' },
      { status: 500 }
    )
  }
}

