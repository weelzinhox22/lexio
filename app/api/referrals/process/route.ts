import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/referrals/process
 * 
 * Chamado no momento do sign-up quando há ?ref=CODE na URL.
 * Registra a indicação como 'pending'.
 * 
 * Usa service role porque o usuário acabou de se cadastrar e pode
 * não ter sessão autenticada ainda (RLS bloquearia o INSERT).
 */
export async function POST(request: Request) {
  try {
    const { referralCode, userId } = await request.json()

    if (!referralCode || !userId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Input validation — prevent injection and enumeration
    if (typeof referralCode !== 'string' || referralCode.length > 50) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (typeof userId !== 'string' || !uuidRegex.test(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      console.error('[Referral Process] Missing Supabase env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // Buscar referrer pelo código
    const { data: referrer } = await supabase
      .from('profiles')
      .select('id')
      .eq('referral_code', referralCode)
      .single()

    if (!referrer) {
      console.log(`[Referral Process] Código inválido: ${referralCode}`)
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 })
    }

    // Não permitir auto-indicação
    if (referrer.id === userId) {
      console.log(`[Referral Process] Auto-indicação bloqueada: ${userId}`)
      return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
    }

    // Verificar se já foi referido
    const { data: existing } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userId)
      .maybeSingle()

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
      console.error('[Referral Process] Erro ao criar referral:', referralError)
      return NextResponse.json({ error: referralError.message }, { status: 500 })
    }

    // Atualizar perfil do usuário indicado
    await supabase
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', userId)

    console.log(`✅ [Referral Process] Referral registrado: ${referrer.id} indicou ${userId} (código: ${referralCode})`)

    return NextResponse.json({ message: 'Referral processed successfully' })
  } catch (error) {
    console.error('[Referral Process] Erro:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
