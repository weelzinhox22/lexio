import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { referralCode, userId } = await request.json()

    if (!referralCode || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const supabase = await createClient()

    // Buscar referrer pelo código
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Verificar se já foi referido
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already referred' }, { status: 200 })
    }

    // Criar registro de referral
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrer.id,
        referred_id: userId,
        referral_code: referralCode,
        status: 'pending',
        reward_type: 'days_pro',
        reward_value: 7,
      })

    if (referralError) {
      console.error('Erro ao criar referral:', referralError)
      return NextResponse.json({ error: referralError.message }, { status: 500 })
    }

    // Atualizar perfil do usuário
    await supabase
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', userId)

    return NextResponse.json({ message: 'Referral processed successfully' })
  } catch (error) {
    console.error('Erro ao processar referral:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

