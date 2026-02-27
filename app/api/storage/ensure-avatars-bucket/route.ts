import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  const exists = (buckets || []).some((bucket) => bucket.name === 'avatars')
  if (!exists) {
    const { error: createError } = await supabase.storage.createBucket('avatars', { public: true })
    if (createError && createError.message !== 'Bucket already exists') {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}
