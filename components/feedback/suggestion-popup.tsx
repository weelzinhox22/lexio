"use client"

import { useEffect, useState } from "react"
import { SuggestionDialog } from "./suggestion-dialog"

export function SuggestionPopup({ userId }: { userId: string }) {
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Só mostrar se o usuário não viu hoje e se passou um tempo de navegação
    const lastShown = localStorage.getItem(`suggestion-popup-shown-${userId}`)
    const today = new Date().toDateString()
    
    if (lastShown !== today) {
      const timer = setTimeout(() => {
        setShowModal(true)
        localStorage.setItem(`suggestion-popup-shown-${userId}`, today)
      }, 10000) // 10 segundos para não ser chato logo de cara

      return () => clearTimeout(timer)
    }
  }, [userId])

  return (
    <SuggestionDialog 
      userId={userId} 
      category="platform_popup"
      open={showModal} 
      onOpenChange={setShowModal}
      title="🚀 O que podemos construir para você?"
      description="Queremos transformar o Themixa na sua melhor ferramenta. Tem alguma ideia de funcionalidade ou tese que te economizaria tempo?"
    />
  )
}
