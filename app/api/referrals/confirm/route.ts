import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Confirma referral quando usuário cria primeiro prazo
 * Atribui benefício ao referrer
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar referral pendente
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', user.id)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      return NextResponse.json({ message: 'No pending referral' }, { status: 200 })
    }

    // Confirmar referral
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        status: 'confirmed',
        reward_given_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Aplicar benefício ao referrer (7 dias Pro)
    // Aqui você pode integrar com sistema de assinaturas
    // Por enquanto, apenas marca como confirmado

    return NextResponse.json({ message: 'Referral confirmed' })
  } catch (error) {
    console.error('Erro ao confirmar referral:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

