import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem perfil completo (indicador de novo usuário)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, oab_number, phone')
      .eq('id', user.id)
      .single()

    // Verificar se tem processos, prazos ou clientes
    const [{ count: processCount }, { count: deadlineCount }] = await Promise.all([
      supabase.from('processes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('deadlines').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ])

    // Determinar quais passos já foram concluídos com base nos dados reais
    const completedSteps: number[] = []

    // Passo 1: Perfil preenchido (tem nome e OAB ou telefone)
    if (profile?.full_name && (profile?.oab_number || profile?.phone)) {
      completedSteps.push(1)
    }

    // Passo 2: Tem pelo menos 1 processo
    if ((processCount || 0) > 0) {
      completedSteps.push(2)
    }

    // Passo 3: Tem pelo menos 1 prazo
    if ((deadlineCount || 0) > 0) {
      completedSteps.push(3)
    }

    const isNewUser = completedSteps.length === 0

    return NextResponse.json({
      userId: user.id,
      completedSteps,
      isNewUser,
    })
  } catch (error) {
    console.error('Error in onboarding status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
