import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const REWARD_DAYS = 7

/**
 * Confirma referral quando usuário indicado cria primeiro prazo.
 * Atribui benefício REAL ao referrer: +7 dias de Pro na assinatura.
 *
 * Fluxo:
 * 1. Verifica se o usuário logado (referred) tem um referral pendente
 * 2. Marca o referral como 'confirmed'
 * 3. Estende a subscription do referrer em +7 dias
 *    - Se já tem assinatura: soma 7 dias no current_period_end
 *    - Se não tem: cria uma assinatura trial com 7 dias
 * 4. Marca o referral como 'rewarded' com os detalhes
 */
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar referral pendente do usuário indicado
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      return NextResponse.json({ message: 'No pending referral' }, { status: 200 })
    }

    // Usar service role para poder alterar a subscription do REFERRER (outro usuário)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('[Referral Confirm] Missing Supabase env vars')
      // Ainda marca como confirmed mesmo sem poder dar o reward
      await supabase
        .from('referrals')
        .update({ status: 'confirmed', reward_given_at: new Date().toISOString() })
        .eq('id', referral.id)
      return NextResponse.json({ message: 'Referral confirmed (reward pending - missing env vars)' })
    }

    const adminSupabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Buscar subscription atual do referrer
    const { data: subscription } = await adminSupabase
      .from('subscriptions')
      .select('id, plan, status, current_period_end')
      .eq('user_id', referral.referrer_id)
      .maybeSingle()

    const now = new Date()
    let newPeriodEnd: Date

    if (subscription) {
      // Referrer já tem assinatura — estender current_period_end
      const currentEnd = new Date(subscription.current_period_end)
      // Se já expirou, contar a partir de agora; senão, somar ao período atual
      const baseDate = currentEnd > now ? currentEnd : now
      newPeriodEnd = new Date(baseDate.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000)

      const { error: updateSubError } = await adminSupabase
        .from('subscriptions')
        .update({
          current_period_end: newPeriodEnd.toISOString(),
          // Se estava expirado, reativar como trial
          status: subscription.status === 'expired' ? 'trial' : subscription.status,
          // Se estava no plano free, subir para basic
          plan: subscription.plan === 'free' ? 'basic' : subscription.plan,
          updated_at: now.toISOString(),
        })
        .eq('id', subscription.id)

      if (updateSubError) {
        console.error('[Referral Confirm] Erro ao atualizar subscription:', updateSubError)
        // Ainda marca como confirmed
        await adminSupabase
          .from('referrals')
          .update({ status: 'confirmed', reward_given_at: now.toISOString() })
          .eq('id', referral.id)
        return NextResponse.json({
          message: 'Referral confirmed but reward failed',
          error: updateSubError.message,
        }, { status: 500 })
      }

      console.log(`✅ [Referral] Subscription estendida para ${referral.referrer_id}: ${subscription.current_period_end} → ${newPeriodEnd.toISOString()} (+${REWARD_DAYS} dias)`)
    } else {
      // Referrer NÃO tem assinatura — criar uma nova com 7 dias trial
      newPeriodEnd = new Date(now.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000)

      const { error: insertSubError } = await adminSupabase
        .from('subscriptions')
        .insert({
          user_id: referral.referrer_id,
          plan: 'basic',
          status: 'trial',
          trial_ends_at: newPeriodEnd.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: newPeriodEnd.toISOString(),
          cancel_at_period_end: false,
        })

      if (insertSubError) {
        console.error('[Referral Confirm] Erro ao criar subscription:', insertSubError)
        await adminSupabase
          .from('referrals')
          .update({ status: 'confirmed', reward_given_at: now.toISOString() })
          .eq('id', referral.id)
        return NextResponse.json({
          message: 'Referral confirmed but reward failed',
          error: insertSubError.message,
        }, { status: 500 })
      }

      console.log(`✅ [Referral] Nova subscription criada para ${referral.referrer_id}: ${REWARD_DAYS} dias trial (até ${newPeriodEnd.toISOString()})`)
    }

    // Marcar referral como rewarded
    const { error: updateError } = await adminSupabase
      .from('referrals')
      .update({
        status: 'confirmed',
        reward_given_at: now.toISOString(),
        reward_type: 'days_pro',
        reward_value: REWARD_DAYS,
      })
      .eq('id', referral.id)

    if (updateError) {
      console.error('[Referral Confirm] Erro ao atualizar referral:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(`🎉 [Referral] Referral ${referral.id} confirmado! Referrer ${referral.referrer_id} ganhou +${REWARD_DAYS} dias Pro`)

    return NextResponse.json({
      message: 'Referral confirmed and reward applied',
      reward: {
        type: 'days_pro',
        value: REWARD_DAYS,
        new_period_end: newPeriodEnd.toISOString(),
      },
    })
  } catch (error) {
    console.error('Erro ao confirmar referral:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
