"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { NPSModal } from "./nps-modal"

type UserEligibility = {
  eligible: boolean
  daysSinceSignup: number
  hasDeadline: boolean
  alreadyResponded: boolean
}

export function NPSChecker({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const checkEligibility = async () => {
      if (!userId || checked) return

      const supabase = createClient()

      try {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from("profiles")
          .select("created_at")
          .eq("id", userId)
          .single()

        if (!profile) return

        // Calcular dias desde signup
        const signupDate = new Date(profile.created_at)
        const now = new Date()
        const daysSinceSignup = Math.floor((now.getTime() - signupDate.getTime()) / (1000 * 60 * 60 * 24))

        // Verificar se tem pelo menos 1 prazo
        const { data: deadlines } = await supabase
          .from("deadlines")
          .select("id")
          .eq("user_id", userId)
          .limit(1)

        const hasDeadline = (deadlines?.length || 0) > 0

        // Verificar se já respondeu NPS
        const { data: existingNPS } = await supabase
          .from("nps_responses")
          .select("id")
          .eq("user_id", userId)
          .limit(1)

        const alreadyResponded = (existingNPS?.length || 0) > 0

        // Verificar elegibilidade
        const eligible = daysSinceSignup >= 7 && hasDeadline && !alreadyResponded

        // Verificar se já foi mostrado hoje (localStorage)
        const lastShown = localStorage.getItem(`nps-modal-shown-${userId}`)
        const today = new Date().toDateString()
        const wasShownToday = lastShown === today

        if (eligible && !wasShownToday) {
          // Aguardar 3 segundos antes de mostrar (para não ser intrusivo)
          setTimeout(() => {
            setShowModal(true)
            localStorage.setItem(`nps-modal-shown-${userId}`, today)
          }, 3000)
        }

        setChecked(true)
      } catch (error) {
        console.error("Erro ao verificar elegibilidade NPS:", error)
        setChecked(true)
      }
    }

    checkEligibility()
  }, [userId, checked])

  if (!showModal) return null

  return <NPSModal open={showModal} onOpenChange={setShowModal} userId={userId} />
}



