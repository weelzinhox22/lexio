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

    // Buscar status de onboarding do usuário
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('onboarding_completed_steps')
      .eq('user_id', user.id)
      .single()

    const completedSteps = userProfile?.onboarding_completed_steps || []
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
