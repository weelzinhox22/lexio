import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
        }

        // Buscar assinatura ativa
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()

        if (!subscription) {
            return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 })
        }

        // Se tiver ID do stripe associado e Stripe for válido, cancelamos lá
        if (subscription.stripe_subscription_id && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-12-15.clover' })
            await stripe.subscriptions.update(subscription.stripe_subscription_id, {
                cancel_at_period_end: true
            })
        }

        // Atualiza localmente para caso não tenha stripe cadastrado (modo dev manual)
        const { error: updateError } = await supabase
            .from('subscriptions')
            .update({ cancel_at_period_end: true })
            .eq('id', subscription.id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Cancel Subscription Error]', error)
        return NextResponse.json(
            { error: error?.message || 'Erro ao cancelar a assinatura' },
            { status: 500 }
        )
    }
}
