import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "❌ Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
    )
  }

  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    throw new Error("❌ NEXT_PUBLIC_SUPABASE_URL deve começar com http:// ou https://")
  }

  if (supabaseUrl.includes('your-supabase') || supabaseUrl.includes('example')) {
    throw new Error("❌ Substitua 'your-supabase-project-url' pela URL real do Supabase")
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
