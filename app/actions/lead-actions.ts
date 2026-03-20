"use server"

import { z } from "zod"
import sanitizeHtml from "sanitize-html"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// 1. Zod Schema: Limites rigorosos de caracteres e sanitização Anti-XSS
const leadSchema = z.object({
  user_id: z.string().uuid("Formato de ID inválido"),
  name: z.string()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome excede o limite de caracteres")
    .transform(val => sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} })),
  email: z.string()
    .email("Email inválido")
    .max(100, "Email excede limite")
    .optional()
    .or(z.literal('')),
  phone: z.string()
    .max(20, "Telefone excede limite")
    .transform(val => sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }))
    .optional()
    .or(z.literal('')),
  source: z.string().max(50).transform(val => sanitizeHtml(val, { allowedTags: [] })),
  status: z.string().max(50).transform(val => sanitizeHtml(val, { allowedTags: [] })),
  interest: z.string()
    .max(100, "Interesse deve ter no máximo 100 caracteres")
    .transform(val => sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }))
    .optional()
    .or(z.literal('')),
  notes: z.string()
    .max(2000, "Observação excede limite de 2000 caracteres")
    .transform(val => sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }))
    .optional()
    .or(z.literal('')),
  score: z.number().min(0).max(100).default(0),
})

export async function createLeadAction(formData: FormData, userId: string) {
  try {
    // 2. Extração segura dos dados
    const rawData = {
      user_id: userId,
      name: formData.get("name") as string,
      email: formData.get("email") as string || "",
      phone: formData.get("phone") as string || "",
      source: formData.get("source") as string || "other",
      status: formData.get("status") as string || "new",
      interest: formData.get("interest") as string || "",
      notes: formData.get("notes") as string || "",
      score: Number(formData.get("score")) || 0,
    }

    // 3. Validação estrita
    const validatedData = leadSchema.safeParse(rawData)

    if (!validatedData.success) {
      console.error("[Ciberseguranca Zod Block]:", validatedData.error.flatten())
      return { 
        success: false, 
        error: "Dados inválidos ou detectada injeção maliciosa. Tente novamente." 
      }
    }

    // 4. Conexão autenticada Server-Side
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore se for em chamadas read-only
            }
          },
        },
      }
    )
    
    // Verificação dupla: O user_id bate com a sessão real no Supabase Auth?
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
        return { success: false, error: "Acesso não autorizado - Sessão divergente" }
    }

    // 5. Inserção final higienizada
    const { error } = await supabase.from("leads").insert(validatedData.data)

    if (error) {
        console.error("[Supabase Insert Error]:", error)
        throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error("Erro interno no Lead Action:", error)
    return { success: false, error: "Ocorreu um erro interno. Tente mais tarde." }
  }
}
