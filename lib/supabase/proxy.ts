import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = process.env.NODE_ENV === "production"
      ? "Supabase environment variables not configured"
      : "❌ Variáveis de ambiente do Supabase não configuradas!\n\n" +
        "1. Abra o arquivo .env.local na raiz do projeto\n" +
        "2. Adicione suas credenciais do Supabase:\n" +
        "   NEXT_PUBLIC_SUPABASE_URL=https://hvpbouaonwolixgedjaf.supabase.co\n" +
        "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2cGJvdWFvbndvbGl4Z2VkamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1OTkzNDIsImV4cCI6MjA3OTE3NTM0Mn0.RlMMMVdj4CJH916sUu4d_gCgVZ3sEeriZ627ybanEsw\n\n" +
        "Obtenha em: https://supabase.com/dashboard/project/_/settings/api\n" +
        "Depois reinicie o servidor: npm run dev"
    throw new Error(errorMessage)
  }

  // Validar formato da URL
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    const errorMessage = process.env.NODE_ENV === "production"
      ? "Invalid Supabase URL format"
      : "❌ NEXT_PUBLIC_SUPABASE_URL inválido!\n\n" +
        "A URL deve começar com http:// ou https://\n" +
        "Exemplo: https://seu-projeto.supabase.co\n\n" +
        "Verifique o arquivo .env.local e reinicie o servidor."
    throw new Error(errorMessage)
  }

  // Validar se não está com valor de exemplo
  if (supabaseUrl.includes('your-supabase') || supabaseUrl.includes('example')) {
    const errorMessage = process.env.NODE_ENV === "production"
      ? "Supabase URL contains example placeholder"
      : "❌ NEXT_PUBLIC_SUPABASE_URL ainda está com valor de exemplo!\n\n" +
        "Substitua 'your-supabase-project-url' pela URL real do seu projeto Supabase.\n" +
        "Obtenha em: https://supabase.com/dashboard/project/_/settings/api"
    throw new Error(errorMessage)
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  // Do not run code between createServerClient and supabase.auth.getUser()
  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (error) {
    // Se houver erro ao buscar usuário, continua sem autenticação
    // Isso evita que erros de conexão quebrem o middleware
    console.error("[Supabase Auth Error]:", error)
    user = null
  }

  // Verificação de subscription ativa
  // Descomente após executar scripts/001_create_schema.sql e scripts/003_create_subscriptions.sql
  if (user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const exemptPaths = ["/dashboard/settings", "/dashboard/subscription", "/dashboard/subscription/edit"]
    const isExemptPath = exemptPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    if (!isExemptPath) {
      try {
        const { data: subscription, error } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", user.id)
          .single()

        // Se não houver subscription, permite acesso (pode ser novo usuário)
        if (error && error.code !== 'PGRST116') {
          console.log("[Middleware] Subscription check error:", error.message)
        }

        if (!error && subscription) {
          const isExpired =
            subscription.status === "expired" ||
            (subscription.current_period_end && new Date(subscription.current_period_end) < new Date())

          if (isExpired) {
            const url = request.nextUrl.clone()
            url.pathname = "/dashboard/subscription"
            return NextResponse.redirect(url)
          }
        }
      } catch (error) {
        // Se a tabela não existir ainda, apenas loga e continua
        // Isso permite que o sistema funcione mesmo sem subscriptions configuradas
        if (process.env.NODE_ENV === "development") {
          console.log("[Middleware] Subscription check skipped - table may not exist yet")
        }
      }
    }
  }

  // Protected routes: dashboard and all sub-routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (
    (request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/sign-up")) &&
    user
  ) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
