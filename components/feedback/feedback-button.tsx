"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Bug } from "lucide-react"
import { useState } from "react"
import { SuggestionDialog } from "./suggestion-dialog"

type FeedbackButtonProps = {
  userId: string
  variant?: 'default' | 'bug' | 'outline'
  label?: string
  className?: string
}

export function FeedbackButton({ userId, variant = 'default', label, className }: FeedbackButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant={variant === 'outline' ? 'outline' : 'default'}
        size="sm"
        onClick={() => setOpen(true)}
        className={className}
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        {label || 'Sugestão / Feedback'}
      </Button>
      <SuggestionDialog
        userId={userId}
        open={open}
        onOpenChange={setOpen}
        category={variant === 'bug' ? 'bug' : 'feedback_header'}
        title={variant === 'bug' ? 'Reportar Problema' : 'Sugerir Melhoria'}
        description={variant === 'bug'
          ? 'Descreva o problema que você encontrou para que possamos corrigir.'
          : 'Sua opinião ajuda a evoluir o Themixa. O que podemos melhorar?'}
      />
    </>
  )
}



