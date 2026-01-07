import { updateSession } from "@/lib/supabase/proxy"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error("[Middleware Error]:", error)
    
    // Se for erro de configuração, retorna erro 500 com mensagem
    if (error instanceof Error) {
      // Em produção, não expor detalhes do erro
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { error: "Configuration error. Please check environment variables." },
          { status: 500 }
        )
      }
      
      // Em desenvolvimento, mostrar erro detalhado
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}


